package com.example.freelanceapp.services;

import com.example.freelanceapp.entities.RefreshToken;
import com.example.freelanceapp.entities.User;
import com.example.freelanceapp.exceptions.UnauthorizedException;
import com.example.freelanceapp.repositories.RefreshTokenRepository;
import com.example.freelanceapp.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final SecureRandom secureRandom = new SecureRandom();
    
    @Value("${jwt.refresh-token.expiration}")
    private Long refreshTokenExpirationMs;
    
    @Transactional
    public RefreshToken createRefreshToken(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Revoke existing tokens for this user
        refreshTokenRepository.revokeAllUserTokens(user);
        
        // Generate random token
        byte[] randomBytes = new byte[64];
        secureRandom.nextBytes(randomBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        
        // Calculate expiration
        Instant expiresAt = Instant.now().plusMillis(refreshTokenExpirationMs);
        
        // Create and save refresh token
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(token)
                .expiresAt(expiresAt)
                .isRevoked(false)
                .build();
        
        return refreshTokenRepository.save(refreshToken);
    }
    
    @Transactional
    public RefreshToken verifyRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));
        
        if (!refreshToken.isValid()) {
            throw new UnauthorizedException("Refresh token expired or revoked");
        }
        
        return refreshToken;
    }
    
    @Transactional
    public void revokeRefreshToken(String token) {
        Optional<RefreshToken> refreshToken = refreshTokenRepository.findByToken(token);
        refreshToken.ifPresent(rt -> {
            rt.setIsRevoked(true);
            refreshTokenRepository.save(rt);
        });
    }
    
    @Transactional
    public void revokeAllUserTokens(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        refreshTokenRepository.revokeAllUserTokens(user);
    }
    
    @Transactional
    public void deleteExpiredTokens() {
        refreshTokenRepository.deleteExpiredTokens(Instant.now());
    }
}