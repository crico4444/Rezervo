package com.licenta.rezervari.service;

import com.licenta.rezervari.dto.RecenzieProprietarDTO;
import com.licenta.rezervari.model.RecenzieProprietar;
import com.licenta.rezervari.model.StatusRezervare;
import com.licenta.rezervari.model.Utilizator;
import com.licenta.rezervari.repository.RecenzieProprietarRepository;
import com.licenta.rezervari.repository.RezervareRepository;
import com.licenta.rezervari.repository.UtilizatorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecenzieProprietarService {

    private final RecenzieProprietarRepository recenzieProprietarRepository;
    private final UtilizatorRepository utilizatorRepository;
    private final RezervareRepository rezervareRepository;

    private static final List<StatusRezervare> STATUSURI_ELIGIBILE =
            List.of(StatusRezervare.CONFIRMATA, StatusRezervare.FINALIZATA);

    public boolean poateRecenza(Long proprietarId, String email) {
        if (email == null) return false;
        Utilizator user = utilizatorRepository.findByEmail(email).orElse(null);
        if (user == null) return false;
        if (recenzieProprietarRepository.existsByUtilizatorIdAndProprietarId(user.getId(), proprietarId)) return false;
        // verifică dacă a avut o rezervare finalizată la o proprietate a acestui proprietar
        return rezervareRepository.existsByClientAndProprietarAndStatusIn(
                user.getId(), proprietarId, STATUSURI_ELIGIBILE);
    }

    public RecenzieProprietarDTO create(Long proprietarId, int rating, String comentariu, String email) {
        if (!poateRecenza(proprietarId, email)) {
            throw new RuntimeException("Nu ai dreptul să lași o recenzie pentru acest proprietar");
        }
        Utilizator user = utilizatorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit"));
        Utilizator proprietar = utilizatorRepository.findById(proprietarId)
                .orElseThrow(() -> new RuntimeException("Proprietarul nu a fost găsit"));

        RecenzieProprietar recenzie = RecenzieProprietar.builder()
                .utilizator(user)
                .proprietar(proprietar)
                .rating(Math.min(5, Math.max(1, rating)))
                .comentariu(comentariu)
                .build();

        return toDTO(recenzieProprietarRepository.save(recenzie));
    }

    public List<RecenzieProprietarDTO> getByProprietar(Long proprietarId) {
        return recenzieProprietarRepository.findByProprietarIdOrderByCreatLaDesc(proprietarId)
                .stream().map(this::toDTO).toList();
    }

    public List<Long> getProprietariRecenzatiDeMine(String email) {
        Utilizator user = utilizatorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit"));
        return recenzieProprietarRepository.findByUtilizatorId(user.getId())
                .stream().map(r -> r.getProprietar().getId()).toList();
    }

    private RecenzieProprietarDTO toDTO(RecenzieProprietar r) {
        RecenzieProprietarDTO dto = new RecenzieProprietarDTO();
        dto.setId(r.getId());
        dto.setProprietarId(r.getProprietar().getId());
        dto.setNumeUtilizator(r.getUtilizator().getNume() + " " + r.getUtilizator().getPrenume());
        dto.setRating(r.getRating());
        dto.setComentariu(r.getComentariu());
        dto.setCreatLa(r.getCreatLa());
        dto.setRatingMediu(recenzieProprietarRepository.getRatingMediu(r.getProprietar().getId()));
        dto.setNumarRecenzii(recenzieProprietarRepository.countByProprietarId(r.getProprietar().getId()));
        return dto;
    }
}
