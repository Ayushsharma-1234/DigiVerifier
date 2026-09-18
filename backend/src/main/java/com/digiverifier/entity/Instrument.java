package com.digiverifier.entity;

import com.digiverifier.enums.AccuracyClass;
import com.digiverifier.enums.InstrumentCategory;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "instruments")
public class Instrument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stakeholder_id", nullable = false)
    private User stakeholder;

    @Enumerated(EnumType.STRING)
    private InstrumentCategory category;

    private String serialNo;
    private String manufacturer;
    private String model;

    @Enumerated(EnumType.STRING)
    private AccuracyClass accuracyClass;

    private Integer yearOfPurchase;
    private String capacityRange;

    private String addressLine1;
    private String addressLine2;
    private String state;
    private String district;
    private String pincode;

    @Builder.Default
    private boolean isActive = true;

    private LocalDateTime createdAt;
}
