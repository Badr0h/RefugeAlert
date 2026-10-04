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
        name = "notifications_envoyees",
        uniqueConstraints =
                @UniqueConstraint(
                        name = "notifications_abonnement_dispo_uk",
                        columnNames = {"abonnement_id", "disponibilite_id"}))
public class NotificationEnvoyee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "abonnement_id", nullable = false)
    private Abonnement abonnement;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "disponibilite_id", nullable = false)
    private Disponibilite disponibilite;

    @Column(name = "envoye_le", nullable = false)
    private Instant envoyeLe;

    public Long getId() {
        return id;
    }

    public void setAbonnement(Abonnement abonnement) {
        this.abonnement = abonnement;
    }

    public void setDisponibilite(Disponibilite disponibilite) {
        this.disponibilite = disponibilite;
    }

    public void setEnvoyeLe(Instant envoyeLe) {
        this.envoyeLe = envoyeLe;
    }
}
