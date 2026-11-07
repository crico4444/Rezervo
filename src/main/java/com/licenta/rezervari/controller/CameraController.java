package com.licenta.rezervari.controller;

import com.licenta.rezervari.dto.CameraDTO;
import com.licenta.rezervari.service.CameraService;
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
@RequestMapping("/api/camere")
@RequiredArgsConstructor
public class CameraController {

    private final CameraService cameraService;

    @GetMapping
    public ResponseEntity<List<CameraDTO>> getByProprietate(
            @RequestParam Long proprietateId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {

        if (checkIn != null && checkOut != null) {
            return ResponseEntity.ok(cameraService.getCamereToateWithDisponibilitate(proprietateId, checkIn, checkOut));
        }
        return ResponseEntity.ok(cameraService.getByProprietate(proprietateId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CameraDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(cameraService.getById(id));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CameraDTO> create(@Valid @RequestBody CameraDTO dto,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(cameraService.create(dto, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CameraDTO> update(@PathVariable Long id, @Valid @RequestBody CameraDTO dto,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(cameraService.update(id, dto, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       @AuthenticationPrincipal UserDetails userDetails) {
        cameraService.delete(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
