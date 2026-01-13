package com.example.freelanceapp.dtos.client;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClientSummaryResponse {
    private String id;
    private String companyName;
    private String contactName;
    private String email;
    private String status;
    private Integer projectCount;
    private Integer quoteCount;
    private Integer invoiceCount;
    private BigDecimal totalInvoiced;
    private BigDecimal totalPaid;
    private String lastInvoiceDate;
}