package fr.refugealert.api;

import fr.refugealert.domain.StatutDisponibilite;
import fr.refugealert.domain.TypeHebergement;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record PlacesResponse(
        LocalDate du, LocalDate au, Instant derniereLecture, List<RefugePlaces> refuges) {

    public record RefugePlaces(Long id, String nom, String slug, List<Cell> cellules) {}

    public record Cell(LocalDate date, TypeHebergement type, StatutDisponibilite statut) {}
}
