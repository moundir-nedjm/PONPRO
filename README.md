# Pointgee - Employee Management System

Pointgee is a comprehensive employee management system with real-time biometric data processing capabilities. This application includes features for employee management, attendance tracking, leave management, biometric enrollment and validation, and more.

## Features

- **Real-time data updates** using Socket.IO
- **Employee management** - Create, read, update, and delete employee records
- **Biometric data handling** - Face recognition and fingerprint enrollment and validation
- **Attendance tracking** - Track employee attendance with various status codes
- **Role-based access control** - Different user roles with appropriate permissions
- **Department management** - Organize employees by departments
- **Leave management** - Track employee leave requests and approvals

## Technology Stack

- **Frontend**: React, Material-UI, Socket.IO Client
- **Backend**: Node.js, Express.js, Socket.IO
- **Database**: MongoDB with Mongoose ORM

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)

## Getting Started

1. **Clone the repository**

```
git clone https://github.com/yourusername/pointgee.git
cd pointgee
```

2. **Install dependencies**

This will install dependencies for the root project, client, and server:

```
npm run setup
```

3. **Setup MongoDB**

Make sure MongoDB is running on your system:

```
sudo systemctl start mongod
```

4. **Seed the database**

Populate the database with initial data:

```
npm run seed
```

5. **Start the development server**

This will start both the client and server in development mode:

```
npm run dev
```

- The client will run on http://localhost:3000
- The server API will run on http://localhost:5000

## Login Credentials

For testing purposes, you can use the following credentials:

- **Admin:**
  - Email: admin@poinpro.com
  - Password: admin123

- **Chef (Team Leader):**
  - Email: chef@poinpro.com
  - Password: chef123

- **Employee:**
  - Email: employee@poinpro.com
  - Password: employee123

## Real-time Events

The application uses Socket.IO for real-time updates. The following events are available:

- `employee-created` - Emitted when a new employee is created
- `employee-updated` - Emitted when an employee is updated
- `employee-deleted` - Emitted when an employee is deleted
- `employee-biometric-updated` - Emitted when an employee's biometric status is updated
- `biometric-scan-completed` - Emitted when a biometric scan is completed

## License

This project is licensed under the MIT License. 