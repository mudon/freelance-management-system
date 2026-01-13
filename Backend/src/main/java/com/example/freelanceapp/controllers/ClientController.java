package com.example.freelanceapp.controllers;


import com.example.freelanceapp.dtos.client.ClientRequest;
import com.example.freelanceapp.dtos.client.ClientResponse;
import com.example.freelanceapp.dtos.client.ClientSummaryResponse;
import com.example.freelanceapp.entities.User;
import com.example.freelanceapp.repositories.UserRepository;
import com.example.freelanceapp.services.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/user/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;
    private final UserRepository userRepository; // inject repository

    // Helper method to get current user ID
    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));
        return user.getId();
    }

    // Create a new client
    @PostMapping
    public ResponseEntity<ClientResponse> createClient(@Valid @RequestBody ClientRequest request) {
        UUID userId = getCurrentUserId();
        ClientResponse response = clientService.createClient(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get all clients
    @GetMapping
    public ResponseEntity<List<ClientResponse>> getAllClients() {
        UUID userId = getCurrentUserId();
        List<ClientResponse> clients = clientService.getAllClients(userId);
        return ResponseEntity.ok(clients);
    }

    // Get all clients with pagination
    @GetMapping("/paginated")
    public ResponseEntity<Page<ClientResponse>> getAllClientsPaginated(Pageable pageable) {
        UUID userId = getCurrentUserId();
        Page<ClientResponse> clients = clientService.getAllClients(userId, pageable);
        return ResponseEntity.ok(clients);
    }

    // Get client by ID
    @GetMapping("/{clientId}")
    public ResponseEntity<ClientResponse> getClientById(@PathVariable UUID clientId) {
        UUID userId = getCurrentUserId();
        ClientResponse client = clientService.getClientById(userId, clientId);
        return ResponseEntity.ok(client);
    }

    // Update client
    @PutMapping("/{clientId}")
    public ResponseEntity<ClientResponse> updateClient(
            @PathVariable UUID clientId,
            @Valid @RequestBody ClientRequest request) {
        UUID userId = getCurrentUserId();
        ClientResponse updatedClient = clientService.updateClient(userId, clientId, request);
        return ResponseEntity.ok(updatedClient);
    }

    // Delete client
    @DeleteMapping("/{clientId}")
    public ResponseEntity<Void> deleteClient(@PathVariable UUID clientId) {
        UUID userId = getCurrentUserId();
        clientService.deleteClient(userId, clientId);
        return ResponseEntity.noContent().build();
    }

    // Archive client
    @PostMapping("/{clientId}/archive")
    public ResponseEntity<ClientResponse> archiveClient(@PathVariable UUID clientId) {
        UUID userId = getCurrentUserId();
        ClientResponse archivedClient = clientService.archiveClient(userId, clientId);
        return ResponseEntity.ok(archivedClient);
    }

    // Restore client
    @PostMapping("/{clientId}/restore")
    public ResponseEntity<ClientResponse> restoreClient(@PathVariable UUID clientId) {
        UUID userId = getCurrentUserId();
        ClientResponse restoredClient = clientService.restoreClient(userId, clientId);
        return ResponseEntity.ok(restoredClient);
    }

    // Get clients by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ClientResponse>> getClientsByStatus(@PathVariable String status) {
        UUID userId = getCurrentUserId();
        List<ClientResponse> clients = clientService.getClientsByStatus(userId, status);
        return ResponseEntity.ok(clients);
    }

    // Search clients
    @GetMapping("/search")
    public ResponseEntity<List<ClientResponse>> searchClients(@RequestParam String query) {
        UUID userId = getCurrentUserId();
        List<ClientResponse> clients = clientService.searchClients(userId, query);
        return ResponseEntity.ok(clients);
    }

    // Get client summary
    @GetMapping("/{clientId}/summary")
    public ResponseEntity<ClientSummaryResponse> getClientSummary(@PathVariable UUID clientId) {
        UUID userId = getCurrentUserId();
        ClientSummaryResponse summary = clientService.getClientSummary(userId, clientId);
        return ResponseEntity.ok(summary);
    }

    // Get clients count
    @GetMapping("/count")
    public ResponseEntity<Long> getClientsCount() {
        UUID userId = getCurrentUserId();
        Long count = clientService.getClientsCount(userId);
        return ResponseEntity.ok(count);
    }

    // Get recent clients
    @GetMapping("/recent")
    public ResponseEntity<List<ClientResponse>> getRecentClients(
            @RequestParam(defaultValue = "5") int limit) {
        UUID userId = getCurrentUserId();
        List<ClientResponse> recentClients = clientService.getRecentClients(userId, limit);
        return ResponseEntity.ok(recentClients);
    }
}