package com.example.freelanceapp.dtos.invoice;

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
public class InvoiceResponse {
    private UUID id;
    private UUID userId;
    private UUID clientId;
    private String clientName;
    private UUID projectId;
    private String projectName;
    private UUID quoteId;
    private String quoteNumber;
    private String invoiceNumber;
    private String title;
    private String status;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate paidDate;
    private String paymentTerms;
    private String notes;
    private String terms;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private BigDecimal amountPaid;
    private BigDecimal balanceDue;
    private String currency;
    private LocalDateTime sentAt;
    private LocalDateTime viewedAt;
    private String pdfUrl;
    private String publicHash;
    private String paymentLink;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<InvoiceItemResponse> items;
    private List<InvoicePaymentResponse> payments;
}