package com.etulasetu.dto;

import com.etulasetu.enums.AccuracyClass;
import com.etulasetu.enums.InstrumentCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InstrumentRequest {

    @NotNull(message = "Category is required")
    private InstrumentCategory category;

    @NotBlank(message = "Serial number is required")
    private String serialNo;

    private String manufacturer;
    private String model;
    
    private AccuracyClass accuracyClass;
    private Integer yearOfPurchase;
    private String capacityRange;

    @NotBlank(message = "Address Line 1 is required")
    private String addressLine1;
    private String addressLine2;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "District is required")
    private String district;

    @NotBlank(message = "Pincode is required")
    private String pincode;
}
