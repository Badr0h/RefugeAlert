package fr.refugealert.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fr.refugealert.domain.InscriptionOuverture;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class InscriptionOuvertureConfirmationTest {

    private final UUID token = UUID.fromString("5d2c1b0a-3e4f-4a6b-8c7d-9e0f1a2b3c4d");

    private final InscriptionOuverture inscription =
            new InscriptionOuverture("randonneur@exemple.fr", token, Instant.parse("2026-10-06T08:00:00Z"));

    @Test
    void givesTheUnsubscribeLinkRightAway() {
        String body = InscriptionOuvertureService.confirmationBody(inscription, "https://alertegr20.com/");
        assertTrue(body.contains("https://alertegr20.com/desabonner?token=" + token), body);
    }

    @Test
    void citesTheLastOpeningWithoutInventingTheNextOne() {
        String body = InscriptionOuvertureService.confirmationBody(inscription, "https://alertegr20.com");
        assertTrue(body.contains("En 2026, la plateforme a ouvert le 20 janvier."), body);
        assertTrue(body.contains("n'a pas encore publié la date"), body);
        assertFalse(body.contains("janvier 2027"), body);
    }

    @Test
    void saysTheSiteDoesNotBook() {
        String body = InscriptionOuvertureService.confirmationBody(inscription, "https://alertegr20.com");
        assertTrue(body.contains("ne réserve pas"), body);
    }
}
