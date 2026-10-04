package fr.refugealert.api;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateInscriptionOuvertureRequest(
        @NotBlank(message = "L'email est requis.") @Email(message = "L'email n'est pas valide.") String email) {}
