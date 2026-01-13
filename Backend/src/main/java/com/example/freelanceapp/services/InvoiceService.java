package com.example.freelanceapp.services;

import com.example.freelanceapp.dtos.invoice.*;
import com.example.freelanceapp.entities.*;
import com.example.freelanceapp.exceptions.BadRequestException;
import com.example.freelanceapp.exceptions.NotFoundException;
import com.example.freelanceapp.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final InvoicePaymentRepository invoicePaymentRepository;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final QuoteRepository quoteRepository;
    private final QuoteItemRepository quoteItemRepository;


    // Map Entity to Response DTO
    private InvoiceResponse mapToResponse(Invoice invoice) {
        List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(invoice.getId());
        List<InvoicePayment> payments = invoicePaymentRepository.findByInvoiceId(invoice.getId());
        
        List<InvoiceItemResponse> itemResponses = items.stream()
            .map(this::mapItemToResponse)
            .collect(Collectors.toList());
            
        List<InvoicePaymentResponse> paymentResponses = payments.stream()
            .map(this::mapPaymentToResponse)
            .collect(Collectors.toList());

        return new InvoiceResponse(
            invoice.getId(),
            invoice.getUser().getId(),
            invoice.getClient().getId(),
            invoice.getClient().getCompanyName() != null ? 
                invoice.getClient().getCompanyName() : invoice.getClient().getContactName(),
            invoice.getProject() != null ? invoice.getProject().getId() : null,
            invoice.getProject() != null ? invoice.getProject().getName() : null,
            invoice.getQuote() != null ? invoice.getQuote().getId() : null,
            invoice.getQuote() != null ? invoice.getQuote().getQuoteNumber() : null,
            invoice.getInvoiceNumber(),
            invoice.getTitle(),
            invoice.getStatus(),
            invoice.getIssueDate(),
            invoice.getDueDate(),
            invoice.getPaidDate(),
            invoice.getPaymentTerms(),
            invoice.getNotes(),
            invoice.getTerms(),
            invoice.getSubtotal(),
            invoice.getTaxAmount(),
            invoice.getDiscountAmount(),
            invoice.getTotalAmount(),
            invoice.getAmountPaid(),
            invoice.getBalanceDue(),
            invoice.getCurrency(),
            invoice.getSentAt(),
            invoice.getViewedAt(),
            invoice.getPdfUrl(),
            invoice.getPublicHash(),
            invoice.getPaymentLink(),
            invoice.getCreatedAt(),
            invoice.getUpdatedAt(),
            itemResponses,
            paymentResponses
        );
    }

    private InvoiceItemResponse mapItemToResponse(InvoiceItem item) {
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

    private InvoicePaymentResponse mapPaymentToResponse(InvoicePayment payment) {
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

    // Map Request to Entity
    private Invoice mapToEntity(InvoiceRequest request, User user, Client client, Project project, Quote quote) {
        Invoice invoice = new Invoice();
        invoice.setUser(user);
        invoice.setClient(client);
        invoice.setProject(project);
        invoice.setQuote(quote);
        invoice.setTitle(request.getTitle());
        invoice.setStatus(request.getStatus() != null ? request.getStatus() : "draft");
        invoice.setIssueDate(request.getIssueDate());
        invoice.setDueDate(request.getDueDate());
        invoice.setPaymentTerms(request.getPaymentTerms());
        invoice.setNotes(request.getNotes());
        invoice.setTerms(request.getTerms());
        invoice.setTaxAmount(request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO);
        invoice.setDiscountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO);
        invoice.setCurrency(request.getCurrency() != null ? request.getCurrency() : "USD");
        invoice.setPaymentLink(request.getPaymentLink());
        
        // Generate public hash for shareable links
        invoice.setPublicHash(UUID.randomUUID().toString().replace("-", ""));
        
        return invoice;
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

    // Update invoice totals
    @Transactional
    public void updateInvoiceTotals(Invoice invoice) {
        // Calculate subtotal from items
        BigDecimal subtotal = invoiceItemRepository.calculateSubtotalByInvoiceId(invoice.getId());
        if (subtotal == null) {
            subtotal = BigDecimal.ZERO;
        }
        
        // Calculate total paid
        BigDecimal totalPaid = invoicePaymentRepository.sumCompletedPaymentsByInvoiceId(invoice.getId());
        if (totalPaid == null) {
            totalPaid = BigDecimal.ZERO;
        }
        
        // Calculate total amount
        BigDecimal totalAmount = subtotal
            .add(invoice.getTaxAmount() != null ? invoice.getTaxAmount() : BigDecimal.ZERO)
            .subtract(invoice.getDiscountAmount() != null ? invoice.getDiscountAmount() : BigDecimal.ZERO);
        
        // Calculate balance due
        BigDecimal balanceDue = totalAmount.subtract(totalPaid);
        
        // Update invoice
        invoice.setSubtotal(subtotal);
        invoice.setTotalAmount(totalAmount);
        invoice.setAmountPaid(totalPaid);
        invoice.setBalanceDue(balanceDue);
        
        // Update status based on payments
        updateInvoiceStatus(invoice);
        
        invoiceRepository.save(invoice);
    }

    // Update invoice status based on payments
    private void updateInvoiceStatus(Invoice invoice) {
        if ("cancelled".equals(invoice.getStatus())) {
            return; // Don't update cancelled invoices
        }
        
        if (invoice.getBalanceDue().compareTo(BigDecimal.ZERO) <= 0) {
            invoice.setStatus("paid");
            if (invoice.getPaidDate() == null) {
                invoice.setPaidDate(LocalDate.now());
            }
        } else if (invoice.getAmountPaid().compareTo(BigDecimal.ZERO) > 0) {
            invoice.setStatus("partial");
        } else if (invoice.getDueDate().isBefore(LocalDate.now())) {
            invoice.setStatus("overdue");
        } else if (invoice.getSentAt() != null) {
            invoice.setStatus("sent");
        } else {
            invoice.setStatus("draft");
        }
    }

    // Create a new invoice
    @Transactional
    public InvoiceResponse createInvoice(UUID userId, InvoiceRequest request) {
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

        // Find quote if provided
        Quote quote = null;
        if (request.getQuoteId() != null && !request.getQuoteId().isEmpty()) {
            try {
                UUID quoteId = UUID.fromString(request.getQuoteId());
                quote = quoteRepository.findByIdAndUserId(quoteId, userId)
                    .orElseThrow(() -> new NotFoundException("Quote not found or not authorized"));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid quote ID format");
            }
        }

        // Validate dates
        if (request.getDueDate().isBefore(request.getIssueDate())) {
            throw new BadRequestException("Due date cannot be before issue date");
        }

        // Create invoice
        Invoice invoice = mapToEntity(request, user, client, project, quote);
        
        // Calculate initial totals
        invoice.setSubtotal(BigDecimal.ZERO);
        invoice.setTotalAmount(BigDecimal.ZERO);
        invoice.setAmountPaid(BigDecimal.ZERO);
        invoice.setBalanceDue(BigDecimal.ZERO);
        
        Invoice savedInvoice = invoiceRepository.save(invoice);
        
        // Add invoice items if provided
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            List<InvoiceItem> invoiceItems = new ArrayList<>();
            for (int i = 0; i < request.getItems().size(); i++) {
                InvoiceItemRequest itemRequest = request.getItems().get(i);
                InvoiceItem invoiceItem = new InvoiceItem();
                invoiceItem.setInvoice(savedInvoice);
                invoiceItem.setDescription(itemRequest.getDescription());
                invoiceItem.setQuantity(itemRequest.getQuantity() != null ? itemRequest.getQuantity() : BigDecimal.ONE);
                invoiceItem.setUnitPrice(itemRequest.getUnitPrice() != null ? itemRequest.getUnitPrice() : BigDecimal.ZERO);
                invoiceItem.setTaxRate(itemRequest.getTaxRate() != null ? itemRequest.getTaxRate() : BigDecimal.ZERO);
                invoiceItem.setDiscount(itemRequest.getDiscount() != null ? itemRequest.getDiscount() : BigDecimal.ZERO);
                invoiceItem.setSortOrder(itemRequest.getSortOrder() != null ? itemRequest.getSortOrder() : i);
                
                // Calculate item total
                BigDecimal itemTotal = calculateItemTotal(
                    invoiceItem.getQuantity(),
                    invoiceItem.getUnitPrice(),
                    invoiceItem.getTaxRate(),
                    invoiceItem.getDiscount()
                );
                invoiceItem.setTotal(itemTotal);
                
                invoiceItems.add(invoiceItem);
            }
            
            invoiceItemRepository.saveAll(invoiceItems);
            
            // Update invoice totals
            updateInvoiceTotals(savedInvoice);
        }
        
        return mapToResponse(savedInvoice);
    }

    // Get invoice by ID
    public InvoiceResponse getInvoiceById(UUID userId, UUID invoiceId) {
        Invoice invoice = invoiceRepository.findByIdAndUserId(invoiceId, userId)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        return mapToResponse(invoice);
    }

    // Get invoice by public hash (for public viewing)
    public InvoiceResponse getInvoiceByPublicHash(String publicHash) {
        Invoice invoice = invoiceRepository.findByPublicHash(publicHash)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        return mapToResponse(invoice);
    }

    // Get all invoices for a user
    public List<InvoiceResponse> getAllInvoices(UUID userId) {
        return invoiceRepository.findByUserId(userId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get all invoices with pagination
    public Page<InvoiceResponse> getAllInvoices(UUID userId, Pageable pageable) {
        return invoiceRepository.findByUserId(userId, pageable)
            .map(this::mapToResponse);
    }

    // Get invoices by status
    public List<InvoiceResponse> getInvoicesByStatus(UUID userId, String status) {
        return invoiceRepository.findByUserIdAndStatus(userId, status).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get invoices by client
    public List<InvoiceResponse> getInvoicesByClient(UUID userId, UUID clientId) {
        // Verify client belongs to user
        clientRepository.findByIdAndUserId(clientId, userId)
            .orElseThrow(() -> new NotFoundException("Client not found"));
            
        return invoiceRepository.findByClientId(clientId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get invoices by project
    public List<InvoiceResponse> getInvoicesByProject(UUID userId, UUID projectId) {
        // Verify project belongs to user
        projectRepository.findByIdAndUserId(projectId, userId)
            .orElseThrow(() -> new NotFoundException("Project not found"));
            
        return invoiceRepository.findByProjectId(projectId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get invoices by quote
    public List<InvoiceResponse> getInvoicesByQuote(UUID userId, UUID quoteId) {
        // Verify quote belongs to user
        quoteRepository.findByIdAndUserId(quoteId, userId)
            .orElseThrow(() -> new NotFoundException("Quote not found"));
            
        return invoiceRepository.findByQuoteId(quoteId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Update invoice
    @Transactional
    public InvoiceResponse updateInvoice(UUID userId, UUID invoiceId, InvoiceRequest request) {
        Invoice invoice = invoiceRepository.findByIdAndUserId(invoiceId, userId)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));

        // Only draft invoices can be modified
        if (!"draft".equals(invoice.getStatus())) {
            throw new BadRequestException("Only draft invoices can be modified");
        }

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
            invoice.setClient(client);
        }

        // Update project if provided
        if (request.getProjectId() != null && !request.getProjectId().isEmpty()) {
            try {
                UUID projectId = UUID.fromString(request.getProjectId());
                Project project = projectRepository.findByIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new NotFoundException("Project not found"));
                invoice.setProject(project);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid project ID format");
            }
        } else if (request.getProjectId() != null && request.getProjectId().isEmpty()) {
            invoice.setProject(null);
        }

        // Update quote if provided
        if (request.getQuoteId() != null && !request.getQuoteId().isEmpty()) {
            try {
                UUID quoteId = UUID.fromString(request.getQuoteId());
                Quote quote = quoteRepository.findByIdAndUserId(quoteId, userId)
                    .orElseThrow(() -> new NotFoundException("Quote not found"));
                invoice.setQuote(quote);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid quote ID format");
            }
        } else if (request.getQuoteId() != null && request.getQuoteId().isEmpty()) {
            invoice.setQuote(null);
        }

        // Validate dates
        if (request.getDueDate() != null && request.getIssueDate() != null) {
            if (request.getDueDate().isBefore(request.getIssueDate())) {
                throw new BadRequestException("Due date cannot be before issue date");
            }
        }

        // Update fields
        if (request.getTitle() != null) {
            invoice.setTitle(request.getTitle());
        }
        if (request.getStatus() != null) {
            invoice.setStatus(request.getStatus());
        }
        if (request.getIssueDate() != null) {
            invoice.setIssueDate(request.getIssueDate());
        }
        if (request.getDueDate() != null) {
            invoice.setDueDate(request.getDueDate());
        }
        if (request.getPaymentTerms() != null) {
            invoice.setPaymentTerms(request.getPaymentTerms());
        }
        if (request.getNotes() != null) {
            invoice.setNotes(request.getNotes());
        }
        if (request.getTerms() != null) {
            invoice.setTerms(request.getTerms());
        }
        if (request.getTaxAmount() != null) {
            invoice.setTaxAmount(request.getTaxAmount());
        }
        if (request.getDiscountAmount() != null) {
            invoice.setDiscountAmount(request.getDiscountAmount());
        }
        if (request.getCurrency() != null) {
            invoice.setCurrency(request.getCurrency());
        }
        if (request.getPaymentLink() != null) {
            invoice.setPaymentLink(request.getPaymentLink());
        }

        // Update invoice items if provided
        if (request.getItems() != null) {
            // Delete existing items
            invoiceItemRepository.deleteByInvoiceId(invoiceId);
            
            // Add new items
            List<InvoiceItem> invoiceItems = new ArrayList<>();
            for (int i = 0; i < request.getItems().size(); i++) {
                InvoiceItemRequest itemRequest = request.getItems().get(i);
                InvoiceItem invoiceItem = new InvoiceItem();
                invoiceItem.setInvoice(invoice);
                invoiceItem.setDescription(itemRequest.getDescription());
                invoiceItem.setQuantity(itemRequest.getQuantity() != null ? itemRequest.getQuantity() : BigDecimal.ONE);
                invoiceItem.setUnitPrice(itemRequest.getUnitPrice() != null ? itemRequest.getUnitPrice() : BigDecimal.ZERO);
                invoiceItem.setTaxRate(itemRequest.getTaxRate() != null ? itemRequest.getTaxRate() : BigDecimal.ZERO);
                invoiceItem.setDiscount(itemRequest.getDiscount() != null ? itemRequest.getDiscount() : BigDecimal.ZERO);
                invoiceItem.setSortOrder(itemRequest.getSortOrder() != null ? itemRequest.getSortOrder() : i);
                
                // Calculate item total
                BigDecimal itemTotal = calculateItemTotal(
                    invoiceItem.getQuantity(),
                    invoiceItem.getUnitPrice(),
                    invoiceItem.getTaxRate(),
                    invoiceItem.getDiscount()
                );
                invoiceItem.setTotal(itemTotal);
                
                invoiceItems.add(invoiceItem);
            }
            
            invoiceItemRepository.saveAll(invoiceItems);
        }

        // Update totals
        updateInvoiceTotals(invoice);
        
        Invoice updatedInvoice = invoiceRepository.save(invoice);
        return mapToResponse(updatedInvoice);
    }

    // Delete invoice
    @Transactional
    public void deleteInvoice(UUID userId, UUID invoiceId) {
        Invoice invoice = invoiceRepository.findByIdAndUserId(invoiceId, userId)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        
        // Only draft invoices can be deleted
        if (!"draft".equals(invoice.getStatus())) {
            throw new BadRequestException("Only draft invoices can be deleted");
        }
        
        invoiceRepository.delete(invoice);
    }

    // Send invoice (change status to sent)
    @Transactional
    public InvoiceResponse sendInvoice(UUID userId, UUID invoiceId) {
        Invoice invoice = invoiceRepository.findByIdAndUserId(invoiceId, userId)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        
        // Validate invoice can be sent
        if (!"draft".equals(invoice.getStatus())) {
            throw new BadRequestException("Only draft invoices can be sent");
        }
        
        // Check if invoice has items
        List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(invoiceId);
        if (items.isEmpty()) {
            throw new BadRequestException("Cannot send invoice without items");
        }
        
        // Update invoice status and sent time
        invoice.setStatus("sent");
        invoice.setSentAt(LocalDateTime.now());
        
        Invoice updatedInvoice = invoiceRepository.save(invoice);
        return mapToResponse(updatedInvoice);
    }

    // View invoice (from public link)
    @Transactional
    public InvoiceResponse viewInvoice(String publicHash) {
        Invoice invoice = invoiceRepository.findByPublicHash(publicHash)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        
        // Only update viewed time if not already set
        if (invoice.getViewedAt() == null) {
            invoice.setViewedAt(LocalDateTime.now());
            invoiceRepository.save(invoice);
        }
        
        return mapToResponse(invoice);
    }

    // Cancel invoice
    @Transactional
    public InvoiceResponse cancelInvoice(UUID userId, UUID invoiceId) {
        Invoice invoice = invoiceRepository.findByIdAndUserId(invoiceId, userId)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        
        // Validate invoice can be cancelled
        if ("paid".equals(invoice.getStatus()) || "cancelled".equals(invoice.getStatus())) {
            throw new BadRequestException("Cannot cancel a paid or already cancelled invoice");
        }
        
        // Update invoice status
        invoice.setStatus("cancelled");
        
        Invoice updatedInvoice = invoiceRepository.save(invoice);
        return mapToResponse(updatedInvoice);
    }

    // Add payment to invoice
    @Transactional
    public InvoiceResponse addPayment(UUID userId, UUID invoiceId, InvoicePaymentRequest request) {
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
        
        invoicePaymentRepository.save(payment);
        
        // Update invoice totals and status
        updateInvoiceTotals(invoice);
        
        return mapToResponse(invoice);
    }

    // Search invoices
    public List<InvoiceResponse> searchInvoices(UUID userId, String searchTerm) {
        return invoiceRepository.searchByUser(userId, searchTerm).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get overdue invoices
    public List<InvoiceResponse> getOverdueInvoices(UUID userId) {
        return invoiceRepository.findOverdueInvoices(userId, LocalDate.now()).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get invoices by due date range
    public List<InvoiceResponse> getInvoicesByDueDateRange(UUID userId, LocalDate startDate, LocalDate endDate) {
        return invoiceRepository.findByDueDateRange(userId, startDate, endDate).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get invoices by issue date range
    public List<InvoiceResponse> getInvoicesByIssueDateRange(UUID userId, LocalDate startDate, LocalDate endDate) {
        return invoiceRepository.findByIssueDateRange(userId, startDate, endDate).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get invoice summary
    public InvoiceSummaryResponse getInvoiceSummary(UUID userId, UUID invoiceId) {
        Invoice invoice = invoiceRepository.findByIdAndUserId(invoiceId, userId)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        
        List<InvoiceItem> items = invoiceItemRepository.findByInvoiceId(invoiceId);
        List<InvoicePayment> payments = invoicePaymentRepository.findByInvoiceId(invoiceId);
        
        return new InvoiceSummaryResponse(
            invoice.getId().toString(),
            invoice.getInvoiceNumber(),
            invoice.getTitle(),
            invoice.getClient().getCompanyName() != null ? 
                invoice.getClient().getCompanyName() : invoice.getClient().getContactName(),
            invoice.getStatus(),
            invoice.getIssueDate(),
            invoice.getDueDate(),
            invoice.getTotalAmount(),
            invoice.getAmountPaid(),
            invoice.getBalanceDue(),
            invoice.getDueDate().isBefore(LocalDate.now()) && invoice.getBalanceDue().compareTo(BigDecimal.ZERO) > 0,
            invoice.getAmountPaid().compareTo(BigDecimal.ZERO) > 0 && 
                invoice.getAmountPaid().compareTo(invoice.getTotalAmount()) < 0,
            items.size(),
            payments.size()
        );
    }

    // Get invoice aging report
    public List<InvoiceAgingResponse> getInvoiceAgingReport(UUID userId) {
        List<Invoice> invoices = invoiceRepository.findByUserId(userId);
        
        return invoices.stream()
            .filter(invoice -> !"draft".equals(invoice.getStatus()) && !"cancelled".equals(invoice.getStatus()))
            .map(invoice -> {
                String agingCategory;
                long daysOverdue = 0;
                
                if (invoice.getBalanceDue().compareTo(BigDecimal.ZERO) <= 0) {
                    agingCategory = "Paid";
                } else if (invoice.getDueDate().isAfter(LocalDate.now()) || invoice.getDueDate().equals(LocalDate.now())) {
                    agingCategory = "Current";
                } else {
                    daysOverdue = ChronoUnit.DAYS.between(invoice.getDueDate(), LocalDate.now());
                    
                    if (daysOverdue <= 30) {
                        agingCategory = "1-30 Days";
                    } else if (daysOverdue <= 60) {
                        agingCategory = "31-60 Days";
                    } else if (daysOverdue <= 90) {
                        agingCategory = "61-90 Days";
                    } else {
                        agingCategory = "Over 90 Days";
                    }
                }
                
                return new InvoiceAgingResponse(
                    invoice.getId().toString(),
                    invoice.getInvoiceNumber(),
                    invoice.getClient().getCompanyName() != null ? 
                        invoice.getClient().getCompanyName() : invoice.getClient().getContactName(),
                    invoice.getIssueDate(),
                    invoice.getDueDate(),
                    invoice.getTotalAmount(),
                    invoice.getAmountPaid(),
                    invoice.getBalanceDue(),
                    invoice.getStatus(),
                    agingCategory,
                    daysOverdue
                );
            })
            .collect(Collectors.toList());
    }

    // Get invoices count
    public Long getInvoicesCount(UUID userId) {
        return invoiceRepository.countByUserId(userId);
    }

    // Get invoices count by status
    public Long getInvoicesCountByStatus(UUID userId, String status) {
        return invoiceRepository.countByUserIdAndStatus(userId, status);
    }

    // Get total invoiced amount
    public BigDecimal getTotalInvoicedAmount(UUID userId) {
        BigDecimal total = invoiceRepository.sumTotalAmountByUserId(userId);
        return total != null ? total : BigDecimal.ZERO;
    }

    // Get total amount paid
    public BigDecimal getTotalAmountPaid(UUID userId) {
        BigDecimal total = invoiceRepository.sumAmountPaidByUserId(userId);
        return total != null ? total : BigDecimal.ZERO;
    }

    // Get total balance due
    public BigDecimal getTotalBalanceDue(UUID userId) {
        BigDecimal total = invoiceRepository.sumBalanceDueByUserId(userId);
        return total != null ? total : BigDecimal.ZERO;
    }

    // Get recent invoices
    public List<InvoiceResponse> getRecentInvoices(UUID userId, int limit) {
        return invoiceRepository.findRecentByUser(userId,
            org.springframework.data.domain.PageRequest.of(0, limit))
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Update invoice status
    @Transactional
    public InvoiceResponse updateInvoiceStatus(UUID userId, UUID invoiceId, String status) {
        Invoice invoice = invoiceRepository.findByIdAndUserId(invoiceId, userId)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        
        // Validate status
        List<String> validStatuses = Arrays.asList("draft", "sent", "viewed", "partial", "paid", "overdue", "cancelled");
        if (!validStatuses.contains(status)) {
            throw new BadRequestException("Invalid invoice status");
        }
        
        invoice.setStatus(status);
        
        // Update timestamps based on status
        if ("sent".equals(status) && invoice.getSentAt() == null) {
            invoice.setSentAt(LocalDateTime.now());
        } else if ("paid".equals(status) && invoice.getPaidDate() == null) {
            invoice.setPaidDate(LocalDate.now());
        } else if ("viewed".equals(status) && invoice.getViewedAt() == null) {
            invoice.setViewedAt(LocalDateTime.now());
        }
        
        Invoice updatedInvoice = invoiceRepository.save(invoice);
        return mapToResponse(updatedInvoice);
    }

    // Duplicate invoice
    @Transactional
    public InvoiceResponse duplicateInvoice(UUID userId, UUID invoiceId) {
        Invoice originalInvoice = invoiceRepository.findByIdAndUserId(invoiceId, userId)
            .orElseThrow(() -> new NotFoundException("Invoice not found"));
        
        // Create new invoice based on original
        Invoice newInvoice = new Invoice();
        newInvoice.setUser(originalInvoice.getUser());
        newInvoice.setClient(originalInvoice.getClient());
        newInvoice.setProject(originalInvoice.getProject());
        newInvoice.setQuote(originalInvoice.getQuote());
        newInvoice.setTitle(originalInvoice.getTitle() + " - Copy");
        newInvoice.setStatus("draft");
        newInvoice.setIssueDate(LocalDate.now());
        newInvoice.setDueDate(LocalDate.now().plusDays(30));
        newInvoice.setPaymentTerms(originalInvoice.getPaymentTerms());
        newInvoice.setNotes(originalInvoice.getNotes());
        newInvoice.setTerms(originalInvoice.getTerms());
        newInvoice.setTaxAmount(originalInvoice.getTaxAmount());
        newInvoice.setDiscountAmount(originalInvoice.getDiscountAmount());
        newInvoice.setSubtotal(originalInvoice.getSubtotal());
        newInvoice.setTotalAmount(originalInvoice.getTotalAmount());
        newInvoice.setAmountPaid(BigDecimal.ZERO);
        newInvoice.setBalanceDue(originalInvoice.getTotalAmount());
        newInvoice.setCurrency(originalInvoice.getCurrency());
        newInvoice.setPaymentLink(originalInvoice.getPaymentLink());
        newInvoice.setPublicHash(UUID.randomUUID().toString().replace("-", ""));
        
        Invoice savedInvoice = invoiceRepository.save(newInvoice);
        
        // Duplicate invoice items
        List<InvoiceItem> originalItems = invoiceItemRepository.findByInvoiceId(invoiceId);
        if (!originalItems.isEmpty()) {
            List<InvoiceItem> newItems = originalItems.stream()
                .map(originalItem -> {
                    InvoiceItem newItem = new InvoiceItem();
                    newItem.setInvoice(savedInvoice);
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
            
            invoiceItemRepository.saveAll(newItems);
        }
        
        return mapToResponse(savedInvoice);
    }

    // Create invoice from quote
    @Transactional
    public InvoiceResponse createInvoiceFromQuote(UUID userId, UUID quoteId, InvoiceRequest request) {
        System.out.println("userId: " + userId);
        System.out.println("quoteId: " + quoteId);
        System.out.println("request: " + request);
        // Find quote
        Quote quote = quoteRepository.findByIdAndUserId(quoteId, userId)
            .orElseThrow(() -> new NotFoundException("Quote not found"));
        
        // Validate quote status
        if (!"accepted".equals(quote.getStatus())) {
            throw new BadRequestException("Cannot create invoice from a non-accepted quote");
        }
        
        // Create invoice request from quote if not provided
        if (request == null) {
            request = new InvoiceRequest();
            request.setClientId(quote.getClient().getId().toString());
            request.setProjectId(quote.getProject() != null ? quote.getProject().getId().toString() : null);
            request.setQuoteId(quote.getId().toString());
            request.setTitle("Invoice for " + quote.getTitle());
            request.setIssueDate(LocalDate.now());
            request.setDueDate(LocalDate.now().plusDays(30));
            request.setNotes("Invoice created from quote: " + quote.getQuoteNumber());
            request.setTaxAmount(quote.getTaxAmount());
            request.setDiscountAmount(quote.getDiscountAmount());
            request.setCurrency(quote.getCurrency());
            
            // Convert quote items to invoice items
            List<InvoiceItemRequest> itemRequests = quoteItemRepository.findByQuoteId(quoteId).stream()
                .map(quoteItem -> new InvoiceItemRequest(
                    quoteItem.getDescription(),
                    quoteItem.getQuantity(),
                    quoteItem.getUnitPrice(),
                    quoteItem.getTaxRate(),
                    quoteItem.getDiscount(),
                    quoteItem.getSortOrder()
                ))
                .collect(Collectors.toList());
            request.setItems(itemRequests);
        } else {
            // Ensure quote is linked
            request.setQuoteId(quote.getId().toString());
            if (request.getClientId() == null) {
                request.setClientId(quote.getClient().getId().toString());
            }
        }
        
        // Create invoice
        return createInvoice(userId, request);
    }
}