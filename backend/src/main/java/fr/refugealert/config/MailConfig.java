package fr.refugealert.config;

import fr.refugealert.service.EmailSender;
import fr.refugealert.service.LoggingEmailSender;
import fr.refugealert.service.ResendEmailSender;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MailConfig {

    @Bean
    EmailSender emailSender(RefugeAlertProperties properties) {
        String apiKey = properties.mail().resendApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            return new LoggingEmailSender();
        }
        return new ResendEmailSender(apiKey, properties.mail().from());
    }
}
