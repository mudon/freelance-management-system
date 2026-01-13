/api/user/projects
├── POST /
│     → Create a new project
│
├── GET /
│     → Get all projects
│
├── GET /paginated
│     → Get all projects with pagination
│
├── GET /{projectId}
│     → Get project by ID
│
├── PUT /{projectId}
│     → Update project
│
├── DELETE /{projectId}
│     → Delete project
│
├── PATCH /{projectId}/status
│     → Update project status
│
├── GET /status/{status}
│     → Get projects by status
│
├── GET /client/{clientId}
│     → Get projects by client
│
├── GET /search?query={query}
│     → Search projects
│
├── GET /{projectId}/summary
│     → Get project summary
│
├── GET /overdue
│     → Get overdue projects
│
├── GET /due-range?startDate={start}&endDate={end}
│     → Get projects by due date range
│
├── GET /tag/{tag}
│     → Get projects by tag
│
├── GET /tags
│     → Get all project tags for user
│
├── GET /count
│     → Get projects count
│
├── GET /count/status/{status}
│     → Get projects count by status
│
├── GET /recent?limit={limit}
│     → Get recent projects
│
└── GET /upcoming?limit={limit}
      → Get upcoming projects
