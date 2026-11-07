package com.licenta.rezervari.repository;

import com.licenta.rezervari.model.Recenzie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RecenzieRepository extends JpaRepository<Recenzie, Long> {
    List<Recenzie> findByProprietateIdOrderByCreatLaDesc(Long proprietateId);
    List<Recenzie> findByUtilizatorId(Long utilizatorId);
    boolean existsByUtilizatorEmailAndProprietateId(String email, Long proprietateId);

    @Query("SELECT AVG(r.rating) FROM Recenzie r WHERE r.proprietate.id = :proprietateId")
    Double getRatingMediu(@Param("proprietateId") Long proprietateId);

    Long countByProprietateId(Long proprietateId);

    @Query("SELECT AVG(r.rating) FROM Recenzie r WHERE r.proprietate.id IN " +
           "(SELECT p.id FROM Proprietate p WHERE p.proprietarId = :proprietarId)")
    Double getRatingMediuProprietar(@Param("proprietarId") Long proprietarId);

    @Query("SELECT COUNT(r) FROM Recenzie r WHERE r.proprietate.id IN " +
           "(SELECT p.id FROM Proprietate p WHERE p.proprietarId = :proprietarId)")
    Long countByProprietarId(@Param("proprietarId") Long proprietarId);
}
