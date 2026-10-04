package fr.refugealert.api;

import fr.refugealert.domain.TypeHebergement;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreateAbonnementRequest(
        @NotBlank(message = "L'email est requis.") @Email(message = "L'email n'est pas valide.") String email,
        @NotNull(message = "Choisissez un refuge.") Long refugeId,
        @NotNull(message = "Choisissez un type de place.") TypeHebergement typeHebergement,
        @NotNull(message = "La date de début est requise.") LocalDate dateDebut,
        @NotNull(message = "La date de fin est requise.") LocalDate dateFin) {}
