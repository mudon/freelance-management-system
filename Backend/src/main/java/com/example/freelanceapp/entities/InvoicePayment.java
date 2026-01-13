package com.example.freelanceapp.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "invoice_payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoicePayment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @Column(name = "payment_method", nullable = false, length = 50)
    private String paymentMethod; // stripe, paypal, bank_transfer, cash, check

    @Column(name = "transaction_id", length = 255)
    private String transactionId; // External payment ID

    @Column(name = "amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "currency", length = 3)
    private String currency = "USD";

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "status", length = 20)
    private String status = "completed"; // pending, completed, failed, refunded

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private String metadata = "{}";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}