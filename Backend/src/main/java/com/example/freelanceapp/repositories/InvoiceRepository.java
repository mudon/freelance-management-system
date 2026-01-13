package com.example.freelanceapp.repositories;

import com.example.freelanceapp.entities.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    
    List<Invoice> findByUserId(UUID userId);
    
    Page<Invoice> findByUserId(UUID userId, Pageable pageable);
    
    List<Invoice> findByUserIdAndStatus(UUID userId, String status);
    
    List<Invoice> findByClientId(UUID clientId);
    
    List<Invoice> findByProjectId(UUID projectId);
    
    List<Invoice> findByQuoteId(UUID quoteId);
    
    Optional<Invoice> findByIdAndUserId(UUID id, UUID userId);
    
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    
    Optional<Invoice> findByPublicHash(String publicHash);
    
    @Query("SELECT i FROM Invoice i WHERE i.user.id = :userId AND " +
           "(LOWER(i.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(i.client.companyName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(i.client.contactName) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Invoice> searchByUser(@Param("userId") UUID userId, @Param("search") String search);
    
    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.user.id = :userId")
    Long countByUserId(UUID userId);
    
    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.user.id = :userId AND i.status = :status")
    Long countByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") String status);
    
    @Query("SELECT i FROM Invoice i WHERE i.user.id = :userId AND i.dueDate < :currentDate " +
           "AND i.status NOT IN ('paid', 'cancelled') AND i.balanceDue > 0")
    List<Invoice> findOverdueInvoices(@Param("userId") UUID userId, 
                                     @Param("currentDate") LocalDate currentDate);
    
    @Query("SELECT i FROM Invoice i WHERE i.user.id = :userId AND i.dueDate BETWEEN :startDate AND :endDate")
    List<Invoice> findByDueDateRange(@Param("userId") UUID userId, 
                                    @Param("startDate") LocalDate startDate, 
                                    @Param("endDate") LocalDate endDate);
    
    @Query("SELECT i FROM Invoice i WHERE i.user.id = :userId AND " +
           "i.issueDate BETWEEN :startDate AND :endDate")
    List<Invoice> findByIssueDateRange(@Param("userId") UUID userId, 
                                      @Param("startDate") LocalDate startDate, 
                                      @Param("endDate") LocalDate endDate);
    
    @Query("SELECT i FROM Invoice i WHERE i.user.id = :userId " +
           "ORDER BY i.createdAt DESC")
    List<Invoice> findRecentByUser(@Param("userId") UUID userId, Pageable pageable);
    
    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.user.id = :userId")
    BigDecimal sumTotalAmountByUserId(@Param("userId") UUID userId);
    
    @Query("SELECT COALESCE(SUM(i.amountPaid), 0) FROM Invoice i WHERE i.user.id = :userId")
    BigDecimal sumAmountPaidByUserId(@Param("userId") UUID userId);
    
    @Query("SELECT COALESCE(SUM(i.balanceDue), 0) FROM Invoice i WHERE i.user.id = :userId")
    BigDecimal sumBalanceDueByUserId(@Param("userId") UUID userId);
    
    @Query("SELECT i FROM Invoice i WHERE i.user.id = :userId AND " +
           "i.status = :status " +
           "ORDER BY i.dueDate ASC")
    List<Invoice> findByUserAndStatusOrderByDueDate(@Param("userId") UUID userId, 
                                                   @Param("status") String status);
    
    boolean existsByUserIdAndInvoiceNumber(UUID userId, String invoiceNumber);
}