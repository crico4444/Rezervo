package com.licenta.rezervari.controller;

import com.licenta.rezervari.dto.MesajDTO;
import com.licenta.rezervari.dto.MesajRequest;
import com.licenta.rezervari.service.MesajService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mesaje")
@RequiredArgsConstructor
public class MesajController {

    private final MesajService mesajService;

    @GetMapping("/rezervare/{id}")
    public ResponseEntity<List<MesajDTO>> getConversatie(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(mesajService.getConversatie(id, principal.getName()));
    }

    @PostMapping
    public ResponseEntity<MesajDTO> trimite(@RequestBody MesajRequest request, Principal principal) {
        return ResponseEntity.ok(mesajService.trimite(request, principal.getName()));
    }

    @GetMapping("/necitite")
    public ResponseEntity<Map<Long, Long>> getNecitite(Principal principal) {
        return ResponseEntity.ok(mesajService.getNecitite(principal.getName()));
    }
}
