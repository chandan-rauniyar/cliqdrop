# CliqDrop – Universal Data Transfer Bot

A RESTful API for sharing files and text messages using unique 6-digit alphanumeric codes. Files and text are automatically deleted after expiration (default 30 minutes, max 24 hours) or after being viewed once (optional).

## 🚀 Features

- **File Upload**: Upload any file type up to 100MB
- **Text Sharing**: Share text messages up to 10,000 words
- **Unique Codes**: 6-digit alphanumeric codes for secure sharing
- **Auto-Expiry**: Automatic deletion after expiration (default 30 min, max 24 hours)
- **One-Time View**: Optional deletion after first view
- **File Download**: Direct download links for shared files
- **Auto Cleanup**: Cron job automatically removes expired shares
- **API Secrets**: Only approved clients with `x-api-secret` can access the API
- **Per-User Rate Limits**: 60 text shares/min and 1GB uploads/hour per device

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CliqDrop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=8080
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASS=your_db_password
   DB_NAME=cliqdrop
   API_SECRETS=frontendSecret1,frontendSecret2
   UPLOAD_DIR=uploads
   BASE_URL=http://localhost:8080
   MAX_FILE_SIZE=100MB
   ```

4. **Create PostgreSQL database**
   ```sql
   CREATE DATABASE cliqdrop;
   ```

5. **Start the server**
   ```bash
   npm start
   ```

   The server will automatically create the required database tables on first run.

## 📁 Project Structure

```
CliqDrop/
├── src/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── controllers/
│   │   ├── send.controller.js # File/text upload logic
│   │   └── receive.controller.js # Code retrieval logic
│   ├── models/
│   │   └── Share.js           # Sequelize model
│   ├── routes/
│   │   └── api.js             # API routes
│   ├── middleware/
│   │   └── upload.js          # Multer file upload config
│   ├── utils/
│   │   ├── codeGenerator.js   # Unique code generation
│   │   └── deleteExpired.js   # Expired record cleanup
│   └── server.js              # Main server file
├── uploads/                    # Final uploaded files
├── temp/                       # Temporary file storage
├── logs/                       # Application logs
├── .env                        # Environment variables
├── .env.example                # Environment template
└── package.json
```

## 🔐 API Access & Rate Limits

- All requests **must** include the header `x-api-secret` with a value that matches one of the secrets specified in the `API_SECRETS` environment variable.
- Optionally send `x-client-id` to provide a stable, anonymous identifier per end user/device. If omitted, the API will derive a fingerprint from the IP and user-agent.
- **Rate limits (per end user/device):**
  - Text sharing: **60 requests per minute**
  - File uploads: **1 GB total per hour**
  - Receive/download/health: **120 requests per minute**
- When limits are exceeded the API responds with HTTP `429 Too Many Requests`.

## 📡 API Endpoints

> **Important:** Every endpoint below requires the header `x-api-secret: <your secret>`. For better rate-limit tracking, include `x-client-id: <stable-id>` for each end user.

### 1. Upload File
**POST** `/api/send/file`

Upload a file and receive a unique share code.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `file` (required): The file to upload (max 100MB)
  - `expiresIn` (optional): Expiry time in minutes (default: 30, max: 1440)
  - `deleteAfterView` (optional): Delete after first view (true/false)

**Response:**
```json
{
  "success": true,
  "code": "A3B9C2",
  "expires_at": "2025-11-16T10:38:00.000Z",
  "delete_after_view": false,
  "message": "File uploaded successfully"
}
```

**Example (cURL):**
```bash
curl -X POST http://localhost:8080/api/send/file \
  -H "x-api-secret: YOUR_SECRET" \
  -H "x-client-id: device-123" \
  -F "file=@/path/to/file.pdf" \
  -F "expiresIn=60" \
  -F "deleteAfterView=false"
