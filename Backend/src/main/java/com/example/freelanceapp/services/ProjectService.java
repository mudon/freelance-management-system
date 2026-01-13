package com.example.freelanceapp.services;

import com.example.freelanceapp.dtos.project.ProjectRequest;
import com.example.freelanceapp.dtos.project.ProjectResponse;
import com.example.freelanceapp.dtos.project.ProjectSummaryResponse;
import com.example.freelanceapp.entities.Client;
import com.example.freelanceapp.entities.Project;
import com.example.freelanceapp.entities.User;
import com.example.freelanceapp.exceptions.BadRequestException;
import com.example.freelanceapp.exceptions.NotFoundException;
import com.example.freelanceapp.repositories.ClientRepository;
import com.example.freelanceapp.repositories.ProjectRepository;
import com.example.freelanceapp.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;

    // Map Entity to Response DTO
    private ProjectResponse mapToResponse(Project project) {
        return new ProjectResponse(
            project.getId(),
            project.getUser().getId(),
            project.getClient().getId(),
            project.getClient().getCompanyName() != null ? 
                project.getClient().getCompanyName() : project.getClient().getContactName(),
            project.getClient().getContactName(),
            project.getName(),
            project.getDescription(),
            project.getStatus(),
            project.getHourlyRate(),
            project.getFixedPrice(),
            project.getStartDate(),
            project.getEndDate(),
            project.getDueDate(),
            project.getTags() != null ? Arrays.asList(project.getTags()) : null,
            project.getMetadata(),
            project.getCreatedAt(),
            project.getUpdatedAt()
        );
    }

    // Map Request to Entity
    private Project mapToEntity(ProjectRequest request, User user, Client client) {
        Project project = new Project();
        project.setUser(user);
        project.setClient(client);
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStatus(request.getStatus() != null ? request.getStatus() : "active");
        project.setHourlyRate(request.getHourlyRate());
        project.setFixedPrice(request.getFixedPrice());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setDueDate(request.getDueDate());
        
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            project.setTags(request.getTags().toArray(new String[0]));
        }
        
        if (request.getMetadata() != null) {
            project.setMetadata(request.getMetadata());
        }
        
        return project;
    }

    // Create a new project
    @Transactional
    public ProjectResponse createProject(UUID userId, ProjectRequest request) {
        // Find user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found"));

        // Find client
        UUID clientId;
        try {
            clientId = UUID.fromString(request.getClientId());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid client ID format");
        }
        
        Client client = clientRepository.findByIdAndUserId(clientId, userId)
            .orElseThrow(() -> new NotFoundException("Client not found or not authorized"));

        // Check if project name already exists for this user
        if (projectRepository.existsByUserIdAndName(userId, request.getName())) {
            throw new BadRequestException("A project with this name already exists");
        }

        // Validate dates
        validateProjectDates(request);

        // Create and save project
        Project project = mapToEntity(request, user, client);
        Project savedProject = projectRepository.save(project);

        return mapToResponse(savedProject);
    }

    // Get project by ID
    public ProjectResponse getProjectById(UUID userId, UUID projectId) {
        Project project = projectRepository.findByIdAndUserId(projectId, userId)
            .orElseThrow(() -> new NotFoundException("Project not found"));
        return mapToResponse(project);
    }

    // Get all projects for a user
    public List<ProjectResponse> getAllProjects(UUID userId) {
        return projectRepository.findByUserId(userId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get all projects with pagination
    public Page<ProjectResponse> getAllProjects(UUID userId, Pageable pageable) {
        return projectRepository.findByUserId(userId, pageable)
            .map(this::mapToResponse);
    }

    // Get projects by status
    public List<ProjectResponse> getProjectsByStatus(UUID userId, String status) {
        return projectRepository.findByUserIdAndStatus(userId, status).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get projects by client
    public List<ProjectResponse> getProjectsByClient(UUID userId, UUID clientId) {
        // Verify client belongs to user
        clientRepository.findByIdAndUserId(clientId, userId)
            .orElseThrow(() -> new NotFoundException("Client not found"));
            
        return projectRepository.findByUserIdAndClientId(userId, clientId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Update project
    @Transactional
    public ProjectResponse updateProject(UUID userId, UUID projectId, ProjectRequest request) {
        Project project = projectRepository.findByIdAndUserId(projectId, userId)
            .orElseThrow(() -> new NotFoundException("Project not found"));

        // Update client if provided
        if (request.getClientId() != null) {
            UUID clientId;
            try {
                clientId = UUID.fromString(request.getClientId());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid client ID format");
            }
            
            Client client = clientRepository.findByIdAndUserId(clientId, userId)
                .orElseThrow(() -> new NotFoundException("Client not found"));
            project.setClient(client);
        }

        // Check if project name already exists for another project
        if (request.getName() != null && !request.getName().equals(project.getName())) {
            boolean exists = projectRepository.findByUserId(userId).stream()
                .anyMatch(p -> request.getName().equals(p.getName()) && 
                              !p.getId().equals(projectId));
            if (exists) {
                throw new BadRequestException("A project with this name already exists");
            }
        }

        // Validate dates
        validateProjectDates(request);

        // Update fields
        if (request.getName() != null) {
            project.setName(request.getName());
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus());
        }
        if (request.getHourlyRate() != null) {
            project.setHourlyRate(request.getHourlyRate());
        }
        if (request.getFixedPrice() != null) {
            project.setFixedPrice(request.getFixedPrice());
        }
        if (request.getStartDate() != null) {
            project.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            project.setEndDate(request.getEndDate());
        }
        if (request.getDueDate() != null) {
            project.setDueDate(request.getDueDate());
        }
        if (request.getTags() != null) {
            project.setTags(request.getTags().toArray(new String[0]));
        }
        if (request.getMetadata() != null) {
            project.setMetadata(request.getMetadata());
        }

        Project updatedProject = projectRepository.save(project);
        return mapToResponse(updatedProject);
    }

    // Delete project
    @Transactional
    public void deleteProject(UUID userId, UUID projectId) {
        Project project = projectRepository.findByIdAndUserId(projectId, userId)
            .orElseThrow(() -> new NotFoundException("Project not found"));
        
        // Check if project has associated quotes or invoices
        // You might want to add these checks based on your business logic
        
        projectRepository.delete(project);
    }

    // Search projects
    public List<ProjectResponse> searchProjects(UUID userId, String searchTerm) {
        return projectRepository.searchByUser(userId, searchTerm).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get overdue projects
    public List<ProjectResponse> getOverdueProjects(UUID userId) {
        return projectRepository.findOverdueProjects(userId, LocalDate.now()).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get projects by due date range
    public List<ProjectResponse> getProjectsByDueDateRange(UUID userId, LocalDate startDate, LocalDate endDate) {
        return projectRepository.findByDueDateRange(userId, startDate, endDate).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get projects by tag
    public List<ProjectResponse> getProjectsByTag(UUID userId, String tag) {
        return projectRepository.findByTag(userId, tag).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get all distinct tags for a user
    public List<String> getProjectTags(UUID userId) {
        return projectRepository.findDistinctTagsByUserId(userId);
    }

    // Get project summary
    public ProjectSummaryResponse getProjectSummary(UUID userId, UUID projectId) {
        Project project = projectRepository.findByIdAndUserId(projectId, userId)
            .orElseThrow(() -> new NotFoundException("Project not found"));
        
        // For now, returning basic summary
        // TODO: Implement actual summary with quote/invoice/file counts
        return new ProjectSummaryResponse(
            project.getId().toString(),
            project.getName(),
            project.getStatus(),
            project.getClient().getCompanyName() != null ? 
                project.getClient().getCompanyName() : project.getClient().getContactName(),
            project.getStartDate(),
            project.getEndDate(),
            project.getDueDate(),
            BigDecimal.ZERO, // totalHours - to be implemented
            BigDecimal.ZERO, // totalCost - to be implemented
            BigDecimal.ZERO, // amountInvoiced - to be implemented
            BigDecimal.ZERO, // amountPaid - to be implemented
            BigDecimal.ZERO, // outstandingBalance - to be implemented
            0L, // quoteCount - to be implemented
            0L, // invoiceCount - to be implemented
            0L, // fileCount - to be implemented
            "0%", // progress - to be implemented
            project.getDueDate() != null && project.getDueDate().isBefore(LocalDate.now()) 
                && !"completed".equals(project.getStatus())
        );
    }

    // Get projects count
    public Long getProjectsCount(UUID userId) {
        return projectRepository.countByUserId(userId);
    }

    // Get projects count by status
    public Long getProjectsCountByStatus(UUID userId, String status) {
        return projectRepository.countByUserIdAndStatus(userId, status);
    }

    // Get recent projects
    public List<ProjectResponse> getRecentProjects(UUID userId, int limit) {
        return projectRepository.findByUserId(userId,
            org.springframework.data.domain.PageRequest.of(0, limit,
                org.springframework.data.domain.Sort.by("updatedAt").descending()))
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Helper method to validate project dates
    private void validateProjectDates(ProjectRequest request) {
        if (request.getStartDate() != null && request.getEndDate() != null) {
            if (request.getEndDate().isBefore(request.getStartDate())) {
                throw new BadRequestException("End date cannot be before start date");
            }
        }
        
        if (request.getDueDate() != null && request.getStartDate() != null) {
            if (request.getDueDate().isBefore(request.getStartDate())) {
                throw new BadRequestException("Due date cannot be before start date");
            }
        }
    }

    // Update project status
    @Transactional
    public ProjectResponse updateProjectStatus(UUID userId, UUID projectId, String status) {
        Project project = projectRepository.findByIdAndUserId(projectId, userId)
            .orElseThrow(() -> new NotFoundException("Project not found"));
        
        // Validate status
        List<String> validStatuses = Arrays.asList("active", "completed", "on_hold", "cancelled");
        if (!validStatuses.contains(status)) {
            throw new BadRequestException("Invalid project status");
        }
        
        project.setStatus(status);
        
        // If marking as completed, set end date if not already set
        if ("completed".equals(status) && project.getEndDate() == null) {
            project.setEndDate(LocalDate.now());
        }
        
        Project updatedProject = projectRepository.save(project);
        return mapToResponse(updatedProject);
    }

    // Get upcoming projects
    public List<ProjectResponse> getUpcomingProjects(UUID userId, int limit) {
        return projectRepository.findByUserOrderByDueDate(userId,
            org.springframework.data.domain.PageRequest.of(0, limit))
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
}