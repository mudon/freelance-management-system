package com.example.freelanceapp.controllers;

import com.example.freelanceapp.dtos.quote.QuoteItemRequest;
import com.example.freelanceapp.dtos.quote.QuoteItemResponse;
import com.example.freelanceapp.entities.User;
import com.example.freelanceapp.repositories.UserRepository;
import com.example.freelanceapp.services.QuoteItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/user/client/quotes/{quoteId}/items")
@RequiredArgsConstructor
public class QuoteItemController {

    private final QuoteItemService quoteItemService;
    private final UserRepository userRepository; // inject repository

    // Helper method to get current user ID
    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));
        return user.getId();
    }

    // Add item to quote
    @PostMapping
    public ResponseEntity<QuoteItemResponse> addQuoteItem(
            @PathVariable UUID quoteId,
            @Valid @RequestBody QuoteItemRequest request) {
        UUID userId = getCurrentUserId();
        QuoteItemResponse response = quoteItemService.addQuoteItem(userId, quoteId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get all items for a quote
    @GetMapping
    public ResponseEntity<List<QuoteItemResponse>> getQuoteItems(@PathVariable UUID quoteId) {
        UUID userId = getCurrentUserId();
        List<QuoteItemResponse> items = quoteItemService.getQuoteItems(userId, quoteId);
        return ResponseEntity.ok(items);
    }

    // Get quote item by ID
    @GetMapping("/{itemId}")
    public ResponseEntity<QuoteItemResponse> getQuoteItemById(
            @PathVariable UUID quoteId,
            @PathVariable UUID itemId) {
        UUID userId = getCurrentUserId();
        QuoteItemResponse item = quoteItemService.getQuoteItemById(userId, quoteId, itemId);
        return ResponseEntity.ok(item);
    }

    // Update quote item
    @PutMapping("/{itemId}")
    public ResponseEntity<QuoteItemResponse> updateQuoteItem(
            @PathVariable UUID quoteId,
            @PathVariable UUID itemId,
            @Valid @RequestBody QuoteItemRequest request) {
        UUID userId = getCurrentUserId();
        QuoteItemResponse updatedItem = quoteItemService.updateQuoteItem(userId, quoteId, itemId, request);
        return ResponseEntity.ok(updatedItem);
    }

    // Delete quote item
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteQuoteItem(
            @PathVariable UUID quoteId,
            @PathVariable UUID itemId) {
        UUID userId = getCurrentUserId();
        quoteItemService.deleteQuoteItem(userId, quoteId, itemId);
        return ResponseEntity.noContent().build();
    }

    // Reorder quote items
    @PostMapping("/reorder")
    public ResponseEntity<Void> reorderQuoteItems(
            @PathVariable UUID quoteId,
            @RequestBody List<UUID> itemIdsInOrder) {
        UUID userId = getCurrentUserId();
        quoteItemService.reorderQuoteItems(userId, quoteId, itemIdsInOrder);
        return ResponseEntity.noContent().build();
    }
}