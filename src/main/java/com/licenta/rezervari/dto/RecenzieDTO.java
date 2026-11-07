package com.licenta.rezervari.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RecenzieDTO {
    private Long id;
    private Long proprietateId;
    private String numeUtilizator;
    private Integer rating;
    private String comentariu;
    private LocalDateTime creatLa;
    private Integer curatenie;
    private Integer locatie;
    private Integer utilitati;
    private Integer personal;
    private Integer raportCalitatePret;
}
