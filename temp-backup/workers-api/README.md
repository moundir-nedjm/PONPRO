# Pointage API - Cloudflare Workers

This directory contains the backend API for the Pointage application, built using Cloudflare Workers and KV Storage.

## Architecture

The API is built with the following components:

- **Cloudflare Workers**: Serverless compute platform for API endpoints
- **Cloudflare KV**: Key-value storage for data persistence
- **Cloudflare Durable Objects**: For managing WebSocket connections and real-time updates
- **Wrangler**: CLI tool for deploying and managing Workers

## Prerequisites

- Cloudflare account with Workers and KV access
- Wrangler CLI installed (`npm install -g wrangler`)
- Node.js and npm

## Setup Instructions

### 1. Login to Cloudflare using Wrangler

```bash
wrangler login
```

### 2. Create a KV Namespace

```bash
wrangler kv:namespace create "POINTAGE_DB"
wrangler kv:namespace create "POINTAGE_DB" --preview
```

After running these commands, you'll get IDs for both production and preview namespaces. Copy these IDs and update them in the `wrangler.toml` file:

```toml
kv_namespaces = [
  { binding = "POINTAGE_DB", id = "YOUR_PRODUCTION_ID", preview_id = "YOUR_PREVIEW_ID" }
]
```

### 3. Install dependencies

```bash
npm install
```

### 4. Initialize your data

If you're migrating from an existing MongoDB database, use the data migration tool:

```bash
# Install MongoDB driver for the migration script
npm install mongodb --save-dev

# Run the migration script (point to your MongoDB instance)
node scripts/migrate-data.js --mongodb-uri=mongodb://localhost:27017/pointage

# The script will generate JSON files and an import script in the ./data directory
cd data && ./import.sh
```

Alternatively, you can create test data directly in KV:

```bash
# Create a test admin user
wrangler kv:key put --binding=POINTAGE_DB "user:1" '{"id":"1","name":"Admin User","email":"admin@example.com","password":"admin123","role":"admin","createdAt":"2023-01-01T00:00:00.000Z","updatedAt":"2023-01-01T00:00:00.000Z"}'

# Create the email index
wrangler kv:key put --binding=POINTAGE_DB "user:email:admin@example.com" '"1"'
```

### 5. Deploy the Worker

Deploy to preview environment for testing:

```bash
npm run dev
```

Deploy to production:

```bash
npm run publish
```

## API Endpoints

### Authentication

- `POST /api/auth/login`: User login
  ```json
  {
    "email": "admin@example.com",
    "password": "admin123"
  }
  ```

- `POST /api/auth/refresh`: Refresh JWT token
  ```
  Authorization: Bearer <token>
  ```

- `GET /api/auth/profile`: Get user profile
  ```
  Authorization: Bearer <token>
  ```

### Employees

- `GET /api/employees`: List employees
  ```
  Authorization: Bearer <token>
  Query params: ?q=search+term
  ```

- `GET /api/employees/:id`: Get employee details
  ```
  Authorization: Bearer <token>
  ```

- `POST /api/employees`: Create employee
  ```
  Authorization: Bearer <token>
  
  {
    "name": "John Doe",
    "email": "john@example.com",
    "position": "Developer",
    "departmentId": "123",
    "role": "employee"
  }
  ```

- `PUT /api/employees/:id`: Update employee
  ```
  Authorization: Bearer <token>
  
  {
    "name": "John Smith",
    "email": "john.smith@example.com"
  }
  ```

- `DELETE /api/employees/:id`: Delete employee
  ```
  Authorization: Bearer <token>
  ```

### Attendance

- `GET /api/attendance`: Get attendance records
  ```
  Authorization: Bearer <token>
  Query params: ?date=2023-01-01&employeeId=123
  ```

- `POST /api/attendance`: Create attendance record
  ```
  Authorization: Bearer <token>
  
  {
    "employeeId": "123",
    "status": "present",
    "checkInTime": "2023-01-01T09:00:00.000Z",
    "checkOutTime": "2023-01-01T17:00:00.000Z"
  }
  ```

### Biometrics

- `POST /api/biometrics/register`: Register biometric data
  ```
  Authorization: Bearer <token>
  
  {
    "employeeId": "123",
    "type": "face",
    "data": "base64-encoded-data"
  }
  ```

- `GET /api/biometrics/:employeeId`: Get employee biometric data
  ```
  Authorization: Bearer <token>
  ```

## WebSocket API

The API includes WebSocket support for real-time updates. Connect to:

```
wss://api-pointage.workers.dev/api/ws?userId=123&userRole=admin&room=admin
```

### WebSocket Events

- `connect`: Connection established
- `disconnect`: Connection closed
- `join_room`: Join a room for specific notifications
- `leave_room`: Leave a room
- `message`: Generic message
- `attendance_update`: Attendance record created/updated
- `biometric_update`: Biometric data registered
- `employee_update`: Employee created/updated/deleted
- `error`: Error message

### Example WebSocket Usage

```javascript
// Client-side code
const ws = new WebSocket('wss://api-pointage.workers.dev/api/ws?userId=123&userRole=admin');

ws.onopen = () => {
  console.log('Connected to WebSocket');
  
  // Join admin room to receive all updates
  ws.send(JSON.stringify({
    type: 'join_room',
    payload: { room: 'admin' }
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
  
  // Handle different event types
  switch (data.type) {
    case 'attendance_update':
      // Update UI with new attendance data
      break;
    case 'employee_update':
      // Update employee list
      break;
  }
};

ws.onclose = () => {
  console.log('Disconnected from WebSocket');
};
```

## Data Migration

To migrate your data from MongoDB to Cloudflare KV:

1. Run the migration script:
   ```bash
   node scripts/migrate-data.js --mongodb-uri=mongodb://your-mongodb-server/db
   ```

2. The script will:
   - Connect to your MongoDB database
   - Export all collections (users, employees, attendance, biometrics)
   - Transform data for KV storage
   - Create necessary indexes
   - Save JSON files for import
   - Generate an import script

3. Run the import script:
   ```bash
   cd data && ./import.sh
   ```

## Environment Variables

The following environment variables must be set in your `wrangler.toml` or in the Cloudflare dashboard:

- `JWT_SECRET`: Secret key for JWT token generation/validation

## Local Development

```bash
# Start local development server
npm run dev

# Test with curl
curl http://localhost:8787/api/status
```

## Troubleshooting

### KV Operations

View your KV data:
```bash
wrangler kv:key list --binding=POINTAGE_DB
```

Delete a key:
```bash
wrangler kv:key delete --binding=POINTAGE_DB "key-to-delete"
```

### Logs

View logs from your worker:
```bash
wrangler tail
```

## Performance Considerations

- **KV Storage**: 
  - KV has higher read latency than an in-memory cache
  - Use indexing and data denormalization for efficient access
  - List operations can be slow, maintain separate ID lists

- **Worker Execution**:
  - Workers have a time limit (10-30ms CPU time ideal)
  - Minimize blocking operations
  - Use chunked processing for large datasets

- **WebSockets**:
  - Use targeted rooms instead of broadcasting to all clients
  - Keep message payloads small 