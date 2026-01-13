package com.example.freelanceapp.dtos.quote;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuoteItemResponse {
    private UUID id;
    private UUID quoteId;
    private String description;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal taxRate;
    private BigDecimal discount;
    private BigDecimal total;
    private Integer sortOrder;
    private LocalDateTime createdAt;
}