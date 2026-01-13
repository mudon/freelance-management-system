package com.example.freelanceapp.dtos.reminder;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReminderRequest {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    private String relatedType; // invoice, quote, project, client
    private UUID relatedId;
    private LocalDate dueDate;
    private LocalTime dueTime;
    private String status;
    private String priority; // low, medium, high
    private Boolean isRecurring;
    private String recurrencePattern; // daily, weekly, monthly
}