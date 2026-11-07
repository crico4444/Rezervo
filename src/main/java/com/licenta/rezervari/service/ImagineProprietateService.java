package com.licenta.rezervari.service;

import com.licenta.rezervari.model.ImagineProprietate;
import com.licenta.rezervari.model.Proprietate;
import com.licenta.rezervari.repository.ImagineProprietateRepository;
import com.licenta.rezervari.repository.ProprietateRepository;
import com.licenta.rezervari.repository.UtilizatorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ImagineProprietateService {

    private final ImagineProprietateRepository imagineRepo;
    private final ProprietateRepository proprietateRepo;
    private final UtilizatorRepository utilizatorRepo;

    public List<Map<String, Object>> getByProprietate(Long proprietateId) {
        return imagineRepo.findByProprietateId(proprietateId)
                .stream()
                .map(i -> Map.<String, Object>of("id", i.getId(), "urlImagine", i.getUrlImagine()))
                .toList();
    }

    public Map<String, Object> adauga(Long proprietateId, String urlImagine, String email) {
        Proprietate proprietate = proprietateRepo.findById(proprietateId)
                .orElseThrow(() -> new RuntimeException("Proprietatea nu a fost găsită"));

        Long userId = utilizatorRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit"))
                .getId();

        boolean esteAdmin = utilizatorRepo.findByEmail(email)
                .map(u -> u.getRol().name().equals("ADMIN"))
                .orElse(false);

        if (!esteAdmin && !proprietate.getProprietarId().equals(userId)) {
            throw new RuntimeException("Nu ai dreptul să adaugi imagini la această proprietate");
        }

        ImagineProprietate img = ImagineProprietate.builder()
                .proprietate(proprietate)
                .urlImagine(urlImagine)
                .build();

        ImagineProprietate salvata = imagineRepo.save(img);
        return Map.of("id", salvata.getId(), "urlImagine", salvata.getUrlImagine());
    }

    public void sterge(Long imagineId, String email) {
        ImagineProprietate img = imagineRepo.findById(imagineId)
                .orElseThrow(() -> new RuntimeException("Imaginea nu a fost găsită"));

        Long userId = utilizatorRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit"))
                .getId();

        boolean esteAdmin = utilizatorRepo.findByEmail(email)
                .map(u -> u.getRol().name().equals("ADMIN"))
                .orElse(false);

        if (!esteAdmin && !img.getProprietate().getProprietarId().equals(userId)) {
            throw new RuntimeException("Nu ai dreptul să ștergi această imagine");
        }

        imagineRepo.delete(img);
    }
}
