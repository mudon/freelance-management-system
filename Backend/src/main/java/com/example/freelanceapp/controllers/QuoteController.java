package com.example.freelanceapp.controllers;

import com.example.freelanceapp.dtos.quote.*;
import com.example.freelanceapp.entities.User;
import com.example.freelanceapp.repositories.UserRepository;
import com.example.freelanceapp.services.QuoteService;
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
@RequestMapping("/api/user/client/quotes")
@RequiredArgsConstructor
public class QuoteController {

    private final QuoteService quoteService;
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

    // Create a new quote
    @PostMapping
    public ResponseEntity<QuoteResponse> createQuote(
            @Valid @RequestBody QuoteRequest request,
            HttpServletRequest httpRequest) {
        UUID userId = getCurrentUserId();
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        
        QuoteResponse response = quoteService.createQuote(userId, request, ipAddress, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get all quotes
    @GetMapping
    public ResponseEntity<List<QuoteResponse>> getAllQuotes() {
        UUID userId = getCurrentUserId();
        List<QuoteResponse> quotes = quoteService.getAllQuotes(userId);
        return ResponseEntity.ok(quotes);
    }

    // Get all quotes with pagination
    @GetMapping("/paginated")
    public ResponseEntity<Page<QuoteResponse>> getAllQuotesPaginated(Pageable pageable) {
        UUID userId = getCurrentUserId();
        Page<QuoteResponse> quotes = quoteService.getAllQuotes(userId, pageable);
        return ResponseEntity.ok(quotes);
    }

    // Get quote by ID
    @GetMapping("/{quoteId}")
    public ResponseEntity<QuoteResponse> getQuoteById(@PathVariable UUID quoteId) {
        UUID userId = getCurrentUserId();
        QuoteResponse quote = quoteService.getQuoteById(userId, quoteId);
        return ResponseEntity.ok(quote);
    }

    // Update quote
    @PutMapping("/{quoteId}")
    public ResponseEntity<QuoteResponse> updateQuote(
            @PathVariable UUID quoteId,
            @Valid @RequestBody QuoteRequest request,
            HttpServletRequest httpRequest) {
        UUID userId = getCurrentUserId();
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        
        QuoteResponse updatedQuote = quoteService.updateQuote(userId, quoteId, request, ipAddress, userAgent);
        return ResponseEntity.ok(updatedQuote);
    }

    // Delete quote
    @DeleteMapping("/{quoteId}")
    public ResponseEntity<Void> deleteQuote(@PathVariable UUID quoteId) {
        UUID userId = getCurrentUserId();
        quoteService.deleteQuote(userId, quoteId);
        return ResponseEntity.noContent().build();
    }

    // Send quote
    @PostMapping("/{quoteId}/send")
    public ResponseEntity<QuoteResponse> sendQuote(
            @PathVariable UUID quoteId,
            HttpServletRequest httpRequest) {
        UUID userId = getCurrentUserId();
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        
        QuoteResponse sentQuote = quoteService.sendQuote(userId, quoteId, ipAddress, userAgent);
        return ResponseEntity.ok(sentQuote);
    }

    // Duplicate quote
    @PostMapping("/{quoteId}/duplicate")
    public ResponseEntity<QuoteResponse> duplicateQuote(
            @PathVariable UUID quoteId,
            HttpServletRequest httpRequest) {
        UUID userId = getCurrentUserId();
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        
        QuoteResponse duplicatedQuote = quoteService.duplicateQuote(userId, quoteId, ipAddress, userAgent);
        return ResponseEntity.ok(duplicatedQuote);
    }

    // Get quotes by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<QuoteResponse>> getQuotesByStatus(@PathVariable String status) {
        UUID userId = getCurrentUserId();
        List<QuoteResponse> quotes = quoteService.getQuotesByStatus(userId, status);
        return ResponseEntity.ok(quotes);
    }

    // Get quotes by client
    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<QuoteResponse>> getQuotesByClient(@PathVariable UUID clientId) {
        UUID userId = getCurrentUserId();
        List<QuoteResponse> quotes = quoteService.getQuotesByClient(userId, clientId);
        return ResponseEntity.ok(quotes);
    }

    // Get quotes by project
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<QuoteResponse>> getQuotesByProject(@PathVariable UUID projectId) {
        UUID userId = getCurrentUserId();
        List<QuoteResponse> quotes = quoteService.getQuotesByProject(userId, projectId);
        return ResponseEntity.ok(quotes);
    }

    // Search quotes
    @GetMapping("/search")
    public ResponseEntity<List<QuoteResponse>> searchQuotes(@RequestParam String query) {
        UUID userId = getCurrentUserId();
        List<QuoteResponse> quotes = quoteService.searchQuotes(userId, query);
        return ResponseEntity.ok(quotes);
    }

    // Get quote summary
    @GetMapping("/{quoteId}/summary")
    public ResponseEntity<QuoteSummaryResponse> getQuoteSummary(@PathVariable UUID quoteId) {
        UUID userId = getCurrentUserId();
        QuoteSummaryResponse summary = quoteService.getQuoteSummary(userId, quoteId);
        return ResponseEntity.ok(summary);
    }

    // Get quote history
    @GetMapping("/{quoteId}/history")
    public ResponseEntity<List<QuoteHistoryResponse>> getQuoteHistory(@PathVariable UUID quoteId) {
        UUID userId = getCurrentUserId();
        List<QuoteHistoryResponse> history = quoteService.getQuoteHistory(userId, quoteId);
        return ResponseEntity.ok(history);
    }

    // Get expired quotes
    @GetMapping("/expired")
    public ResponseEntity<List<QuoteResponse>> getExpiredQuotes() {
        UUID userId = getCurrentUserId();
        List<QuoteResponse> quotes = quoteService.getExpiredQuotes(userId);
        return ResponseEntity.ok(quotes);
    }

    // Get quotes by valid until range
    @GetMapping("/valid-until-range")
    public ResponseEntity<List<QuoteResponse>> getQuotesByValidUntilRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        UUID userId = getCurrentUserId();
        List<QuoteResponse> quotes = quoteService.getQuotesByValidUntilRange(userId, startDate, endDate);
        return ResponseEntity.ok(quotes);
    }

