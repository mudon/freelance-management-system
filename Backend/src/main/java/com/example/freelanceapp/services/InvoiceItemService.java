package com.example.freelanceapp.services;

import com.example.freelanceapp.dtos.invoice.InvoiceItemRequest;
import com.example.freelanceapp.dtos.invoice.InvoiceItemResponse;
import com.example.freelanceapp.entities.Invoice;
import com.example.freelanceapp.entities.InvoiceItem;
import com.example.freelanceapp.exceptions.BadRequestException;
import com.example.freelanceapp.exceptions.NotFoundException;
import com.example.freelanceapp.repositories.InvoiceItemRepository;
import com.example.freelanceapp.repositories.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceItemService {

    private final InvoiceItemRepository invoiceItemRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceService invoiceService;

    // Map Entity to Response DTO
    private InvoiceItemResponse mapToResponse(InvoiceItem item) {
        return new InvoiceItemResponse(
            item.getId(),
            item.getInvoice().getId(),
            item.getDescription(),
            item.getQuantity(),
            item.getUnitPrice(),
            item.getTaxRate(),
            item.getDiscount(),
            item.getTotal(),
            item.getSortOrder(),
            item.getCreatedAt()
        );
    }

    // Calculate item total
    private BigDecimal calculateItemTotal(BigDecimal quantity, BigDecimal unitPrice, 
                                         BigDecimal taxRate, BigDecimal discount) {
        BigDecimal subtotal = quantity.multiply(unitPrice);
        BigDecimal discountAmount = subtotal.multiply(discount.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
        BigDecimal amountAfterDiscount = subtotal.subtract(discountAmount);
        BigDecimal taxAmount = amountAfterDiscount.multiply(taxRate.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
        return amountAfterDiscount.add(taxAmount);
    }

    // Add item to invoice
    @Transactional
    public InvoiceItemResponse addInvoiceItem(UUID userId, UUID invoiceId, InvoiceItemRequest request) {
        Invoice invoice = invoiceRepository.findByIdAndUserId(invoiceId, userId)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        
        // Validate invoice status (only draft invoices can be modified)
        if (!"draft".equals(invoice.getStatus())) {
            throw new BadRequestException("Cannot add items to a non-draft invoice");
        }
        
        InvoiceItem invoiceItem = new InvoiceItem();
        invoiceItem.setInvoice(invoice);
        invoiceItem.setDescription(request.getDescription());
        invoiceItem.setQuantity(request.getQuantity() != null ? request.getQuantity() : BigDecimal.ONE);
        invoiceItem.setUnitPrice(request.getUnitPrice() != null ? request.getUnitPrice() : BigDecimal.ZERO);
        invoiceItem.setTaxRate(request.getTaxRate() != null ? request.getTaxRate() : BigDecimal.ZERO);
        invoiceItem.setDiscount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO);
        invoiceItem.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        
        // Calculate item total
        BigDecimal itemTotal = calculateItemTotal(
            invoiceItem.getQuantity(),
            invoiceItem.getUnitPrice(),
            invoiceItem.getTaxRate(),
            invoiceItem.getDiscount()
        );
        invoiceItem.setTotal(itemTotal);
        
        InvoiceItem savedItem = invoiceItemRepository.save(invoiceItem);
        
        // Update invoice totals
        invoiceService.updateInvoiceTotals(invoice);
        
        return mapToResponse(savedItem);
    }

    // Update invoice item
    @Transactional
    public InvoiceItemResponse updateInvoiceItem(UUID userId, UUID invoiceId, UUID itemId, InvoiceItemRequest request) {
        // Verify invoice belongs to user
        Invoice invoice = invoiceRepository.findByIdAndUserId(invoiceId, userId)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        
        // Validate invoice status (only draft invoices can be modified)
        if (!"draft".equals(invoice.getStatus())) {
            throw new BadRequestException("Cannot modify items in a non-draft invoice");
        }
        
        InvoiceItem invoiceItem = invoiceItemRepository.findById(itemId)
            .orElseThrow(() -> new NotFoundException("Invoice item not found"));
        
        // Verify item belongs to the invoice
        if (!invoiceItem.getInvoice().getId().equals(invoiceId)) {
            throw new BadRequestException("Invoice item does not belong to the specified invoice");
        }
        
        // Update fields
        if (request.getDescription() != null) {
            invoiceItem.setDescription(request.getDescription());
        }
        if (request.getQuantity() != null) {
            invoiceItem.setQuantity(request.getQuantity());
        }
        if (request.getUnitPrice() != null) {
            invoiceItem.setUnitPrice(request.getUnitPrice());
        }
        if (request.getTaxRate() != null) {
            invoiceItem.setTaxRate(request.getTaxRate());
        }
        if (request.getDiscount() != null) {
            invoiceItem.setDiscount(request.getDiscount());
        }
        if (request.getSortOrder() != null) {
            invoiceItem.setSortOrder(request.getSortOrder());
        }
        
        // Recalculate item total
        BigDecimal itemTotal = calculateItemTotal(
            invoiceItem.getQuantity(),
            invoiceItem.getUnitPrice(),
            invoiceItem.getTaxRate(),
            invoiceItem.getDiscount()
        );
        invoiceItem.setTotal(itemTotal);
        
        InvoiceItem updatedItem = invoiceItemRepository.save(invoiceItem);
        
        // Update invoice totals
        invoiceService.updateInvoiceTotals(invoice);
        
        return mapToResponse(updatedItem);
    }

    // Delete invoice item
    @Transactional
    public void deleteInvoiceItem(UUID userId, UUID invoiceId, UUID itemId) {
        // Verify invoice belongs to user
        Invoice invoice = invoiceRepository.findByIdAndUserId(invoiceId, userId)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        
        // Validate invoice status (only draft invoices can be modified)
        if (!"draft".equals(invoice.getStatus())) {
            throw new BadRequestException("Cannot delete items from a non-draft invoice");
        }
        
        InvoiceItem invoiceItem = invoiceItemRepository.findById(itemId)
            .orElseThrow(() -> new NotFoundException("Invoice item not found"));
        
        // Verify item belongs to the invoice
        if (!invoiceItem.getInvoice().getId().equals(invoiceId)) {
            throw new BadRequestException("Invoice item does not belong to the specified invoice");
        }
        
        invoiceItemRepository.delete(invoiceItem);
        
        // Update invoice totals
        invoiceService.updateInvoiceTotals(invoice);
    }

    // Get all items for an invoice
    public List<InvoiceItemResponse> getInvoiceItems(UUID userId, UUID invoiceId) {
        // Verify invoice belongs to user
        invoiceRepository.findByIdAndUserId(invoiceId, userId)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        
        return invoiceItemRepository.findByInvoiceId(invoiceId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get invoice item by ID
    public InvoiceItemResponse getInvoiceItemById(UUID userId, UUID invoiceId, UUID itemId) {
        // Verify invoice belongs to user
        invoiceRepository.findByIdAndUserId(invoiceId, userId)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        
        InvoiceItem invoiceItem = invoiceItemRepository.findById(itemId)
            .orElseThrow(() -> new NotFoundException("Invoice item not found"));
        
        // Verify item belongs to the invoice
        if (!invoiceItem.getInvoice().getId().equals(invoiceId)) {
            throw new BadRequestException("Invoice item does not belong to the specified invoice");
        }
        
        return mapToResponse(invoiceItem);
    }

    // Reorder invoice items
    @Transactional
    public void reorderInvoiceItems(UUID userId, UUID invoiceId, List<UUID> itemIdsInOrder) {
        // Verify invoice belongs to user
        Invoice invoice = invoiceRepository.findByIdAndUserId(invoiceId, userId)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        
        // Validate invoice status (only draft invoices can be modified)
        if (!"draft".equals(invoice.getStatus())) {
            throw new BadRequestException("Cannot reorder items in a non-draft invoice");
        }
        
        List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(invoiceId);
        
        // Create a map for quick lookup
        java.util.Map<UUID, InvoiceItem> itemMap = items.stream()
            .collect(Collectors.toMap(InvoiceItem::getId, item -> item));
        
        // Update sort order based on provided order
        for (int i = 0; i < itemIdsInOrder.size(); i++) {
            UUID itemId = itemIdsInOrder.get(i);
            InvoiceItem item = itemMap.get(itemId);
            if (item != null) {
                item.setSortOrder(i);
                invoiceItemRepository.save(item);
            }
        }
    }
}