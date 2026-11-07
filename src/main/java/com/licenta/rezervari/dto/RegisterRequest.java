package com.licenta.rezervari.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String nume;
    @NotBlank
    private String prenume;
    @NotBlank @Email
    private String email;
    @NotBlank @Size(min = 6)
    private String parola;
    private String telefon;
}
