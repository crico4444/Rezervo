package com.licenta.rezervari.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "recenzii")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recenzie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilizator_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Utilizator utilizator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietate_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Proprietate proprietate;

    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String comentariu;

    @Column(name = "creat_la")
    private LocalDateTime creatLa;

    @OneToOne(mappedBy = "recenzie", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private RatingDetaliat ratingDetaliat;

    @PrePersist
    public void prePersist() {
        if (creatLa == null) creatLa = LocalDateTime.now();
    }
}
