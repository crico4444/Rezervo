package com.licenta.rezervari.repository;

import com.licenta.rezervari.model.Rezervare;
import com.licenta.rezervari.model.StatusRezervare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface RezervareRepository extends JpaRepository<Rezervare, Long> {

    List<Rezervare> findByUtilizatorIdOrderByCreatLaDesc(Long utilizatorId);

    List<Rezervare> findAllByOrderByCreatLaDesc();

    @Query("SELECT COUNT(r) > 0 FROM Rezervare r WHERE r.camera.id = :cameraId " +
           "AND r.status NOT IN (com.licenta.rezervari.model.StatusRezervare.ANULATA) " +
           "AND r.dataCheckIn < :checkOut AND r.dataCheckOut > :checkIn")
    boolean existsConflict(
            @Param("cameraId") Long cameraId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );

    List<Rezervare> findByCameraId(Long cameraId);

    @Query("SELECT r FROM Rezervare r WHERE r.camera.proprietate.proprietarId = :proprietarId ORDER BY r.creatLa DESC")
    List<Rezervare> findByProprietarId(@Param("proprietarId") Long proprietarId);

    @Query("SELECT COUNT(r) > 0 FROM Rezervare r WHERE r.utilizator.email = :email AND r.camera.proprietate.id = :proprietateId AND r.status IN :statusuri")
    boolean existsByEmailAndProprietateAndStatusIn(@Param("email") String email, @Param("proprietateId") Long proprietateId, @Param("statusuri") Collection<StatusRezervare> statusuri);

    @Query("SELECT COUNT(r) > 0 FROM Rezervare r WHERE r.utilizator.email = :email AND r.camera.proprietate.id = :proprietateId AND r.status IN :statusuri AND r.dataCheckOut <= :today")
    boolean existsByEmailAndProprietateAndStatusInAndCheckoutPassed(@Param("email") String email, @Param("proprietateId") Long proprietateId, @Param("statusuri") Collection<StatusRezervare> statusuri, @Param("today") LocalDate today);

    @Query("SELECT r FROM Rezervare r WHERE r.dataCheckIn = :maine AND r.status = com.licenta.rezervari.model.StatusRezervare.CONFIRMATA")
    List<Rezervare> findConfirmateWithCheckInOn(@Param("maine") LocalDate maine);

    @Query("SELECT r FROM Rezervare r WHERE r.camera.id = :cameraId " +
           "AND r.status NOT IN (com.licenta.rezervari.model.StatusRezervare.ANULATA) " +
           "AND r.dataCheckIn <= :azi AND r.dataCheckOut > :azi " +
           "ORDER BY r.dataCheckIn ASC")
    List<Rezervare> findRezervareActiva(@Param("cameraId") Long cameraId, @Param("azi") LocalDate azi);

    @Query("SELECT r FROM Rezervare r WHERE r.camera.id = :cameraId " +
           "AND r.status NOT IN (com.licenta.rezervari.model.StatusRezervare.ANULATA) " +
           "AND r.dataCheckIn > :azi " +
           "ORDER BY r.dataCheckIn ASC")
    List<Rezervare> findUrmatoareleRezervari(@Param("cameraId") Long cameraId, @Param("azi") LocalDate azi);

    @Query("SELECT COUNT(r) > 0 FROM Rezervare r WHERE r.utilizator.id = :clientId AND r.camera.proprietate.proprietarId = :proprietarId AND r.status IN :statusuri AND r.dataCheckOut <= :today")
    boolean existsByClientAndProprietarAndStatusInAndCheckoutPassed(@Param("clientId") Long clientId, @Param("proprietarId") Long proprietarId, @Param("statusuri") Collection<StatusRezervare> statusuri, @Param("today") LocalDate today);

    @Query("SELECT COUNT(r) > 0 FROM Rezervare r WHERE r.utilizator.id = :clientId AND r.camera.proprietate.proprietarId = :proprietarId AND r.status IN :statusuri")
    boolean existsByClientAndProprietarAndStatusIn(@Param("clientId") Long clientId, @Param("proprietarId") Long proprietarId, @Param("statusuri") Collection<StatusRezervare> statusuri);

    @Query("SELECT COUNT(r) > 0 FROM Rezervare r WHERE r.camera.proprietate.id = :proprietateId " +
           "AND r.status IN (com.licenta.rezervari.model.StatusRezervare.PENDING, com.licenta.rezervari.model.StatusRezervare.CONFIRMATA)")
    boolean existsRezervariActiveByProprietateId(@Param("proprietateId") Long proprietateId);

    /**
     * Returneaza toate rezervarile CONFIRMATA sau PENDING a caror data de check-in a trecut fara ca
     * clientul sa fi confirmat check-in-ul. Folosit de job-ul zilnic de anulare automata.
     */
    @Query("SELECT r FROM Rezervare r WHERE r.status IN (com.licenta.rezervari.model.StatusRezervare.CONFIRMATA, com.licenta.rezervari.model.StatusRezervare.PENDING) AND r.dataCheckIn < :azi")
    List<Rezervare> findConfirmateCuCheckInTrecut(@Param("azi") LocalDate azi);

    @Query("SELECT COUNT(r) > 0 FROM Rezervare r WHERE r.utilizator.id = :utilizatorId " +
           "AND r.status IN (com.licenta.rezervari.model.StatusRezervare.PENDING, com.licenta.rezervari.model.StatusRezervare.CONFIRMATA, com.licenta.rezervari.model.StatusRezervare.IN_DESFASURARE)")
    boolean existsRezervariActiveByUtilizatorId(@Param("utilizatorId") Long utilizatorId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Rezervare r WHERE r.utilizator.id = :utilizatorId")
    void deleteByUtilizatorId(@Param("utilizatorId") Long utilizatorId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Rezervare r WHERE r.camera.proprietate.id = :proprietateId")
    void deleteByProprietateId(@Param("proprietateId") Long proprietateId);
}
