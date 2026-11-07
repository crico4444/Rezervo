package com.licenta.rezervari.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatisticiDTO {
    private List<StatProprietarDTO> topVenituri;
    private List<StatProprietarDTO> topFinalizate;
    private List<StatRatingDTO> topRating;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatProprietarDTO {
        private String numeProprietar;
        private double valoare;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatRatingDTO {
        private String numeProprietate;
        private String numeProprietar;
        private double ratingMediu;
        private long numarRecenzii;
    }
}
