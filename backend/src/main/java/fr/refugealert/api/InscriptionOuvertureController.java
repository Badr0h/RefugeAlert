package fr.refugealert.api;

import fr.refugealert.service.InscriptionOuvertureService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ouverture")
public class InscriptionOuvertureController {

    private final InscriptionOuvertureService inscriptionOuvertureService;

    public InscriptionOuvertureController(InscriptionOuvertureService inscriptionOuvertureService) {
        this.inscriptionOuvertureService = inscriptionOuvertureService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public InscriptionOuvertureResponse create(@Valid @RequestBody CreateInscriptionOuvertureRequest request) {
        return inscriptionOuvertureService.inscrire(request.email());
    }
}
