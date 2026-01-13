package com.example.freelanceapp.dtos.invoice;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceRequest {
    
    @NotNull(message = "Client ID is required")
    private String clientId;
    
    private String projectId;
    private String quoteId;
    
    @NotBlank(message = "Title is required")
    @Size(min = 1, max = 255, message = "Title must be between 1 and 255 characters")
    private String title;
    
    private String status;
    
    @NotNull(message = "Issue date is required")
    private LocalDate issueDate;
    
    @NotNull(message = "Due date is required")
    private LocalDate dueDate;
    
    private String paymentTerms;
    private String notes;
    private String terms;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private String currency;
    private String paymentLink;
    private List<InvoiceItemRequest> items;
}