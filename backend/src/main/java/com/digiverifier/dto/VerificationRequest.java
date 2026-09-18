package com.digiverifier.dto;

import com.digiverifier.enums.VerificationResult;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VerificationRequest {

    @NotNull(message = "Result is required")
    private VerificationResult result;

    private String observations;

    private Double gpsLatitude;
    private Double gpsLongitude;
    private String gpsAddress;

    private String photos;
}
