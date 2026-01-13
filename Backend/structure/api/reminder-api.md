/api/reminders
├── POST /
│     → Create a new reminder
│
├── GET /
│     → Get all reminders
│
├── GET /paginated
│     → Get all reminders with pagination
│
├── GET /{reminderId}
│     → Get a specific reminder by ID
│
├── PUT /{reminderId}
│     → Update a specific reminder
│
├── DELETE /{reminderId}
│     → Delete a specific reminder
│
├── POST /{reminderId}/complete
│     → Mark a reminder as completed
│
├── POST /{reminderId}/pending
│     → Mark a reminder as pending
│
├── POST /{reminderId}/cancel
│     → Cancel a reminder
│
├── POST /{reminderId}/snooze
│     → Snooze a reminder (accepts optional days and newTime)
│
├── GET /status/{status}
│     → Get reminders by status
│
├── GET /priority/{priority}
│     → Get reminders by priority
│
├── GET /related/{relatedType}/{relatedId}
│     → Get reminders by related entity
│
├── GET /search
│     → Search reminders by query
│
├── GET /summary
│     → Get reminder summary
│
├── GET /due-today
│     → Get reminders due today
│
├── GET /overdue
│     → Get overdue reminders
│
├── GET /upcoming
│     → Get upcoming reminders (limit optional, default 10)
│
├── GET /due-range
│     → Get reminders by due date range (startDate, endDate)
│
├── GET /completed-range
│     → Get completed reminders within a datetime range (startDate, endDate)
│
├── GET /recurring
│     → Get active recurring reminders
│
├── GET /count
│     → Get total reminders count
│
├── GET /count/status/{status}
│     → Get reminders count by status
│
├── GET /count/priority/{priority}
│     → Get reminders count by priority
│
├── GET /recent
│     → Get recent reminders (limit optional, default 5)
│
└── POST /bulk-update
      → Bulk update reminder status (accepts list of reminder IDs + status)
