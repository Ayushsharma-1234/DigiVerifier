package com.digiverifier.repository;

import com.digiverifier.entity.Gatc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GatcRepository extends JpaRepository<Gatc, UUID> {
    Optional<Gatc> findByUserId(UUID userId);
}
