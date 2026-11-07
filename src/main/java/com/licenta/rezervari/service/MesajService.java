package com.licenta.rezervari.service;

import com.licenta.rezervari.dto.MesajDTO;
import com.licenta.rezervari.dto.MesajRequest;
import com.licenta.rezervari.model.Mesaj;
import com.licenta.rezervari.model.Rezervare;
import com.licenta.rezervari.model.Utilizator;
import com.licenta.rezervari.repository.MesajRepository;
import com.licenta.rezervari.repository.RezervareRepository;
import com.licenta.rezervari.repository.UtilizatorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MesajService {

    private final MesajRepository mesajRepository;
    private final RezervareRepository rezervareRepository;
    private final UtilizatorRepository utilizatorRepository;

    /**
     * Returneaza toate mesajele dintr-o conversatie (rezervare).
     * Verifica ca utilizatorul are acces (este clientul sau proprietarul rezervarii),
     * marcheaza mesajele primite ca citite si returneaza lista ordonata cronologic.
     */
    public List<MesajDTO> getConversatie(Long rezervareId, String email) {
        Utilizator utilizator = getUtilizator(email);
        Rezervare rezervare = getRezervare(rezervareId);
        verificaAcces(rezervare, utilizator);

        // Marcam ca citite toate mesajele primite de utilizatorul curent in aceasta conversatie
        mesajRepository.marcheazaCitite(rezervareId, utilizator.getId());

        return mesajRepository.findByRezervareIdOrderByCreatLaAsc(rezervareId)
                .stream().map(this::toDTO).toList();
    }

    /**
     * Trimite un mesaj nou intr-o conversatie.
     * Verifica ca utilizatorul are acces la conversatie si ca mesajul nu este gol.
     */
    public MesajDTO trimite(MesajRequest request, String email) {
        Utilizator utilizator = getUtilizator(email);
        Rezervare rezervare = getRezervare(request.getRezervareId());
        verificaAcces(rezervare, utilizator);

        if (request.getContinut() == null || request.getContinut().isBlank()) {
            throw new RuntimeException("Mesajul nu poate fi gol");
        }

        Mesaj mesaj = Mesaj.builder()
                .rezervare(rezervare)
                .expeditor(utilizator)
                .continut(request.getContinut().trim())
                .citit(false)
                .build();

        return toDTO(mesajRepository.save(mesaj));
    }

    /**
     * Returneaza numarul de mesaje necitite per rezervare pentru utilizatorul curent.
     * Rezultatul este o mapa de tip {rezervareId -> numarMesajeNecitite},
     * folosita in interfata pentru a afisa badge-uri de notificare.
     */
    public Map<Long, Long> getNecitite(String email) {
        Utilizator utilizator = getUtilizator(email);
        List<Object[]> randuri = mesajRepository.countNecititeGroupedByRezervare(utilizator.getId());
        Map<Long, Long> rezultat = new HashMap<>();
        for (Object[] rand : randuri) {
            rezultat.put((Long) rand[0], (Long) rand[1]);
        }
        return rezultat;
    }

    /**
     * Verifica ca utilizatorul are dreptul sa acceseze conversatia unei rezervari.
     * Accesul este permis daca este clientul sau proprietarul cazarii rezervate.
     */
    private void verificaAcces(Rezervare rezervare, Utilizator utilizator) {
        boolean esteClient = rezervare.getUtilizator().getId().equals(utilizator.getId());
        Long proprietarId = rezervare.getCamera().getProprietate().getProprietarId();
        boolean esteProprietar = proprietarId != null && proprietarId.equals(utilizator.getId());
        if (!esteClient && !esteProprietar) {
            throw new RuntimeException("Nu ai acces la aceasta conversatie");
        }
    }

    /**
     * Cauta utilizatorul dupa email sau arunca exceptie daca nu exista.
     */
    private Utilizator getUtilizator(String email) {
        return utilizatorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost gasit"));
    }

    /**
     * Cauta rezervarea dupa ID sau arunca exceptie daca nu exista.
     */
    private Rezervare getRezervare(Long id) {
        return rezervareRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rezervarea nu a fost gasita"));
    }

    /**
     * Converteste o entitate Mesaj in DTO pentru raspunsul API.
     * Include datele expeditorului si continutul mesajului.
     */
    private MesajDTO toDTO(Mesaj m) {
        MesajDTO dto = new MesajDTO();
        dto.setId(m.getId());
        dto.setRezervareId(m.getRezervare().getId());
        dto.setExpeditorId(m.getExpeditor().getId());
        dto.setExpeditorEmail(m.getExpeditor().getEmail());
        dto.setNumeExpeditor(m.getExpeditor().getNume() + " " + m.getExpeditor().getPrenume());
        dto.setContinut(m.getContinut());
        dto.setCitit(m.isCitit());
        dto.setCreatLa(m.getCreatLa());
        return dto;
    }
}
