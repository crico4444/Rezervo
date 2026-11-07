package com.licenta.rezervari.service;

import com.licenta.rezervari.dto.AuthResponse;
import com.licenta.rezervari.dto.LoginRequest;
import com.licenta.rezervari.dto.RegisterRequest;
import com.licenta.rezervari.model.Utilizator;
import com.licenta.rezervari.repository.UtilizatorRepository;
import com.licenta.rezervari.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilizatorRepository utilizatorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    /**
     * Inregistreaza un utilizator nou cu emailul neverificat.
     * Trimite un cod de 6 cifre pe email si returneaza un raspuns fara JWT.
     * JWT-ul este emis abia dupa confirmarea codului.
     */
    public Map<String, Object> register(RegisterRequest request) {
        if (utilizatorRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email-ul este deja înregistrat");
        }

        String cod = String.format("%06d", new Random().nextInt(1_000_000));

        Utilizator utilizator = Utilizator.builder()
                .nume(request.getNume())
                .prenume(request.getPrenume())
                .email(request.getEmail())
                .parola(passwordEncoder.encode(request.getParola()))
                .telefon(request.getTelefon())
                .emailVerificat(false)
                .codVerificare(cod)
                .codExpira(LocalDateTime.now().plusMinutes(15))
                .build();

        utilizatorRepository.save(utilizator);
        emailService.trimiteCodeVerificareEmail(utilizator.getEmail(), cod);

        return Map.of(
                "necesitaVerificare", true,
                "email", utilizator.getEmail()
        );
    }

    /**
     * Verifica codul primit pe email, activeaza contul si returneaza JWT.
     */
    public AuthResponse verificaEmail(String email, String cod) {
        Utilizator u = utilizatorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Contul nu a fost găsit"));

        if (u.isEmailVerificat()) {
            throw new RuntimeException("Emailul este deja verificat");
        }
        if (u.getCodVerificare() == null || !u.getCodVerificare().equals(cod.trim())) {
            throw new RuntimeException("Cod incorect");
        }
        if (u.getCodExpira() == null || u.getCodExpira().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Codul a expirat. Solicită un cod nou");
        }

        u.setEmailVerificat(true);
        u.setCodVerificare(null);
        u.setCodExpira(null);
        utilizatorRepository.save(u);

        String token = jwtUtil.generateToken(u);
        return new AuthResponse(token, u.getEmail(), u.getNume(), u.getPrenume(), u.getRol());
    }

    /**
     * Retrimite codul de verificare email pentru un cont neverificat.
     */
    public void retrimiteCode(String email) {
        Utilizator u = utilizatorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Contul nu a fost găsit"));

        if (u.isEmailVerificat()) {
            throw new RuntimeException("Emailul este deja verificat");
        }

        String cod = String.format("%06d", new Random().nextInt(1_000_000));
        u.setCodVerificare(cod);
        u.setCodExpira(LocalDateTime.now().plusMinutes(15));
        utilizatorRepository.save(u);
        emailService.trimiteCodeVerificareEmail(email, cod);
    }

    /**
     * Autentifica un utilizator existent.
     * Returneaza eroare clara daca emailul nu este verificat.
     */
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getParola())
            );
        } catch (DisabledException e) {
            throw new RuntimeException("EMAIL_NEVERIFICAT");
        }

        Utilizator utilizator = utilizatorRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit"));

        String token = jwtUtil.generateToken(utilizator);
        return new AuthResponse(token, utilizator.getEmail(), utilizator.getNume(),
                utilizator.getPrenume(), utilizator.getRol());
    }
}
