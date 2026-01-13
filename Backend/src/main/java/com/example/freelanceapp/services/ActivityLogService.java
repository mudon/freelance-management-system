package com.example.freelanceapp.services;

import com.example.freelanceapp.dtos.ActivityLogResponse;
import com.example.freelanceapp.dtos.ActivityLogSummaryResponse;
import com.example.freelanceapp.entities.*;
import com.example.freelanceapp.exceptions.NotFoundException;
import com.example.freelanceapp.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final QuoteRepository quoteRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoicePaymentRepository invoicePaymentRepository;
    private final ReminderRepository reminderRepository;

    // Map Entity to Response DTO
    private ActivityLogResponse mapToResponse(ActivityLog activityLog) {
        String entityName = getEntityName(activityLog.getEntityType(), activityLog.getEntityId());
        String timeAgo = calculateTimeAgo(activityLog.getCreatedAt());
        
        return new ActivityLogResponse(
            activityLog.getId(),
            activityLog.getUser().getId(),
            activityLog.getUser().getFirstName() + " " + activityLog.getUser().getLastName(),
            activityLog.getUser().getEmail(),
            activityLog.getAction(),
            activityLog.getEntityType(),
            activityLog.getEntityId(),
            entityName,
            activityLog.getDescription(),
            activityLog.getIpAddress(),
            activityLog.getUserAgent(),
            activityLog.getMetadata(),
            activityLog.getCreatedAt(),
            timeAgo
        );
    }

    // Calculate time ago for display
    private String calculateTimeAgo(LocalDateTime dateTime) {
        Duration duration = Duration.between(dateTime, LocalDateTime.now());
        
        long minutes = duration.toMinutes();
        if (minutes < 1) {
            return "Just now";
        } else if (minutes < 60) {
            return minutes + " minute" + (minutes > 1 ? "s" : "") + " ago";
        }
        
        long hours = duration.toHours();
        if (hours < 24) {
            return hours + " hour" + (hours > 1 ? "s" : "") + " ago";
        }
        
        long days = duration.toDays();
        if (days < 7) {
            return days + " day" + (days > 1 ? "s" : "") + " ago";
        }
        
        long weeks = days / 7;
        if (weeks < 4) {
            return weeks + " week" + (weeks > 1 ? "s" : "") + " ago";
        }
        
        long months = days / 30;
        if (months < 12) {
            return months + " month" + (months > 1 ? "s" : "") + " ago";
        }
        
        long years = days / 365;
        return years + " year" + (years > 1 ? "s" : "") + " ago";
    }

    // Get entity name for display
    private String getEntityName(String entityType, UUID entityId) {
        if (entityType == null || entityId == null) {
            return null;
        }
        
        try {
            return switch (entityType.toLowerCase()) {
                case "user" -> {
                    User user = userRepository.findById(entityId).orElse(null);
                    yield user != null ? user.getFirstName() + " " + user.getLastName() : null;
                }
                case "client" -> {
                    Client client = clientRepository.findById(entityId).orElse(null);
                    yield client != null ? 
                        (client.getCompanyName() != null ? client.getCompanyName() : client.getContactName()) : 
                        null;
                }
                case "project" -> {
                    Project project = projectRepository.findById(entityId).orElse(null);
                    yield project != null ? project.getName() : null;
                }
                case "quote" -> {
                    Quote quote = quoteRepository.findById(entityId).orElse(null);
                    yield quote != null ? quote.getTitle() + " (" + quote.getQuoteNumber() + ")" : null;
                }
                case "invoice" -> {
                    Invoice invoice = invoiceRepository.findById(entityId).orElse(null);
                    yield invoice != null ? invoice.getTitle() + " (" + invoice.getInvoiceNumber() + ")" : null;
                }
                case "payment" -> {
                    InvoicePayment payment = invoicePaymentRepository.findById(entityId).orElse(null);
                    yield payment != null ? "Payment: " + payment.getAmount() + " " + payment.getCurrency() : null;
                }
                case "reminder" -> {
                    Reminder reminder = reminderRepository.findById(entityId).orElse(null);
                    yield reminder != null ? reminder.getTitle() : null;
                }
                default -> null;
            };
        } catch (Exception e) {
            return null;
        }
    }

    // Log an activity
    @Transactional
    public void logActivity(UUID userId, String action, String entityType, UUID entityId, 
                           String description, String ipAddress, String userAgent, String metadata) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found"));
        
        ActivityLog activityLog = new ActivityLog();
        activityLog.setUser(user);
        activityLog.setAction(action);
        activityLog.setEntityType(entityType);
        activityLog.setEntityId(entityId);
        activityLog.setDescription(description);
        activityLog.setIpAddress(ipAddress);
        activityLog.setUserAgent(userAgent);
        activityLog.setMetadata(metadata != null ? metadata : "{}");
        
        activityLogRepository.save(activityLog);
    }

    // Convenience methods for common activities
    @Transactional
    public void logUserActivity(UUID userId, String action, String description, 
                               String ipAddress, String userAgent) {
        logActivity(userId, action, "user", userId, description, ipAddress, userAgent, null);
    }
    
    @Transactional
    public void logClientActivity(UUID userId, String action, UUID clientId, String description,
                                 String ipAddress, String userAgent) {
        logActivity(userId, action, "client", clientId, description, ipAddress, userAgent, null);
    }
    
    @Transactional
    public void logProjectActivity(UUID userId, String action, UUID projectId, String description,
                                  String ipAddress, String userAgent) {
        logActivity(userId, action, "project", projectId, description, ipAddress, userAgent, null);
    }
    
    @Transactional
    public void logQuoteActivity(UUID userId, String action, UUID quoteId, String description,
                                String ipAddress, String userAgent) {
        logActivity(userId, action, "quote", quoteId, description, ipAddress, userAgent, null);
    }
    
    @Transactional
    public void logInvoiceActivity(UUID userId, String action, UUID invoiceId, String description,
                                  String ipAddress, String userAgent) {
        logActivity(userId, action, "invoice", invoiceId, description, ipAddress, userAgent, null);
    }
    
    @Transactional
    public void logPaymentActivity(UUID userId, String action, UUID paymentId, String description,
                                  String ipAddress, String userAgent) {
        logActivity(userId, action, "payment", paymentId, description, ipAddress, userAgent, null);
    }
    
    @Transactional
    public void logReminderActivity(UUID userId, String action, UUID reminderId, String description,
                                   String ipAddress, String userAgent) {
        logActivity(userId, action, "reminder", reminderId, description, ipAddress, userAgent, null);
    }

    // Get all activities for a user
    public List<ActivityLogResponse> getAllActivities(UUID userId) {
        return activityLogRepository.findByUserId(userId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get all activities with pagination
    public Page<ActivityLogResponse> getAllActivities(UUID userId, Pageable pageable) {
        return activityLogRepository.findByUserId(userId, pageable)
            .map(this::mapToResponse);
    }

    // Get activities by action
    public List<ActivityLogResponse> getActivitiesByAction(UUID userId, String action) {
        return activityLogRepository.findByUserIdAndAction(userId, action).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get activities by entity type
    public List<ActivityLogResponse> getActivitiesByEntityType(UUID userId, String entityType) {
        return activityLogRepository.findByUserIdAndEntityType(userId, entityType).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get activities by entity
    public List<ActivityLogResponse> getActivitiesByEntity(UUID userId, String entityType, UUID entityId) {
        return activityLogRepository.findByUserIdAndEntityTypeAndEntityId(userId, entityType, entityId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get activities by entity ID (any type)
    public List<ActivityLogResponse> getActivitiesByEntityId(UUID userId, UUID entityId) {
        return activityLogRepository.findByEntityId(userId, entityId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Search activities
    public List<ActivityLogResponse> searchActivities(UUID userId, String searchTerm) {
        return activityLogRepository.searchByUser(userId, searchTerm).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get activities by date range
    public List<ActivityLogResponse> getActivitiesByDateRange(UUID userId, LocalDateTime startDate, LocalDateTime endDate) {
        return activityLogRepository.findByDateRange(userId, startDate, endDate).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get today's activities
    public List<ActivityLogResponse> getTodayActivities(UUID userId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        
        return activityLogRepository.findByDateRange(userId, startOfDay, endOfDay).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get this week's activities
    public List<ActivityLogResponse> getThisWeekActivities(UUID userId) {
        LocalDateTime startOfWeek = LocalDate.now().with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY))
            .atStartOfDay();
        LocalDateTime endOfWeek = LocalDate.now().with(TemporalAdjusters.nextOrSame(java.time.DayOfWeek.SUNDAY))
            .atTime(LocalTime.MAX);
        
        return activityLogRepository.findByDateRange(userId, startOfWeek, endOfWeek).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get this month's activities
    public List<ActivityLogResponse> getThisMonthActivities(UUID userId) {
        LocalDateTime startOfMonth = LocalDate.now().with(TemporalAdjusters.firstDayOfMonth())
            .atStartOfDay();
        LocalDateTime endOfMonth = LocalDate.now().with(TemporalAdjusters.lastDayOfMonth())
            .atTime(LocalTime.MAX);
        
        return activityLogRepository.findByDateRange(userId, startOfMonth, endOfMonth).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get activity summary
    public ActivityLogSummaryResponse getActivitySummary(UUID userId) {
        Long totalActivities = activityLogRepository.countByUserId(userId);
        Long todayCount = activityLogRepository.countTodayByUserId(userId);
        
        LocalDateTime startOfWeek = LocalDate.now().with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY))
            .atStartOfDay();
        Long thisWeekCount = activityLogRepository.countThisWeekByUserId(userId, startOfWeek);
        
        LocalDateTime startOfMonth = LocalDate.now().with(TemporalAdjusters.firstDayOfMonth())
            .atStartOfDay();
        Long thisMonthCount = activityLogRepository.countThisMonthByUserId(userId, startOfMonth);
        
        // Get actions by type
        List<Object[]> actionsData = activityLogRepository.countActionsByType(userId);
        Map<String, Long> actionsByType = new LinkedHashMap<>();
        for (Object[] data : actionsData) {
            actionsByType.put((String) data[0], (Long) data[1]);
        }
        
        // Get entities by type
        List<Object[]> entitiesData = activityLogRepository.countEntitiesByType(userId);
        Map<String, Long> entitiesByType = new LinkedHashMap<>();
        for (Object[] data : entitiesData) {
            entitiesByType.put((String) data[0], (Long) data[1]);
        }
        
        // Get activities by day (last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Object[]> activitiesByDayData = activityLogRepository.countActivitiesByDay(userId, thirtyDaysAgo);
        Map<String, Long> activitiesByDay = new LinkedHashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");
        
        for (Object[] data : activitiesByDayData) {
            LocalDate date = ((java.sql.Date) data[0]).toLocalDate();
            String dateStr = date.format(formatter);
            activitiesByDay.put(dateStr, (Long) data[1]);
        }
        
        return new ActivityLogSummaryResponse(
            totalActivities,
            todayCount,
            thisWeekCount,
            thisMonthCount,
            actionsByType,
            entitiesByType,
            activitiesByDay
        );
    }

    // Get activities count
    public Long getActivitiesCount(UUID userId) {
        return activityLogRepository.countByUserId(userId);
    }

    // Get recent activities
    public List<ActivityLogResponse> getRecentActivities(UUID userId, int limit) {
        return activityLogRepository.findRecentByUser(userId,
            org.springframework.data.domain.PageRequest.of(0, limit))
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get activities by action and entity type
    public List<ActivityLogResponse> getActivitiesByActionAndEntityType(UUID userId, String action, String entityType) {
        return activityLogRepository.findByActionAndEntityType(userId, action, entityType).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Clear old activities (archive/cleanup)
    @Transactional
    public void clearOldActivities(UUID userId, int daysToKeep) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysToKeep);
        List<ActivityLog> oldActivities = activityLogRepository.findByDateRange(userId, 
            LocalDateTime.MIN, cutoffDate);
        
        if (!oldActivities.isEmpty()) {
            activityLogRepository.deleteAll(oldActivities);
            
            // Log the cleanup activity
            logUserActivity(userId, "cleanup", 
                "Cleared " + oldActivities.size() + " activities older than " + daysToKeep + " days",
                "system", "System Cleanup");
        }
    }

    // Export activities (simplified - in real app would generate CSV/PDF)
    public List<ActivityLogResponse> exportActivities(UUID userId, LocalDateTime startDate, LocalDateTime endDate) {
        return getActivitiesByDateRange(userId, startDate, endDate);
    }

    // Get user's activity timeline
    public List<ActivityLogResponse> getUserActivityTimeline(UUID userId) {
        return activityLogRepository.findByUserId(userId).stream()
            .sorted((a1, a2) -> a2.getCreatedAt().compareTo(a1.getCreatedAt()))
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get system-wide activities (admin only - would need admin check)
    public List<ActivityLogResponse> getAllSystemActivities() {
        return activityLogRepository.findAll().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get activities for dashboard
    public List<ActivityLogResponse> getDashboardActivities(UUID userId, int limit) {
        return getRecentActivities(userId, limit);
    }
}