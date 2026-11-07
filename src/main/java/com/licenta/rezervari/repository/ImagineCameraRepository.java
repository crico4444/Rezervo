package com.licenta.rezervari.repository;

import com.licenta.rezervari.model.ImagineCamera;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ImagineCameraRepository extends JpaRepository<ImagineCamera, Long> {

    List<ImagineCamera> findByCameraIdOrderByCreatLaAsc(Long cameraId);

    @Query("SELECT i FROM ImagineCamera i WHERE i.cameraId IN " +
           "(SELECT c.id FROM Camera c WHERE c.proprietate.id = :proprietateId)")
    List<ImagineCamera> findAllByProprietateId(Long proprietateId);

    long countByCameraId(Long cameraId);
}
