package fr.refugealert.service;

import fr.refugealert.domain.StatutDisponibilite;

public final class AvailabilityTransition {

    private AvailabilityTransition() {}

    public static boolean isOpening(StatutDisponibilite previous, StatutDisponibilite next) {
        return previous == StatutDisponibilite.COMPLET && next == StatutDisponibilite.DISPONIBLE;
    }
}
