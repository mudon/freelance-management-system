/api/user/client/quotes
├── POST /
│     → Create a new quote
│
├── GET /
│     → Get all quotes
│
├── GET /paginated
│     → Get all quotes with pagination
│
├── GET /{quoteId}
│     → Get quote by ID
│
├── PUT /{quoteId}
│     → Update quote
│
├── DELETE /{quoteId}
│     → Delete quote
│
├── POST /{quoteId}/send
│     → Send quote
│
├── POST /{quoteId}/duplicate
│     → Duplicate quote
│
├── GET /status/{status}
│     → Get quotes by status
│
├── GET /client/{clientId}
│     → Get quotes by client
│
├── GET /project/{projectId}
│     → Get quotes by project
│
├── GET /search?query={query}
│     → Search quotes
│
├── GET /{quoteId}/summary
│     → Get quote summary
│
├── GET /{quoteId}/history
│     → Get quote history
│
├── GET /expired
│     → Get expired quotes
│
├── GET /valid-until-range?startDate={start}&endDate={end}
│     → Get quotes by valid until date range
│
├── GET /count
│     → Get quotes count
│
├── GET /count/status/{status}
│     → Get quotes count by status
│
├── GET /accepted-total
│     → Get accepted quotes total amount
│
├── GET /recent?limit={limit}
│     → Get recent quotes
│
├── PATCH /{quoteId}/status?status={status}
│     → Update quote status
│
└── PUBLIC ENDPOINTS (No authentication)
      ├── GET /public/{publicHash}
      │     → Get quote by public hash (client view)
      │
      ├── POST /public/{publicHash}/accept
      │     → Accept quote (client action)
      │
      └── POST /public/{publicHash}/reject
            → Reject quote (client action)
