package com.example.freelanceapp.repositories;

import com.example.freelanceapp.entities.Reminder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, UUID> {
    
    List<Reminder> findByUserId(UUID userId);
    
    Page<Reminder> findByUserId(UUID userId, Pageable pageable);
    
    List<Reminder> findByUserIdAndStatus(UUID userId, String status);
    
    List<Reminder> findByUserIdAndPriority(UUID userId, String priority);
    
    List<Reminder> findByUserIdAndRelatedTypeAndRelatedId(UUID userId, String relatedType, UUID relatedId);
    
    Optional<Reminder> findByIdAndUserId(UUID id, UUID userId);
    
    @Query("SELECT r FROM Reminder r WHERE r.user.id = :userId AND r.dueDate = :today " +
           "AND r.status = 'pending'")
    List<Reminder> findDueToday(@Param("userId") UUID userId, @Param("today") LocalDate today);
    
    @Query("SELECT r FROM Reminder r WHERE r.user.id = :userId AND r.dueDate < :today " +
           "AND r.status = 'pending'")
    List<Reminder> findOverdue(@Param("userId") UUID userId, @Param("today") LocalDate today);
    
    @Query("SELECT r FROM Reminder r WHERE r.user.id = :userId AND r.dueDate BETWEEN :startDate AND :endDate " +
           "AND r.status = 'pending'")
    List<Reminder> findByDueDateRange(@Param("userId") UUID userId, 
                                     @Param("startDate") LocalDate startDate, 
                                     @Param("endDate") LocalDate endDate);
    
    @Query("SELECT r FROM Reminder r WHERE r.user.id = :userId AND " +
           "(LOWER(r.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(r.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Reminder> searchByUser(@Param("userId") UUID userId, @Param("search") String search);
    
    @Query("SELECT COUNT(r) FROM Reminder r WHERE r.user.id = :userId")
    Long countByUserId(UUID userId);
    
    @Query("SELECT COUNT(r) FROM Reminder r WHERE r.user.id = :userId AND r.status = :status")
    Long countByUserIdAndStatus(@Param("userId") UUID userId, @Param("status") String status);
    
    @Query("SELECT COUNT(r) FROM Reminder r WHERE r.user.id = :userId AND r.priority = :priority")
    Long countByUserIdAndPriority(@Param("userId") UUID userId, @Param("priority") String priority);
    
    @Query("SELECT COUNT(r) FROM Reminder r WHERE r.user.id = :userId AND r.isRecurring = true")
    Long countRecurringByUserId(UUID userId);
    
    @Query("SELECT r FROM Reminder r WHERE r.user.id = :userId AND r.status = 'pending' " +
           "ORDER BY r.dueDate ASC, r.priority DESC")
    List<Reminder> findUpcomingReminders(@Param("userId") UUID userId, Pageable pageable);
    
    @Query("SELECT r FROM Reminder r WHERE r.user.id = :userId AND r.isRecurring = true " +
           "AND r.status = 'pending'")
    List<Reminder> findActiveRecurringReminders(UUID userId);
    
    @Query("SELECT r FROM Reminder r WHERE r.user.id = :userId AND " +
           "r.completedAt BETWEEN :startDate AND :endDate")
    List<Reminder> findCompletedInDateRange(@Param("userId") UUID userId, 
                                           @Param("startDate") LocalDateTime startDate, 
                                           @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT r FROM Reminder r WHERE r.user.id = :userId " +
           "ORDER BY r.updatedAt DESC")
    List<Reminder> findRecentByUser(@Param("userId") UUID userId, Pageable pageable);
}