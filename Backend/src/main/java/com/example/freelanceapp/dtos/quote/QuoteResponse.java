package com.example.freelanceapp.dtos.quote;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuoteResponse {
    private UUID id;
    private UUID userId;
    private UUID clientId;
    private String clientName;
    private UUID projectId;
    private String projectName;
    private String quoteNumber;
    private String title;
    private String summary;
    private String status;
    private LocalDate validUntil;
    private String termsAndConditions;
    private String notes;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String currency;
    private LocalDateTime sentAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime viewedAt;
    private String pdfUrl;
    private String publicHash;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<QuoteItemResponse> items;
}