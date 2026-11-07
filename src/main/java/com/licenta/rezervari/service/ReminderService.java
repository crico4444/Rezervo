package com.licenta.rezervari.service;

import com.licenta.rezervari.model.Mesaj;
import com.licenta.rezervari.model.Rezervare;
import com.licenta.rezervari.model.StatusRezervare;
import com.licenta.rezervari.model.Utilizator;
import com.licenta.rezervari.repository.MesajRepository;
import com.licenta.rezervari.repository.RezervareRepository;
import com.licenta.rezervari.repository.UtilizatorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReminderService {

    private final RezervareRepository rezervareRepository;
    private final MesajRepository mesajRepository;
    private final UtilizatorRepository utilizatorRepository;
    private final NotificareService notificareService;
    private final EmailService emailService;

    // Rulează în fiecare zi la 09:00
    @Transactional
    @Scheduled(cron = "0 0 9 * * *")
    public void trimiteReminderCheckIn() {
        LocalDate maine = LocalDate.now().plusDays(1);
        List<Rezervare> rezervari = rezervareRepository.findConfirmateWithCheckInOn(maine);

        for (Rezervare rezervare : rezervari) {
            Long proprietarId = rezervare.getCamera().getProprietate().getProprietarId();
            if (proprietarId == null) continue;

            Optional<Utilizator> proprietar = utilizatorRepository.findById(proprietarId);
            if (proprietar.isEmpty()) continue;

            String numeProprietate = rezervare.getCamera().getProprietate().getNume();
            String numeCamera = rezervare.getCamera().getNume();
            String dataCheckIn = rezervare.getDataCheckIn().toString();

            String continut = String.format(
                "Bună ziua! Vă reamintim că mâine, pe %s, aveți check-in la %s (camera: %s). " +
                "Vă așteptăm cu drag! Dacă aveți întrebări, nu ezitați să ne contactați.",
                dataCheckIn, numeProprietate, numeCamera
            );

            Mesaj mesaj = Mesaj.builder()
                    .rezervare(rezervare)
                    .expeditor(proprietar.get())
                    .continut(continut)
                    .citit(false)
                    .build();

            mesajRepository.save(mesaj);

            // Email reminder catre client
            String numeClient = rezervare.getUtilizator().getNume() + " " + rezervare.getUtilizator().getPrenume();
            emailService.trimiteReminderCheckInClient(
                rezervare.getUtilizator().getEmail(),
                numeClient,
                numeProprietate,
                numeCamera,
                rezervare.getCamera().getProprietate().getOras(),
                dataCheckIn,
                rezervare.getDataCheckOut().toString()
            );
            log.info("Reminder trimis pentru rezervarea {} (check-in {})", rezervare.getId(), dataCheckIn);
        }

        log.info("Reminder check-in: {} mesaje trimise pentru data {}", rezervari.size(), maine);
    }

    /**
     * Ruleaza si la pornirea aplicatiei, pentru a prinde rezervarile expirate
     * din perioadele in care serverul nu a fost pornit.
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void anuleazaLaPornire() {
        anuleazaCheckInuriNeconfirmate();
    }

    /**
     * Ruleaza zilnic la 00:05 si anuleaza automat rezervarile CONFIRMATA
     * a caror data de check-in a trecut fara ca clientul sa fi confirmat sosirea.
     */
    @Transactional
    @Scheduled(cron = "0 5 0 * * *")
    public void anuleazaCheckInuriNeconfirmate() {
        LocalDate azi = LocalDate.now();
        List<Rezervare> expirate = rezervareRepository.findConfirmateCuCheckInTrecut(azi);

        for (Rezervare rezervare : expirate) {
            rezervare.setStatus(StatusRezervare.ANULATA);
            rezervareRepository.save(rezervare);
            log.info("Rezervare {} anulata automat — check-in {} neconfirmat de client",
                    rezervare.getId(), rezervare.getDataCheckIn());

            String numeProprietate = rezervare.getCamera().getProprietate().getNume();
            String numeCamera = rezervare.getCamera().getNume();
            Long clientId = rezervare.getUtilizator().getId();

            // Notificare (clopot) catre client
            notificareService.trimiteNotificare(
                clientId,
                "Rezervare anulată automat",
                String.format("Rezervarea ta la %s (camera: %s) pentru %s a fost anulată automat " +
                    "deoarece nu s-a confirmat check-in-ul. " +
                    "Contactează proprietarul dacă dorești să reprogramezi sau ai nevoie de ajutor.",
                    numeProprietate, numeCamera, rezervare.getDataCheckIn())
            );

            // Mesaj in chat de la proprietar catre client
            Long proprietarId = rezervare.getCamera().getProprietate().getProprietarId();
            if (proprietarId != null) {
                Optional<Utilizator> proprietar = utilizatorRepository.findById(proprietarId);
                if (proprietar.isPresent()) {
                    String continut = String.format(
                        "Bună ziua! Rezervarea dumneavoastră la %s (camera: %s) pentru data de %s " +
                        "a fost anulată automat deoarece check-in-ul nu a fost confirmat. " +
                        "Dacă doriți să reprogramați sejurul sau aveți întrebări, vă rugăm să ne contactați.",
                        numeProprietate, numeCamera, rezervare.getDataCheckIn()
                    );
                    Mesaj mesaj = Mesaj.builder()
                            .rezervare(rezervare)
                            .expeditor(proprietar.get())
                            .continut(continut)
                            .citit(false)
                            .build();
                    mesajRepository.save(mesaj);
                }
            }
        }

        if (!expirate.isEmpty()) {
            log.info("Anulare automata check-in: {} rezervari procesate pentru {}", expirate.size(), azi);
        }
    }
}
