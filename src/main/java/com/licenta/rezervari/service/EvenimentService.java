package com.licenta.rezervari.service;

import com.licenta.rezervari.dto.EvenimentDTO;
import com.licenta.rezervari.model.Eveniment;
import com.licenta.rezervari.repository.EvenimentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EvenimentService {

    private final EvenimentRepository evenimentRepository;

    public List<EvenimentDTO> getViitoare() {
        return evenimentRepository.findViitoare(LocalDate.now())
                .stream().map(this::toDTO).toList();
    }

    public EvenimentDTO getById(Long id) {
        return toDTO(findOrThrow(id));
    }

    public EvenimentDTO create(EvenimentDTO dto) {
        Eveniment e = fromDTO(dto);
        return toDTO(evenimentRepository.save(e));
    }

    public EvenimentDTO update(Long id, EvenimentDTO dto) {
        Eveniment e = findOrThrow(id);
        e.setNume(dto.getNume());
        e.setDescriere(dto.getDescriere());
        e.setOras(dto.getOras());
        e.setLatitudine(dto.getLatitudine());
        e.setLongitudine(dto.getLongitudine());
        e.setDataStart(dto.getDataStart());
        e.setDataEnd(dto.getDataEnd());
        e.setOra(dto.getOra());
        e.setImagine(dto.getImagine());
        e.setLinkBilete(dto.getLinkBilete());
        e.setCategorie(dto.getCategorie());
        return toDTO(evenimentRepository.save(e));
    }

    public void delete(Long id) {
        findOrThrow(id);
        evenimentRepository.deleteById(id);
    }

    private Eveniment findOrThrow(Long id) {
        return evenimentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evenimentul cu id " + id + " nu a fost gasit"));
    }

    private EvenimentDTO toDTO(Eveniment e) {
        EvenimentDTO dto = new EvenimentDTO();
        dto.setId(e.getId());
        dto.setNume(e.getNume());
        dto.setDescriere(e.getDescriere());
        dto.setOras(e.getOras());
        dto.setLatitudine(e.getLatitudine());
        dto.setLongitudine(e.getLongitudine());
        dto.setDataStart(e.getDataStart());
        dto.setDataEnd(e.getDataEnd());
        dto.setOra(e.getOra());
        dto.setImagine(e.getImagine());
        dto.setLinkBilete(e.getLinkBilete());
        dto.setCategorie(e.getCategorie());
        return dto;
    }

    private Eveniment fromDTO(EvenimentDTO dto) {
        return Eveniment.builder()
                .nume(dto.getNume())
                .descriere(dto.getDescriere())
                .oras(dto.getOras())
                .latitudine(dto.getLatitudine())
                .longitudine(dto.getLongitudine())
                .dataStart(dto.getDataStart())
                .dataEnd(dto.getDataEnd())
                .ora(dto.getOra())
                .imagine(dto.getImagine())
                .linkBilete(dto.getLinkBilete())
                .categorie(dto.getCategorie())
                .build();
    }
}
