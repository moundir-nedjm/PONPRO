import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, getDate } from 'date-fns';
import { useSocket } from './SocketContext';
import apiClient from '../utils/api';

const AttendanceContext = createContext();

export const useAttendance = () => useContext(AttendanceContext);

// Environment variable for API URLs and mock data flag
const API_URL = ''; // We'll use apiClient instead which has port discovery
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';

export const AttendanceProvider = ({ children }) => {
  // Shared state
  const [attendanceData, setAttendanceData] = useState({});
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [month, setMonth] = useState(new Date());
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Get socket with safe default if not available
  const socketContext = useSocket();
  const socket = socketContext?.socket;

  // Initialize days in month when month changes
  useEffect(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    setDaysInMonth(days);
  }, [month]);

  // Set up socket event listeners for real-time updates
  useEffect(() => {
    if (socket) {
      socket.on('attendance-update', handleAttendanceUpdate);
      
      // Clean up event listener on component unmount
      return () => {
        socket.off('attendance-update', handleAttendanceUpdate);
      };
    }
  }, [socket]);

  const handleAttendanceUpdate = (data) => {
    console.log('Real-time attendance update received in context:', data);
    // Refresh data when we receive an update
    if (employees.length > 0) {
      fetchAttendanceData();
    }
  };

  // Fetch departments on initial load
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Fetch employees when department changes
  useEffect(() => {
    fetchEmployees();
  }, [selectedDepartment]);

  // Fetch attendance data when employees or month changes
  useEffect(() => {
    if (employees.length > 0) {
      fetchAttendanceData();
    }
  }, [employees, month]);

  const fetchDepartments = async () => {
    try {
      if (USE_MOCK_DATA) {
        // Fake API call delay for UI
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use the departments from our real data
        const fakeDepartments = [
          { _id: '1', name: 'DEG', location: 'Siège' },
          { _id: '2', name: 'KBK FROID', location: 'Usine' },
          { _id: '3', name: 'HAMRA', location: 'Entrepôt' },
          { _id: '4', name: 'HML', location: 'Siège' }
        ];
        
        setDepartments(fakeDepartments);
      } else {
        // Actual API call
        const response = await apiClient.get('/api/departments');
        setDepartments(response.data);
      }
      
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des départements:', err);
      setError('Impossible de charger les départements. Veuillez réessayer plus tard.');
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      if (USE_MOCK_DATA) {
        // Fake API call delay
        await new Promise(resolve => setTimeout(resolve, 700));
        
        // Use the employees from our real data file
        let filteredEmployees = [
          { _id: '1', firstName: 'Mohammed', lastName: 'Benali', position: 'Technicien', department: '1' },
          { _id: '2', firstName: 'Fatima', lastName: 'Zahra', position: 'Ingénieur', department: '2' },
          { _id: '3', firstName: 'Ahmed', lastName: 'Kader', position: 'Technicien', department: '3' },
          { _id: '4', firstName: 'Karim', lastName: 'Benzema', position: "Chef d'équipe", department: '2' },
          { _id: '5', firstName: 'Leila', lastName: 'Hadj', position: 'Ingénieur', department: '4' },
          { _id: '6', firstName: 'Youcef', lastName: 'Benatia', position: 'Technicien', department: '3' },
          { _id: '7', firstName: 'Amina', lastName: 'Belkacem', position: 'Assistante', department: '1' },
          { _id: '8', firstName: 'Omar', lastName: 'Cherif', position: 'Technicien', department: '2' },
          { _id: '9', firstName: 'Samira', lastName: 'Saidi', position: 'Ingénieur', department: '3' },
          { _id: '10', firstName: 'Rachid', lastName: 'Mehdaoui', position: "Chef d'équipe", department: '4' }
        ];
        
        if (selectedDepartment !== 'all') {
          filteredEmployees = filteredEmployees.filter(emp => emp.department === selectedDepartment);
        }
        
        setEmployees(filteredEmployees);
      } else {
        // Actual API call
        const url = selectedDepartment === 'all' 
          ? '/api/employees' 
          : `/api/employees?department=${selectedDepartment}`;
          
        const response = await apiClient.get(url);
        setEmployees(response.data);
      }
      
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des employés:', err);
      setError('Impossible de charger les employés. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      
      // Format dates for API
      const startDate = format(startOfMonth(month), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(month), 'yyyy-MM-dd');
      const yearMonth = format(month, 'yyyy-MM');
      
      if (USE_MOCK_DATA) {
        // Fake API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Create attendance data based on our real attendance data file
        const attendanceByEmployee = {};
        
        // Sample real attendance records
        const realAttendanceRecords = [
          { employeeId: '1', date: '2023-04-07', status: 'present', checkInTime: '08:00', checkOutTime: null },
          { employeeId: '4', date: '2023-04-07', status: 'present', checkInTime: '08:00', checkOutTime: '17:00' },
          { employeeId: '7', date: '2023-04-07', status: 'present', checkInTime: '08:00', checkOutTime: '17:00' },
          { employeeId: '9', date: '2023-04-07', status: 'present', checkInTime: '08:00', checkOutTime: '17:00' },
          { employeeId: '3', date: '2023-04-07', status: 'absent', checkInTime: null, checkOutTime: null },
          { employeeId: '5', date: '2023-04-07', status: 'late', checkInTime: '08:30', checkOutTime: null },
          { employeeId: '6', date: '2023-04-07', status: 'late', checkInTime: '08:45', checkOutTime: null },
          { employeeId: '8', date: '2023-04-07', status: 'absent', checkInTime: null, checkOutTime: null }
        ];
        
        // Initialize data structure
        employees.forEach(employee => {
          attendanceByEmployee[employee._id] = {};
          
          daysInMonth.forEach(day => {
            const dayNum = getDate(day);
            const dayString = format(day, 'yyyy-MM-dd');
            
            // Check if we have real data for this employee on this day
            const matchingRecord = realAttendanceRecords.find(record => 
              record.employeeId === employee._id && record.date === dayString
            );
            
            if (matchingRecord) {
              // Use real data code
              switch(matchingRecord.status) {
                case 'present': 
                  attendanceByEmployee[employee._id][dayNum] = matchingRecord.checkOutTime ? 'P' : 'P';
                  break;
                case 'absent': 
                  attendanceByEmployee[employee._id][dayNum] = 'AN';
                  break;
                case 'late': 
                  attendanceByEmployee[employee._id][dayNum] = 'P';
                  break;
                default:
                  attendanceByEmployee[employee._id][dayNum] = 'P';
              }
            } else if (isWeekend(day)) {
              // Weekend code
              attendanceByEmployee[employee._id][dayNum] = 'W';
            } else {
              // Generate sensible mock data for other days
              const random = Math.random();
              if (random < 0.8) {
                // 80% chance of being present
                attendanceByEmployee[employee._id][dayNum] = 'P';
              } else if (random < 0.9) {
                // 10% chance of leave
                attendanceByEmployee[employee._id][dayNum] = 'CA';
              } else {
                // 10% chance of absence
                attendanceByEmployee[employee._id][dayNum] = 'AN';
              }
            }
          });
        });
        
        setAttendanceData(attendanceByEmployee);
      } else {
        // Actual API call - corrected to use the monthly-sheet endpoint
        const deptParam = selectedDepartment === 'all' ? '' : `?department=${selectedDepartment}`;
        const apiUrl = `/api/attendance/monthly-sheet/${yearMonth}${deptParam}`;
        console.log('Fetching attendance data from:', apiUrl);
        
        try {
          const response = await apiClient.get(apiUrl);
          console.log('API Response received:', response.status, response.statusText);
          
          if (response.data && response.data.success) {
            console.log('API data success. Got employees:', response.data.data.employees?.length || 0);
            console.log('API data days:', response.data.data.days?.length || 0);
            
            const { employees: employeeData, days } = response.data.data;
            const attendanceByEmployee = {};
            
            // Process API data into the format we need
            if (Array.isArray(employeeData) && employeeData.length > 0) {
              employeeData.forEach(employee => {
                attendanceByEmployee[employee._id] = {};
                
                if (Array.isArray(days) && days.length > 0) {
                  days.forEach(day => {
                    if (day && typeof day === 'object' && day.day) {
                      const dayNum = day.day;
                      // Check if employee has attendance data for this day
                      if (employee.attendance && Array.isArray(employee.attendance) && 
                          employee.attendance.length >= day.day && employee.attendance[day.day - 1]) {
                        const status = employee.attendance[day.day - 1]?.status || '';
                        attendanceByEmployee[employee._id][dayNum] = status;
                      } else {
                        console.warn(`No attendance data for employee ${employee._id} on day ${dayNum}`);
                        attendanceByEmployee[employee._id][dayNum] = '';
                      }
                    } else {
                      console.warn('Invalid day object:', day);
                    }
                  });
                } else {
                  console.warn('No days data or empty days array');
                }
              });
              
              setAttendanceData(attendanceByEmployee);
              console.log('Attendance data processed successfully');
            } else {
              console.warn('No employee data or empty employee array');
              setAttendanceData({});
            }
          } else {
            console.error('API response not successful:', response.data);
            throw new Error('Failed to load monthly attendance data');
          }
        } catch (apiError) {
          console.error('API call error:', apiError);
          throw apiError;
        }
      }
      
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error in fetchAttendanceData:', err);
      setError('Impossible de charger les données de présence. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  const updateAttendanceCode = async (employeeId, day, code) => {
    try {
      if (USE_MOCK_DATA) {
        // Update local data directly without API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const updatedData = { ...attendanceData };
        if (!updatedData[employeeId]) {
          updatedData[employeeId] = {};
        }
        updatedData[employeeId][day] = code;
        setAttendanceData(updatedData);
      } else {
        // Actual API call
        const dayDate = new Date(month.getFullYear(), month.getMonth(), day);
        const formattedDate = format(dayDate, 'yyyy-MM-dd');
        
        await apiClient.post(`/api/attendance/code`, {
          employeeId,
          date: formattedDate,
          code
        });
        
        // Update local state after successful API call
        const updatedData = { ...attendanceData };
        if (!updatedData[employeeId]) {
          updatedData[employeeId] = {};
        }
        updatedData[employeeId][day] = code;
        setAttendanceData(updatedData);
      }
      
      setLastUpdated(new Date());
      return true;
    } catch (err) {
      console.error('Erreur lors de la mise à jour du code de présence:', err);
      setError('Impossible de mettre à jour le code de présence. Veuillez réessayer.');
      return false;
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  const handleMonthChange = (newMonth) => {
    setMonth(newMonth);
  };

  const getAttendanceCode = (employeeId, day) => {
    // Get the day number
    const dayNum = getDate(day);
    
    // Check if we have data for this employee and day
    if (
      attendanceData && 
      attendanceData[employeeId] && 
      attendanceData[employeeId][dayNum]
    ) {
      return attendanceData[employeeId][dayNum];
    }
    
    // Return empty string if no data found
    return '';
  };

  const getDepartmentName = (departmentId) => {
    const department = departments.find(d => d._id === departmentId);
    return department ? department.name : 'N/A';
  };

  // Calculate filtered employees based on search term
  const getFilteredEmployees = () => {
    if (!searchTerm) {
      return employees;
    }
    
    return employees.filter(employee => {
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      const position = (employee.position || '').toLowerCase();
      const id = employee._id?.toString().toLowerCase() || '';
      const employeeId = employee.employeeId?.toString().toLowerCase() || '';
      const searchLower = searchTerm.toLowerCase();
      
      return fullName.includes(searchLower) || 
             position.includes(searchLower) || 
             id.includes(searchLower) ||
             employeeId.includes(searchLower);
    });
  };
  
  // Get filtered employees
  const filteredEmployees = getFilteredEmployees();

  // Provide methods and state to consumers
  return (
    <AttendanceContext.Provider
      value={{
        attendanceData,
        employees,
        filteredEmployees,
        departments,
        selectedDepartment,
        month,
        daysInMonth,
        loading,
        error,
        searchTerm,
        lastUpdated,
        handleSearchChange,
        handleDepartmentChange,
        handleMonthChange,
        getAttendanceCode,
        updateAttendanceCode,
        getDepartmentName,
        fetchAttendanceData
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export default AttendanceContext; 