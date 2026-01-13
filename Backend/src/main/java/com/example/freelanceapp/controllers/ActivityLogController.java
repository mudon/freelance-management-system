package com.example.freelanceapp.controllers;

import com.example.freelanceapp.dtos.ActivityLogResponse;
import com.example.freelanceapp.dtos.ActivityLogSummaryResponse;
import com.example.freelanceapp.entities.User;
import com.example.freelanceapp.repositories.UserRepository;
import com.example.freelanceapp.services.ActivityLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/activity-logs")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogService activityLogService;
    private final UserRepository userRepository; // inject repository

    // Helper method to get current user ID
    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));
        return user.getId();
    }

    // Helper method to get client info from request
    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null) {
            return xfHeader.split(",")[0];
        }
        return request.getRemoteAddr();
    }

    // Get all activities for current user
    @GetMapping
    public ResponseEntity<List<ActivityLogResponse>> getAllActivities() {
        UUID userId = getCurrentUserId();
        List<ActivityLogResponse> activities = activityLogService.getAllActivities(userId);
        return ResponseEntity.ok(activities);
    }

    // Get all activities with pagination
    @GetMapping("/paginated")
    public ResponseEntity<Page<ActivityLogResponse>> getAllActivitiesPaginated(Pageable pageable) {
        UUID userId = getCurrentUserId();
        Page<ActivityLogResponse> activities = activityLogService.getAllActivities(userId, pageable);
        return ResponseEntity.ok(activities);
    }

    // Get activity by ID
    @GetMapping("/{activityId}")
    public ResponseEntity<ActivityLogResponse> getActivityById(@PathVariable UUID activityId) {
        UUID userId = getCurrentUserId();
        // Note: Since activity logs are user-specific, we need to verify ownership
        // For simplicity, we'll get all and filter. In production, add repository method.
        List<ActivityLogResponse> allActivities = activityLogService.getAllActivities(userId);
        ActivityLogResponse activity = allActivities.stream()
            .filter(a -> a.getId().equals(activityId))
            .findFirst()
            .orElse(null);
        
        if (activity == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(activity);
    }

    // Get activities by action
    @GetMapping("/action/{action}")
    public ResponseEntity<List<ActivityLogResponse>> getActivitiesByAction(@PathVariable String action) {
        UUID userId = getCurrentUserId();
        List<ActivityLogResponse> activities = activityLogService.getActivitiesByAction(userId, action);
        return ResponseEntity.ok(activities);
    }

    // Get activities by entity type
    @GetMapping("/entity-type/{entityType}")
    public ResponseEntity<List<ActivityLogResponse>> getActivitiesByEntityType(@PathVariable String entityType) {
        UUID userId = getCurrentUserId();
        List<ActivityLogResponse> activities = activityLogService.getActivitiesByEntityType(userId, entityType);
        return ResponseEntity.ok(activities);
    }

    // Get activities by specific entity
    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<List<ActivityLogResponse>> getActivitiesByEntity(
            @PathVariable String entityType,
            @PathVariable UUID entityId) {
        UUID userId = getCurrentUserId();
        List<ActivityLogResponse> activities = activityLogService.getActivitiesByEntity(userId, entityType, entityId);
        return ResponseEntity.ok(activities);
    }

    // Get activities by entity ID (any type)
    @GetMapping("/entity-id/{entityId}")
    public ResponseEntity<List<ActivityLogResponse>> getActivitiesByEntityId(@PathVariable UUID entityId) {
        UUID userId = getCurrentUserId();
        List<ActivityLogResponse> activities = activityLogService.getActivitiesByEntityId(userId, entityId);
        return ResponseEntity.ok(activities);
    }

    // Search activities
    @GetMapping("/search")
    public ResponseEntity<List<ActivityLogResponse>> searchActivities(@RequestParam String query) {
        UUID userId = getCurrentUserId();
        List<ActivityLogResponse> activities = activityLogService.searchActivities(userId, query);
        return ResponseEntity.ok(activities);
    }

    // Get activities by date range
    @GetMapping("/date-range")
    public ResponseEntity<List<ActivityLogResponse>> getActivitiesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        UUID userId = getCurrentUserId();
        List<ActivityLogResponse> activities = activityLogService.getActivitiesByDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(activities);
    }

    // Get today's activities
    @GetMapping("/today")
    public ResponseEntity<List<ActivityLogResponse>> getTodayActivities() {
        UUID userId = getCurrentUserId();
        List<ActivityLogResponse> activities = activityLogService.getTodayActivities(userId);
        return ResponseEntity.ok(activities);
    }

    // Get this week's activities
    @GetMapping("/this-week")
    public ResponseEntity<List<ActivityLogResponse>> getThisWeekActivities() {
        UUID userId = getCurrentUserId();
        List<ActivityLogResponse> activities = activityLogService.getThisWeekActivities(userId);
        return ResponseEntity.ok(activities);
    }

    // Get this month's activities
    @GetMapping("/this-month")
    public ResponseEntity<List<ActivityLogResponse>> getThisMonthActivities() {
        UUID userId = getCurrentUserId();
        List<ActivityLogResponse> activities = activityLogService.getThisMonthActivities(userId);
        return ResponseEntity.ok(activities);
    }

    // Get activity summary
    @GetMapping("/summary")
    public ResponseEntity<ActivityLogSummaryResponse> getActivitySummary() {
        UUID userId = getCurrentUserId();
        ActivityLogSummaryResponse summary = activityLogService.getActivitySummary(userId);
        return ResponseEntity.ok(summary);
    }

    // Get activities count
    @GetMapping("/count")
    public ResponseEntity<Long> getActivitiesCount() {
        UUID userId = getCurrentUserId();
        Long count = activityLogService.getActivitiesCount(userId);
        return ResponseEntity.ok(count);
    }

    // Get recent activities
    @GetMapping("/recent")
    public ResponseEntity<List<ActivityLogResponse>> getRecentActivities(
            @RequestParam(defaultValue = "10") int limit) {
        UUID userId = getCurrentUserId();
        List<ActivityLogResponse> activities = activityLogService.getRecentActivities(userId, limit);
        return ResponseEntity.ok(activities);
    }

    // Get dashboard activities
    @GetMapping("/dashboard")
    public ResponseEntity<List<ActivityLogResponse>> getDashboardActivities(
            @RequestParam(defaultValue = "5") int limit) {
        UUID userId = getCurrentUserId();
        List<ActivityLogResponse> activities = activityLogService.getDashboardActivities(userId, limit);
        return ResponseEntity.ok(activities);
    }

    // Get activities by action and entity type
    @GetMapping("/filter")
    public ResponseEntity<List<ActivityLogResponse>> getActivitiesByActionAndEntityType(
            @RequestParam String action,
            @RequestParam String entityType) {
        UUID userId = getCurrentUserId();
        List<ActivityLogResponse> activities = activityLogService.getActivitiesByActionAndEntityType(userId, action, entityType);
        return ResponseEntity.ok(activities);
    }

    // Get user activity timeline
    @GetMapping("/timeline")
    public ResponseEntity<List<ActivityLogResponse>> getUserActivityTimeline() {
        UUID userId = getCurrentUserId();
        List<ActivityLogResponse> timeline = activityLogService.getUserActivityTimeline(userId);
        return ResponseEntity.ok(timeline);
    }

    // Export activities (would typically return CSV/PDF)
    @GetMapping("/export")
    public ResponseEntity<List<ActivityLogResponse>> exportActivities(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        UUID userId = getCurrentUserId();
        List<ActivityLogResponse> activities = activityLogService.exportActivities(userId, startDate, endDate);
        return ResponseEntity.ok(activities);
    }

    // Clear old activities (admin/cleanup - protected endpoint)
    @DeleteMapping("/cleanup")
    public ResponseEntity<Void> clearOldActivities(@RequestParam(defaultValue = "90") int daysToKeep) {
        UUID userId = getCurrentUserId();
        activityLogService.clearOldActivities(userId, daysToKeep);
        return ResponseEntity.noContent().build();
    }

    // ========== LOGGING ENDPOINTS (For other services to log activities) ==========
    
    // Log user activity (typically called from other services)
    @PostMapping("/log/user")
    public ResponseEntity<Void> logUserActivity(
            @RequestParam String action,
            @RequestParam String description,
            HttpServletRequest request) {
        UUID userId = getCurrentUserId();
        String ipAddress = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        
        activityLogService.logUserActivity(userId, action, description, ipAddress, userAgent);
        return ResponseEntity.ok().build();
    }
    
    // Log client activity
    @PostMapping("/log/client/{clientId}")
    public ResponseEntity<Void> logClientActivity(
            @PathVariable UUID clientId,
            @RequestParam String action,
            @RequestParam String description,
            HttpServletRequest request) {
        UUID userId = getCurrentUserId();
        String ipAddress = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        
        activityLogService.logClientActivity(userId, action, clientId, description, ipAddress, userAgent);
        return ResponseEntity.ok().build();
    }
    
    // Log project activity
    @PostMapping("/log/project/{projectId}")
    public ResponseEntity<Void> logProjectActivity(
            @PathVariable UUID projectId,
            @RequestParam String action,
            @RequestParam String description,
            HttpServletRequest request) {
        UUID userId = getCurrentUserId();
        String ipAddress = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        
        activityLogService.logProjectActivity(userId, action, projectId, description, ipAddress, userAgent);
        return ResponseEntity.ok().build();
    }
    
    // Log quote activity
    @PostMapping("/log/quote/{quoteId}")
    public ResponseEntity<Void> logQuoteActivity(
            @PathVariable UUID quoteId,
            @RequestParam String action,
            @RequestParam String description,
            HttpServletRequest request) {
        UUID userId = getCurrentUserId();
        String ipAddress = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        
        activityLogService.logQuoteActivity(userId, action, quoteId, description, ipAddress, userAgent);
        return ResponseEntity.ok().build();
    }
    
    // Log invoice activity
    @PostMapping("/log/invoice/{invoiceId}")
    public ResponseEntity<Void> logInvoiceActivity(
            @PathVariable UUID invoiceId,
            @RequestParam String action,
            @RequestParam String description,
            HttpServletRequest request) {
        UUID userId = getCurrentUserId();
        String ipAddress = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        
        activityLogService.logInvoiceActivity(userId, action, invoiceId, description, ipAddress, userAgent);
        return ResponseEntity.ok().build();
    }
}