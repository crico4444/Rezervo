package com.licenta.rezervari.repository;

import com.licenta.rezervari.model.Eveniment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface EvenimentRepository extends JpaRepository<Eveniment, Long> {

    @Query("SELECT e FROM Eveniment e WHERE e.dataEnd >= :azi ORDER BY e.dataStart ASC")
    List<Eveniment> findViitoare(LocalDate azi);
}
