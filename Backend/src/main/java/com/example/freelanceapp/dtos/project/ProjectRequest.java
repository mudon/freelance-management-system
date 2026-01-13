package com.example.freelanceapp.dtos.project;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectRequest {
    
    @NotNull(message = "Client ID is required")
    private String clientId;
    
    @NotBlank(message = "Project name is required")
    @Size(min = 1, max = 255, message = "Project name must be between 1 and 255 characters")
    private String name;
    
    private String description;
    private String status;
    private BigDecimal hourlyRate;
    private BigDecimal fixedPrice;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate dueDate;
    private List<String> tags;
    private String metadata;
}