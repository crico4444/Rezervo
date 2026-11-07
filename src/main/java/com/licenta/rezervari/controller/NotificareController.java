package com.licenta.rezervari.controller;

import com.licenta.rezervari.dto.NotificareDTO;
import com.licenta.rezervari.service.NotificareService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notificari")
@RequiredArgsConstructor
public class NotificareController {

    private final NotificareService notificareService;

    /** Returneaza toate notificarile utilizatorului autentificat */
    @GetMapping
    public List<NotificareDTO> getAll(Principal principal) {
        return notificareService.getNotificari(principal.getName());
    }

    /** Returneaza numarul de notificari necitite */
    @GetMapping("/necitite-count")
    public Map<String, Long> getNecititeCount(Principal principal) {
        return Map.of("count", notificareService.getNecititeCount(principal.getName()));
    }

    /** Marcheaza o notificare ca citita */
    @PutMapping("/{id}/citita")
    public ResponseEntity<Void> marcheazaCaCitita(@PathVariable Long id, Principal principal) {
        notificareService.marcheazaCaCitita(id, principal.getName());
        return ResponseEntity.ok().build();
    }

    /** Marcheaza toate notificarile ca citite */
    @PutMapping("/toate-citite")
    public ResponseEntity<Void> marcheazaToateCAcitite(Principal principal) {
        notificareService.marcheazaToateCAcitite(principal.getName());
        return ResponseEntity.ok().build();
    }
}
