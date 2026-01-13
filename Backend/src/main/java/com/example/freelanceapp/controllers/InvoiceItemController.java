package com.example.freelanceapp.controllers;

import com.example.freelanceapp.dtos.invoice.InvoiceItemRequest;
import com.example.freelanceapp.dtos.invoice.InvoiceItemResponse;
import com.example.freelanceapp.entities.User;
import com.example.freelanceapp.repositories.UserRepository;
import com.example.freelanceapp.services.InvoiceItemService;
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
@RequestMapping("/api/user/client/project/quote/invoices/{invoiceId}/items")
@RequiredArgsConstructor
public class InvoiceItemController {

    private final InvoiceItemService invoiceItemService;
    private final UserRepository userRepository; // inject repository

    // Helper method to get current user ID
    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));
        return user.getId();
    }

    // Add item to invoice
    @PostMapping
    public ResponseEntity<InvoiceItemResponse> addInvoiceItem(
            @PathVariable UUID invoiceId,
            @Valid @RequestBody InvoiceItemRequest request) {
        UUID userId = getCurrentUserId();
        InvoiceItemResponse response = invoiceItemService.addInvoiceItem(userId, invoiceId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get all items for an invoice
    @GetMapping
    public ResponseEntity<List<InvoiceItemResponse>> getInvoiceItems(@PathVariable UUID invoiceId) {
        UUID userId = getCurrentUserId();
        List<InvoiceItemResponse> items = invoiceItemService.getInvoiceItems(userId, invoiceId);
        return ResponseEntity.ok(items);
    }

    // Get invoice item by ID
    @GetMapping("/{itemId}")
    public ResponseEntity<InvoiceItemResponse> getInvoiceItemById(
            @PathVariable UUID invoiceId,
            @PathVariable UUID itemId) {
        UUID userId = getCurrentUserId();
        InvoiceItemResponse item = invoiceItemService.getInvoiceItemById(userId, invoiceId, itemId);
        return ResponseEntity.ok(item);
    }

    // Update invoice item
    @PutMapping("/{itemId}")
    public ResponseEntity<InvoiceItemResponse> updateInvoiceItem(
            @PathVariable UUID invoiceId,
            @PathVariable UUID itemId,
            @Valid @RequestBody InvoiceItemRequest request) {
        UUID userId = getCurrentUserId();
        InvoiceItemResponse updatedItem = invoiceItemService.updateInvoiceItem(userId, invoiceId, itemId, request);
        return ResponseEntity.ok(updatedItem);
    }

    // Delete invoice item
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> deleteInvoiceItem(
            @PathVariable UUID invoiceId,
            @PathVariable UUID itemId) {
        UUID userId = getCurrentUserId();
        invoiceItemService.deleteInvoiceItem(userId, invoiceId, itemId);
        return ResponseEntity.noContent().build();
    }

    // Reorder invoice items
    @PostMapping("/reorder")
    public ResponseEntity<Void> reorderInvoiceItems(
            @PathVariable UUID invoiceId,
            @RequestBody List<UUID> itemIdsInOrder) {
        UUID userId = getCurrentUserId();
        invoiceItemService.reorderInvoiceItems(userId, invoiceId, itemIdsInOrder);
        return ResponseEntity.noContent().build();
    }
}