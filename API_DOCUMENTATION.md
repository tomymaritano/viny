# 📚 API DOCUMENTATION

## 🚀 Viny API v1.0

### Base URL

```
http://localhost:3000/api/v1
```

### Authentication

```javascript
// Headers required for all requests
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer {token}' // If authentication is implemented
}
```

## 📝 Notes API

### GET /notes

Retrieve all notes for the user

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "notebook": "string",
      "tags": ["string"],
      "status": "active | on-hold | completed | dropped",
      "isPinned": boolean,
      "isTrashed": boolean,
      "createdAt": "ISO 8601 date",
      "updatedAt": "ISO 8601 date",
      "trashedAt": "ISO 8601 date | null"
    }
  ],
  "total": number
}
```

### POST /notes

Create a new note

**Request Body:**

```json
{
  "title": "string",
  "content": "string",
  "notebook": "string",
  "tags": ["string"],
  "status": "active"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "content": "string",
    "notebook": "string",
    "tags": ["string"],
    "status": "active",
    "isPinned": false,
    "isTrashed": false,
    "createdAt": "ISO 8601 date",
    "updatedAt": "ISO 8601 date"
  }
}
```

### PUT /notes/:id

Update an existing note

**Request Body:**

```json
{
  "title": "string",
  "content": "string",
  "notebook": "string",
  "tags": ["string"],
  "status": "active | on-hold | completed | dropped",
  "isPinned": boolean
}
```

### DELETE /notes/:id

Move note to trash

**Response:**

```json
{
  "success": true,
  "message": "Note moved to trash"
}
```

### DELETE /notes/:id/permanent

Permanently delete a note

**Response:**

```json
{
  "success": true,
  "message": "Note permanently deleted"
}
```

### PUT /notes/:id/restore

Restore note from trash

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "string"
    // ... note object
  }
}
```

## 📚 Notebooks API

### GET /notebooks

Get all notebooks

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "color": "string",
      "description": "string",
      "createdAt": "ISO 8601 date",
      "notesCount": number
    }
  ]
}
```

### POST /notebooks

Create a new notebook

**Request Body:**

```json
{
  "name": "string",
  "color": "string",
  "description": "string"
}
```

### PUT /notebooks/:id

Update notebook

### DELETE /notebooks/:id

Delete notebook (moves all notes to default)

## 🏷️ Tags API

### GET /tags

Get all tags with usage count

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "tag": "string",
      "count": number
    }
  ]
}
```

## 🔍 Search API

### GET /search?q={query}

Search notes by title, content, tags

**Query Parameters:**

- `q`: Search query (required)
- `notebook`: Filter by notebook
- `status`: Filter by status
- `limit`: Results limit (default: 50)
- `offset`: Pagination offset

**Response:**

```json
{
  "success": true,
  "data": [
    {
      // ... note objects matching search
    }
  ],
  "total": number,
  "hasMore": boolean
}
```

## 🔄 Sync API

### GET /sync/status

Get sync status

**Response:**

```json
{
  "success": true,
  "data": {
    "lastSync": "ISO 8601 date",
    "pendingChanges": number,
    "isOnline": boolean
  }
}
```

### POST /sync

Sync local changes with server

**Request Body:**

```json
{
  "changes": [
    {
      "type": "create | update | delete",
      "id": "string",
      "data": {}, // Note data for create/update
      "timestamp": "ISO 8601 date"
    }
  ]
}
```

## ⚙️ Settings API

### GET /settings

Get user settings

**Response:**

```json
{
  "success": true,
  "data": {
    "theme": "dark | light | system",
    "markdownFontFamily": "string",
    "markdownFontSize": "string",
    "editorSettings": {
      "fontSize": "string",
      "lineHeight": "string",
      "showLineNumbers": boolean
    }
  }
}
```

### PUT /settings

Update user settings

## 📊 Export API

### POST /export

Export notes in various formats

**Request Body:**

```json
{
  "format": "markdown | json | csv | pdf",
  "noteIds": ["string"], // Optional, exports all if not provided
  "options": {
    "includeMetadata": boolean,
    "compression": boolean
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "downloadUrl": "string",
    "filename": "string",
    "expiresAt": "ISO 8601 date"
  }
}
```

## 🚨 Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": {} // Optional additional info
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Invalid request data
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `RATE_LIMITED`: Too many requests
- `SERVER_ERROR`: Internal server error

## 🔧 Development Notes

### LocalStorage Structure

```javascript
// For offline mode
{
  "viny_notes": [
    // Array of note objects
  ],
  "viny_notebooks": [
    // Array of notebook objects
  ],
  "viny_settings": {
    // Settings object
  },
  "viny_use_api": boolean, // Toggle between API/localStorage
  "viny_last_sync": "ISO 8601 date"
}
```

### WebSocket Events (Future)

```javascript
// Real-time updates
ws.on('note_updated', noteData => {
  // Update local note
})

ws.on('note_deleted', noteId => {
  // Remove note from UI
})
```

### Rate Limiting

- Search: 10 requests/minute
- CRUD operations: 100 requests/minute
- Export: 5 requests/hour

### Pagination

- Default limit: 50
- Max limit: 200
- Use `offset` and `limit` parameters
