package com.example.freelanceapp.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogResponse {
    private UUID id;
    private UUID userId;
    private String userName;
    private String userEmail;
    private String action;
    private String entityType;
    private UUID entityId;
    private String entityName;
    private String description;
    private String ipAddress;
    private String userAgent;
    private String metadata;
    private LocalDateTime createdAt;
    private String timeAgo;
}