package com.licenta.rezervari.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class ProprietateDistantaDTO extends ProprietateDTO {
    private Double distantaKm;
}
