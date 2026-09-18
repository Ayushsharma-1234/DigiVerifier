package com.etulasetu.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "jurisdictions")
public class Jurisdiction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String state;
    private String district;
    private String pincode;
}
