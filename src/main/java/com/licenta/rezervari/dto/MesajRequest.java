package com.licenta.rezervari.dto;

import lombok.Data;

@Data
public class MesajRequest {
    private Long rezervareId;
    private String continut;
}
