package com.licenta.rezervari.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MesajDTO {
    private Long id;
    private Long rezervareId;
    private Long expeditorId;
    private String expeditorEmail;
    private String numeExpeditor;
    private String continut;
    private boolean citit;
    private LocalDateTime creatLa;
}
