package fr.refugealert.repo;

import fr.refugealert.domain.AlerteDifferee;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AlerteDiffereeRepository extends JpaRepository<AlerteDifferee, Long> {

    boolean existsByAbonnementIdAndDisponibiliteId(Long abonnementId, Long disponibiliteId);

    void deleteByAbonnementId(Long abonnementId);

    @Query(
            """
            select alerte from AlerteDifferee alerte
            join fetch alerte.abonnement
            join fetch alerte.disponibilite
            where alerte.envoyeeLe is null
            order by alerte.detecteeLe
            """)
    List<AlerteDifferee> findUnsent();

    @Query(
            """
            select alerte from AlerteDifferee alerte
            join fetch alerte.abonnement
            join fetch alerte.disponibilite disponibilite
            join fetch disponibilite.refuge
            where alerte.id in :ids
            """)
    List<AlerteDifferee> findFetchedByIdIn(Collection<Long> ids);
}
