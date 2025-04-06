// Database access layer for Cloudflare KV storage
// Provides a more structured approach to data access

// Entity prefixes for KV storage
const PREFIXES = {
  USER: 'user:',
  EMPLOYEE: 'employee:',
  DEPARTMENT: 'department:',
  ATTENDANCE: 'attendance:',
  BIOMETRIC: 'biometric:',
  DOCUMENT: 'document:',
  INDEX: 'index:'
};

// Helper to create an index entry
const createIndexEntry = (indexName, key, id) => {
  return `${PREFIXES.INDEX}${indexName}:${key}:${id}`;
};

// User-related operations
export const UserDB = {
  async create(userData) {
    const id = userData.id || crypto.randomUUID();
    userData.id = id;
    userData.createdAt = userData.createdAt || new Date().toISOString();
    userData.updatedAt = new Date().toISOString();
    
    // Store the user
    await POINTAGE_DB.put(`${PREFIXES.USER}${id}`, JSON.stringify(userData));
    
    // Create email index for fast lookup
    if (userData.email) {
      await POINTAGE_DB.put(
        `${PREFIXES.USER}email:${userData.email}`, 
        id
      );
    }
    
    return userData;
  },
  
  async getById(id) {
    const userData = await POINTAGE_DB.get(`${PREFIXES.USER}${id}`, { type: 'json' });
    return userData;
  },
  
  async getByEmail(email) {
    // Get user ID from the email index
    const userId = await POINTAGE_DB.get(`${PREFIXES.USER}email:${email}`);
    if (!userId) return null;
    
    // Get the user data using the ID
    return this.getById(userId);
  },
  
  async update(id, updates) {
    // Get existing user
    const existingUser = await this.getById(id);
    if (!existingUser) return null;
    
    // Handle email change (update index)
    if (updates.email && updates.email !== existingUser.email) {
      // Remove old email index
      await POINTAGE_DB.delete(`${PREFIXES.USER}email:${existingUser.email}`);
      
      // Create new email index
      await POINTAGE_DB.put(`${PREFIXES.USER}email:${updates.email}`, id);
    }
    
    // Merge updates with existing data
    const updatedUser = {
      ...existingUser,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Save updated user
    await POINTAGE_DB.put(`${PREFIXES.USER}${id}`, JSON.stringify(updatedUser));
    
    return updatedUser;
  },
  
  async delete(id) {
    // Get user to retrieve email for index deletion
    const user = await this.getById(id);
    if (!user) return false;
    
    // Delete email index
    if (user.email) {
      await POINTAGE_DB.delete(`${PREFIXES.USER}email:${user.email}`);
    }
    
    // Delete user
    await POINTAGE_DB.delete(`${PREFIXES.USER}${id}`);
    
    return true;
  },
  
  async list(limit = 100) {
    // This is inefficient for KV, but we need a list operation
    // Get all keys with the user prefix, then fetch each user
    // In a real app, you would maintain a list of user IDs
    const { keys } = await POINTAGE_DB.list({ prefix: PREFIXES.USER, limit });
    
    // Filter out index keys
    const userKeys = keys.filter(key => !key.name.includes('email:'));
    
    // Fetch all users
    const users = await Promise.all(
      userKeys.map(async key => {
        return POINTAGE_DB.get(key.name, { type: 'json' });
      })
    );
    
    return users;
  }
};

// Employee-related operations
export const EmployeeDB = {
  async create(employeeData) {
    const id = employeeData.id || crypto.randomUUID();
    employeeData.id = id;
    employeeData.createdAt = employeeData.createdAt || new Date().toISOString();
    employeeData.updatedAt = new Date().toISOString();
    
    // Store employee data
    await POINTAGE_DB.put(`${PREFIXES.EMPLOYEE}${id}`, JSON.stringify(employeeData));
    
    // Update department index if department is specified
    if (employeeData.departmentId) {
      await this.addToDepartmentIndex(id, employeeData.departmentId);
    }
    
    // Update employee ID list
    const employeeIds = await POINTAGE_DB.get('employee:ids', { type: 'json' }) || [];
    if (!employeeIds.includes(id)) {
      employeeIds.push(id);
      await POINTAGE_DB.put('employee:ids', JSON.stringify(employeeIds));
    }
    
    return employeeData;
  },
  
  async getById(id) {
    return POINTAGE_DB.get(`${PREFIXES.EMPLOYEE}${id}`, { type: 'json' });
  },
  
  async update(id, updates) {
    const employee = await this.getById(id);
    if (!employee) return null;
    
    // Handle department change
    if (updates.departmentId && updates.departmentId !== employee.departmentId) {
      // Remove from old department
      if (employee.departmentId) {
        await this.removeFromDepartmentIndex(id, employee.departmentId);
      }
      
      // Add to new department
      await this.addToDepartmentIndex(id, updates.departmentId);
    }
    
    // Merge updates with existing data
    const updatedEmployee = {
      ...employee,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Save updated employee
    await POINTAGE_DB.put(`${PREFIXES.EMPLOYEE}${id}`, JSON.stringify(updatedEmployee));
    
    return updatedEmployee;
  },
  
  async delete(id) {
    const employee = await this.getById(id);
    if (!employee) return false;
    
    // Remove from department index
    if (employee.departmentId) {
      await this.removeFromDepartmentIndex(id, employee.departmentId);
    }
    
    // Remove from employee ID list
    const employeeIds = await POINTAGE_DB.get('employee:ids', { type: 'json' }) || [];
    const updatedIds = employeeIds.filter(empId => empId !== id);
    await POINTAGE_DB.put('employee:ids', JSON.stringify(updatedIds));
    
    // Delete employee data
    await POINTAGE_DB.delete(`${PREFIXES.EMPLOYEE}${id}`);
    
    return true;
  },
  
  async list() {
    const employeeIds = await POINTAGE_DB.get('employee:ids', { type: 'json' }) || [];
    
    // Fetch all employees in parallel
    const employees = await Promise.all(
      employeeIds.map(id => this.getById(id))
    );
    
    // Filter out null values (deleted employees)
    return employees.filter(Boolean);
  },
  
  async getByDepartment(departmentId) {
    const deptEmployeeIds = await POINTAGE_DB.get(
      `${PREFIXES.DEPARTMENT}${departmentId}:employees`, 
      { type: 'json' }
    ) || [];
    
    const employees = await Promise.all(
      deptEmployeeIds.map(id => this.getById(id))
    );
    
    // Filter out null values
    return employees.filter(Boolean);
  },
  
  async addToDepartmentIndex(employeeId, departmentId) {
    // Get current employees in department
    const deptEmployees = await POINTAGE_DB.get(
      `${PREFIXES.DEPARTMENT}${departmentId}:employees`, 
      { type: 'json' }
    ) || [];
    
    // Add employee to department if not already there
    if (!deptEmployees.includes(employeeId)) {
      deptEmployees.push(employeeId);
      await POINTAGE_DB.put(
        `${PREFIXES.DEPARTMENT}${departmentId}:employees`, 
        JSON.stringify(deptEmployees)
      );
    }
  },
  
  async removeFromDepartmentIndex(employeeId, departmentId) {
    // Get current employees in department
    const deptEmployees = await POINTAGE_DB.get(
      `${PREFIXES.DEPARTMENT}${departmentId}:employees`, 
      { type: 'json' }
    ) || [];
    
    // Remove employee from department
    const updatedDeptEmployees = deptEmployees.filter(id => id !== employeeId);
    
    // Update department employees list
    await POINTAGE_DB.put(
      `${PREFIXES.DEPARTMENT}${departmentId}:employees`, 
      JSON.stringify(updatedDeptEmployees)
    );
  },
  
  async search(query) {
    // This is a simple search implementation for KV
    // In a real app, you might want to use a more sophisticated search mechanism
    // or consider using Workers/D1 for SQL-like queries
    const employees = await this.list();
    
    if (!query) return employees;
    
    const lowerQuery = query.toLowerCase();
    
    // Simple client-side filtering
    return employees.filter(employee => {
      return (
        employee.name?.toLowerCase().includes(lowerQuery) ||
        employee.email?.toLowerCase().includes(lowerQuery) ||
        employee.employeeId?.toLowerCase().includes(lowerQuery) ||
        employee.position?.toLowerCase().includes(lowerQuery)
      );
    });
  }
};

// Attendance-related operations
export const AttendanceDB = {
  async create(attendanceData) {
    const id = attendanceData.id || crypto.randomUUID();
    attendanceData.id = id;
    attendanceData.createdAt = attendanceData.createdAt || new Date().toISOString();
    
    // Create a date string for daily indexing (YYYY-MM-DD)
    const dateStr = new Date(attendanceData.date || attendanceData.createdAt)
      .toISOString().split('T')[0];
    
    // Store attendance record
    await POINTAGE_DB.put(
      `${PREFIXES.ATTENDANCE}${id}`, 
      JSON.stringify(attendanceData)
    );
    
    // Update employee-attendance index
    await this.addToEmployeeIndex(id, attendanceData.employeeId, dateStr);
    
    // Update date index
    await this.addToDateIndex(id, dateStr);
    
    return attendanceData;
  },
  
  async getById(id) {
    return POINTAGE_DB.get(`${PREFIXES.ATTENDANCE}${id}`, { type: 'json' });
  },
  
  async update(id, updates) {
    const attendance = await this.getById(id);
    if (!attendance) return null;
    
    // Handle date change (update indices)
    if (updates.date) {
      const oldDateStr = new Date(attendance.date)
        .toISOString().split('T')[0];
      const newDateStr = new Date(updates.date)
        .toISOString().split('T')[0];
      
      if (oldDateStr !== newDateStr) {
        // Remove from old date indices
        await this.removeFromDateIndex(id, oldDateStr);
        await this.removeFromEmployeeIndex(id, attendance.employeeId, oldDateStr);
        
        // Add to new date indices
        await this.addToDateIndex(id, newDateStr);
        await this.addToEmployeeIndex(id, attendance.employeeId, newDateStr);
      }
    }
    
    // Merge updates with existing data
    const updatedAttendance = {
      ...attendance,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Save updated attendance
    await POINTAGE_DB.put(
      `${PREFIXES.ATTENDANCE}${id}`, 
      JSON.stringify(updatedAttendance)
    );
    
    return updatedAttendance;
  },
  
  async delete(id) {
    const attendance = await this.getById(id);
    if (!attendance) return false;
    
    // Get date string
    const dateStr = new Date(attendance.date)
      .toISOString().split('T')[0];
    
    // Remove from indices
    await this.removeFromDateIndex(id, dateStr);
    await this.removeFromEmployeeIndex(id, attendance.employeeId, dateStr);
    
    // Delete attendance record
    await POINTAGE_DB.delete(`${PREFIXES.ATTENDANCE}${id}`);
    
    return true;
  },
  
  async getByDate(date) {
    const dateStr = new Date(date).toISOString().split('T')[0];
    
    // Get attendance IDs for the date
    const attendanceIds = await POINTAGE_DB.get(
      `${PREFIXES.ATTENDANCE}date:${dateStr}`, 
      { type: 'json' }
    ) || [];
    
    // Fetch all attendance records for the date
    const records = await Promise.all(
      attendanceIds.map(id => this.getById(id))
    );
    
    // Filter out null values
    return records.filter(Boolean);
  },
  
  async getByEmployeeAndDate(employeeId, date) {
    const dateStr = new Date(date).toISOString().split('T')[0];
    
    // Get attendance IDs for employee on date
    const attendanceIds = await POINTAGE_DB.get(
      `${PREFIXES.ATTENDANCE}employee:${employeeId}:date:${dateStr}`, 
      { type: 'json' }
    ) || [];
    
    // Fetch attendance records
    const records = await Promise.all(
      attendanceIds.map(id => this.getById(id))
    );
    
    // Filter out null values
    return records.filter(Boolean);
  },
  
  async getByEmployeeAndDateRange(employeeId, startDate, endDate) {
    // Convert dates to milliseconds for comparison
    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();
    
    // Create an array of date strings in the range
    const dateStrings = [];
    let currentDate = new Date(startDate);
    
    while (currentDate.getTime() <= endTime) {
      dateStrings.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Fetch attendance for each day
    const allAttendance = await Promise.all(
      dateStrings.map(dateStr => 
        this.getByEmployeeAndDate(employeeId, dateStr)
      )
    );
    
    // Flatten the array of arrays
    return allAttendance.flat();
  },
  
  async addToDateIndex(attendanceId, dateStr) {
    // Get attendance IDs for the date
    const dateAttendanceIds = await POINTAGE_DB.get(
      `${PREFIXES.ATTENDANCE}date:${dateStr}`, 
      { type: 'json' }
    ) || [];
    
    // Add attendance ID to date index
    if (!dateAttendanceIds.includes(attendanceId)) {
      dateAttendanceIds.push(attendanceId);
      await POINTAGE_DB.put(
        `${PREFIXES.ATTENDANCE}date:${dateStr}`, 
        JSON.stringify(dateAttendanceIds)
      );
    }
  },
  
  async removeFromDateIndex(attendanceId, dateStr) {
    // Get attendance IDs for the date
    const dateAttendanceIds = await POINTAGE_DB.get(
      `${PREFIXES.ATTENDANCE}date:${dateStr}`, 
      { type: 'json' }
    ) || [];
    
    // Remove attendance ID from date index
    const updatedDateAttendanceIds = dateAttendanceIds.filter(id => id !== attendanceId);
    
    // Update date attendance list
    await POINTAGE_DB.put(
      `${PREFIXES.ATTENDANCE}date:${dateStr}`, 
      JSON.stringify(updatedDateAttendanceIds)
    );
  },
  
  async addToEmployeeIndex(attendanceId, employeeId, dateStr) {
    // Get attendance IDs for employee on date
    const employeeDateAttendanceIds = await POINTAGE_DB.get(
      `${PREFIXES.ATTENDANCE}employee:${employeeId}:date:${dateStr}`, 
      { type: 'json' }
    ) || [];
    
    // Add attendance ID to employee-date index
    if (!employeeDateAttendanceIds.includes(attendanceId)) {
      employeeDateAttendanceIds.push(attendanceId);
      await POINTAGE_DB.put(
        `${PREFIXES.ATTENDANCE}employee:${employeeId}:date:${dateStr}`, 
        JSON.stringify(employeeDateAttendanceIds)
      );
    }
  },
  
  async removeFromEmployeeIndex(attendanceId, employeeId, dateStr) {
    // Get attendance IDs for employee on date
    const employeeDateAttendanceIds = await POINTAGE_DB.get(
      `${PREFIXES.ATTENDANCE}employee:${employeeId}:date:${dateStr}`, 
      { type: 'json' }
    ) || [];
    
    // Remove attendance ID from employee-date index
    const updatedEmployeeDateAttendanceIds = employeeDateAttendanceIds.filter(
      id => id !== attendanceId
    );
    
    // Update employee-date attendance list
    await POINTAGE_DB.put(
      `${PREFIXES.ATTENDANCE}employee:${employeeId}:date:${dateStr}`, 
      JSON.stringify(updatedEmployeeDateAttendanceIds)
    );
  }
};

// Biometric-related operations
export const BiometricDB = {
  async save(biometricData) {
    const { employeeId, type, data } = biometricData;
    const id = biometricData.id || crypto.randomUUID();
    
    const record = {
      id,
      employeeId,
      type,
      data,
      createdAt: biometricData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Store biometric data
    await POINTAGE_DB.put(
      `${PREFIXES.BIOMETRIC}${employeeId}:${type}`, 
      JSON.stringify(record)
    );
    
    // Update biometric index by type
    await this.addToTypeIndex(id, type);
    
    return record;
  },
  
  async getByEmployeeAndType(employeeId, type) {
    return POINTAGE_DB.get(
      `${PREFIXES.BIOMETRIC}${employeeId}:${type}`, 
      { type: 'json' }
    );
  },
  
  async getByEmployee(employeeId) {
    // List all biometric data for this employee
    const { keys } = await POINTAGE_DB.list({
      prefix: `${PREFIXES.BIOMETRIC}${employeeId}:`
    });
    
    // Fetch all biometric data in parallel
    const biometrics = await Promise.all(
      keys.map(key => POINTAGE_DB.get(key.name, { type: 'json' }))
    );
    
    return biometrics.filter(Boolean);
  },
  
  async delete(employeeId, type) {
    // Get biometric record to get its ID
    const record = await this.getByEmployeeAndType(employeeId, type);
    if (!record) return false;
    
    // Remove from type index
    await this.removeFromTypeIndex(record.id, type);
    
    // Delete biometric data
    await POINTAGE_DB.delete(`${PREFIXES.BIOMETRIC}${employeeId}:${type}`);
    
    return true;
  },
  
  async addToTypeIndex(biometricId, type) {
    // Get biometric IDs by type
    const typeIds = await POINTAGE_DB.get(
      `${PREFIXES.BIOMETRIC}type:${type}`, 
      { type: 'json' }
    ) || [];
    
    // Add biometric ID to type index
    if (!typeIds.includes(biometricId)) {
      typeIds.push(biometricId);
      await POINTAGE_DB.put(
        `${PREFIXES.BIOMETRIC}type:${type}`, 
        JSON.stringify(typeIds)
      );
    }
  },
  
  async removeFromTypeIndex(biometricId, type) {
    // Get biometric IDs by type
    const typeIds = await POINTAGE_DB.get(
      `${PREFIXES.BIOMETRIC}type:${type}`, 
      { type: 'json' }
    ) || [];
    
    // Remove biometric ID from type index
    const updatedTypeIds = typeIds.filter(id => id !== biometricId);
    
    // Update type biometric list
    await POINTAGE_DB.put(
      `${PREFIXES.BIOMETRIC}type:${type}`, 
      JSON.stringify(updatedTypeIds)
    );
  }
};

// Export database modules
export default {
  UserDB,
  EmployeeDB,
  AttendanceDB,
  BiometricDB
}; 