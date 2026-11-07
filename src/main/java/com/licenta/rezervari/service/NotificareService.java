package com.licenta.rezervari.service;

import com.licenta.rezervari.dto.NotificareDTO;
import com.licenta.rezervari.model.Notificare;
import com.licenta.rezervari.model.Utilizator;
import com.licenta.rezervari.repository.NotificareRepository;
import com.licenta.rezervari.repository.UtilizatorRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificareService {

    private final NotificareRepository notificareRepository;
    private final UtilizatorRepository utilizatorRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final EmailService emailService;

    /**
     * Trimite o notificare unui utilizator: salveaza in BD, livreaza in timp real via WebSocket
     * si trimite un email de informare.
     */
    public void trimiteNotificare(Long utilizatorId, String titlu, String continut) {
        Notificare notificare = Notificare.builder()
                .utilizatorId(utilizatorId)
                .titlu(titlu)
                .continut(continut)
                .citita(false)
                .build();
        notificare = notificareRepository.save(notificare);

        NotificareDTO dto = toDTO(notificare);

        utilizatorRepository.findById(utilizatorId).ifPresent(u -> {
            // Livrare in timp real — clientul asculta la /user/queue/notificari
            try {
                messagingTemplate.convertAndSendToUser(u.getEmail(), "/queue/notificari", dto);
                log.debug("Notificare WebSocket trimisa catre {}: {}", u.getEmail(), titlu);
            } catch (Exception e) {
                log.warn("Nu s-a putut trimite notificarea WebSocket catre {}: {}", u.getEmail(), e.getMessage());
            }

            // Trimitere email
            try {
                emailService.trimiteNotificare(u.getEmail(), titlu, continut);
            } catch (Exception e) {
                log.warn("Nu s-a putut trimite emailul de notificare catre {}: {}", u.getEmail(), e.getMessage());
            }
        });
    }

    /**
     * Returneaza toate notificarile utilizatorului autentificat, ordonate descrescator.
     */
    public List<NotificareDTO> getNotificari(String email) {
        Utilizator u = utilizatorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit"));
        return notificareRepository.findByUtilizatorIdOrderByCreatLaDesc(u.getId())
                .stream().map(this::toDTO).toList();
    }

    /**
     * Returneaza numarul de notificari necitite ale utilizatorului.
     */
    public long getNecititeCount(String email) {
        Utilizator u = utilizatorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit"));
        return notificareRepository.countByUtilizatorIdAndCititaFalse(u.getId());
    }

    /**
     * Marcheaza o notificare specifica ca citita, daca apartine utilizatorului curent.
     */
    @Transactional
    public void marcheazaCaCitita(Long id, String email) {
        Utilizator u = utilizatorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit"));
        Notificare n = notificareRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificarea nu a fost gasita"));
        if (!n.getUtilizatorId().equals(u.getId())) {
            throw new RuntimeException("Nu ai permisiunea de a marca aceasta notificare");
        }
        n.setCitita(true);
        notificareRepository.save(n);
    }

    /**
     * Marcheaza toate notificarile utilizatorului curent ca citite.
     */
    @Transactional
    public void marcheazaToateCAcitite(String email) {
        Utilizator u = utilizatorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit"));
        notificareRepository.marcheazaToateCAcitite(u.getId());
    }

    private NotificareDTO toDTO(Notificare n) {
        return NotificareDTO.builder()
                .id(n.getId())
                .titlu(n.getTitlu())
                .continut(n.getContinut())
                .citita(n.isCitita())
                .creatLa(n.getCreatLa())
                .build();
    }
}
