package fr.refugealert.service;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import fr.refugealert.domain.Abonnement;
import fr.refugealert.domain.Refuge;
import fr.refugealert.domain.TypeHebergement;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class AbonnementConfirmationTest {

    private final UUID token = UUID.fromString("0b6f5a3e-8a57-4c1e-9d0f-2f1c7c1f9a11");

    private Abonnement abonnement() {
        Refuge refuge = mock(Refuge.class);
        when(refuge.getNom()).thenReturn("Refuge de Manganu");
        Abonnement abonnement = new Abonnement();
        abonnement.setRefuge(refuge);
        abonnement.setTypeHebergement(TypeHebergement.TENTE);
        abonnement.setDateDebut(LocalDate.of(2026, 9, 29));
        abonnement.setDateFin(LocalDate.of(2026, 10, 1));
        abonnement.setToken(token);
        return abonnement;
    }

    @Test
    void givesTheUnsubscribeLinkRightAway() {
        String body = AbonnementService.confirmationBody(abonnement(), "https://alertegr20.com/");
        assertTrue(body.contains("https://alertegr20.com/desabonner?token=" + token), body);
    }

    @Test
    void recallsTheRefugeTheTypeAndTheDates() {
        String body = AbonnementService.confirmationBody(abonnement(), "https://alertegr20.com");
        assertTrue(body.contains("Refuge : Refuge de Manganu"), body);
        assertTrue(body.contains("Type : Tente"), body);
        assertTrue(body.contains("Du 29 septembre 2026 au 1 octobre 2026"), body);
    }
}
