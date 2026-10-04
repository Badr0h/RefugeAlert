package fr.refugealert.api;

import fr.refugealert.billing.PaddleBillingClient;
import fr.refugealert.billing.PaddleCheckout;
import fr.refugealert.billing.PaddleSignature;
import fr.refugealert.billing.PremiumService;
import fr.refugealert.config.RefugeAlertProperties;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CheckoutController {

    private final PaddleBillingClient paddleBillingClient;
    private final PremiumService premiumService;
    private final RefugeAlertProperties properties;

    public CheckoutController(
            PaddleBillingClient paddleBillingClient,
            PremiumService premiumService,
            RefugeAlertProperties properties) {
        this.paddleBillingClient = paddleBillingClient;
        this.premiumService = premiumService;
        this.properties = properties;
    }

    @PostMapping("/api/checkout")
    public CheckoutResponse checkout(@Valid @RequestBody CheckoutRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        PaddleCheckout checkout = paddleBillingClient.createCheckout(email);
        return new CheckoutResponse(checkout.url(), checkout.transactionId());
    }

    @PostMapping("/api/paddle/webhook")
    public ResponseEntity<Void> webhook(HttpServletRequest request) throws java.io.IOException {
        String rawBody = new String(request.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        String signature = request.getHeader("Paddle-Signature");
        if (!PaddleSignature.isValid(properties.paddle().webhookSecret(), signature, rawBody)) {
            return ResponseEntity.status(401).build();
        }
        premiumService.applyWebhook(rawBody);
        return ResponseEntity.ok().build();
    }
}
