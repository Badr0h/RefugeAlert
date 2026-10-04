package fr.refugealert.billing;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Test;

class PaddleSignatureTest {

    @Test
    void acceptsTheSignaturePaddleSends() throws Exception {
        String secret = "endpoint-secret";
        String body = "{\"event_type\":\"transaction.completed\"}";
        String timestamp = "1710000000";
        String signature = hmac(secret, timestamp + ":" + body);
        assertTrue(PaddleSignature.isValid(secret, "ts=" + timestamp + ";h1=" + signature, body));
    }

    @Test
    void rejectsATamperedBody() throws Exception {
        String secret = "endpoint-secret";
        String body = "{\"event_type\":\"transaction.completed\"}";
        String signature = hmac(secret, "1710000000:" + body);
        assertFalse(PaddleSignature.isValid(secret, "ts=1710000000;h1=" + signature, body + " "));
    }

    private static String hmac(String secret, String payload) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] digest = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        StringBuilder hex = new StringBuilder(digest.length * 2);
        for (byte value : digest) {
            hex.append(Character.forDigit((value >> 4) & 0xF, 16));
            hex.append(Character.forDigit(value & 0xF, 16));
        }
        return hex.toString();
    }
}
