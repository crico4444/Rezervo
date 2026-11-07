package com.licenta.rezervari.repository;

import com.licenta.rezervari.model.OrasRomania;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrasRomaniaRepository extends JpaRepository<OrasRomania, Long> {
    List<OrasRomania> findAllByOrderByNumeAsc();
}
