package com.example.freelanceapp.controllers;

import com.example.freelanceapp.dtos.project.ProjectRequest;
import com.example.freelanceapp.dtos.project.ProjectResponse;
import com.example.freelanceapp.dtos.project.ProjectSummaryResponse;
import com.example.freelanceapp.entities.User;
import com.example.freelanceapp.repositories.UserRepository;
import com.example.freelanceapp.services.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/user/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final UserRepository userRepository; // inject repository

    // Helper method to get current user ID
    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));
        return user.getId();
    }

    // Create a new project
    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(@Valid @RequestBody ProjectRequest request) {
        UUID userId = getCurrentUserId();
        ProjectResponse response = projectService.createProject(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get all projects
    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAllProjects() {
        UUID userId = getCurrentUserId();
        List<ProjectResponse> projects = projectService.getAllProjects(userId);
        return ResponseEntity.ok(projects);
    }

    // Get all projects with pagination
    @GetMapping("/paginated")
    public ResponseEntity<Page<ProjectResponse>> getAllProjectsPaginated(Pageable pageable) {
        UUID userId = getCurrentUserId();
        Page<ProjectResponse> projects = projectService.getAllProjects(userId, pageable);
        return ResponseEntity.ok(projects);
    }

    // Get project by ID
    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> getProjectById(@PathVariable UUID projectId) {
        UUID userId = getCurrentUserId();
        ProjectResponse project = projectService.getProjectById(userId, projectId);
        return ResponseEntity.ok(project);
    }

    // Update project
    @PutMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable UUID projectId,
            @Valid @RequestBody ProjectRequest request) {
        UUID userId = getCurrentUserId();
        ProjectResponse updatedProject = projectService.updateProject(userId, projectId, request);
        return ResponseEntity.ok(updatedProject);
    }

    // Delete project
    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(@PathVariable UUID projectId) {
        UUID userId = getCurrentUserId();
        projectService.deleteProject(userId, projectId);
        return ResponseEntity.noContent().build();
    }

    // Update project status
    @PatchMapping("/{projectId}/status")
    public ResponseEntity<ProjectResponse> updateProjectStatus(
            @PathVariable UUID projectId,
            @RequestParam String status) {
        UUID userId = getCurrentUserId();
        ProjectResponse updatedProject = projectService.updateProjectStatus(userId, projectId, status);
        return ResponseEntity.ok(updatedProject);
    }

    // Get projects by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ProjectResponse>> getProjectsByStatus(@PathVariable String status) {
        UUID userId = getCurrentUserId();
        List<ProjectResponse> projects = projectService.getProjectsByStatus(userId, status);
        return ResponseEntity.ok(projects);
    }

    // Get projects by client
    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<ProjectResponse>> getProjectsByClient(@PathVariable UUID clientId) {
        UUID userId = getCurrentUserId();
        List<ProjectResponse> projects = projectService.getProjectsByClient(userId, clientId);
        return ResponseEntity.ok(projects);
    }

    // Search projects
    @GetMapping("/search")
    public ResponseEntity<List<ProjectResponse>> searchProjects(@RequestParam String query) {
        UUID userId = getCurrentUserId();
        List<ProjectResponse> projects = projectService.searchProjects(userId, query);
        return ResponseEntity.ok(projects);
    }

    // Get project summary
    @GetMapping("/{projectId}/summary")
    public ResponseEntity<ProjectSummaryResponse> getProjectSummary(@PathVariable UUID projectId) {
        UUID userId = getCurrentUserId();
        ProjectSummaryResponse summary = projectService.getProjectSummary(userId, projectId);
        return ResponseEntity.ok(summary);
    }

    // Get overdue projects
    @GetMapping("/overdue")
    public ResponseEntity<List<ProjectResponse>> getOverdueProjects() {
        UUID userId = getCurrentUserId();
        List<ProjectResponse> projects = projectService.getOverdueProjects(userId);
        return ResponseEntity.ok(projects);
    }

    // Get projects by due date range
    @GetMapping("/due-range")
    public ResponseEntity<List<ProjectResponse>> getProjectsByDueDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        UUID userId = getCurrentUserId();
        List<ProjectResponse> projects = projectService.getProjectsByDueDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(projects);
    }

    // Get projects by tag
    @GetMapping("/tag/{tag}")
    public ResponseEntity<List<ProjectResponse>> getProjectsByTag(@PathVariable String tag) {
        UUID userId = getCurrentUserId();
        List<ProjectResponse> projects = projectService.getProjectsByTag(userId, tag);
        return ResponseEntity.ok(projects);
    }

    // Get all project tags for user
    @GetMapping("/tags")
    public ResponseEntity<List<String>> getProjectTags() {
        UUID userId = getCurrentUserId();
        List<String> tags = projectService.getProjectTags(userId);
        return ResponseEntity.ok(tags);
    }

    // Get projects count
    @GetMapping("/count")
    public ResponseEntity<Long> getProjectsCount() {
        UUID userId = getCurrentUserId();
        Long count = projectService.getProjectsCount(userId);
        return ResponseEntity.ok(count);
    }

    // Get projects count by status
    @GetMapping("/count/status/{status}")
    public ResponseEntity<Long> getProjectsCountByStatus(@PathVariable String status) {
        UUID userId = getCurrentUserId();
        Long count = projectService.getProjectsCountByStatus(userId, status);
        return ResponseEntity.ok(count);
    }

    // Get recent projects
    @GetMapping("/recent")
    public ResponseEntity<List<ProjectResponse>> getRecentProjects(
            @RequestParam(defaultValue = "5") int limit) {
        UUID userId = getCurrentUserId();
        List<ProjectResponse> recentProjects = projectService.getRecentProjects(userId, limit);
        return ResponseEntity.ok(recentProjects);
    }

    // Get upcoming projects
    @GetMapping("/upcoming")
    public ResponseEntity<List<ProjectResponse>> getUpcomingProjects(
            @RequestParam(defaultValue = "5") int limit) {
        UUID userId = getCurrentUserId();
        List<ProjectResponse> upcomingProjects = projectService.getUpcomingProjects(userId, limit);
        return ResponseEntity.ok(upcomingProjects);
    }
}