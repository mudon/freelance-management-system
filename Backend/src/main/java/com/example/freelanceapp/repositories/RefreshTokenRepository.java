package com.example.freelanceapp.repositories;

import com.example.freelanceapp.entities.RefreshToken;
import com.example.freelanceapp.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    
    Optional<RefreshToken> findByToken(String token);
    
    Optional<RefreshToken> findByUserId(UUID userId);
    
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiresAt < ?1")
    void deleteExpiredTokens(Instant now);
    
    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.isRevoked = true WHERE rt.user = ?1")
    void revokeAllUserTokens(User user);
    
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.user = ?1")
    void deleteByUser(User user);
}