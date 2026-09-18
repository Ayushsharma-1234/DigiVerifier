package com.etulasetu.dto;

import com.etulasetu.enums.AccuracyClass;
import com.etulasetu.enums.InstrumentCategory;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class InstrumentResponse {
    private UUID id;
    private InstrumentCategory category;
    private String serialNo;
    private String manufacturer;
    private String model;
    private AccuracyClass accuracyClass;
    private Integer yearOfPurchase;
    private String capacityRange;
    private String addressLine1;
    private String addressLine2;
    private String state;
    private String district;
    private String pincode;
    private boolean isActive;
    private LocalDateTime createdAt;
    
    // Derived latest status
    private String latestCertificateStatus;
}
