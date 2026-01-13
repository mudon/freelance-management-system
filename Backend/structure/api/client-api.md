ClientController /api/user/clients
 ├── POST /
 │     └── createClient()
 │
 ├── GET /
 │     └── getAllClients()
 │
 ├── GET /paginated
 │     └── getAllClientsPaginated(Pageable pageable)
 │
 ├── GET /{clientId}
 │     └── getClientById()
 │
 ├── PUT /{clientId}
 │     └── updateClient()
 │
 ├── DELETE /{clientId}
 │     └── deleteClient()
 │
 ├── Archive/
 │     ├── POST /{clientId}/archive
 │     │     └── archiveClient()
 │     └── POST /{clientId}/restore
 │           └── restoreClient()
 │
 ├── Filtering/
 │     ├── GET /status/{status}
 │     │     └── getClientsByStatus()
 │     └── GET /search?query=
 │           └── searchClients()
 │
 ├── Summary/
 │     └── GET /{clientId}/summary
 │           └── getClientSummary()
 │
 ├── Count/
 │     └── GET /count
 │           └── getClientsCount()
 │
 └── Recent/
       └── GET /recent?limit=
             └── getRecentClients()
