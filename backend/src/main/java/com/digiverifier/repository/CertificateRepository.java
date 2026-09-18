package com.digiverifier.repository;

import com.digiverifier.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, UUID> {
    List<Certificate> findByVerificationRecordApplicationStakeholderId(UUID stakeholderId);
}
