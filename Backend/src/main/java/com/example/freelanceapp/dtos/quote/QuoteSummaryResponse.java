package com.example.freelanceapp.dtos.quote;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuoteSummaryResponse {
    private String id;
    private String quoteNumber;
    private String title;
    private String clientName;
    private String status;
    private BigDecimal totalAmount;
    private LocalDateTime sentAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime validUntil;
    private Boolean isExpired;
    private Integer itemCount;
}