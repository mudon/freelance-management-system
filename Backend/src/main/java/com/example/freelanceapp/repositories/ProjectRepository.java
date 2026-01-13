package com.example.freelanceapp.repositories;

import com.example.freelanceapp.entities.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {
    
    List<Project> findByUserId(UUID userId);
    
    Page<Project> findByUserId(UUID userId, Pageable pageable);
    
    List<Project> findByUserIdAndStatus(UUID userId, String status);
    
    List<Project> findByClientId(UUID clientId);
    
    List<Project> findByUserIdAndClientId(UUID userId, UUID clientId);
    
    Optional<Project> findByIdAndUserId(UUID id, UUID userId);
    
    boolean existsByUserIdAndName(UUID userId, String name);
    
    Long countByUserId(UUID userId);
    
    Long countByUserIdAndStatus(UUID userId, String status);
    
    @Query("SELECT p FROM Project p WHERE p.user.id = :userId AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Project> searchByUser(@Param("userId") UUID userId, @Param("search") String search);
    
    @Query("SELECT p FROM Project p WHERE p.user.id = :userId AND p.dueDate < :currentDate " +
           "AND p.status IN ('active', 'on_hold')")
    List<Project> findOverdueProjects(@Param("userId") UUID userId, 
                                     @Param("currentDate") LocalDate currentDate);
    
    @Query("SELECT p FROM Project p WHERE p.user.id = :userId AND " +
           "p.dueDate BETWEEN :startDate AND :endDate")
    List<Project> findByDueDateRange(@Param("userId") UUID userId, 
                                    @Param("startDate") LocalDate startDate, 
                                    @Param("endDate") LocalDate endDate);
    
    @Query(value = "SELECT * FROM projects p WHERE p.user_id = :userId AND :tag = ANY(p.tags)", nativeQuery = true)
    List<Project> findByTag(@Param("userId") UUID userId, @Param("tag") String tag);
    
    @Query("SELECT p FROM Project p WHERE p.user.id = :userId " +
           "ORDER BY p.dueDate ASC NULLS LAST")
    List<Project> findByUserOrderByDueDate(@Param("userId") UUID userId, Pageable pageable);
    
       @Query(
              value = """
              SELECT DISTINCT tag
              FROM projects p
              JOIN LATERAL unnest(p.tags) AS tag ON true
              WHERE p.user_id = :userId
              """,
              nativeQuery = true
       )
       List<String> findDistinctTagsByUserId(@Param("userId") UUID userId);
    
    @Query("SELECT p FROM Project p WHERE p.user.id = :userId AND " +
           "p.status = :status " +
           "ORDER BY p.updatedAt DESC")
    List<Project> findRecentByUserAndStatus(@Param("userId") UUID userId, 
                                           @Param("status") String status, 
                                           Pageable pageable);
}