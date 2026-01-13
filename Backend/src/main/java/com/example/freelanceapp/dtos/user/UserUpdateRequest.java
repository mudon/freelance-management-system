package com.example.freelanceapp.dtos.user;

import java.math.BigDecimal;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UserUpdateRequest {
    
    @Email(message = "Invalid email format")
    private String email;
    
    private String companyName;
    private String firstName;
    private String lastName;
    private String avatarUrl;
    private String timezone;
    private String currency;
    private BigDecimal taxRate;
    private String password; // For password updates
}