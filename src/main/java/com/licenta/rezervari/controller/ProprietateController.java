package com.licenta.rezervari.controller;

import com.licenta.rezervari.dto.ProprietateDTO;
import com.licenta.rezervari.service.ProprietateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/proprietati")
@RequiredArgsConstructor
public class ProprietateController {

    private final ProprietateService proprietateService;

    /**
     * GET /api/proprietati?oras=&tip=&stele=
     * Returneaza proprietatile active cu filtre optionale de oras, tip si stele.
     * Accesibil public (fara autentificare).
     */
    @GetMapping
    public ResponseEntity<List<ProprietateDTO>> getAll(
            @RequestParam(required = false) String oras,
            @RequestParam(required = false) String tip,
            @RequestParam(required = false) Integer stele,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
            @RequestParam(required = false) Integer persoane) {
        return ResponseEntity.ok(proprietateService.getAll(oras, tip, stele, checkIn, checkOut, persoane));
    }

    /**
     * GET /api/proprietati/{id}
     * Returneaza detaliile unei proprietati dupa ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProprietateDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(proprietateService.getById(id));
    }

    /**
     * GET /api/proprietati/ale-mele
     * Returneaza proprietatile detinute de utilizatorul autentificat.
     */
    @GetMapping("/ale-mele")
    public ResponseEntity<List<ProprietateDTO>> getAleMele(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(proprietateService.getAleProprietarului(userDetails.getUsername()));
    }

    /**
     * GET /api/proprietati/pending
     * Returneaza proprietatile care asteapta aprobarea. Accesibil doar de ADMIN.
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProprietateDTO>> getPending() {
        return ResponseEntity.ok(proprietateService.getPending());
    }

    /**
     * GET /api/proprietati/toate
     * Returneaza toate proprietatile indiferent de status. Accesibil doar de ADMIN.
     */
    @GetMapping("/toate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProprietateDTO>> getToate() {
        return ResponseEntity.ok(proprietateService.getAllPentruAdmin());
    }

    /**
     * POST /api/proprietati
     * Creeaza o proprietate noua pentru utilizatorul autentificat.
     */
    @PostMapping
    public ResponseEntity<ProprietateDTO> create(
            @Valid @RequestBody ProprietateDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(proprietateService.create(dto, userDetails.getUsername()));
    }

    /**
     * PUT /api/proprietati/{id}
     * Actualizeaza datele unei proprietati. Accesibil doar de ADMIN.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProprietateDTO> update(@PathVariable Long id, @Valid @RequestBody ProprietateDTO dto) {
        return ResponseEntity.ok(proprietateService.update(id, dto));
    }

    /**
     * PUT /api/proprietati/{id}/aproba
     * Seteaza statusul proprietatii la ACTIVA. Accesibil doar de ADMIN.
     */
    @PutMapping("/{id}/aproba")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProprietateDTO> aproba(@PathVariable Long id) {
        return ResponseEntity.ok(proprietateService.aprobaProprietate(id));
    }

    /**
     * PUT /api/proprietati/{id}/respinge
     * Seteaza statusul proprietatii la RESPINSA. Accesibil doar de ADMIN.
     */
    @PutMapping("/{id}/respinge")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProprietateDTO> respinge(@PathVariable Long id) {
        return ResponseEntity.ok(proprietateService.respingeProprietate(id));
    }

    /**
     * DELETE /api/proprietati/{id}
     * Sterge o proprietate din baza de date. Accesibil doar de ADMIN.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        proprietateService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PUT /api/proprietati/{id}/ale-mele
     * Editeaza propria proprietate dupa verificarea ca utilizatorul curent este proprietarul.
     */
    @PutMapping("/{id}/ale-mele")
    public ResponseEntity<?> updateAlMeu(
            @PathVariable Long id,
            @RequestBody ProprietateDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            return ResponseEntity.ok(proprietateService.updateAlMeu(id, dto, userDetails.getUsername()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("eroare", e.getMessage()));
        }
    }

    /**
     * DELETE /api/proprietati/{id}/ale-mele
     * Sterge propria proprietate dupa verificarea ca utilizatorul curent este proprietarul.
     */
    @DeleteMapping("/{id}/ale-mele")
    public ResponseEntity<?> stergeAlMeu(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            proprietateService.stergeAlMeu(id, userDetails.getUsername());
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("eroare", e.getMessage()));
        }
    }
}
