package com.licenta.rezervari.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificareDTO {
    private Long id;
    private String titlu;
    private String continut;
    private boolean citita;
    private LocalDateTime creatLa;
}
