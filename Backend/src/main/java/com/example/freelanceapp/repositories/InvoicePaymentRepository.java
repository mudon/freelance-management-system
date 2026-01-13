package com.example.freelanceapp.repositories;

import com.example.freelanceapp.entities.InvoicePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface InvoicePaymentRepository extends JpaRepository<InvoicePayment, UUID> {
    
    List<InvoicePayment> findByInvoiceId(UUID invoiceId);
    
    List<InvoicePayment> findByInvoiceIdAndStatus(UUID invoiceId, String status);
    
    @Query("SELECT COALESCE(SUM(ip.amount), 0) FROM InvoicePayment ip " +
           "WHERE ip.invoice.id = :invoiceId AND ip.status = 'completed'")
    BigDecimal sumCompletedPaymentsByInvoiceId(@Param("invoiceId") UUID invoiceId);
    
    @Query("SELECT COALESCE(SUM(ip.amount), 0) FROM InvoicePayment ip " +
           "WHERE ip.invoice.client.id = :clientId AND ip.status = 'completed'")
    BigDecimal sumPaidAmountByClientId(@Param("clientId") UUID clientId);
    
    @Query("SELECT COALESCE(SUM(ip.amount), 0) FROM InvoicePayment ip " +
           "WHERE ip.invoice.user.id = :userId AND ip.status = 'completed'")
    BigDecimal sumPaidAmountByUserId(@Param("userId") UUID userId);
    
    boolean existsByTransactionId(String transactionId);
}