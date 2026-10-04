package fr.refugealert.scraper;

import fr.refugealert.domain.NiveauBrut;
import fr.refugealert.domain.TypeHebergement;
import java.time.DateTimeException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Component;

@Component
public class StockTableParser {

    public List<StockCell> parse(String html, LocalDate windowStart) {
        Element table = Jsoup.parse(html).selectFirst("#stockTable");
        if (table == null) {
            return List.of();
        }
        Element headerRow = table.selectFirst("thead tr");
        if (headerRow == null) {
            return List.of();
        }

        List<LocalDate> dates = new ArrayList<>();
        List<Element> headers = headerRow.select("th");
        for (int i = 2; i < headers.size(); i++) {
            dates.add(parseHeaderDate(headers.get(i).text(), windowStart));
        }

        List<StockCell> cells = new ArrayList<>();
        String refugeName = null;
        for (Element row : table.select("tbody tr")) {
            Element nameCell = row.selectFirst("td[rowspan]");
            if (nameCell != null) {
                refugeName = nameCell.text().trim();
            }
            if (refugeName == null || refugeName.isBlank()) {
                continue;
            }
            Element icon = row.selectFirst("i");
            if (icon == null) {
                continue;
            }
            TypeHebergement type = typeFromIcon(icon.className());
            if (type == null) {
                continue;
            }
            List<Element> colorCells = row.select("td").stream()
                    .filter(cell -> niveauFromStyle(cell.attr("style")) != null)
                    .toList();
            int count = Math.min(colorCells.size(), dates.size());
            for (int i = 0; i < count; i++) {
                NiveauBrut niveau = niveauFromStyle(colorCells.get(i).attr("style"));
                cells.add(new StockCell(refugeName, type, dates.get(i), niveau));
            }
        }
        return cells;
    }

    static LocalDate parseHeaderDate(String text, LocalDate windowStart) {
        String[] parts = text.trim().split("/");
        if (parts.length != 2) {
            throw new IllegalArgumentException("Date d'en-tête inattendue : " + text);
        }
        try {
            int day = Integer.parseInt(parts[0].trim());
            int month = Integer.parseInt(parts[1].trim());
            LocalDate date = LocalDate.of(windowStart.getYear(), month, day);
            if (date.isBefore(windowStart)) {
                date = date.plusYears(1);
            }
            return date;
        } catch (DateTimeException | NumberFormatException ex) {
            throw new IllegalArgumentException("Date d'en-tête inattendue : " + text, ex);
        }
    }

    private static TypeHebergement typeFromIcon(String className) {
        if (className.contains("fa-bed")) {
            return TypeHebergement.BAT_FLANC;
        }
        if (className.contains("fa-moon")) {
            return TypeHebergement.BIVOUAC;
        }
        if (className.contains("fa-campground")) {
            return TypeHebergement.TENTE;
        }
        return null;
    }

    private static NiveauBrut niveauFromStyle(String style) {
        String normalized = style.toLowerCase(Locale.ROOT).replace(" ", "");
        if (normalized.contains("color:darkred")) {
            return NiveauBrut.DARKRED;
        }
        if (normalized.contains("color:orange")) {
            return NiveauBrut.ORANGE;
        }
        if (normalized.contains("color:green")) {
            return NiveauBrut.GREEN;
        }
        return null;
    }
}
