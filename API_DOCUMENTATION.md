# CliqDrop API Documentation

Complete API reference for CliqDrop Universal Data Transfer Bot.

## Base URL

```
http://localhost:8080/api
```

## Authentication

No authentication required. All endpoints are public.

## Response Format

All responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Endpoints

### 1. Upload File

Upload a file and receive a unique 6-digit share code.

**Endpoint:** `POST /api/send/file`

**Content-Type:** `multipart/form-data`

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | File to upload (max 100MB) |
| `expiresIn` | Number | No | Expiry time in minutes (default: 30, max: 1440) |
| `deleteAfterView` | Boolean/String | No | Delete after first view (default: false) |

**Request Example:**
```bash
curl -X POST http://localhost:8080/api/send/file \
  -F "file=@document.pdf" \
  -F "expiresIn=60" \
  -F "deleteAfterView=false"
```

**Response (201 Created):**
```json
{
  "success": true,
  "code": "A3B9C2",
  "expires_at": "2025-11-16T10:38:00.000Z",
  "delete_after_view": false,
  "message": "File uploaded successfully"
}
```

**Error Responses:**

| Status Code | Error |
|-------------|-------|
| 400 | No file uploaded / File size exceeds 100MB |
| 500 | Server error / Code generation failed |

---

### 2. Share Text

Share text content and receive a unique 6-digit share code.

**Endpoint:** `POST /api/send/text`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "content": "Your text message here",
  "expiresIn": 30,
  "deleteAfterView": false
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `content` | String | Yes | Text content (max 10,000 words) |
| `expiresIn` | Number | No | Expiry time in minutes (default: 30, max: 1440) |
| `deleteAfterView` | Boolean | No | Delete after first view (default: false) |

**Request Example:**
```bash
curl -X POST http://localhost:8080/api/send/text \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello, this is a test message!",
    "expiresIn": 60,
    "deleteAfterView": true
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "code": "X7Y2Z9",
  "expires_at": "2025-11-16T10:38:00.000Z",
  "delete_after_view": true,
  "word_count": 5,
  "message": "Text shared successfully"
}
```

**Error Responses:**

| Status Code | Error |
|-------------|-------|
| 400 | Text content is required / Exceeds 10,000 words |
| 500 | Server error / Code generation failed |

---

### 3. Get Share by Code

Retrieve share information using the code.

**Endpoint:** `GET /api/receive/:code`

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | String | Yes | 6-digit alphanumeric code |

**Request Example:**
```bash
curl http://localhost:8080/api/receive/A3B9C2
```

**Response (200 OK) - File Share:**
```json
{
  "success": true,
  "type": "file",
  "content": null,
  "file_info": {
    "filename": "document.pdf",
    "mime_type": "application/pdf",
    "file_size": 2048123,
    "size_mb": "1.95"
  },
  "expires_at": "2025-11-16T10:38:00.000Z",
  "created_at": "2025-11-16T10:08:00.000Z",
  "view_count": 1
}
```

**Response (200 OK) - Text Share:**
```json
{
  "success": true,
  "type": "text",
  "content": "Hello, this is a test message!",
  "file_info": null,
  "expires_at": "2025-11-16T10:38:00.000Z",
  "created_at": "2025-11-16T10:08:00.000Z",
  "view_count": 1
}
```

**Error Responses:**

| Status Code | Error |
|-------------|-------|
| 400 | Invalid code format |
| 404 | Share code not found or expired |

**Notes:**
- View count is incremented on each access
- If `delete_after_view` is true, the share is marked for deletion after first view
- Codes are case-insensitive

---

### 4. Download File

Download a file using the share code.

**Endpoint:** `GET /api/download/:code`

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | String | Yes | 6-digit alphanumeric code |

**Request Example:**
```bash
curl -O http://localhost:8080/api/download/A3B9C2
```

**Response (200 OK):**
- Content-Type: Based on file MIME type
- Content-Disposition: `attachment; filename="filename.ext"`
- Content-Length: File size in bytes
- Body: File stream

**Error Responses:**

| Status Code | Error |
|-------------|-------|
| 400 | Invalid code format / Code is for text, not file |
| 404 | Share code not found, expired, or file not found |

**Notes:**
- View count is incremented on download
- If `delete_after_view` is true, the share is marked for deletion after first download
- File is streamed directly to the client

---

### 5. Health Check

Check API health status.

**Endpoint:** `GET /api/health`

**Request Example:**
```bash
curl http://localhost:8080/api/health
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "CliqDrop API is running",
  "timestamp": "2025-11-16T10:38:00.000Z"
}
```

---

## Code Format

- **Length:** 6 characters
- **Format:** Alphanumeric (A-Z, 0-9)
- **Case:** Case-insensitive (stored in uppercase)
- **Uniqueness:** Guaranteed unique at time of generation
- **Example:** `A3B9C2`, `X7Y2Z9`, `492817`

## Expiry Options

### Default Expiry
- **Default:** 30 minutes
- **Maximum:** 24 hours (1440 minutes)
- **Minimum:** 1 minute

### One-Time View
Set `deleteAfterView: true` to automatically delete the share after the first access (view or download).

## File Limits

- **Maximum File Size:** 100MB
- **Supported Types:** All file types
- **Storage:** Files stored in `uploads/<code>/<filename>`

## Text Limits

- **Maximum Words:** 10,000 words
- **Word Count:** Calculated by whitespace separation
- **Storage:** Stored in database as TEXT

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## Error Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (invalid input) |
| 404 | Not Found (code not found or expired) |
| 500 | Internal Server Error |

## Examples

### Complete File Sharing Flow

1. **Upload File:**
```bash
curl -X POST http://localhost:8080/api/send/file \
  -F "file=@photo.jpg" \
  -F "expiresIn=60"
```

Response: `{ "code": "A3B9C2", ... }`

2. **Share Code:** Give code `A3B9C2` to recipient

3. **Recipient Retrieves Info:**
```bash
curl http://localhost:8080/api/receive/A3B9C2
```

4. **Recipient Downloads:**
```bash
curl -O http://localhost:8080/api/download/A3B9C2
```

### Complete Text Sharing Flow

1. **Share Text:**
```bash
curl -X POST http://localhost:8080/api/send/text \
  -H "Content-Type: application/json" \
  -d '{"content": "Secret message", "deleteAfterView": true}'
```

Response: `{ "code": "X7Y2Z9", ... }`

2. **Share Code:** Give code `X7Y2Z9` to recipient

3. **Recipient Retrieves:**
```bash
curl http://localhost:8080/api/receive/X7Y2Z9
```

Response includes the text content.

---

## Best Practices

1. **Expiry Time:** Set appropriate expiry times based on sensitivity
2. **One-Time View:** Use for sensitive data that should only be viewed once
3. **File Types:** All file types are supported, but validate on client side
4. **Error Handling:** Always check `success` field in responses
5. **Code Security:** Treat codes as sensitive - they provide access to data

---

**Last Updated:** November 2025  
**API Version:** 1.0.0

