package fr.refugealert.repo;

import fr.refugealert.domain.InscriptionOuverture;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InscriptionOuvertureRepository extends JpaRepository<InscriptionOuverture, Long> {

    Optional<InscriptionOuverture> findByEmail(String email);

    Optional<InscriptionOuverture> findByToken(UUID token);
}
