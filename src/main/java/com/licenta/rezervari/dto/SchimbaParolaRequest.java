package com.licenta.rezervari.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SchimbaParolaRequest {

    @NotBlank(message = "Parola actuală este obligatorie")
    private String parolaActuala;

    @NotBlank(message = "Parola nouă este obligatorie")
    @Size(min = 6, message = "Parola nouă trebuie să aibă cel puțin 6 caractere")
    private String parolaNoua;
}
