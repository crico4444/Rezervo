package com.licenta.rezervari.dto;

import com.licenta.rezervari.model.CategorieEveniment;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class EvenimentDTO {
    private Long id;
    @NotBlank private String nume;
    private String descriere;
    @NotBlank private String oras;
    @NotNull private Double latitudine;
    @NotNull private Double longitudine;
    @NotNull private LocalDate dataStart;
    @NotNull private LocalDate dataEnd;
    private LocalTime ora;
    private String imagine;
    private String linkBilete;
    @NotNull private CategorieEveniment categorie;
}
