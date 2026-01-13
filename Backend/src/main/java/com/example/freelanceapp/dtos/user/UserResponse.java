package com.example.freelanceapp.dtos.user;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    
    private UUID id;
    private String email;
    private String companyName;
    private String firstName;
    private String lastName;
    private String avatarUrl;
    private String timezone;
    private String currency;
    private BigDecimal taxRate;
    private String subscriptionTier;
    private String subscriptionStatus;
    private LocalDateTime subscriptionExpiresAt;
    private String settings;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLoginAt;
}