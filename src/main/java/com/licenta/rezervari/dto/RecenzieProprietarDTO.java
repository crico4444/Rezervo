package com.licenta.rezervari.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RecenzieProprietarDTO {
    private Long id;
    private Long proprietarId;
    private String numeUtilizator;
    private int rating;
    private String comentariu;
    private LocalDateTime creatLa;
    private Double ratingMediu;
    private Long numarRecenzii;
}
