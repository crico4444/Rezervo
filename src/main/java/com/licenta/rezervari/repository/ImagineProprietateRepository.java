package com.licenta.rezervari.repository;

import com.licenta.rezervari.model.ImagineProprietate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImagineProprietateRepository extends JpaRepository<ImagineProprietate, Long> {
    List<ImagineProprietate> findByProprietateId(Long proprietateId);
}
