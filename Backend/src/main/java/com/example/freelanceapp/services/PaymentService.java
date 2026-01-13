package com.example.freelanceapp.services;

import com.example.freelanceapp.dtos.invoice.InvoicePaymentRequest;
import com.example.freelanceapp.dtos.invoice.InvoicePaymentResponse;
import com.example.freelanceapp.entities.Invoice;
import com.example.freelanceapp.entities.InvoicePayment;
import com.example.freelanceapp.exceptions.BadRequestException;
import com.example.freelanceapp.exceptions.NotFoundException;
import com.example.freelanceapp.repositories.InvoicePaymentRepository;
import com.example.freelanceapp.repositories.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final InvoicePaymentRepository invoicePaymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceService invoiceService;

    // Map Entity to Response DTO
    private InvoicePaymentResponse mapToResponse(InvoicePayment payment) {
        return new InvoicePaymentResponse(
            payment.getId(),
            payment.getInvoice().getId(),
            payment.getPaymentMethod(),
            payment.getTransactionId(),
            payment.getAmount(),
            payment.getCurrency(),
            payment.getPaymentDate(),
            payment.getNotes(),
            payment.getStatus(),
            payment.getMetadata(),
            payment.getCreatedAt()
        );
    }

    // Add payment to invoice
    @Transactional
    public InvoicePaymentResponse addPayment(UUID userId, UUID invoiceId, InvoicePaymentRequest request) {
        Invoice invoice = invoiceRepository.findByIdAndUserId(invoiceId, userId)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        
        // Validate invoice can receive payments
        if ("cancelled".equals(invoice.getStatus())) {
            throw new BadRequestException("Cannot add payment to a cancelled invoice");
        }
        
        // Check if transaction ID already exists
        if (request.getTransactionId() != null && !request.getTransactionId().isEmpty()) {
            if (invoicePaymentRepository.existsByTransactionId(request.getTransactionId())) {
                throw new BadRequestException("A payment with this transaction ID already exists");
            }
        }
        
        // Validate payment amount
        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than zero");
        }
        
        // Check if payment exceeds balance due
        BigDecimal remainingBalance = invoice.getTotalAmount().subtract(invoice.getAmountPaid());
        if (request.getAmount().compareTo(remainingBalance) > 0) {
            throw new BadRequestException("Payment amount cannot exceed the remaining balance");
        }
        
        // Create payment
        InvoicePayment payment = new InvoicePayment();
        payment.setInvoice(invoice);
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setTransactionId(request.getTransactionId());
        payment.setAmount(request.getAmount());
        payment.setCurrency(request.getCurrency() != null ? request.getCurrency() : invoice.getCurrency());
        payment.setPaymentDate(request.getPaymentDate());
        payment.setNotes(request.getNotes());
        payment.setStatus(request.getStatus() != null ? request.getStatus() : "completed");
        payment.setMetadata(request.getMetadata() != null ? request.getMetadata() : "{}");
        
        InvoicePayment savedPayment = invoicePaymentRepository.save(payment);
        
        // Update invoice totals and status
        invoiceService.updateInvoiceTotals(invoice);
        
        return mapToResponse(savedPayment);
    }

    // Update payment
    @Transactional
    public InvoicePaymentResponse updatePayment(UUID userId, UUID invoiceId, UUID paymentId, InvoicePaymentRequest request) {
        // Verify invoice belongs to user
        Invoice invoice = invoiceRepository.findByIdAndUserId(invoiceId, userId)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        
        InvoicePayment payment = invoicePaymentRepository.findById(paymentId)
            .orElseThrow(() -> new NotFoundException("Payment not found"));
        
        // Verify payment belongs to the invoice
        if (!payment.getInvoice().getId().equals(invoiceId)) {
            throw new BadRequestException("Payment does not belong to the specified invoice");
        }
        
        // Check if transaction ID already exists (if changed)
        if (request.getTransactionId() != null && !request.getTransactionId().isEmpty() && 
            !request.getTransactionId().equals(payment.getTransactionId())) {
            if (invoicePaymentRepository.existsByTransactionId(request.getTransactionId())) {
                throw new BadRequestException("A payment with this transaction ID already exists");
            }
        }
        
        // Store old amount for recalculation
        BigDecimal oldAmount = payment.getAmount();
        
        // Update fields
        if (request.getPaymentMethod() != null) {
            payment.setPaymentMethod(request.getPaymentMethod());
        }
        if (request.getTransactionId() != null) {
            payment.setTransactionId(request.getTransactionId());
        }
        if (request.getAmount() != null) {
            // Validate new amount
            if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Payment amount must be greater than zero");
            }
            payment.setAmount(request.getAmount());
        }
        if (request.getCurrency() != null) {
            payment.setCurrency(request.getCurrency());
        }
        if (request.getPaymentDate() != null) {
            payment.setPaymentDate(request.getPaymentDate());
        }
        if (request.getNotes() != null) {
            payment.setNotes(request.getNotes());
        }
        if (request.getStatus() != null) {
            payment.setStatus(request.getStatus());
        }
        if (request.getMetadata() != null) {
            payment.setMetadata(request.getMetadata());
        }
        
        InvoicePayment updatedPayment = invoicePaymentRepository.save(payment);
        
        // Update invoice totals if amount changed
        if (request.getAmount() != null && request.getAmount().compareTo(oldAmount) != 0) {
            invoiceService.updateInvoiceTotals(invoice);
        }
        
        return mapToResponse(updatedPayment);
    }

    // Delete payment
    @Transactional
    public void deletePayment(UUID userId, UUID invoiceId, UUID paymentId) {
        // Verify invoice belongs to user
        Invoice invoice = invoiceRepository.findByIdAndUserId(invoiceId, userId)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        
        InvoicePayment payment = invoicePaymentRepository.findById(paymentId)
            .orElseThrow(() -> new NotFoundException("Payment not found"));
        
        // Verify payment belongs to the invoice
        if (!payment.getInvoice().getId().equals(invoiceId)) {
            throw new BadRequestException("Payment does not belong to the specified invoice");
        }
        
        // Only allow deletion of pending payments
        if ("completed".equals(payment.getStatus())) {
            throw new BadRequestException("Cannot delete a completed payment");
        }
        
        invoicePaymentRepository.delete(payment);
        
        // Update invoice totals
        invoiceService.updateInvoiceTotals(invoice);
    }

    // Get all payments for an invoice
    public List<InvoicePaymentResponse> getInvoicePayments(UUID userId, UUID invoiceId) {
        // Verify invoice belongs to user
        invoiceRepository.findByIdAndUserId(invoiceId, userId)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        
        return invoicePaymentRepository.findByInvoiceId(invoiceId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get payment by ID
    public InvoicePaymentResponse getPaymentById(UUID userId, UUID invoiceId, UUID paymentId) {
        // Verify invoice belongs to user
        invoiceRepository.findByIdAndUserId(invoiceId, userId)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        
        InvoicePayment payment = invoicePaymentRepository.findById(paymentId)
            .orElseThrow(() -> new NotFoundException("Payment not found"));
        
        // Verify payment belongs to the invoice
        if (!payment.getInvoice().getId().equals(invoiceId)) {
            throw new BadRequestException("Payment does not belong to the specified invoice");
        }
        
        return mapToResponse(payment);
    }

    // Get payments by status
    public List<InvoicePaymentResponse> getPaymentsByStatus(UUID userId, UUID invoiceId, String status) {
        // Verify invoice belongs to user
        invoiceRepository.findByIdAndUserId(invoiceId, userId)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        
        return invoicePaymentRepository.findByInvoiceIdAndStatus(invoiceId, status).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get total payments for user
    public BigDecimal getTotalPaymentsByUser(UUID userId) {
        BigDecimal total = invoicePaymentRepository.sumPaidAmountByUserId(userId);
        return total != null ? total : BigDecimal.ZERO;
    }

    // Get total payments for client
    public BigDecimal getTotalPaymentsByClient(UUID userId, UUID clientId) {
        // Verify client belongs to user
        // You might want to add a client repository check here
        
        BigDecimal total = invoicePaymentRepository.sumPaidAmountByClientId(clientId);
        return total != null ? total : BigDecimal.ZERO;
    }
}