package com.licenta.rezervari.service;

import com.licenta.rezervari.dto.ProprietateDTO;
import com.licenta.rezervari.dto.ProprietateDistantaDTO;
import com.licenta.rezervari.model.*;
import com.licenta.rezervari.repository.CameraRepository;
import com.licenta.rezervari.repository.EvenimentRepository;
import com.licenta.rezervari.repository.ProprietateRepository;
import com.licenta.rezervari.repository.RecenzieRepository;
import com.licenta.rezervari.repository.RezervareRepository;
import com.licenta.rezervari.repository.UtilizatorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProprietateService {

    private final ProprietateRepository proprietateRepository;
    private final UtilizatorRepository utilizatorRepository;
    private final RecenzieRepository recenzieRepository;
    private final RezervareRepository rezervareRepository;
    private final CameraRepository cameraRepository;
    private final EvenimentRepository evenimentRepository;

    public List<ProprietateDTO> getAll(String oras, String tip, Integer stele,
                                        LocalDate checkIn, LocalDate checkOut, Integer persoane) {
        TipProprietate tipEnum = null;
        if (tip != null && !tip.isBlank()) {
            tipEnum = TipProprietate.valueOf(tip.toUpperCase());
        }
        List<Proprietate> toate = proprietateRepository.filtreaza(oras, tipEnum, stele);

        if (checkIn != null && checkOut != null) {
            final LocalDate ci = checkIn;
            final LocalDate co = checkOut;
            final Integer p = persoane;
            return toate.stream().map(prop -> {
                ProprietateDTO dto = toDTO(prop);
                List<Camera> disponibile = cameraRepository.findCamereDisponibile(prop.getId(), ci, co);
                if (p != null) {
                    if (prop.getTip() == TipProprietate.APARTAMENT && prop.getCapacitate() != null) {
                        dto.setDisponibila(prop.getCapacitate() >= p && !disponibile.isEmpty());
                    } else {
                        List<Camera> potrivite = disponibile.stream()
                                .filter(c -> c.getCapacitate() >= p)
                                .toList();
                        dto.setDisponibila(!potrivite.isEmpty());
                    }
                } else {
                    dto.setDisponibila(!disponibile.isEmpty());
                }
                return dto;
            }).toList();
        } else if (persoane != null) {
            final Integer p = persoane;
            return toate.stream().map(prop -> {
                ProprietateDTO dto = toDTO(prop);
                boolean potrivita;
                if (prop.getTip() == TipProprietate.APARTAMENT) {
                    potrivita = prop.getCapacitate() == null || prop.getCapacitate() >= p;
                } else {
                    potrivita = !cameraRepository.findByProprietateIdAndCapacitateGreaterThanEqual(prop.getId(), p).isEmpty();
                }
                dto.setDisponibila(potrivita);
                return dto;
            }).toList();
        }

        return toate.stream().map(this::toDTO).toList();
    }

    public List<ProprietateDTO> getAllPentruAdmin() {
        return proprietateRepository.findAll().stream().map(this::toDTO).toList();
    }

    public ProprietateDTO getById(Long id) {
        return toDTO(findOrThrow(id));
    }

    public ProprietateDTO create(ProprietateDTO dto, String email) {
        Utilizator utilizator = utilizatorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit"));

        Proprietate p = fromDTO(dto);
        p.setProprietarId(utilizator.getId());
        p.setStatusProprietate(StatusProprietate.ACTIVA);

        Proprietate saved = proprietateRepository.save(p);

        if (saved.getTip() == TipProprietate.APARTAMENT) {
            Camera virtual = Camera.builder()
                    .proprietate(saved)
                    .nume("Virtual")
                    .descriere("")
                    .tip(TipCamera.DOUBLE)
                    .capacitate(dto.getCapacitate() != null ? dto.getCapacitate() : 1)
                    .pretPeNoapte(dto.getPretPeNoapte() != null ? dto.getPretPeNoapte() : BigDecimal.ZERO)
                    .disponibila(true)
                    .build();
            cameraRepository.save(virtual);
        }

        return toDTO(saved);
    }

    public ProprietateDTO update(Long id, ProprietateDTO dto) {
        Proprietate p = findOrThrow(id);
        applyCommonFields(p, dto);
        if (p.getTip() == TipProprietate.APARTAMENT) {
            p.setNrCamere(dto.getNrCamere());
            p.setCapacitate(dto.getCapacitate());
            p.setPretPeNoapte(dto.getPretPeNoapte());
        }
        return toDTO(proprietateRepository.save(p));
    }

    public ProprietateDTO updateAlMeu(Long id, ProprietateDTO dto, String email) {
        Proprietate p = findOrThrow(id);
        Utilizator utilizator = utilizatorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit"));
        if (!p.getProprietarId().equals(utilizator.getId())) {
            throw new RuntimeException("Nu ai permisiunea de a edita aceasta proprietate");
        }
        applyCommonFields(p, dto);
        if (p.getTip() == TipProprietate.APARTAMENT) {
            p.setNrCamere(dto.getNrCamere());
            p.setCapacitate(dto.getCapacitate());
            p.setPretPeNoapte(dto.getPretPeNoapte());
        }
        Proprietate saved = proprietateRepository.save(p);
        if (saved.getTip() == TipProprietate.APARTAMENT) {
            cameraRepository.findFirstByProprietateIdOrderByIdAsc(saved.getId())
                    .ifPresent(c -> {
                        if (dto.getCapacitate() != null) c.setCapacitate(dto.getCapacitate());
                        if (dto.getPretPeNoapte() != null) c.setPretPeNoapte(dto.getPretPeNoapte());
                        cameraRepository.save(c);
                    });
        }
        return toDTO(saved);
    }

    public void delete(Long id) {
        findOrThrow(id);
        proprietateRepository.deleteById(id);
    }

    public void stergeAlMeu(Long id, String email) {
        Proprietate p = findOrThrow(id);
        Utilizator utilizator = utilizatorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit"));
        if (!p.getProprietarId().equals(utilizator.getId())) {
            throw new RuntimeException("Nu ai permisiunea de a sterge aceasta proprietate");
        }
        if (rezervareRepository.existsRezervariActiveByProprietateId(id)) {
            throw new RuntimeException("Nu poți șterge o proprietate cu rezervări active");
        }
        proprietateRepository.deleteById(id);
    }

    public ProprietateDTO aprobaProprietate(Long id) {
        Proprietate p = findOrThrow(id);
        p.setStatusProprietate(StatusProprietate.ACTIVA);
        return toDTO(proprietateRepository.save(p));
    }

    public ProprietateDTO respingeProprietate(Long id) {
        Proprietate p = findOrThrow(id);
        p.setStatusProprietate(StatusProprietate.RESPINSA);
        return toDTO(proprietateRepository.save(p));
    }

    public List<ProprietateDistantaDTO> getLangaEveniment(Long evenimentId, LocalDate checkIn, LocalDate checkOut, Integer persoane) {
        Eveniment ev = evenimentRepository.findById(evenimentId)
                .orElseThrow(() -> new RuntimeException("Evenimentul nu a fost gasit"));

        double evLat = ev.getLatitudine();
        double evLng = ev.getLongitudine();

        List<Proprietate> active = proprietateRepository.findByStatusProprietate(StatusProprietate.ACTIVA);

        List<Proprietate> cuGps = active.stream()
                .filter(p -> p.getLatitudine() != null && p.getLongitudine() != null)
                .toList();

        if (checkIn != null && checkOut != null) {
            final LocalDate ci = checkIn;
            final LocalDate co = checkOut;
            final Integer p = persoane;
            cuGps = cuGps.stream().filter(prop -> {
                List<Camera> disponibile = cameraRepository.findCamereDisponibile(prop.getId(), ci, co);
                if (p != null) {
                    if (prop.getTip() == TipProprietate.APARTAMENT && prop.getCapacitate() != null) {
                        return prop.getCapacitate() >= p && !disponibile.isEmpty();
                    }
                    disponibile = disponibile.stream()
                            .filter(c -> c.getCapacitate() >= p)
                            .toList();
                }
                return !disponibile.isEmpty();
            }).toList();
        }

        return cuGps.stream()
                .map(prop -> {
                    double dist = haversine(evLat, evLng, prop.getLatitudine(), prop.getLongitudine());
                    if (dist > 20.0) return null;
                    ProprietateDistantaDTO dto = new ProprietateDistantaDTO();
                    ProprietateDTO base = toDTO(prop);
                    dto.setId(base.getId());
                    dto.setNume(base.getNume());
                    dto.setDescriere(base.getDescriere());
                    dto.setAdresa(base.getAdresa());
                    dto.setOras(base.getOras());
                    dto.setTara(base.getTara());
                    dto.setTip(base.getTip());
                    dto.setStele(base.getStele());
                    dto.setImaginePrincipala(base.getImaginePrincipala());
                    dto.setRatingMediu(base.getRatingMediu());
                    dto.setNumarRecenzii(base.getNumarRecenzii());
                    dto.setProprietarId(base.getProprietarId());
                    dto.setStatusProprietate(base.getStatusProprietate());
                    dto.setNrCamere(base.getNrCamere());
                    dto.setCapacitate(base.getCapacitate());
                    dto.setPretPeNoapte(base.getPretPeNoapte());
                    dto.setPretMinimCamera(base.getPretMinimCamera());
                    dto.setCameraVirtualaId(base.getCameraVirtualaId());
                    dto.setNumeProprietar(base.getNumeProprietar());
                    dto.setScorProprietar(base.getScorProprietar());
                    dto.setNumarRecenziiProprietar(base.getNumarRecenziiProprietar());
                    dto.setLatitudine(prop.getLatitudine());
                    dto.setLongitudine(prop.getLongitudine());
                    dto.setDistantaKm(Math.round(dist * 10.0) / 10.0);
                    return dto;
                })
                .filter(d -> d != null)
                .sorted(Comparator.comparingDouble(ProprietateDistantaDTO::getDistantaKm))
                .toList();
    }

    private double haversine(double lat1, double lng1, double lat2, double lng2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    public List<ProprietateDTO> getToate() {
        return proprietateRepository.findAll().stream().map(this::toDTO).toList();
    }

    public List<ProprietateDTO> getPending() {
        return proprietateRepository.findByStatusProprietate(StatusProprietate.PENDING)
                .stream().map(this::toDTO).toList();
    }

    public List<ProprietateDTO> getAleProprietarului(String email) {
        Utilizator utilizator = utilizatorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit"));
        return proprietateRepository.findByProprietarId(utilizator.getId())
                .stream().map(this::toDTO).toList();
    }

    private Proprietate findOrThrow(Long id) {
        return proprietateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proprietatea cu id " + id + " nu a fost gasita"));
    }

    private void applyCommonFields(Proprietate p, ProprietateDTO dto) {
        p.setNume(dto.getNume());
        p.setDescriere(dto.getDescriere());
        p.setAdresa(dto.getAdresa());
        p.setOras(dto.getOras());
        p.setTara(dto.getTara());
        p.setTip(dto.getTip());
        p.setStele(dto.getStele());
        p.setImaginePrincipala(dto.getImaginePrincipala());
        p.setLatitudine(dto.getLatitudine());
        p.setLongitudine(dto.getLongitudine());
    }

    private ProprietateDTO toDTO(Proprietate p) {
        ProprietateDTO dto = new ProprietateDTO();
        dto.setId(p.getId());
        dto.setNume(p.getNume());
        dto.setDescriere(p.getDescriere());
        dto.setAdresa(p.getAdresa());
        dto.setOras(p.getOras());
        dto.setTara(p.getTara());
        dto.setTip(p.getTip());
        dto.setStele(p.getStele());
        dto.setImaginePrincipala(p.getImaginePrincipala());
        dto.setProprietarId(p.getProprietarId());
        dto.setStatusProprietate(p.getStatusProprietate());
        dto.setLatitudine(p.getLatitudine());
        dto.setLongitudine(p.getLongitudine());
        dto.setRatingMediu(recenzieRepository.getRatingMediu(p.getId()));
        dto.setNumarRecenzii(recenzieRepository.countByProprietateId(p.getId()));

        if (p.getProprietarId() != null) {
            utilizatorRepository.findById(p.getProprietarId()).ifPresent(u -> {
                String nume = (u.getNume() != null ? u.getNume() : "") + " " + (u.getPrenume() != null ? u.getPrenume() : "");
                dto.setNumeProprietar(nume.trim());
                dto.setScorProprietar(recenzieRepository.getRatingMediuProprietar(u.getId()));
                dto.setNumarRecenziiProprietar(recenzieRepository.countByProprietarId(u.getId()));
            });
        }

        if (p.getTip() == TipProprietate.APARTAMENT) {
            dto.setNrCamere(p.getNrCamere());
            dto.setCapacitate(p.getCapacitate());
            dto.setPretPeNoapte(p.getPretPeNoapte());
            dto.setPretMinimCamera(p.getPretPeNoapte());
            cameraRepository.findFirstByProprietateIdOrderByIdAsc(p.getId())
                    .ifPresent(c -> dto.setCameraVirtualaId(c.getId()));
        } else {
            BigDecimal minPret = cameraRepository.findMinPretByProprietateId(p.getId());
            dto.setPretMinimCamera(minPret);
        }

        return dto;
    }

    private Proprietate fromDTO(ProprietateDTO dto) {
        return Proprietate.builder()
                .nume(dto.getNume())
                .descriere(dto.getDescriere())
                .adresa(dto.getAdresa())
                .oras(dto.getOras())
                .tara(dto.getTara())
                .tip(dto.getTip())
                .stele(dto.getStele())
                .imaginePrincipala(dto.getImaginePrincipala())
                .nrCamere(dto.getNrCamere())
                .capacitate(dto.getCapacitate())
                .pretPeNoapte(dto.getPretPeNoapte())
                .latitudine(dto.getLatitudine())
                .longitudine(dto.getLongitudine())
                .build();
    }
}
