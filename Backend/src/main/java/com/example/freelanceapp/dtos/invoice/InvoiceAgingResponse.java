package com.example.freelanceapp.dtos.invoice;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceAgingResponse {
    private String id;
    private String invoiceNumber;
    private String clientName;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private BigDecimal totalAmount;
    private BigDecimal amountPaid;
    private BigDecimal balanceDue;
    private String status;
    private String agingCategory; // Paid, Current, 1-30 Days, 31-60 Days, 61-90 Days, Over 90 Days
    private Long daysOverdue;
}