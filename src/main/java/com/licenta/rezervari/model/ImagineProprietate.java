package com.licenta.rezervari.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "imagini_proprietati")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImagineProprietate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietate_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Proprietate proprietate;

    @Column(name = "url_imagine", nullable = false, length = 500)
    private String urlImagine;
}
