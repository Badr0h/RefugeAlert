package fr.refugealert.service;

public interface EmailSender {

    void send(String to, String subject, String text);
}
