package com.example.freelanceapp.dtos.project;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectSummaryResponse {
    private String id;
    private String name;
    private String status;
    private String clientName;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate dueDate;
    private BigDecimal totalHours;
    private BigDecimal totalCost;
    private BigDecimal amountInvoiced;
    private BigDecimal amountPaid;
    private BigDecimal outstandingBalance;
    private Long quoteCount;
    private Long invoiceCount;
    private Long fileCount;
    private String progress; // percentage or status
    private Boolean isOverdue;
}