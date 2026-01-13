package com.example.freelanceapp.dtos.reminder;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReminderSummaryResponse {
    private Long totalReminders;
    private Long pendingCount;
    private Long completedCount;
    private Long overdueCount;
    private Long dueTodayCount;
    private Long highPriorityCount;
    private Long recurringCount;
}