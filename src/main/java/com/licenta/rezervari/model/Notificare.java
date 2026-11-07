package com.licenta.rezervari.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notificari")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notificare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "utilizator_id", nullable = false)
    private Long utilizatorId;

    @Column(nullable = false, length = 200)
    private String titlu;

    @Column(nullable = false, length = 500)
    private String continut;

    @Column(nullable = false)
    private boolean citita;

    @Column(name = "creat_la", nullable = false)
    private LocalDateTime creatLa;

    @PrePersist
    public void prePersist() {
        if (creatLa == null) creatLa = LocalDateTime.now();
    }
}
