package fr.refugealert.domain;

public enum TypeHebergement {
    BIVOUAC("Bivouac"),
    BAT_FLANC("Bât-flanc"),
    TENTE("Tente");

    private final String label;

    TypeHebergement(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }
}
