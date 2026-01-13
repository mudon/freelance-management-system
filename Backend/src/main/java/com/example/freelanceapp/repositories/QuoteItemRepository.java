package com.example.freelanceapp.repositories;

import com.example.freelanceapp.entities.QuoteItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface QuoteItemRepository extends JpaRepository<QuoteItem, UUID> {
    
    List<QuoteItem> findByQuoteId(UUID quoteId);
    
    void deleteByQuoteId(UUID quoteId);
    
    @Query("SELECT SUM(qi.total) FROM QuoteItem qi WHERE qi.quote.id = :quoteId")
    BigDecimal calculateSubtotalByQuoteId(@Param("quoteId") UUID quoteId);
}