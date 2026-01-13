package com.example.freelanceapp.dtos.invoice;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceSummaryResponse {
    private String id;
    private String invoiceNumber;
    private String title;
    private String clientName;
    private String status;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private BigDecimal totalAmount;
    private BigDecimal amountPaid;
    private BigDecimal balanceDue;
    private Boolean isOverdue;
    private Boolean isPartiallyPaid;
    private Integer itemCount;
    private Integer paymentCount;
}