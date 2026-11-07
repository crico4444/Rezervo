package com.licenta.rezervari.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProfilUpdateRequest {

    @NotBlank(message = "Numele este obligatoriu")
    @Size(max = 100)
    private String nume;

    @NotBlank(message = "Prenumele este obligatoriu")
    @Size(max = 100)
    private String prenume;

    @Size(max = 20, message = "Numărul de telefon poate avea maxim 20 de caractere")
    private String telefon;
}
