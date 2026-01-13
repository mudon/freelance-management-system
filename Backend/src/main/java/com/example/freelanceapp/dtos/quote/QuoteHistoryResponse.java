package com.example.freelanceapp.dtos.quote;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuoteHistoryResponse {
    private UUID id;
    private UUID quoteId;
    private String action;
    private String description;
    private String ipAddress;
    private String userAgent;
    private String metadata;
    private LocalDateTime createdAt;
}