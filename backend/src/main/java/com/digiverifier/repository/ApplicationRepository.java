package com.digiverifier.repository;

import com.digiverifier.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    List<Application> findByStakeholderId(UUID stakeholderId);
    List<Application> findByInstrumentId(UUID instrumentId);
    List<Application> findByOfficerId(UUID officerId);
}
