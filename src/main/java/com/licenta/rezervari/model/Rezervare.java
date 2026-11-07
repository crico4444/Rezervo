package com.licenta.rezervari.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "rezervari")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rezervare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilizator_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Utilizator utilizator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "camera_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Camera camera;

    @Column(name = "data_check_in", nullable = false)
    private LocalDate dataCheckIn;

    @Column(name = "data_check_out", nullable = false)
    private LocalDate dataCheckOut;

    @Column(name = "nr_persoane", nullable = false)
    private Integer nrPersoane;

    @Column(name = "pret_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal pretTotal;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('PENDING','CONFIRMATA','ANULATA','FINALIZATA') DEFAULT 'PENDING'")
    private StatusRezervare status;

    @Column(name = "creat_la")
    private LocalDateTime creatLa;

    @PrePersist
    public void prePersist() {
        if (creatLa == null) creatLa = LocalDateTime.now();
        if (status == null) status = StatusRezervare.PENDING;
    }
}
