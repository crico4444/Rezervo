package com.licenta.rezervari.service;

import com.licenta.rezervari.dto.RezervareDTO;
import com.licenta.rezervari.dto.RezervareRequest;
import com.licenta.rezervari.model.*;
import com.licenta.rezervari.repository.CameraRepository;
import com.licenta.rezervari.repository.ImagineCameraRepository;
import com.licenta.rezervari.repository.RecenzieRepository;
import com.licenta.rezervari.repository.RezervareRepository;
import com.licenta.rezervari.repository.UtilizatorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RezervareService {

    private final RezervareRepository rezervareRepository;
    private final CameraRepository cameraRepository;
    private final UtilizatorRepository utilizatorRepository;
    private final NotificareService notificareService;
    private final RecenzieRepository recenzieRepository;
    private final ImagineCameraRepository imagineCameraRepository;
    private final EmailService emailService;

    /**
     * Creeaza o rezervare noua pentru utilizatorul autentificat.
     * Valideaza datele (check-in inainte de check-out, camera disponibila in perioada respectiva),
     * calculeaza pretul total pe baza numarului de nopti si salveaza rezervarea cu statusul CONFIRMATA.
     */
    public RezervareDTO create(RezervareRequest request, String email) {
        Utilizator utilizator = utilizatorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit"));

        Camera camera = cameraRepository.findById(request.getCameraId())
                .orElseThrow(() -> new RuntimeException("Camera nu a fost gasita"));

        // Verificam ca data check-in sa fie strict inaintea check-out-ului
        if (request.getDataCheckIn().isAfter(request.getDataCheckOut()) ||
                request.getDataCheckIn().isEqual(request.getDataCheckOut())) {
            throw new RuntimeException("Data check-in trebuie sa fie inaintea check-out-ului");
        }

        // Verificam ca nu exista alta rezervare activa pentru aceeasi camera in intervalul selectat
        if (rezervareRepository.existsConflict(camera.getId(), request.getDataCheckIn(), request.getDataCheckOut())) {
            throw new RuntimeException("Camera nu este disponibila in perioada selectata");
        }

        // Calculam pretul total: numarul de nopti x pretul pe noapte
        long nopti = ChronoUnit.DAYS.between(request.getDataCheckIn(), request.getDataCheckOut());
        BigDecimal pretTotal = camera.getPretPeNoapte().multiply(BigDecimal.valueOf(nopti));

        Rezervare rezervare = Rezervare.builder()
                .utilizator(utilizator)
                .camera(camera)
                .dataCheckIn(request.getDataCheckIn())
                .dataCheckOut(request.getDataCheckOut())
                .nrPersoane(request.getNrPersoane())
                .pretTotal(pretTotal)
                .status(StatusRezervare.CONFIRMATA)
                .build();

        RezervareDTO dto = toDTO(rezervareRepository.save(rezervare));

        String numeProprietate = camera.getProprietate().getNume();
        String numeCamera = camera.getNume();
        String oras = camera.getProprietate().getOras();
        String checkIn = request.getDataCheckIn().toString();
        String checkOut = request.getDataCheckOut().toString();
        String pretTotalStr = pretTotal.setScale(0, java.math.RoundingMode.HALF_UP).toPlainString();
        String numeClient = utilizator.getNume() + " " + utilizator.getPrenume();

        // Email confirmare catre client
        emailService.trimiteConfirmareRezervareClient(
            utilizator.getEmail(), numeClient,
            numeProprietate, numeCamera, oras,
            checkIn, checkOut,
            (int) nopti, request.getNrPersoane(), pretTotalStr
        );

        // Notificare (clopot) + email catre proprietar
        Long proprietarId = camera.getProprietate().getProprietarId();
        if (proprietarId != null) {
            notificareService.trimiteNotificare(
                proprietarId,
                "Rezervare nouă",
                String.format("Ai primit o rezervare nouă la %s (camera: %s) pentru perioada %s – %s.",
                    numeProprietate, numeCamera, checkIn, checkOut)
            );
            utilizatorRepository.findById(proprietarId).ifPresent(proprietar -> {
                String numeProprietar = proprietar.getNume() + " " + proprietar.getPrenume();
                emailService.trimiteRezervareNouaProprietar(
                    proprietar.getEmail(), numeProprietar,
                    numeClient, utilizator.getEmail(), utilizator.getTelefon(),
                    numeProprietate, numeCamera,
                    checkIn, checkOut,
                    request.getNrPersoane(), pretTotalStr
                );
            });
        }

        return dto;
    }

    /**
     * Returneaza rezervarile utilizatorului autentificat, ordonate descrescator dupa data crearii.
     */
    public List<RezervareDTO> getMele(String email) {
        Utilizator utilizator = utilizatorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit"));
        return rezervareRepository.findByUtilizatorIdOrderByCreatLaDesc(utilizator.getId())
                .stream().map(this::toDTO).toList();
    }

    /**
     * Returneaza toate rezervarile din sistem, ordonate descrescator.
     * Accesibil doar de admin.
     */
    public List<RezervareDTO> getAll() {
        return rezervareRepository.findAllByOrderByCreatLaDesc()
                .stream().map(this::toDTO).toList();
    }

    /**
     * Schimba statusul unei rezervari la valoarea specificata.
     * Folosit de admin pentru a finaliza sau anula manual rezervari.
     */
    public RezervareDTO updateStatus(Long id, StatusRezervare status) {
        Rezervare rezervare = rezervareRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rezervarea nu a fost gasita"));
        rezervare.setStatus(status);
        return toDTO(rezervareRepository.save(rezervare));
    }

    /**
     * Confirma o rezervare ca proprietar.
     * Verifica ca utilizatorul curent este proprietarul cazarii si ca rezervarea e in starea PENDING.
     */
    public RezervareDTO confirmaProprietar(Long id, String email) {
        Rezervare rezervare = rezervareRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rezervarea nu a fost gasita"));

        Utilizator utilizator = utilizatorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit"));

        // Verificam ca cel care confirma este intr-adevar proprietarul cameriei rezervate
        Long proprietarId = rezervare.getCamera().getProprietate().getProprietarId();
        if (!proprietarId.equals(utilizator.getId())) {
            throw new RuntimeException("Nu ai permisiunea de a confirma aceasta rezervare");
        }

        if (rezervare.getStatus() != StatusRezervare.PENDING) {
            throw new RuntimeException("Rezervarea nu poate fi confirmata in statusul curent");
        }

        rezervare.setStatus(StatusRezervare.CONFIRMATA);
        return toDTO(rezervareRepository.save(rezervare));
    }

    /**
     * Anuleaza o rezervare ca proprietar.
     * Verifica ca utilizatorul curent este proprietarul si ca rezervarea nu e deja anulata.
     */
    public void anuleazaProprietar(Long id, String email) {
        Rezervare rezervare = rezervareRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rezervarea nu a fost gasita"));

        Utilizator utilizator = utilizatorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit"));

        Long proprietarId = rezervare.getCamera().getProprietate().getProprietarId();
        if (!proprietarId.equals(utilizator.getId())) {
            throw new RuntimeException("Nu ai permisiunea de a anula aceasta rezervare");
        }

        if (rezervare.getStatus() == StatusRezervare.ANULATA) {
            throw new RuntimeException("Rezervarea este deja anulata");
        }

        Long clientId = rezervare.getUtilizator().getId();
        String numeCamera = rezervare.getCamera().getNume();
        String numeProprietate = rezervare.getCamera().getProprietate().getNume();

        rezervare.setStatus(StatusRezervare.ANULATA);
        rezervareRepository.save(rezervare);

        // Notifica clientul ca rezervarea a fost anulata de proprietar
        notificareService.trimiteNotificare(
            clientId,
            "Rezervare anulată de proprietar",
            String.format("Proprietarul a anulat rezervarea ta la %s (camera: %s).", numeProprietate, numeCamera)
        );
    }

    /**
     * Anuleaza o rezervare ca si client.
     * Verifica ca utilizatorul curent este cel care a facut rezervarea
     * si ca aceasta nu este deja anulata sau finalizata.
     */
    public void anuleaza(Long id, String email) {
        Rezervare rezervare = rezervareRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rezervarea nu a fost gasita"));

        if (!rezervare.getUtilizator().getEmail().equals(email)) {
            throw new RuntimeException("Nu ai permisiunea de a anula aceasta rezervare");
        }

        if (rezervare.getStatus() == StatusRezervare.ANULATA) {
            throw new RuntimeException("Rezervarea este deja anulata");
        }
        if (rezervare.getStatus() == StatusRezervare.FINALIZATA) {
            throw new RuntimeException("Rezervarea finalizata nu poate fi anulata");
        }

        Long proprietarId = rezervare.getCamera().getProprietate().getProprietarId();
        String numeCamera = rezervare.getCamera().getNume();
        String numeProprietate = rezervare.getCamera().getProprietate().getNume();
        String numeClient = rezervare.getUtilizator().getNume() + " " + rezervare.getUtilizator().getPrenume();

        rezervare.setStatus(StatusRezervare.ANULATA);
        rezervareRepository.save(rezervare);

        // Notifica proprietarul ca clientul a anulat rezervarea
        if (proprietarId != null) {
            notificareService.trimiteNotificare(
                proprietarId,
                "Rezervare anulată de client",
                String.format("Clientul %s a anulat rezervarea la %s (camera: %s).",
                    numeClient, numeProprietate, numeCamera)
            );
        }
    }

    /**
     * Confirma check-in-ul de catre client.
     * Verifica ca utilizatorul este titularul rezervarii, ca statusul este CONFIRMATA
     * si ca data de check-in a sosit (azi >= dataCheckIn).
     * Seteaza statusul la IN_DESFASURARE.
     */
    public RezervareDTO confirmaCheckIn(Long id, String email) {
        Rezervare rezervare = rezervareRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rezervarea nu a fost găsită"));

        if (!rezervare.getUtilizator().getEmail().equals(email)) {
            throw new RuntimeException("Nu ai permisiunea de a confirma această rezervare");
        }

        if (rezervare.getStatus() != StatusRezervare.CONFIRMATA) {
            throw new RuntimeException("Check-in-ul poate fi confirmat doar pentru rezervări confirmate");
        }

        if (LocalDate.now().isBefore(rezervare.getDataCheckIn())) {
            throw new RuntimeException("Check-in-ul nu poate fi confirmat înainte de data rezervată ("
                    + rezervare.getDataCheckIn() + ")");
        }

        rezervare.setStatus(StatusRezervare.IN_DESFASURARE);
        RezervareDTO dto = toDTO(rezervareRepository.save(rezervare));

        // Notifica proprietarul ca clientul a confirmat sosirea
        Long proprietarId = rezervare.getCamera().getProprietate().getProprietarId();
        if (proprietarId != null) {
            String numeClient = rezervare.getUtilizator().getNume() + " " + rezervare.getUtilizator().getPrenume();
            notificareService.trimiteNotificare(
                proprietarId,
                "Check-in confirmat",
                String.format("Clientul %s a confirmat sosirea la %s (camera: %s).",
                    numeClient, rezervare.getCamera().getProprietate().getNume(), rezervare.getCamera().getNume())
            );
        }

        return dto;
    }

    /**
     * Returneaza toate rezervarile primite pentru proprietatile detinute de utilizatorul cu emailul dat.
     * Folosit pe pagina "Cazarile mele" a proprietarului.
     */
    public List<RezervareDTO> getRezervariPentruCazarileMele(String email) {
        Utilizator utilizator = utilizatorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit"));
        return rezervareRepository.findByProprietarId(utilizator.getId())
                .stream().map(this::toDTO).toList();
    }

    /**
     * Converteste o entitate Rezervare in DTO pentru raspunsul API.
     * Include datele clientului, ale cameriei, ale proprietatii si ale proprietarului.
     */
    private RezervareDTO toDTO(Rezervare r) {
        RezervareDTO dto = new RezervareDTO();
        dto.setId(r.getId());
        dto.setCameraId(r.getCamera().getId());
        dto.setNumeCamera(r.getCamera().getNume());
        dto.setNumeProprietate(r.getCamera().getProprietate().getNume());
        dto.setOrasProprietate(r.getCamera().getProprietate().getOras());
        dto.setDataCheckIn(r.getDataCheckIn());
        dto.setDataCheckOut(r.getDataCheckOut());
        dto.setNrPersoane(r.getNrPersoane());
        dto.setPretTotal(r.getPretTotal());
        dto.setStatus(r.getStatus());
        dto.setCreatLa(r.getCreatLa());
        dto.setNumeUtilizator(r.getUtilizator().getNume() + " " + r.getUtilizator().getPrenume());
        dto.setEmailUtilizator(r.getUtilizator().getEmail());
        dto.setProprietateId(r.getCamera().getProprietate().getId());
        Long proprietarId = r.getCamera().getProprietate().getProprietarId();
        dto.setProprietarId(proprietarId);
        if (proprietarId != null) {
            utilizatorRepository.findById(proprietarId).ifPresent(p ->
                dto.setNumeProprietar(p.getNume() + " " + p.getPrenume()));
        }
        Proprietate prop = r.getCamera().getProprietate();
        dto.setTaraProprietate(prop.getTara());
        dto.setImaginePrincipala(prop.getImaginePrincipala());
        dto.setTipProprietate(prop.getTip());
        dto.setStele(prop.getStele());
        dto.setRatingMediu(recenzieRepository.getRatingMediu(prop.getId()));
        dto.setNumarRecenzii(recenzieRepository.countByProprietateId(prop.getId()));
        imagineCameraRepository.findByCameraIdOrderByCreatLaAsc(r.getCamera().getId())
                .stream().findFirst()
                .ifPresent(img -> dto.setImagineCamera(img.getUrlImagine()));
        return dto;
    }
}
