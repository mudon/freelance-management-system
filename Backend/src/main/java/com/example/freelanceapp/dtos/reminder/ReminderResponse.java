package com.example.freelanceapp.dtos.reminder;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReminderResponse {
    private UUID id;
    private UUID userId;
    private String title;
    private String description;
    private String relatedType;
    private UUID relatedId;
    private String relatedEntityName;
    private LocalDate dueDate;
    private LocalTime dueTime;
    private String status;
    private String priority;
    private Boolean isRecurring;
    private String recurrencePattern;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isOverdue;
    private Boolean isDueToday;
    private LocalDateTime nextOccurrence;
}