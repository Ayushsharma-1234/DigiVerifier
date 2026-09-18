package com.digiverifier.dto;

import com.digiverifier.enums.VerificationType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ApplicationRequest {

    @NotNull(message = "Instrument ID is required")
    private UUID instrumentId;

    @NotNull(message = "Verification type is required")
    private VerificationType verificationType;
}
