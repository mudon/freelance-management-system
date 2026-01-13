package com.example.freelanceapp.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLogSummaryResponse {
    private Long totalActivities;
    private Long todayCount;
    private Long thisWeekCount;
    private Long thisMonthCount;
    private Map<String, Long> actionsByType;
    private Map<String, Long> entitiesByType;
    private Map<String, Long> activitiesByDay;
}