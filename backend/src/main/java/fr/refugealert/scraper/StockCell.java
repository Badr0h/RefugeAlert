package fr.refugealert.scraper;

import fr.refugealert.domain.NiveauBrut;
import fr.refugealert.domain.TypeHebergement;
import java.time.LocalDate;

public record StockCell(String refugeName, TypeHebergement type, LocalDate date, NiveauBrut niveau) {}
