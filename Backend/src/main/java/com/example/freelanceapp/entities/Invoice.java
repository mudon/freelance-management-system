package com.example.freelanceapp.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quote_id")
    private Quote quote;

    @Column(
        name = "invoice_number",
        nullable = false,
        unique = true,
        length = 50,
        insertable = false,
        updatable = false
    )
    private String invoiceNumber;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "status", length = 20)
    private String status = "draft"; // draft, sent, viewed, partial, paid, overdue, cancelled

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "paid_date")
    private LocalDate paidDate;

    @Column(name = "payment_terms", length = 100)
    private String paymentTerms; // Net 30, Due on receipt, etc.

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "terms", columnDefinition = "TEXT")
    private String terms;

    @Column(name = "subtotal", precision = 10, scale = 2, nullable = false)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", precision = 10, scale = 2, nullable = false)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "amount_paid", precision = 10, scale = 2)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(name = "balance_due", precision = 10, scale = 2, nullable = false)
    private BigDecimal balanceDue = BigDecimal.ZERO;

    @Column(name = "currency", length = 3)
    private String currency = "USD";

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "viewed_at")
    private LocalDateTime viewedAt;

    @Column(name = "pdf_url", columnDefinition = "TEXT")
    private String pdfUrl;

    @Column(name = "public_hash", unique = true, length = 64)
    private String publicHash;

    @Column(name = "payment_link", columnDefinition = "TEXT")
    private String paymentLink; // Stripe/PayPal payment link

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}