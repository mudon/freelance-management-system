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
public class UpcomingReminderResponse {
    private UUID id;
    private String title;
    private String description;
    private String relatedType;
    private String relatedEntityName;
    private LocalDate dueDate;
    private LocalTime dueTime;
    private String priority;
    private Boolean isRecurring;
    private LocalDateTime nextOccurrence;
    private Long daysUntilDue;
    private Boolean isDueToday;
}