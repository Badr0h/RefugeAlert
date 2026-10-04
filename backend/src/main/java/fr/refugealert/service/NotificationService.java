package fr.refugealert.service;

import fr.refugealert.domain.Abonnement;
import fr.refugealert.domain.AlerteDifferee;
import fr.refugealert.domain.Client;
import fr.refugealert.domain.Disponibilite;
import fr.refugealert.repo.AbonnementRepository;
import fr.refugealert.repo.AlerteDiffereeRepository;
import fr.refugealert.repo.ClientRepository;
import fr.refugealert.repo.DisponibiliteRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private static final ZoneId PARIS = ZoneId.of("Europe/Paris");

    private final DisponibiliteRepository disponibiliteRepository;
    private final AbonnementRepository abonnementRepository;
    private final ClientRepository clientRepository;
    private final AlerteDiffereeRepository alerteDiffereeRepository;
    private final NotificationWriter notificationWriter;

    public NotificationService(
            DisponibiliteRepository disponibiliteRepository,
            AbonnementRepository abonnementRepository,
            ClientRepository clientRepository,
            AlerteDiffereeRepository alerteDiffereeRepository,
            NotificationWriter notificationWriter) {
        this.disponibiliteRepository = disponibiliteRepository;
        this.abonnementRepository = abonnementRepository;
        this.clientRepository = clientRepository;
        this.alerteDiffereeRepository = alerteDiffereeRepository;
        this.notificationWriter = notificationWriter;
    }

    @Transactional(readOnly = true)
    public void notifyOpening(Long disponibiliteId) {
        Disponibilite disponibilite = disponibiliteRepository
                .findById(disponibiliteId)
                .orElseThrow(() -> new IllegalStateException("Disponibilité introuvable : " + disponibiliteId));
        List<Abonnement> matches = abonnementRepository.findMatching(
                disponibilite.getRefuge().getId(),
                disponibilite.getTypeHebergement(),
                disponibilite.getDate());
        for (Abonnement abonnement : matches) {
            if (isPremium(abonnement.getEmail())) {
                notificationWriter.sendIfNew(abonnement.getId(), disponibilite.getId());
            } else {
                notificationWriter.deferIfNew(abonnement.getId(), disponibilite.getId());
            }
        }
    }

    @Transactional(readOnly = true)
    public void sendDailyDigests() {
        Map<String, List<Long>> idsByEmail = new LinkedHashMap<>();
        for (AlerteDifferee alerte : alerteDiffereeRepository.findUnsent()) {
            idsByEmail
                    .computeIfAbsent(alerte.getAbonnement().getEmail(), key -> new ArrayList<>())
                    .add(alerte.getId());
        }
        for (Map.Entry<String, List<Long>> entry : idsByEmail.entrySet()) {
            try {
                notificationWriter.sendDigest(entry.getValue());
            } catch (RuntimeException ex) {
                log.warn("Récapitulatif non envoyé pour {}", entry.getKey());
            }
        }
    }

    private boolean isPremium(String email) {
        if (email == null || email.isBlank()) {
            return false;
        }
        return clientRepository
                .findByEmail(email.trim().toLowerCase(Locale.ROOT))
                .map(Client::getPremiumJusquAu)
                .filter(until -> !until.isBefore(LocalDate.now(PARIS)))
                .isPresent();
    }
}
