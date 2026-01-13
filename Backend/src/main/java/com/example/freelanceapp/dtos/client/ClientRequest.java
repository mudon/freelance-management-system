package com.example.freelanceapp.dtos.client;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClientRequest {
    
    private String companyName;
    
    @NotBlank(message = "Contact name is required")
    @Size(min = 2, max = 255, message = "Contact name must be between 2 and 255 characters")
    private String contactName;
    
    @Email(message = "Email should be valid")
    private String email;
    
    private String phone;
    private String address;
    private String city;
    private String state;
    private String country;
    private String postalCode;
    private String taxNumber;
    private String notes;
    private String status;
    private String clientCategory;
}