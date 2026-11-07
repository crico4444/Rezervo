package com.licenta.rezervari.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RecenzieRequest {
    @NotNull private Long proprietateId;
    private String comentariu;

    @NotNull @Min(1) @Max(5) private Integer curatenie;
    @NotNull @Min(1) @Max(5) private Integer locatie;
    @NotNull @Min(1) @Max(5) private Integer utilitati;
    @NotNull @Min(1) @Max(5) private Integer personal;
    @NotNull @Min(1) @Max(5) private Integer raportCalitatePret;

    private String comentariuCuratenie;
    private String comentariuLocatie;
    private String comentariuUtilitati;
    private String comentariuPersonal;
    private String comentariuRaportCalitatePret;
}
