package com.example.freelanceapp.dtos.invoice;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoicePaymentRequest {
    
    @NotBlank(message = "Payment method is required")
    private String paymentMethod;
    
    private String transactionId;
    
    @NotNull(message = "Amount is required")
    private BigDecimal amount;
    
    private String currency;
    
    @NotNull(message = "Payment date is required")
    private LocalDate paymentDate;
    
    private String notes;
    private String status;
    private String metadata;
}