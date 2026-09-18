package com.digiverifier.repository;

import com.digiverifier.entity.Officer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OfficerRepository extends JpaRepository<Officer, UUID> {
    Optional<Officer> findByUserId(UUID userId);
}