    // Get quotes count
    @GetMapping("/count")
    public ResponseEntity<Long> getQuotesCount() {
        UUID userId = getCurrentUserId();
        Long count = quoteService.getQuotesCount(userId);
        return ResponseEntity.ok(count);
    }

    // Get quotes count by status
    @GetMapping("/count/status/{status}")
    public ResponseEntity<Long> getQuotesCountByStatus(@PathVariable String status) {
        UUID userId = getCurrentUserId();
        Long count = quoteService.getQuotesCountByStatus(userId, status);
        return ResponseEntity.ok(count);
    }

    // Get accepted quotes total amount
    @GetMapping("/accepted-total")
    public ResponseEntity<String> getAcceptedQuotesTotal() {
        UUID userId = getCurrentUserId();
        BigDecimal total = quoteService.getAcceptedQuotesTotal(userId);
        return ResponseEntity.ok(total.toString());
    }

    // Get recent quotes
    @GetMapping("/recent")
    public ResponseEntity<List<QuoteResponse>> getRecentQuotes(
            @RequestParam(defaultValue = "5") int limit) {
        UUID userId = getCurrentUserId();
        List<QuoteResponse> recentQuotes = quoteService.getRecentQuotes(userId, limit);
        return ResponseEntity.ok(recentQuotes);
    }

    // Update quote status
    @PatchMapping("/{quoteId}/status")
    public ResponseEntity<QuoteResponse> updateQuoteStatus(
            @PathVariable UUID quoteId,
            @RequestParam String status) {
        UUID userId = getCurrentUserId();
        QuoteResponse updatedQuote = quoteService.updateQuoteStatus(userId, quoteId, status);
        return ResponseEntity.ok(updatedQuote);
    }

    // ========== PUBLIC ENDPOINTS (No authentication required) ==========

    // Get quote by public hash (for client viewing)
    @GetMapping("/public/{publicHash}")
    public ResponseEntity<QuoteResponse> getQuoteByPublicHash(
            @PathVariable String publicHash,
            HttpServletRequest httpRequest) {
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        
        // Record view
        quoteService.viewQuote(publicHash, ipAddress, userAgent);
        
        QuoteResponse quote = quoteService.getQuoteByPublicHash(publicHash);
        return ResponseEntity.ok(quote);
    }

    // Accept quote (for client action)
    @PostMapping("/public/{publicHash}/accept")
    public ResponseEntity<QuoteResponse> acceptQuote(
            @PathVariable String publicHash,
            HttpServletRequest httpRequest) {
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        
        QuoteResponse acceptedQuote = quoteService.acceptQuote(publicHash, ipAddress, userAgent);
        return ResponseEntity.ok(acceptedQuote);
    }

    // Reject quote (for client action)
    @PostMapping("/public/{publicHash}/reject")
    public ResponseEntity<QuoteResponse> rejectQuote(
            @PathVariable String publicHash,
            HttpServletRequest httpRequest) {
        String ipAddress = getClientIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");
        
        QuoteResponse rejectedQuote = quoteService.rejectQuote(publicHash, ipAddress, userAgent);
        return ResponseEntity.ok(rejectedQuote);
    }
}