package com.licenta.rezervari.service;

import com.licenta.rezervari.dto.RecenzieDTO;
import com.licenta.rezervari.dto.RecenzieRequest;
import com.licenta.rezervari.model.*;
import com.licenta.rezervari.repository.ProprietateRepository;
import com.licenta.rezervari.repository.RecenzieRepository;
import com.licenta.rezervari.repository.RezervareRepository;
import com.licenta.rezervari.repository.UtilizatorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecenzieService {

    private final RecenzieRepository recenzieRepository;
    private final UtilizatorRepository utilizatorRepository;
    private final ProprietateRepository proprietateRepository;
    private final RezervareRepository rezervareRepository;

    // Statusurile de rezervare care dau dreptul la recenzie
    private static final List<StatusRezervare> STATUSURI_ELIGIBILE =
            List.of(StatusRezervare.CONFIRMATA, StatusRezervare.FINALIZATA);

    /**
     * Verifica daca un utilizator are dreptul sa lase recenzie pentru o proprietate.
     * Conditii: sa nu fi lasat deja o recenzie si sa aiba o rezervare confirmata/finalizata.
     */
    public boolean poateRecenza(Long proprietateId, String email) {
        if (email == null) return false;
        // Nu se poate lasa a doua recenzie pentru aceeasi proprietate
        if (recenzieRepository.existsByUtilizatorEmailAndProprietateId(email, proprietateId)) return false;
        // Trebuie sa existe cel putin o rezervare eligibila pentru acea proprietate
        return rezervareRepository.existsByEmailAndProprietateAndStatusIn(
                email, proprietateId, STATUSURI_ELIGIBILE);
    }

    /**
     * Creeaza o recenzie noua cu rating detaliat pe 5 criterii.
     * Calculeaza automat ratingul general ca medie a criteriilor
     * si construieste campul comentariu din comentariile individuale.
     */
    public RecenzieDTO create(RecenzieRequest request, String email) {
        if (!poateRecenza(request.getProprietateId(), email)) {
            throw new RuntimeException("Nu ai dreptul sa lasi o recenzie pentru aceasta proprietate");
        }

        Utilizator utilizator = utilizatorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit"));

        Proprietate proprietate = proprietateRepository.findById(request.getProprietateId())
                .orElseThrow(() -> new RuntimeException("Proprietatea nu a fost gasita"));

        // Ratingul general este media rotunjita a celor 5 criterii
        int ratingCalculat = calculeazaMedia(
                request.getCuratenie(), request.getLocatie(),
                request.getUtilitati(), request.getPersonal(), request.getRaportCalitatePret());

        // Comentariul stocheaza toate comentariile individuale intr-un singur camp text
        String comentariu = construiesteComentariu(request);

        Recenzie recenzie = Recenzie.builder()
                .utilizator(utilizator)
                .proprietate(proprietate)
                .rating(ratingCalculat)
                .comentariu(comentariu)
                .build();

        recenzie = recenzieRepository.save(recenzie);

        // Salvam si ratingul detaliat separat pentru a putea afisa criteriile individual
        RatingDetaliat detaliat = RatingDetaliat.builder()
                .recenzie(recenzie)
                .curatenie(request.getCuratenie())
                .locatie(request.getLocatie())
                .utilitati(request.getUtilitati())
                .personal(request.getPersonal())
                .raportCalitatePret(request.getRaportCalitatePret())
                .build();
        recenzie.setRatingDetaliat(detaliat);
        recenzie = recenzieRepository.save(recenzie);

        return toDTO(recenzie);
    }

    /**
     * Returneaza lista de ID-uri ale proprietatilor recenzate de utilizatorul curent.
     * Folosit pentru a marca in interfata proprietatile deja recenzate.
     */
    public List<Long> getRecenzateDeMine(String email) {
        Utilizator utilizator = utilizatorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit"));
        return recenzieRepository.findByUtilizatorId(utilizator.getId())
                .stream().map(r -> r.getProprietate().getId()).toList();
    }

    /**
     * Returneaza proprietatile pentru care utilizatorul poate lasa recenzie.
     * Conditii: rezervare finalizata/confirmata cu check-out trecut si fara recenzie existenta.
     * Folosit pentru modalul de reminder de recenzie.
     */
    public List<java.util.Map<String, Object>> getDeRecenzat(String email) {
        Utilizator utilizator = utilizatorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit"));

        return rezervareRepository.findByUtilizatorIdOrderByCreatLaDesc(utilizator.getId())
                .stream()
                // Doar rezervarile cu status eligibil
                .filter(r -> STATUSURI_ELIGIBILE.contains(r.getStatus()))
                // Doar daca check-out-ul a trecut sau este azi
                .filter(r -> r.getDataCheckOut().isBefore(LocalDate.now()) || r.getDataCheckOut().isEqual(LocalDate.now()))
                .map(r -> r.getCamera().getProprietate())
                .distinct()
                // Excludem proprietatile deja recenzate
                .filter(p -> !recenzieRepository.existsByUtilizatorEmailAndProprietateId(email, p.getId()))
                .map(p -> java.util.Map.<String, Object>of(
                        "proprietateId", p.getId(),
                        "numeProprietate", p.getNume()
                ))
                .toList();
    }

    /**
     * Returneaza toate recenziile pentru o proprietate, ordonate descrescator dupa data.
     */
    public List<RecenzieDTO> getByProprietate(Long proprietateId) {
        return recenzieRepository.findByProprietateIdOrderByCreatLaDesc(proprietateId)
                .stream().map(this::toDTO).toList();
    }

    /**
     * Calculeaza media aritmetica a unui set de valori si o rotunjeste la intreg.
     * Folosit pentru a obtine ratingul general din cele 5 criterii.
     */
    private int calculeazaMedia(int... valori) {
        int suma = 0;
        for (int v : valori) suma += v;
        return (int) Math.round((double) suma / valori.length);
    }

    /**
     * Construieste campul comentariu din toate comentariile individuale ale recenziei.
     * Formatul este: [criteriu] comentariu\n ... General: comentariu general
     */
    private String construiesteComentariu(RecenzieRequest r) {
        StringBuilder sb = new StringBuilder();
        adaugaCategorie(sb, "Curățenie", r.getCuratenie(), r.getComentariuCuratenie());
        adaugaCategorie(sb, "Locație", r.getLocatie(), r.getComentariuLocatie());
        adaugaCategorie(sb, "Utilități", r.getUtilitati(), r.getComentariuUtilitati());
        adaugaCategorie(sb, "Personal", r.getPersonal(), r.getComentariuPersonal());
        adaugaCategorie(sb, "Raport calitate-preț", r.getRaportCalitatePret(), r.getComentariuRaportCalitatePret());
        if (r.getComentariu() != null && !r.getComentariu().isBlank()) {
            sb.append("General: ").append(r.getComentariu().trim());
        }
        return sb.toString().trim();
    }

    /**
     * Adauga comentariul unui criteriu in StringBuilder-ul compus,
     * dar numai daca rating-ul e mic (<=3) si comentariul nu e gol.
     */
    private void adaugaCategorie(StringBuilder sb, String label, int rating, String comentariu) {
        if (rating <= 3 && comentariu != null && !comentariu.isBlank()) {
            sb.append("[").append(label).append("] ").append(comentariu.trim()).append("\n");
        }
    }

    /**
     * Converteste o entitate Recenzie in DTO pentru raspunsul API.
     * Include si campurile de rating detaliat daca exista.
     */
    private RecenzieDTO toDTO(Recenzie r) {
        RecenzieDTO dto = new RecenzieDTO();
        dto.setId(r.getId());
        dto.setProprietateId(r.getProprietate().getId());
        dto.setNumeUtilizator(r.getUtilizator().getNume() + " " + r.getUtilizator().getPrenume());
        dto.setRating(r.getRating());
        dto.setComentariu(r.getComentariu());
        dto.setCreatLa(r.getCreatLa());
        if (r.getRatingDetaliat() != null) {
            dto.setCuratenie(r.getRatingDetaliat().getCuratenie());
            dto.setLocatie(r.getRatingDetaliat().getLocatie());
            dto.setUtilitati(r.getRatingDetaliat().getUtilitati());
            dto.setPersonal(r.getRatingDetaliat().getPersonal());
            dto.setRaportCalitatePret(r.getRatingDetaliat().getRaportCalitatePret());
        }
        return dto;
    }
}
