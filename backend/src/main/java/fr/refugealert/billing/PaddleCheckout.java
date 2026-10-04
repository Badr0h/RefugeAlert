package fr.refugealert.billing;

/** Une session de paiement Paddle : l'URL hébergée et l'identifiant de transaction. */
public record PaddleCheckout(String url, String transactionId) {}
