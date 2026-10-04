package fr.refugealert.billing;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.List;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public final class PaddleSignature {

    private PaddleSignature() {}

    public static boolean isValid(String secret, String header, String rawBody) {
        if (secret == null || secret.isBlank() || header == null || header.isBlank() || rawBody == null) {
            return false;
        }
        String timestamp = null;
        List<String> signatures = new ArrayList<>();
        for (String part : header.split(";")) {
            int split = part.indexOf('=');
            if (split < 0) {
                continue;
            }
            String key = part.substring(0, split).trim();
            String value = part.substring(split + 1).trim();
            if ("ts".equals(key)) {
                timestamp = value;
            } else if ("h1".equals(key) && !value.isBlank()) {
                signatures.add(value.toLowerCase());
            }
        }
        if (timestamp == null || signatures.isEmpty()) {
            return false;
        }
        byte[] expected = hmac(secret, timestamp + ":" + rawBody);
        for (String signature : signatures) {
            if (MessageDigest.isEqual(expected, signature.getBytes(StandardCharsets.UTF_8))) {
                return true;
            }
        }
        return false;
    }

    private static byte[] hmac(String secret, String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return toHex(digest).getBytes(StandardCharsets.UTF_8);
        } catch (Exception ex) {
            return new byte[0];
        }
    }

    private static String toHex(byte[] bytes) {
        StringBuilder hex = new StringBuilder(bytes.length * 2);
        for (byte value : bytes) {
            hex.append(Character.forDigit((value >> 4) & 0xF, 16));
            hex.append(Character.forDigit(value & 0xF, 16));
        }
        return hex.toString();
    }
}
