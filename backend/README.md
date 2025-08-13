# DLMS Backend

This is the backend server for the Digital License Management System.

## Setup and Running

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Environment Setup
Create a `.env` file in the backend directory with the following variables:

```
PORT=5001
SIMPLE_SERVER_PORT=5002
MONGODB_URI=mongodb://localhost:27017/dlms
JWT_SECRET=your_jwt_secret_key
```

### Installation

```bash
# Install dependencies
npm install
```

### Running the Application

```bash
# Initialize the database (creates collections and sample data)
npm run init-db

# Start all servers with a single command
npm start
```

This will start:
- Main API server on port 5001
- Simple signup/login server on port 5002

### Development Mode

```bash
# Run with nodemon for auto-reloading during development
npm run dev
```

### Complete Setup (Database + Servers)

```bash
# Initialize database and start servers in one command
npm run setup
```

## API Endpoints

### Health Checks
- `GET /api/health` - Check main server status
- `GET /api/db-status` - Check database connection status
- `GET /health` (port 5002) - Check simple server status

### Authentication
- `POST /api/users/login` - User login (main server)
- `POST /login` (port 5002) - User login (simple server)
- `POST /api/users/signup` - User registration (main server)
- `POST /signup` (port 5002) - User registration (simple server)

### User Management
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/users/:id` - Get user by ID (admin only)
- `PUT /api/admin/users/:id` - Update user (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)

### License Management
- `GET /api/license/admin/applications` - Get all license applications (admin only)
- `GET /api/license/admin/applications/pending` - Get pending applications (admin only)