package com.example.freelanceapp.controllers;

import com.example.freelanceapp.dtos.invoice.*;
import com.example.freelanceapp.entities.User;
import com.example.freelanceapp.repositories.UserRepository;
import com.example.freelanceapp.services.InvoiceService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/user/client/project/quote/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final UserRepository userRepository; // inject repository

    // Helper method to get current user ID
    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));
        return user.getId();
    }

    // Helper method to get client info from request
    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null) {
            return xfHeader.split(",")[0];
        }
        return request.getRemoteAddr();
    }

    // Create a new invoice
    @PostMapping
    public ResponseEntity<InvoiceResponse> createInvoice(
            @Valid @RequestBody InvoiceRequest request) {
        UUID userId = getCurrentUserId();
        InvoiceResponse response = invoiceService.createInvoice(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Create invoice from quote
    @PostMapping("/from-quote/{quoteId}")
    public ResponseEntity<InvoiceResponse> createInvoiceFromQuote(
            @PathVariable UUID quoteId,
            @RequestBody(required = false) InvoiceRequest request) {
        UUID userId = getCurrentUserId();
        InvoiceResponse response = invoiceService.createInvoiceFromQuote(userId, quoteId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get all invoices
    @GetMapping
    public ResponseEntity<List<InvoiceResponse>> getAllInvoices() {
        UUID userId = getCurrentUserId();
        List<InvoiceResponse> invoices = invoiceService.getAllInvoices(userId);
        return ResponseEntity.ok(invoices);
    }

    // Get all invoices with pagination
    @GetMapping("/paginated")
    public ResponseEntity<Page<InvoiceResponse>> getAllInvoicesPaginated(Pageable pageable) {
        UUID userId = getCurrentUserId();
        Page<InvoiceResponse> invoices = invoiceService.getAllInvoices(userId, pageable);
        return ResponseEntity.ok(invoices);
    }

    // Get invoice by ID
    @GetMapping("/{invoiceId}")
    public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable UUID invoiceId) {
        UUID userId = getCurrentUserId();
        InvoiceResponse invoice = invoiceService.getInvoiceById(userId, invoiceId);
        return ResponseEntity.ok(invoice);
    }

    // Update invoice
    @PutMapping("/{invoiceId}")
    public ResponseEntity<InvoiceResponse> updateInvoice(
            @PathVariable UUID invoiceId,
            @Valid @RequestBody InvoiceRequest request) {
        UUID userId = getCurrentUserId();
        InvoiceResponse updatedInvoice = invoiceService.updateInvoice(userId, invoiceId, request);
        return ResponseEntity.ok(updatedInvoice);
    }

    // Delete invoice
    @DeleteMapping("/{invoiceId}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable UUID invoiceId) {
        UUID userId = getCurrentUserId();
        invoiceService.deleteInvoice(userId, invoiceId);
        return ResponseEntity.noContent().build();
    }

    // Send invoice
    @PostMapping("/{invoiceId}/send")
    public ResponseEntity<InvoiceResponse> sendInvoice(@PathVariable UUID invoiceId) {
        UUID userId = getCurrentUserId();
        InvoiceResponse sentInvoice = invoiceService.sendInvoice(userId, invoiceId);
        return ResponseEntity.ok(sentInvoice);
    }

    // Cancel invoice
    @PostMapping("/{invoiceId}/cancel")
    public ResponseEntity<InvoiceResponse> cancelInvoice(@PathVariable UUID invoiceId) {
        UUID userId = getCurrentUserId();
        InvoiceResponse cancelledInvoice = invoiceService.cancelInvoice(userId, invoiceId);
        return ResponseEntity.ok(cancelledInvoice);
    }

    // Duplicate invoice
    @PostMapping("/{invoiceId}/duplicate")
    public ResponseEntity<InvoiceResponse> duplicateInvoice(@PathVariable UUID invoiceId) {
        UUID userId = getCurrentUserId();
        InvoiceResponse duplicatedInvoice = invoiceService.duplicateInvoice(userId, invoiceId);
        return ResponseEntity.ok(duplicatedInvoice);
    }

    // Get invoices by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<InvoiceResponse>> getInvoicesByStatus(@PathVariable String status) {
        UUID userId = getCurrentUserId();
        List<InvoiceResponse> invoices = invoiceService.getInvoicesByStatus(userId, status);
        return ResponseEntity.ok(invoices);
    }

    // Get invoices by client
    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<InvoiceResponse>> getInvoicesByClient(@PathVariable UUID clientId) {
        UUID userId = getCurrentUserId();
        List<InvoiceResponse> invoices = invoiceService.getInvoicesByClient(userId, clientId);
        return ResponseEntity.ok(invoices);
    }

    // Get invoices by project
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<InvoiceResponse>> getInvoicesByProject(@PathVariable UUID projectId) {
        UUID userId = getCurrentUserId();
        List<InvoiceResponse> invoices = invoiceService.getInvoicesByProject(userId, projectId);
        return ResponseEntity.ok(invoices);
    }

    // Get invoices by quote
    @GetMapping("/quote/{quoteId}")
    public ResponseEntity<List<InvoiceResponse>> getInvoicesByQuote(@PathVariable UUID quoteId) {
        UUID userId = getCurrentUserId();
        List<InvoiceResponse> invoices = invoiceService.getInvoicesByQuote(userId, quoteId);
        return ResponseEntity.ok(invoices);
    }

    // Search invoices
    @GetMapping("/search")
    public ResponseEntity<List<InvoiceResponse>> searchInvoices(@RequestParam String query) {
        UUID userId = getCurrentUserId();
        List<InvoiceResponse> invoices = invoiceService.searchInvoices(userId, query);
        return ResponseEntity.ok(invoices);
    }

    // Get invoice summary
    @GetMapping("/{invoiceId}/summary")
    public ResponseEntity<InvoiceSummaryResponse> getInvoiceSummary(@PathVariable UUID invoiceId) {
        UUID userId = getCurrentUserId();
        InvoiceSummaryResponse summary = invoiceService.getInvoiceSummary(userId, invoiceId);
        return ResponseEntity.ok(summary);
    }

    // Get invoice aging report
    @GetMapping("/aging-report")
    public ResponseEntity<List<InvoiceAgingResponse>> getInvoiceAgingReport() {
        UUID userId = getCurrentUserId();
        List<InvoiceAgingResponse> agingReport = invoiceService.getInvoiceAgingReport(userId);
        return ResponseEntity.ok(agingReport);
    }

    // Get overdue invoices
    @GetMapping("/overdue")
    public ResponseEntity<List<InvoiceResponse>> getOverdueInvoices() {
        UUID userId = getCurrentUserId();
        List<InvoiceResponse> invoices = invoiceService.getOverdueInvoices(userId);
        return ResponseEntity.ok(invoices);
    }

    // Get invoices by due date range
    @GetMapping("/due-range")
    public ResponseEntity<List<InvoiceResponse>> getInvoicesByDueDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        UUID userId = getCurrentUserId();
        List<InvoiceResponse> invoices = invoiceService.getInvoicesByDueDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(invoices);
    }

    // Get invoices by issue date range
    @GetMapping("/issue-range")
    public ResponseEntity<List<InvoiceResponse>> getInvoicesByIssueDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        UUID userId = getCurrentUserId();
        List<InvoiceResponse> invoices = invoiceService.getInvoicesByIssueDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(invoices);
    }

    // Get invoices count
    @GetMapping("/count")
    public ResponseEntity<Long> getInvoicesCount() {
        UUID userId = getCurrentUserId();
        Long count = invoiceService.getInvoicesCount(userId);
        return ResponseEntity.ok(count);
    }

    // Get invoices count by status
    @GetMapping("/count/status/{status}")
    public ResponseEntity<Long> getInvoicesCountByStatus(@PathVariable String status) {
        UUID userId = getCurrentUserId();
        Long count = invoiceService.getInvoicesCountByStatus(userId, status);
        return ResponseEntity.ok(count);
    }

    // Get total invoiced amount
    @GetMapping("/total-invoiced")
    public ResponseEntity<String> getTotalInvoicedAmount() {
        UUID userId = getCurrentUserId();
        BigDecimal total = invoiceService.getTotalInvoicedAmount(userId);
        return ResponseEntity.ok(total.toString());
    }

    // Get total amount paid
    @GetMapping("/total-paid")
    public ResponseEntity<String> getTotalAmountPaid() {
        UUID userId = getCurrentUserId();
        BigDecimal total = invoiceService.getTotalAmountPaid(userId);
        return ResponseEntity.ok(total.toString());
    }

    // Get total balance due
    @GetMapping("/total-balance-due")
    public ResponseEntity<String> getTotalBalanceDue() {
        UUID userId = getCurrentUserId();
        BigDecimal total = invoiceService.getTotalBalanceDue(userId);
        return ResponseEntity.ok(total.toString());
    }

    // Get recent invoices
    @GetMapping("/recent")
    public ResponseEntity<List<InvoiceResponse>> getRecentInvoices(
            @RequestParam(defaultValue = "5") int limit) {
        UUID userId = getCurrentUserId();
        List<InvoiceResponse> recentInvoices = invoiceService.getRecentInvoices(userId, limit);
        return ResponseEntity.ok(recentInvoices);
    }

    // Update invoice status
    @PatchMapping("/{invoiceId}/status")
    public ResponseEntity<InvoiceResponse> updateInvoiceStatus(
            @PathVariable UUID invoiceId,
            @RequestParam String status) {
        UUID userId = getCurrentUserId();
        InvoiceResponse updatedInvoice = invoiceService.updateInvoiceStatus(userId, invoiceId, status);
        return ResponseEntity.ok(updatedInvoice);
    }

    // ========== PUBLIC ENDPOINTS (No authentication required) ==========

    // Get invoice by public hash (for client viewing)
    @GetMapping("/public/{publicHash}")
    public ResponseEntity<InvoiceResponse> getInvoiceByPublicHash(
            @PathVariable String publicHash,
            HttpServletRequest httpRequest) {
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        
        // Record view
        invoiceService.viewInvoice(publicHash);
        
        InvoiceResponse invoice = invoiceService.getInvoiceByPublicHash(publicHash);
        return ResponseEntity.ok(invoice);
    }
}