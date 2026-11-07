package com.licenta.rezervari.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "recenzii_proprietari")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecenzieProprietar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilizator_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Utilizator utilizator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietar_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Utilizator proprietar;

    @Column(nullable = false)
    private int rating;

    @Column(columnDefinition = "TEXT")
    private String comentariu;

    @Column(name = "creat_la")
    private LocalDateTime creatLa;

    @PrePersist
    public void prePersist() {
        if (creatLa == null) creatLa = LocalDateTime.now();
    }
}
