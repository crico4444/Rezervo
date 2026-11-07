package com.licenta.rezervari.dto;

import com.licenta.rezervari.model.StatusRezervare;
import com.licenta.rezervari.model.TipProprietate;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class RezervareDTO {
    private Long id;
    private Long cameraId;
    private String numeCamera;
    private String numeProprietate;
    private String orasProprietate;
    private String taraProprietate;
    private LocalDate dataCheckIn;
    private LocalDate dataCheckOut;
    private Integer nrPersoane;
    private BigDecimal pretTotal;
    private StatusRezervare status;
    private LocalDateTime creatLa;
    private String numeUtilizator;
    private String emailUtilizator;
    private Long proprietateId;
    private Long proprietarId;
    private String numeProprietar;
    private String imaginePrincipala;
    private String imagineCamera;
    private TipProprietate tipProprietate;
    private Integer stele;
    private Double ratingMediu;
    private Long numarRecenzii;
}
