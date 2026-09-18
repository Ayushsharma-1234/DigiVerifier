package com.etulasetu.repository;

import com.etulasetu.entity.Jurisdiction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface JurisdictionRepository extends JpaRepository<Jurisdiction, UUID> {
}
