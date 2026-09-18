package com.digiverifier.dto;

import com.digiverifier.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Name cannot be blank")
    private String name;

    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone cannot be blank")
    private String phone;

    @NotBlank(message = "Password cannot be blank")
    private String password;

    @NotNull(message = "Role must be specified")
    private Role role;

    private String aadhaarOrGstin;
    
    // Additional fields like state, district could be passed for LMO/GATC
    private String state;
    private String district;
}
