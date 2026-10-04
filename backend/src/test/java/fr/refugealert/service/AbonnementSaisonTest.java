package fr.refugealert.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class AbonnementSaisonTest {

    private final LocalDate today = LocalDate.of(2026, 9, 26);
    private final LocalDate seasonEnd = LocalDate.of(2026, 10, 4);

    @Test
    void acceptsDatesInsideTheSeason() {
        assertNull(AbonnementService.erreurDeSaison(
                LocalDate.of(2026, 10, 2), LocalDate.of(2026, 10, 4), today, seasonEnd));
    }

    @Test
    void acceptsTheLastDayOfTheSeason() {
        assertNull(AbonnementService.erreurDeSaison(seasonEnd, seasonEnd, today, seasonEnd));
    }

    @Test
    void refusesDatesAfterTheSeason() {
        assertEquals(
                "La saison suivie s'arrête le 4 octobre 2026. Choisissez des dates avant.",
                AbonnementService.erreurDeSaison(
                        LocalDate.of(2027, 7, 1), LocalDate.of(2027, 7, 3), today, seasonEnd));
    }

    @Test
    void refusesAStayThatStartsInsideButEndsAfterTheSeason() {
        assertEquals(
                "La saison suivie s'arrête le 4 octobre 2026. Choisissez des dates avant.",
                AbonnementService.erreurDeSaison(
                        LocalDate.of(2026, 10, 3), LocalDate.of(2026, 10, 9), today, seasonEnd));
    }

    @Test
    void refusesDatesAlreadyPast() {
        assertEquals(
                "Ces dates sont déjà passées.",
                AbonnementService.erreurDeSaison(
                        LocalDate.of(2026, 9, 20), LocalDate.of(2026, 9, 25), today, seasonEnd));
    }

    @Test
    void acceptsAStayStartedYesterdayButStillRunning() {
        assertNull(AbonnementService.erreurDeSaison(
                LocalDate.of(2026, 9, 25), LocalDate.of(2026, 9, 28), today, seasonEnd));
    }
}
