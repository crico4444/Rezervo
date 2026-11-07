package com.licenta.rezervari.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "utilizatori")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Utilizator implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nume;

    @Column(nullable = false, length = 100)
    private String prenume;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, length = 255)
    private String parola;

    @Column(length = 20)
    private String telefon;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('CLIENT','ADMIN','PROPRIETAR') DEFAULT 'CLIENT'")
    private Rol rol;

    @Column(name = "creat_la")
    private LocalDateTime creatLa;

    @Column(name = "cod_verificare", length = 6)
    private String codVerificare;

    @Column(name = "cod_expira")
    private LocalDateTime codExpira;

    @Column(name = "email_verificat", nullable = false)
    private boolean emailVerificat = false;

    @PrePersist
    public void prePersist() {
        if (creatLa == null) creatLa = LocalDateTime.now();
        if (rol == null) rol = Rol.CLIENT;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + rol.name()));
    }

    @Override
    public String getPassword() {
        return parola;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return emailVerificat; }
}
