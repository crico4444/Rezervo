package com.licenta.rezervari.dto;

import com.licenta.rezervari.model.Rol;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UtilizatorDTO {
    private Long id;
    private String nume;
    private String prenume;
    private String email;
    private String telefon;
    private Rol rol;
    private LocalDateTime creatLa;
}
