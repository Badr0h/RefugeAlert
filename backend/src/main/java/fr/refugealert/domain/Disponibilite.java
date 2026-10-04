package fr.refugealert.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(
        name = "disponibilites",
        uniqueConstraints =
                @UniqueConstraint(
                        name = "disponibilites_refuge_date_type_uk",
                        columnNames = {"refuge_id", "date", "type_hebergement"}))
public class Disponibilite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "refuge_id", nullable = false)
    private Refuge refuge;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_hebergement", nullable = false, length = 20)
    private TypeHebergement typeHebergement;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutDisponibilite statut;

    @Enumerated(EnumType.STRING)
    @Column(name = "niveau_brut", nullable = false, length = 20)
    private NiveauBrut niveauBrut;

    @Column(name = "derniere_verification", nullable = false)
    private Instant derniereVerification;

    public Long getId() {
        return id;
    }

    public Refuge getRefuge() {
        return refuge;
    }

    public void setRefuge(Refuge refuge) {
        this.refuge = refuge;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public TypeHebergement getTypeHebergement() {
        return typeHebergement;
    }

    public void setTypeHebergement(TypeHebergement typeHebergement) {
        this.typeHebergement = typeHebergement;
    }

    public StatutDisponibilite getStatut() {
        return statut;
    }

    public void setStatut(StatutDisponibilite statut) {
        this.statut = statut;
    }

    public NiveauBrut getNiveauBrut() {
        return niveauBrut;
    }

    public void setNiveauBrut(NiveauBrut niveauBrut) {
        this.niveauBrut = niveauBrut;
    }

    public Instant getDerniereVerification() {
        return derniereVerification;
    }

    public void setDerniereVerification(Instant derniereVerification) {
        this.derniereVerification = derniereVerification;
    }
}
