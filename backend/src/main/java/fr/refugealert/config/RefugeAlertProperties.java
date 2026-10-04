package fr.refugealert.config;

import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "refugealert")
public record RefugeAlertProperties(
        Sync sync, Pnr pnr, Mail mail, Cors cors, String frontendUrl, Saison saison, Paddle paddle) {

    public record Sync(long delayMs, long initialDelayMs) {}

    public record Pnr(String baseUrl, String userAgent, Duration timeout) {}

    public record Mail(String from, String resendApiKey) {}

    public record Cors(List<String> allowedOrigins) {}

    public record Saison(LocalDate fin) {}

    public record Paddle(String apiKey, String webhookSecret, String priceId, String apiBaseUrl) {}
}
