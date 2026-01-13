/api/user/client/project/quote/invoices
├── POST /
│     → Create invoice
│
├── POST /from-quote/{quoteId}
│     → Create invoice from quote
│
├── GET /
│     → Get all invoices
│
├── GET /paginated
│     → Get all invoices (paginated)
│
├── GET /{invoiceId}
│     → Get invoice by ID
│
├── PUT /{invoiceId}
│     → Update invoice
│
├── DELETE /{invoiceId}
│     → Delete invoice
│
├── POST /{invoiceId}/send
│     → Send invoice
│
├── POST /{invoiceId}/cancel
│     → Cancel invoice
│
├── POST /{invoiceId}/duplicate
│     → Duplicate invoice
│
├── GET /status/{status}
│     → Get invoices by status
│
├── GET /client/{clientId}
│     → Get invoices by client
│
├── GET /project/{projectId}
│     → Get invoices by project
│
├── GET /quote/{quoteId}
│     → Get invoices by quote
│
├── GET /search?query=
│     → Search invoices
│
├── GET /{invoiceId}/summary
│     → Invoice summary
│
├── GET /aging-report
│     → Invoice aging report
│
├── GET /overdue
│     → Get overdue invoices
│
├── GET /due-range?startDate=&endDate=
│     → Invoices by due date range
│
├── GET /issue-range?startDate=&endDate=
│     → Invoices by issue date range
│
├── GET /count
│     → Count all invoices
│
├── GET /count/status/{status}
│     → Count invoices by status
│
├── GET /total-invoiced
│     → Total invoiced amount
│
├── GET /total-paid
│     → Total paid amount
│
├── GET /total-balance-due
│     → Total outstanding balance
│
├── GET /recent?limit=
│     → Recent invoices
│
├── PATCH /{invoiceId}/status?status=
│     → Update invoice status
│
└── PUBLIC ENDPOINTS
     └── GET /public/{publicHash}
           → Public invoice preview (no authentication)
