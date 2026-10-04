package fr.refugealert.api;

import fr.refugealert.domain.Refuge;
import fr.refugealert.repo.RefugeRepository;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/refuges")
public class RefugeController {

    private final RefugeRepository refugeRepository;

    public RefugeController(RefugeRepository refugeRepository) {
        this.refugeRepository = refugeRepository;
    }

    @GetMapping
    public List<RefugeResponse> list() {
        return refugeRepository.findAllByOrderByIdAsc().stream().map(RefugeController::toResponse).toList();
    }

    private static RefugeResponse toResponse(Refuge refuge) {
        return new RefugeResponse(refuge.getId(), refuge.getNom(), refuge.getSlug(), refuge.getZone());
    }
}
