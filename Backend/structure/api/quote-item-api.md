/api/user/client/quotes/{quoteId}/items
├── POST /
│     → Add a new item to a quote
│
├── GET /
│     → Get all items for a quote
│
├── GET /{itemId}
│     → Get a specific quote item by ID
│
├── PUT /{itemId}
│     → Update a specific quote item
│
├── DELETE /{itemId}
│     → Delete a specific quote item
│
└── POST /reorder
      → Reorder quote items (accepts list of item IDs in new order)
