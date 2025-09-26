# Viny API Reference

## 🚀 Complete API Documentation

This document combines the REST API reference and React hooks API for the Viny note-taking application.

## 📚 REST API Reference

### Base URL

```
http://localhost:3001/api
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

---

## 🎣 React Hooks API

## useNotes Hook API

The `useNotes` hook is the central state management solution for all note-related operations in Viny.

### Import

```javascript
import { useNotes } from './hooks/useNotes'
```

### Usage

```javascript
const {
  notes,
  currentNote,
  isEditorOpen,
  isLoading,
  openNote,
  createNewNote,
  saveNote,
  deleteNote,
  duplicateNote,
  exportNotes,
  importNotes,
  closeEditor,
  storage,
} = useNotes()
```

## State Properties

### `notes: Note[]`

Array of all notes in the application.

**Type**: `Array<Note>`
**Default**: `[]` (loads from localStorage on mount)

**Note Structure**:

```javascript
{
  id: number,           // Unique timestamp-based ID
  title: string,        // Note title
  content: string,      // Full markdown content
  preview: string,      // Auto-generated preview (first 100 chars)
  date: string,         // Creation date (YYYY-MM-DD)
  updatedAt: string,    // Last modification (ISO string)
  notebook: string,     // Category ('Personal', 'Work', etc.)
  isPinned: boolean,    // Pin status for priority display
  tags: string[]        // Array of tag strings
}
```

### `currentNote: Note | null`

The note currently being edited in the MarkdownEditor.

**Type**: `Note | null`
**Default**: `null`

### `isEditorOpen: boolean`

Whether the MarkdownEditor is currently visible.

**Type**: `boolean`
**Default**: `false`

### `isLoading: boolean`

Loading state during initial data fetch from localStorage.

**Type**: `boolean`
**Default**: `true` (becomes `false` after localStorage load)

## Action Methods

### `openNote(noteId: number): void`

Opens a note for editing in the MarkdownEditor.

**Parameters**:

- `noteId`: The ID of the note to open

**Behavior**:

- Sets `currentNote` to the specified note
- Sets `isEditorOpen` to `true`
- Switches UI to editor mode

**Example**:

```javascript
const handleEditNote = note => {
  openNote(note.id)
}
```

### `createNewNote(): void`

Creates a new note and opens it for editing.

**Behavior**:

- Generates new note with default values
- Uses current timestamp as ID
- Sets default notebook to 'Personal'
- Opens editor immediately

**Generated Note Structure**:

```javascript
{
  id: Date.now(),
  title: 'Untitled Note',
  content: '',
  preview: '',
  date: new Date().toISOString().split('T')[0],
  notebook: 'Personal',
  isPinned: false,
  tags: []
}
```

### `saveNote(noteData: Partial<Note>): void`

Saves or updates a note with the provided data.

**Parameters**:

- `noteData`: Partial note object with updates

**Behavior**:

- Updates existing note if ID matches
- Adds new note if ID doesn't exist
- Auto-generates preview from content
- Sets `updatedAt` timestamp
- Triggers auto-save to localStorage

**Example**:

```javascript
const handleSave = () => {
  const noteData = {
    ...currentNote,
    title: newTitle,
    content: newContent,
    updatedAt: new Date().toISOString(),
  }
  saveNote(noteData)
}
```

### `deleteNote(noteId: number): void`

Removes a note from the collection.

**Parameters**:

- `noteId`: ID of the note to delete

**Behavior**:

- Removes note from notes array
- Closes editor if deleted note was currently open
- Clears `currentNote` if it was the deleted note
- Triggers auto-save to localStorage

### `duplicateNote(noteId: number): Note | undefined`

Creates a copy of an existing note.

**Parameters**:

- `noteId`: ID of the note to duplicate

**Returns**: The duplicated note object or `undefined` if source note not found

**Behavior**:

- Creates new note with copied content
- Generates new ID and timestamp
- Appends " (Copy)" to title
- Adds to notes collection

**Example**:

```javascript
const handleDuplicate = noteId => {
  const duplicated = duplicateNote(noteId)
  if (duplicated) {
    console.log('Note duplicated:', duplicated.title)
  }
}
```

### `exportNotes(): boolean`

Exports all notes to a downloadable JSON file.

**Returns**: `boolean` - Success status

**Behavior**:

- Creates JSON file with version info and all notes
- Triggers browser download
- Filename format: `viny-notes-YYYY-MM-DD.json`
- Includes metadata (version, export date, note count)

**Export Structure**:

```javascript
{
  version: "1.0.0",
  exportedAt: "2024-01-15T10:30:00.000Z",
  notes: [...],
  totalNotes: 42
}
```

### `importNotes(file: File): Promise<ImportResult>`

Imports notes from a JSON file.

**Parameters**:

- `file`: File object from file input

**Returns**: `Promise<ImportResult>`

**ImportResult Type**:

```javascript
{
  imported: number,  // Number of notes actually imported
  total: number      // Total notes in the file
}
```

**Behavior**:

- Validates file format and structure
- Merges with existing notes (no duplicates by ID)
- Adds only new notes not already present
- Triggers auto-save after successful import

**Example**:

```javascript
const handleImport = async file => {
  try {
    const result = await importNotes(file)
    console.log(`Imported ${result.imported} of ${result.total} notes`)
  } catch (error) {
    console.error('Import failed:', error.message)
  }
}
```

### `closeEditor(): void`

Closes the MarkdownEditor and returns to preview mode.

**Behavior**:

- Sets `isEditorOpen` to `false`
- Clears `currentNote`
- Returns to notes list/preview layout

## Storage Utilities

### `storage` Object

Direct access to localStorage utilities for manual operations.

#### `storage.load(): Note[] | null`

Loads notes from localStorage.

**Returns**: Array of notes or `null` if no data/error

#### `storage.save(notes: Note[]): boolean`

Saves notes to localStorage.

**Parameters**:

- `notes`: Array of notes to save

**Returns**: Success status

#### `storage.clear(): boolean`

Clears all notes from localStorage.

**Returns**: Success status

## Auto-save Behavior

The hook implements automatic saving with the following characteristics:

### Trigger Conditions

- Notes array changes (add, update, delete)
- After initial loading completes
- Not during initial loading phase

### Storage Format

```javascript
{
  version: "1.0.0",                    // App version for migration
  notes: [...],                       // Notes array
  savedAt: "2024-01-15T10:30:00.000Z" // Save timestamp
}
```

### Error Handling

- Console logging for storage errors
- Graceful degradation if localStorage unavailable
- Returns `false` for failed operations

## Version Control

### Data Migration

The storage system includes version checking for future data migrations:

```javascript
// Current version check
if (data.version !== APP_VERSION) {
  console.warn('Data version mismatch, using defaults')
  return null
}
```

### Migration Strategy

Future versions can implement migration functions:

```javascript
const migrate = (data, fromVersion, toVersion) => {
  // Migration logic for different versions
  switch (fromVersion) {
    case '1.0.0':
      return migrateTo1_1_0(data)
    default:
      return data
  }
}
```

## Error Types

### Storage Errors

- **Parse Error**: Invalid JSON in localStorage
- **Version Mismatch**: Incompatible data version
- **Quota Exceeded**: localStorage size limit reached
- **Security Error**: localStorage access denied

### Import Errors

- **Invalid Format**: File is not valid JSON
- **Missing Data**: Required properties not present
- **Read Error**: File system read failure

### Runtime Errors

- **Note Not Found**: Attempting to operate on non-existent note
- **Invalid ID**: Non-numeric or missing note ID
- **Network Error**: File download/upload issues

---

_API Version: 1.0.0_
_Last Updated: January 2024_
