package com.example.freelanceapp.services;

import com.example.freelanceapp.dtos.user.*;
import com.example.freelanceapp.entities.RefreshToken;
import com.example.freelanceapp.entities.User;
import com.example.freelanceapp.exceptions.*;
import com.example.freelanceapp.repositories.UserRepository;
import com.example.freelanceapp.utils.JwtUtil;
import com.example.freelanceapp.utils.PasswordUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import com.example.freelanceapp.dtos.auth.AuthResponse;
import com.example.freelanceapp.dtos.auth.RefreshTokenRequest;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordUtil passwordUtil;
    private final RefreshTokenService refreshTokenService;
    
    // Update login method to return both tokens
    @Transactional
    public AuthResponse login(UserLoginRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
        
        // Verify password
        if (!passwordUtil.verifyPassword(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }
        
        // Update last login time
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        
        // Generate tokens
        String accessToken = jwtUtil.generateAccessToken(user.getId().toString(), user.getEmail());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId().toString(), user.getEmail());
        
        // Store refresh token in database
        refreshTokenService.createRefreshToken(user.getId());
        
        // Return response with both tokens
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(convertToResponse(user))
                .build();
    }
    
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        // Verify the refresh token
        RefreshToken refreshToken = refreshTokenService.verifyRefreshToken(request.getRefreshToken());
        
        User user = refreshToken.getUser();
        
        // Generate new tokens
        String newAccessToken = jwtUtil.generateAccessToken(user.getId().toString(), user.getEmail());
        String newRefreshToken = jwtUtil.generateRefreshToken(user.getId().toString(), user.getEmail());
        
        // Revoke old refresh token and create new one
        refreshTokenService.revokeRefreshToken(request.getRefreshToken());
        refreshTokenService.createRefreshToken(user.getId());
        
        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .user(convertToResponse(user))
                .build();
    }
    
    @Transactional
    public void logout(String refreshToken) {
        refreshTokenService.revokeRefreshToken(refreshToken);
    }
    
    // Update register method to also return tokens
    @Transactional
    public AuthResponse register(UserCreateRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        
        // Create user entity
        User user = User.builder()
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .companyName(request.getCompanyName())
                .passwordHash(passwordUtil.hashPassword(request.getPassword()))
                .timezone(request.getTimezone() != null ? request.getTimezone() : "UTC")
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .taxRate(request.getTaxRate() != null ? request.getTaxRate() : BigDecimal.valueOf(0.00))
                .build();
        
        User savedUser = userRepository.save(user);
        
        // Create and store refresh token in DB
        RefreshToken refreshTokenEntity = refreshTokenService.createRefreshToken(savedUser.getId());
        String refreshToken = refreshTokenEntity.getToken(); // This is the actual token to send to client

        // Generate access token as usual
        String accessToken = jwtUtil.generateAccessToken(savedUser.getId().toString(), savedUser.getEmail());
        
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(convertToResponse(savedUser))
                .build();
    }

    public UserResponse getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
        return convertToResponse(user);
    }
    
    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));
        
        // Check if current user can access this user (simplified - in real app, add authorization)
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!user.getEmail().equals(currentUserEmail)) {
            throw new ForbiddenException("Access denied");
        }
        
        return convertToResponse(user);
    }

    @Transactional
    public UserResponse updateUser(UUID id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));
        
        // Verify ownership
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!user.getEmail().equals(currentUserEmail)) {
            throw new ForbiddenException("Access denied");
        }
        
        // Update fields if provided
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already in use");
            }
            user.setEmail(request.getEmail());
        }
        
        if (request.getCompanyName() != null) {
            user.setCompanyName(request.getCompanyName());
        }
        
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        
        if (request.getTimezone() != null) {
            user.setTimezone(request.getTimezone());
        }
        
        if (request.getCurrency() != null) {
            user.setCurrency(request.getCurrency());
        }
        
        if (request.getTaxRate() != null) {
            user.setTaxRate(request.getTaxRate());
        }
        
        // Handle password update
        if (request.getPassword() != null) {
            user.setPasswordHash(passwordUtil.hashPassword(request.getPassword()));
        }
        
        User updatedUser = userRepository.save(user);
        return convertToResponse(updatedUser);
    }
    
    @Transactional
    public void deleteUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));
        
        // Verify ownership
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!user.getEmail().equals(currentUserEmail)) {
            throw new ForbiddenException("Access denied");
        }
        
        userRepository.delete(user);
    }
    
    @Transactional
    public void updateSubscription(UUID userId, String tier, String status, LocalDateTime expiresAt) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        
        user.setSubscriptionTier(tier);
        user.setSubscriptionStatus(status);
        user.setSubscriptionExpiresAt(expiresAt);
        
        userRepository.save(user);
    }
    
    private UserResponse convertToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .companyName(user.getCompanyName())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .avatarUrl(user.getAvatarUrl())
                .timezone(user.getTimezone())
                .currency(user.getCurrency())
                .taxRate(user.getTaxRate())
                .subscriptionTier(user.getSubscriptionTier())
                .subscriptionStatus(user.getSubscriptionStatus())
                .subscriptionExpiresAt(user.getSubscriptionExpiresAt())
                .settings(user.getSettings())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }
    
    
    // Remove old LoginResponse class
}