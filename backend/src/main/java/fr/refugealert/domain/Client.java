package fr.refugealert.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;

@Entity
@Table(name = "clients")
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 320)
    private String email;

    @Column(name = "premium_jusqu_au")
    private LocalDate premiumJusquAu;

    protected Client() {}

    public Client(String email) {
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public LocalDate getPremiumJusquAu() {
        return premiumJusquAu;
    }

    public void setPremiumJusquAu(LocalDate premiumJusquAu) {
        this.premiumJusquAu = premiumJusquAu;
    }
}
