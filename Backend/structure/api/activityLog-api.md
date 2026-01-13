ActivityLogController /api/activity-logs
 ├── GET /
 │     └── getAllActivities()
 │
 ├── GET /paginated
 │     └── getAllActivitiesPaginated(Pageable pageable)
 │
 ├── GET /{activityId}
 │     └── getActivityById(UUID activityId)
 │
 ├── Filtering/
 │     ├── GET /action/{action}
 │     │     └── getActivitiesByAction()
 │     ├── GET /entity-type/{entityType}
 │     │     └── getActivitiesByEntityType()
 │     ├── GET /entity/{entityType}/{entityId}
 │     │     └── getActivitiesByEntity()
 │     ├── GET /entity-id/{entityId}
 │     │     └── getActivitiesByEntityId()
 │     └── GET /filter?action=&entityType=
 │           └── getActivitiesByActionAndEntityType()
 │
 ├── Search/
 │     ├── GET /search?query=
 │     │     └── searchActivities()
 │     ├── GET /date-range?startDate=&endDate=
 │     │     └── getActivitiesByDateRange()
 │     ├── GET /today
 │     │     └── getTodayActivities()
 │     ├── GET /this-week
 │     │     └── getThisWeekActivities()
 │     └── GET /this-month
 │           └── getThisMonthActivities()
 │
 ├── Summary/
 │     ├── GET /summary
 │     │     └── getActivitySummary()
 │     ├── GET /count
 │     │     └── getActivitiesCount()
 │     ├── GET /recent?limit=
 │     │     └── getRecentActivities()
 │     └── GET /dashboard?limit=
 │           └── getDashboardActivities()
 │
 ├── Timeline/
 │     └── GET /timeline
 │           └── getUserActivityTimeline()
 │
 ├── Export/
 │     └── GET /export?startDate=&endDate=
 │           └── exportActivities()
 │
 ├── Maintenance/
 │     └── DELETE /cleanup?daysToKeep=
 │           └── clearOldActivities()
 │
 └── Logging/
       ├── POST /log/user
       │     └── logUserActivity()
       │
       ├── POST /log/client/{clientId}
       │     └── logClientActivity()
       │
       ├── POST /log/project/{projectId}
       │     └── logProjectActivity()
       │
       ├── POST /log/quote/{quoteId}
       │     └── logQuoteActivity()
       │
       └── POST /log/invoice/{invoiceId}
             └── logInvoiceActivity()
