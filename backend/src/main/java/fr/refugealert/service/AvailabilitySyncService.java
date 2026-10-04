package fr.refugealert.service;

import fr.refugealert.config.RefugeAlertProperties;
import fr.refugealert.domain.Abonnement;
import fr.refugealert.repo.AbonnementRepository;
import fr.refugealert.scraper.DateRange;
import fr.refugealert.scraper.DateWindow;
import fr.refugealert.scraper.DateWindows;
import fr.refugealert.scraper.PnrResaClient;
import fr.refugealert.scraper.StockCell;
import fr.refugealert.scraper.StockTableParser;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AvailabilitySyncService {

    private static final Logger log = LoggerFactory.getLogger(AvailabilitySyncService.class);
    private static final ZoneId ZONE = ZoneId.of("Europe/Paris");

    private final AbonnementRepository abonnementRepository;
    private final PnrResaClient pnrResaClient;
    private final StockTableParser parser;
    private final AvailabilityStore availabilityStore;
    private final NotificationService notificationService;
    private final RefugeAlertProperties properties;

    public AvailabilitySyncService(
            AbonnementRepository abonnementRepository,
            PnrResaClient pnrResaClient,
            StockTableParser parser,
            AvailabilityStore availabilityStore,
            NotificationService notificationService,
            RefugeAlertProperties properties) {
        this.abonnementRepository = abonnementRepository;
        this.pnrResaClient = pnrResaClient;
        this.parser = parser;
        this.availabilityStore = availabilityStore;
        this.notificationService = notificationService;
        this.properties = properties;
    }

    public void syncAll() {
        LocalDate today = LocalDate.now(ZONE);
        List<DateRange> subscriptions = abonnementRepository.findByDateFinGreaterThanEqual(today).stream()
                .map(this::toRange)
                .toList();
        List<DateRange> ranges = rangesToWatch(today, properties.saison().fin(), subscriptions);
        List<DateWindow> windows = DateWindows.covering(ranges, today);
        if (windows.isEmpty()) {
            log.info("Aucun créneau à surveiller");
            return;
        }
        for (DateWindow window : windows) {
            syncWindow(window);
        }
    }

    private void syncWindow(DateWindow window) {
        try {
            String html = pnrResaClient.fetchHtml(window.start(), window.end());
            List<StockCell> cells = parser.parse(html, window.start());
            if (cells.isEmpty()) {
                log.info("Tableau de stock absent pour {} → {}", window.start(), window.end());
                return;
            }
            List<Long> openings = availabilityStore.apply(cells);
            for (Long disponibiliteId : openings) {
                try {
                    notificationService.notifyOpening(disponibiliteId);
                } catch (RuntimeException ex) {
                    log.warn(
                            "Notification échouée pour la disponibilité {} : {}",
                            disponibiliteId,
                            ex.getMessage());
                }
            }
            log.info(
                    "Stock synchronisé {} → {} ({} cellules, {} ouvertures)",
                    window.start(),
                    window.end(),
                    cells.size(),
                    openings.size());
        } catch (RuntimeException ex) {
            log.warn(
                    "Sync impossible pour {} → {} : {}",
                    window.start(),
                    window.end(),
                    ex.getMessage());
        }
    }

    private DateRange toRange(Abonnement abonnement) {
        return new DateRange(abonnement.getDateDebut(), abonnement.getDateFin());
    }

    static List<DateRange> rangesToWatch(LocalDate today, LocalDate seasonEnd, List<DateRange> subscriptions) {
        List<DateRange> ranges = new ArrayList<>();
        if (!today.isAfter(seasonEnd)) {
            ranges.add(new DateRange(today, seasonEnd));
        }
        ranges.addAll(subscriptions);
        return ranges;
    }
}
