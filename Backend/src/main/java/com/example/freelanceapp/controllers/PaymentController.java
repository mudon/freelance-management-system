package com.example.freelanceapp.controllers;

import com.example.freelanceapp.dtos.invoice.InvoicePaymentRequest;
import com.example.freelanceapp.dtos.invoice.InvoicePaymentResponse;
import com.example.freelanceapp.entities.User;
import com.example.freelanceapp.repositories.UserRepository;
import com.example.freelanceapp.services.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/user/client/project/quote/invoices/{invoiceId}/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository; // inject repository


    // Helper method to get current user ID
    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));
        return user.getId();
    }

    // Add payment to invoice
    @PostMapping
    public ResponseEntity<InvoicePaymentResponse> addPayment(
            @PathVariable UUID invoiceId,
            @Valid @RequestBody InvoicePaymentRequest request) {
        UUID userId = getCurrentUserId();
        InvoicePaymentResponse response = paymentService.addPayment(userId, invoiceId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get all payments for an invoice
    @GetMapping
    public ResponseEntity<List<InvoicePaymentResponse>> getInvoicePayments(@PathVariable UUID invoiceId) {
        UUID userId = getCurrentUserId();
        List<InvoicePaymentResponse> payments = paymentService.getInvoicePayments(userId, invoiceId);
        return ResponseEntity.ok(payments);
    }

    // Get payment by ID
    @GetMapping("/{paymentId}")
    public ResponseEntity<InvoicePaymentResponse> getPaymentById(
            @PathVariable UUID invoiceId,
            @PathVariable UUID paymentId) {
        UUID userId = getCurrentUserId();
        InvoicePaymentResponse payment = paymentService.getPaymentById(userId, invoiceId, paymentId);
        return ResponseEntity.ok(payment);
    }

    // Update payment
    @PutMapping("/{paymentId}")
    public ResponseEntity<InvoicePaymentResponse> updatePayment(
            @PathVariable UUID invoiceId,
            @PathVariable UUID paymentId,
            @Valid @RequestBody InvoicePaymentRequest request) {
        UUID userId = getCurrentUserId();
        InvoicePaymentResponse updatedPayment = paymentService.updatePayment(userId, invoiceId, paymentId, request);
        return ResponseEntity.ok(updatedPayment);
    }

    // Delete payment
    @DeleteMapping("/{paymentId}")
    public ResponseEntity<Void> deletePayment(
            @PathVariable UUID invoiceId,
            @PathVariable UUID paymentId) {
        UUID userId = getCurrentUserId();
        paymentService.deletePayment(userId, invoiceId, paymentId);
        return ResponseEntity.noContent().build();
    }

    // Get payments by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<InvoicePaymentResponse>> getPaymentsByStatus(
            @PathVariable UUID invoiceId,
            @PathVariable String status) {
        UUID userId = getCurrentUserId();
        List<InvoicePaymentResponse> payments = paymentService.getPaymentsByStatus(userId, invoiceId, status);
        return ResponseEntity.ok(payments);
    }

    // Get total payments for user
    @GetMapping("/user-total")
    public ResponseEntity<String> getTotalPaymentsByUser() {
        UUID userId = getCurrentUserId();
        BigDecimal total = paymentService.getTotalPaymentsByUser(userId);
        return ResponseEntity.ok(total.toString());
    }

    // Get total payments for client
    @GetMapping("/client-total/{clientId}")
    public ResponseEntity<String> getTotalPaymentsByClient(@PathVariable UUID clientId) {
        UUID userId = getCurrentUserId();
        BigDecimal total = paymentService.getTotalPaymentsByClient(userId, clientId);
        return ResponseEntity.ok(total.toString());
    }
}