package com.example.freelanceapp.repositories;

import com.example.freelanceapp.entities.InvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, UUID> {
    
    List<InvoiceItem> findByInvoiceId(UUID invoiceId);
    
    void deleteByInvoiceId(UUID invoiceId);
    
    @Query("SELECT SUM(ii.total) FROM InvoiceItem ii WHERE ii.invoice.id = :invoiceId")
    BigDecimal calculateSubtotalByInvoiceId(@Param("invoiceId") UUID invoiceId);
}