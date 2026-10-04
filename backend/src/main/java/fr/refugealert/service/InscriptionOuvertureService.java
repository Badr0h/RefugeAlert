package fr.refugealert.service;

import fr.refugealert.api.InscriptionOuvertureResponse;
import fr.refugealert.config.RefugeAlertProperties;
import fr.refugealert.domain.InscriptionOuverture;
import fr.refugealert.repo.InscriptionOuvertureRepository;
import java.time.Instant;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * La liste « prévenez-moi le jour de l'ouverture ». Ce n'est pas une alerte refuge : on écrit
 * une fois, quand le Parc publie la date. Aucune date n'est promise avant.
 */
@Service
public class InscriptionOuvertureService {

    private static final Logger log = LoggerFactory.getLogger(InscriptionOuvertureService.class);

    static final String UNSUBSCRIBED = "Vous ne recevrez pas l'email d'ouverture des réservations";

    private final InscriptionOuvertureRepository repository;
    private final RefugeAlertProperties properties;
    private final EmailSender emailSender;

    public InscriptionOuvertureService(
            InscriptionOuvertureRepository repository,
            RefugeAlertProperties properties,
            EmailSender emailSender) {
        this.repository = repository;
        this.properties = properties;
        this.emailSender = emailSender;
    }

    /** Une adresse déjà inscrite ne reçoit pas un second email de confirmation. */
    @Transactional
    public InscriptionOuvertureResponse inscrire(String rawEmail) {
        String email = rawEmail.trim().toLowerCase(Locale.ROOT);
        if (repository.findByEmail(email).isEmpty()) {
            InscriptionOuverture saved =
                    repository.save(new InscriptionOuverture(email, UUID.randomUUID(), Instant.now()));
            sendConfirmation(saved);
        }
        return new InscriptionOuvertureResponse(email);
    }

    /** Le message à afficher, ou vide si le jeton n'appartient pas à cette liste. */
    @Transactional
    public Optional<String> desinscrire(UUID token) {
        return repository.findByToken(token).map(inscription -> {
            repository.delete(inscription);
            return UNSUBSCRIBED;
        });
    }

    private void sendConfirmation(InscriptionOuverture inscription) {
        try {
            emailSender.send(
                    inscription.getEmail(),
                    "Inscription enregistrée — ouverture des réservations GR20 2027",
                    confirmationBody(inscription, properties.frontendUrl()));
        } catch (RuntimeException ex) {
            log.error("Email de confirmation non envoyé pour l'inscription ouverture {}", inscription.getId(), ex);
        }
    }

    static String confirmationBody(InscriptionOuverture inscription, String frontendUrl) {
        String frontend = frontendUrl.replaceAll("/+$", "");
        return """
                Vous êtes inscrit sur la liste AlerteGR20 pour l'ouverture des réservations 2027.

                Le Parc naturel régional de Corse n'a pas encore publié la date. En 2026, la plateforme a ouvert le 20 janvier.
                Le jour où le Parc annonce la date 2027, on vous écrit à cette adresse. C'est le seul email prévu d'ici là.

                AlerteGR20 ne réserve pas à votre place. La réservation se fait sur https://pnr-resa.corsica

                Pour vous désinscrire : %s/desabonner?token=%s
                """
                .formatted(frontend, inscription.getToken());
    }
}