```

### 2. Share Text
**POST** `/api/send/text`

Share text content and receive a unique share code.

**Request:**
- Content-Type: `application/json`
- Body:
  ```json
  {
    "content": "Your text message here (max 10,000 words)",
    "expiresIn": 30,
    "deleteAfterView": false
  }
  ```

**Response:**
```json
{
  "success": true,
  "code": "X7Y2Z9",
  "expires_at": "2025-11-16T10:38:00.000Z",
  "delete_after_view": false,
  "word_count": 15,
  "message": "Text shared successfully"
}
```

**Example (cURL):**
```bash
curl -X POST http://localhost:8080/api/send/text \
  -H "x-api-secret: YOUR_SECRET" \
  -H "x-client-id: user-123" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello, this is a test message!",
    "expiresIn": 60,
    "deleteAfterView": true
  }'
```

### 3. Get Share by Code
**GET** `/api/receive/:code`

Retrieve share information using the code.

**Response:**
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

**Example (cURL):**
```bash
curl http://localhost:8080/api/receive/A3B9C2 \
  -H "x-api-secret: YOUR_SECRET" \
  -H "x-client-id: device-123"
```

### 4. Download File
**GET** `/api/download/:code`

Download a file using the share code.

**Response:**
- File stream with appropriate headers

**Example (cURL):**
```bash
curl -O http://localhost:8080/api/download/A3B9C2 \
  -H "x-api-secret: YOUR_SECRET" \
  -H "x-client-id: device-123"
```

### 5. Health Check
**GET** `/api/health`

Check API health status.

**Response:**
```json
{
  "success": true,
  "message": "CliqDrop API is running",
  "timestamp": "2025-11-16T10:38:00.000Z"
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 8080 |
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_USER` | Database user | root |
| `DB_PASS` | Database password | - |
| `DB_NAME` | Database name | cliqdrop |
| `API_SECRETS` | Comma-separated list of allowed API secrets | - |
| `UPLOAD_DIR` | Upload directory | uploads |
| `BASE_URL` | Base API URL | http://localhost:8080 |
| `MAX_FILE_SIZE` | Max file size | 100MB |

### Expiry Options

- **Default**: 30 minutes
- **Maximum**: 24 hours (1440 minutes)
- **One-Time View**: Set `deleteAfterView: true` to delete after first access

## 🗄️ Database Schema

The `shares` table structure:

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key (auto-increment) |
| `code` | VARCHAR(10) | Unique 6-digit alphanumeric code |
| `type` | ENUM | 'text' or 'file' |
| `content` | TEXT | Text content (for text shares) |
| `file_path` | VARCHAR(255) | File path (for file shares) |
| `mime_type` | VARCHAR(100) | File MIME type |
| `file_size` | BIGINT | File size in bytes |
| `expires_at` | TIMESTAMP | Expiration timestamp |
| `delete_after_view` | BOOLEAN | Delete after first view |
| `view_count` | INTEGER | Number of times accessed |
| `created_at` | TIMESTAMP | Creation timestamp |

## 🔄 Auto Cleanup

A cron job runs every 5 minutes to:
- Delete expired shares
- Remove associated files from disk
- Clean up empty directories

## 🛡️ Security Considerations

1. **File Size Limits**: Enforced at 100MB maximum
2. **Text Limits**: 10,000 words maximum
3. **Code Uniqueness**: Automatically checked before assignment
4. **Expiry Enforcement**: All shares expire automatically
5. **One-Time View**: Optional deletion after first access

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists: `CREATE DATABASE codeshare;`

### File Upload Issues
- Check `uploads/` and `temp/` directories exist and are writable
- Verify file size is under 100MB
- Check disk space availability

### Code Generation Issues
- If you see "Unable to generate unique code", try again (very rare)
- Codes are case-insensitive but stored in uppercase

## 📝 Development

### Running in Development Mode
```bash
npm run dev
```

### Logs
Application logs are stored in the `logs/` directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

ISC License

## 👨‍💻 Support

For issues and questions, please open an issue on the repository.

---

**Built with ❤️ using Node.js, Express, PostgreSQL, and Sequelize**

