package fr.refugealert.repo;

import fr.refugealert.domain.NotificationEnvoyee;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationEnvoyeeRepository extends JpaRepository<NotificationEnvoyee, Long> {

    boolean existsByAbonnementIdAndDisponibiliteId(Long abonnementId, Long disponibiliteId);

    void deleteByAbonnementId(Long abonnementId);
}
