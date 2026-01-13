package com.example.freelanceapp.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    private String companyName;
    
    private String firstName;
    
    private String lastName;
    
    @Column(nullable = false)
    private String passwordHash;
    
    private String avatarUrl;
    
    @Column(length = 50)
    @Builder.Default
    private String timezone = "UTC";
    
    @Column(length = 3)
    @Builder.Default
    private String currency = "USD";
    
    @Column(precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal taxRate = BigDecimal.valueOf(0.00);
    
    private String stripeCustomerId;
    
    @Column(length = 20)
    @Builder.Default
    private String subscriptionTier = "free";
    
    @Column(length = 20)
    @Builder.Default
    private String subscriptionStatus = "active";
    
    private LocalDateTime subscriptionExpiresAt;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    private String settings = "{}";
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    private LocalDateTime lastLoginAt;
}