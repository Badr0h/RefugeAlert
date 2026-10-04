package fr.refugealert.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import fr.refugealert.scraper.DateRange;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;

class AvailabilitySyncServiceTest {

    private final LocalDate today = LocalDate.of(2026, 9, 26);
    private final LocalDate seasonEnd = LocalDate.of(2026, 10, 4);

    @Test
    void watchesTheSeasonEvenWithoutSubscribers() {
        assertEquals(
                List.of(new DateRange(today, seasonEnd)),
                AvailabilitySyncService.rangesToWatch(today, seasonEnd, List.of()));
    }

    @Test
    void keepsSubscriberDatesAfterTheSeason() {
        DateRange later = new DateRange(LocalDate.of(2026, 10, 10), LocalDate.of(2026, 10, 12));
        assertEquals(
                List.of(later),
                AvailabilitySyncService.rangesToWatch(LocalDate.of(2026, 10, 5), seasonEnd, List.of(later)));
    }

    @Test
    void addsThePublicWindowBesideSubscriberDates() {
        DateRange subscription = new DateRange(LocalDate.of(2026, 9, 28), LocalDate.of(2026, 9, 29));
        assertEquals(
                List.of(new DateRange(today, seasonEnd), subscription),
                AvailabilitySyncService.rangesToWatch(today, seasonEnd, List.of(subscription)));
    }
}
