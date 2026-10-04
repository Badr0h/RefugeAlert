package fr.refugealert.billing;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fr.refugealert.config.RefugeAlertProperties;
import fr.refugealert.domain.Client;
import fr.refugealert.repo.ClientRepository;
import java.time.LocalDate;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PremiumService {

    private static final Logger log = LoggerFactory.getLogger(PremiumService.class);

    private final ClientRepository clientRepository;
    private final RefugeAlertProperties properties;
    private final ObjectMapper objectMapper;

    public PremiumService(
            ClientRepository clientRepository, RefugeAlertProperties properties, ObjectMapper objectMapper) {
        this.clientRepository = clientRepository;
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void applyWebhook(String rawBody) {
        JsonNode root;
        try {
            root = objectMapper.readTree(rawBody);
        } catch (Exception ex) {
            log.warn("Webhook Paddle illisible");
            return;
        }
        if (!"transaction.completed".equals(root.path("event_type").asText())) {
            return;
        }
        String email = root.path("data").path("custom_data").path("email").asText("").trim();
        if (email.isBlank() || !email.contains("@")) {
            log.warn("Paiement terminé sans email exploitable");
            return;
        }
        grantThroughSeasonEnd(email.toLowerCase(Locale.ROOT));
    }

    private void grantThroughSeasonEnd(String email) {
        LocalDate seasonEnd = properties.saison().fin();
        Client client = clientRepository.findByEmail(email).orElseGet(() -> new Client(email));
        LocalDate current = client.getPremiumJusquAu();
        if (current != null && !current.isBefore(seasonEnd)) {
            return;
        }
        client.setPremiumJusquAu(seasonEnd);
        clientRepository.save(client);
    }
}
