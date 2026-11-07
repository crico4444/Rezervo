package com.licenta.rezervari.controller;

import com.licenta.rezervari.dto.RecenzieDTO;
import com.licenta.rezervari.dto.RecenzieRequest;
import com.licenta.rezervari.service.RecenzieService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recenzii")
@RequiredArgsConstructor
public class RecenzieController {

    private final RecenzieService recenzieService;

    @GetMapping
    public ResponseEntity<List<RecenzieDTO>> getByProprietate(@RequestParam Long proprietateId) {
        return ResponseEntity.ok(recenzieService.getByProprietate(proprietateId));
    }

    @GetMapping("/poate-recenza/{proprietateId}")
    public ResponseEntity<Boolean> poateRecenza(
            @PathVariable Long proprietateId,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(recenzieService.poateRecenza(proprietateId, email));
    }

    @GetMapping("/recenzate-de-mine")
    public ResponseEntity<List<Long>> getRecenzateDeMine(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(recenzieService.getRecenzateDeMine(userDetails.getUsername()));
    }

    @GetMapping("/de-recenzat")
    public ResponseEntity<List<java.util.Map<String, Object>>> getDeRecenzat(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(recenzieService.getDeRecenzat(userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<RecenzieDTO> create(
            @Valid @RequestBody RecenzieRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(recenzieService.create(request, userDetails.getUsername()));
    }
}
