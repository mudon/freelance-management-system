/home/iot-2/Desktop/hazim/myproject/freelanceapp/src/main
├── java
│   └── com
│       └── example
│           └── freelanceapp
│               ├── FreelanceAppApplication.java
│               ├── config
│               │   ├── JwtAuthenticationFilter.java
│               │   ├── SecurityConfig.java
│               │   ├── SwaggerConfig.java
│               │   └── WebConfig.java
│               ├── controllers
│               │   ├── ActivityLogController.java
│               │   ├── ClientController.java
│               │   ├── FileController.java
│               │   ├── InvoiceController.java
│               │   ├── InvoiceItemController.java
│               │   ├── PaymentController.java
│               │   ├── ProjectController.java
│               │   ├── QuoteController.java
│               │   ├── QuoteItemController.java
│               │   ├── ReminderController.java
│               │   └── UserController.java
│               ├── dtos
│               │   ├── ActivityLogRequest.java
│               │   ├── ActivityLogResponse.java
│               │   ├── ActivityLogSummaryResponse.java
│               │   ├── auth
│               │   │   ├── AuthResponse.java
│               │   │   └── RefreshTokenRequest.java
│               │   ├── client
│               │   │   ├── ClientRequest.java
│               │   │   ├── ClientResponse.java
│               │   │   └── ClientSummaryResponse.java
│               │   ├── file
│               │   ├── invoice
│               │   │   ├── InvoiceAgingResponse.java
│               │   │   ├── InvoiceItemRequest.java
│               │   │   ├── InvoiceItemResponse.java
│               │   │   ├── InvoicePaymentRequest.java
│               │   │   ├── InvoicePaymentResponse.java
│               │   │   ├── InvoiceRequest.java
│               │   │   ├── InvoiceResponse.java
│               │   │   └── InvoiceSummaryResponse.java
│               │   ├── payment
│               │   ├── project
│               │   │   ├── ProjectRequest.java
│               │   │   ├── ProjectResponse.java
│               │   │   └── ProjectSummaryResponse.java
│               │   ├── quote
│               │   │   ├── QuoteHistoryResponse.java
│               │   │   ├── QuoteItemRequest.java
│               │   │   ├── QuoteItemResponse.java
│               │   │   ├── QuoteRequest.java
│               │   │   ├── QuoteResponse.java
│               │   │   └── QuoteSummaryResponse.java
│               │   ├── reminder
│               │   │   ├── ReminderRequest.java
│               │   │   ├── ReminderResponse.java
│               │   │   ├── ReminderSummaryResponse.java
│               │   │   └── UpcomingReminderResponse.java
│               │   └── user
│               │       ├── UserCreateRequest.java
│               │       ├── UserLoginRequest.java
│               │       ├── UserResponse.java
│               │       └── UserUpdateRequest.java
│               ├── entities
│               │   ├── ActivityLog.java
│               │   ├── Client.java
│               │   ├── Invoice.java
│               │   ├── InvoiceItem.java
│               │   ├── InvoicePayment.java
│               │   ├── Project.java
│               │   ├── ProjectFile.java
│               │   ├── Quote.java
│               │   ├── QuoteHistory.java
│               │   ├── QuoteItem.java
│               │   ├── RefreshToken.java
│               │   ├── Reminder.java
│               │   └── User.java
│               ├── exceptions
│               │   ├── BadRequestException.java
│               │   ├── ForbiddenException.java
│               │   ├── NotFoundException.java
│               │   ├── SecurityExceptionHandler.java
│               │   └── UnauthorizedException.java
│               ├── repositories
│               │   ├── ActivityLogRepository.java
│               │   ├── ClientRepository.java
│               │   ├── InvoiceItemRepository.java
│               │   ├── InvoicePaymentRepository.java
│               │   ├── InvoiceRepository.java
│               │   ├── ProjectFileRepository.java
│               │   ├── ProjectRepository.java
│               │   ├── QuoteHistoryRepository.java
│               │   ├── QuoteItemRepository.java
│               │   ├── QuoteRepository.java
│               │   ├── RefreshTokenRepository.java
│               │   ├── ReminderRepository.java
│               │   └── UserRepository.java
│               ├── services
│               │   ├── ActivityLogService.java
│               │   ├── ClientService.java
│               │   ├── FileService.java
│               │   ├── InvoiceItemService.java
│               │   ├── InvoiceService.java
│               │   ├── PaymentService.java
│               │   ├── ProjectService.java
│               │   ├── QuoteItemService.java
│               │   ├── QuoteService.java
│               │   ├── RefreshTokenService.java
│               │   ├── ReminderService.java
│               │   └── UserService.java
│               └── utils
│                   ├── DateUtils.java
│                   ├── FileStorageUtil.java
│                   ├── JwtUtil.java
│                   ├── NumberGenerator.java
│                   └── PasswordUtil.java
└── resources
    └── application.properties

