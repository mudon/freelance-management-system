package com.example.freelanceapp.utils;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@RequiredArgsConstructor
public class NumberGenerator {

    private static final String QUOTE_PREFIX = "QUO-";
    private static final String INVOICE_PREFIX = "INV-";
    private static final DateTimeFormatter YEAR_MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyyMM");
    private static final DateTimeFormatter YEAR_MONTH_DAY_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");
    
    // Thread-safe counters for each prefix
    private final AtomicInteger quoteCounter = new AtomicInteger(0);
    private final AtomicInteger invoiceCounter = new AtomicInteger(0);
    
    /**
     * Generate a unique quote number in format: QUO-YYYYMM-001
     */
    public String generateQuoteNumber() {
        LocalDate now = LocalDate.now();
        String yearMonth = now.format(YEAR_MONTH_FORMATTER);
        String baseNumber = QUOTE_PREFIX + yearMonth + "-";
        
        // Get the highest sequence number for this month
        int maxSequence = findMaxSequenceForMonth(QUOTE_PREFIX, yearMonth);
        
        // Increment and format with leading zeros
        int sequenceNumber = maxSequence + 1;
        return baseNumber + String.format("%03d", sequenceNumber);
    }
    
    /**
     * Generate a unique invoice number in format: INV-YYYYMM-001
     */
    public String generateInvoiceNumber() {
        LocalDate now = LocalDate.now();
        String yearMonth = now.format(YEAR_MONTH_FORMATTER);
        String baseNumber = INVOICE_PREFIX + yearMonth + "-";
        
        // Get the highest sequence number for this month
        int maxSequence = findMaxSequenceForMonth(INVOICE_PREFIX, yearMonth);
        
        // Increment and format with leading zeros
        int sequenceNumber = maxSequence + 1;
        return baseNumber + String.format("%03d", sequenceNumber);
    }
    
    /**
     * Generate a custom number with prefix and sequence
     * Format: PREFIX-YYYYMM-001
     */
    public String generateCustomNumber(String prefix) {
        LocalDate now = LocalDate.now();
        String yearMonth = now.format(YEAR_MONTH_FORMATTER);
        String baseNumber = prefix + "-" + yearMonth + "-";
        
        // Get the highest sequence number for this month
        int maxSequence = findMaxSequenceForMonth(prefix, yearMonth);
        
        // Increment and format with leading zeros
        int sequenceNumber = maxSequence + 1;
        return baseNumber + String.format("%03d", sequenceNumber);
    }
    
    /**
     * Generate a daily number (resets each day)
     * Format: PREFIX-YYYYMMDD-001
     */
    public String generateDailyNumber(String prefix) {
        LocalDate now = LocalDate.now();
        String dateStr = now.format(YEAR_MONTH_DAY_FORMATTER);
        String baseNumber = prefix + "-" + dateStr + "-";
        
        // Get the highest sequence number for today
        int maxSequence = findMaxSequenceForDaily(prefix, dateStr);
        
        // Increment and format with leading zeros
        int sequenceNumber = maxSequence + 1;
        return baseNumber + String.format("%03d", sequenceNumber);
    }
    
    /**
     * Generate a simple sequential number
     * Format: PREFIX-000001
     */
    public String generateSequentialNumber(String prefix) {
        // Get the highest sequence number for this prefix
        int maxSequence = findMaxSequence(prefix);
        
        // Increment and format with leading zeros
        int sequenceNumber = maxSequence + 1;
        return prefix + "-" + String.format("%06d", sequenceNumber);
    }
    
    /**
     * Generate a unique public hash for shareable links
     */
    public String generatePublicHash() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
    
    /**
     * Extract sequence number from a generated number
     */
    public int extractSequenceNumber(String generatedNumber) {
        try {
            String[] parts = generatedNumber.split("-");
            if (parts.length >= 3) {
                return Integer.parseInt(parts[parts.length - 1]);
            }
        } catch (NumberFormatException e) {
            // If parsing fails, return 0
        }
        return 0;
    }
    
