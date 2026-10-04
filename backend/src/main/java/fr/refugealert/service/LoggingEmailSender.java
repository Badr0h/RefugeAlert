package fr.refugealert.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class LoggingEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(LoggingEmailSender.class);

    @Override
    public void send(String to, String subject, String text) {
        log.info("Email non envoyé (RESEND_API_KEY absente) to={} subject={} body={}", to, subject, text);
    }
}
