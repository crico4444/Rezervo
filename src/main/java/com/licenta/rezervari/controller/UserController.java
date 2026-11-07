package com.licenta.rezervari.controller;

import com.licenta.rezervari.dto.AuthResponse;
import com.licenta.rezervari.dto.ProfilUpdateRequest;
import com.licenta.rezervari.dto.SchimbaParolaRequest;
import com.licenta.rezervari.dto.UtilizatorDTO;
import com.licenta.rezervari.model.Rol;
import com.licenta.rezervari.model.Utilizator;
import com.licenta.rezervari.repository.UtilizatorRepository;
import com.licenta.rezervari.security.JwtUtil;
import com.licenta.rezervari.service.EmailService;
import com.licenta.rezervari.service.UtilizatorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/utilizatori")
@RequiredArgsConstructor
public class UserController {

    private final UtilizatorRepository utilizatorRepository;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final UtilizatorService utilizatorService;

    @GetMapping("/profil")
    public ResponseEntity<AuthResponse> getProfil(@AuthenticationPrincipal UserDetails userDetails) {
        Utilizator u = utilizatorRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit"));
        return ResponseEntity.ok(new AuthResponse(null, u.getEmail(), u.getNume(), u.getPrenume(), u.getRol()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UtilizatorDTO>> getAll() {
        List<UtilizatorDTO> lista = utilizatorRepository.findAll()
                .stream().map(this::toDTO).toList();
        return ResponseEntity.ok(lista);
    }

    /**
     * Trimite un cod de verificare pe email pentru upgrade la rolul de PROPRIETAR.
     * Codul are 6 cifre si este valabil 15 minute.
     * Accesibil doar de utilizatorii cu rolul CLIENT.
     */
    @PostMapping("/devino-proprietar")
    public ResponseEntity<?> cerereCodProprietar(@AuthenticationPrincipal UserDetails userDetails) {
        Utilizator u = utilizatorRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit"));

        if (u.getRol() != Rol.CLIENT) {
            return ResponseEntity.badRequest()
                    .body(Map.of("eroare", "Contul tău este deja " + u.getRol().name().toLowerCase()));
        }

        // Genereaza un cod aleator de 6 cifre
        String cod = String.format("%06d", new Random().nextInt(1_000_000));
        u.setCodVerificare(cod);
        u.setCodExpira(LocalDateTime.now().plusMinutes(15));
        utilizatorRepository.save(u);

        emailService.trimiteCodeProprietar(u.getEmail(), cod);

        return ResponseEntity.ok(Map.of("mesaj", "Codul a fost trimis pe adresa " + u.getEmail()));
    }

    /**
     * Verifica codul primit pe email si upgrades rolul la PROPRIETAR.
     * Returneaza un nou JWT cu rolul actualizat.
     */
    @PostMapping("/confirma-proprietar")
    public ResponseEntity<?> confirmaProprietar(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {

        String cod = body.get("cod");
        if (cod == null || cod.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("eroare", "Codul este obligatoriu"));
        }

        Utilizator u = utilizatorRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit"));

        if (u.getCodVerificare() == null || !u.getCodVerificare().equals(cod.trim())) {
            return ResponseEntity.badRequest().body(Map.of("eroare", "Cod incorect"));
        }

        if (u.getCodExpira() == null || u.getCodExpira().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body(Map.of("eroare", "Codul a expirat. Solicită un cod nou"));
        }

        // Actualizeaza rolul si curata codul
        u.setRol(Rol.PROPRIETAR);
        u.setCodVerificare(null);
        u.setCodExpira(null);
        utilizatorRepository.save(u);

        // Emite un nou JWT cu rolul actualizat
        String tokenNou = jwtUtil.generateToken(u);
        return ResponseEntity.ok(new AuthResponse(tokenNou, u.getEmail(), u.getNume(), u.getPrenume(), u.getRol()));
    }

    /**
     * Actualizeaza datele de profil ale utilizatorului autentificat (nume, prenume, telefon).
     * Returneaza un nou JWT cu datele actualizate pentru a actualiza contextul din frontend.
     */
    @PutMapping("/profil")
    public ResponseEntity<?> updateProfil(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ProfilUpdateRequest request) {

        Utilizator u = utilizatorRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit"));

        u.setNume(request.getNume().trim());
        u.setPrenume(request.getPrenume().trim());
        u.setTelefon(request.getTelefon() != null ? request.getTelefon().trim() : null);
        utilizatorRepository.save(u);

        // Emite un nou JWT cu datele actualizate
        String tokenNou = jwtUtil.generateToken(u);
        return ResponseEntity.ok(new AuthResponse(tokenNou, u.getEmail(), u.getNume(), u.getPrenume(), u.getRol()));
    }

    /**
     * Schimba parola utilizatorului autentificat.
     * Verifica parola actuala inainte de a salva noua parola criptata.
     */
    @PutMapping("/parola")
    public ResponseEntity<?> schimbaParola(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SchimbaParolaRequest request) {

        Utilizator u = utilizatorRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit"));

        if (!passwordEncoder.matches(request.getParolaActuala(), u.getParola())) {
            return ResponseEntity.badRequest().body(Map.of("eroare", "Parola actuală este incorectă"));
        }

        u.setParola(passwordEncoder.encode(request.getParolaNoua()));
        utilizatorRepository.save(u);

        return ResponseEntity.ok(Map.of("mesaj", "Parola a fost schimbată cu succes"));
    }

    /**
     * Sterge definitiv contul autentificat, dupa confirmarea parolei actuale.
     */
    @DeleteMapping("/mine")
    public ResponseEntity<?> stergeContPropriu(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {

        Utilizator u = utilizatorRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit"));

        String parola = body.get("parola");
        if (parola == null || !passwordEncoder.matches(parola, u.getParola())) {
            return ResponseEntity.badRequest().body(Map.of("eroare", "Parola introdusă este incorectă"));
        }

        utilizatorService.stergeCont(u.getId());
        return ResponseEntity.ok(Map.of("mesaj", "Contul a fost șters"));
    }

    private UtilizatorDTO toDTO(Utilizator u) {
        UtilizatorDTO dto = new UtilizatorDTO();
        dto.setId(u.getId());
        dto.setNume(u.getNume());
        dto.setPrenume(u.getPrenume());
        dto.setEmail(u.getEmail());
        dto.setTelefon(u.getTelefon());
        dto.setRol(u.getRol());
        dto.setCreatLa(u.getCreatLa());
        return dto;
    }
}
