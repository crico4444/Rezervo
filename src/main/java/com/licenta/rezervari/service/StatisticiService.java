package com.licenta.rezervari.service;

import com.licenta.rezervari.dto.StatisticiDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StatisticiService {

    private final JdbcTemplate jdbc;

    public StatisticiDTO getStatistici() {
        return new StatisticiDTO(
            getTopVenituri(),
            getTopFinalizate(),
            getTopRating()
        );
    }

    private List<StatisticiDTO.StatProprietarDTO> getTopVenituri() {
        String sql = """
            SELECT CONCAT(u.nume, ' ', u.prenume) AS numeProprietar,
                   SUM(r.pret_total) AS valoare
            FROM rezervari r
            JOIN camere c ON r.camera_id = c.id
            JOIN proprietati p ON c.proprietate_id = p.id
            JOIN utilizatori u ON p.proprietar_id = u.id
            WHERE r.status = 'FINALIZATA'
            GROUP BY u.id, u.nume, u.prenume
            ORDER BY valoare DESC
            LIMIT 5
            """;
        return jdbc.query(sql, (rs, i) -> new StatisticiDTO.StatProprietarDTO(
            rs.getString("numeProprietar"),
            rs.getDouble("valoare")
        ));
    }

    private List<StatisticiDTO.StatProprietarDTO> getTopFinalizate() {
        String sql = """
            SELECT CONCAT(u.nume, ' ', u.prenume) AS numeProprietar,
                   COUNT(r.id) AS valoare
            FROM rezervari r
            JOIN camere c ON r.camera_id = c.id
            JOIN proprietati p ON c.proprietate_id = p.id
            JOIN utilizatori u ON p.proprietar_id = u.id
            WHERE r.status = 'FINALIZATA'
            GROUP BY u.id, u.nume, u.prenume
            ORDER BY valoare DESC
            LIMIT 5
            """;
        return jdbc.query(sql, (rs, i) -> new StatisticiDTO.StatProprietarDTO(
            rs.getString("numeProprietar"),
            rs.getDouble("valoare")
        ));
    }

    private List<StatisticiDTO.StatRatingDTO> getTopRating() {
        String sql = """
            SELECT p.nume AS numeProprietate,
                   CONCAT(u.nume, ' ', u.prenume) AS numeProprietar,
                   AVG(rec.rating) AS ratingMediu,
                   COUNT(rec.id) AS numarRecenzii
            FROM recenzii rec
            JOIN proprietati p ON rec.proprietate_id = p.id
            JOIN utilizatori u ON p.proprietar_id = u.id
            GROUP BY p.id, p.nume, u.id, u.nume, u.prenume
            ORDER BY ratingMediu DESC, numarRecenzii DESC
            LIMIT 5
            """;
        return jdbc.query(sql, (rs, i) -> new StatisticiDTO.StatRatingDTO(
            rs.getString("numeProprietate"),
            rs.getString("numeProprietar"),
            rs.getDouble("ratingMediu"),
            rs.getLong("numarRecenzii")
        ));
    }
}
