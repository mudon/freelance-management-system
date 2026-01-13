package com.example.freelanceapp.services;

import com.example.freelanceapp.dtos.quote.*;
import com.example.freelanceapp.entities.*;
import com.example.freelanceapp.exceptions.BadRequestException;
import com.example.freelanceapp.exceptions.NotFoundException;
import com.example.freelanceapp.repositories.*;
import com.example.freelanceapp.utils.NumberGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuoteService {

    private final QuoteRepository quoteRepository;
    private final QuoteItemRepository quoteItemRepository;
    private final QuoteHistoryRepository quoteHistoryRepository;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final NumberGenerator numberGenerator;

    // Map Entity to Response DTO
    private QuoteResponse mapToResponse(Quote quote) {
        List<QuoteItem> items = quoteItemRepository.findByQuoteId(quote.getId());
        List<QuoteItemResponse> itemResponses = items.stream()
            .map(this::mapItemToResponse)
            .collect(Collectors.toList());

        return new QuoteResponse(
            quote.getId(),
            quote.getUser().getId(),
            quote.getClient().getId(),
            quote.getClient().getCompanyName() != null ? 
                quote.getClient().getCompanyName() : quote.getClient().getContactName(),
            quote.getProject() != null ? quote.getProject().getId() : null,
            quote.getProject() != null ? quote.getProject().getName() : null,
            quote.getQuoteNumber(),
            quote.getTitle(),
            quote.getSummary(),
            quote.getStatus(),
            quote.getValidUntil(),
            quote.getTermsAndConditions(),
            quote.getNotes(),
            quote.getSubtotal(),
            quote.getTaxAmount(),
            quote.getDiscountAmount(),
            quote.getTotalAmount(),
            quote.getCurrency(),
            quote.getSentAt(),
            quote.getAcceptedAt(),
            quote.getViewedAt(),
            quote.getPdfUrl(),
            quote.getPublicHash(),
            quote.getCreatedAt(),
            quote.getUpdatedAt(),
            itemResponses
        );
    }

    private QuoteItemResponse mapItemToResponse(QuoteItem item) {
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

    // Map Request to Entity
    private Quote mapToEntity(QuoteRequest request, User user, Client client, Project project) {
        Quote quote = new Quote();
        quote.setUser(user);
        quote.setClient(client);
        quote.setProject(project);
        quote.setTitle(request.getTitle());
        quote.setSummary(request.getSummary());
        quote.setStatus(request.getStatus() != null ? request.getStatus() : "draft");
        quote.setValidUntil(request.getValidUntil());
        quote.setTermsAndConditions(request.getTermsAndConditions());
        quote.setNotes(request.getNotes());
        quote.setTaxAmount(request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO);
        quote.setDiscountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO);
        quote.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");
        
        // Generate public hash for shareable links
        quote.setPublicHash(UUID.randomUUID().toString().replace("-", ""));
        
        return quote;
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

    // Add quote history entry
    private void addQuoteHistory(Quote quote, String action, String description, 
                                String ipAddress, String userAgent) {
        QuoteHistory history = new QuoteHistory();
        history.setQuote(quote);
        history.setAction(action);
        history.setDescription(description);
        history.setIpAddress(ipAddress);
        history.setUserAgent(userAgent);
        history.setMetadata("{}");
        quoteHistoryRepository.save(history);
    }

    // Create a new quote
    @Transactional
    public QuoteResponse createQuote(UUID userId, QuoteRequest request, 
                                    String ipAddress, String userAgent) {
        // Find user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found"));

        // Find client
        UUID clientId;
        try {
            clientId = UUID.fromString(request.getClientId());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid client ID format");
        }
        
        Client client = clientRepository.findByIdAndUserId(clientId, userId)
            .orElseThrow(() -> new NotFoundException("Client not found or not authorized"));

        // Find project if provided
        Project project = null;
        if (request.getProjectId() != null && !request.getProjectId().isEmpty()) {
            try {
                UUID projectId = UUID.fromString(request.getProjectId());
                project = projectRepository.findByIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new NotFoundException("Project not found or not authorized"));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid project ID format");
            }
        }

        // Create quote
        Quote quote = mapToEntity(request, user, client, project);
        
        // Calculate initial totals (will be updated with items)
        quote.setSubtotal(BigDecimal.ZERO);
        quote.setTotalAmount(BigDecimal.ZERO);
        
        Quote savedQuote = quoteRepository.save(quote);
        
        // Add quote items if provided
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            List<QuoteItem> quoteItems = new ArrayList<>();
            for (int i = 0; i < request.getItems().size(); i++) {
                QuoteItemRequest itemRequest = request.getItems().get(i);
                QuoteItem quoteItem = new QuoteItem();
                quoteItem.setQuote(savedQuote);
                quoteItem.setDescription(itemRequest.getDescription());
                quoteItem.setQuantity(itemRequest.getQuantity() != null ? itemRequest.getQuantity() : BigDecimal.ONE);
                quoteItem.setUnitPrice(itemRequest.getUnitPrice() != null ? itemRequest.getUnitPrice() : BigDecimal.ZERO);
                quoteItem.setTaxRate(itemRequest.getTaxRate() != null ? itemRequest.getTaxRate() : BigDecimal.ZERO);
                quoteItem.setDiscount(itemRequest.getDiscount() != null ? itemRequest.getDiscount() : BigDecimal.ZERO);
                quoteItem.setSortOrder(itemRequest.getSortOrder() != null ? itemRequest.getSortOrder() : i);
                
                // Calculate item total
                BigDecimal itemTotal = calculateItemTotal(
                    quoteItem.getQuantity(),
                    quoteItem.getUnitPrice(),
                    quoteItem.getTaxRate(),
                    quoteItem.getDiscount()
                );
                quoteItem.setTotal(itemTotal);
                
                quoteItems.add(quoteItem);
            }
            
            List<QuoteItem> savedItems = quoteItemRepository.saveAll(quoteItems);
            
            // Calculate and update quote totals
            updateQuoteTotals(savedQuote);
        }
        
        // Add history entry
        addQuoteHistory(savedQuote, "created", "Quote created", ipAddress, userAgent);
        
        return mapToResponse(savedQuote);
    }

    // Update quote totals
    @Transactional
    public void updateQuoteTotals(Quote quote) {
        BigDecimal subtotal = quoteItemRepository.calculateSubtotalByQuoteId(quote.getId());
        if (subtotal == null) {
            subtotal = BigDecimal.ZERO;
        }
        
        BigDecimal totalAmount = subtotal
            .add(quote.getTaxAmount() != null ? quote.getTaxAmount() : BigDecimal.ZERO)
            .subtract(quote.getDiscountAmount() != null ? quote.getDiscountAmount() : BigDecimal.ZERO);
        
        quote.setSubtotal(subtotal);
        quote.setTotalAmount(totalAmount);
        quoteRepository.save(quote);
    }

    // Get quote by ID
    public QuoteResponse getQuoteById(UUID userId, UUID quoteId) {
        Quote quote = quoteRepository.findByIdAndUserId(quoteId, userId)
            .orElseThrow(() -> new NotFoundException("Quote not found"));
        return mapToResponse(quote);
    }

    // Get quote by public hash (for public viewing)
    public QuoteResponse getQuoteByPublicHash(String publicHash) {
        Quote quote = quoteRepository.findByPublicHash(publicHash)
            .orElseThrow(() -> new NotFoundException("Quote not found"));
        return mapToResponse(quote);
    }

    // Get all quotes for a user
    public List<QuoteResponse> getAllQuotes(UUID userId) {
        return quoteRepository.findByUserId(userId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get all quotes with pagination
    public Page<QuoteResponse> getAllQuotes(UUID userId, Pageable pageable) {
        return quoteRepository.findByUserId(userId, pageable)
            .map(this::mapToResponse);
    }

    // Get quotes by status
    public List<QuoteResponse> getQuotesByStatus(UUID userId, String status) {
        return quoteRepository.findByUserIdAndStatus(userId, status).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get quotes by client
    public List<QuoteResponse> getQuotesByClient(UUID userId, UUID clientId) {
        // Verify client belongs to user
        clientRepository.findByIdAndUserId(clientId, userId)
            .orElseThrow(() -> new NotFoundException("Client not found"));
            
        return quoteRepository.findByClientId(clientId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get quotes by project
    public List<QuoteResponse> getQuotesByProject(UUID userId, UUID projectId) {
        // Verify project belongs to user
        projectRepository.findByIdAndUserId(projectId, userId)
            .orElseThrow(() -> new NotFoundException("Project not found"));
            
        return quoteRepository.findByProjectId(projectId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Update quote
    @Transactional
    public QuoteResponse updateQuote(UUID userId, UUID quoteId, QuoteRequest request,
                                    String ipAddress, String userAgent) {
        Quote quote = quoteRepository.findByIdAndUserId(quoteId, userId)
            .orElseThrow(() -> new NotFoundException("Quote not found"));

        // Update client if provided
        if (request.getClientId() != null) {
            UUID clientId;
            try {
                clientId = UUID.fromString(request.getClientId());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid client ID format");
            }
            
            Client client = clientRepository.findByIdAndUserId(clientId, userId)
                .orElseThrow(() -> new NotFoundException("Client not found"));
            quote.setClient(client);
        }

        // Update project if provided
        if (request.getProjectId() != null && !request.getProjectId().isEmpty()) {
            try {
                UUID projectId = UUID.fromString(request.getProjectId());
                Project project = projectRepository.findByIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new NotFoundException("Project not found"));
                quote.setProject(project);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid project ID format");
            }
        } else if (request.getProjectId() != null && request.getProjectId().isEmpty()) {
            quote.setProject(null);
        }

        // Update fields
        if (request.getTitle() != null) {
            quote.setTitle(request.getTitle());
        }
        if (request.getSummary() != null) {
            quote.setSummary(request.getSummary());
        }
        if (request.getStatus() != null) {
            quote.setStatus(request.getStatus());
        }
        if (request.getValidUntil() != null) {
            quote.setValidUntil(request.getValidUntil());
        }
        if (request.getTermsAndConditions() != null) {
            quote.setTermsAndConditions(request.getTermsAndConditions());
        }
        if (request.getNotes() != null) {
            quote.setNotes(request.getNotes());
        }
        if (request.getTaxAmount() != null) {
            quote.setTaxAmount(request.getTaxAmount());
        }
        if (request.getDiscountAmount() != null) {
            quote.setDiscountAmount(request.getDiscountAmount());
        }
        if (request.getCurrency() != null) {
            quote.setCurrency(request.getCurrency());
        }

        // Update quote items if provided
        if (request.getItems() != null) {
            // Delete existing items
            quoteItemRepository.deleteByQuoteId(quoteId);
            
            // Add new items
            List<QuoteItem> quoteItems = new ArrayList<>();
            for (int i = 0; i < request.getItems().size(); i++) {
                QuoteItemRequest itemRequest = request.getItems().get(i);
                QuoteItem quoteItem = new QuoteItem();
                quoteItem.setQuote(quote);
                quoteItem.setDescription(itemRequest.getDescription());
                quoteItem.setQuantity(itemRequest.getQuantity() != null ? itemRequest.getQuantity() : BigDecimal.ONE);
                quoteItem.setUnitPrice(itemRequest.getUnitPrice() != null ? itemRequest.getUnitPrice() : BigDecimal.ZERO);
                quoteItem.setTaxRate(itemRequest.getTaxRate() != null ? itemRequest.getTaxRate() : BigDecimal.ZERO);
                quoteItem.setDiscount(itemRequest.getDiscount() != null ? itemRequest.getDiscount() : BigDecimal.ZERO);
                quoteItem.setSortOrder(itemRequest.getSortOrder() != null ? itemRequest.getSortOrder() : i);
                
                // Calculate item total
                BigDecimal itemTotal = calculateItemTotal(
                    quoteItem.getQuantity(),
                    quoteItem.getUnitPrice(),
                    quoteItem.getTaxRate(),
                    quoteItem.getDiscount()
                );
                quoteItem.setTotal(itemTotal);
                
                quoteItems.add(quoteItem);
            }
            
            quoteItemRepository.saveAll(quoteItems);
        }

        // Update totals
        updateQuoteTotals(quote);
        
        Quote updatedQuote = quoteRepository.save(quote);
        
        // Add history entry
        addQuoteHistory(updatedQuote, "updated", "Quote updated", ipAddress, userAgent);
        
        return mapToResponse(updatedQuote);
    }

    // Delete quote
    @Transactional
    public void deleteQuote(UUID userId, UUID quoteId) {
        Quote quote = quoteRepository.findByIdAndUserId(quoteId, userId)
            .orElseThrow(() -> new NotFoundException("Quote not found"));
        
        // Check if quote can be deleted (only drafts can be deleted)
        if (!"draft".equals(quote.getStatus())) {
            throw new BadRequestException("Only draft quotes can be deleted");
        }
        
        quoteRepository.delete(quote);
    }

    // Send quote (change status to sent)
    @Transactional
    public QuoteResponse sendQuote(UUID userId, UUID quoteId, 
                                  String ipAddress, String userAgent) {
        Quote quote = quoteRepository.findByIdAndUserId(quoteId, userId)
            .orElseThrow(() -> new NotFoundException("Quote not found"));
        
        // Validate quote can be sent
        if (!"draft".equals(quote.getStatus())) {
            throw new BadRequestException("Only draft quotes can be sent");
        }
        
        // Check if quote has items
        List<QuoteItem> items = quoteItemRepository.findByQuoteId(quoteId);
        if (items.isEmpty()) {
            throw new BadRequestException("Cannot send quote without items");
        }
        
        // Update quote status and sent time
        quote.setStatus("sent");
        quote.setSentAt(LocalDateTime.now());
        
        Quote updatedQuote = quoteRepository.save(quote);
        
        // Add history entry
        addQuoteHistory(updatedQuote, "sent", "Quote sent to client", ipAddress, userAgent);
        
        return mapToResponse(updatedQuote);
    }

    // Accept quote (from public link)
    @Transactional
    public QuoteResponse acceptQuote(String publicHash, 
                                    String ipAddress, String userAgent) {
        Quote quote = quoteRepository.findByPublicHash(publicHash)
            .orElseThrow(() -> new NotFoundException("Quote not found"));
        
        // Validate quote can be accepted
        if (!"sent".equals(quote.getStatus())) {
            throw new BadRequestException("Only sent quotes can be accepted");
        }
        
        if (quote.getValidUntil() != null && quote.getValidUntil().isBefore(LocalDate.now())) {
            throw new BadRequestException("Quote has expired");
        }
        
        // Update quote status and accepted time
        quote.setStatus("accepted");
        quote.setAcceptedAt(LocalDateTime.now());
        quote.setViewedAt(LocalDateTime.now());
        
        Quote updatedQuote = quoteRepository.save(quote);
        
        // Add history entry
        addQuoteHistory(updatedQuote, "accepted", "Quote accepted by client", ipAddress, userAgent);
        
        return mapToResponse(updatedQuote);
    }

    // Reject quote (from public link)
    @Transactional
    public QuoteResponse rejectQuote(String publicHash, 
                                    String ipAddress, String userAgent) {
        Quote quote = quoteRepository.findByPublicHash(publicHash)
            .orElseThrow(() -> new NotFoundException("Quote not found"));
        
        // Validate quote can be rejected
        if (!"sent".equals(quote.getStatus())) {
            throw new BadRequestException("Only sent quotes can be rejected");
        }
        
        // Update quote status
        quote.setStatus("rejected");
        quote.setViewedAt(LocalDateTime.now());
        
        Quote updatedQuote = quoteRepository.save(quote);
        
        // Add history entry
        addQuoteHistory(updatedQuote, "rejected", "Quote rejected by client", ipAddress, userAgent);
        
        return mapToResponse(updatedQuote);
    }

    // View quote (from public link)
    @Transactional
    public QuoteResponse viewQuote(String publicHash, 
                                  String ipAddress, String userAgent) {
        Quote quote = quoteRepository.findByPublicHash(publicHash)
            .orElseThrow(() -> new NotFoundException("Quote not found"));
        
        // Only update viewed time if not already set
        if (quote.getViewedAt() == null) {
            quote.setViewedAt(LocalDateTime.now());
            quoteRepository.save(quote);
        }
        
        // Add history entry
        addQuoteHistory(quote, "viewed", "Quote viewed by client", ipAddress, userAgent);
        
        return mapToResponse(quote);
    }

    // Search quotes
    public List<QuoteResponse> searchQuotes(UUID userId, String searchTerm) {
        return quoteRepository.searchByUser(userId, searchTerm).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get expired quotes
    public List<QuoteResponse> getExpiredQuotes(UUID userId) {
        return quoteRepository.findExpiredQuotes(userId, LocalDate.now()).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get quotes by valid until range
    public List<QuoteResponse> getQuotesByValidUntilRange(UUID userId, LocalDate startDate, LocalDate endDate) {
        return quoteRepository.findByValidUntilRange(userId, startDate, endDate).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get quote history
    public List<QuoteHistoryResponse> getQuoteHistory(UUID userId, UUID quoteId) {
        // Verify quote belongs to user
        quoteRepository.findByIdAndUserId(quoteId, userId)
            .orElseThrow(() -> new NotFoundException("Quote not found"));
        
        return quoteHistoryRepository.findByQuoteIdOrderByCreatedAtDesc(quoteId).stream()
            .map(this::mapHistoryToResponse)
            .collect(Collectors.toList());
    }

    private QuoteHistoryResponse mapHistoryToResponse(QuoteHistory history) {
        return new QuoteHistoryResponse(
            history.getId(),
            history.getQuote().getId(),
            history.getAction(),
            history.getDescription(),
            history.getIpAddress(),
            history.getUserAgent(),
            history.getMetadata(),
            history.getCreatedAt()
        );
    }

    // Get quote summary
    public QuoteSummaryResponse getQuoteSummary(UUID userId, UUID quoteId) {
        Quote quote = quoteRepository.findByIdAndUserId(quoteId, userId)
            .orElseThrow(() -> new NotFoundException("Quote not found"));
        
        List<QuoteItem> items = quoteItemRepository.findByQuoteId(quoteId);
        
        // Convert LocalDate to LocalDateTime (at start of day)
        LocalDateTime validUntilDateTime = null;
        if (quote.getValidUntil() != null) {
            validUntilDateTime = quote.getValidUntil().atStartOfDay();
        }
        
        return new QuoteSummaryResponse(
            quote.getId().toString(),
            quote.getQuoteNumber(),
            quote.getTitle(),
            quote.getClient().getCompanyName() != null ? 
                quote.getClient().getCompanyName() : quote.getClient().getContactName(),
            quote.getStatus(),
            quote.getTotalAmount(),
            quote.getSentAt(),
            quote.getAcceptedAt(),
            validUntilDateTime,  // Now passing LocalDateTime
            quote.getValidUntil() != null && quote.getValidUntil().isBefore(LocalDate.now()),
            items.size()
        );
    }

    // Get quotes count
    public Long getQuotesCount(UUID userId) {
        return quoteRepository.countByUserId(userId);
    }

    // Get quotes count by status
    public Long getQuotesCountByStatus(UUID userId, String status) {
        return quoteRepository.countByUserIdAndStatus(userId, status);
    }

    // Get accepted quotes total amount
    public BigDecimal getAcceptedQuotesTotal(UUID userId) {
        BigDecimal total = quoteRepository.sumAcceptedAmountByUserId(userId);
        return total != null ? total : BigDecimal.ZERO;
    }

    // Get recent quotes
    public List<QuoteResponse> getRecentQuotes(UUID userId, int limit) {
        return quoteRepository.findRecentByUser(userId,
            org.springframework.data.domain.PageRequest.of(0, limit))
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Update quote status (internal use)
    @Transactional
    public QuoteResponse updateQuoteStatus(UUID userId, UUID quoteId, String status) {
        Quote quote = quoteRepository.findByIdAndUserId(quoteId, userId)
            .orElseThrow(() -> new NotFoundException("Quote not found"));
        
        // Validate status
        List<String> validStatuses = Arrays.asList("draft", "sent", "accepted", "rejected", "expired");
        if (!validStatuses.contains(status)) {
            throw new BadRequestException("Invalid quote status");
        }
        
        quote.setStatus(status);
        
        // Update timestamps based on status
        if ("sent".equals(status) && quote.getSentAt() == null) {
            quote.setSentAt(LocalDateTime.now());
        } else if ("accepted".equals(status) && quote.getAcceptedAt() == null) {
            quote.setAcceptedAt(LocalDateTime.now());
        } else if ("expired".equals(status) && quote.getValidUntil() == null) {
            quote.setValidUntil(LocalDate.now());
        }
        
        Quote updatedQuote = quoteRepository.save(quote);
        return mapToResponse(updatedQuote);
    }

    // Duplicate quote
    @Transactional
    public QuoteResponse duplicateQuote(UUID userId, UUID quoteId, 
                                       String ipAddress, String userAgent) {
        Quote originalQuote = quoteRepository.findByIdAndUserId(quoteId, userId)
            .orElseThrow(() -> new NotFoundException("Quote not found"));
        
        // Create new quote based on original
        Quote newQuote = new Quote();
        newQuote.setUser(originalQuote.getUser());
        newQuote.setClient(originalQuote.getClient());
        newQuote.setProject(originalQuote.getProject());
        newQuote.setTitle(originalQuote.getTitle() + " - Copy");
        newQuote.setSummary(originalQuote.getSummary());
        newQuote.setStatus("draft");
        newQuote.setValidUntil(originalQuote.getValidUntil());
        newQuote.setTermsAndConditions(originalQuote.getTermsAndConditions());
        newQuote.setNotes(originalQuote.getNotes());
        newQuote.setTaxAmount(originalQuote.getTaxAmount());
        newQuote.setDiscountAmount(originalQuote.getDiscountAmount());
        newQuote.setSubtotal(originalQuote.getSubtotal());
        newQuote.setTotalAmount(originalQuote.getTotalAmount());
        newQuote.setCurrency(originalQuote.getCurrency());
        newQuote.setPublicHash(UUID.randomUUID().toString().replace("-", ""));
        
        Quote savedQuote = quoteRepository.save(newQuote);
        
        // Duplicate quote items
        List<QuoteItem> originalItems = quoteItemRepository.findByQuoteId(quoteId);
        if (!originalItems.isEmpty()) {
            List<QuoteItem> newItems = originalItems.stream()
                .map(originalItem -> {
                    QuoteItem newItem = new QuoteItem();
                    newItem.setQuote(savedQuote);
                    newItem.setDescription(originalItem.getDescription());
                    newItem.setQuantity(originalItem.getQuantity());
                    newItem.setUnitPrice(originalItem.getUnitPrice());
                    newItem.setTaxRate(originalItem.getTaxRate());
                    newItem.setDiscount(originalItem.getDiscount());
                    newItem.setTotal(originalItem.getTotal());
                    newItem.setSortOrder(originalItem.getSortOrder());
                    return newItem;
                })
                .collect(Collectors.toList());
            
            quoteItemRepository.saveAll(newItems);
        }
        
        // Add history entry
        addQuoteHistory(savedQuote, "created", "Quote duplicated from " + originalQuote.getQuoteNumber(), 
                       ipAddress, userAgent);
        
        return mapToResponse(savedQuote);
    }
}