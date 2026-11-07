package com.licenta.rezervari.dto;

import com.licenta.rezervari.model.Rol;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String nume;
    private String prenume;
    private Rol rol;
}
