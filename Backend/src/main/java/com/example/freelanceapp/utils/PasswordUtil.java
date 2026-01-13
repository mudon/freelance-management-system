package com.example.freelanceapp.utils;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class PasswordUtil {
    
    private final BCryptPasswordEncoder passwordEncoder;
    
    public PasswordUtil() {
        this.passwordEncoder = new BCryptPasswordEncoder();
    }
    
    public String hashPassword(String plainPassword) {
        return passwordEncoder.encode(plainPassword);
    }
    
    public boolean verifyPassword(String plainPassword, String hashedPassword) {
        return passwordEncoder.matches(plainPassword, hashedPassword);
    }
}