package fr.refugealert.service;

import fr.refugealert.config.RefugeAlertProperties;
import fr.refugealert.domain.Abonnement;
import fr.refugealert.domain.AlerteDifferee;
import fr.refugealert.domain.Disponibilite;
import fr.refugealert.domain.NotificationEnvoyee;
import fr.refugealert.repo.AbonnementRepository;
import fr.refugealert.repo.AlerteDiffereeRepository;
import fr.refugealert.repo.DisponibiliteRepository;
import fr.refugealert.repo.NotificationEnvoyeeRepository;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationWriter {

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("d MMMM yyyy", Locale.FRENCH);
    private static final String STOCK_URL = "https://pnr-resa.corsica/stock.php";

    private final DisponibiliteRepository disponibiliteRepository;
    private final AbonnementRepository abonnementRepository;
    private final NotificationEnvoyeeRepository notificationRepository;
    private final AlerteDiffereeRepository alerteDiffereeRepository;
    private final EmailSender emailSender;
    private final RefugeAlertProperties properties;

    public NotificationWriter(
            DisponibiliteRepository disponibiliteRepository,
            AbonnementRepository abonnementRepository,
            NotificationEnvoyeeRepository notificationRepository,
            AlerteDiffereeRepository alerteDiffereeRepository,
            EmailSender emailSender,
            RefugeAlertProperties properties) {
        this.disponibiliteRepository = disponibiliteRepository;
        this.abonnementRepository = abonnementRepository;
        this.notificationRepository = notificationRepository;
        this.alerteDiffereeRepository = alerteDiffereeRepository;
        this.emailSender = emailSender;
        this.properties = properties;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendIfNew(Long abonnementId, Long disponibiliteId) {
        if (notificationRepository.existsByAbonnementIdAndDisponibiliteId(abonnementId, disponibiliteId)) {
            return;
        }
        Abonnement abonnement = abonnementRepository
                .findById(abonnementId)
                .orElseThrow(() -> new IllegalStateException("Abonnement introuvable : " + abonnementId));
        Disponibilite disponibilite = disponibiliteRepository
                .findById(disponibiliteId)
                .orElseThrow(() -> new IllegalStateException("Disponibilité introuvable : " + disponibiliteId));
        emailSender.send(abonnement.getEmail(), subject(disponibilite), body(abonnement, disponibilite));
        NotificationEnvoyee sent = new NotificationEnvoyee();
        sent.setAbonnement(abonnement);
        sent.setDisponibilite(disponibilite);
        sent.setEnvoyeLe(Instant.now());
        notificationRepository.save(sent);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void deferIfNew(Long abonnementId, Long disponibiliteId) {
        if (notificationRepository.existsByAbonnementIdAndDisponibiliteId(abonnementId, disponibiliteId)) {
            return;
        }
        if (alerteDiffereeRepository.existsByAbonnementIdAndDisponibiliteId(abonnementId, disponibiliteId)) {
            return;
        }
        Abonnement abonnement = abonnementRepository
                .findById(abonnementId)
                .orElseThrow(() -> new IllegalStateException("Abonnement introuvable : " + abonnementId));
        Disponibilite disponibilite = disponibiliteRepository
                .findById(disponibiliteId)
                .orElseThrow(() -> new IllegalStateException("Disponibilité introuvable : " + disponibiliteId));
        alerteDiffereeRepository.save(new AlerteDifferee(abonnement, disponibilite, Instant.now()));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendDigest(List<Long> alerteIds) {
        List<AlerteDifferee> alertes = new ArrayList<>(alerteDiffereeRepository.findFetchedByIdIn(alerteIds));
        alertes.removeIf(alerte -> alerte.getEnvoyeeLe() != null);
        if (alertes.isEmpty()) {
            return;
        }
        alertes.sort(Comparator.comparing((AlerteDifferee alerte) -> alerte.getDisponibilite().getDate())
                .thenComparing(alerte -> alerte.getDisponibilite().getRefuge().getNom()));
        String email = alertes.getFirst().getAbonnement().getEmail();
        emailSender.send(email, "Places libres — récapitulatif", digestBody(alertes));
        Instant now = Instant.now();
        for (AlerteDifferee alerte : alertes) {
            if (!notificationRepository.existsByAbonnementIdAndDisponibiliteId(
                    alerte.getAbonnement().getId(), alerte.getDisponibilite().getId())) {
                NotificationEnvoyee sent = new NotificationEnvoyee();
                sent.setAbonnement(alerte.getAbonnement());
                sent.setDisponibilite(alerte.getDisponibilite());
                sent.setEnvoyeLe(now);
                notificationRepository.save(sent);
            }
            alerte.setEnvoyeeLe(now);
        }
    }

    private static String subject(Disponibilite disponibilite) {
        return "Place libre — "
                + disponibilite.getRefuge().getNom()
                + " — "
                + DATE_FORMAT.format(disponibilite.getDate());
    }

    private String body(Abonnement abonnement, Disponibilite disponibilite) {
        String frontend = properties.frontendUrl().replaceAll("/+$", "");
        String unsubscribeUrl = frontend + "/desabonner?token=" + abonnement.getToken();
        return """
                Une place s'est libérée.

                Refuge : %s
                Type : %s
                Date : %s

                Réservez sur %s

                Vous recevez ce message parce que vous avez demandé une alerte AlerteGR20 pour ce créneau.
                Pour ne plus recevoir d'alertes pour ce refuge : %s
                """
                .formatted(
                        disponibilite.getRefuge().getNom(),
                        disponibilite.getTypeHebergement().label(),
                        DATE_FORMAT.format(disponibilite.getDate()),
                        STOCK_URL,
                        unsubscribeUrl);
    }

    private String digestBody(List<AlerteDifferee> alertes) {
        String frontend = properties.frontendUrl().replaceAll("/+$", "");
        StringBuilder lines = new StringBuilder();
        Set<String> unsubscribeUrls = new LinkedHashSet<>();
        for (AlerteDifferee alerte : alertes) {
            Disponibilite disponibilite = alerte.getDisponibilite();
            lines.append("- ")
                    .append(disponibilite.getRefuge().getNom())
                    .append(" — ")
                    .append(disponibilite.getTypeHebergement().label())
                    .append(" — ")
                    .append(DATE_FORMAT.format(disponibilite.getDate()))
                    .append('\n');
            unsubscribeUrls.add(frontend + "/desabonner?token=" + alerte.getAbonnement().getToken());
        }
        return """
                Des places se sont libérées depuis hier.

                %s
                Réservez sur %s

                Vous recevez ce récapitulatif quotidien parce que l'alerte immédiate n'est pas active pour cette adresse.
                Pour ne plus recevoir d'alertes :
                %s
                """
                .formatted(lines.toString().stripTrailing(), STOCK_URL, String.join("\n", unsubscribeUrls));
    }
}
