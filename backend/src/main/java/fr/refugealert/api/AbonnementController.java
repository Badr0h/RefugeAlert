package fr.refugealert.api;

import fr.refugealert.service.AbonnementService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/abonnements")
public class AbonnementController {

    private final AbonnementService abonnementService;

    public AbonnementController(AbonnementService abonnementService) {
        this.abonnementService = abonnementService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AbonnementResponse create(@Valid @RequestBody CreateAbonnementRequest request) {
        return abonnementService.create(request);
    }

    @GetMapping(value = "/desabonner", produces = MediaType.TEXT_HTML_VALUE)
    public ResponseEntity<String> unsubscribe(@RequestParam(name = "token", required = false) String token) {
        String message = abonnementService.unsubscribe(token);
        String html = """
                <!DOCTYPE html>
                <html lang="fr">
                <head><meta charset="utf-8"><title>AlerteGR20</title></head>
                <body><p id="message">%s</p></body>
                </html>
                """
                .formatted(message);
        return ResponseEntity.ok(html);
    }
}
