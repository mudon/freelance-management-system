package com.example.freelanceapp.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogRequest {
    private String action;
    private String entityType;
    private UUID entityId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String searchTerm;
}