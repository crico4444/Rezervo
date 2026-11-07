package com.licenta.rezervari.controller;

import com.licenta.rezervari.service.ImagineProprietateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/imagini")
@RequiredArgsConstructor
public class ImagineProprietateController {

    private final ImagineProprietateService imagineService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getByProprietate(@RequestParam Long proprietateId) {
        return ResponseEntity.ok(imagineService.getByProprietate(proprietateId));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> adauga(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long proprietateId = Long.valueOf(body.get("proprietateId").toString());
        String urlImagine = body.get("urlImagine").toString();
        return ResponseEntity.ok(imagineService.adauga(proprietateId, urlImagine, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> sterge(@PathVariable Long id,
                                       @AuthenticationPrincipal UserDetails userDetails) {
        imagineService.sterge(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
