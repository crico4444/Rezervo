package com.licenta.rezervari.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "mesaje")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mesaj {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rezervare_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Rezervare rezervare;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expeditor_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Utilizator expeditor;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String continut;

    @Column(nullable = false)
    private boolean citit = false;

    @Column(name = "creat_la")
    private LocalDateTime creatLa;

    @PrePersist
    public void prePersist() {
        if (creatLa == null) creatLa = LocalDateTime.now();
    }
}
