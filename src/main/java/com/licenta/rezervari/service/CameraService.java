package com.licenta.rezervari.service;

import com.licenta.rezervari.dto.CameraDTO;
import com.licenta.rezervari.model.Camera;
import com.licenta.rezervari.model.Proprietate;
import com.licenta.rezervari.model.Rezervare;
import com.licenta.rezervari.model.Rol;
import com.licenta.rezervari.model.TipProprietate;
import com.licenta.rezervari.model.Utilizator;
import com.licenta.rezervari.repository.CameraRepository;
import com.licenta.rezervari.repository.ProprietateRepository;
import com.licenta.rezervari.repository.RezervareRepository;
import com.licenta.rezervari.repository.UtilizatorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CameraService {

    private final CameraRepository cameraRepository;
    private final ProprietateRepository proprietateRepository;
    private final UtilizatorRepository utilizatorRepository;
    private final RezervareRepository rezervareRepository;

    public List<CameraDTO> getByProprietate(Long proprietateId) {
        Proprietate p = proprietateRepository.findById(proprietateId).orElse(null);
        if (p != null && p.getTip() == TipProprietate.APARTAMENT) {
            return List.of();
        }
        return cameraRepository.findByProprietateId(proprietateId)
                .stream().map(this::toDTO).toList();
    }

    public List<CameraDTO> getCamereDisponibile(Long proprietateId, LocalDate checkIn, LocalDate checkOut) {
        return cameraRepository.findCamereDisponibile(proprietateId, checkIn, checkOut)
                .stream().map(this::toDTO).toList();
    }

    public List<CameraDTO> getCamereToateWithDisponibilitate(Long proprietateId, LocalDate checkIn, LocalDate checkOut) {
        Proprietate p = proprietateRepository.findById(proprietateId).orElse(null);
        if (p != null && p.getTip() == TipProprietate.APARTAMENT) {
            return List.of();
        }
        Set<Long> idsDisponibile = cameraRepository
                .findCamereDisponibile(proprietateId, checkIn, checkOut)
                .stream().map(Camera::getId).collect(Collectors.toSet());
        return cameraRepository.findByProprietateId(proprietateId).stream()
                .map(c -> {
                    CameraDTO dto = toDTO(c);
                    dto.setDisponibilaInPerioada(idsDisponibile.contains(c.getId()));
                    return dto;
                }).toList();
    }

    public CameraDTO getById(Long id) {
        return toDTO(findOrThrow(id));
    }

    public CameraDTO create(CameraDTO dto, String email) {
        Proprietate proprietate = proprietateRepository.findById(dto.getProprietateId())
                .orElseThrow(() -> new RuntimeException("Proprietatea nu a fost găsită"));
        verificaProprietar(proprietate, email);
        Camera camera = fromDTO(dto, proprietate);
        return toDTO(cameraRepository.save(camera));
    }

    public CameraDTO update(Long id, CameraDTO dto, String email) {
        Camera camera = findOrThrow(id);
        verificaProprietar(camera.getProprietate(), email);
        camera.setNume(dto.getNume());
        camera.setDescriere(dto.getDescriere());
        camera.setTip(dto.getTip());
        camera.setCapacitate(dto.getCapacitate());
        camera.setPretPeNoapte(dto.getPretPeNoapte());
        camera.setDisponibila(dto.getDisponibila());
        return toDTO(cameraRepository.save(camera));
    }

    public void delete(Long id, String email) {
        Camera camera = findOrThrow(id);
        verificaProprietar(camera.getProprietate(), email);
        cameraRepository.deleteById(id);
    }

    private void verificaProprietar(Proprietate proprietate, String email) {
        Utilizator user = utilizatorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit"));
        if (user.getRol() == Rol.ADMIN) return;
        if (!proprietate.getProprietarId().equals(user.getId())) {
            throw new RuntimeException("Nu ai permisiunea să modifici camerele acestei proprietăți");
        }
    }

    private Camera findOrThrow(Long id) {
        return cameraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Camera cu id " + id + " nu a fost găsită"));
    }

    private CameraDTO toDTO(Camera c) {
        CameraDTO dto = new CameraDTO();
        dto.setId(c.getId());
        dto.setProprietateId(c.getProprietate().getId());
        dto.setNume(c.getNume());
        dto.setDescriere(c.getDescriere());
        dto.setTip(c.getTip());
        dto.setCapacitate(c.getCapacitate());
        dto.setPretPeNoapte(c.getPretPeNoapte());
        dto.setDisponibila(c.getDisponibila());

        LocalDate azi = LocalDate.now();
        List<Rezervare> active = rezervareRepository.findRezervareActiva(c.getId(), azi);
        if (!active.isEmpty()) {
            dto.setOcupataPanaCand(active.get(0).getDataCheckOut());
        } else {
            List<Rezervare> urmatoare = rezervareRepository.findUrmatoareleRezervari(c.getId(), azi);
            if (!urmatoare.isEmpty()) {
                dto.setUrmatoareaCheckIn(urmatoare.get(0).getDataCheckIn());
                dto.setUrmatoareaCheckOut(urmatoare.get(0).getDataCheckOut());
            }
        }

        return dto;
    }

    private Camera fromDTO(CameraDTO dto, Proprietate proprietate) {
        return Camera.builder()
                .proprietate(proprietate)
                .nume(dto.getNume())
                .descriere(dto.getDescriere())
                .tip(dto.getTip())
                .capacitate(dto.getCapacitate())
                .pretPeNoapte(dto.getPretPeNoapte())
                .disponibila(dto.getDisponibila() != null ? dto.getDisponibila() : true)
                .build();
    }
}
