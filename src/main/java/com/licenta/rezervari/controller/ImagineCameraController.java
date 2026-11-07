package com.licenta.rezervari.controller;

import com.licenta.rezervari.dto.ImagineCameraDTO;
import com.licenta.rezervari.service.ImagineCameraService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/imagini-camere")
@RequiredArgsConstructor
public class ImagineCameraController {

    private final ImagineCameraService imagineCameraService;

    /**
     * GET /api/imagini-camere?cameraId=X  — imaginile unei camere
     * GET /api/imagini-camere?proprietateId=X — toate imaginile camerelor unei proprietati
     */
    @GetMapping
    public ResponseEntity<List<ImagineCameraDTO>> get(
            @RequestParam(required = false) Long cameraId,
            @RequestParam(required = false) Long proprietateId) {

        if (cameraId != null) {
            return ResponseEntity.ok(imagineCameraService.getByCameraId(cameraId));
        }
        if (proprietateId != null) {
            return ResponseEntity.ok(imagineCameraService.getByProprietateId(proprietateId));
        }
        return ResponseEntity.badRequest().build();
    }

    /**
     * POST /api/imagini-camere  — adauga o imagine la o camera (max 5)
     */
    @PostMapping
    public ResponseEntity<?> adauga(@RequestBody Map<String, Object> body) {
        try {
            Long cameraId = Long.valueOf(body.get("cameraId").toString());
            String urlImagine = body.get("urlImagine").toString();
            return ResponseEntity.ok(imagineCameraService.adauga(cameraId, urlImagine));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("eroare", e.getMessage()));
        }
    }

    /**
     * DELETE /api/imagini-camere/{id}  — sterge o imagine
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> sterge(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            imagineCameraService.sterge(id, userDetails.getUsername());
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("eroare", e.getMessage()));
        }
    }
}
