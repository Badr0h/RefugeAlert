package fr.refugealert.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

/** Une adresse à prévenir le jour où le Parc annonce l'ouverture des réservations. */
@Entity
@Table(name = "inscriptions_ouverture")
public class InscriptionOuverture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 320)
    private String email;

    @Column(nullable = false, unique = true)
    private UUID token;

    @Column(name = "cree_le", nullable = false)
    private Instant creeLe;

    protected InscriptionOuverture() {}

    public InscriptionOuverture(String email, UUID token, Instant creeLe) {
        this.email = email;
        this.token = token;
        this.creeLe = creeLe;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public UUID getToken() {
        return token;
    }

    public Instant getCreeLe() {
        return creeLe;
    }
}
