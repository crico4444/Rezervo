package com.licenta.rezervari.controller;

import com.licenta.rezervari.dto.RezervareDTO;
import com.licenta.rezervari.dto.RezervareRequest;
import com.licenta.rezervari.model.StatusRezervare;
import com.licenta.rezervari.service.RezervareService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rezervari")
@RequiredArgsConstructor
public class RezervareController {

    private final RezervareService rezervareService;

    /**
     * POST /api/rezervari
     * Creeaza o rezervare noua pentru utilizatorul autentificat.
     * Datele sunt validate automat prin @Valid.
     */
    @PostMapping
    public ResponseEntity<RezervareDTO> create(
            @Valid @RequestBody RezervareRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(rezervareService.create(request, userDetails.getUsername()));
    }

    /**
     * GET /api/rezervari/mele
     * Returneaza rezervarile clientului autentificat.
     */
    @GetMapping("/mele")
    public ResponseEntity<List<RezervareDTO>> getMele(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(rezervareService.getMele(userDetails.getUsername()));
    }

    /**
     * GET /api/rezervari/pentru-cazarile-mele
     * Returneaza rezervarile primite pe proprietatile detinute de utilizatorul autentificat.
     */
    @GetMapping("/pentru-cazarile-mele")
    public ResponseEntity<List<RezervareDTO>> getPentruCazarileMele(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(rezervareService.getRezervariPentruCazarileMele(userDetails.getUsername()));
    }

    /**
     * GET /api/rezervari
     * Returneaza toate rezervarile din sistem. Accesibil doar de ADMIN.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RezervareDTO>> getAll() {
        return ResponseEntity.ok(rezervareService.getAll());
    }

    /**
     * PUT /api/rezervari/{id}/status?status=FINALIZATA
     * Schimba statusul unei rezervari. Accesibil doar de ADMIN.
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RezervareDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam StatusRezervare status) {
        return ResponseEntity.ok(rezervareService.updateStatus(id, status));
    }

    /**
     * PUT /api/rezervari/{id}/confirma-check-in
     * Clientul confirma ca a ajuns la cazare (check-in efectuat).
     * Statusul trece din CONFIRMATA in IN_DESFASURARE.
     */
    @PutMapping("/{id}/confirma-check-in")
    public ResponseEntity<RezervareDTO> confirmaCheckIn(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(rezervareService.confirmaCheckIn(id, userDetails.getUsername()));
    }

    /**
     * PUT /api/rezervari/{id}/confirma-proprietar
     * Proprietarul confirma o rezervare PENDING pentru una din cazarile sale.
     */
    @PutMapping("/{id}/confirma-proprietar")
    public ResponseEntity<RezervareDTO> confirmaProprietar(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(rezervareService.confirmaProprietar(id, userDetails.getUsername()));
    }

    /**
     * PUT /api/rezervari/{id}/anuleaza-proprietar
     * Proprietarul anuleaza o rezervare activa pentru una din cazarile sale.
     */
    @PutMapping("/{id}/anuleaza-proprietar")
    public ResponseEntity<Void> anuleazaProprietar(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        rezervareService.anuleazaProprietar(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    /**
     * PUT /api/rezervari/{id}/anuleaza
     * Clientul isi anuleaza propria rezervare.
     */
    @PutMapping("/{id}/anuleaza")
    public ResponseEntity<Void> anuleaza(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        rezervareService.anuleaza(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
