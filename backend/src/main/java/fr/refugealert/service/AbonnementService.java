package fr.refugealert.service;

import fr.refugealert.api.AbonnementResponse;
import fr.refugealert.api.ApiException;
import fr.refugealert.api.CreateAbonnementRequest;
import fr.refugealert.config.RefugeAlertProperties;
import fr.refugealert.domain.Abonnement;
import fr.refugealert.domain.Refuge;
import fr.refugealert.repo.AbonnementRepository;
import fr.refugealert.repo.AlerteDiffereeRepository;
import fr.refugealert.repo.NotificationEnvoyeeRepository;
import fr.refugealert.repo.RefugeRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AbonnementService {

    private static final Logger log = LoggerFactory.getLogger(AbonnementService.class);

    static final String UNSUBSCRIBED = "Vous ne recevrez plus d'alertes pour ce refuge";
    static final String INVALID_LINK = "Ce lien n'est plus valide";

    private static final ZoneId PARIS = ZoneId.of("Europe/Paris");
    private static final DateTimeFormatter JOUR =
            DateTimeFormatter.ofPattern("d MMMM yyyy", Locale.FRENCH);

    private final RefugeRepository refugeRepository;
    private final AbonnementRepository abonnementRepository;
    private final NotificationEnvoyeeRepository notificationRepository;
    private final AlerteDiffereeRepository alerteDiffereeRepository;
    private final RefugeAlertProperties properties;
    private final EmailSender emailSender;
    private final InscriptionOuvertureService inscriptionOuvertureService;

    public AbonnementService(
            RefugeRepository refugeRepository,
            AbonnementRepository abonnementRepository,
            NotificationEnvoyeeRepository notificationRepository,
            AlerteDiffereeRepository alerteDiffereeRepository,
            RefugeAlertProperties properties,
            EmailSender emailSender,
            InscriptionOuvertureService inscriptionOuvertureService) {
        this.refugeRepository = refugeRepository;
        this.abonnementRepository = abonnementRepository;
        this.notificationRepository = notificationRepository;
        this.alerteDiffereeRepository = alerteDiffereeRepository;
        this.properties = properties;
        this.emailSender = emailSender;
        this.inscriptionOuvertureService = inscriptionOuvertureService;
    }

    @Transactional
    public AbonnementResponse create(CreateAbonnementRequest request) {
        if (request.dateFin().isBefore(request.dateDebut())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "La date de fin est avant la date de début.");
        }
        String horsSaison = erreurDeSaison(
                request.dateDebut(), request.dateFin(), LocalDate.now(PARIS), properties.saison().fin());
        if (horsSaison != null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, horsSaison);
        }
        Refuge refuge = refugeRepository
                .findById(request.refugeId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Refuge introuvable."));
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        return abonnementRepository
                .findByEmailAndRefugeIdAndTypeHebergementAndDateDebutAndDateFin(
                        email,
                        refuge.getId(),
                        request.typeHebergement(),
                        request.dateDebut(),
                        request.dateFin())
                .map(AbonnementService::toResponse)
                .orElseGet(() -> {
                    Abonnement abonnement = new Abonnement();
                    abonnement.setEmail(email);
                    abonnement.setRefuge(refuge);
                    abonnement.setTypeHebergement(request.typeHebergement());
                    abonnement.setDateDebut(request.dateDebut());
                    abonnement.setDateFin(request.dateFin());
                    abonnement.setCreeLe(Instant.now());
                    abonnement.setToken(UUID.randomUUID());
                    Abonnement saved = abonnementRepository.save(abonnement);
                    sendConfirmation(saved);
                    return toResponse(saved);
                });
    }

    /**
     * Confirme l'alerte et donne tout de suite le lien de désinscription. Un échec d'envoi
     * ne doit pas annuler l'alerte : on le note et on continue.
     */
    private void sendConfirmation(Abonnement abonnement) {
        try {
            emailSender.send(
                    abonnement.getEmail(),
                    "Alerte enregistrée — " + abonnement.getRefuge().getNom(),
                    confirmationBody(abonnement, properties.frontendUrl()));
        } catch (RuntimeException ex) {
            log.error("Email de confirmation non envoyé pour l'abonnement {}", abonnement.getId(), ex);
        }
    }

    static String confirmationBody(Abonnement abonnement, String frontendUrl) {
        String frontend = frontendUrl.replaceAll("/+$", "");
        return """
                Votre alerte AlerteGR20 est enregistrée.

                Refuge : %s
                Type : %s
                Du %s au %s

                Si une place passe de complet à libre sur le site du parc, vous recevez un récapitulatif à 7 h, heure de Paris.
                Avec l'alerte immédiate (9,90 € pour la saison), l'email part dès l'ouverture : %s/#alerter

                AlerteGR20 ne réserve pas à votre place. La réservation se fait sur https://pnr-resa.corsica

                Pour annuler cette alerte : %s/desabonner?token=%s
                """
                .formatted(
                        abonnement.getRefuge().getNom(),
                        abonnement.getTypeHebergement().label(),
                        JOUR.format(abonnement.getDateDebut()),
                        JOUR.format(abonnement.getDateFin()),
                        frontend,
                        frontend,
                        abonnement.getToken());
    }

    /**
     * Le message à renvoyer si les dates sortent de la saison suivie, sinon null. Sans cette
     * garde, on peut payer 9,90 € pour des dates qui ne seront jamais lues sur pnr-resa.corsica.
     */
    static String erreurDeSaison(
            LocalDate debut, LocalDate fin, LocalDate aujourdhui, LocalDate finSaison) {
        if (fin.isBefore(aujourdhui)) {
            return "Ces dates sont déjà passées.";
        }
        if (debut.isAfter(finSaison) || fin.isAfter(finSaison)) {
            return "La saison suivie s'arrête le " + finSaison.format(JOUR) + ". Choisissez des dates avant.";
        }
        return null;
    }

    @Transactional
    public String unsubscribe(String rawToken) {
        UUID token = parseToken(rawToken);
        if (token == null) {
            return INVALID_LINK;
        }
        return abonnementRepository
                .findByToken(token)
                .map(abonnement -> {
                    notificationRepository.deleteByAbonnementId(abonnement.getId());
                    alerteDiffereeRepository.deleteByAbonnementId(abonnement.getId());
                    abonnementRepository.delete(abonnement);
                    return UNSUBSCRIBED;
                })
                // Le même lien /desabonner sert à la liste d'ouverture : un seul chemin à connaître.
                .or(() -> inscriptionOuvertureService.desinscrire(token))
                .orElse(INVALID_LINK);
    }

    private static UUID parseToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(rawToken.trim());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    static AbonnementResponse toResponse(Abonnement abonnement) {
        return new AbonnementResponse(
                abonnement.getId(),
                abonnement.getEmail(),
                abonnement.getRefuge().getId(),
                abonnement.getRefuge().getNom(),
                abonnement.getTypeHebergement(),
                abonnement.getDateDebut(),
                abonnement.getDateFin());
    }
}
