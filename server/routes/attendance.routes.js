const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Employee = require('../models/Employee');

// Get today's attendance
router.get('/today', async (req, res) => {
  try {
    console.log('Getting today\'s attendance data...');
    
    // Find all employees
    const employees = await Employee.find({ active: true }).populate('department');
    const totalEmployees = employees.length;
    
    console.log(`Found ${totalEmployees} employees`);
    
    // For demo, we'll return a placeholder response
    // This would normally get actual attendance records from a database
    const attendanceRecords = employees.map(employee => {
      // Create a sample attendance record for each employee
      return {
        employee: {
          _id: employee._id,
          id: employee._id.toString(),
          firstName: employee.firstName,
          lastName: employee.lastName,
          department: employee.department || { name: 'Département' },
          employeeId: employee.employeeId
        },
        date: new Date(),
        checkIn: null,  // No check-in by default
        checkOut: null, // No check-out by default
        status: 'absent',
        attendanceCode: null,
        workHours: 0
      };
    });
    
    // Count records by status
    const presentCount = 0;
    const lateCount = 0;
    const absentCount = totalEmployees;
    
    return res.status(200).json({
      success: true,
      data: {
        date: new Date(),
        totalEmployees,
        presentCount,
        lateCount,
        absentCount,
        records: attendanceRecords
      }
    });
  } catch (err) {
    console.error('Error getting today\'s attendance:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get weekly attendance data
router.get('/weekly', async (req, res) => {
  try {
    // Return placeholder data for weekly attendance
    const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const weeklyData = weekDays.map(day => ({
      day,
      present: Math.floor(Math.random() * 10),
      absent: Math.floor(Math.random() * 5),
      late: Math.floor(Math.random() * 3)
    }));
    
    res.status(200).json({
      success: true,
      data: weeklyData
    });
  } catch (err) {
    console.error('Error getting weekly attendance:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Check in employee
router.post('/check-in', async (req, res) => {
  try {
    const { employeeId, timestamp } = req.body;
    
    // Validate request
    if (!employeeId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee ID is required' 
      });
    }
    
    // Find the employee
    const employee = await Employee.findById(employeeId);
    
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }
    
    // In a real implementation, we would create/update an attendance record here
    
    // Send success response with employee info
    res.status(200).json({
      success: true,
      message: 'Check-in successful',
      data: {
        employee: {
          id: employee._id,
          firstName: employee.firstName,
          lastName: employee.lastName
        },
        timestamp: timestamp || new Date()
      }
    });
  } catch (err) {
    console.error('Error during check-in:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Check out employee
router.post('/check-out', async (req, res) => {
  try {
    const { employeeId, timestamp } = req.body;
    
    // Validate request
    if (!employeeId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee ID is required' 
      });
    }
    
    // Find the employee
    const employee = await Employee.findById(employeeId);
    
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }
    
    // In a real implementation, we would create/update an attendance record here
    
    // Send success response with employee info
    res.status(200).json({
      success: true,
      message: 'Check-out successful',
      data: {
        employee: {
          id: employee._id,
          firstName: employee.firstName,
          lastName: employee.lastName
        },
        timestamp: timestamp || new Date()
      }
    });
  } catch (err) {
    console.error('Error during check-out:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get monthly attendance data
router.get('/monthly-sheet/:yearMonth', async (req, res) => {
  try {
    console.log('Getting monthly attendance data...');
    console.log('Request params:', req.params);
    console.log('Request query:', req.query);
    
    const yearMonth = req.params.yearMonth; // Format: 'YYYY-MM'
    const departmentId = req.query.department;
    
    console.log(`Requested month: ${yearMonth}, department: ${departmentId || 'all'}`);
    
    // Parse year and month
    const [year, month] = yearMonth.split('-').map(num => parseInt(num, 10));
    
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      console.error(`Invalid year-month format: ${yearMonth}`);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid year-month format. Use YYYY-MM.' 
      });
    }
    
    // Find all active employees, filter by department if specified
    const query = { active: true };
    if (departmentId && departmentId !== 'all') {
      query['department'] = departmentId;
    }
    
    console.log('Employee query:', JSON.stringify(query));
    const employees = await Employee.find(query).populate('department');
    console.log(`Found ${employees.length} employees for the monthly sheet`);
    
    if (!employees || employees.length === 0) {
      // Return an empty response instead of error
      console.log('No employees found, returning empty data');
      return res.status(200).json({
        success: true,
        data: {
          year,
          month,
          days: [],
          employees: [],
          departments: []
        }
      });
    }
    
    // Generate all days in the month
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      // Get day name in French
      const weekdays = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
      const weekday = weekdays[dayOfWeek];
      // 0 = Sunday, 6 = Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      days.push({
        day,
        date: date.toISOString().split('T')[0],
        weekday,
        isWeekend,
        year: date.getFullYear(),
        month: date.getMonth() + 1
      });
    }
    
    // In a real implementation, we would fetch actual attendance records
    // for the specified month from the database.
    // For now, we'll generate placeholder data.
    
    const employeeData = employees.map(employee => {
      // Generate placeholder attendance for each day
      const attendance = days.map(day => {
        if (day.isWeekend) {
          return { status: '-' }; // Weekend
        }
        
        // Generate a consistent status based on employee ID and day
        // This ensures the same employee gets the same status on refresh
        const hash = parseInt(employee._id.toString().substring(0, 8), 16);
        const value = (hash + day.day) % 100; // 0-99
        
        let status = 'P'; // Default to present
        
        // Consistent distribution of statuses
        if (value < 5) status = 'A';         // 5% absent
        else if (value < 10) status = 'AJ';  // 5% justified absence
        else if (value < 15) status = 'CP';  // 5% paid leave
        else if (value < 20) status = 'CM';  // 5% sick leave
        else if (value < 25) status = 'P/2'; // 5% half-day
        else if (value < 30) status = 'R';   // 5% late
        
        return { status };
      });
      
      // Calculate total days present
      const total = attendance.reduce((sum, day) => {
        const { status } = day;
        if (status === 'P') return sum + 1;
        if (status === 'P/2') return sum + 0.5;
        return sum;
      }, 0);
      
      return {
        _id: employee._id,
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        position: employee.position || 'Non spécifié',
        department: employee.department?._id || null,
        departmentName: employee.department?.name || 'Département non assigné',
        attendance,
        total,
        biometricStatus: employee.biometricStatus || {
          faceRecognition: { status: 'not_started', samplesCount: 0 },
          fingerprint: { status: 'not_started', samplesCount: 0 }
        }
      };
    });
    
    // Get unique departments
    const departments = employees
      .map(emp => emp.department)
      .filter((dept, index, self) => 
        dept && self.findIndex(d => d && d._id.toString() === dept._id.toString()) === index
      );

    console.log(`Generated ${days.length} days and data for ${employeeData.length} employees, ${departments.length} departments`);
    
    return res.status(200).json({
      success: true,
      data: {
        year,
        month,
        days,
        employees: employeeData,
        departments
      }
    });
  } catch (err) {
    console.error('Error getting monthly attendance data:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la récupération des données mensuelles',
      error: err.message
    });
  }
});

// Export monthly sheet data
router.get('/export/monthly-sheet', async (req, res) => {
  try {
    // For now, just return a success message
    // In a real implementation, this would generate and return an Excel file
    res.status(200).json({
      success: true,
      message: 'Export functionality not yet implemented'
    });
  } catch (err) {
    console.error('Error exporting monthly attendance sheet:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Debug endpoint to verify monthly data works
router.get('/monthly-sheet-debug', async (req, res) => {
  try {
    console.log('Debug endpoint for monthly sheet data called');
    
    // Get real employees from database
    const employees = await Employee.find({ active: true }).populate('department');
    console.log(`Found ${employees.length} employees from database`);
    
    if (!employees || employees.length === 0) {
      console.error('No employees found in database for debug endpoint');
      return res.status(200).json({
        success: false,
        message: 'No employees found in database'
      });
    }
    
    // Generate days for current month
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      // Get day name in French
      const weekdays = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
      const weekday = weekdays[dayOfWeek];
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      days.push({
        day,
        date: date.toISOString().split('T')[0],
        weekday,
        isWeekend,
        year: date.getFullYear(),
        month: date.getMonth() + 1
      });
    }
    
    // Get real departments from employees
    const departments = employees
      .map(emp => emp.department)
      .filter((dept, index, self) => 
        dept && self.findIndex(d => d && d._id.toString() === dept._id.toString()) === index
      );
    
    // Format employee data for the monthly view with consistent attendance codes
    const formattedEmployees = employees.map(employee => {
      // Generate attendance data for each day
      const attendance = days.map(day => {
        if (day.isWeekend) {
          return { status: '-' }; // Weekend
        }
        
        // Generate a consistent status based on employee ID and day
        // This ensures the same employee gets the same status on refresh
        const hash = parseInt(employee._id.toString().substring(0, 8), 16);
        const value = (hash + day.day) % 100; // 0-99
        
        let status = 'P'; // Default to present
        
        // Consistent distribution of statuses
        if (value < 5) status = 'A';         // 5% absent
        else if (value < 10) status = 'AJ';  // 5% justified absence
        else if (value < 15) status = 'CP';  // 5% paid leave
        else if (value < 20) status = 'CM';  // 5% sick leave
        else if (value < 25) status = 'P/2'; // 5% half-day
        else if (value < 30) status = 'R';   // 5% late
        
        return { status };
      });
      
      // Calculate total days present
      const total = attendance.reduce((sum, day) => {
        const { status } = day;
        if (status === 'P') return sum + 1;
        if (status === 'P/2') return sum + 0.5;
        return sum;
      }, 0);
      
      return {
        _id: employee._id,
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        position: employee.position || 'Non spécifié',
        department: employee.department?._id || null,
        departmentName: employee.department?.name || 'Département non assigné',
        attendance,
        total,
        biometricStatus: employee.biometricStatus || {
          faceRecognition: { status: 'not_started', samplesCount: 0 },
          fingerprint: { status: 'not_started', samplesCount: 0 }
        }
      };
    });
    
    console.log(`Sending debug data: ${days.length} days, ${formattedEmployees.length} employees, ${departments.length} departments`);
    console.log('Sample employee data:', JSON.stringify(formattedEmployees[0], null, 2).substring(0, 500) + '...');
    
    const responseData = {
      success: true,
      data: {
        year,
        month,
        days,
        employees: formattedEmployees,
        departments
      }
    };
    
    // Ensure data has the expected format for the client
    console.log(`Response structure validation: has days=${!!responseData.data.days}, has employees=${!!responseData.data.employees}, employees.length=${responseData.data.employees.length}`);
    
    return res.status(200).json(responseData);
  } catch (err) {
    console.error('Error in monthly-sheet-debug endpoint:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la récupération des données de débogage',
      error: err.message 
    });
  }
});

// Get attendance statistics
router.get('/stats', async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;
    
    console.log('Getting attendance statistics...');
    console.log('Query params:', { startDate, endDate, department });
    
    // Find all active employees, filter by department if specified
    const employeeQuery = { active: true };
    if (department && department !== 'all') {
      employeeQuery.department = department;
    }
    
    const employees = await Employee.find(employeeQuery).populate('department');
    console.log(`Found ${employees.length} employees for stats`);
    
    // For demo purposes, we'll create placeholder statistics
    // In a real implementation, you would query actual attendance records
    
    // Create status counts
    const statusCounts = {
      present: Math.min(employees.length, 1), // At least 1 present if there are employees
      late: 0,
      absent: Math.max(0, employees.length - 1) // The rest are absent
    };
    
    // Create department stats
    const departmentStats = [];
    const departmentsMap = new Map();
    
    employees.forEach(emp => {
      if (emp.department) {
        const deptId = emp.department._id.toString();
        const deptName = emp.department.name;
        
        if (!departmentsMap.has(deptId)) {
          departmentsMap.set(deptId, {
            id: deptId,
            name: deptName,
            presentCount: 0,
            lateCount: 0,
            absentCount: 0
          });
        }
        
        // For demo, mark the first employee in each department as present
        const dept = departmentsMap.get(deptId);
        if (dept.presentCount === 0) {
          dept.presentCount += 1;
        } else {
          dept.absentCount += 1;
        }
      }
    });
    
    departmentStats.push(...departmentsMap.values());
    
    // Create employee stats
    const employeeStats = employees.map((emp, index) => {
      // Mark first employee as present, others as absent for demo
      const isPresent = index === 0;
      return {
        id: emp._id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        department: emp.department,
        presentCount: isPresent ? 1 : 0,
        lateCount: 0,
        absentCount: isPresent ? 0 : 1,
        punctualityRate: isPresent ? 100 : 0,
        lateRate: 0
      };
    });
    
    // Create daily stats (last 7 days)
    const dailyStats = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      dailyStats.push({
        date: date.toISOString().split('T')[0],
        presentCount: i === 0 ? statusCounts.present : 0,
        lateCount: i === 0 ? statusCounts.late : 0,
        absentCount: i === 0 ? statusCounts.absent : 0
      });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        statusCounts,
        departmentStats,
        employeeStats,
        dailyStats
      }
    });
  } catch (err) {
    console.error('Error getting attendance statistics:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get monthly attendance data (new version for monthly sheet view)
router.get('/monthly', async (req, res) => {
  try {
    console.log('Getting monthly attendance data...');
    console.log('Request query:', req.query);
    
    const { month, year, department } = req.query;
    
    // Parse year and month as integers
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);
    
    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      console.error(`Invalid year or month: ${year}-${month}`);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid year or month. Month must be 1-12.' 
      });
    }
    
    // Find all active employees, filter by department if specified
    const query = { active: true };
    if (department && department !== 'all') {
      query.department = department;
    }
    
    console.log('Employee query:', JSON.stringify(query));
    const employees = await Employee.find(query).populate('department');
    console.log(`Found ${employees.length} employees for the monthly data`);
    
    // Generate all days in the month
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
    const days = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(yearNum, monthNum - 1, day);
      const dayOfWeek = date.getDay();
      // Get day name in French
      const weekdays = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
      const weekday = weekdays[dayOfWeek];
      // 0 = Sunday, 6 = Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      days.push({
        day,
        date: date.toISOString().split('T')[0],
        weekday,
        isWeekend,
        year: yearNum,
        month: monthNum
      });
    }
    
    // Get departments
    const departmentsSet = new Set();
    const departmentsList = [];
    
    employees.forEach(emp => {
      if (emp.department && !departmentsSet.has(emp.department._id.toString())) {
        departmentsSet.add(emp.department._id.toString());
        departmentsList.push({
          _id: emp.department._id,
          name: emp.department.name
        });
      }
    });
    
    // Process employees to include attendance data
    const employeesWithAttendance = employees.map(emp => {
      // Generate attendance status for each day (in a real app, fetch from database)
      const attendance = days.map(day => {
        if (day.isWeekend) {
          return { status: '-' }; // Weekend
        }
        
        // For demo, mark every employee as present on the first day of the month
        if (day.day === 1) {
          return { status: 'P' }; // Present
        }
        
        // Mark as absent for other days
        return { status: 'A' }; // Absent
      });
      
      return {
        _id: emp._id,
        employeeId: emp.employeeId || `EMP${emp._id.toString().substring(0, 4)}`,
        firstName: emp.firstName,
        lastName: emp.lastName,
        position: emp.position || 'Employee',
        department: emp.department?._id,
        departmentName: emp.department?.name || 'No Department',
        attendance,
        total: 1 // One day present (first day)
      };
    });
    
    return res.status(200).json({
      success: true,
      data: {
        year: yearNum,
        month: monthNum,
        days,
        employees: employeesWithAttendance,
        departments: departmentsList
      }
    });
  } catch (err) {
    console.error('Error getting monthly attendance data:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get employee attendance by month
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;
    
    console.log(`Getting attendance for employee ${employeeId} in ${month}/${year}`);
    
    // Find the employee
    const employee = await Employee.findById(employeeId);
    
    if (!employee) {
      return res.status(404).json({ 
        success: false, 
        message: 'Employee not found' 
      });
    }
    
    // Parse year and month
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);
    
    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid year or month' 
      });
    }
    
    // Generate days in the month
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
    const attendanceRecords = [];
    
    // For demo purposes, we'll create placeholder data
    // In a real implementation, you would fetch actual records from the database
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(yearNum, monthNum - 1, day);
      const dayOfWeek = date.getDay();
      
      // Skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        continue;
      }
      
      // For demo, mark the first working day as present, others as absent
      const isFirstDay = day === 1 || (day === 2 && dayOfWeek === 1);
      const status = isFirstDay ? 'present' : 'absent';
      
      const record = {
        _id: `${employeeId}-${year}-${month}-${day}`,
        employeeId,
        date: date.toISOString(),
        status,
        workHours: isFirstDay ? 8 : 0,
        notes: isFirstDay ? '' : 'Absence non justifiée'
      };
      
      // Add check-in/out times for present days
      if (isFirstDay) {
        record.checkIn = {
          time: new Date(yearNum, monthNum - 1, day, 8, 0).toISOString()
        };
        record.checkOut = {
          time: new Date(yearNum, monthNum - 1, day, 16, 0).toISOString()
        };
      }
      
      attendanceRecords.push(record);
    }
    
    return res.status(200).json({
      success: true,
      data: attendanceRecords
    });
  } catch (err) {
    console.error('Error getting employee attendance:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router; 