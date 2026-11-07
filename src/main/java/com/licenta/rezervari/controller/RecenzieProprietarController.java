package com.licenta.rezervari.controller;

import com.licenta.rezervari.dto.RecenzieProprietarDTO;
import com.licenta.rezervari.service.RecenzieProprietarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recenzii-proprietari")
@RequiredArgsConstructor
public class RecenzieProprietarController {

    private final RecenzieProprietarService service;

    @GetMapping("/{proprietarId}")
    public ResponseEntity<List<RecenzieProprietarDTO>> getByProprietar(@PathVariable Long proprietarId) {
        return ResponseEntity.ok(service.getByProprietar(proprietarId));
    }

    @GetMapping("/recenzati-de-mine")
    public ResponseEntity<List<Long>> getRecenzatiDeMine(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(service.getProprietariRecenzatiDeMine(userDetails.getUsername()));
    }

    @GetMapping("/poate-recenza/{proprietarId}")
    public ResponseEntity<Boolean> poateRecenza(
            @PathVariable Long proprietarId,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(service.poateRecenza(proprietarId, email));
    }

    @PostMapping
    public ResponseEntity<RecenzieProprietarDTO> create(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long proprietarId = Long.valueOf(body.get("proprietarId").toString());
        int rating = Integer.parseInt(body.get("rating").toString());
        String comentariu = body.containsKey("comentariu") ? (String) body.get("comentariu") : null;
        return ResponseEntity.ok(service.create(proprietarId, rating, comentariu, userDetails.getUsername()));
    }
}
