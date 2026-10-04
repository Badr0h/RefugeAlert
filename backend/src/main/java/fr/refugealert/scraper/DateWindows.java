package fr.refugealert.scraper;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public final class DateWindows {

    public static final int MAX_DAYS = 7;

    private DateWindows() {}

    public static List<DateWindow> covering(List<DateRange> ranges, LocalDate today) {
        List<DateRange> clamped = ranges.stream()
                .map(range -> new DateRange(
                        range.start().isBefore(today) ? today : range.start(), range.end()))
                .filter(range -> !range.end().isBefore(range.start()))
                .sorted(Comparator.comparing(DateRange::start).thenComparing(DateRange::end))
                .toList();

        List<DateWindow> windows = new ArrayList<>();
        for (DateRange range : merge(clamped)) {
            LocalDate cursor = range.start();
            while (!cursor.isAfter(range.end())) {
                LocalDate chunkEnd = cursor.plusDays(MAX_DAYS - 1L);
                if (chunkEnd.isAfter(range.end())) {
                    chunkEnd = range.end();
                }
                windows.add(new DateWindow(cursor, chunkEnd));
                cursor = chunkEnd.plusDays(1);
            }
        }
        return windows;
    }

    private static List<DateRange> merge(List<DateRange> ranges) {
        List<DateRange> merged = new ArrayList<>();
        for (DateRange range : ranges) {
            if (merged.isEmpty()) {
                merged.add(range);
                continue;
            }
            DateRange last = merged.get(merged.size() - 1);
            if (!range.start().isAfter(last.end().plusDays(1))) {
                LocalDate end = range.end().isAfter(last.end()) ? range.end() : last.end();
                merged.set(merged.size() - 1, new DateRange(last.start(), end));
            } else {
                merged.add(range);
            }
        }
        return merged;
    }
}
