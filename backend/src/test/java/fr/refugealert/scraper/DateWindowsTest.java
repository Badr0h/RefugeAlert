package fr.refugealert.scraper;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;

class DateWindowsTest {

    private final LocalDate today = LocalDate.of(2026, 9, 26);

    @Test
    void ignoresRangesAlreadyFinished() {
        assertEquals(
                List.of(),
                DateWindows.covering(List.of(new DateRange(LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 3))), today));
    }

    @Test
    void splitsARangeIntoSevenDayChunks() {
        assertEquals(
                List.of(
                        new DateWindow(LocalDate.of(2026, 9, 26), LocalDate.of(2026, 10, 2)),
                        new DateWindow(LocalDate.of(2026, 10, 3), LocalDate.of(2026, 10, 5))),
                DateWindows.covering(
                        List.of(new DateRange(LocalDate.of(2026, 9, 20), LocalDate.of(2026, 10, 5))), today));
    }

    @Test
    void mergesOverlappingSubscriptionsBeforeChunking() {
        assertEquals(
                List.of(new DateWindow(LocalDate.of(2026, 9, 26), LocalDate.of(2026, 9, 30))),
                DateWindows.covering(
                        List.of(
                                new DateRange(LocalDate.of(2026, 9, 26), LocalDate.of(2026, 9, 28)),
                                new DateRange(LocalDate.of(2026, 9, 28), LocalDate.of(2026, 9, 30))),
                        today));
    }

    @Test
    void keepsDistantRangesAsSeparateWindows() {
        assertEquals(
                List.of(
                        new DateWindow(LocalDate.of(2026, 9, 26), LocalDate.of(2026, 9, 27)),
                        new DateWindow(LocalDate.of(2026, 10, 3), LocalDate.of(2026, 10, 4))),
                DateWindows.covering(
                        List.of(
                                new DateRange(LocalDate.of(2026, 9, 26), LocalDate.of(2026, 9, 27)),
                                new DateRange(LocalDate.of(2026, 10, 3), LocalDate.of(2026, 10, 4))),
                        today));
    }
}
