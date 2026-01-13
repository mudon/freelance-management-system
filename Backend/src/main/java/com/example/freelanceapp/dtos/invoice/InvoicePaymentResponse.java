package com.example.freelanceapp.dtos.invoice;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoicePaymentResponse {
    private UUID id;
    private UUID invoiceId;
    private String paymentMethod;
    private String transactionId;
    private BigDecimal amount;
    private String currency;
    private LocalDate paymentDate;
    private String notes;
    private String status;
    private String metadata;
    private LocalDateTime createdAt;
}