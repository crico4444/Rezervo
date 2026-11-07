package com.licenta.rezervari.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "proprietati")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Proprietate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String nume;

    @Column(columnDefinition = "TEXT")
    private String descriere;

    @Column(nullable = false, length = 300)
    private String adresa;

    @Column(nullable = false, length = 100)
    private String oras;

    @Column(nullable = false, length = 100)
    private String tara;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "ENUM('HOTEL','APARTAMENT','VILA','HOSTEL')")
    private TipProprietate tip;

    private Integer stele;

    @Column(name = "imagine_principala", length = 500)
    private String imaginePrincipala;

    @Column(name = "nr_camere")
    private Integer nrCamere;

    @Column(name = "capacitate")
    private Integer capacitate;

    @Column(name = "pret_pe_noapte", precision = 10, scale = 2)
    private BigDecimal pretPeNoapte;

    @Column(name = "proprietar_id")
    private Long proprietarId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_proprietate", nullable = false,
            columnDefinition = "ENUM('PENDING','ACTIVA','RESPINSA')")
    private StatusProprietate statusProprietate = StatusProprietate.ACTIVA;

    private Double latitudine;

    private Double longitudine;

    @Column(name = "creat_la")
    private LocalDateTime creatLa;

    @OneToMany(mappedBy = "proprietate", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Camera> camere;

    @OneToMany(mappedBy = "proprietate", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<ImagineProprietate> imagini;

    @OneToMany(mappedBy = "proprietate", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Recenzie> recenzii;

    @PrePersist
    public void prePersist() {
        if (creatLa == null) creatLa = LocalDateTime.now();
    }
}
