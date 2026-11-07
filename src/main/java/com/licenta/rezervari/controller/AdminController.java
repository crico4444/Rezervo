package com.licenta.rezervari.controller;

import com.licenta.rezervari.dto.StatisticiDTO;
import com.licenta.rezervari.model.Utilizator;
import com.licenta.rezervari.repository.UtilizatorRepository;
import com.licenta.rezervari.service.ReminderService;
import com.licenta.rezervari.service.StatisticiService;
import com.licenta.rezervari.service.UtilizatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final StatisticiService statisticiService;
    private final ReminderService reminderService;
    private final UtilizatorService utilizatorService;
    private final UtilizatorRepository utilizatorRepository;

    @GetMapping("/statistici")
    public ResponseEntity<StatisticiDTO> getStatistici() {
        return ResponseEntity.ok(statisticiService.getStatistici());
    }

    @PostMapping("/anuleaza-expirate")
    public ResponseEntity<String> anuleazaExpirate() {
        reminderService.anuleazaCheckInuriNeconfirmate();
        return ResponseEntity.ok("Job de anulare executat.");
    }

    @DeleteMapping("/utilizatori/{id}")
    public ResponseEntity<?> stergeUtilizator(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        Utilizator curent = utilizatorRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit"));

        if (curent.getId().equals(id)) {
            return ResponseEntity.badRequest().body(Map.of("eroare", "Nu îți poți șterge propriul cont din acest panou. Folosește pagina de Cont."));
        }

        utilizatorService.stergeCont(id);
        return ResponseEntity.ok(Map.of("mesaj", "Contul a fost șters"));
    }
}
