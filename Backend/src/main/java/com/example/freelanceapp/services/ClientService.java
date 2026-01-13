package com.example.freelanceapp.services;

import com.example.freelanceapp.dtos.client.ClientRequest;
import com.example.freelanceapp.dtos.client.ClientResponse;
import com.example.freelanceapp.dtos.client.ClientSummaryResponse;
import com.example.freelanceapp.entities.Client;
import com.example.freelanceapp.entities.User;
import com.example.freelanceapp.exceptions.BadRequestException;
import com.example.freelanceapp.exceptions.NotFoundException;
import com.example.freelanceapp.repositories.ClientRepository;
import com.example.freelanceapp.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final UserRepository userRepository;

    // Map Entity to DTO
    private ClientResponse mapToResponse(Client client) {

        return new ClientResponse(
            client.getId(),
            client.getUser().getId(),
            client.getCompanyName(),
            client.getContactName(),
            client.getEmail(),
            client.getPhone(),
            client.getAddress(),
            client.getCity(),
            client.getState(),
            client.getCountry(),
            client.getPostalCode(),
            client.getTaxNumber(),
            client.getNotes(),
            client.getStatus(),
            client.getClientCategory(),
            client.getCreatedAt(),
            client.getUpdatedAt()
        );
    }

    // Map Request to Entity
    private Client mapToEntity(ClientRequest request, User user) {
        Client client = new Client();
        client.setUser(user);
        client.setCompanyName(request.getCompanyName());
        client.setContactName(request.getContactName());
        client.setEmail(request.getEmail());
        client.setPhone(request.getPhone());
        client.setAddress(request.getAddress());
        client.setCity(request.getCity());
        client.setState(request.getState());
        client.setCountry(request.getCountry());
        client.setPostalCode(request.getPostalCode());
        client.setTaxNumber(request.getTaxNumber());
        client.setNotes(request.getNotes());
        client.setStatus(request.getStatus() != null ? request.getStatus() : "active");
        client.setClientCategory(request.getClientCategory());
        return client;
    }

    // Create a new client
    @Transactional
    public ClientResponse createClient(UUID userId, ClientRequest request) {
        // Find user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found"));

        // Check if email already exists for this user
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            if (clientRepository.existsByUserIdAndEmail(userId, request.getEmail())) {
                throw new BadRequestException("A client with this email already exists");
            }
        }

        // Check if company name already exists for this user
        if (request.getCompanyName() != null && !request.getCompanyName().isEmpty()) {
            if (clientRepository.existsByUserIdAndCompanyName(userId, request.getCompanyName())) {
                throw new BadRequestException("A client with this company name already exists");
            }
        }

        // Create and save client
        Client client = mapToEntity(request, user);
        Client savedClient = clientRepository.save(client);

        return mapToResponse(savedClient);
    }

    // Get client by ID
    public ClientResponse getClientById(UUID userId, UUID clientId) {
        Client client = clientRepository.findByIdAndUserId(clientId, userId)
            .orElseThrow(() -> new NotFoundException("Client not found"));
        return mapToResponse(client);
    }

    // Get all clients for a user
    public List<ClientResponse> getAllClients(UUID userId) {
        return clientRepository.findByUserId(userId).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get all clients with pagination
    public Page<ClientResponse> getAllClients(UUID userId, Pageable pageable) {
        return clientRepository.findByUserId(userId, pageable)
            .map(this::mapToResponse);
    }

    // Get clients by status
    public List<ClientResponse> getClientsByStatus(UUID userId, String status) {
        return clientRepository.findByUserIdAndStatus(userId, status).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Update client
    @Transactional
    public ClientResponse updateClient(UUID userId, UUID clientId, ClientRequest request) {
        Client client = clientRepository.findByIdAndUserId(clientId, userId)
            .orElseThrow(() -> new NotFoundException("Client not found"));

        // Check if email already exists for another client of this user
        if (request.getEmail() != null && !request.getEmail().isEmpty() && 
            !request.getEmail().equals(client.getEmail())) {
            Optional<Client> existingClient = clientRepository.findByUserAndEmail(client.getUser(), request.getEmail());
            if (existingClient.isPresent() && !existingClient.get().getId().equals(clientId)) {
                throw new BadRequestException("A client with this email already exists");
            }
        }

        // Check if company name already exists for another client
        if (request.getCompanyName() != null && !request.getCompanyName().isEmpty() && 
            !request.getCompanyName().equals(client.getCompanyName())) {
            boolean exists = clientRepository.findByUserId(userId).stream()
                .anyMatch(c -> request.getCompanyName().equals(c.getCompanyName()) && 
                              !c.getId().equals(clientId));
            if (exists) {
                throw new BadRequestException("A client with this company name already exists");
            }
        }

        // Update fields
        if (request.getCompanyName() != null) {
            client.setCompanyName(request.getCompanyName());
        }
        if (request.getContactName() != null) {
            client.setContactName(request.getContactName());
        }
        if (request.getEmail() != null) {
            client.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            client.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            client.setAddress(request.getAddress());
        }
        if (request.getCity() != null) {
            client.setCity(request.getCity());
        }
        if (request.getState() != null) {
            client.setState(request.getState());
        }
        if (request.getCountry() != null) {
            client.setCountry(request.getCountry());
        }
        if (request.getPostalCode() != null) {
            client.setPostalCode(request.getPostalCode());
        }
        if (request.getTaxNumber() != null) {
            client.setTaxNumber(request.getTaxNumber());
        }
        if (request.getNotes() != null) {
            client.setNotes(request.getNotes());
        }
        if (request.getStatus() != null) {
            client.setStatus(request.getStatus());
        }
        if (request.getClientCategory() != null) {
            client.setClientCategory(request.getClientCategory());
        }

        Client updatedClient = clientRepository.save(client);
        return mapToResponse(updatedClient);
    }

    // Delete client
    @Transactional
    public void deleteClient(UUID userId, UUID clientId) {
        Client client = clientRepository.findByIdAndUserId(clientId, userId)
            .orElseThrow(() -> new NotFoundException("Client not found"));
        
        // Check if client has associated projects, quotes, or invoices
        // You might want to add these checks based on your business logic
        
        clientRepository.delete(client);
    }

    // Archive client
    @Transactional
    public ClientResponse archiveClient(UUID userId, UUID clientId) {
        Client client = clientRepository.findByIdAndUserId(clientId, userId)
            .orElseThrow(() -> new NotFoundException("Client not found"));
        
        client.setStatus("archived");
        Client archivedClient = clientRepository.save(client);
        return mapToResponse(archivedClient);
    }

    // Restore client
    @Transactional
    public ClientResponse restoreClient(UUID userId, UUID clientId) {
        Client client = clientRepository.findByIdAndUserId(clientId, userId)
            .orElseThrow(() -> new NotFoundException("Client not found"));
        
        client.setStatus("active");
        Client restoredClient = clientRepository.save(client);
        return mapToResponse(restoredClient);
    }

    // Search clients
    public List<ClientResponse> searchClients(UUID userId, String searchTerm) {
        return clientRepository.searchByUser(userId, searchTerm).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    // Get client summary
    public ClientSummaryResponse getClientSummary(UUID userId, UUID clientId) {
        Client client = clientRepository.findByIdAndUserId(clientId, userId)
            .orElseThrow(() -> new NotFoundException("Client not found"));

        // TODO: Implement actual summary logic with counts from projects, quotes, invoices
        // For now, returning basic info
        return new ClientSummaryResponse(
            client.getId().toString(),
            client.getCompanyName(),
            client.getContactName(),
            client.getEmail(),
            client.getStatus(),
            0, // projectCount - to be implemented
            0, // quoteCount - to be implemented
            0, // invoiceCount - to be implemented
            null, // totalInvoiced - to be implemented
            null, // totalPaid - to be implemented
            null  // lastInvoiceDate - to be implemented
        );
    }

    // Get clients count for user
    public Long getClientsCount(UUID userId) {
        return clientRepository.countByUserId(userId);
    }

    // Get recent clients
    public List<ClientResponse> getRecentClients(UUID userId, int limit) {
        return clientRepository.findByUserId(userId, 
            org.springframework.data.domain.PageRequest.of(0, limit, 
                org.springframework.data.domain.Sort.by("updatedAt").descending()))
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }
}