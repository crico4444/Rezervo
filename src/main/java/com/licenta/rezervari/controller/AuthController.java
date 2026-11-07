package com.licenta.rezervari.controller;

import com.licenta.rezervari.dto.AuthResponse;
import com.licenta.rezervari.dto.LoginRequest;
import com.licenta.rezervari.dto.RegisterRequest;
import com.licenta.rezervari.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/verifica-email")
    public ResponseEntity<AuthResponse> verificaEmail(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String cod = body.get("cod");
        if (email == null || cod == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(authService.verificaEmail(email, cod));
    }

    @PostMapping("/retrimite-cod-email")
    public ResponseEntity<?> retrimiteCode(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null) return ResponseEntity.badRequest().build();
        authService.retrimiteCode(email);
        return ResponseEntity.ok(Map.of("mesaj", "Codul a fost retrimis pe adresa " + email));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (RuntimeException e) {
            if ("EMAIL_NEVERIFICAT".equals(e.getMessage())) {
                return ResponseEntity.status(403).body(Map.of(
                        "eroare", "Emailul nu a fost verificat. Verifică căsuța de mail.",
                        "necesitaVerificare", true,
                        "email", request.getEmail()
                ));
            }
            return ResponseEntity.status(401).body(Map.of("eroare", "Email sau parolă incorecte"));
        }
    }
}
