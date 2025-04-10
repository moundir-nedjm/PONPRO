import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Tab,
  Tabs
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Check as CheckIcon,
  Edit as EditIcon,
  Face as FaceIcon,
  Camera as CameraIcon,
  Fingerprint as FingerprintIcon,
  QrCodeScanner as QrCodeIcon,
  CalendarMonth as CalendarIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Groups as GroupsIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import StatsButton from '../../components/attendance/StatsButton';
import { useSocket } from '../../context/SocketContext';
import FaceScanner from '../../components/attendance/FaceScanner';
import FingerprintScanner from '../../components/attendance/FingerprintScanner';
import QrCodeScanner from '../../components/attendance/QrCodeScanner';
import RealTimeStats from '../../components/attendance/RealTimeStats';
import AttendanceTrends from '../../components/attendance/AttendanceTrends';
import { fr } from 'date-fns/locale';

const TodayAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState({
    total: 0,
    present: 0,
    late: 0,
    absent: 0
  });
  const [employees, setEmployees] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [dialogAction, setDialogAction] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [attendanceCodes, setAttendanceCodes] = useState([]);
  const [selectedCode, setSelectedCode] = useState('');
  const [manualEmployeeSelect, setManualEmployeeSelect] = useState(false);
  const [employeeToSelect, setEmployeeToSelect] = useState(null);
  
  // New state variables for face scanning
  const [openFaceScanner, setOpenFaceScanner] = useState(false);
  const [openFingerprintScanner, setOpenFingerprintScanner] = useState(false);
  const [faceScanMode, setFaceScanMode] = useState('checkIn');
  const [fingerprintScanMode, setFingerprintScanMode] = useState('checkIn');
  const [openBiometricDialog, setOpenBiometricDialog] = useState(false);
  const [selectedBiometricMode, setSelectedBiometricMode] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isChefEquipe, setIsChefEquipe] = useState(false);
  const [selectedAttendanceRecord, setSelectedAttendanceRecord] = useState(null);
  
  // Add new state variables
  const [openQrCodeScanner, setOpenQrCodeScanner] = useState(false);
  const [qrCodeScanMode, setQrCodeScanMode] = useState('checkIn');
  const [activeTab, setActiveTab] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Add state for filtered records and not checked in employees
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [notCheckedInEmployees, setNotCheckedInEmployees] = useState([]);
  
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTodayAttendance();
    fetchEmployees();
    fetchAttendanceCodes();
    fetchUserRole();

    // Set up socket event listeners for real-time updates
    if (socket) {
      socket.on('attendance-update', handleAttendanceUpdate);
      
      // Clean up event listener on component unmount
      return () => {
        socket.off('attendance-update', handleAttendanceUpdate);
      };
    }
  }, [socket]);

  // Fetch user role to determine if they are Chef d'équipe
  const fetchUserRole = async () => {
    try {
      console.log('Fetching user role...');
      const res = await axios.get('/api/auth/me');
      console.log('User role response:', res.data);
      setUserRole(res.data.data.role);
      setIsChefEquipe(res.data.data.role === 'chef_equipe' || res.data.data.role === 'admin');
      console.log('Is Chef d\'équipe:', res.data.data.role === 'chef_equipe' || res.data.data.role === 'admin');
    } catch (err) {
      console.error('Error fetching user role:', err);
      // For demo/development, force enable Chef d'équipe features
      setIsChefEquipe(true);
      console.log('Enabling Chef d\'équipe features by default for development');
    }
  };

  const handleAttendanceUpdate = (data) => {
    console.log('Real-time attendance update received:', data);
    // Refresh data when we receive an update
    fetchTodayAttendance();
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('/api/employees?active=true');
      setEmployees(res.data.data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchAttendanceCodes = async () => {
    try {
      const res = await axios.get('/api/attendance-codes');
      setAttendanceCodes(res.data.data || []);
    } catch (err) {
      console.error('Error fetching attendance codes:', err);
      setAttendanceCodes([]);
    }
  };

  // Fetch today's attendance data
  const fetchTodayAttendance = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching today\'s attendance data...');
      
      // Get deleted employee IDs from localStorage
      const storedDeletedIds = localStorage.getItem('pointgee_deleted_employees');
      const deletedIds = storedDeletedIds ? JSON.parse(storedDeletedIds) : [];
      console.log('Deleted employee IDs:', deletedIds);
      
      // Make actual API call to fetch today's attendance
      const res = await axios.get('/api/attendance/today');
      
      // Filter out deleted employees from the attendance records
      const filteredRecords = res.data.data.filter(record => 
        !deletedIds.includes(record.employee?.id)
      );
      
      // Create filtered records based on search term
      const searchFilteredRecords = filteredRecords.filter(record => {
        const fullName = `${record.employee?.firstName} ${record.employee?.lastName}`.toLowerCase();
        const department = record.employee?.department?.name?.toLowerCase() || '';
        const searchLower = searchTerm.toLowerCase();
        
        return fullName.includes(searchLower) || department.includes(searchLower);
      });
      
      // Count records by status
      const presentCount = filteredRecords.filter(record => record.status === 'present').length;
      const lateCount = filteredRecords.filter(record => record.status === 'late').length;
      const absentCount = filteredRecords.filter(record => record.status === 'absent').length;
      
      // Set data
      setAttendanceRecords(filteredRecords);
      setSummary({
        total: filteredRecords.length,
        present: presentCount,
        late: lateCount,
        absent: absentCount
      });
      
      // Set filtered records
      setFilteredRecords(searchFilteredRecords);
      
      // Get list of employees who haven't checked in today
      const employeesRes = await axios.get('/api/employees/active');
      const activeEmployees = employeesRes.data.data || [];
      
      // Filter out deleted employees
      const availableEmployees = activeEmployees.filter(emp => !deletedIds.includes(emp.id));
      
      // Filter out employees who have already checked in
      const notCheckedInEmployees = availableEmployees.filter(emp => 
        !filteredRecords.some(rec => rec.employee?._id === emp._id && rec.checkIn)
      );
      
      setEmployees(availableEmployees);
      setNotCheckedInEmployees(notCheckedInEmployees);
      
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError('Erreur lors du chargement des données de présence.');
      setAttendanceRecords([]);
      setFilteredRecords([]);
      setNotCheckedInEmployees([]);
      setSummary({
        total: 0,
        present: 0,
        late: 0,
        absent: 0
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Add function to fetch weekly attendance data
  const fetchWeeklyData = async () => {
    try {
      const res = await axios.get('/api/attendance/weekly');
      setWeeklyData(res.data.data || []);
    } catch (err) {
      console.error('Error fetching weekly data:', err);
      setWeeklyData([]);
    }
  };

  // Add function to handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Add function to refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTodayAttendance();
    await fetchWeeklyData();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  // Function to handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Get status color based on status value
  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'late':
        return 'warning';
      case 'absent':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get status label based on status value
  const getStatusLabel = (status) => {
    switch (status) {
      case 'present':
        return 'Présent';
      case 'late':
        return 'En retard';
      case 'absent':
        return 'Absent';
      default:
        return status;
    }
  };

  // Open the manual employee selection dialog
  const handleOpenManualSelect = () => {
    setManualEmployeeSelect(true);
  };

  // Close the manual employee selection dialog
  const handleCloseManualSelect = () => {
    setManualEmployeeSelect(false);
    setEmployeeToSelect(null);
  };

  // Handle manual check-in action
  const handleManualCheckIn = () => {
    if (employeeToSelect) {
      setSelectedEmployee(employeeToSelect);
      setDialogAction('check-in');
      setOpenDialog(true);
      setManualEmployeeSelect(false);
    }
  };

  // Handle check-in action
  const handleCheckIn = (employee) => {
    handleOpenBiometricDialog('checkIn', employee);
  };

  // Handle check-out action
  const handleCheckOut = (attendanceRecord) => {
    setSelectedEmployee(attendanceRecord.employee);
    setSelectedAttendanceRecord(attendanceRecord);
    handleOpenBiometricDialog('checkOut', attendanceRecord.employee, attendanceRecord);
  };

  // Handle modify attendance action
  const handleModifyAttendance = (attendanceRecord) => {
    setSelectedEmployee(attendanceRecord.employee);
    setSelectedCode(attendanceRecord.attendanceCode || '');
    setDialogAction('modify');
    setOpenDialog(true);
  };

  // Open biometric selection dialog
  const handleOpenBiometricDialog = (mode, employee = null, record = null) => {
    setSelectedBiometricMode(mode);
    setSelectedEmployee(employee);
    setSelectedAttendanceRecord(record);
    setOpenBiometricDialog(true);
  };

  // Close biometric selection dialog
  const handleCloseBiometricDialog = () => {
    setOpenBiometricDialog(false);
  };

  // Handle biometric selection
  const handleBiometricSelection = (biometricType) => {
    setOpenBiometricDialog(false);
    
    if (biometricType === 'face') {
      if (selectedBiometricMode === 'checkIn') {
        setFaceScanMode('checkIn');
        setOpenFaceScanner(true);
      } else if (selectedBiometricMode === 'checkOut') {
        setFaceScanMode('checkOut');
        setOpenFaceScanner(true);
      }
    } else if (biometricType === 'fingerprint') {
      if (selectedBiometricMode === 'checkIn') {
        setFingerprintScanMode('checkIn');
        setOpenFingerprintScanner(true);
      } else if (selectedBiometricMode === 'checkOut') {
        setFingerprintScanMode('checkOut');
        setOpenFingerprintScanner(true);
      }
    } else if (biometricType === 'qrcode') {
      if (selectedBiometricMode === 'checkIn') {
        setQrCodeScanMode('checkIn');
        setOpenQrCodeScanner(true);
      } else if (selectedBiometricMode === 'checkOut') {
        setQrCodeScanMode('checkOut');
        setOpenQrCodeScanner(true);
      }
    }
  };

  // Close face scanner
  const handleCloseFaceScanner = () => {
    setOpenFaceScanner(false);
  };

  // Handle face scan success
  const handleFaceScanSuccess = (result) => {
    setTimeout(() => {
      setOpenFaceScanner(false);
      setSnackbar({
        open: true,
        message: faceScanMode === 'checkIn' 
          ? `Entrée enregistrée pour ${result.firstName} ${result.lastName}` 
          : `Sortie enregistrée pour ${result.firstName} ${result.lastName}`,
        severity: 'success'
      });
      fetchTodayAttendance();
    }, 1500);
  };

  // Close fingerprint scanner
  const handleCloseFingerprintScanner = () => {
    setOpenFingerprintScanner(false);
  };

  // Handle fingerprint scan success
  const handleFingerprintScanSuccess = (result) => {
    setTimeout(() => {
      setOpenFingerprintScanner(false);
      setSnackbar({
        open: true,
        message: fingerprintScanMode === 'checkIn' 
          ? `Entrée enregistrée pour ${result.firstName} ${result.lastName}` 
          : `Sortie enregistrée pour ${result.firstName} ${result.lastName}`,
        severity: 'success'
      });
      fetchTodayAttendance();
    }, 1500);
  };

  // Close QR code scanner
  const handleCloseQrCodeScanner = () => {
    setOpenQrCodeScanner(false);
  };

  // Handle QR code scan success
  const handleQrCodeScanSuccess = (result) => {
    setTimeout(() => {
      setOpenQrCodeScanner(false);
      setSnackbar({
        open: true,
        message: qrCodeScanMode === 'checkIn' 
          ? `Entrée enregistrée pour ${result.firstName} ${result.lastName}` 
          : `Sortie enregistrée pour ${result.firstName} ${result.lastName}`,
        severity: 'success'
      });
      fetchTodayAttendance();
    }, 1500);
  };

  // Handle closing snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Handle confirmation of dialog actions
  const confirmAction = () => {
    switch (dialogAction) {
      case 'check-in':
        console.log('Confirming check-in for:', selectedEmployee);
        // API call would go here
        setOpenDialog(false);
        setSnackbar({
          open: true,
          message: `Pointage d'entrée réussi pour ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}`,
          severity: 'success'
        });
        fetchTodayAttendance();
        break;
      case 'check-out':
        console.log('Confirming check-out for:', selectedEmployee);
        // API call would go here
        setOpenDialog(false);
        setSnackbar({
          open: true,
          message: `Pointage de sortie réussi pour ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}`,
          severity: 'success'
        });
        fetchTodayAttendance();
        break;
      case 'modify':
        console.log('Confirming modify for:', selectedEmployee, 'with code:', selectedCode);
        // API call would go here
        setOpenDialog(false);
        setSnackbar({
          open: true,
          message: `Statut modifié pour ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}`,
          severity: 'success'
        });
        fetchTodayAttendance();
        break;
      default:
        setOpenDialog(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1300, mx: 'auto', p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header with title and actions */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' }, 
        mb: 3,
        gap: 2
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 'bold',
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <CalendarIcon /> Pointage du Jour
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          flexWrap: 'wrap',
          justifyContent: { xs: 'flex-start', sm: 'flex-end' }
        }}>
          <Tooltip title="Rafraîchir les données">
            <IconButton 
              onClick={handleRefresh} 
              color="primary"
              disabled={refreshing}
              sx={{ 
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          {isChefEquipe && (
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              color="primary"
              onClick={() => handleOpenBiometricDialog('checkIn')}
            >
              Pointer
            </Button>
          )}
          
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            color="primary"
            onClick={handleOpenManualSelect}
            sx={{ fontWeight: 'medium' }}
          >
            Pointer Manuellement
          </Button>
          
          <StatsButton />
        </Box>
      </Box>
      
      {/* Current Date Display */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        mb: 3,
        background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(25,118,210,0.1) 50%, rgba(255,255,255,0) 100%)',
        py: 1
      }}>
        <Typography 
          variant="h5"
          component="h2"
          align="center"
          sx={{ 
            fontWeight: 'bold',
            textTransform: 'capitalize',
            display: 'inline-flex',
            alignItems: 'center',
            px: 3,
            py: 1,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            bgcolor: 'background.paper',
            color: 'primary.main'
          }}
        >
          <CalendarIcon sx={{ mr: 1 }} />
          {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
        </Typography>
      </Box>
      
      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ 
            '& .MuiTab-root': {
              minHeight: 64,
              fontWeight: 'medium'
            }
          }}
        >
          <Tab 
            icon={<CalendarIcon />} 
            label="Aujourd'hui" 
            id="tab-0" 
            iconPosition="start"
            aria-controls="tabpanel-0" 
          />
          <Tab 
            icon={<TrendingUpIcon />} 
            label="Tendances Hebdomadaires" 
            id="tab-1" 
            iconPosition="start"
            aria-controls="tabpanel-1" 
          />
          <Tab 
            icon={<CalendarIcon />} 
            label="Calendrier Mensuel" 
            id="tab-2" 
            iconPosition="start"
            aria-controls="tabpanel-2" 
          />
        </Tabs>
      </Box>
      
      <Box role="tabpanel" hidden={activeTab !== 0} id="tabpanel-0" aria-labelledby="tab-0">
        {activeTab === 0 && (
          <>
            {/* Enhanced Real-Time Stats */}
            <RealTimeStats 
              stats={{
                total: summary.total,
                present: summary.present,
                late: summary.late,
                absent: summary.absent,
                onTime: summary.present - summary.late
              }}
              loading={loading}
              title="Statistiques du Jour"
              todayOnly={true}
            />

            {/* Enhanced Search Bar */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                mb: 3, 
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2 
              }}
            >
              <Box sx={{ 
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                gap: 2
              }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Rechercher par employé ou département..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&.Mui-focused': {
                        boxShadow: '0 0 0 3px rgba(25,118,210,0.1)'
                      }
                    }
                  }}
                />
                
                <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    onClick={() => {
                      setFaceScanMode('checkIn');
                      setOpenFaceScanner(true);
                    }}
                    startIcon={<FaceIcon />}
                    sx={{ 
                      flex: { xs: 1, sm: 'none' },
                      borderRadius: 2,
                      fontWeight: 'medium'
                    }}
                  >
                    Scan Facial
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    color="secondary"
                    onClick={() => {
                      setFingerprintScanMode('checkIn');
                      setOpenFingerprintScanner(true);
                    }}
                    startIcon={<FingerprintIcon />}
                    sx={{ 
                      flex: { xs: 1, sm: 'none' },
                      borderRadius: 2,
                      fontWeight: 'medium'
                    }}
                  >
                    Empreinte
                  </Button>
                </Box>
              </Box>
            </Paper>

            {/* Main Content - Attendance Table */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: { xs: 1, sm: 2 }, 
                mb: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <Typography 
                variant="h6" 
                component="h2" 
                gutterBottom
                sx={{ 
                  pl: 1, 
                  borderLeft: '4px solid',
                  borderColor: 'primary.main',
                  fontWeight: 'bold'
                }}
              >
                Liste des pointages
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}
                  
                  <TableContainer 
                    sx={{ 
                      borderRadius: 1,
                      '& .MuiTableRow-root:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: 'action.hover' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>Employé</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Département</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Entrée</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Sortie</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Code</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>Heures</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredRecords.length > 0 ? (
                          filteredRecords.map((record) => (
                            <TableRow key={record._id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                              <TableCell>
                                <Link to={`/employees/${record.employee?._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                  <Typography 
                                    variant="body1" 
                                    fontWeight="medium"
                                    sx={{ 
                                      display: 'flex',
                                      alignItems: 'center',
                                      '&:hover': { color: 'primary.main' }
                                    }}
                                  >
                                    <GroupsIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                                    {`${record.employee?.firstName} ${record.employee?.lastName}`}
                                  </Typography>
                                </Link>
                              </TableCell>
                              <TableCell>{record.employee?.department?.name || 'N/A'}</TableCell>
                              <TableCell>
                                {record.checkIn?.time ? (
                                  <Chip
                                    size="small"
                                    icon={<LoginIcon fontSize="small" />}
                                    label={format(new Date(record.checkIn.time), 'HH:mm')}
                                    color="primary"
                                    variant="outlined"
                                  />
                                ) : 'N/A'}
                              </TableCell>
                              <TableCell>
                                {record.checkOut?.time ? (
                                  <Chip
                                    size="small"
                                    icon={<LogoutIcon fontSize="small" />}
                                    label={format(new Date(record.checkOut.time), 'HH:mm')}
                                    color="primary"
                                    variant="outlined"
                                  />
                                ) : 'N/A'}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={getStatusLabel(record.status)}
                                  color={getStatusColor(record.status)}
                                  sx={{ fontWeight: 'medium' }}
                                />
                              </TableCell>
                              <TableCell>
                                {record.attendanceCode ? 
                                  (() => {
                                    const codeObj = attendanceCodes.find(code => code._id === record.attendanceCode);
                                    console.log('Found code object:', codeObj, 'for code ID:', record.attendanceCode);
                                    if (codeObj) {
                                      return (
                                        <Chip 
                                          size="small" 
                                          label={codeObj.code}
                                          sx={{ 
                                            backgroundColor: codeObj.color || '#1976d2',
                                            color: codeObj.color ? (codeObj.color.startsWith('#f') || codeObj.color.startsWith('#e') || codeObj.color.startsWith('#a') ? '#000' : '#fff') : '#fff',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            '&:hover': {
                                              opacity: 0.8,
                                              boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                                            }
                                          }}
                                          onClick={() => handleModifyAttendance(record)}
                                        />
                                      );
                                    } else {
                                      return (
                                        <Chip
                                          size="small"
                                          label="Sélectionner"
                                          variant="outlined"
                                          color="primary"
                                          sx={{ 
                                            cursor: 'pointer',
                                            '&:hover': {
                                              backgroundColor: '#e3f2fd'
                                            }
                                          }}
                                          onClick={() => handleModifyAttendance(record)}
                                        />
                                      );
                                    }
                                  })() 
                                  : (
                                    <Chip
                                      size="small"
                                      label="Sélectionner"
                                      variant="outlined"
                                      color="primary"
                                      sx={{ 
                                        cursor: 'pointer',
                                        '&:hover': {
                                          backgroundColor: '#e3f2fd'
                                        }
                                      }}
                                      onClick={() => handleModifyAttendance(record)}
                                    />
                                  )
                                }
                                {!record.checkOut && (
                                  <Tooltip title="Dépointer">
                                    <IconButton 
                                      size="small"
                                      color="primary"
                                      onClick={() => handleCheckOut(record)}
                                      sx={{ ml: 1 }}
                                    >
                                      <LogoutIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </TableCell>
                              <TableCell align="right">
                                {record.workHours ? (
                                  <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    sx={{
                                      display: 'inline-block',
                                      bgcolor: 'info.light',
                                      color: 'info.dark',
                                      px: 1,
                                      py: 0.5,
                                      borderRadius: 1
                                    }}
                                  >
                                    {record.workHours}h
                                  </Typography>
                                ) : 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                              {searchTerm 
                                ? 'Aucun enregistrement trouvé correspondant à votre recherche.' 
                                : 'Aucun enregistrement de présence trouvé pour aujourd\'hui.'}
                            </TableCell>
                          </TableRow>
                        )}
                        
                        {notCheckedInEmployees.length > 0 && !searchTerm && (
                          <>
                            <TableRow>
                              <TableCell 
                                colSpan={7} 
                                sx={{ 
                                  bgcolor: 'error.light', 
                                  color: 'error.dark',
                                  py: 1.5
                                }}
                              >
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                                  <GroupsIcon sx={{ mr: 1 }} /> Employés non pointés ({notCheckedInEmployees.length})
                                </Typography>
                              </TableCell>
                            </TableRow>
                            {notCheckedInEmployees.map((employee) => (
                              <TableRow 
                                key={employee._id} 
                                sx={{ 
                                  bgcolor: 'rgba(211, 47, 47, 0.05)',
                                  '&:hover': {
                                    bgcolor: 'rgba(211, 47, 47, 0.08)'
                                  }
                                }}
                              >
                                <TableCell>
                                  <Link to={`/employees/${employee._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <Typography 
                                      variant="body1" 
                                      fontWeight="medium"
                                      sx={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        '&:hover': { color: 'primary.main' }
                                      }}
                                    >
                                      <GroupsIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                                      {`${employee.firstName} ${employee.lastName}`}
                                    </Typography>
                                  </Link>
                                </TableCell>
                                <TableCell>{employee.department?.name || 'N/A'}</TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>-</TableCell>
                                <TableCell>
                                  <Chip
                                    size="small"
                                    label="Absent"
                                    color="error"
                                    sx={{ fontWeight: 'medium' }}
                                  />
                                </TableCell>
                                <TableCell>
                                  {(() => {
                                    const absentCode = attendanceCodes.find(code => code._id === '42'); // "AN" code
                                    if (absentCode) {
                                      return (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          <Chip 
                                            size="small" 
                                            label={absentCode.code}
                                            sx={{ 
                                              backgroundColor: absentCode.color || '#9E9E9E',
                                              color: '#fff',
                                              cursor: 'pointer',
                                              fontWeight: 'bold',
                                              '&:hover': {
                                                opacity: 0.8,
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                                              }
                                            }}
                                            onClick={() => {
                                              setSelectedEmployee(employee);
                                              setSelectedCode('42'); // Default to AN
                                              setDialogAction('modify');
                                              setOpenDialog(true);
                                            }}
                                          />
                                          <Tooltip title="Pointer">
                                            <IconButton 
                                              size="small"
                                              color="primary"
                                              onClick={() => handleCheckIn(employee)}
                                              sx={{ 
                                                ml: 1,
                                                bgcolor: 'primary.light',
                                                '&:hover': {
                                                  bgcolor: 'primary.main',
                                                  color: 'white'
                                                }
                                              }}
                                            >
                                              <LoginIcon fontSize="small" />
                                            </IconButton>
                                          </Tooltip>
                                        </Box>
                                      );
                                    } else {
                                      return (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          <Chip
                                            size="small"
                                            label="Sélectionner"
                                            variant="outlined"
                                            color="primary"
                                            sx={{ 
                                              cursor: 'pointer',
                                              '&:hover': {
                                                backgroundColor: '#e3f2fd'
                                              }
                                            }}
                                            onClick={() => {
                                              setSelectedEmployee(employee);
                                              setSelectedCode('');
                                              setDialogAction('modify');
                                              setOpenDialog(true);
                                            }}
                                          />
                                          <Tooltip title="Pointer">
                                            <IconButton 
                                              size="small"
                                              color="primary"
                                              onClick={() => handleCheckIn(employee)}
                                              sx={{ 
                                                ml: 1,
                                                bgcolor: 'primary.light',
                                                '&:hover': {
                                                  bgcolor: 'primary.main',
                                                  color: 'white'
                                                }
                                              }}
                                            >
                                              <LoginIcon fontSize="small" />
                                            </IconButton>
                                          </Tooltip>
                                        </Box>
                                      );
                                    }
                                  })()}
                                </TableCell>
                                <TableCell align="right">-</TableCell>
                              </TableRow>
                            ))}
                          </>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Paper>
            
            {/* Biometric Options - now moved to compact cards in a grid */}
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h6" 
                component="h3" 
                gutterBottom
                sx={{ 
                  pl: 1, 
                  borderLeft: '4px solid',
                  borderColor: 'secondary.main',
                  fontWeight: 'bold'
                }}
              >
                Options de Pointage Avancées
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      height: '100%',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      transition: 'all 0.3s',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': { 
                        transform: 'translateY(-5px)',
                        boxShadow: 3
                      }
                    }}
                    onClick={() => {
                      setQrCodeScanMode('checkIn');
                      setOpenQrCodeScanner(true);
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      mb: 2
                    }}>
                      <QrCodeIcon sx={{ fontSize: 36, color: 'info.main' }} />
                      <Box sx={{ 
                        backgroundColor: 'info.light',
                        color: 'info.dark',
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        fontWeight: 'bold'
                      }}>
                        QR
                      </Box>
                    </Box>
                    <Typography variant="h6" gutterBottom>Scanner QR Code</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                      Scannez le QR code pour l'identification rapide des employés et l'enregistrement automatique
                    </Typography>
                    <Button
                      variant="outlined"
                      color="info"
                      sx={{ mt: 2, alignSelf: 'flex-start' }}
                      size="small"
                    >
                      Scanner
                    </Button>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      height: '100%',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      transition: 'all 0.3s',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': { 
                        transform: 'translateY(-5px)',
                        boxShadow: 3
                      }
                    }}
                    onClick={() => handleOpenBiometricDialog('checkOut')}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      mb: 2
                    }}>
                      <LogoutIcon sx={{ fontSize: 36, color: 'secondary.main' }} />
                      <Box sx={{ 
                        backgroundColor: 'secondary.light',
                        color: 'secondary.dark',
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        fontWeight: 'bold'
                      }}>
                        OUT
                      </Box>
                    </Box>
                    <Typography variant="h6" gutterBottom>Pointer le Départ</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                      Enregistrez le départ d'un employé à l'aide des différentes méthodes d'identification
                    </Typography>
                    <Button
                      variant="outlined"
                      color="secondary"
                      sx={{ mt: 2, alignSelf: 'flex-start' }}
                      size="small"
                    >
                      Dépointer
                    </Button>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      height: '100%',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      transition: 'all 0.3s',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': { 
                        transform: 'translateY(-5px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      mb: 2
                    }}>
                      <EditIcon sx={{ fontSize: 36, color: 'warning.main' }} />
                      <Box sx={{ 
                        backgroundColor: 'warning.light',
                        color: 'warning.dark',
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        fontWeight: 'bold'
                      }}>
                        MOD
                      </Box>
                    </Box>
                    <Typography variant="h6" gutterBottom>Modifier Pointage</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                      Modifier les détails d'un pointage existant ou ajouter des informations supplémentaires
                    </Typography>
                    <Button
                      variant="outlined"
                      color="warning"
                      sx={{ mt: 2, alignSelf: 'flex-start' }}
                      size="small"
                      component={Link}
                      to="/attendance"
                    >
                      Gérer
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </>
        )}
      </Box>
      
      {/* Keep the other tabpanels as they are */}
      <Box role="tabpanel" hidden={activeTab !== 1} id="tabpanel-1">
        {activeTab === 1 && (
          <>
            <Typography variant="h6" component="h2" gutterBottom>
              Analyse Hebdomadaire
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Ces statistiques montrent les tendances de présence sur les 7 derniers jours.
            </Typography>
            <AttendanceTrends weeklyData={weeklyData} />
            
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" component="h2" gutterBottom>
                Statistiques de Ponctualité
              </Typography>
              <Box sx={{ mt: 2, height: 300 }}>
                <Box sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  bgcolor: '#f5f5f5',
                  borderRadius: 1
                }}>
                  <Typography color="text.secondary">
                    Statistiques détaillées de ponctualité à venir
                  </Typography>
                </Box>
              </Box>
            </Paper>
            
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" component="h2" gutterBottom>
                Analyse des Absences
              </Typography>
              <Box sx={{ mt: 2, height: 300 }}>
                <Box sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  bgcolor: '#f5f5f5',
                  borderRadius: 1
                }}>
                  <Typography color="text.secondary">
                    Analyse détaillée des absences à venir
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </>
        )}
      </Box>
      
      <Box role="tabpanel" hidden={activeTab !== 2} id="tabpanel-2" aria-labelledby="tab-2">
        {activeTab === 2 && (
          <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Calendrier de Présence
            </Typography>
            <Box sx={{ mt: 2, height: 500 }}>
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                bgcolor: '#f5f5f5',
                borderRadius: 1
              }}>
                <Typography color="text.secondary">
                  Vue calendrier des présences à venir
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}
      </Box>
      
      <Dialog
        open={manualEmployeeSelect}
        onClose={handleCloseManualSelect}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Sélectionner un employé</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Autocomplete
              options={employees}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
              onChange={(event, newValue) => {
                setEmployeeToSelect(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Employé"
                  variant="outlined"
                  fullWidth
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseManualSelect}>Annuler</Button>
          <Button 
            onClick={handleManualCheckIn} 
            variant="contained" 
            color="primary"
            disabled={!employeeToSelect}
          >
            Pointer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {dialogAction === 'check-in' 
            ? 'Pointer l\'employé' 
            : dialogAction === 'check-out' 
              ? 'Dépointer l\'employé' 
              : 'Modifier le code de présence'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {dialogAction === 'check-in' 
              ? `Voulez-vous pointer ${selectedEmployee?.firstName} ${selectedEmployee?.lastName} maintenant?`
              : dialogAction === 'check-out'
                ? `Voulez-vous dépointer ${selectedEmployee?.firstName} ${selectedEmployee?.lastName} maintenant?`
                : `Modifier le code de présence pour ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}`}
          </DialogContentText>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="attendance-code-label">Code de présence</InputLabel>
            <Select
              labelId="attendance-code-label"
              id="attendance-code"
              value={selectedCode}
              label="Code de présence"
              onChange={(e) => setSelectedCode(e.target.value)}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  },
                },
              }}
            >
              <MenuItem value="">
                <em>Aucun</em>
              </MenuItem>
              {attendanceCodes.map((code) => (
                <MenuItem 
                  key={code._id} 
                  value={code._id}
                  sx={{
                    borderLeft: `6px solid ${code.color || '#ccc'}`,
                    paddingLeft: 2,
                    '&:hover': {
                      backgroundColor: `${code.color}22`
                    }
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    width: '100%',
                    alignItems: 'center'
                  }}>
                    <Typography>
                      <strong>{code.code}</strong> - {code.description}
                    </Typography>
                    {code.influencer && (
                      <Chip 
                        size="small" 
                        label="Influencer" 
                        sx={{ ml: 1, backgroundColor: '#e3f2fd', color: '#1565c0' }}
                      />
                    )}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button onClick={confirmAction} variant="contained" color="primary">
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={openBiometricDialog} 
        onClose={handleCloseBiometricDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedBiometricMode === 'checkIn' 
            ? 'Choisissez une méthode de pointage d\'entrée'
            : 'Choisissez une méthode de pointage de sortie'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Veuillez choisir une méthode de pointage biométrique:
          </DialogContentText>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3, justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<FaceIcon />}
              onClick={() => handleBiometricSelection('face')}
              sx={{ py: 2, px: 3, fontSize: '1rem' }}
            >
              Visage
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<FingerprintIcon />}
              onClick={() => handleBiometricSelection('fingerprint')}
              sx={{ py: 2, px: 3, fontSize: '1rem' }}
            >
              Empreinte
            </Button>
            <Button
              variant="contained"
              color="info"
              startIcon={<QrCodeIcon />}
              onClick={() => handleBiometricSelection('qrcode')}
              sx={{ py: 2, px: 3, fontSize: '1rem' }}
            >
              QR Code
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBiometricDialog}>Annuler</Button>
        </DialogActions>
      </Dialog>
      
      <FaceScanner
        open={openFaceScanner}
        onClose={handleCloseFaceScanner}
        onSuccess={handleFaceScanSuccess}
        mode={faceScanMode}
        employeeId={selectedEmployee?._id}
        title={faceScanMode === 'checkIn' ? 'Pointage d\'entrée par reconnaissance faciale' : 'Pointage de sortie par reconnaissance faciale'}
      />
      
      <FingerprintScanner
        open={openFingerprintScanner}
        onClose={handleCloseFingerprintScanner}
        onSuccess={handleFingerprintScanSuccess}
        mode={fingerprintScanMode}
        employeeId={selectedEmployee?._id}
        title={fingerprintScanMode === 'checkIn' ? 'Pointage d\'entrée par empreinte digitale' : 'Pointage de sortie par empreinte digitale'}
      />
      
      <QrCodeScanner
        open={openQrCodeScanner}
        onClose={handleCloseQrCodeScanner}
        onSuccess={handleQrCodeScanSuccess}
        mode={qrCodeScanMode}
        title={qrCodeScanMode === 'checkIn' ? 'Pointage d\'entrée par QR code' : 'Pointage de sortie par QR code'}
      />
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TodayAttendance; 