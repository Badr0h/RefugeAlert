package fr.refugealert.repo;

import fr.refugealert.domain.Abonnement;
import fr.refugealert.domain.TypeHebergement;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AbonnementRepository extends JpaRepository<Abonnement, Long> {

    List<Abonnement> findByDateFinGreaterThanEqual(LocalDate date);

    Optional<Abonnement> findByToken(UUID token);

    Optional<Abonnement> findByEmailAndRefugeIdAndTypeHebergementAndDateDebutAndDateFin(
            String email,
            Long refugeId,
            TypeHebergement typeHebergement,
            LocalDate dateDebut,
            LocalDate dateFin);

    @Query(
            """
            select a from Abonnement a
            where a.refuge.id = :refugeId
              and a.typeHebergement = :type
              and a.dateDebut <= :date
              and a.dateFin >= :date
            """)
    List<Abonnement> findMatching(
            @Param("refugeId") Long refugeId,
            @Param("type") TypeHebergement type,
            @Param("date") LocalDate date);
}
