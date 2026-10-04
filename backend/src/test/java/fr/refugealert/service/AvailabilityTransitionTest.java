package fr.refugealert.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fr.refugealert.domain.StatutDisponibilite;
import org.junit.jupiter.api.Test;

class AvailabilityTransitionTest {

    @Test
    void onlyCompletToDisponibleIsAnOpening() {
        assertTrue(AvailabilityTransition.isOpening(StatutDisponibilite.COMPLET, StatutDisponibilite.DISPONIBLE));
        assertFalse(AvailabilityTransition.isOpening(StatutDisponibilite.DISPONIBLE, StatutDisponibilite.DISPONIBLE));
        assertFalse(AvailabilityTransition.isOpening(StatutDisponibilite.DISPONIBLE, StatutDisponibilite.COMPLET));
        assertFalse(AvailabilityTransition.isOpening(StatutDisponibilite.COMPLET, StatutDisponibilite.COMPLET));
    }
}
