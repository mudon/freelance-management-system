package com.example.freelanceapp.dtos.project;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {
    private UUID id;
    private UUID userId;
    private UUID clientId;
    private String clientName;
    private String clientContactName;
    private String name;
    private String description;
    private String status;
    private BigDecimal hourlyRate;
    private BigDecimal fixedPrice;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate dueDate;
    private List<String> tags;
    private String metadata;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}