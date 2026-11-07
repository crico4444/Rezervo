package com.licenta.rezervari.repository;

import com.licenta.rezervari.model.Utilizator;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UtilizatorRepository extends JpaRepository<Utilizator, Long> {
    Optional<Utilizator> findByEmail(String email);
    boolean existsByEmail(String email);
}
