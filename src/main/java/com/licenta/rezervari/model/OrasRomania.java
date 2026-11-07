package com.licenta.rezervari.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "orase_romania")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrasRomania {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nume;

    @Column(nullable = false, length = 100)
    private String judet;
}
