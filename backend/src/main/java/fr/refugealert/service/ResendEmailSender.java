package fr.refugealert.service;

import java.util.List;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

public class ResendEmailSender implements EmailSender {

    private final RestClient restClient;
    private final String from;

    public ResendEmailSender(String apiKey, String from) {
        this.from = from;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.resend.com")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
    }

    @Override
    public void send(String to, String subject, String text) {
        restClient
                .post()
                .uri("/emails")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("from", from, "to", List.of(to), "subject", subject, "text", text))
                .retrieve()
                .toBodilessEntity();
    }
}
