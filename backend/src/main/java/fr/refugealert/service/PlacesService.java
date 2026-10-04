package fr.refugealert.service;

import fr.refugealert.api.PlacesResponse;
import fr.refugealert.api.PlacesResponse.Cell;
import fr.refugealert.api.PlacesResponse.RefugePlaces;
import fr.refugealert.config.RefugeAlertProperties;
import fr.refugealert.domain.Disponibilite;
import fr.refugealert.domain.Refuge;
import fr.refugealert.domain.StatutDisponibilite;
import fr.refugealert.domain.TypeHebergement;
import fr.refugealert.repo.DisponibiliteRepository;
import fr.refugealert.repo.RefugeRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlacesService {

    private static final ZoneId ZONE = ZoneId.of("Europe/Paris");

    private final RefugeRepository refugeRepository;
    private final DisponibiliteRepository disponibiliteRepository;
    private final RefugeAlertProperties properties;

    public PlacesService(
            RefugeRepository refugeRepository,
            DisponibiliteRepository disponibiliteRepository,
            RefugeAlertProperties properties) {
        this.refugeRepository = refugeRepository;
        this.disponibiliteRepository = disponibiliteRepository;
        this.properties = properties;
    }

    @Transactional(readOnly = true)
    public PlacesResponse board() {
        LocalDate today = LocalDate.now(ZONE);
        LocalDate end = properties.saison().fin();
        if (today.isAfter(end)) {
            return new PlacesResponse(today, end, null, List.of());
        }
        List<Refuge> refuges = refugeRepository.findAllByOrderByIdAsc();
        List<Disponibilite> rows =
                disponibiliteRepository.findByDateGreaterThanEqualAndDateLessThanEqual(today, end);
        Map<String, StatutDisponibilite> known = rows.stream()
                .collect(Collectors.toMap(
                        row -> key(row.getRefuge().getId(), row.getDate(), row.getTypeHebergement()),
                        Disponibilite::getStatut,
                        (left, right) -> right));
        Instant derniereLecture = rows.stream()
                .map(Disponibilite::getDerniereVerification)
                .max(Comparator.naturalOrder())
                .orElse(null);
        List<LocalDate> dates = datesBetween(today, end);
        List<RefugePlaces> refugePlaces = refuges.stream()
                .map(refuge -> new RefugePlaces(
                        refuge.getId(),
                        refuge.getNom(),
                        refuge.getSlug(),
                        cellsFor(refuge.getId(), dates, known)))
                .toList();
        return new PlacesResponse(today, end, derniereLecture, refugePlaces);
    }

    private static List<Cell> cellsFor(Long refugeId, List<LocalDate> dates, Map<String, StatutDisponibilite> known) {
        List<Cell> cells = new ArrayList<>();
        for (LocalDate date : dates) {
            for (TypeHebergement type : TypeHebergement.values()) {
                cells.add(new Cell(date, type, known.get(key(refugeId, date, type))));
            }
        }
        return cells;
    }

    private static List<LocalDate> datesBetween(LocalDate start, LocalDate end) {
        List<LocalDate> dates = new ArrayList<>();
        LocalDate cursor = start;
        while (!cursor.isAfter(end)) {
            dates.add(cursor);
            cursor = cursor.plusDays(1);
        }
        return dates;
    }

    private static String key(Long refugeId, LocalDate date, TypeHebergement type) {
        return refugeId + "|" + date + "|" + type.name();
    }
}
