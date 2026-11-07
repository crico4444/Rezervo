package com.licenta.rezervari.repository;

import com.licenta.rezervari.model.Mesaj;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface MesajRepository extends JpaRepository<Mesaj, Long> {

    List<Mesaj> findByRezervareIdOrderByCreatLaAsc(Long rezervareId);

    @Modifying
    @Transactional
    @Query("UPDATE Mesaj m SET m.citit = true WHERE m.rezervare.id = :rezervareId AND m.expeditor.id != :userId")
    void marcheazaCitite(@Param("rezervareId") Long rezervareId, @Param("userId") Long userId);

    @Query("SELECT m.rezervare.id, COUNT(m) FROM Mesaj m " +
           "WHERE (m.rezervare.utilizator.id = :userId OR m.rezervare.camera.proprietate.proprietarId = :userId) " +
           "AND m.expeditor.id != :userId AND m.citit = false " +
           "GROUP BY m.rezervare.id")
    List<Object[]> countNecititeGroupedByRezervare(@Param("userId") Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Mesaj m WHERE m.rezervare.utilizator.id = :utilizatorId")
    void deleteByRezervareUtilizatorId(@Param("utilizatorId") Long utilizatorId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Mesaj m WHERE m.rezervare.camera.proprietate.id = :proprietateId")
    void deleteByRezervareProprietateId(@Param("proprietateId") Long proprietateId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Mesaj m WHERE m.expeditor.id = :expeditorId")
    void deleteByExpeditorId(@Param("expeditorId") Long expeditorId);
}
