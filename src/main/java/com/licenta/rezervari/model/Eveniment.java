package com.licenta.rezervari.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "evenimente")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Eveniment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String nume;

    @Column(columnDefinition = "TEXT")
    private String descriere;

    @Column(nullable = false, length = 100)
    private String oras;

    @Column(nullable = false)
    private Double latitudine;

    @Column(nullable = false)
    private Double longitudine;

    @Column(name = "data_start", nullable = false)
    private LocalDate dataStart;

    @Column(name = "data_end", nullable = false)
    private LocalDate dataEnd;

    private LocalTime ora;

    @Column(length = 500)
    private String imagine;

    @Column(name = "link_bilete", length = 500)
    private String linkBilete;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false,
            columnDefinition = "ENUM('CONCERT','FESTIVAL','SPORT','CULTURAL','ALTELE')")
    private CategorieEveniment categorie;

    @Column(name = "creat_la")
    private LocalDateTime creatLa;

    @PrePersist
    public void prePersist() {
        if (creatLa == null) creatLa = LocalDateTime.now();
    }
}
