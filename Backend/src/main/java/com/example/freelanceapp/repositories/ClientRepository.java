package com.example.freelanceapp.repositories;

import com.example.freelanceapp.entities.Client;
import com.example.freelanceapp.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClientRepository extends JpaRepository<Client, UUID> {
    
    List<Client> findByUserId(UUID userId);
    
    Page<Client> findByUserId(UUID userId, Pageable pageable);
    
    List<Client> findByUserIdAndStatus(UUID userId, String status);
    
    Optional<Client> findByIdAndUserId(UUID id, UUID userId);
    
    boolean existsByUserIdAndEmail(UUID userId, String email);
    
    boolean existsByUserIdAndCompanyName(UUID userId, String companyName);
    
    @Query("SELECT c FROM Client c WHERE c.user.id = :userId AND " +
           "(LOWER(c.companyName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.contactName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Client> searchByUser(@Param("userId") UUID userId, @Param("search") String search);
    
    @Query("SELECT COUNT(c) FROM Client c WHERE c.user.id = :userId")
    Long countByUserId(@Param("userId") UUID userId);
    
    @Query("SELECT c FROM Client c WHERE c.user.id = :userId AND c.status = :status " +
           "ORDER BY c.updatedAt DESC")
    List<Client> findRecentByUserAndStatus(@Param("userId") UUID userId, 
                                          @Param("status") String status, 
                                          Pageable pageable);
    
    Optional<Client> findByUserAndEmail(User user, String email);
}