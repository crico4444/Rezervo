package com.licenta.rezervari.dto;

import com.licenta.rezervari.model.TipCamera;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CameraDTO {
    private Long id;
    private Long proprietateId;
    @NotBlank private String nume;
    private String descriere;
    @NotNull private TipCamera tip;
    @NotNull private Integer capacitate;
    @NotNull private BigDecimal pretPeNoapte;
    private Boolean disponibila;

    private LocalDate ocupataPanaCand;
    private LocalDate urmatoareaCheckIn;
    private LocalDate urmatoareaCheckOut;
    private Boolean disponibilaInPerioada;
}