    /**
     * Validate if a number follows the expected format
     */
    public boolean isValidFormat(String number, String expectedPrefix) {
        if (number == null || !number.startsWith(expectedPrefix)) {
            return false;
        }
        
        try {
            String[] parts = number.split("-");
            if (parts.length != 3) {
                return false;
            }
            
            // Check prefix
            if (!parts[0].equals(expectedPrefix.replace("-", ""))) {
                return false;
            }
            
            // Check date part (should be 6 digits for YYYYMM)
            if (parts[1].length() != 6) {
                return false;
            }
            
            // Check sequence part (should be 3 digits)
            if (parts[2].length() != 3) {
                return false;
            }
            
            // Try to parse as integers
            Integer.parseInt(parts[1]); // YearMonth
            Integer.parseInt(parts[2]); // Sequence
            
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Find the maximum sequence number for a given prefix and month
     * This method would typically query the database
     * For now, we'll simulate with a simple counter
     */
    private int findMaxSequenceForMonth(String prefix, String yearMonth) {
        // In a real implementation, you would query the database:
        // SELECT MAX(CAST(SUBSTRING(number FROM '^PREFIX-YYYYMM-(\d+)$') AS INTEGER))
        // FROM table WHERE number LIKE 'PREFIX-YYYYMM-%'
        
        // For simulation, we'll return the current counter value
        if (prefix.equals(QUOTE_PREFIX)) {
            return quoteCounter.get();
        } else if (prefix.equals(INVOICE_PREFIX)) {
            return invoiceCounter.get();
        }
        
        return 0;
    }
    
    /**
     * Find the maximum sequence number for daily numbers
     */
    private int findMaxSequenceForDaily(String prefix, String dateStr) {
        // Similar to findMaxSequenceForMonth but for daily
        return 0; // Simplified for now
    }
    
    /**
     * Find the maximum sequence number for simple sequential numbers
     */
    private int findMaxSequence(String prefix) {
        // Query the database for max sequence
        return 0; // Simplified for now
    }
    
    /**
     * Parse year and month from a generated number
     */
    public int[] parseYearMonth(String number) {
        try {
            String[] parts = number.split("-");
            if (parts.length >= 2) {
                String datePart = parts[1];
                if (datePart.length() == 6) { // YYYYMM format
                    int year = Integer.parseInt(datePart.substring(0, 4));
                    int month = Integer.parseInt(datePart.substring(4, 6));
                    return new int[]{year, month};
                }
            }
        } catch (Exception e) {
            // Return current year and month if parsing fails
        }
        
        LocalDate now = LocalDate.now();
        return new int[]{now.getYear(), now.getMonthValue()};
    }
    
    /**
     * Get the next number in sequence (increments the last number)
     */
    public String getNextNumber(String currentNumber) {
        try {
            String[] parts = currentNumber.split("-");
            if (parts.length == 3) {
                String prefix = parts[0];
                String datePart = parts[1];
                int sequence = Integer.parseInt(parts[2]);
                
                // Increment sequence
                sequence++;
                
                // Format with leading zeros
                return prefix + "-" + datePart + "-" + String.format("%03d", sequence);
            }
        } catch (Exception e) {
            // If parsing fails, generate a new number
        }
        
        // Fallback: generate a new number based on prefix
        if (currentNumber.startsWith(QUOTE_PREFIX)) {
            return generateQuoteNumber();
        } else if (currentNumber.startsWith(INVOICE_PREFIX)) {
            return generateInvoiceNumber();
        }
        
        return generateCustomNumber("NUM");
    }
    
    /**
     * Reset counters (useful for testing)
     */
    public void resetCounters() {
        quoteCounter.set(0);
        invoiceCounter.set(0);
    }
    
    /**
     * Generate a quote number with custom year and month (for testing/migration)
     */
    public String generateQuoteNumberForDate(int year, int month) {
        String yearMonth = String.format("%04d%02d", year, month);
        String baseNumber = QUOTE_PREFIX + yearMonth + "-";
        
        // Get the highest sequence number for this month
        int maxSequence = findMaxSequenceForMonth(QUOTE_PREFIX, yearMonth);
        
        // Increment and format with leading zeros
        int sequenceNumber = maxSequence + 1;
        return baseNumber + String.format("%03d", sequenceNumber);
    }
    
    /**
     * Generate an invoice number with custom year and month (for testing/migration)
     */
    public String generateInvoiceNumberForDate(int year, int month) {
        String yearMonth = String.format("%04d%02d", year, month);
        String baseNumber = INVOICE_PREFIX + yearMonth + "-";
        
        // Get the highest sequence number for this month
        int maxSequence = findMaxSequenceForMonth(INVOICE_PREFIX, yearMonth);
        
        // Increment and format with leading zeros
        int sequenceNumber = maxSequence + 1;
        return baseNumber + String.format("%03d", sequenceNumber);
    }
    
    /**
     * Generate a unique file reference number
     * Format: FILE-YYYYMM-XXXXXXXX (where X is random hex)
     */
    public String generateFileReference() {
        LocalDate now = LocalDate.now();
        String yearMonth = now.format(YEAR_MONTH_FORMATTER);
        String randomPart = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "FILE-" + yearMonth + "-" + randomPart;
    }
    
    /**
     * Generate a payment reference number
     * Format: PAY-YYYYMM-XXXXXX (where X is random hex)
     */
    public String generatePaymentReference() {
        LocalDate now = LocalDate.now();
        String yearMonth = now.format(YEAR_MONTH_FORMATTER);
        String randomPart = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
        return "PAY-" + yearMonth + "-" + randomPart;
    }
    
    /**
     * Generate a project reference code
     * Format: PRJ-XXXX-XXXX (where X is alphanumeric)
     */
    public String generateProjectCode() {
        String part1 = UUID.randomUUID().toString().replace("-", "").substring(0, 4).toUpperCase();
        String part2 = UUID.randomUUID().toString().replace("-", "").substring(0, 4).toUpperCase();
        return "PRJ-" + part1 + "-" + part2;
    }
}