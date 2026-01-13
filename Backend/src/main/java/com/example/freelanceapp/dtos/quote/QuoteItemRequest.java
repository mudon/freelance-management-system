package com.example.freelanceapp.dtos.quote;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuoteItemRequest {
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotNull(message = "Quantity is required")
    private BigDecimal quantity;
    
    @NotNull(message = "Unit price is required")
    private BigDecimal unitPrice;
    
    private BigDecimal taxRate;
    private BigDecimal discount;
    private Integer sortOrder;
}