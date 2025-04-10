/**
 * Real Data Import Script for Pointage 
 * 
 * This script imports real data from the prepared JSON files into MongoDB.
 */
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// MongoDB URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/poinpro';

// Models (create simple schemas as needed)
const EmployeeSchema = new mongoose.Schema({
  id: String,
  firstName: String,
  lastName: String,
  email: String,
  position: String,
  departmentId: String,
  department: String,
  createdAt: Date,
  updatedAt: Date
});

const AttendanceSchema = new mongoose.Schema({
  id: String,
  employeeId: String,
  date: String,
  status: String,
  checkInTime: Date,
  checkOutTime: Date,
  createdAt: Date,
  updatedAt: Date
});

const Employee = mongoose.model('Employee', EmployeeSchema);
const Attendance = mongoose.model('Attendance', AttendanceSchema);

// Import functions
async function importEmployees() {
  try {
    const employeesFile = path.join(__dirname, 'employees-real.json');
    const employeesData = JSON.parse(fs.readFileSync(employeesFile, 'utf8'));
    
    // Clear existing data
    await Employee.deleteMany({});
    
    // Insert real data
    const employees = employeesData.map(item => {
      // The value is already a string, so we don't need to stringify it again
      const employee = typeof item.value === 'string' 
        ? JSON.parse(item.value) 
        : item.value;
        
      return {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        position: employee.position,
        departmentId: employee.departmentId,
        department: employee.department,
        createdAt: new Date(employee.createdAt),
        updatedAt: new Date(employee.updatedAt)
      };
    });
    
    await Employee.insertMany(employees);
    console.log(`Imported ${employees.length} employees successfully`);
  } catch (err) {
    console.error('Failed to import employees:', err);
  }
}

async function importAttendance() {
  try {
    const attendanceFile = path.join(__dirname, 'attendance-real.json');
    const attendanceData = JSON.parse(fs.readFileSync(attendanceFile, 'utf8'));
    
    // Clear existing data
    await Attendance.deleteMany({});
    
    // Insert real data
    const attendances = attendanceData.map(item => {
      // The value is already a string, so we don't need to stringify it again
      const attendance = typeof item.value === 'string' 
        ? JSON.parse(item.value) 
        : item.value;
        
      return {
        id: attendance.id,
        employeeId: attendance.employeeId,
        date: attendance.date,
        status: attendance.status,
        checkInTime: attendance.checkInTime ? new Date(attendance.checkInTime) : null,
        checkOutTime: attendance.checkOutTime ? new Date(attendance.checkOutTime) : null,
        createdAt: new Date(attendance.createdAt),
        updatedAt: new Date(attendance.updatedAt)
      };
    });
    
    await Attendance.insertMany(attendances);
    console.log(`Imported ${attendances.length} attendance records successfully`);
  } catch (err) {
    console.error('Failed to import attendance records:', err);
  }
}

// Main function
async function importAllData() {
  console.log('Starting data import process...');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
    
    // Import data
    await importEmployees();
    await importAttendance();
    
    console.log('Data import completed successfully');
  } catch (err) {
    console.error('Error during import:', err);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the import
importAllData(); 