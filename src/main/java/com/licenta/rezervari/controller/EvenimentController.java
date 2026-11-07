package com.licenta.rezervari.controller;

import com.licenta.rezervari.dto.EvenimentDTO;
import com.licenta.rezervari.dto.ProprietateDistantaDTO;
import com.licenta.rezervari.service.EvenimentService;
import com.licenta.rezervari.service.ProprietateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/evenimente")
@RequiredArgsConstructor
public class EvenimentController {

    private final EvenimentService evenimentService;
    private final ProprietateService proprietateService;

    @GetMapping
    public ResponseEntity<List<EvenimentDTO>> getViitoare() {
        return ResponseEntity.ok(evenimentService.getViitoare());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EvenimentDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(evenimentService.getById(id));
    }

    @GetMapping("/{id}/cazari")
    public ResponseEntity<List<ProprietateDistantaDTO>> getCazariEveniment(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
            @RequestParam(required = false) Integer persoane) {
        return ResponseEntity.ok(proprietateService.getLangaEveniment(id, checkIn, checkOut, persoane));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EvenimentDTO> create(@Valid @RequestBody EvenimentDTO dto) {
        return ResponseEntity.ok(evenimentService.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EvenimentDTO> update(@PathVariable Long id, @Valid @RequestBody EvenimentDTO dto) {
        return ResponseEntity.ok(evenimentService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        evenimentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
