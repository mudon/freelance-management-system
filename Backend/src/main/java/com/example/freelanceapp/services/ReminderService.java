package com.example.freelanceapp.services;

import com.example.freelanceapp.dtos.reminder.*;
import com.example.freelanceapp.entities.*;
import com.example.freelanceapp.exceptions.BadRequestException;
import com.example.freelanceapp.exceptions.NotFoundException;
import com.example.freelanceapp.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReminderService {

    private final ReminderRepository reminderRepository;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final QuoteRepository quoteRepository;
    private final InvoiceRepository invoiceRepository;

    // Map Entity to Response DTO
    private ReminderResponse mapToResponse(Reminder reminder) {
        String relatedEntityName = getRelatedEntityName(reminder);
        LocalDate today = LocalDate.now();
        
        return new ReminderResponse(
            reminder.getId(),
            reminder.getUser().getId(),
            reminder.getTitle(),
            reminder.getDescription(),
            reminder.getRelatedType(),
            reminder.getRelatedId(),
            relatedEntityName,
            reminder.getDueDate(),
            reminder.getDueTime(),
            reminder.getStatus(),
            reminder.getPriority(),
            reminder.getIsRecurring(),
            reminder.getRecurrencePattern(),
            reminder.getCompletedAt(),
            reminder.getCreatedAt(),
            reminder.getUpdatedAt(),
            reminder.getDueDate() != null && reminder.getDueDate().isBefore(today) && 
                "pending".equals(reminder.getStatus()),
            reminder.getDueDate() != null && reminder.getDueDate().equals(today) && 
                "pending".equals(reminder.getStatus()),
            calculateNextOccurrence(reminder)
        );
    }
    
    private LocalDateTime calculateNextOccurrence(Reminder reminder) {
        if (!Boolean.TRUE.equals(reminder.getIsRecurring()) || reminder.getDueDate() == null) {
            return null;
        }
        
        LocalDate nextDate = reminder.getDueDate();
        LocalTime nextTime = reminder.getDueTime() != null ? reminder.getDueTime() : LocalTime.of(9, 0);
        
        while (nextDate.isBefore(LocalDate.now()) || 
               (nextDate.equals(LocalDate.now()) && 
                nextTime != null && nextTime.isBefore(LocalTime.now()))) {
            nextDate = calculateNextRecurrenceDate(nextDate, reminder.getRecurrencePattern());
        }
        
        return LocalDateTime.of(nextDate, nextTime);
    }
    
    private LocalDate calculateNextRecurrenceDate(LocalDate currentDate, String recurrencePattern) {
        if (recurrencePattern == null) {
            return currentDate.plusDays(1);
        }
        
        return switch (recurrencePattern.toLowerCase()) {
            case "daily" -> currentDate.plusDays(1);
            case "weekly" -> currentDate.plusWeeks(1);
            case "monthly" -> currentDate.plusMonths(1);
            case "yearly" -> currentDate.plusYears(1);
            default -> currentDate.plusDays(1);
        };
    }

    // Get related entity name for display
    private String getRelatedEntityName(Reminder reminder) {
        if (reminder.getRelatedType() == null || reminder.getRelatedId() == null) {
            return null;
        }
        
        try {
            return switch (reminder.getRelatedType().toLowerCase()) {
                case "client" -> {
                    Client client = clientRepository.findById(reminder.getRelatedId()).orElse(null);
                    yield client != null ? 
                        (client.getCompanyName() != null ? client.getCompanyName() : client.getContactName()) : 
                        null;
                }
                case "project" -> {
                    Project project = projectRepository.findById(reminder.getRelatedId()).orElse(null);
                    yield project != null ? project.getName() : null;
                }
                case "quote" -> {
                    Quote quote = quoteRepository.findById(reminder.getRelatedId()).orElse(null);
                    yield quote != null ? quote.getTitle() + " (" + quote.getQuoteNumber() + ")" : null;
                }
                case "invoice" -> {
                    Invoice invoice = invoiceRepository.findById(reminder.getRelatedId()).orElse(null);
                    yield invoice != null ? invoice.getTitle() + " (" + invoice.getInvoiceNumber() + ")" : null;
                }
                default -> null;
            };
        } catch (Exception e) {
            return null;
        }
    }

    // Map Request to Entity
    private Reminder mapToEntity(ReminderRequest request, User user) {
        Reminder reminder = new Reminder();
        reminder.setUser(user);
        reminder.setTitle(request.getTitle());
        reminder.setDescription(request.getDescription());
        reminder.setRelatedType(request.getRelatedType());
        reminder.setRelatedId(request.getRelatedId());
        reminder.setDueDate(request.getDueDate());
        reminder.setDueTime(request.getDueTime());
        reminder.setStatus(request.getStatus() != null ? request.getStatus() : "pending");
        reminder.setPriority(request.getPriority() != null ? request.getPriority() : "medium");
        reminder.setIsRecurring(request.getIsRecurring() != null ? request.getIsRecurring() : false);
        reminder.setRecurrencePattern(request.getRecurrencePattern());
        
        return reminder;
    }

    // Validate reminder data
    private void validateReminder(ReminderRequest request) {
        if (request.getDueDate() != null && request.getDueDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Due date cannot be in the past for new reminders");
        }
        
        if (Boolean.TRUE.equals(request.getIsRecurring()) && 
            (request.getRecurrencePattern() == null || request.getRecurrencePattern().trim().isEmpty())) {
            throw new BadRequestException("Recurrence pattern is required for recurring reminders");
        }
        
        if (request.getRelatedType() != null && request.getRelatedId() == null) {
            throw new BadRequestException("Related ID is required when related type is specified");
        }
        
        if (request.getRelatedId() != null && request.getRelatedType() == null) {
            throw new BadRequestException("Related type is required when related ID is specified");
        }
    }

    // Create a new reminder
    @Transactional
    public ReminderResponse createReminder(UUID userId, ReminderRequest request) {
        // Find user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found"));

        // Validate reminder
        validateReminder(request);
        
        // Verify related entity exists and belongs to user
        if (request.getRelatedType() != null && request.getRelatedId() != null) {
            verifyRelatedEntity(userId, request.getRelatedType(), request.getRelatedId());
        }

        // Create reminder
        Reminder reminder = mapToEntity(request, user);
        Reminder savedReminder = reminderRepository.save(reminder);
        
        return mapToResponse(savedReminder);
    }

    // Verify related entity exists and belongs to user
    private void verifyRelatedEntity(UUID userId, String relatedType, UUID relatedId) {
        boolean exists = switch (relatedType.toLowerCase()) {
            case "client" -> clientRepository.findByIdAndUserId(relatedId, userId).isPresent();
            case "project" -> projectRepository.findByIdAndUserId(relatedId, userId).isPresent();
            case "quote" -> quoteRepository.findByIdAndUserId(relatedId, userId).isPresent();
            case "invoice" -> invoiceRepository.findByIdAndUserId(relatedId, userId).isPresent();
            default -> throw new BadRequestException("Invalid related type: " + relatedType);
        };
        
        if (!exists) {
            throw new NotFoundException(relatedType + " not found or not authorized");
        }
    }

    // Get reminder by ID
    public ReminderResponse getReminderById(UUID userId, UUID reminderId) {
        Reminder reminder = reminderRepository.findByIdAndUserId(reminderId, userId)
            .orElseThrow(() -> new NotFoundException("Reminder not found"));
        return mapToResponse(reminder);
    }

    // Get all reminders for a user
    public List<ReminderResponse> getAllReminders(UUID userId) {
        return reminderRepository.findByUserId(userId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get all reminders with pagination
    public Page<ReminderResponse> getAllReminders(UUID userId, Pageable pageable) {
        return reminderRepository.findByUserId(userId, pageable)
            .map(this::mapToResponse);
    }

    // Get reminders by status
    public List<ReminderResponse> getRemindersByStatus(UUID userId, String status) {
        return reminderRepository.findByUserIdAndStatus(userId, status).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get reminders by priority
    public List<ReminderResponse> getRemindersByPriority(UUID userId, String priority) {
        return reminderRepository.findByUserIdAndPriority(userId, priority).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get reminders by related entity
    public List<ReminderResponse> getRemindersByRelatedEntity(UUID userId, String relatedType, UUID relatedId) {
        // Verify related entity exists and belongs to user
        verifyRelatedEntity(userId, relatedType, relatedId);
        
        return reminderRepository.findByUserIdAndRelatedTypeAndRelatedId(userId, relatedType, relatedId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Update reminder
    @Transactional
    public ReminderResponse updateReminder(UUID userId, UUID reminderId, ReminderRequest request) {
        Reminder reminder = reminderRepository.findByIdAndUserId(reminderId, userId)
            .orElseThrow(() -> new NotFoundException("Reminder not found"));

        // Validate reminder
        validateReminder(request);
        
        // Verify related entity exists and belongs to user
        if (request.getRelatedType() != null && request.getRelatedId() != null) {
            verifyRelatedEntity(userId, request.getRelatedType(), request.getRelatedId());
        }

        // Update fields
        if (request.getTitle() != null) {
            reminder.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            reminder.setDescription(request.getDescription());
        }
        if (request.getRelatedType() != null) {
            reminder.setRelatedType(request.getRelatedType());
        }
        if (request.getRelatedId() != null) {
            reminder.setRelatedId(request.getRelatedId());
        }
        if (request.getDueDate() != null) {
            reminder.setDueDate(request.getDueDate());
        }
        if (request.getDueTime() != null) {
            reminder.setDueTime(request.getDueTime());
        }
        if (request.getStatus() != null) {
            reminder.setStatus(request.getStatus());
            
            // Update completedAt if marking as completed
            if ("completed".equals(request.getStatus()) && reminder.getCompletedAt() == null) {
                reminder.setCompletedAt(LocalDateTime.now());
            } else if (!"completed".equals(request.getStatus())) {
                reminder.setCompletedAt(null);
            }
        }
        if (request.getPriority() != null) {
            reminder.setPriority(request.getPriority());
        }
        if (request.getIsRecurring() != null) {
            reminder.setIsRecurring(request.getIsRecurring());
        }
        if (request.getRecurrencePattern() != null) {
            reminder.setRecurrencePattern(request.getRecurrencePattern());
        }

        // Handle recurrence - if completed and recurring, create next occurrence
        if ("completed".equals(request.getStatus()) && Boolean.TRUE.equals(reminder.getIsRecurring())) {
            createNextRecurrence(reminder);
        }

        Reminder updatedReminder = reminderRepository.save(reminder);
        return mapToResponse(updatedReminder);
    }

    // Create next recurrence for completed recurring reminder
    @Transactional
    private void createNextRecurrence(Reminder originalReminder) {
        if (!Boolean.TRUE.equals(originalReminder.getIsRecurring()) || 
            originalReminder.getDueDate() == null) {
            return;
        }
        
        LocalDate nextDueDate = calculateNextRecurrenceDate(
            originalReminder.getDueDate(), 
            originalReminder.getRecurrencePattern()
        );
        
        // Create new reminder for next occurrence
        Reminder nextReminder = new Reminder();
        nextReminder.setUser(originalReminder.getUser());
        nextReminder.setTitle(originalReminder.getTitle());
        nextReminder.setDescription(originalReminder.getDescription());
        nextReminder.setRelatedType(originalReminder.getRelatedType());
        nextReminder.setRelatedId(originalReminder.getRelatedId());
        nextReminder.setDueDate(nextDueDate);
        nextReminder.setDueTime(originalReminder.getDueTime());
        nextReminder.setStatus("pending");
        nextReminder.setPriority(originalReminder.getPriority());
        nextReminder.setIsRecurring(originalReminder.getIsRecurring());
        nextReminder.setRecurrencePattern(originalReminder.getRecurrencePattern());
        
        reminderRepository.save(nextReminder);
    }

    // Delete reminder
    @Transactional
    public void deleteReminder(UUID userId, UUID reminderId) {
        Reminder reminder = reminderRepository.findByIdAndUserId(reminderId, userId)
            .orElseThrow(() -> new NotFoundException("Reminder not found"));
        
        reminderRepository.delete(reminder);
    }

    // Mark reminder as completed
    @Transactional
    public ReminderResponse markAsCompleted(UUID userId, UUID reminderId) {
        Reminder reminder = reminderRepository.findByIdAndUserId(reminderId, userId)
            .orElseThrow(() -> new NotFoundException("Reminder not found"));
        
        if ("completed".equals(reminder.getStatus())) {
            throw new BadRequestException("Reminder is already completed");
        }
        
        reminder.setStatus("completed");
        reminder.setCompletedAt(LocalDateTime.now());
        
        // Handle recurrence
        if (Boolean.TRUE.equals(reminder.getIsRecurring())) {
            createNextRecurrence(reminder);
        }
        
        Reminder updatedReminder = reminderRepository.save(reminder);
        return mapToResponse(updatedReminder);
    }

    // Mark reminder as pending
    @Transactional
    public ReminderResponse markAsPending(UUID userId, UUID reminderId) {
        Reminder reminder = reminderRepository.findByIdAndUserId(reminderId, userId)
            .orElseThrow(() -> new NotFoundException("Reminder not found"));
        
        if ("pending".equals(reminder.getStatus())) {
            throw new BadRequestException("Reminder is already pending");
        }
        
        reminder.setStatus("pending");
        reminder.setCompletedAt(null);
        
        Reminder updatedReminder = reminderRepository.save(reminder);
        return mapToResponse(updatedReminder);
    }

    // Cancel reminder
    @Transactional
    public ReminderResponse cancelReminder(UUID userId, UUID reminderId) {
        Reminder reminder = reminderRepository.findByIdAndUserId(reminderId, userId)
            .orElseThrow(() -> new NotFoundException("Reminder not found"));
        
        if ("cancelled".equals(reminder.getStatus())) {
            throw new BadRequestException("Reminder is already cancelled");
        }
        
        reminder.setStatus("cancelled");
        
        Reminder updatedReminder = reminderRepository.save(reminder);
        return mapToResponse(updatedReminder);
    }

    // Search reminders
    public List<ReminderResponse> searchReminders(UUID userId, String searchTerm) {
        return reminderRepository.searchByUser(userId, searchTerm).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get due today reminders
    public List<ReminderResponse> getDueTodayReminders(UUID userId) {
        return reminderRepository.findDueToday(userId, LocalDate.now()).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get overdue reminders
    public List<ReminderResponse> getOverdueReminders(UUID userId) {
        return reminderRepository.findOverdue(userId, LocalDate.now()).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get reminders by due date range
    public List<ReminderResponse> getRemindersByDueDateRange(UUID userId, LocalDate startDate, LocalDate endDate) {
        return reminderRepository.findByDueDateRange(userId, startDate, endDate).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get upcoming reminders
    public List<UpcomingReminderResponse> getUpcomingReminders(UUID userId, int limit) {
        List<Reminder> reminders = reminderRepository.findUpcomingReminders(userId,
            org.springframework.data.domain.PageRequest.of(0, limit));
        
        LocalDate today = LocalDate.now();
        
        return reminders.stream()
            .map(reminder -> {
                String relatedEntityName = getRelatedEntityName(reminder);
                LocalDate dueDate = reminder.getDueDate();
                long daysUntilDue = dueDate != null ? ChronoUnit.DAYS.between(today, dueDate) : 0;
                
                return new UpcomingReminderResponse(
                    reminder.getId(),
                    reminder.getTitle(),
                    reminder.getDescription(),
                    reminder.getRelatedType(),
                    relatedEntityName,
                    reminder.getDueDate(),
                    reminder.getDueTime(),
                    reminder.getPriority(),
                    reminder.getIsRecurring(),
                    calculateNextOccurrence(reminder),
                    daysUntilDue,
                    dueDate != null && dueDate.equals(today)
                );
            })
            .collect(Collectors.toList());
    }

    // Get reminder summary
    public ReminderSummaryResponse getReminderSummary(UUID userId) {
        Long totalReminders = reminderRepository.countByUserId(userId);
        Long pendingCount = reminderRepository.countByUserIdAndStatus(userId, "pending");
        Long completedCount = reminderRepository.countByUserIdAndStatus(userId, "completed");
        Long overdueCount = (long) reminderRepository.findOverdue(userId, LocalDate.now()).size();
        Long dueTodayCount = (long) reminderRepository.findDueToday(userId, LocalDate.now()).size();
        Long highPriorityCount = reminderRepository.countByUserIdAndPriority(userId, "high");
        Long recurringCount = reminderRepository.countRecurringByUserId(userId);
        
        return new ReminderSummaryResponse(
            totalReminders,
            pendingCount,
            completedCount,
            overdueCount,
            dueTodayCount,
            highPriorityCount,
            recurringCount
        );
    }

    // Get reminders count
    public Long getRemindersCount(UUID userId) {
        return reminderRepository.countByUserId(userId);
    }

    // Get reminders count by status
    public Long getRemindersCountByStatus(UUID userId, String status) {
        return reminderRepository.countByUserIdAndStatus(userId, status);
    }

    // Get reminders count by priority
    public Long getRemindersCountByPriority(UUID userId, String priority) {
        return reminderRepository.countByUserIdAndPriority(userId, priority);
    }

    // Get active recurring reminders
    public List<ReminderResponse> getActiveRecurringReminders(UUID userId) {
        return reminderRepository.findActiveRecurringReminders(userId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get completed reminders in date range
    public List<ReminderResponse> getCompletedRemindersInRange(UUID userId, LocalDateTime startDate, LocalDateTime endDate) {
        return reminderRepository.findCompletedInDateRange(userId, startDate, endDate).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get recent reminders
    public List<ReminderResponse> getRecentReminders(UUID userId, int limit) {
        return reminderRepository.findRecentByUser(userId,
            org.springframework.data.domain.PageRequest.of(0, limit))
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Snooze reminder (update due date)
    @Transactional
    public ReminderResponse snoozeReminder(UUID userId, UUID reminderId, int days, LocalTime newTime) {
        Reminder reminder = reminderRepository.findByIdAndUserId(reminderId, userId)
            .orElseThrow(() -> new NotFoundException("Reminder not found"));
        
        if (!"pending".equals(reminder.getStatus())) {
            throw new BadRequestException("Only pending reminders can be snoozed");
        }
        
        // Calculate new due date
        LocalDate currentDueDate = reminder.getDueDate() != null ? reminder.getDueDate() : LocalDate.now();
        LocalDate newDueDate = currentDueDate.plusDays(days);
        
        reminder.setDueDate(newDueDate);
        if (newTime != null) {
            reminder.setDueTime(newTime);
        }
        
        Reminder updatedReminder = reminderRepository.save(reminder);
        return mapToResponse(updatedReminder);
    }

    // Bulk update reminder status
    @Transactional
    public void bulkUpdateReminderStatus(UUID userId, List<UUID> reminderIds, String status) {
        if (!Arrays.asList("pending", "completed", "cancelled").contains(status)) {
            throw new BadRequestException("Invalid status: " + status);
        }
        
        List<Reminder> reminders = reminderRepository.findAllById(reminderIds);
        
        // Filter reminders belonging to user
        List<Reminder> userReminders = reminders.stream()
            .filter(reminder -> reminder.getUser().getId().equals(userId))
            .collect(Collectors.toList());
        
        // Update status
        for (Reminder reminder : userReminders) {
            reminder.setStatus(status);
            
            if ("completed".equals(status) && reminder.getCompletedAt() == null) {
                reminder.setCompletedAt(LocalDateTime.now());
                
                // Handle recurrence for completed reminders
                if (Boolean.TRUE.equals(reminder.getIsRecurring())) {
                    createNextRecurrence(reminder);
                }
            } else if (!"completed".equals(status)) {
                reminder.setCompletedAt(null);
            }
        }
        
        reminderRepository.saveAll(userReminders);
    }
}