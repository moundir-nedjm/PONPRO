import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { fr } from 'date-fns/locale';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Card,
  CardContent,
  Divider,
  Tooltip,
  IconButton,
  Chip,
  InputAdornment,
  Avatar,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  CalendarMonth as CalendarMonthIcon,
  FilterList as FilterListIcon,
  BarChart as BarChartIcon,
  Print as PrintIcon,
  Category as CategoryIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Assessment as AssessmentIcon,
  FileDownload as FileDownloadIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
  Help as HelpIcon,
  Face as FaceIcon,
  Fingerprint as FingerprintIcon,
  BugReport as BugReportIcon
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, parseISO, eachMonthOfInterval, subMonths, addMonths, getYear, getMonth, isWithinInterval } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { statusStyles, getStatusStyle, statusClasses } from './styles';

const MonthlyAttendance = () => {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    totalDays: 0,
    presentDays: 0,
    lateDays: 0,
    absentDays: 0,
    totalHours: 0,
    averageHours: 0
  });

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [monthlyData, setMonthlyData] = useState({ days: [], employees: [], departments: [] });
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date())
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [hourFilter, setHourFilter] = useState({ min: '', max: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [printMode, setPrintMode] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [showSummary, setShowSummary] = useState(true);
  const [tempEmployeeId, setEmployeeId] = useState(null);

  // State for attendance code dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedCode, setSelectedCode] = useState('');
  const [codeTypeFilter, setCodeTypeFilter] = useState('all');
  const [attendanceCodes] = useState([
    { _id: '1', code: 'P', description: 'Présent', category: 'present', color: '#4CAF50', influencer: true },
    { _id: '2', code: 'A', description: 'Absent', category: 'absent', color: '#F44336', influencer: true },
    { _id: '3', code: 'R', description: 'Retard', category: 'present', color: '#FF9800', influencer: true },
    { _id: '4', code: 'CP', description: 'Congé payé', category: 'leave', color: '#2196F3', influencer: false },
    { _id: '5', code: 'CM', description: 'Congé maladie', category: 'leave', color: '#9C27B0', influencer: false },
    { _id: '6', code: 'P/2', description: 'Demi-journée', category: 'present', color: '#8BC34A', influencer: true },
    { _id: '7', code: 'AJ', description: 'Absence justifiée', category: 'absent', color: '#FF5722', influencer: false }
  ]);

  // Table scrolling functions
  const tableRef = useRef(null);
  const scrollLeft = () => {
    if (tableRef.current) {
      tableRef.current.scrollLeft -= 100;
    }
  };
  const scrollRight = () => {
    if (tableRef.current) {
      tableRef.current.scrollLeft += 100;
    }
  };

  // Effect to load employee data and attendance data when employeeId or selectedMonth changes
  useEffect(() => {
    if (employeeId) {
      fetchEmployeeData();
      fetchAttendanceData();
    }
  }, [employeeId, selectedMonth]);

  // Effect to apply filters when attendanceRecords or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [attendanceRecords, statusFilter, dateRange, hourFilter, searchTerm]);

  // Effect to load monthly sheet data when component mounts or month/department changes
  useEffect(() => {
    if (!employeeId) {
      // Only fetch monthly sheet data when not in employee-specific view
      fetchMonthlySheetData();
    }
  }, [selectedMonth, selectedDepartment, employeeId]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`/api/employees/${employeeId}`);
      if (res.data && (res.data.data || res.data)) {
        const employeeData = res.data.data || res.data;
        setEmployee(employeeData);
      } else {
        throw new Error('Employee data not found');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching employee data:', err);
      setError('Failed to load employee data. Please try again later.');
      setLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get selected month and year
      const month = getMonth(selectedMonth) + 1; // JavaScript months are 0-indexed
      const year = getYear(selectedMonth);
      
      // Use the API endpoint with month and year parameters
      const res = await axios.get(`/api/attendance/employee/${employeeId}?month=${month}&year=${year}`);
      
      let records = [];
      
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        records = res.data.data;
      } else if (Array.isArray(res.data)) {
        records = res.data;
      }
      
      // Handle case where no records exist
      if (records.length === 0) {
        console.log('No attendance records found for this employee in the selected month.');
      }
      
      setAttendanceRecords(records);
      setFilteredRecords(records);
      
      // Calculate summary for all records
      calculateSummary(records);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching monthly attendance:', err);
      setError('Erreur lors du chargement des données. Veuillez réessayer plus tard.');
      setAttendanceRecords([]);
      setFilteredRecords([]);
      setLoading(false);
    }
  };

  const calculateSummary = (records) => {
    const presentDays = records.filter(r => r.status === 'present').length;
    const lateDays = records.filter(r => r.status === 'late').length;
    const absentDays = records.filter(r => r.status === 'absent').length;
    const totalDays = presentDays + lateDays + absentDays;
    
    const totalHours = records.reduce((sum, record) => sum + (record.workHours || 0), 0);
    const averageHours = (presentDays + lateDays) > 0 ? (totalHours / (presentDays + lateDays)).toFixed(1) : 0;
    
    setSummary({
      totalDays,
      presentDays,
      lateDays,
      absentDays,
      totalHours: parseFloat(totalHours.toFixed(1)),
      averageHours: parseFloat(averageHours)
    });
  };

  const applyFilters = () => {
    let results = [...attendanceRecords];
    
    // Status filter
    if (statusFilter !== 'all') {
      results = results.filter(record => record.status === statusFilter);
    }
    
    // Date range filter
    results = results.filter(record => {
      const recordDate = new Date(record.date);
      return isWithinInterval(recordDate, { start: dateRange.startDate, end: dateRange.endDate });
    });
    
    // Hours filter
    if (hourFilter.min !== '') {
      results = results.filter(record => record.workHours >= parseFloat(hourFilter.min));
    }
    if (hourFilter.max !== '') {
      results = results.filter(record => record.workHours <= parseFloat(hourFilter.max));
    }
    
    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(record => 
        (record.notes && record.notes.toLowerCase().includes(term))
      );
    }
    
    setFilteredRecords(results);
    calculateSummary(results);
  };

  const handleMonthChange = (newDate) => {
    setSelectedMonth(newDate);
    setDateRange({
      startDate: startOfMonth(newDate),
      endDate: endOfMonth(newDate)
    });
  };

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

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleStartDateChange = (newDate) => {
    setDateRange(prev => ({ ...prev, startDate: newDate }));
  };

  const handleEndDateChange = (newDate) => {
    setDateRange(prev => ({ ...prev, endDate: newDate }));
  };

  const handleHourMinChange = (e) => {
    setHourFilter(prev => ({ ...prev, min: e.target.value }));
  };

  const handleHourMaxChange = (e) => {
    setHourFilter(prev => ({ ...prev, max: e.target.value }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleResetFilters = () => {
    setStatusFilter('all');
    setDateRange({
      startDate: startOfMonth(selectedMonth),
      endDate: endOfMonth(selectedMonth)
    });
    setHourFilter({ min: '', max: '' });
    setSearchTerm('');
  };

  const handleExportExcel = async () => {
    try {
      const month = getMonth(selectedMonth) + 1;
      const year = getYear(selectedMonth);
      
      // Get the Excel file from the server
      const response = await axios.get(`/api/attendance/export/${employeeId}?month=${month}&year=${year}`, {
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Fiche_Pointage_${employee?.firstName}_${employee?.lastName}_${month}_${year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting Excel:', error);
      setError('Failed to export attendance report. Please try again later.');
    }
  };

  // Function to refresh data
  const handleRefresh = () => {
    setLoading(true);
    fetchMonthlySheetData();
  };

  // Function to toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Function to toggle summary visibility
  const toggleSummary = () => {
    setShowSummary(!showSummary);
  };

  // Function to handle print
  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 300);
  };

  const fetchMonthlySheetData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get selected month and year
      const month = getMonth(selectedMonth) + 1; // JavaScript months are 0-indexed
      const year = getYear(selectedMonth);
      
      // Construct query parameters
      const params = new URLSearchParams();
      params.append('month', month);
      params.append('year', year);
      
      if (selectedDepartment && selectedDepartment !== 'all') {
        params.append('department', selectedDepartment);
      }
      
      // Fetch monthly attendance data from API
      const res = await axios.get(`/api/attendance/monthly?${params.toString()}`);
      
      if (res.data && res.data.success) {
        const data = res.data.data;
        setMonthlyData({
          days: data.days || [],
          employees: data.employees || [],
          departments: data.departments || []
        });
      } else if (res.data) {
        setMonthlyData({
          days: res.data.days || [],
          employees: res.data.employees || [],
          departments: res.data.departments || []
        });
      } else {
        setMonthlyData({ days: [], employees: [], departments: [] });
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching monthly sheet data:', err);
      setError('Failed to load monthly attendance data. Please try again later.');
      setMonthlyData({ days: [], employees: [], departments: [] });
      setLoading(false);
    }
  };

  // Dialog functions
  const handleOpenDialog = (employee, day) => {
    setSelectedEmployee(employee);
    setSelectedDay(day);
    setSelectedCode('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleUpdateAttendanceCode = () => {
    console.log('Updating attendance code:', selectedEmployee?.firstName, selectedDay?.date, selectedCode);
    // In a real implementation, this would update the database
    handleCloseDialog();
  };

  // Filter employees by department
  const filteredEmployees = monthlyData.employees.filter(emp => 
    selectedDepartment === 'all' || emp.department === selectedDepartment
  );

  // Function to render status cell with color
  const renderStatusCell = (status) => {
    let color = '';
    let backgroundColor = '';
    
    switch(status) {
      case 'P':
        color = '#1b5e20';
        backgroundColor = '#e8f5e9';
        break;
      case 'A':
        color = '#b71c1c';
        backgroundColor = '#ffebee';
        break;
      case 'R':
        color = '#e65100';
        backgroundColor = '#fff3e0';
        break;
      case 'CP':
        color = '#0d47a1';
        backgroundColor = '#e3f2fd';
        break;
      case 'CM':
        color = '#4a148c';
        backgroundColor = '#f3e5f5';
        break;
      case 'P/2':
        color = '#33691e';
        backgroundColor = '#f1f8e9';
        break;
      case 'AJ':
        color = '#bf360c';
        backgroundColor = '#fbe9e7';
        break;
      case '-':
        color = '#9e9e9e';
        backgroundColor = '#f5f5f5';
        break;
      default:
        color = '#212121';
        backgroundColor = '#ffffff';
    }
    
    return {
      color,
      backgroundColor,
      fontWeight: 'bold',
      minWidth: '30px',
      cursor: status !== '-' ? 'pointer' : 'default',
      textAlign: 'center',
      padding: printMode ? '2px' : '4px',
      border: printMode ? '1px solid rgba(224, 224, 224, 1)' : 'none'
    };
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <CalendarMonthIcon />
          </Avatar>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            Fiche de Pointage Mensuelle
          </Typography>
        </Box>
        
        {!printMode && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-end' } }}>
            <Button 
              variant="outlined" 
              color="primary" 
              size="small"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Actualiser
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              size="small"
              startIcon={<FilterListIcon />}
              onClick={toggleFilters}
            >
              {showFilters ? 'Masquer Filtres' : 'Afficher Filtres'}
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              size="small"
              startIcon={<AssessmentIcon />}
              onClick={toggleSummary}
            >
              {showSummary ? 'Masquer Résumé' : 'Afficher Résumé'}
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              size="small"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportExcel}
            >
              Excel
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              size="small"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
            >
              Imprimer
            </Button>
          </Box>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
            >
              Réessayer
            </Button>
          </Box>
        </Alert>
      ) : (
        <>
          {showFilters && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                    <DatePicker
                      views={['month', 'year']}
                      label="Mois"
                      minDate={subMonths(new Date(), 36)}
                      maxDate={addMonths(new Date(), 1)}
                      value={selectedMonth}
                      onChange={handleMonthChange}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel id="department-select-label">Département</InputLabel>
                    <Select
                      labelId="department-select-label"
                      value={selectedDepartment}
                      label="Département"
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                    >
                      <MenuItem value="all">Tous les départements</MenuItem>
                      {monthlyData.departments.map(dept => (
                        <MenuItem key={dept._id} value={dept._id}>{dept.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>
          )}
          
          {showSummary && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Résumé du mois de {format(selectedMonth, 'MMMM yyyy', { locale: fr })}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box p={1} sx={{ borderLeft: 3, borderColor: 'success.main', pl: 2 }}>
                    <Typography variant="body2" color="text.secondary">Employés</Typography>
                    <Typography variant="h5">{filteredEmployees.length}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box p={1} sx={{ borderLeft: 3, borderColor: 'primary.main', pl: 2 }}>
                    <Typography variant="body2" color="text.secondary">Jours ouvrés</Typography>
                    <Typography variant="h5">
                      {monthlyData.days.filter(day => !day.isWeekend).length}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box p={1} sx={{ borderLeft: 3, borderColor: 'warning.main', pl: 2 }}>
                    <Typography variant="body2" color="text.secondary">Taux de présence</Typography>
                    <Typography variant="h5">
                      {filteredEmployees.length > 0 
                        ? `${Math.round((filteredEmployees.reduce((sum, emp) => sum + emp.total, 0) / 
                            (filteredEmployees.length * monthlyData.days.filter(day => !day.isWeekend).length)) * 100)}%`
                        : '0%'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box p={1} sx={{ borderLeft: 3, borderColor: 'error.main', pl: 2 }}>
                    <Typography variant="body2" color="text.secondary">Jour actuel</Typography>
                    <Typography variant="h5">
                      {new Date().getDate()} / {monthlyData.days.length}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}
          
          <Paper sx={{ overflow: 'hidden' }}>
            <Box sx={{ 
              overflowX: 'auto', 
              position: 'relative',
              maxWidth: '100%'
            }}
            ref={tableRef}
            >
              <Table size="small" sx={{ minWidth: 650, overflowX: 'auto' }}>
                <TableHead>
                  <TableRow>
                    <TableCell 
                      sx={{ 
                        position: 'sticky', 
                        left: 0, 
                        zIndex: 3,
                        backgroundColor: 'background.paper',
                        minWidth: '200px',
                        ...(printMode && {
                          padding: '8px',
                          border: '1px solid rgba(224, 224, 224, 1)',
                        })
                      }}
                    >
                      Employé
                    </TableCell>
                    
                    {/* Day columns */}
                    {monthlyData.days.map(day => (
                      <TableCell 
                        key={day.date} 
                        align="center"
                        sx={{ 
                          minWidth: '30px',
                          backgroundColor: day.isWeekend ? '#f5f5f5' : 'background.paper',
                          ...(printMode && {
                            padding: '4px',
                            border: '1px solid rgba(224, 224, 224, 1)',
                          })
                        }}
                      >
                        <Tooltip title={`${day.date} (${day.weekday})`}>
                          <Typography variant="body2" 
                            sx={{ 
                              fontWeight: day.isWeekend ? 'normal' : 'bold',
                              color: day.isWeekend ? 'text.disabled' : 'text.primary'
                            }}
                          >
                            {day.day}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                    ))}
                    
                    <TableCell 
                      align="center" 
                      sx={{ 
                        fontWeight: 'bold',
                        backgroundColor: 'primary.light', 
                        color: 'primary.contrastText',
                        ...(printMode && {
                          padding: '8px',
                          border: '1px solid rgba(224, 224, 224, 1)',
                        })
                      }}
                    >
                      Total
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEmployees.map(employee => (
                    <TableRow 
                      key={employee._id}
                      hover
                    >
                      <TableCell 
                        component="th" 
                        scope="row"
                        sx={{ 
                          position: 'sticky', 
                          left: 0, 
                          zIndex: 1,
                          backgroundColor: 'background.paper',
                          ...(printMode && {
                            padding: '8px',
                            border: '1px solid rgba(224, 224, 224, 1)',
                          })
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {employee.firstName} {employee.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {employee.position} • {employee.departmentName}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      {/* Day cells with status */}
                      {monthlyData.days.map((day, dayIndex) => (
                        <TableCell 
                          key={`${employee._id}-${day.date}`} 
                          sx={renderStatusCell(employee.attendance[dayIndex]?.status || '-')}
                          onClick={() => {
                            if (!day.isWeekend) {
                              handleOpenDialog(employee, day);
                            }
                          }}
                        >
                          {employee.attendance[dayIndex]?.status || '-'}
                        </TableCell>
                      ))}
                      
                      <TableCell 
                        align="center" 
                        sx={{ 
                          fontWeight: 'bold',
                          backgroundColor: 'primary.light',
                          color: 'primary.contrastText',
                          ...(printMode && {
                            padding: '8px',
                            border: '1px solid rgba(224, 224, 224, 1)',
                          })
                        }}
                      >
                        {employee.total}
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Footer row with totals */}
                  <TableRow 
                    sx={{ 
                      backgroundColor: '#f5f5f5',
                      '& th, & td': { 
                        fontWeight: 'bold',
                        ...(printMode && {
                          border: '1px solid rgba(224, 224, 224, 1)',
                        })
                      }
                    }}
                  >
                    <TableCell 
                      sx={{ 
                        position: 'sticky', 
                        left: 0, 
                        zIndex: 1,
                        backgroundColor: '#f5f5f5',
                        fontWeight: 'bold',
                        ...(printMode && {
                          padding: '8px',
                          border: '1px solid rgba(224, 224, 224, 1)',
                        })
                      }}
                    >
                      Totaux
                    </TableCell>
                    
                    {monthlyData.days.map((day, dayIndex) => (
                      <TableCell 
                        key={`total-${day.date}`}
                        align="center"
                        sx={{ 
                          backgroundColor: day.isWeekend ? '#e0e0e0' : '#f5f5f5',
                          fontWeight: 'bold',
                          ...(printMode && {
                            padding: '4px',
                            border: '1px solid rgba(224, 224, 224, 1)',
                          })
                        }}
                      >
                        {day.isWeekend ? '-' : filteredEmployees.reduce((sum, emp) => {
                          const status = emp.attendance[dayIndex]?.status;
                          if (status === 'P') return sum + 1;
                          if (status === 'P/2') return sum + 0.5;
                          return sum;
                        }, 0)}
                      </TableCell>
                    ))}
                    
                    <TableCell 
                      align="center" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: 'primary.dark',
                        ...(printMode && { 
                          padding: '4px',
                          border: '1px solid rgba(224, 224, 224, 1)',
                        })
                      }}
                    >
                      {filteredEmployees.reduce((sum, emp) => sum + emp.total, 0)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
            
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              justifyContent: 'space-between',
              borderTop: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="body2">
                Total employés: {filteredEmployees.length}
              </Typography>
              <Typography variant="body2">
                Dernière mise à jour: {format(new Date(), 'dd/MM/yyyy HH:mm:ss')}
              </Typography>
            </Box>
          </Paper>
          
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body { -webkit-print-color-adjust: exact; }
              .MuiPaper-root { box-shadow: none !important; }
            }
          ` }} />
          
          {/* Pagination controls for mobile - only shown when not in print mode */}
          {!printMode && (
            <Paper 
              elevation={3}
              sx={{ 
                position: 'sticky', 
                bottom: 16, 
                left: '50%', 
                transform: 'translateX(-50%)',
                display: { xs: 'flex', md: 'none' },
                width: 'fit-content',
                mx: 'auto',
                mt: 2,
                p: 1,
                borderRadius: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                zIndex: 10
              }}
            >
              <IconButton color="primary" onClick={scrollLeft}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography 
                variant="body2" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mx: 1
                }}
              >
                Faire défiler
              </Typography>
              <IconButton color="primary" onClick={scrollRight}>
                <ChevronRightIcon />
              </IconButton>
            </Paper>
          )}

          {/* Attendance Code Edit Dialog - Don't show in print mode */}
          {!printMode && (
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
              <DialogTitle sx={{ 
                bgcolor: 'primary.main', 
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <EditIcon /> Modifier le code de présence
              </DialogTitle>
              <DialogContent sx={{ pt: 3 }}>
                {selectedEmployee && selectedDay && (
                  <Box sx={{ minWidth: 300, pt: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Employé
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {selectedEmployee.firstName} {selectedEmployee.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedEmployee.position}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Date
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {format(new Date(selectedDay.year, selectedDay.month - 1, selectedDay.day), 'dd MMMM yyyy', { locale: fr })}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {selectedDay.isWeekend ? 'Weekend' : 'Jour ouvré'}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                        Sélectionner un code de présence:
                      </Typography>
                      
                      {/* Category tabs for code selection */}
                      <Tabs
                        value={codeTypeFilter}
                        onChange={(e, newValue) => setCodeTypeFilter(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
                      >
                        <Tab value="all" label="Tous" />
                        <Tab value="present" label="Présence" />
                        <Tab value="absent" label="Absence" />
                        <Tab value="leave" label="Congé" />
                      </Tabs>
                      
                      <Grid container spacing={1}>
                        {attendanceCodes
                          .filter(code => codeTypeFilter === 'all' || code.category === codeTypeFilter)
                          .map((code) => (
                          <Grid item xs={6} sm={4} key={code._id}>
                            <Paper 
                              variant="outlined"
                              onClick={() => setSelectedCode(code.code)}
                              sx={{ 
                                p: 1, 
                                cursor: 'pointer',
                                borderLeft: `4px solid ${code.color}`,
                                borderColor: selectedCode === code.code ? code.color : 'divider',
                                borderWidth: selectedCode === code.code ? 2 : 1,
                                bgcolor: selectedCode === code.code ? `${code.color}11` : 'transparent',
                                '&:hover': { 
                                  bgcolor: `${code.color}11`,
                                  borderColor: code.color
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="h6" component="span" sx={{ fontWeight: 'bold' }}>
                                  {code.code}
                                </Typography>
                                {code.influencer && (
                                  <Chip size="small" label="Influencer" color="primary" sx={{ ml: 1 }} />
                                )}
                              </Box>
                              <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                {code.description}
                              </Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </Box>
                )}
              </DialogContent>
              <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
                <Button onClick={handleCloseDialog} variant="outlined">Annuler</Button>
                <Button 
                  onClick={handleUpdateAttendanceCode} 
                  variant="contained" 
                  startIcon={<SaveIcon />}
                  disabled={!selectedCode}
                >
                  Enregistrer
                </Button>
              </DialogActions>
            </Dialog>
          )}
        </>
      )}
    </Box>
  );
};

// Definition of MonthlySheetView component that was being exported but not defined
const MonthlySheetView = () => {
  return <MonthlyAttendance />;
};

export { MonthlySheetView };
export default MonthlyAttendance; 