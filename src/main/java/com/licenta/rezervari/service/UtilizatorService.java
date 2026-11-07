package com.licenta.rezervari.service;

import com.licenta.rezervari.model.Proprietate;
import com.licenta.rezervari.model.Utilizator;
import com.licenta.rezervari.repository.MesajRepository;
import com.licenta.rezervari.repository.NotificareRepository;
import com.licenta.rezervari.repository.ProprietateRepository;
import com.licenta.rezervari.repository.RecenzieProprietarRepository;
import com.licenta.rezervari.repository.RecenzieRepository;
import com.licenta.rezervari.repository.RezervareRepository;
import com.licenta.rezervari.repository.UtilizatorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UtilizatorService {

    private final UtilizatorRepository utilizatorRepository;
    private final ProprietateRepository proprietateRepository;
    private final RezervareRepository rezervareRepository;
    private final MesajRepository mesajRepository;
    private final NotificareRepository notificareRepository;
    private final RecenzieRepository recenzieRepository;
    private final RecenzieProprietarRepository recenzieProprietarRepository;

    /**
     * Sterge definitiv un cont si toate datele asociate lui (rezervari, mesaje,
     * notificari, recenzii, proprietati detinute). Blocheaza stergerea daca exista
     * rezervari active (ale contului sau ale proprietatilor detinute), la fel ca
     * fluxul de stergere a unei proprietati individuale.
     */
    @Transactional
    public void stergeCont(Long userId) {
        Utilizator u = utilizatorRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilizatorul nu a fost găsit"));

        if (rezervareRepository.existsRezervariActiveByUtilizatorId(userId)) {
            throw new RuntimeException("Nu poți șterge contul cât timp ai rezervări active. Anulează-le mai întâi.");
        }

        List<Proprietate> proprietati = proprietateRepository.findByProprietarId(userId);
        for (Proprietate p : proprietati) {
            if (rezervareRepository.existsRezervariActiveByProprietateId(p.getId())) {
                throw new RuntimeException("Nu poți șterge contul cât timp ai proprietăți cu rezervări active.");
            }
        }

        for (Proprietate p : proprietati) {
            mesajRepository.deleteByRezervareProprietateId(p.getId());
            rezervareRepository.deleteByProprietateId(p.getId());
            proprietateRepository.delete(p);
        }

        mesajRepository.deleteByRezervareUtilizatorId(userId);
        rezervareRepository.deleteByUtilizatorId(userId);
        mesajRepository.deleteByExpeditorId(userId);

        notificareRepository.deleteByUtilizatorId(userId);
        recenzieRepository.deleteAll(recenzieRepository.findByUtilizatorId(userId));
        recenzieProprietarRepository.deleteByUtilizatorIdOrProprietarId(userId);

        utilizatorRepository.delete(u);
    }
}
