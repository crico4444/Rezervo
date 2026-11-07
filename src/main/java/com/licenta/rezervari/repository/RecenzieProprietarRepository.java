package com.licenta.rezervari.repository;

import com.licenta.rezervari.model.RecenzieProprietar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RecenzieProprietarRepository extends JpaRepository<RecenzieProprietar, Long> {

    boolean existsByUtilizatorIdAndProprietarId(Long utilizatorId, Long proprietarId);

    List<RecenzieProprietar> findByProprietarIdOrderByCreatLaDesc(Long proprietarId);

    List<RecenzieProprietar> findByUtilizatorId(Long utilizatorId);

    @Query("SELECT AVG(r.rating) FROM RecenzieProprietar r WHERE r.proprietar.id = :proprietarId")
    Double getRatingMediu(@Param("proprietarId") Long proprietarId);

    Long countByProprietarId(Long proprietarId);

    @Modifying
    @Query("DELETE FROM RecenzieProprietar r WHERE r.utilizator.id = :userId OR r.proprietar.id = :userId")
    void deleteByUtilizatorIdOrProprietarId(@Param("userId") Long userId);
}
