package fr.refugealert.scraper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import fr.refugealert.domain.NiveauBrut;
import fr.refugealert.domain.StatutDisponibilite;
import fr.refugealert.domain.TypeHebergement;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

class StockTableParserTest {

    private final StockTableParser parser = new StockTableParser();
    private final LocalDate windowStart = LocalDate.of(2026, 9, 26);

    @Test
    void parsesRealStockTable() throws IOException {
        String html = new ClassPathResource("fixtures/stock-table.html")
                .getContentAsString(StandardCharsets.UTF_8);

        List<StockCell> cells = parser.parse(html, windowStart);

        assertEquals(13 * 3 * 7, cells.size());

        StockCell ortuBed = cell(cells, "Site d'Ortu di u piobbu", TypeHebergement.BAT_FLANC, LocalDate.of(2026, 9, 26));
        assertEquals(NiveauBrut.DARKRED, ortuBed.niveau());
        assertEquals(StatutDisponibilite.COMPLET, ortuBed.niveau().statut());

        StockCell ortuBivouac =
                cell(cells, "Site d'Ortu di u piobbu", TypeHebergement.BIVOUAC, LocalDate.of(2026, 9, 26));
        assertEquals(NiveauBrut.GREEN, ortuBivouac.niveau());
        assertEquals(StatutDisponibilite.DISPONIBLE, ortuBivouac.niveau().statut());

        assertEquals(
                List.of(
                        NiveauBrut.DARKRED,
                        NiveauBrut.ORANGE,
                        NiveauBrut.GREEN,
                        NiveauBrut.DARKRED,
                        NiveauBrut.DARKRED,
                        NiveauBrut.GREEN,
                        NiveauBrut.ORANGE),
                cells.stream()
                        .filter(cell -> cell.refugeName().equals("Refuge de Petra piana")
                                && cell.type() == TypeHebergement.BAT_FLANC)
                        .map(StockCell::niveau)
                        .toList());

        assertTrue(cells.stream().anyMatch(cell -> cell.refugeName().equals("Refuge d'A sega (hors GR20)")));
        assertEquals(LocalDate.of(2026, 10, 2), cells.get(cells.size() - 1).date());
    }

    @Test
    void missingTableReturnsEmpty() {
        assertTrue(parser.parse("<html><body><p>hors saison</p></body></html>", windowStart).isEmpty());
    }

    @Test
    void headerAfterYearBoundaryUsesNextYear() {
        assertEquals(LocalDate.of(2027, 1, 2), StockTableParser.parseHeaderDate("02/01", LocalDate.of(2026, 12, 28)));
    }

    private static StockCell cell(
            List<StockCell> cells, String refuge, TypeHebergement type, LocalDate date) {
        return cells.stream()
                .filter(cell -> cell.refugeName().equals(refuge) && cell.type() == type && cell.date().equals(date))
                .findFirst()
                .orElseThrow();
    }
}
