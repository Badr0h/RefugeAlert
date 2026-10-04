package fr.refugealert.billing;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fr.refugealert.api.ApiException;
import fr.refugealert.config.RefugeAlertProperties;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
public class PaddleBillingClient {

    private static final Logger log = LoggerFactory.getLogger(PaddleBillingClient.class);
    private static final String CHECKOUT_FALLBACK = "https://checkout.paddle.com/checkout?_ptxn=";

    private final RefugeAlertProperties properties;
    private final ObjectMapper objectMapper;
    private final RestClient restClient = RestClient.builder().build();

    public PaddleBillingClient(RefugeAlertProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    public PaddleCheckout createCheckout(String email) {
        RefugeAlertProperties.Paddle paddle = properties.paddle();
        if (paddle.apiKey() == null
                || paddle.apiKey().isBlank()
                || paddle.priceId() == null
                || paddle.priceId().isBlank()) {
            throw new ApiException(
                    HttpStatus.SERVICE_UNAVAILABLE, "Le paiement n'est pas disponible pour le moment.");
        }
        String base = paddle.apiBaseUrl().replaceAll("/+$", "");
        String paymentPage = properties.frontendUrl().replaceAll("/+$", "");
        Map<String, Object> body = new HashMap<>(Map.of(
                "items", List.of(Map.of("price_id", paddle.priceId(), "quantity", 1)),
                "custom_data", Map.of("email", email),
                "collection_mode", "automatic",
                "checkout", Map.of("url", paymentPage)));
        // Avec un client rattaché, Paddle pré-remplit l'email : le randonneur ne le retape pas.
        String customerId = findOrCreateCustomer(base, paddle.apiKey(), email);
        if (customerId != null) {
            body.put("customer_id", customerId);
        }
        try {
            String raw = restClient
                    .post()
                    .uri(base + "/transactions")
                    .header("Authorization", "Bearer " + paddle.apiKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(String.class);
            JsonNode data = objectMapper.readTree(raw == null ? "{}" : raw).path("data");
            String transactionId = data.path("id").asText("");
            String url = data.path("checkout").path("url").asText("");
            if (url.isBlank() && !transactionId.isBlank()) {
                url = CHECKOUT_FALLBACK + transactionId;
            }
            if (!url.isBlank()) {
                return new PaddleCheckout(url, transactionId);
            }
        } catch (ApiException ex) {
            throw ex;
        } catch (RestClientResponseException ex) {
            log.error("Paddle a refusé la session de paiement : {}", ex.getStatusCode());
        } catch (Exception ex) {
            log.error("Paddle injoignable", ex);
        }
        throw new ApiException(HttpStatus.BAD_GATEWAY, "Le paiement n'a pas pu être ouvert. Réessayez.");
    }

    /**
     * Le client Paddle de cet email, créé au besoin. Renvoie null si Paddle refuse : le paiement
     * s'ouvre alors quand même, avec le champ email vide.
     */
    private String findOrCreateCustomer(String base, String apiKey, String email) {
        try {
            String found = restClient
                    .get()
                    .uri(base + "/customers?email={email}", email)
                    .header("Authorization", "Bearer " + apiKey)
                    .retrieve()
                    .body(String.class);
            JsonNode existing = objectMapper.readTree(found == null ? "{}" : found).path("data");
            if (existing.isArray() && !existing.isEmpty()) {
                return existing.get(0).path("id").asText(null);
            }
            String created = restClient
                    .post()
                    .uri(base + "/customers")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("email", email))
                    .retrieve()
                    .body(String.class);
            return objectMapper.readTree(created == null ? "{}" : created).path("data").path("id").asText(null);
        } catch (RestClientResponseException ex) {
            log.warn("Client Paddle non rattaché au paiement : {}", ex.getStatusCode());
        } catch (Exception ex) {
            log.warn("Client Paddle non rattaché au paiement", ex);
        }
        return null;
    }
}
