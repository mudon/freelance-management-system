/api/user/client/project/quote/invoices/{invoiceId}/payments
├── POST /
│     → Add payment to invoice
│
├── GET /
│     → Get all payments for invoice
│
├── GET /{paymentId}
│     → Get payment by ID
│
├── PUT /{paymentId}
│     → Update payment
│
├── DELETE /{paymentId}
│     → Delete payment
│
├── GET /status/{status}
│     → Get payments by status
│
├── GET /user-total
│     → Get total payments for logged-in user
│
└── GET /client-total/{clientId}
      → Get total payments for a specific client
