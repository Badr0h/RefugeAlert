package fr.refugealert.repo;

import fr.refugealert.domain.Refuge;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefugeRepository extends JpaRepository<Refuge, Long> {

    List<Refuge> findAllByOrderByIdAsc();
}
