package com.licenta.rezervari.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "rating_detaliat")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RatingDetaliat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recenzie_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Recenzie recenzie;

    private Integer curatenie;
    private Integer locatie;
    private Integer utilitati;
    private Integer personal;

    @Column(name = "raport_calitate_pret")
    private Integer raportCalitatePret;
}
