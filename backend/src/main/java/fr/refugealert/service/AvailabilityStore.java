package fr.refugealert.service;

import fr.refugealert.domain.Disponibilite;
import fr.refugealert.domain.Refuge;
import fr.refugealert.repo.DisponibiliteRepository;
import fr.refugealert.repo.RefugeRepository;
import fr.refugealert.scraper.StockCell;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AvailabilityStore {

    private final RefugeRepository refugeRepository;
    private final DisponibiliteRepository disponibiliteRepository;

    public AvailabilityStore(
            RefugeRepository refugeRepository, DisponibiliteRepository disponibiliteRepository) {
        this.refugeRepository = refugeRepository;
        this.disponibiliteRepository = disponibiliteRepository;
    }

    @Transactional
    public List<Long> apply(List<StockCell> cells) {
        Map<String, Refuge> refugesByName = refugeRepository.findAll().stream()
                .collect(Collectors.toMap(Refuge::getNom, Function.identity()));
        List<Long> openings = new ArrayList<>();
        for (StockCell cell : cells) {
            Refuge refuge = refugesByName.get(cell.refugeName());
            if (refuge == null) {
                continue;
            }
            Disponibilite row = disponibiliteRepository
                    .findByRefugeIdAndDateAndTypeHebergement(
                            refuge.getId(), cell.date(), cell.type())
                    .orElseGet(Disponibilite::new);
            boolean opening = row.getId() != null
                    && AvailabilityTransition.isOpening(row.getStatut(), cell.niveau().statut());
            if (row.getId() == null) {
                row.setRefuge(refuge);
                row.setDate(cell.date());
                row.setTypeHebergement(cell.type());
            }
            row.setStatut(cell.niveau().statut());
            row.setNiveauBrut(cell.niveau());
            row.setDerniereVerification(Instant.now());
            Disponibilite saved = disponibiliteRepository.save(row);
            if (opening) {
                openings.add(saved.getId());
            }
        }
        return openings;
    }
}
