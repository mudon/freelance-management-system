package com.example.freelanceapp.services;

import com.example.freelanceapp.dtos.quote.QuoteItemRequest;
import com.example.freelanceapp.dtos.quote.QuoteItemResponse;
import com.example.freelanceapp.entities.Quote;
import com.example.freelanceapp.entities.QuoteItem;
import com.example.freelanceapp.exceptions.BadRequestException;
import com.example.freelanceapp.exceptions.NotFoundException;
import com.example.freelanceapp.repositories.QuoteItemRepository;
import com.example.freelanceapp.repositories.QuoteRepository;
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
public class QuoteItemService {

    private final QuoteItemRepository quoteItemRepository;
    private final QuoteRepository quoteRepository;
    private final QuoteService quoteService;

    // Map Entity to Response DTO
    private QuoteItemResponse mapToResponse(QuoteItem item) {
        return new QuoteItemResponse(
            item.getId(),
            item.getQuote().getId(),
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

    // Add item to quote
    @Transactional
    public QuoteItemResponse addQuoteItem(UUID userId, UUID quoteId, QuoteItemRequest request) {
        Quote quote = quoteRepository.findByIdAndUserId(quoteId, userId)
            .orElseThrow(() -> new NotFoundException("Quote not found"));
        
        // Validate quote status (only draft quotes can be modified)
        if (!"draft".equals(quote.getStatus())) {
            throw new BadRequestException("Cannot add items to a non-draft quote");
        }
        
        QuoteItem quoteItem = new QuoteItem();
        quoteItem.setQuote(quote);
        quoteItem.setDescription(request.getDescription());
        quoteItem.setQuantity(request.getQuantity() != null ? request.getQuantity() : BigDecimal.ONE);
        quoteItem.setUnitPrice(request.getUnitPrice() != null ? request.getUnitPrice() : BigDecimal.ZERO);
        quoteItem.setTaxRate(request.getTaxRate() != null ? request.getTaxRate() : BigDecimal.ZERO);
        quoteItem.setDiscount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO);
        quoteItem.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        
        // Calculate item total
        BigDecimal itemTotal = calculateItemTotal(
            quoteItem.getQuantity(),
            quoteItem.getUnitPrice(),
            quoteItem.getTaxRate(),
            quoteItem.getDiscount()
        );
        quoteItem.setTotal(itemTotal);
        
        QuoteItem savedItem = quoteItemRepository.save(quoteItem);
        
        // Update quote totals
        quoteService.updateQuoteTotals(quote);
        
        return mapToResponse(savedItem);
    }

    // Update quote item
    @Transactional
    public QuoteItemResponse updateQuoteItem(UUID userId, UUID quoteId, UUID itemId, QuoteItemRequest request) {
        // Verify quote belongs to user
        Quote quote = quoteRepository.findByIdAndUserId(quoteId, userId)
            .orElseThrow(() -> new NotFoundException("Quote not found"));
        
        // Validate quote status (only draft quotes can be modified)
        if (!"draft".equals(quote.getStatus())) {
            throw new BadRequestException("Cannot modify items in a non-draft quote");
        }
        
        QuoteItem quoteItem = quoteItemRepository.findById(itemId)
            .orElseThrow(() -> new NotFoundException("Quote item not found"));
        
        // Verify item belongs to the quote
        if (!quoteItem.getQuote().getId().equals(quoteId)) {
            throw new BadRequestException("Quote item does not belong to the specified quote");
        }
        
        // Update fields
        if (request.getDescription() != null) {
            quoteItem.setDescription(request.getDescription());
        }
        if (request.getQuantity() != null) {
            quoteItem.setQuantity(request.getQuantity());
        }
        if (request.getUnitPrice() != null) {
            quoteItem.setUnitPrice(request.getUnitPrice());
        }
        if (request.getTaxRate() != null) {
            quoteItem.setTaxRate(request.getTaxRate());
        }
        if (request.getDiscount() != null) {
            quoteItem.setDiscount(request.getDiscount());
        }
        if (request.getSortOrder() != null) {
            quoteItem.setSortOrder(request.getSortOrder());
        }
        
        // Recalculate item total
        BigDecimal itemTotal = calculateItemTotal(
            quoteItem.getQuantity(),
            quoteItem.getUnitPrice(),
            quoteItem.getTaxRate(),
            quoteItem.getDiscount()
        );
        quoteItem.setTotal(itemTotal);
        
        QuoteItem updatedItem = quoteItemRepository.save(quoteItem);
        
        // Update quote totals
        quoteService.updateQuoteTotals(quote);
        
        return mapToResponse(updatedItem);
    }

    // Delete quote item
    @Transactional
    public void deleteQuoteItem(UUID userId, UUID quoteId, UUID itemId) {
        // Verify quote belongs to user
        Quote quote = quoteRepository.findByIdAndUserId(quoteId, userId)
            .orElseThrow(() -> new NotFoundException("Quote not found"));
        
        // Validate quote status (only draft quotes can be modified)
        if (!"draft".equals(quote.getStatus())) {
            throw new BadRequestException("Cannot delete items from a non-draft quote");
        }
        
        QuoteItem quoteItem = quoteItemRepository.findById(itemId)
            .orElseThrow(() -> new NotFoundException("Quote item not found"));
        
        // Verify item belongs to the quote
        if (!quoteItem.getQuote().getId().equals(quoteId)) {
            throw new BadRequestException("Quote item does not belong to the specified quote");
        }
        
        quoteItemRepository.delete(quoteItem);
        
        // Update quote totals
        quoteService.updateQuoteTotals(quote);
    }

    // Get all items for a quote
    public List<QuoteItemResponse> getQuoteItems(UUID userId, UUID quoteId) {
        // Verify quote belongs to user
        quoteRepository.findByIdAndUserId(quoteId, userId)
            .orElseThrow(() -> new NotFoundException("Quote not found"));
        
        return quoteItemRepository.findByQuoteId(quoteId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get quote item by ID
    public QuoteItemResponse getQuoteItemById(UUID userId, UUID quoteId, UUID itemId) {
        // Verify quote belongs to user
        quoteRepository.findByIdAndUserId(quoteId, userId)
            .orElseThrow(() -> new NotFoundException("Quote not found"));
        
        QuoteItem quoteItem = quoteItemRepository.findById(itemId)
            .orElseThrow(() -> new NotFoundException("Quote item not found"));
        
        // Verify item belongs to the quote
        if (!quoteItem.getQuote().getId().equals(quoteId)) {
            throw new BadRequestException("Quote item does not belong to the specified quote");
        }
        
        return mapToResponse(quoteItem);
    }

    // Reorder quote items
    @Transactional
    public void reorderQuoteItems(UUID userId, UUID quoteId, List<UUID> itemIdsInOrder) {
        // Verify quote belongs to user
        Quote quote = quoteRepository.findByIdAndUserId(quoteId, userId)
            .orElseThrow(() -> new NotFoundException("Quote not found"));
        
        // Validate quote status (only draft quotes can be modified)
        if (!"draft".equals(quote.getStatus())) {
            throw new BadRequestException("Cannot reorder items in a non-draft quote");
        }
        
        List<QuoteItem> items = quoteItemRepository.findByQuoteId(quoteId);
        
        // Create a map for quick lookup
        java.util.Map<UUID, QuoteItem> itemMap = items.stream()
            .collect(Collectors.toMap(QuoteItem::getId, item -> item));
        
        // Update sort order based on provided order
        for (int i = 0; i < itemIdsInOrder.size(); i++) {
            UUID itemId = itemIdsInOrder.get(i);
            QuoteItem item = itemMap.get(itemId);
            if (item != null) {
                item.setSortOrder(i);
                quoteItemRepository.save(item);
            }
        }
    }
}