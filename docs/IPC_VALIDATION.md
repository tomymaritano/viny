# IPC Data Validation System

## Overview

As of January 20, 2025, Viny implements comprehensive data validation for all IPC (Inter-Process Communication) channels between the main and renderer processes. This is a critical security enhancement that prevents injection attacks and ensures data integrity.

## Why This Matters

Without validation, malicious or malformed data could:

- Cause the application to crash
- Lead to data corruption
- Enable path traversal attacks
- Allow code injection
- Bypass security restrictions

## Implementation

### Validation Schemas

All IPC data is validated using schemas defined in `electron/validation/ipcSchemas.ts`:

- **Note validation**: Ensures all note fields are properly typed
- **Notebook validation**: Validates notebook structure including nested children
- **Settings validation**: Prevents injection of dangerous values
- **Export options validation**: Ensures only valid export formats
- **ID validation**: Prevents path traversal and injection
- **File path validation**: Blocks dangerous paths

### Validated IPC Handlers

The following handlers now include validation:

#### Storage Operations

- `storage-save-note` - Validates complete note structure
- `storage-load-note` - Validates note ID format
- `storage-delete-note` - Validates note ID format
- `storage-save-notebooks` - Validates notebook array and each notebook
- `storage-save-settings` - Validates settings object structure

#### Export Operations

- `export-note-to-file` - Validates note, file path, and export options

### Validation Process

1. **Type checking**: Ensures data is the expected type
2. **Required fields**: Verifies all required fields are present
3. **Format validation**: Checks string formats (IDs, dates)
4. **Range validation**: Ensures numeric values are in valid ranges
5. **Sanitization**: Removes or rejects dangerous content

## Error Handling

When validation fails:

1. A descriptive error is thrown
2. The error is logged with context
3. The operation is aborted
4. The renderer receives a clear error message

Example:

```typescript
Invalid note data: Note title must be a string
Invalid settings data: Invalid value type for settings key: customFunction
Invalid export options: Export format must be one of: html, pdf, markdown, txt
```

## Testing Validation

To test that validation is working:

1. **Try to save invalid data**:

   ```javascript
   // This should fail
   await window.electronAPI.storage.saveNote({
     id: 123, // Should be string
     title: null, // Should be string
   })
   ```

2. **Check console for validation errors**:

   ```
   [IPC] storage-save-note failed: Error: Invalid note data: Note ID must be a non-empty string
   ```

3. **Verify legitimate operations still work**:
   ```javascript
   // This should succeed
   await window.electronAPI.storage.saveNote({
     id: 'note-123',
     title: 'My Note',
     content: 'Content',
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString(),
   })
   ```

## Security Benefits

✅ **Prevents injection attacks**: Malicious code cannot be injected through IPC
✅ **Ensures data integrity**: Only valid data structures are processed
✅ **Better error handling**: Clear errors instead of crashes
✅ **Audit trail**: All validation failures are logged
✅ **Type safety**: Runtime validation matches TypeScript types

## Future Improvements

1. **Add rate limiting**: Prevent DoS through rapid IPC calls
2. **Implement request signing**: Ensure requests come from our renderer
3. **Add field-level encryption**: For sensitive data like API keys
4. **Expand validation**: Cover all remaining IPC handlers
5. **Performance monitoring**: Track validation overhead

## Migration Notes

If you're adding new IPC handlers:

1. Define the data schema in `ipcSchemas.ts`
2. Import the validation function in `main.ts`
3. Validate data before processing:
   ```typescript
   ipcMain.handle('new-handler', async (event, data: unknown) => {
     const validation = validateMyData(data)
     if (!validation.success) {
       throw new Error(`Invalid data: ${validation.error}`)
     }
     // Process validation.data
   })
   ```

## Related Documentation

- [CSP_MIGRATION.md](./CSP_MIGRATION.md) - Content Security Policy changes
- [Electron Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)
