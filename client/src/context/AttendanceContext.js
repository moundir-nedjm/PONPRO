import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, getDate } from 'date-fns';
import { useSocket } from './SocketContext';

const AttendanceContext = createContext();

export const useAttendance = () => useContext(AttendanceContext);

// Mock departments data
const mockDepartments = [
  { _id: 'dept1', name: 'Administration', location: 'Siège' },
  { _id: 'dept2', name: 'Ressources Humaines', location: 'Siège' },
  { _id: 'dept3', name: 'Finance', location: 'Siège' },
  { _id: 'dept4', name: 'Production', location: 'Usine' },
  { _id: 'dept5', name: 'Logistique', location: 'Entrepôt' },
  { _id: 'dept6', name: 'Commercial', location: 'Siège' },
  { _id: 'dept7', name: 'Informatique', location: 'Siège' }
];

// Mock employees data
const mockEmployees = [
  { _id: 'emp1', firstName: 'Mohammed', lastName: 'Benali', position: 'Directeur', department: 'dept1' },
  { _id: 'emp2', firstName: 'Fatima', lastName: 'Zahra', position: 'RH Manager', department: 'dept2' },
  { _id: 'emp3', firstName: 'Ahmed', lastName: 'Kader', position: 'Comptable', department: 'dept3' },
  { _id: 'emp4', firstName: 'Karim', lastName: 'Benzema', position: 'Chef d\'équipe', department: 'dept4' },
  { _id: 'emp5', firstName: 'Leila', lastName: 'Hadj', position: 'Logisticien', department: 'dept5' },
  { _id: 'emp6', firstName: 'Youcef', lastName: 'Benatia', position: 'Commercial', department: 'dept6' },
  { _id: 'emp7', firstName: 'Amina', lastName: 'Belkacem', position: 'Développeur', department: 'dept7' },
  { _id: 'emp8', firstName: 'Omar', lastName: 'Cherif', position: 'Technicien', department: 'dept4' },
  { _id: 'emp9', firstName: 'Samira', lastName: 'Saidi', position: 'Assistante', department: 'dept1' },
  { _id: 'emp10', firstName: 'Rachid', lastName: 'Mehdaoui', position: 'Chauffeur', department: 'dept5' }
];

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
      // Use mock data instead of API call
      setDepartments(mockDepartments);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des départements:', err);
      setError('Impossible de charger les départements. Veuillez réessayer plus tard.');
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      // Use mock data instead of API call
      let filteredEmployees = [...mockEmployees];
      
      if (selectedDepartment !== 'all') {
        filteredEmployees = mockEmployees.filter(emp => emp.department === selectedDepartment);
      }
      
      setEmployees(filteredEmployees);
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
      
      // Formater les dates pour l'API
      const startDate = format(startOfMonth(month), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(month), 'yyyy-MM-dd');
      
      // Generate mock attendance data instead of API call
      const attendanceByEmployee = {};
      
      employees.forEach(employee => {
        attendanceByEmployee[employee._id] = {};
        
        daysInMonth.forEach(day => {
          const dayNum = getDate(day);
          if (isWeekend(day)) {
            attendanceByEmployee[employee._id][dayNum] = 'W';
          } else {
            // Randomly assign codes with weighted probabilities
            const random = Math.random();
            if (random < 0.7) {
              // 70% chance of being present
              attendanceByEmployee[employee._id][dayNum] = 'P';
            } else if (random < 0.75) {
              // 5% chance of being present with prime
              attendanceByEmployee[employee._id][dayNum] = 'PP';
            } else if (random < 0.78) {
              // 3% chance of double day
              attendanceByEmployee[employee._id][dayNum] = '2P';
            } else if (random < 0.8) {
              // 2% chance of present with overtime
              attendanceByEmployee[employee._id][dayNum] = 'PH';
            } else if (random < 0.82) {
              // 2% chance of half day
              attendanceByEmployee[employee._id][dayNum] = 'P/2';
            } else if (random < 0.85) {
              // 3% chance of mission
              attendanceByEmployee[employee._id][dayNum] = 'MS';
            } else if (random < 0.88) {
              // 3% chance of annual leave
              attendanceByEmployee[employee._id][dayNum] = 'CA';
            } else if (random < 0.9) {
              // 2% chance of sick leave
              attendanceByEmployee[employee._id][dayNum] = 'CM';
            } else if (random < 0.92) {
              // 2% chance of justified absence
              attendanceByEmployee[employee._id][dayNum] = 'AJ';
            } else if (random < 0.94) {
              // 2% chance of unjustified absence
              attendanceByEmployee[employee._id][dayNum] = 'AN';
            } else if (random < 0.95) {
              // 1% chance of paid recovery leave
              attendanceByEmployee[employee._id][dayNum] = 'CRP';
            } else if (random < 0.96) {
              // 1% chance of unpaid leave
              attendanceByEmployee[employee._id][dayNum] = 'CSS';
            } else if (random < 0.97) {
              // 1% chance of position change
              attendanceByEmployee[employee._id][dayNum] = 'HP';
            } else if (random < 0.98) {
              // 1% chance of authorized paid absence
              attendanceByEmployee[employee._id][dayNum] = 'AOP';
            } else if (random < 0.99) {
              // 1% chance of authorized unpaid absence
              attendanceByEmployee[employee._id][dayNum] = 'AON';
            } else {
              // 1% chance of other codes
              const otherCodes = ['JT', 'PR', 'PN', 'PC', 'JF', 'CH', 'DC', 'G.L', 'JD', 'D'];
              const randomCode = otherCodes[Math.floor(Math.random() * otherCodes.length)];
              attendanceByEmployee[employee._id][dayNum] = randomCode;
            }
          }
        });
      });
      
      setAttendanceData(attendanceByEmployee);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des données de présence:', err);
      setError('Impossible de charger les données de présence. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  const updateAttendanceCode = async (employeeId, day, code) => {
    try {
      // Update local data directly without API call
      const updatedData = { ...attendanceData };
      if (!updatedData[employeeId]) {
        updatedData[employeeId] = {};
      }
      updatedData[employeeId][day] = code;
      setAttendanceData(updatedData);
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
    // Obtenir le numéro du jour
    const dayNum = getDate(day);
    
    // Vérifier si nous avons des données de présence pour cet employé et ce jour
    if (attendanceData[employeeId] && attendanceData[employeeId][dayNum]) {
      return attendanceData[employeeId][dayNum];
    }
    
    // Par défaut, weekend pour les samedis et dimanches
    if (isWeekend(day)) {
      return 'W';
    }
    
    // Par défaut vide (pas de données)
    return '';
  };

  // Filtrer les employés en fonction du terme de recherche
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtenir le nom du département sélectionné
  const getDepartmentName = () => {
    if (selectedDepartment === 'all') return 'Tous les départements';
    const dept = departments.find(d => d._id === selectedDepartment);
    return dept ? dept.name : '';
  };

  const value = {
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
    fetchDepartments,
    fetchEmployees,
    fetchAttendanceData,
    updateAttendanceCode,
    handleSearchChange,
    handleDepartmentChange,
    handleMonthChange,
    getAttendanceCode,
    getDepartmentName
  };

  return <AttendanceContext.Provider value={value}>{children}</AttendanceContext.Provider>;
};

export default AttendanceContext; 