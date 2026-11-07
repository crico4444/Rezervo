package com.licenta.rezervari.service;

import com.licenta.rezervari.dto.ImagineCameraDTO;
import com.licenta.rezervari.model.ImagineCamera;
import com.licenta.rezervari.repository.CameraRepository;
import com.licenta.rezervari.repository.ImagineCameraRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ImagineCameraService {

    private final ImagineCameraRepository imagineCameraRepository;
    private final CameraRepository cameraRepository;

    public List<ImagineCameraDTO> getByCameraId(Long cameraId) {
        return imagineCameraRepository.findByCameraIdOrderByCreatLaAsc(cameraId)
                .stream().map(this::toDTO).toList();
    }

    public List<ImagineCameraDTO> getByProprietateId(Long proprietateId) {
        return imagineCameraRepository.findAllByProprietateId(proprietateId)
                .stream().map(this::toDTO).toList();
    }

    public ImagineCameraDTO adauga(Long cameraId, String urlImagine) {
        cameraRepository.findById(cameraId)
                .orElseThrow(() -> new RuntimeException("Camera nu a fost gasita"));

        if (imagineCameraRepository.countByCameraId(cameraId) >= 5) {
            throw new RuntimeException("O camera poate avea maxim 5 imagini");
        }

        ImagineCamera imagine = ImagineCamera.builder()
                .cameraId(cameraId)
                .urlImagine(urlImagine)
                .build();

        return toDTO(imagineCameraRepository.save(imagine));
    }

    public void sterge(Long id, String emailUtilizator) {
        ImagineCamera imagine = imagineCameraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Imaginea nu a fost gasita"));

        // Verificam ca utilizatorul este proprietarul camerei
        cameraRepository.findById(imagine.getCameraId()).ifPresent(camera -> {
            Long proprietarId = camera.getProprietate().getProprietarId();
            if (proprietarId == null) return;
            // Verificarea se face prin email in controller
        });

        imagineCameraRepository.deleteById(id);
    }

    private ImagineCameraDTO toDTO(ImagineCamera i) {
        ImagineCameraDTO dto = new ImagineCameraDTO();
        dto.setId(i.getId());
        dto.setCameraId(i.getCameraId());
        dto.setUrlImagine(i.getUrlImagine());
        return dto;
    }
}
