package com.example.freelanceapp.dtos.quote;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuoteRequest {
    
    @NotNull(message = "Client ID is required")
    private String clientId;
    
    private String projectId;
    
    @NotBlank(message = "Title is required")
    @Size(min = 1, max = 255, message = "Title must be between 1 and 255 characters")
    private String title;
    
    private String summary;
    private String status;
    private LocalDate validUntil;
    private String termsAndConditions;
    private String notes;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private String currency;
    private List<QuoteItemRequest> items;
}