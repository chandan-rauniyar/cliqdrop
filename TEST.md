# CliqDrop API - Testing Guide

Complete testing documentation for all API endpoints with sample requests, expected responses, and Postman testing instructions.

## Base URL
```
http://localhost:8080/api
```

## Required Headers
- `x-api-secret`: one of the secrets defined in `API_SECRETS`
- `x-client-id`: stable identifier per end user/device (string). If you cannot generate one, keep it constant for each browser/device session.

> All cURL commands below include these headers explicitly. Make sure to add them when testing in Postman or another tool.

---

## 📋 Table of Contents
1. [Health Check](#1-health-check)
2. [Upload File](#2-upload-file)
3. [Share Text](#3-share-text)
4. [Get Share by Code](#4-get-share-by-code)
5. [Download File](#5-download-file)
6. [Error Scenarios](#6-error-scenarios)
7. [Rate Limit Validation](#7-rate-limit-validation)

---

## 1. Health Check

### Endpoint
```
GET /api/health
```

### Test URL
```
http://localhost:8080/api/health
```

### cURL Command
```bash
curl http://localhost:8080/api/health \
  -H "x-api-secret: YOUR_SECRET" \
  -H "x-client-id: tester-health"
```

### Postman Setup
- **Method:** GET
- **URL:** `http://localhost:8080/api/health`
- **Headers:** None required

### Expected Response (200 OK)
```json
{
  "success": true,
  "message": "CliqDrop API is running",
  "timestamp": "2025-11-16T10:38:00.000Z"
}
```

---

## 2. Upload File

### Endpoint
```
POST /api/send/file
```

### Test URLs
```
http://localhost:8080/api/send/file
```

### Test Case 1: Basic File Upload (Default 30 min expiry)

#### cURL Command
```bash
curl -X POST http://localhost:8080/api/send/file \
  -H "x-api-secret: YOUR_SECRET" \
  -H "x-client-id: device-basic-file" \
  -F "file=@test-document.pdf"
```

#### Postman Setup
- **Method:** POST
- **URL:** `http://localhost:8080/api/send/file`
- **Body Type:** form-data
- **Key-Value Pairs:**
  - `file` (File): Select any file (max 100MB)

#### Expected Response (201 Created)
```json
{
  "success": true,
  "code": "A3B9C2",
  "expires_at": "2025-11-16T11:08:00.000Z",
  "delete_after_view": false,
  "message": "File uploaded successfully"
}
```

---

### Test Case 2: File Upload with Custom Expiry (60 minutes)

#### cURL Command
```bash
curl -X POST http://localhost:8080/api/send/file \
  -H "x-api-secret: YOUR_SECRET" \
  -H "x-client-id: device-custom-expiry" \
  -F "file=@photo.jpg" \
  -F "expiresIn=60"
```

#### Postman Setup
- **Method:** POST
- **URL:** `http://localhost:8080/api/send/file`
- **Body Type:** form-data
- **Key-Value Pairs:**
  - `file` (File): Select any image file
  - `expiresIn` (Text): `60`

#### Expected Response (201 Created)
```json
{
  "success": true,
  "code": "X7Y2Z9",
  "expires_at": "2025-11-16T11:38:00.000Z",
  "delete_after_view": false,
  "message": "File uploaded successfully"
}
```

---

### Test Case 3: File Upload with Delete After View

#### cURL Command
```bash
curl -X POST http://localhost:8080/api/send/file \
  -H "x-api-secret: YOUR_SECRET" \
  -H "x-client-id: device-delete-once" \
  -F "file=@secret-document.pdf" \
  -F "expiresIn=120" \
  -F "deleteAfterView=true"
```

#### Postman Setup
- **Method:** POST
- **URL:** `http://localhost:8080/api/send/file`
- **Body Type:** form-data
- **Key-Value Pairs:**
  - `file` (File): Select any file
  - `expiresIn` (Text): `120`
  - `deleteAfterView` (Text): `true`

#### Expected Response (201 Created)
```json
{
  "success": true,
  "code": "M9N8P7",
  "expires_at": "2025-11-16T12:38:00.000Z",
  "delete_after_view": true,
  "message": "File uploaded successfully"
}
```

---

### Test Case 4: Maximum Expiry Time (24 hours = 1440 minutes)

#### cURL Command
```bash
curl -X POST http://localhost:8080/api/send/file \
  -H "x-api-secret: YOUR_SECRET" \
  -H "x-client-id: device-max-expiry" \
  -F "file=@large-file.zip" \
  -F "expiresIn=1440"
```

#### Postman Setup
- **Method:** POST
- **URL:** `http://localhost:8080/api/send/file`
- **Body Type:** form-data
- **Key-Value Pairs:**
  - `file` (File): Select any file
  - `expiresIn` (Text): `1440`

#### Expected Response (201 Created)
```json
{
  "success": true,
  "code": "Q5R4S3",
  "expires_at": "2025-11-17T10:38:00.000Z",
  "delete_after_view": false,
  "message": "File uploaded successfully"
}
```

---

### Error Test Case 1: No File Uploaded

#### cURL Command
```bash
curl -X POST http://localhost:8080/api/send/file \
  -H "x-api-secret: YOUR_SECRET" \
  -H "x-client-id: device-no-file"
```

#### Postman Setup
- **Method:** POST
- **URL:** `http://localhost:8080/api/send/file`
- **Body:** Empty or no file field

#### Expected Response (400 Bad Request)
```json
{
  "success": false,
  "error": "No file uploaded"
}
```

---

### Error Test Case 2: File Too Large (>100MB)

#### Postman Setup
- **Method:** POST
- **URL:** `http://localhost:8080/api/send/file`
- **Body Type:** form-data
- **Key-Value Pairs:**
  - `file` (File): Select a file larger than 100MB

#### Expected Response (400 Bad Request)
```json
{
  "success": false,
  "error": "File size exceeds 100MB limit"
}
```

---

## 3. Share Text

### Endpoint
```
POST /api/send/text
```

### Test URLs
```
http://localhost:8080/api/send/text
```

### Test Case 1: Basic Text Share (Default 30 min expiry)

#### cURL Command
```bash
curl -X POST http://localhost:8080/api/send/text \
  -H "x-api-secret: YOUR_SECRET" \
  -H "x-client-id: text-basic" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello, this is a test message!"
  }'
```

#### Postman Setup
- **Method:** POST
- **URL:** `http://localhost:8080/api/send/text`
- **Headers:**
  - `Content-Type: application/json`
- **Body Type:** raw (JSON)
- **Body:**
```json
{
  "content": "Hello, this is a test message!"
}
```

#### Expected Response (201 Created)
```json
{
  "success": true,
  "code": "T2U1V0",
  "expires_at": "2025-11-16T11:08:00.000Z",
  "delete_after_view": false,
  "word_count": 6,
  "message": "Text shared successfully"
}
```

---

### Test Case 2: Text Share with Custom Expiry

#### cURL Command
```bash
curl -X POST http://localhost:8080/api/send/text \
  -H "x-api-secret: YOUR_SECRET" \
  -H "x-client-id: text-custom-expiry" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a longer message with multiple words to test the word counting functionality.",
    "expiresIn": 60
  }'
```

#### Postman Setup
- **Method:** POST
- **URL:** `http://localhost:8080/api/send/text`
- **Headers:**
  - `Content-Type: application/json`
- **Body Type:** raw (JSON)
- **Body:**
```json
{
  "content": "This is a longer message with multiple words to test the word counting functionality.",
  "expiresIn": 60
}
```

#### Expected Response (201 Created)
```json
{
  "success": true,
  "code": "W9X8Y7",
  "expires_at": "2025-11-16T11:38:00.000Z",
  "delete_after_view": false,
  "word_count": 12,
  "message": "Text shared successfully"
}
```

---

### Test Case 3: Text Share with Delete After View

#### cURL Command
```bash
curl -X POST http://localhost:8080/api/send/text \
  -H "x-api-secret: YOUR_SECRET" \
  -H "x-client-id: text-delete-view" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a secret message that should be deleted after viewing.",
    "expiresIn": 120,
    "deleteAfterView": true
  }'
```

#### Postman Setup
- **Method:** POST
- **URL:** `http://localhost:8080/api/send/text`
- **Headers:**
  - `Content-Type: application/json`
- **Body Type:** raw (JSON)
- **Body:**
```json
{
  "content": "This is a secret message that should be deleted after viewing.",
  "expiresIn": 120,
  "deleteAfterView": true
}
```

#### Expected Response (201 Created)
```json
{
  "success": true,
  "code": "Z1A2B3",
  "expires_at": "2025-11-16T12:38:00.000Z",
  "delete_after_view": true,
  "word_count": 10,
  "message": "Text shared successfully"
}
```

---

### Test Case 4: Long Text (Near 10K Word Limit)

#### Postman Setup
- **Method:** POST
- **URL:** `http://localhost:8080/api/send/text`
- **Headers:**
  - `Content-Type: application/json`
- **Body Type:** raw (JSON)
- **Body:**
```json
{
  "content": "[Generate or paste a text with approximately 9,000-10,000 words here]",
  "expiresIn": 240
}
```

#### Expected Response (201 Created)
```json
{
  "success": true,
  "code": "C4D5E6",
  "expires_at": "2025-11-16T14:38:00.000Z",
  "delete_after_view": false,
  "word_count": 9500,
  "message": "Text shared successfully"
}
```

---

### Error Test Case 1: Missing Content

#### cURL Command
```bash
curl -X POST http://localhost:8080/api/send/text \
  -H "x-api-secret: YOUR_SECRET" \
  -H "x-client-id: text-missing-content" \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### Postman Setup
- **Method:** POST
- **URL:** `http://localhost:8080/api/send/text`
- **Headers:**
  - `Content-Type: application/json`
- **Body Type:** raw (JSON)
- **Body:**
```json
{}
```

#### Expected Response (400 Bad Request)
```json
{
  "success": false,
  "error": "Text content is required"
}
```

---

### Error Test Case 2: Text Exceeds 10,000 Words

#### Postman Setup
- **Method:** POST
- **URL:** `http://localhost:8080/api/send/text`
- **Headers:**
  - `Content-Type: application/json`
- **Body Type:** raw (JSON)
- **Body:**
```json
{
  "content": "[Text with more than 10,000 words - generate a very long text]"
}
```

#### Expected Response (400 Bad Request)
```json
{
  "success": false,
  "error": "Text content exceeds 10,000 words limit"
}
```

---

## 4. Get Share by Code

### Endpoint
```
GET /api/receive/:code
```

### Test URLs (Replace CODE with actual code from upload/share)
```
http://localhost:8080/api/receive/A3B9C2
http://localhost:8080/api/receive/X7Y2Z9
http://localhost:8080/api/receive/T2U1V0
```

### Test Case 1: Retrieve File Share Info

#### cURL Command
```bash
curl http://localhost:8080/api/receive/A3B9C2 \
  -H "x-api-secret: YOUR_SECRET" \
  -H "x-client-id: receive-file"
```

#### Postman Setup
- **Method:** GET
- **URL:** `http://localhost:8080/api/receive/A3B9C2`
  - Replace `A3B9C2` with actual code from file upload
- **Headers:** None required

#### Expected Response (200 OK) - File Share
```json
{
  "success": true,
  "type": "file",
  "content": null,
  "file_info": {
    "filename": "test-document.pdf",
    "mime_type": "application/pdf",
    "file_size": 2048123,
    "size_mb": "1.95"
  },
  "expires_at": "2025-11-16T11:08:00.000Z",
  "created_at": "2025-11-16T10:38:00.000Z",
  "view_count": 1
}
```

---

### Test Case 2: Retrieve Text Share Info

#### cURL Command
```bash
curl http://localhost:8080/api/receive/T2U1V0 \
  -H "x-api-secret: YOUR_SECRET" \
  -H "x-client-id: receive-text"
```

#### Postman Setup
- **Method:** GET
- **URL:** `http://localhost:8080/api/receive/T2U1V0`
  - Replace `T2U1V0` with actual code from text share
- **Headers:** None required

#### Expected Response (200 OK) - Text Share
```json
{
  "success": true,
  "type": "text",
  "content": "Hello, this is a test message!",
  "file_info": null,
  "expires_at": "2025-11-16T11:08:00.000Z",
  "created_at": "2025-11-16T10:38:00.000Z",
  "view_count": 1
}
```

---

### Test Case 3: Case-Insensitive Code

#### cURL Command
```bash
curl http://localhost:8080/api/receive/a3b9c2 \
  -H "x-api-secret: YOUR_SECRET" \
  -H "x-client-id: receive-lowercase"
```

#### Postman Setup
- **Method:** GET
- **URL:** `http://localhost:8080/api/receive/a3b9c2`
  - Using lowercase code (should work same as uppercase)

#### Expected Response (200 OK)
Same as Test Case 1

---

### Error Test Case 1: Invalid Code Format

#### cURL Command
```bash
curl http://localhost:8080/api/receive/ABC \
  -H "x-api-secret: YOUR_SECRET" \
  -H "x-client-id: receive-invalid-format"
```

#### Postman Setup
- **Method:** GET
- **URL:** `http://localhost:8080/api/receive/ABC`
  - Code too short (less than 6 characters)

#### Expected Response (400 Bad Request)
```json
{
  "success": false,
  "error": "Invalid code format"
}
```

---

### Error Test Case 2: Code Not Found

#### cURL Command
```bash
curl http://localhost:8080/api/receive/ZZZZZZ \
  -H "x-api-secret: YOUR_SECRET" \
  -H "x-client-id: receive-missing"
```

#### Postman Setup
- **Method:** GET
- **URL:** `http://localhost:8080/api/receive/ZZZZZZ`
  - Non-existent code

#### Expected Response (404 Not Found)
```json
{
  "success": false,
  "error": "Share code not found or expired"
}
```

---

### Error Test Case 3: Expired Code

#### Postman Setup
- **Method:** GET
- **URL:** `http://localhost:8080/api/receive/EXPIRED`
  - Use a code that has expired (wait 30+ minutes after creation)

#### Expected Response (404 Not Found)
```json
{
  "success": false,
  "error": "Share code has expired"
}
```

---

## 5. Download File

### Endpoint
```
GET /api/download/:code
```

### Test URLs (Replace CODE with actual code from file upload)
```
http://localhost:8080/api/download/A3B9C2
http://localhost:8080/api/download/X7Y2Z9
```

### Test Case 1: Download File

#### cURL Command
```bash
curl -O http://localhost:8080/api/download/A3B9C2 \
  -H "x-api-secret: YOUR_SECRET" \
  -H "x-client-id: download-file"
```

#### Postman Setup
- **Method:** GET
- **URL:** `http://localhost:8080/api/download/A3B9C2`
  - Replace `A3B9C2` with actual code from file upload
- **Headers:** None required
- **Send and Download:** Check "Send and Download" in Postman

#### Expected Response (200 OK)
- **Content-Type:** Based on file MIME type (e.g., `application/pdf`, `image/jpeg`)
- **Content-Disposition:** `attachment; filename="original-filename.ext"`
- **Body:** File binary data

---

### Test Case 2: Download with Browser

#### Test URL
```
http://localhost:8080/api/download/A3B9C2
```

Simply paste the URL in your browser - file will download automatically.

---

### Error Test Case 1: Code is for Text, Not File

#### cURL Command
```bash
curl http://localhost:8080/api/download/T2U1V0 \
  -H "x-api-secret: YOUR_SECRET" \
  -H "x-client-id: download-text-code"
```

#### Postman Setup
- **Method:** GET
- **URL:** `http://localhost:8080/api/download/T2U1V0`
  - Use a code from text share (not file)

#### Expected Response (400 Bad Request)
```json
{
  "success": false,
  "error": "This code is for text sharing, not a file"
}
```

---

### Error Test Case 2: Code Not Found

#### cURL Command
```bash
curl http://localhost:8080/api/download/INVALID \
  -H "x-api-secret: YOUR_SECRET" \
  -H "x-client-id: download-invalid"
```

#### Postman Setup
- **Method:** GET
- **URL:** `http://localhost:8080/api/download/INVALID`

#### Expected Response (404 Not Found)
```json
{
  "success": false,
  "error": "Share code not found or expired"
}
```

---

## 6. Error Scenarios

### Test Case: Delete After View Functionality

#### Step 1: Upload File with Delete After View
```
POST /api/send/file
Body: form-data
- file: [any file]
- deleteAfterView: true
```

**Save the code from response** (e.g., `ABC123`)

#### Step 2: Retrieve Share Info (First View)
```
GET /api/receive/ABC123
```

**Expected:** Returns file info, `view_count: 1`

#### Step 3: Try to Retrieve Again (Should be Expired)
```
GET /api/receive/ABC123
```

**Expected:** 
```json
{
  "success": false,
  "error": "Share code has expired"
}
```

---

### Test Case: Expiry Time Validation

#### Test 1: Expiry Less Than 1 Minute
```
POST /api/send/text
Body: { "content": "test", "expiresIn": 0 }
```

**Expected:** Uses default 30 minutes (minimum enforced)

#### Test 2: Expiry More Than 24 Hours
```
POST /api/send/text
Body: { "content": "test", "expiresIn": 2000 }
```

**Expected:** Uses maximum 1440 minutes (24 hours)

---

## 7. Rate Limit Validation

### 7.1 Text Share Limit (60 per minute)

1. Use the script below to send 61 text requests within a minute.
2. The first 60 should succeed. The 61st should return **429 Too Many Requests** with the message `Rate limit exceeded: You can only share up to 60 texts per minute.`

```bash
API_SECRET=YOUR_SECRET
CLIENT_ID=ratetest-text

for i in $(seq 1 61); do
  echo "Text request $i"
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:8080/api/send/text \
    -H "x-api-secret: $API_SECRET" \
    -H "x-client-id: $CLIENT_ID" \
    -H "Content-Type: application/json" \
    -d "{\"content\":\"Rate limit test #$i\"}"
done
```

### 7.2 File Upload Limit (1 GB per hour)

1. Create a 200 MB sample file (macOS/Linux example): `dd if=/dev/zero of=200mb.bin bs=1M count=200`
2. Upload it six times within an hour (total 1.2 GB). The sixth upload should return **429 Too Many Requests** with the message `Rate limit exceeded: File upload limit is 1GB per hour.`

```bash
API_SECRET=YOUR_SECRET
CLIENT_ID=ratetest-file

for i in $(seq 1 6); do
  echo "File upload $i"
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:8080/api/send/file \
    -H "x-api-secret: $API_SECRET" \
    -H "x-client-id: $CLIENT_ID" \
    -F "file=@200mb.bin"
done
```

> Windows users can create test files with `fsutil file createnew 200mb.bin 209715200` or use smaller files whose total size exceeds 1 GB.

### 7.3 Window Reset Expectations

- Text window resets 60 seconds after the first request in the current bucket.
- File window resets 60 minutes after the first upload in the current bucket.
- After reset, the user/device can resume using the API normally.

### 7.4 Receive/Download Limit (120 per minute)

1. Send 130 GET requests to `/receive/:code` (use a valid code). The first 120 should succeed. Requests 121-130 should fail with **429 Too Many Requests**.

```bash
API_SECRET=YOUR_SECRET
CLIENT_ID=ratetest-read
CODE=YOUR_VALID_CODE

for i in $(seq 1 130); do
  echo "Receive request $i"
  curl -s -o /dev/null -w "%{http_code}\n" \
    http://localhost:8080/api/receive/$CODE \
    -H "x-api-secret: $API_SECRET" \
    -H "x-client-id: $CLIENT_ID"
done
```

> You can adapt the script for `/download/:code` or `/health` if needed.

---

## 📝 Complete Testing Workflow

### Workflow 1: File Sharing End-to-End

1. **Upload File:**
   ```
   POST /api/send/file
   Body: form-data
   - file: test.pdf
   - expiresIn: 60
   ```
   **Save code:** `FILE123`

2. **Get File Info:**
   ```
   GET /api/receive/FILE123
   ```

3. **Download File:**
   ```
   GET /api/download/FILE123
   ```

---

### Workflow 2: Text Sharing End-to-End

1. **Share Text:**
   ```
   POST /api/send/text
   Body: JSON
   {
     "content": "Hello World!",
     "expiresIn": 60
   }
   ```
   **Save code:** `TEXT456`

2. **Get Text:**
   ```
   GET /api/receive/TEXT456
   ```

---

### Workflow 3: One-Time View Test

1. **Share Text with Delete After View:**
   ```
   POST /api/send/text
   Body: JSON
   {
     "content": "Secret message",
     "deleteAfterView": true
   }
   ```
   **Save code:** `ONCE789`

2. **View First Time:**
   ```
   GET /api/receive/ONCE789
   ```
   **Expected:** Returns content

3. **View Second Time:**
   ```
   GET /api/receive/ONCE789
   ```
   **Expected:** "Share code has expired"

---

## 🧪 Postman Collection Setup

### Creating Postman Collection

1. **Create New Collection:** "CliqDrop API Tests"

2. **Add Environment Variables:**
   - `base_url`: `http://localhost:8080/api`
   - `test_code_file`: (will be set after file upload)
   - `test_code_text`: (will be set after text share)

3. **Organize Requests:**
   - Health Check
   - Upload File (Basic)
   - Upload File (With Options)
   - Share Text (Basic)
   - Share Text (With Options)
   - Get Share Info
   - Download File
   - Error Tests
4. **Collection Headers:**
   - Add `x-api-secret` (Value: your issued secret)
   - Add `x-client-id` (Value: `postman-client` or similar)

### Using Environment Variables in Postman

For dynamic code testing:
1. After file upload, save response code to `test_code_file`
2. Use `{{test_code_file}}` in subsequent requests:
   ```
   GET {{base_url}}/receive/{{test_code_file}}
   ```

---

## ✅ Test Checklist

- [ ] Health check endpoint works
- [ ] File upload with default settings
- [ ] File upload with custom expiry
- [ ] File upload with delete after view
- [ ] Text share with default settings
- [ ] Text share with custom expiry
- [ ] Text share with delete after view
- [ ] Get file share info
- [ ] Get text share info
- [ ] Download file
- [ ] Case-insensitive code handling
- [ ] Invalid code format error
- [ ] Code not found error
- [ ] Expired code error
- [ ] File too large error
- [ ] Text too long error
- [ ] Missing content error
- [ ] One-time view functionality
- [ ] Expiry time limits (min/max)

---

## 🔍 Quick Test Commands

### Test All Endpoints (Bash Script)
```bash
# Set once for this script
API_SECRET=YOUR_SECRET
CLIENT_ID=cli-script

# Health check
curl http://localhost:8080/api/health \
  -H "x-api-secret: $API_SECRET" \
  -H "x-client-id: $CLIENT_ID"

# Upload file
CODE=$(curl -s -X POST http://localhost:8080/api/send/file \
  -H "x-api-secret: $API_SECRET" \
  -H "x-client-id: $CLIENT_ID" \
  -F "file=@test.txt" | jq -r '.code')
echo "File code: $CODE"

# Get file info
curl http://localhost:8080/api/receive/$CODE \
  -H "x-api-secret: $API_SECRET" \
  -H "x-client-id: $CLIENT_ID"

# Download file
curl -O http://localhost:8080/api/download/$CODE \
  -H "x-api-secret: $API_SECRET" \
  -H "x-client-id: $CLIENT_ID"

# Share text
TEXT_CODE=$(curl -s -X POST http://localhost:8080/api/send/text \
  -H "x-api-secret: $API_SECRET" \
  -H "x-client-id: $CLIENT_ID" \
  -H "Content-Type: application/json" \
  -d '{"content":"Test message"}' | jq -r '.code')
echo "Text code: $TEXT_CODE"

# Get text
curl http://localhost:8080/api/receive/$TEXT_CODE \
  -H "x-api-secret: $API_SECRET" \
  -H "x-client-id: $CLIENT_ID"
```

---

**Last Updated:** November 2025  
**API Version:** 1.0.0

