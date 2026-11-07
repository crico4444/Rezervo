package com.licenta.rezervari.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "imagini_camere")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImagineCamera {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "camera_id", nullable = false)
    private Long cameraId;

    @Column(name = "url_imagine", nullable = false, length = 500)
    private String urlImagine;

    @Column(name = "creat_la")
    private LocalDateTime creatLa;

    @PrePersist
    public void prePersist() {
        creatLa = LocalDateTime.now();
    }
}
