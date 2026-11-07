package com.licenta.rezervari.controller;

import com.licenta.rezervari.model.OrasRomania;
import com.licenta.rezervari.repository.OrasRomaniaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orase")
@RequiredArgsConstructor
public class OrasController {

    private final OrasRomaniaRepository orasRomaniaRepository;

    @GetMapping
    public ResponseEntity<List<OrasRomania>> getAll() {
        return ResponseEntity.ok(orasRomaniaRepository.findAllByOrderByNumeAsc());
    }
}
