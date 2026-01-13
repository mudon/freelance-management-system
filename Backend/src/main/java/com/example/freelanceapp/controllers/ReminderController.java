package com.example.freelanceapp.controllers;

import com.example.freelanceapp.dtos.reminder.*;
import com.example.freelanceapp.entities.User;
import com.example.freelanceapp.repositories.UserRepository;
import com.example.freelanceapp.services.ReminderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reminders")
@RequiredArgsConstructor
public class ReminderController {

    private final ReminderService reminderService;
    private final UserRepository userRepository; // inject repository

    // Helper method to get current user ID
    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));
        return user.getId();
    }

    // Create a new reminder
    @PostMapping
    public ResponseEntity<ReminderResponse> createReminder(
            @Valid @RequestBody ReminderRequest request) {
        UUID userId = getCurrentUserId();
        ReminderResponse response = reminderService.createReminder(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get all reminders
    @GetMapping
    public ResponseEntity<List<ReminderResponse>> getAllReminders() {
        UUID userId = getCurrentUserId();
        List<ReminderResponse> reminders = reminderService.getAllReminders(userId);
        return ResponseEntity.ok(reminders);
    }

    // Get all reminders with pagination
    @GetMapping("/paginated")
    public ResponseEntity<Page<ReminderResponse>> getAllRemindersPaginated(Pageable pageable) {
        UUID userId = getCurrentUserId();
        Page<ReminderResponse> reminders = reminderService.getAllReminders(userId, pageable);
        return ResponseEntity.ok(reminders);
    }

    // Get reminder by ID
    @GetMapping("/{reminderId}")
    public ResponseEntity<ReminderResponse> getReminderById(@PathVariable UUID reminderId) {
        UUID userId = getCurrentUserId();
        ReminderResponse reminder = reminderService.getReminderById(userId, reminderId);
        return ResponseEntity.ok(reminder);
    }

    // Update reminder
    @PutMapping("/{reminderId}")
    public ResponseEntity<ReminderResponse> updateReminder(
            @PathVariable UUID reminderId,
            @Valid @RequestBody ReminderRequest request) {
        UUID userId = getCurrentUserId();
        ReminderResponse updatedReminder = reminderService.updateReminder(userId, reminderId, request);
        return ResponseEntity.ok(updatedReminder);
    }

    // Delete reminder
    @DeleteMapping("/{reminderId}")
    public ResponseEntity<Void> deleteReminder(@PathVariable UUID reminderId) {
        UUID userId = getCurrentUserId();
        reminderService.deleteReminder(userId, reminderId);
        return ResponseEntity.noContent().build();
    }

    // Mark reminder as completed
    @PostMapping("/{reminderId}/complete")
    public ResponseEntity<ReminderResponse> markAsCompleted(@PathVariable UUID reminderId) {
        UUID userId = getCurrentUserId();
        ReminderResponse completedReminder = reminderService.markAsCompleted(userId, reminderId);
        return ResponseEntity.ok(completedReminder);
    }

    // Mark reminder as pending
    @PostMapping("/{reminderId}/pending")
    public ResponseEntity<ReminderResponse> markAsPending(@PathVariable UUID reminderId) {
        UUID userId = getCurrentUserId();
        ReminderResponse pendingReminder = reminderService.markAsPending(userId, reminderId);
        return ResponseEntity.ok(pendingReminder);
    }

    // Cancel reminder
    @PostMapping("/{reminderId}/cancel")
    public ResponseEntity<ReminderResponse> cancelReminder(@PathVariable UUID reminderId) {
        UUID userId = getCurrentUserId();
        ReminderResponse cancelledReminder = reminderService.cancelReminder(userId, reminderId);
        return ResponseEntity.ok(cancelledReminder);
    }

    // Snooze reminder
    @PostMapping("/{reminderId}/snooze")
    public ResponseEntity<ReminderResponse> snoozeReminder(
            @PathVariable UUID reminderId,
            @RequestParam(defaultValue = "1") int days,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime newTime) {
        UUID userId = getCurrentUserId();
        ReminderResponse snoozedReminder = reminderService.snoozeReminder(userId, reminderId, days, newTime);
        return ResponseEntity.ok(snoozedReminder);
    }

    // Get reminders by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ReminderResponse>> getRemindersByStatus(@PathVariable String status) {
        UUID userId = getCurrentUserId();
        List<ReminderResponse> reminders = reminderService.getRemindersByStatus(userId, status);
        return ResponseEntity.ok(reminders);
    }

    // Get reminders by priority
    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<ReminderResponse>> getRemindersByPriority(@PathVariable String priority) {
        UUID userId = getCurrentUserId();
        List<ReminderResponse> reminders = reminderService.getRemindersByPriority(userId, priority);
        return ResponseEntity.ok(reminders);
    }

    // Get reminders by related entity
    @GetMapping("/related/{relatedType}/{relatedId}")
    public ResponseEntity<List<ReminderResponse>> getRemindersByRelatedEntity(
            @PathVariable String relatedType,
            @PathVariable UUID relatedId) {
        UUID userId = getCurrentUserId();
        List<ReminderResponse> reminders = reminderService.getRemindersByRelatedEntity(userId, relatedType, relatedId);
        return ResponseEntity.ok(reminders);
    }

    // Search reminders
    @GetMapping("/search")
    public ResponseEntity<List<ReminderResponse>> searchReminders(@RequestParam String query) {
        UUID userId = getCurrentUserId();
        List<ReminderResponse> reminders = reminderService.searchReminders(userId, query);
        return ResponseEntity.ok(reminders);
    }

    // Get reminder summary
    @GetMapping("/summary")
    public ResponseEntity<ReminderSummaryResponse> getReminderSummary() {
        UUID userId = getCurrentUserId();
        ReminderSummaryResponse summary = reminderService.getReminderSummary(userId);
        return ResponseEntity.ok(summary);
    }

    // Get due today reminders
    @GetMapping("/due-today")
    public ResponseEntity<List<ReminderResponse>> getDueTodayReminders() {
        UUID userId = getCurrentUserId();
        List<ReminderResponse> reminders = reminderService.getDueTodayReminders(userId);
        return ResponseEntity.ok(reminders);
    }

    // Get overdue reminders
    @GetMapping("/overdue")
    public ResponseEntity<List<ReminderResponse>> getOverdueReminders() {
        UUID userId = getCurrentUserId();
        List<ReminderResponse> reminders = reminderService.getOverdueReminders(userId);
        return ResponseEntity.ok(reminders);
    }

    // Get upcoming reminders
    @GetMapping("/upcoming")
    public ResponseEntity<List<UpcomingReminderResponse>> getUpcomingReminders(
            @RequestParam(defaultValue = "10") int limit) {
        UUID userId = getCurrentUserId();
        List<UpcomingReminderResponse> reminders = reminderService.getUpcomingReminders(userId, limit);
        return ResponseEntity.ok(reminders);
    }

    // Get reminders by due date range
    @GetMapping("/due-range")
    public ResponseEntity<List<ReminderResponse>> getRemindersByDueDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        UUID userId = getCurrentUserId();
        List<ReminderResponse> reminders = reminderService.getRemindersByDueDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(reminders);
    }

    // Get completed reminders in date range
    @GetMapping("/completed-range")
    public ResponseEntity<List<ReminderResponse>> getCompletedRemindersInRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        UUID userId = getCurrentUserId();
        List<ReminderResponse> reminders = reminderService.getCompletedRemindersInRange(userId, startDate, endDate);
        return ResponseEntity.ok(reminders);
    }

    // Get active recurring reminders
    @GetMapping("/recurring")
    public ResponseEntity<List<ReminderResponse>> getActiveRecurringReminders() {
        UUID userId = getCurrentUserId();
        List<ReminderResponse> reminders = reminderService.getActiveRecurringReminders(userId);
        return ResponseEntity.ok(reminders);
    }

    // Get reminders count
    @GetMapping("/count")
    public ResponseEntity<Long> getRemindersCount() {
        UUID userId = getCurrentUserId();
        Long count = reminderService.getRemindersCount(userId);
        return ResponseEntity.ok(count);
    }

    // Get reminders count by status
    @GetMapping("/count/status/{status}")
    public ResponseEntity<Long> getRemindersCountByStatus(@PathVariable String status) {
        UUID userId = getCurrentUserId();
        Long count = reminderService.getRemindersCountByStatus(userId, status);
        return ResponseEntity.ok(count);
    }

    // Get reminders count by priority
    @GetMapping("/count/priority/{priority}")
    public ResponseEntity<Long> getRemindersCountByPriority(@PathVariable String priority) {
        UUID userId = getCurrentUserId();
        Long count = reminderService.getRemindersCountByPriority(userId, priority);
        return ResponseEntity.ok(count);
    }

    // Get recent reminders
    @GetMapping("/recent")
    public ResponseEntity<List<ReminderResponse>> getRecentReminders(
            @RequestParam(defaultValue = "5") int limit) {
        UUID userId = getCurrentUserId();
        List<ReminderResponse> reminders = reminderService.getRecentReminders(userId, limit);
        return ResponseEntity.ok(reminders);
    }

    // Bulk update reminder status
    @PostMapping("/bulk-update")
    public ResponseEntity<Void> bulkUpdateReminderStatus(
            @RequestBody List<UUID> reminderIds,
            @RequestParam String status) {
        UUID userId = getCurrentUserId();
        reminderService.bulkUpdateReminderStatus(userId, reminderIds, status);
        return ResponseEntity.noContent().build();
    }
}