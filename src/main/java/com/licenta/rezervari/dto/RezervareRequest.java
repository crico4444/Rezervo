package com.licenta.rezervari.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RezervareRequest {
    @NotNull private Long cameraId;
    @NotNull private LocalDate dataCheckIn;
    @NotNull @Future private LocalDate dataCheckOut;
    @NotNull @Positive private Integer nrPersoane;
}
