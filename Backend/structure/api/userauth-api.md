/api/users
├── POST /register
│     → Register a new user
│
├── POST /login
│     → Login user
│
├── POST /refresh-token
│     → Refresh authentication token
│
├── POST /logout
│     → Logout user (requires authentication)
│
├── GET /me
│     → Get current authenticated user info (requires authentication)
│
├── GET /{id}
│     → Get user by ID (requires authentication)
│
├── PUT /{id}
│     → Update user info by ID (requires authentication)
│
└── DELETE /{id}
      → Delete user by ID (requires authentication)
