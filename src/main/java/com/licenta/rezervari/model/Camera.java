package com.licenta.rezervari.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "camere")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Camera {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietate_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Proprietate proprietate;

    @Column(nullable = false, length = 100)
    private String nume;

    @Column(columnDefinition = "TEXT")
    private String descriere;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "ENUM('SINGLE','DOUBLE','TWIN','SUITE')")
    private TipCamera tip;

    @Column(nullable = false)
    private Integer capacitate;

    @Column(name = "pret_pe_noapte", nullable = false, precision = 10, scale = 2)
    private BigDecimal pretPeNoapte;

    @Column(columnDefinition = "TINYINT(1) DEFAULT 1")
    private Boolean disponibila;
}
