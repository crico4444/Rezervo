package com.licenta.rezervari.repository;

import com.licenta.rezervari.model.Notificare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificareRepository extends JpaRepository<Notificare, Long> {

    List<Notificare> findByUtilizatorIdOrderByCreatLaDesc(Long utilizatorId);

    long countByUtilizatorIdAndCititaFalse(Long utilizatorId);

    @Modifying
    @Query("UPDATE Notificare n SET n.citita = true WHERE n.utilizatorId = :utilizatorId")
    void marcheazaToateCAcitite(@Param("utilizatorId") Long utilizatorId);

    @Modifying
    @Query("DELETE FROM Notificare n WHERE n.utilizatorId = :utilizatorId")
    void deleteByUtilizatorId(@Param("utilizatorId") Long utilizatorId);
}
