package fr.refugealert.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

@Entity
@Table(
        name = "alertes_differees",
        uniqueConstraints =
                @UniqueConstraint(columnNames = {"abonnement_id", "disponibilite_id"}))
public class AlerteDifferee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "abonnement_id", nullable = false)
    private Abonnement abonnement;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "disponibilite_id", nullable = false)
    private Disponibilite disponibilite;

    @Column(name = "detectee_le", nullable = false)
    private Instant detecteeLe;

    @Column(name = "envoyee_le")
    private Instant envoyeeLe;

    protected AlerteDifferee() {}

    public AlerteDifferee(Abonnement abonnement, Disponibilite disponibilite, Instant detecteeLe) {
        this.abonnement = abonnement;
        this.disponibilite = disponibilite;
        this.detecteeLe = detecteeLe;
    }

    public Long getId() {
        return id;
    }

    public Abonnement getAbonnement() {
        return abonnement;
    }

    public Disponibilite getDisponibilite() {
        return disponibilite;
    }

    public Instant getDetecteeLe() {
        return detecteeLe;
    }

    public Instant getEnvoyeeLe() {
        return envoyeeLe;
    }

    public void setEnvoyeeLe(Instant envoyeeLe) {
        this.envoyeeLe = envoyeeLe;
    }
}
