package com.example.freelanceapp.dtos.client;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClientResponse {
    private UUID id;
    private UUID userId;
    private String companyName;
    private String contactName;
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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}