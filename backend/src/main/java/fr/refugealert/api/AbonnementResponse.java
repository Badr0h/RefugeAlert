package fr.refugealert.api;

import fr.refugealert.domain.TypeHebergement;
import java.time.LocalDate;

public record AbonnementResponse(
        Long id,
        String email,
        Long refugeId,
        String refugeNom,
        TypeHebergement typeHebergement,
        LocalDate dateDebut,
        LocalDate dateFin) {}
