package fr.refugealert.domain;

public enum NiveauBrut {
    GREEN,
    ORANGE,
    DARKRED;

    public StatutDisponibilite statut() {
        return this == DARKRED ? StatutDisponibilite.COMPLET : StatutDisponibilite.DISPONIBLE;
    }
}
