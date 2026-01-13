package com.example.freelanceapp.repositories;

import com.example.freelanceapp.entities.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, UUID> {
    
       List<ActivityLog> findByUserId(UUID userId);
       
       Page<ActivityLog> findByUserId(UUID userId, Pageable pageable);
       
       List<ActivityLog> findByUserIdAndAction(UUID userId, String action);
       
       List<ActivityLog> findByUserIdAndEntityType(UUID userId, String entityType);
       
       List<ActivityLog> findByUserIdAndEntityTypeAndEntityId(UUID userId, String entityType, UUID entityId);
       
       @Query("SELECT a FROM ActivityLog a WHERE a.user.id = :userId AND " +
              "(LOWER(a.action) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
              "LOWER(a.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
              "LOWER(a.entityType) LIKE LOWER(CONCAT('%', :search, '%')))")
       List<ActivityLog> searchByUser(@Param("userId") UUID userId, @Param("search") String search);
       
       @Query("SELECT a FROM ActivityLog a WHERE a.user.id = :userId AND a.createdAt BETWEEN :startDate AND :endDate")
       List<ActivityLog> findByDateRange(@Param("userId") UUID userId, 
                                          @Param("startDate") LocalDateTime startDate, 
                                          @Param("endDate") LocalDateTime endDate);
       
       @Query("SELECT COUNT(a) FROM ActivityLog a WHERE a.user.id = :userId")
       Long countByUserId(UUID userId);
    
       @Query(
              value = "SELECT COUNT(*) FROM activity_log a " +
                     "WHERE a.user_id = :userId " +
                     "AND DATE(a.created_at) = CURRENT_DATE",
              nativeQuery = true
       )
       Long countTodayByUserId(@Param("userId") UUID userId);
       
       @Query("SELECT COUNT(a) FROM ActivityLog a WHERE a.user.id = :userId AND " +
              "a.createdAt >= :startOfWeek")
       Long countThisWeekByUserId(@Param("userId") UUID userId, 
                                   @Param("startOfWeek") LocalDateTime startOfWeek);
       
       @Query("SELECT COUNT(a) FROM ActivityLog a WHERE a.user.id = :userId AND " +
              "a.createdAt >= :startOfMonth")
       Long countThisMonthByUserId(@Param("userId") UUID userId, 
                                   @Param("startOfMonth") LocalDateTime startOfMonth);
       
       @Query("SELECT a.action, COUNT(a) FROM ActivityLog a WHERE a.user.id = :userId " +
              "GROUP BY a.action ORDER BY COUNT(a) DESC")
       List<Object[]> countActionsByType(@Param("userId") UUID userId);
       
       @Query("SELECT a.entityType, COUNT(a) FROM ActivityLog a WHERE a.user.id = :userId " +
              "AND a.entityType IS NOT NULL GROUP BY a.entityType ORDER BY COUNT(a) DESC")
       List<Object[]> countEntitiesByType(@Param("userId") UUID userId);
    
       @Query(
              value = "SELECT DATE(a.created_at) AS activity_date, COUNT(*) " +
                     "FROM activity_log a " +
                     "WHERE a.user_id = :userId " +
                     "AND a.created_at >= :startDate " +
                     "GROUP BY DATE(a.created_at) " +
                     "ORDER BY activity_date DESC",
              nativeQuery = true
       )
       List<Object[]> countActivitiesByDay(
              @Param("userId") UUID userId,
              @Param("startDate") LocalDateTime startDate
       );

       @Query("SELECT a FROM ActivityLog a WHERE a.user.id = :userId " +
              "ORDER BY a.createdAt DESC")
       List<ActivityLog> findRecentByUser(@Param("userId") UUID userId, Pageable pageable);
       
       @Query("SELECT a FROM ActivityLog a WHERE a.user.id = :userId AND a.entityId = :entityId " +
              "ORDER BY a.createdAt DESC")
       List<ActivityLog> findByEntityId(@Param("userId") UUID userId, @Param("entityId") UUID entityId);
       
       @Query("SELECT a FROM ActivityLog a WHERE a.user.id = :userId AND " +
              "a.action = :action AND a.entityType = :entityType")
       List<ActivityLog> findByActionAndEntityType(@Param("userId") UUID userId, 
                                                 @Param("action") String action, 
                                                 @Param("entityType") String entityType);
}