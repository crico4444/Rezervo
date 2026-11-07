package com.licenta.rezervari.dto;

import com.licenta.rezervari.model.StatusProprietate;
import com.licenta.rezervari.model.TipProprietate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProprietateDTO {
    private Long id;
    @NotBlank private String nume;
    private String descriere;
    @NotBlank private String adresa;
    @NotBlank private String oras;
    @NotBlank private String tara;
    @NotNull private TipProprietate tip;
    private Integer stele;
    private String imaginePrincipala;
    private Double ratingMediu;
    private Long numarRecenzii;
    private Long proprietarId;
    private StatusProprietate statusProprietate;
    private Integer nrCamere;
    private Integer capacitate;
    private BigDecimal pretPeNoapte;
    private BigDecimal pretMinimCamera;
    private Long cameraVirtualaId;
    private String numeProprietar;
    private Double scorProprietar;
    private Long numarRecenziiProprietar;
    private Double latitudine;
    private Double longitudine;
    private boolean disponibila = true;
}
