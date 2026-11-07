package com.licenta.rezervari.repository;

import com.licenta.rezervari.model.Proprietate;
import com.licenta.rezervari.model.StatusProprietate;
import com.licenta.rezervari.model.TipProprietate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProprietateRepository extends JpaRepository<Proprietate, Long> {

    List<Proprietate> findByStatusProprietate(StatusProprietate status);

    List<Proprietate> findByProprietarId(Long proprietarId);

    @Query("SELECT p FROM Proprietate p WHERE " +
           "p.statusProprietate = com.licenta.rezervari.model.StatusProprietate.ACTIVA AND " +
           "(:oras IS NULL OR LOWER(p.oras) LIKE LOWER(CONCAT('%', :oras, '%'))) AND " +
           "(:tip IS NULL OR p.tip = :tip) AND " +
           "(:stele IS NULL OR p.stele = :stele)")
    List<Proprietate> filtreaza(
            @Param("oras") String oras,
            @Param("tip") TipProprietate tip,
            @Param("stele") Integer stele
    );
}
