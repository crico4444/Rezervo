package com.licenta.rezervari.repository;

import com.licenta.rezervari.model.Camera;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CameraRepository extends JpaRepository<Camera, Long> {

    List<Camera> findByProprietateId(Long proprietateId);

    List<Camera> findByProprietateIdAndCapacitateGreaterThanEqual(Long proprietateId, Integer capacitate);

    Optional<Camera> findFirstByProprietateIdOrderByIdAsc(Long proprietateId);

    @Query("SELECT MIN(c.pretPeNoapte) FROM Camera c WHERE c.proprietate.id = :proprietateId")
    BigDecimal findMinPretByProprietateId(@Param("proprietateId") Long proprietateId);

    @Query("SELECT c FROM Camera c WHERE c.proprietate.id = :proprietateId " +
           "AND c.disponibila = true " +
           "AND c.id NOT IN (" +
           "  SELECT r.camera.id FROM Rezervare r " +
           "  WHERE r.status NOT IN (com.licenta.rezervari.model.StatusRezervare.ANULATA) " +
           "  AND r.dataCheckIn < :checkOut AND r.dataCheckOut > :checkIn" +
           ")")
    List<Camera> findCamereDisponibile(
            @Param("proprietateId") Long proprietateId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );
}
