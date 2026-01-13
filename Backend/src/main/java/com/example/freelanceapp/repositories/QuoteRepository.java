package com.example.freelanceapp.repositories;

import com.example.freelanceapp.entities.Quote;
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
public interface QuoteRepository extends JpaRepository<Quote, UUID> {
    
    List<Quote> findByUserId(UUID userId);
    
    Page<Quote> findByUserId(UUID userId, Pageable pageable);
    
    List<Quote> findByUserIdAndStatus(UUID userId, String status);
    
    List<Quote> findByClientId(UUID clientId);
    
    List<Quote> findByProjectId(UUID projectId);
    
    Optional<Quote> findByIdAndUserId(UUID id, UUID userId);
    
    Optional<Quote> findByQuoteNumber(String quoteNumber);
    
    Optional<Quote> findByPublicHash(String publicHash);
    
    @Query("SELECT q FROM Quote q WHERE q.user.id = :userId AND " +
           "(LOWER(q.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(q.quoteNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(q.client.companyName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(q.client.contactName) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Quote> searchByUser(@Param("userId") UUID userId, @Param("search") String search);
    
    @Query("SELECT COUNT(q) FROM Quote q WHERE q.user.id = :userId")
    Long countByUserId(UUID userId);
    
    @Query("SELECT COUNT(q) FROM Quote q WHERE q.user.id = :userId AND q.status = :status")
    Long countByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") String status);
    
    @Query("SELECT q FROM Quote q WHERE q.user.id = :userId AND q.validUntil < :currentDate " +
           "AND q.status = 'sent'")
    List<Quote> findExpiredQuotes(@Param("userId") UUID userId, 
                                 @Param("currentDate") LocalDate currentDate);
    
    @Query("SELECT q FROM Quote q WHERE q.user.id = :userId AND " +
           "q.validUntil BETWEEN :startDate AND :endDate")
    List<Quote> findByValidUntilRange(@Param("userId") UUID userId, 
                                     @Param("startDate") LocalDate startDate, 
                                     @Param("endDate") LocalDate endDate);
    
    @Query("SELECT q FROM Quote q WHERE q.user.id = :userId " +
           "ORDER BY q.createdAt DESC")
    List<Quote> findRecentByUser(@Param("userId") UUID userId, Pageable pageable);
    
    @Query("SELECT SUM(q.totalAmount) FROM Quote q WHERE q.user.id = :userId AND q.status = 'accepted'")
    BigDecimal sumAcceptedAmountByUserId(@Param("userId") UUID userId);
    
    boolean existsByUserIdAndQuoteNumber(UUID userId, String quoteNumber);
}