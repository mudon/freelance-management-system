package com.example.freelanceapp.repositories;

import com.example.freelanceapp.entities.QuoteHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuoteHistoryRepository extends JpaRepository<QuoteHistory, UUID> {
    
    List<QuoteHistory> findByQuoteIdOrderByCreatedAtDesc(UUID quoteId);
    
    List<QuoteHistory> findByQuoteIdAndActionOrderByCreatedAtDesc(UUID quoteId, String action);
}