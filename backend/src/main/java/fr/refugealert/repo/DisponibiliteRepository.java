package fr.refugealert.repo;

import fr.refugealert.domain.Disponibilite;
import fr.refugealert.domain.TypeHebergement;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DisponibiliteRepository extends JpaRepository<Disponibilite, Long> {

    Optional<Disponibilite> findByRefugeIdAndDateAndTypeHebergement(
            Long refugeId, LocalDate date, TypeHebergement typeHebergement);

    List<Disponibilite> findByDateGreaterThanEqualAndDateLessThanEqual(LocalDate start, LocalDate end);
}
