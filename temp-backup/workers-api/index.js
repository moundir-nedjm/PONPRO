import { Router } from 'itty-router';
import { verifyJWT, requireAdmin, requireManager, requireEmployee, createJWT, refreshToken } from './auth';
import { corsHeaders } from './utils';
import { UserDB, EmployeeDB, AttendanceDB, BiometricDB } from './db';
import { ConnectionsObject, EVENTS } from './websocket';

// Create a new router
const router = Router();

// Middleware to parse JSON body
const withJSONBody = async request => {
  try {
    request.body = await request.json();
  } catch (err) {
    request.body = {};
  }
  return request;
};

// Error handling wrapper for route handlers
const safeHandler = (handler) => async (request, ...args) => {
  try {
    return await handler(request, ...args);
  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json', ...corsHeaders } 
    });
  }
};

// API status endpoint
router.get('/api/status', () => {
  return new Response(JSON.stringify({
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  }), {
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
});

// Auth routes
router.post('/api/auth/login', withJSONBody, safeHandler(async (request) => {
  const { email, password } = request.body;
  
  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Email and password are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  // Get user from KV store by email
  const user = await UserDB.getByEmail(email);
  
  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  // In a real app, you would hash and compare passwords
  // This is a simplified version
  if (password !== user.password) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  // Create JWT token
  const token = await createJWT({ 
    id: user.id, 
    email: user.email, 
    role: user.role 
  });
  
  return new Response(JSON.stringify({ 
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}));

router.post('/api/auth/refresh', safeHandler(async (request) => {
  return refreshToken(request);
}));

router.get('/api/auth/profile', safeHandler(async (request) => {
  const authResult = await requireEmployee(request);
  
  if (authResult instanceof Response) {
    return authResult; // Return the error response
  }
  
  const { user } = authResult;
  
  // Get user profile
  const userProfile = await UserDB.getById(user.id);
  
  if (!userProfile) {
    return new Response(JSON.stringify({ error: 'User profile not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  // Don't return password
  delete userProfile.password;
  
  return new Response(JSON.stringify(userProfile), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}));

// Employee routes
router.get('/api/employees', safeHandler(async (request) => {
  const authResult = await requireEmployee(request);
  
  if (authResult instanceof Response) {
    return authResult; // Return the error response
  }
  
  const { user } = authResult;
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get('q') || '';
  
  let employees;
  
  // Regular employees can only see themselves
  if (user.role === 'employee') {
    const employee = await EmployeeDB.getById(user.id);
    employees = employee ? [employee] : [];
  } else {
    // Admins and managers can see all employees
    employees = await EmployeeDB.search(searchQuery);
  }
  
  return new Response(JSON.stringify(employees), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}));

router.get('/api/employees/:id', safeHandler(async (request) => {
  const authResult = await requireEmployee(request);
  
  if (authResult instanceof Response) {
    return authResult; // Return the error response
  }
  
  const { user } = authResult;
  const { params } = request;
  const employeeId = params.id;
  
  // Regular employees can only see themselves
  if (user.role === 'employee' && user.id !== employeeId) {
    return new Response(JSON.stringify({ error: 'Unauthorized to view this employee' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  const employee = await EmployeeDB.getById(employeeId);
  
  if (!employee) {
    return new Response(JSON.stringify({ error: 'Employee not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  return new Response(JSON.stringify(employee), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}));

router.post('/api/employees', withJSONBody, safeHandler(async (request) => {
  const authResult = await requireManager(request);
  
  if (authResult instanceof Response) {
    return authResult; // Return the error response
  }
  
  const employeeData = request.body;
  
  // Validate required fields
  if (!employeeData.name || !employeeData.email) {
    return new Response(JSON.stringify({ error: 'Name and email are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  // Create employee
  const employee = await EmployeeDB.create(employeeData);
  
  // Create user account if not exists
  const existingUser = await UserDB.getByEmail(employeeData.email);
  
  if (!existingUser) {
    // Create user with default password
    const defaultPassword = 'changeme123'; // In a real app, generate random password
    
    await UserDB.create({
      id: employee.id, // Use the same ID as employee
      name: employee.name,
      email: employee.email,
      role: employeeData.role || 'employee',
      password: defaultPassword
    });
    
    // TODO: Send email with password
  }
  
  // Broadcast event through WebSocket
  const wsMessage = {
    type: EVENTS.EMPLOYEE_UPDATE,
    payload: {
      action: 'create',
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        departmentId: employee.departmentId
      }
    }
  };
  
  // We'll need to notify the Durable Object about this event
  
  return new Response(JSON.stringify(employee), {
    status: 201,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}));

router.put('/api/employees/:id', withJSONBody, safeHandler(async (request) => {
  const authResult = await requireManager(request);
  
  if (authResult instanceof Response) {
    return authResult; // Return the error response
  }
  
  const { params } = request;
  const employeeId = params.id;
  const updates = request.body;
  
  // Update employee
  const updatedEmployee = await EmployeeDB.update(employeeId, updates);
  
  if (!updatedEmployee) {
    return new Response(JSON.stringify({ error: 'Employee not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  // Update user account if email changed
  if (updates.email) {
    const user = await UserDB.getById(employeeId);
    if (user) {
      await UserDB.update(employeeId, { 
        email: updates.email,
        name: updates.name || user.name
      });
    }
  }
  
  // Broadcast event through WebSocket
  const wsMessage = {
    type: EVENTS.EMPLOYEE_UPDATE,
    payload: {
      action: 'update',
      employee: {
        id: updatedEmployee.id,
        name: updatedEmployee.name,
        email: updatedEmployee.email,
        departmentId: updatedEmployee.departmentId
      }
    }
  };
  
  // We'll need to notify the Durable Object about this event
  
  return new Response(JSON.stringify(updatedEmployee), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}));

router.delete('/api/employees/:id', safeHandler(async (request) => {
  const authResult = await requireAdmin(request);
  
  if (authResult instanceof Response) {
    return authResult; // Return the error response
  }
  
  const { params } = request;
  const employeeId = params.id;
  
  // Delete employee
  const deleted = await EmployeeDB.delete(employeeId);
  
  if (!deleted) {
    return new Response(JSON.stringify({ error: 'Employee not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  // Delete user account
  await UserDB.delete(employeeId);
  
  // Broadcast event through WebSocket
  const wsMessage = {
    type: EVENTS.EMPLOYEE_UPDATE,
    payload: {
      action: 'delete',
      employeeId
    }
  };
  
  // We'll need to notify the Durable Object about this event
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}));

// Attendance routes
router.get('/api/attendance', safeHandler(async (request) => {
  const authResult = await requireEmployee(request);
  
  if (authResult instanceof Response) {
    return authResult; // Return the error response
  }
  
  const { user } = authResult;
  const url = new URL(request.url);
  const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
  const employeeId = url.searchParams.get('employeeId');
  
  // Employees can only see their own attendance
  if (user.role === 'employee' && employeeId && employeeId !== user.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized to view this attendance' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  let attendance;
  
  if (employeeId) {
    // Get attendance for specific employee
    attendance = await AttendanceDB.getByEmployeeAndDate(employeeId, date);
  } else if (user.role === 'employee') {
    // Employee viewing their own attendance
    attendance = await AttendanceDB.getByEmployeeAndDate(user.id, date);
  } else {
    // Admin/manager viewing all attendance for a date
    attendance = await AttendanceDB.getByDate(date);
  }
  
  return new Response(JSON.stringify(attendance), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}));

router.post('/api/attendance', withJSONBody, safeHandler(async (request) => {
  const authResult = await requireEmployee(request);
  
  if (authResult instanceof Response) {
    return authResult; // Return the error response
  }
  
  const { user } = authResult;
  const attendanceData = request.body;
  
  // Validate required fields
  if (!attendanceData.employeeId || !attendanceData.status) {
    return new Response(JSON.stringify({ error: 'Employee ID and status are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  // Employees can only create their own attendance
  if (user.role === 'employee' && attendanceData.employeeId !== user.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized to create attendance for other employees' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  // Create attendance
  const attendance = await AttendanceDB.create(attendanceData);
  
  // Broadcast event through WebSocket
  const wsMessage = {
    type: EVENTS.ATTENDANCE_UPDATE,
    payload: {
      action: 'create',
      attendance: {
        id: attendance.id,
        employeeId: attendance.employeeId,
        status: attendance.status,
        date: attendance.date || attendance.createdAt
      }
    }
  };
  
  // We'll need to notify the Durable Object about this event
  
  return new Response(JSON.stringify(attendance), {
    status: 201,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}));

// Biometric routes
router.post('/api/biometrics/register', withJSONBody, safeHandler(async (request) => {
  const authResult = await requireEmployee(request);
  
  if (authResult instanceof Response) {
    return authResult; // Return the error response
  }
  
  const { user } = authResult;
  const { employeeId, data, type } = request.body;
  
  // Validate required fields
  if (!employeeId || !data || !type) {
    return new Response(JSON.stringify({ error: 'Employee ID, data, and type are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  // Employees can only register their own biometrics
  if (user.role === 'employee' && employeeId !== user.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized to register biometrics for other employees' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  // Get employee data
  const employee = await EmployeeDB.getById(employeeId);
  if (!employee) {
    return new Response(JSON.stringify({ error: 'Employee not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  // Store biometric data
  const biometric = await BiometricDB.save({
    employeeId,
    type,
    data
  });
  
  // Broadcast event through WebSocket
  const wsMessage = {
    type: EVENTS.BIOMETRIC_UPDATE,
    payload: {
      action: 'register',
      biometric: {
        id: biometric.id,
        employeeId: biometric.employeeId,
        type: biometric.type
      }
    }
  };
  
  // We'll need to notify the Durable Object about this event
  
  return new Response(JSON.stringify({ success: true, id: biometric.id }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}));

router.get('/api/biometrics/:employeeId', safeHandler(async (request) => {
  const authResult = await requireEmployee(request);
  
  if (authResult instanceof Response) {
    return authResult; // Return the error response
  }
  
  const { user } = authResult;
  const { params } = request;
  const employeeId = params.employeeId;
  
  // Employees can only view their own biometrics
  if (user.role === 'employee' && employeeId !== user.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized to view biometrics for other employees' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  // Get biometric data
  const biometrics = await BiometricDB.getByEmployee(employeeId);
  
  return new Response(JSON.stringify(biometrics), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}));

// Catch-all handler for options requests (CORS)
router.options('*', () => new Response(null, { 
  headers: corsHeaders 
}));

// 404 for everything else
router.all('*', () => new Response('Not Found', { status: 404 }));

// Main fetch handler for the Worker
export default {
  async fetch(request, env, ctx) {
    // Make env available globally
    globalThis.POINTAGE_DB = env.POINTAGE_DB;
    globalThis.JWT_SECRET = env.JWT_SECRET;
    
    // Handle WebSocket requests to Durable Object
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/ws')) {
      return env.CONNECTIONS.get(env.CONNECTIONS.idFromName('default')).fetch(request);
    }
    
    // Handle API requests
    return router.handle(request);
  }
};

// Export the WebSocket connection manager
export { ConnectionsObject }; 