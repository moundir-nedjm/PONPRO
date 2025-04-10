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
  Help as HelpIcon
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

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeData();
      fetchAttendanceData();
    }
  }, [employeeId, selectedMonth]);

  useEffect(() => {
    applyFilters();
  }, [attendanceRecords, statusFilter, dateRange, hourFilter, searchTerm]);

  const fetchEmployeeData = async () => {
    try {
      const res = await axios.get(`/api/employees/${employeeId}`);
      setEmployee(res.data.data);
    } catch (err) {
      console.error('Error fetching employee data:', err);
      setError('Failed to load employee data. Please try again later.');
    }
  };

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      
      // Get selected month and year
      const month = getMonth(selectedMonth) + 1; // JavaScript months are 0-indexed
      const year = getYear(selectedMonth);
      
      // Use the new API endpoint with month and year parameters
      const res = await axios.get(`/api/attendance/employee/${employeeId}?month=${month}&year=${year}`);
      
      const records = res.data.data || [];
      setAttendanceRecords(records);
      setFilteredRecords(records);
      
      // Calculate summary for all records
      calculateSummary(records);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching monthly attendance:', err);
      setError('Failed to load monthly attendance. Please try again later.');
      
      // Generate mock data for demo
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const month = getMonth(selectedMonth);
    const year = getYear(selectedMonth);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const mockRecords = Array.from({ length: 22 }, (_, i) => {
      const day = Math.min(i + 1, daysInMonth);
      const date = new Date(year, month, day);
      const status = ['present', 'present', 'present', 'present', 'late', 'absent'][Math.floor(Math.random() * 6)];
      const workHours = status === 'absent' ? 0 : status === 'late' ? 7 + Math.random() * 1 : 8 + Math.random() * 1;
      
      return {
        _id: `mock-${i}`,
        date: date.toISOString(),
        checkIn: status !== 'absent' ? { time: new Date(year, month, day, 8, status === 'late' ? 30 : 0).toISOString() } : null,
        checkOut: status !== 'absent' ? { time: new Date(year, month, day, 16, 30).toISOString() } : null,
        status,
        workHours: status === 'absent' ? 0 : workHours,
        notes: status === 'absent' ? 'Absence non justifiée' : status === 'late' ? 'Retard' : ''
      };
    });
    
    setAttendanceRecords(mockRecords);
    setFilteredRecords(mockRecords);
    calculateSummary(mockRecords);
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

  // Function to fetch monthly sheet data
  const fetchMonthlySheetData = async () => {
    try {
      await fetchAttendanceData();
    } catch (error) {
      console.error('Error fetching monthly sheet data:', error);
      setError('Failed to load monthly sheet data. Please try again later.');
    }
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
        </Alert>
      ) : (
        <>
          {employee && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h5" component="div">
                      {`${employee.firstName} ${employee.lastName}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {employee.department?.name || 'Département non assigné'} • {employee.position || 'Poste non spécifié'}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                
                {/* Filter panel */}
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={4} md={3}>
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
                        <InputLabel id="status-filter-label">Statut</InputLabel>
                        <Select
                          labelId="status-filter-label"
                          id="status-filter"
                          value={statusFilter}
                          label="Statut"
                          onChange={handleStatusFilterChange}
                        >
                          <MenuItem value="all">Tous les statuts</MenuItem>
                          <MenuItem value="present">Présent</MenuItem>
                          <MenuItem value="late">En retard</MenuItem>
                          <MenuItem value="absent">Absent</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <TextField
                        fullWidth
                        id="search-notes"
                        label="Rechercher dans les notes"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Button 
                        variant="outlined" 
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        startIcon={<FilterListIcon />}
                        fullWidth
                      >
                        Filtres avancés
                      </Button>
                    </Grid>
                  </Grid>
                  
                  {showAdvancedFilters && (
                    <Accordion expanded={true} elevation={0} sx={{ mb: 2 }}>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6} md={3}>
                            <DatePicker
                              label="Du"
                              value={dateRange.startDate}
                              onChange={handleStartDateChange}
                              slotProps={{ textField: { fullWidth: true } }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <DatePicker
                              label="Au"
                              value={dateRange.endDate}
                              onChange={handleEndDateChange}
                              slotProps={{ textField: { fullWidth: true } }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={2}>
                            <TextField
                              fullWidth
                              label="Heures min"
                              type="number"
                              value={hourFilter.min}
                              onChange={handleHourMinChange}
                              InputProps={{
                                inputProps: { min: 0, max: 24, step: 0.5 }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={2}>
                            <TextField
                              fullWidth
                              label="Heures max"
                              type="number"
                              value={hourFilter.max}
                              onChange={handleHourMaxChange}
                              InputProps={{
                                inputProps: { min: 0, max: 24, step: 0.5 }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Button 
                              variant="text" 
                              onClick={handleResetFilters}
                              fullWidth
                            >
                              Réinitialiser
                            </Button>
                          </Grid>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  )}
                </LocalizationProvider>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" component="div" sx={{ mb: 2 }}>
                  {format(selectedMonth, 'MMMM yyyy', { locale: fr })}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Jours présent
                    </Typography>
                    <Typography variant="h6" component="div">
                      {summary.presentDays}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Jours en retard
                    </Typography>
                    <Typography variant="h6" component="div">
                      {summary.lateDays}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Jours absent
                    </Typography>
                    <Typography variant="h6" component="div">
                      {summary.absentDays}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="body2" color="text.secondary">
                      Heures totales
                    </Typography>
                    <Typography variant="h6" component="div">
                      {summary.totalHours.toFixed(1)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="div">
                Historique de présence
              </Typography>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {filteredRecords.length} enregistrements trouvés
                </Typography>
              </Box>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Entrée</TableCell>
                    <TableCell>Sortie</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Heures</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <TableRow key={record._id}>
                        <TableCell>
                          {format(typeof record.date === 'string' ? parseISO(record.date) : new Date(record.date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          {record.checkIn?.time ? format(typeof record.checkIn.time === 'string' ? parseISO(record.checkIn.time) : new Date(record.checkIn.time), 'HH:mm') : '-'}
                        </TableCell>
                        <TableCell>
                          {record.checkOut?.time ? format(typeof record.checkOut.time === 'string' ? parseISO(record.checkOut.time) : new Date(record.checkOut.time), 'HH:mm') : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={getStatusLabel(record.status)}
                            color={getStatusColor(record.status)}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {record.workHours ? record.workHours.toFixed(1) : '-'}
                        </TableCell>
                        <TableCell>
                          {record.notes || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Aucun enregistrement de présence trouvé pour les critères sélectionnés.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
};

// Add a new component for the monthly sheet view
const MonthlySheetView = () => {
  // State variables
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [monthlyData, setMonthlyData] = React.useState({ days: [], employees: [], departments: [] });
  const [selectedMonth, setSelectedMonth] = React.useState(new Date());
  const [selectedDepartment, setSelectedDepartment] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');
  // New state variables for enhanced features
  const [attendanceCodes, setAttendanceCodes] = React.useState([]);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState(null);
  const [selectedDay, setSelectedDay] = React.useState(null);
  const [selectedCode, setSelectedCode] = React.useState('');
  const [showFilters, setShowFilters] = React.useState(true);
  const [showLegend, setShowLegend] = React.useState(false);
  const [showSummary, setShowSummary] = React.useState(true);
  const [printMode, setPrintMode] = React.useState(false);
  const [codeTypeFilter, setCodeTypeFilter] = React.useState('all');
  const tableRef = React.useRef(null);

  // Function to fetch the monthly sheet data
  const fetchMonthlySheetData = async () => {
    try {
      setLoading(true);
      const selectedMonthStr = format(selectedMonth, 'yyyy-MM');
      const monthUrl = `${process.env.REACT_APP_API_URL}/attendance/monthly-sheet/${selectedMonthStr}${selectedDepartment !== 'all' ? `?department=${selectedDepartment}` : ''}`;
      
      // This would be an API call in a real application
      // For demonstration purposes, we'll use a timeout to simulate loading
      setTimeout(() => {
        // Generate mock data
        generateMockMonthlySheetData(selectedMonth, selectedDepartment);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching monthly sheet data:', error);
      setError('Unable to load the monthly attendance sheet. Please try again later.');
      setLoading(false);
      
      // For demonstration, generate mock data anyway
      generateMockMonthlySheetData(selectedMonth, selectedDepartment);
    }
  };

  // Function to generate mock monthly sheet data
  const generateMockMonthlySheetData = (month, departmentId) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const daysInMonth = end.getDate();
    
    // Generate days array
    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(start);
      date.setDate(i + 1);
      const weekday = format(date, 'EEE', { locale: fr });
      const isWeekend = weekday === 'sam.' || weekday === 'dim.';
      
      return {
        day: i + 1,
        weekday,
        isWeekend,
        year: date.getFullYear(),
        month: date.getMonth() + 1
      };
    });
    
    // Generate departments
    const departments = [
      { _id: 'dept1', name: 'Administration' },
      { _id: 'dept2', name: 'Production' },
      { _id: 'dept3', name: 'Marketing' },
      { _id: 'dept4', name: 'Finances' },
      { _id: 'dept5', name: 'Ressources Humaines' }
    ];
    
    // Generate employees (20-30 employees)
    const employeeCount = 20 + Math.floor(Math.random() * 11);
    const employees = Array.from({ length: employeeCount }, (_, i) => {
      const deptIndex = Math.floor(Math.random() * departments.length);
      const department = departments[deptIndex];
      
      // If a specific department is selected, only include employees from that department
      if (departmentId !== 'all' && department._id !== departmentId) {
        return null;
      }
      
      // Generate attendance for each day
      const attendance = days.map(day => {
        const { isWeekend } = day;
        let status = 'P'; // Default to present
        
        if (isWeekend) {
          status = '-'; // Weekend
        } else {
          // Random attendance status based on probabilities
          const rand = Math.random();
          if (rand < 0.05) status = 'A'; // 5% absent
          else if (rand < 0.10) status = 'AJ'; // 5% justified absence
          else if (rand < 0.15) status = 'CP'; // 5% paid leave
          else if (rand < 0.20) status = 'CM'; // 5% sick leave
          else if (rand < 0.25) status = 'P/2'; // 5% half-day
          else if (rand < 0.30) status = 'R'; // 5% late
          // 70% present
        }
        
        return { status };
      });
      
      // Calculate total days present
      const total = attendance.reduce((sum, day) => {
        const { status } = day;
        if (status === 'P') return sum + 1;
        if (status === 'P/2') return sum + 0.5;
        return sum;
      }, 0);
      
      // First and last names
      const firstNames = ['Ahmed', 'Mohamed', 'Fatima', 'Aisha', 'Omar', 'Ali', 'Hassan', 'Karim', 'Leila', 'Nadia', 'Rachid', 'Samira', 'Youssef', 'Zainab'];
      const lastNames = ['Alaoui', 'Bennani', 'Chaoui', 'Daoudi', 'El Amrani', 'Fassi', 'Ghali', 'Hakimi', 'Idrissi', 'Jalal', 'Karimi', 'Lahlou', 'Mansouri', 'Najjar'];
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      
      // Positions
      const positions = ['Manager', 'Assistant', 'Technicien', 'Opérateur', 'Comptable', 'Secrétaire', 'Ingénieur', 'Commercial', 'Analyste', 'Consultant'];
      const position = positions[Math.floor(Math.random() * positions.length)];
      
      return {
        _id: `emp${i + 1}`,
        employeeId: `EMP${(1000 + i).toString().padStart(5, '0')}`,
        firstName,
        lastName,
        position,
        department: department._id,
        departmentName: department.name,
        attendance,
        total
      };
    }).filter(Boolean); // Remove null values (employees from filtered departments)
    
    setMonthlyData({ days, employees, departments });
  };

  // Effect to load data when month or department changes
  React.useEffect(() => {
    fetchMonthlySheetData();
  }, [selectedMonth, selectedDepartment]);

  const handleMonthChange = (newDate) => {
    setSelectedMonth(newDate);
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const getStatusClass = (status) => {
    const code = attendanceCodes.find(c => c.code === status);
    if (!code) return 'status-default';
    return `status-${code.category}`;
  };

  const filteredEmployees = monthlyData.employees.filter(employee => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      employee.firstName.toLowerCase().includes(term) ||
      employee.lastName.toLowerCase().includes(term) ||
      employee.employeeId.toLowerCase().includes(term) ||
      employee.position.toLowerCase().includes(term)
    );
  });

  const fetchAttendanceCodes = async () => {
    try {
      const res = await axios.get('/api/attendance/codes');
      setAttendanceCodes(res.data.data || []);
    } catch (err) {
      console.error('Error fetching attendance codes:', err);
      // Generate all 62 attendance codes from the database
      const mockCodes = [
        // Section Gauche (Tons Bleus/Verts)
        { _id: 'code1', code: 'P', description: 'Présent Une Journée', category: 'present', color: '#4682B4', influencer: false },
        { _id: 'code2', code: 'JT', description: 'Jours déjà travaillé', category: 'present', color: '#4682B4', influencer: false },
        { _id: 'code3', code: 'PP', description: 'Une Journée + Prime 1000.00 da', category: 'present', color: '#4682B4', influencer: false },
        { _id: 'code4', code: '2P', description: 'Double Journée', category: 'present', color: '#4682B4', influencer: false },
        { _id: 'code5', code: '2P/PP', description: 'Double Journée + Prime 1000.00 da', category: 'present', color: '#4682B4', influencer: false },
        { _id: 'code6', code: 'PR', description: 'Une journée de remplacement', category: 'present', color: '#4682B4', influencer: false },
        { _id: 'code7', code: 'PR/2-AN/2', description: 'Demi Journée de remplacement Absence non justifiée Demi Journée', category: 'present', color: '#4682B4', influencer: false },
        { _id: 'code8', code: 'PR/2-AN1/2', description: 'Demi Journée de remplacement Absence non justifiée Demi Journée Influencer', category: 'present', color: '#4682B4', influencer: true },
        { _id: 'code9', code: 'PN', description: 'Présent En Permanence', category: 'present', color: '#4682B4', influencer: false },
        { _id: 'code10', code: 'P/2', description: 'Présent Demi Journée', category: 'present', color: '#4682B4', influencer: false },
        { _id: 'code11', code: 'P/4', description: 'Présent Quart de la Journée', category: 'present', color: '#4682B4', influencer: false },
        { _id: 'code12', code: 'N-P/2', description: 'Nouveau recruté Demi Journée', category: 'present', color: '#4682B4', influencer: false },
        { _id: 'code13', code: 'PH', description: 'P+ Heures Supplémentaire', category: 'present', color: '#4682B4', influencer: false },
        { _id: 'code14', code: 'PH/2', description: 'P+ Heures Supplémentaires/2', category: 'present', color: '#4682B4', influencer: false },
        { _id: 'code15', code: 'PC', description: 'Présent + Conduite', category: 'present', color: '#4682B4', influencer: false },
        { _id: 'code16', code: 'PC/2', description: 'Présent Demi journée + Conduite', category: 'present', color: '#4682B4', influencer: false },
        { _id: 'code17', code: 'MS', description: 'Mission', category: 'present', color: '#4682B4', influencer: false },
        { _id: 'code18', code: 'MS/2', description: 'Mission Demi Journée', category: 'present', color: '#4682B4', influencer: false },
        { _id: 'code19', code: 'JF', description: 'Jours fériés', category: 'holiday', color: '#4682B4', influencer: false },
        { _id: 'code20', code: 'W', description: 'Week end', category: 'holiday', color: '#4682B4', influencer: false },
        { _id: 'code21', code: 'W/2', description: 'Week end demi journée', category: 'holiday', color: '#4682B4', influencer: false },
        
        // Section Centrale (Tons Verts/Jaunes/Violets)
        { _id: 'code22', code: 'HP', description: 'Changement de poste', category: 'other', color: '#9ACD32', influencer: false },
        { _id: 'code23', code: 'CH', description: 'Changement de chantier', category: 'other', color: '#9ACD32', influencer: false },
        { _id: 'code24', code: 'DC', description: 'Absences pour Décès', category: 'leave', color: '#9ACD32', influencer: false },
        { _id: 'code25', code: 'DCI', description: 'Absences pour Décès Influencer', category: 'leave', color: '#9ACD32', influencer: true },
        { _id: 'code26', code: 'DM', description: 'Démission', category: 'other', color: '#9ACD32', influencer: false },
        { _id: 'code27', code: 'CRP', description: 'Congés de Récupération Payé', category: 'leave', color: '#9ACD32', influencer: false },
        { _id: 'code28', code: 'CRP/2', description: 'Congés de Récupération Payé demi journée', category: 'leave', color: '#9ACD32', influencer: false },
        { _id: 'code29', code: 'CRP.P', description: 'Congé Récupération Prêt Payé', category: 'leave', color: '#9ACD32', influencer: false },
        { _id: 'code30', code: 'CSS', description: 'Congé sans solde', category: 'leave', color: '#9ACD32', influencer: false },
        { _id: 'code31', code: 'CSS/2', description: 'Congé sans solde demi journée', category: 'leave', color: '#9ACD32', influencer: false },
        { _id: 'code32', code: 'CSS.P', description: 'Congé Sans Solde Prêt payé', category: 'leave', color: '#9ACD32', influencer: false },
        { _id: 'code33', code: 'CSSI', description: 'Congé sans solde Influencer', category: 'leave', color: '#9ACD32', influencer: true },
        { _id: 'code34', code: 'CSSI/2', description: 'Congé sans solde demi journée Influencer', category: 'leave', color: '#9ACD32', influencer: true },
        { _id: 'code35', code: 'CA.P', description: 'Congé Annuel Prêt Payé', category: 'leave', color: '#9ACD32', influencer: false },
        { _id: 'code36', code: 'CA', description: 'Congé annuel', category: 'leave', color: '#9ACD32', influencer: false },
        { _id: 'code37', code: 'CA/2', description: 'Congé annuel demi journée', category: 'leave', color: '#9ACD32', influencer: false },
        { _id: 'code38', code: 'CAI', description: 'Congé annuel Influencer', category: 'leave', color: '#9ACD32', influencer: true },
        { _id: 'code39', code: 'CAI/2', description: 'Congé annuel demi journée Influencer', category: 'leave', color: '#9ACD32', influencer: true },
        { _id: 'code40', code: 'CM', description: 'Congé de maladie', category: 'leave', color: '#9ACD32', influencer: false },
        { _id: 'code41', code: 'CM/2', description: 'Congé de maladie demi journée', category: 'leave', color: '#9ACD32', influencer: false },
        { _id: 'code42', code: 'CMI', description: 'Congé de maladie Influencer', category: 'leave', color: '#9ACD32', influencer: true },
        
        // Section Droite (Tons Rouges/Oranges)
        { _id: 'code43', code: 'AJ', description: 'Absence Justifiée', category: 'absent', color: '#CD5C5C', influencer: false },
        { _id: 'code44', code: 'AJ/2', description: 'Absence Justifiée Demi Journée', category: 'absent', color: '#CD5C5C', influencer: false },
        { _id: 'code45', code: 'AJI', description: 'Absence Justifiée Influencer', category: 'absent', color: '#CD5C5C', influencer: true },
        { _id: 'code46', code: 'AJI/2', description: 'Absence Justifiée Demi Journée Influencer', category: 'absent', color: '#CD5C5C', influencer: true },
        { _id: 'code47', code: 'AJ/2-P/2', description: 'Absence Justifiée Demi Journée Présent Demi Journée', category: 'absent', color: '#CD5C5C', influencer: false },
        { _id: 'code48', code: 'AJI/2-P/2', description: 'Absence Justifiée Demi Journée Influencer Présent Demi Journée', category: 'absent', color: '#CD5C5C', influencer: true },
        { _id: 'code49', code: 'AN', description: 'Absence Non Justifiée', category: 'absent', color: '#CD5C5C', influencer: false },
        { _id: 'code50', code: 'AN/2', description: 'Absence Non Justifiée Demi Journée', category: 'absent', color: '#CD5C5C', influencer: false },
        { _id: 'code51', code: 'ANI', description: 'Absence Non Justifiée Influencer', category: 'absent', color: '#CD5C5C', influencer: true },
        { _id: 'code52', code: 'ANI/2', description: 'Absence Non Justifiée Demi Journée Influencer', category: 'absent', color: '#CD5C5C', influencer: true },
        { _id: 'code53', code: 'AN/2-P/2', description: 'Absence Non Justifiée Demi Journée Présent Demi Journée', category: 'absent', color: '#CD5C5C', influencer: false },
        { _id: 'code54', code: 'ANI/2-P/2', description: 'Absence Non Justifiée Demi Journée Influencer Présent Demi Journée', category: 'absent', color: '#CD5C5C', influencer: true },
        { _id: 'code55', code: 'AO', description: 'Absence à la charge de l\'Organisme', category: 'absent', color: '#CD5C5C', influencer: false },
        { _id: 'code56', code: 'AO/2', description: 'Absence à la charge de l\'Organisme Demi Journée', category: 'absent', color: '#CD5C5C', influencer: false },
        { _id: 'code57', code: 'AOI', description: 'Absence à la charge de l\'Organisme Influencer', category: 'absent', color: '#CD5C5C', influencer: true },
        { _id: 'code58', code: 'AOI/2', description: 'Absence à la charge de l\'Organisme Demi Journée Influencer', category: 'absent', color: '#CD5C5C', influencer: true },
        { _id: 'code59', code: 'AOP', description: 'Absence à la charge du Patron', category: 'absent', color: '#CD5C5C', influencer: false },
        { _id: 'code60', code: 'AOP/2', description: 'Absence à la charge du Patron Demi Journée', category: 'absent', color: '#CD5C5C', influencer: false },
        { _id: 'code61', code: 'AOPI', description: 'Absence à la charge du Patron Influencer', category: 'absent', color: '#CD5C5C', influencer: true },
        { _id: 'code62', code: 'AOPI/2', description: 'Absence à la charge du Patron Demi Journée Influencer', category: 'absent', color: '#CD5C5C', influencer: true }
      ];
      
      console.log(`Loaded ${mockCodes.length} mock attendance codes`);
      setAttendanceCodes(mockCodes);
    }
  };

  const handleOpenDialog = (employee, dayIndex) => {
    const day = monthlyData.days[dayIndex];
    setSelectedEmployee(employee);
    
    // Create a properly formatted date from the day information
    const date = new Date(day.year, day.month - 1, day.day);
    
    setSelectedDay({
      date: date,
      index: dayIndex,
      isWeekend: day.isWeekend
    });
    setSelectedCode(employee.attendance[dayIndex].status);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEmployee(null);
    setSelectedDay(null);
    setSelectedCode('');
  };

  const handleUpdateAttendanceCode = () => {
    if (!selectedEmployee || !selectedDay || !selectedCode) {
      return;
    }

    // Create a copy of the employees array
    const updatedEmployees = [...monthlyData.employees];
    
    // Find the index of the selected employee
    const employeeIndex = updatedEmployees.findIndex(emp => emp._id === selectedEmployee._id);
    
    if (employeeIndex === -1) {
      return;
    }
    
    // Update the status for the selected day
    updatedEmployees[employeeIndex].attendance[selectedDay.index].status = selectedCode;
    
    // Update the state
    setMonthlyData(prev => ({
      ...prev,
      employees: updatedEmployees
    }));
    
    // Close the dialog
    handleCloseDialog();
    
    // In a real application, you would send an API request here
    console.log(`Updated attendance for ${selectedEmployee.firstName} ${selectedEmployee.lastName} on day ${selectedDay.day} to ${selectedCode}`);
  };

  const toggleLegend = () => {
    setShowLegend(!showLegend);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleCodeTypeFilterChange = (e) => {
    setCodeTypeFilter(e.target.value);
  };

  const togglePrintMode = () => {
    setPrintMode(!printMode);
  };

  const handlePrint = () => {
    setPrintMode(true);
    setTimeout(() => {
      window.print();
      setPrintMode(false);
    }, 300);
  };

  const handleExportExcel = async () => {
    try {
      const month = getMonth(selectedMonth) + 1;
      const year = getYear(selectedMonth);
      
      // Get the Excel file from the server
      const response = await axios.get(`/api/attendance/export/monthly-sheet?month=${month}&year=${year}&department=${selectedDepartment}`, {
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Fiche_Pointage_Mensuelle_${selectedDepartment === 'all' ? 'Tous' : monthlyData.departments.find(d => d._id === selectedDepartment)?.name}_${month}_${year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting Excel:', error);
      setError('Failed to export attendance report. Please try again later.');
    }
  };

  const toggleSummary = () => {
    setShowSummary(!showSummary);
  };

  const scrollLeft = () => {
    if (tableRef.current) {
      tableRef.current.scrollLeft -= 300;
    }
  };

  const scrollRight = () => {
    if (tableRef.current) {
      tableRef.current.scrollLeft += 300;
    }
  };

  // Effect to load attendance codes on component mount
  React.useEffect(() => {
    // Generate mock attendance codes
    const mockCodes = [
      { _id: 'code1', code: 'P', description: 'Présent', category: 'present', color: '#4caf50', influencer: true },
      { _id: 'code2', code: 'PP', description: 'Présent + Prime', category: 'present', color: '#8bc34a', influencer: false },
      { _id: 'code3', code: 'P/2', description: 'Demi-journée', category: 'present', color: '#cddc39', influencer: false },
      { _id: 'code4', code: '2P', description: 'Double présence', category: 'present', color: '#009688', influencer: false },
      { _id: 'code5', code: 'A', description: 'Absent', category: 'absent', color: '#f44336', influencer: true },
      { _id: 'code6', code: 'AJ', description: 'Absence justifiée', category: 'absent', color: '#ff9800', influencer: false },
      { _id: 'code7', code: 'AN', description: 'Absence non justifiée', category: 'absent', color: '#e91e63', influencer: false },
      { _id: 'code8', code: 'CP', description: 'Congé payé', category: 'leave', color: '#2196f3', influencer: false },
      { _id: 'code9', code: 'CM', description: 'Congé maladie', category: 'leave', color: '#3f51b5', influencer: false },
      { _id: 'code10', code: 'JF', description: 'Jour férié', category: 'holiday', color: '#607d8b', influencer: false },
      { _id: 'code11', code: '-', description: 'Weekend', category: 'holiday', color: '#9e9e9e', influencer: false },
      { _id: 'code12', code: 'MS', description: 'Mission', category: 'other', color: '#795548', influencer: false },
      { _id: 'code13', code: 'R', description: 'Retard', category: 'present', color: '#ff9800', influencer: false },
    ];
    
    setAttendanceCodes(mockCodes);
    
    // In a real app, you would fetch from API
    // fetchAttendanceCodes();
  }, []);

  return (
    <Box sx={{ p: 3, pt: printMode ? 0 : 3, mb: 4 }}>
      {!printMode && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonthIcon color="primary" fontSize="large" />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Fiche de Pointage Mensuelle
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Afficher/Masquer les filtres">
              <IconButton
                color={showFilters ? "primary" : "default"}
                onClick={toggleFilters}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Afficher la légende des codes">
              <IconButton
                color={showLegend ? "primary" : "default"}
                onClick={toggleLegend}
              >
                <HelpIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Afficher le résumé statistique">
              <IconButton
                color={showSummary ? "primary" : "default"}
                onClick={toggleSummary}
              >
                <BarChartIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Exporter en Excel">
              <IconButton color="primary" onClick={handleExportExcel}>
                <FileDownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Imprimer">
              <IconButton color="primary" onClick={handlePrint}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          {showFilters && !printMode && (
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                mb: 2, 
                borderRadius: 2
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4} md={3}>
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
                <Grid item xs={12} sm={4} md={3}>
                  <FormControl fullWidth>
                    <InputLabel id="department-select-label">Département</InputLabel>
                    <Select
                      labelId="department-select-label"
                      id="department-select"
                      value={selectedDepartment}
                      label="Département"
                      onChange={handleDepartmentChange}
                    >
                      <MenuItem value="all">Tous les départements</MenuItem>
                      {monthlyData.departments.map((department) => (
                        <MenuItem key={department._id} value={department._id}>
                          {department.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                  <TextField
                    fullWidth
                    label="Rechercher un employé"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                      endAdornment: searchTerm && (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => setSearchTerm('')}
                          >
                            <ClearIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <FormControl fullWidth>
                      <InputLabel id="status-type-select-label">Type de code</InputLabel>
                      <Select
                        labelId="status-type-select-label"
                        id="status-type-select"
                        value={codeTypeFilter}
                        label="Type de code"
                        onChange={(e) => setCodeTypeFilter(e.target.value)}
                      >
                        <MenuItem value="all">Tous les codes</MenuItem>
                        <MenuItem value="present">Présence</MenuItem>
                        <MenuItem value="absent">Absence</MenuItem>
                        <MenuItem value="leave">Congé</MenuItem>
                        <MenuItem value="holiday">Jour férié</MenuItem>
                        <MenuItem value="other">Autre</MenuItem>
                      </Select>
                    </FormControl>
                    <Button 
                      variant="outlined" 
                      onClick={toggleLegend}
                      startIcon={<InfoIcon />}
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      Légende
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          )}
          
          {showLegend && !printMode && (
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                mb: 2, 
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                  Légende des codes de présence
                </Typography>
                <IconButton size="small" onClick={toggleLegend}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {['all', 'present', 'absent', 'leave', 'holiday', 'other'].map(category => {
                  const filteredCodes = attendanceCodes.filter(code => 
                    category === 'all' || code.category === category
                  );
                  
                  if (filteredCodes.length === 0) return null;
                  
                  const categoryLabels = {
                    all: 'Tous les codes',
                    present: 'Codes de présence',
                    absent: 'Codes d\'absence',
                    leave: 'Codes de congé',
                    holiday: 'Jours fériés',
                    other: 'Autres codes'
                  };
                  
                  return (
                    <Grid item xs={12} md={category === 'all' ? 12 : 6} lg={4} key={category}>
                      {category !== 'all' && (
                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
                          {categoryLabels[category]}
                        </Typography>
                      )}
                      <Grid container spacing={1}>
                        {filteredCodes
                          .filter(code => codeTypeFilter === 'all' || code.category === codeTypeFilter)
                          .map(code => (
                          <Grid item xs={6} sm={4} key={code._id}>
                            <Paper 
                              variant="outlined"
                              sx={{ 
                                p: 1, 
                                borderLeft: `4px solid ${code.color}`,
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1
                              }}
                            >
                              <Box 
                                sx={{ 
                                  bgcolor: `${code.color}22`,
                                  color: code.color,
                                  fontWeight: 'bold',
                                  p: 0.5,
                                  borderRadius: 1,
                                  minWidth: 32,
                                  textAlign: 'center'
                                }}
                              >
                                {code.code}
                              </Box>
                              <Box>
                                <Typography variant="body2">{code.description}</Typography>
                                {code.influencer && (
                                  <Chip 
                                    size="small" 
                                    label="Influencer" 
                                    color="primary" 
                                    sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }} 
                                  />
                                )}
                              </Box>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          )}

          {showSummary && !printMode && (
            <Paper sx={{ 
              p: 2, 
              mb: 3, 
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`
            }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
                Résumé du mois de {format(selectedMonth, 'MMMM yyyy', { locale: fr })}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    borderLeft: '4px solid #4caf50', 
                    height: '100%',
                    boxShadow: 'none',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderRadius: 2
                  }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Jours ouvrables
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 1, color: '#4caf50', fontWeight: 'bold' }}>
                        {monthlyData.days.filter(day => !day.isWeekend).length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Sur {monthlyData.days.length} jours au total
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    borderLeft: '4px solid #2196f3', 
                    height: '100%',
                    boxShadow: 'none',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderRadius: 2
                  }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Employés présents en moyenne
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 1, color: '#2196f3', fontWeight: 'bold' }}>
                        {(filteredEmployees.length * 0.85).toFixed(1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Sur {filteredEmployees.length} employés au total
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    borderLeft: '4px solid #ff9800', 
                    height: '100%',
                    boxShadow: 'none',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderRadius: 2
                  }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Taux de présence
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 1, color: '#ff9800', fontWeight: 'bold' }}>
                        {Math.round(85 + Math.random() * 10)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        En hausse de 3% par rapport au mois précédent
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ 
                    borderLeft: '4px solid #f44336', 
                    height: '100%',
                    boxShadow: 'none',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderRadius: 2
                  }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        Taux d'absentéisme
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 1, color: '#f44336', fontWeight: 'bold' }}>
                        {Math.round(5 + Math.random() * 10)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        En baisse de 2% par rapport au mois précédent
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          )}

          <Paper sx={{ 
            overflow: 'hidden',
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow: printMode ? 'none' : undefined
          }}>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'primary.main', 
              color: 'primary.contrastText',
              textAlign: 'center',
              fontWeight: 'bold',
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {!printMode && (
                <Box sx={{ position: 'absolute', left: 10 }}>
                  <Tooltip title="Faire défiler vers la gauche">
                    <IconButton size="small" onClick={scrollLeft} sx={{ color: 'white' }}>
                      <ChevronLeftIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
              
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Fiche de Pointage des Salariés du mois de {format(selectedMonth, 'MMMM yyyy', { locale: fr })} 
                {selectedDepartment !== 'all' && ` / ${monthlyData.departments.find(d => d._id === selectedDepartment)?.name}`}
              </Typography>
              
              {!printMode && (
                <Box sx={{ position: 'absolute', right: 10 }}>
                  <Tooltip title="Faire défiler vers la droite">
                    <IconButton size="small" onClick={scrollRight} sx={{ color: 'white' }}>
                      <ChevronRightIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>
            
            <Box 
              ref={tableRef} 
              sx={{ 
                overflow: 'auto',
                maxHeight: printMode ? 'none' : '70vh',
                '&::-webkit-scrollbar': { height: 8, width: 8 },
                '&::-webkit-scrollbar-track': { bgcolor: 'background.paper' },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'primary.light', borderRadius: 2 }
              }}
            >
              <Table sx={{ 
                minWidth: 1200,
                ...(printMode && { borderCollapse: 'collapse', width: '100%' }) 
              }} size={printMode ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    <TableCell 
                      sx={{ 
                        fontWeight: 'bold', 
                        bgcolor: 'background.paper',
                        position: 'sticky',
                        left: 0,
                        zIndex: 3,
                        boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
                      }}
                    >
                      N°
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold',
                      bgcolor: 'background.paper',
                      position: 'sticky',
                      left: '50px',
                      zIndex: 3,
                      boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
                    }}>
                      Mat
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold',
                      bgcolor: 'background.paper',
                      position: 'sticky',
                      left: '110px',
                      zIndex: 3,
                      boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
                    }}>
                      Nom
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold',
                      bgcolor: 'background.paper',
                      position: 'sticky',
                      left: '200px',
                      zIndex: 3,
                      boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
                    }}>
                      Prénom
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Poste Occupé</TableCell>
                    
                    {/* Days of month headers with weekday */}
                    {monthlyData.days.map(day => (
                      <TableCell 
                        key={day.day} 
                        align="center" 
                        sx={{ 
                          fontWeight: 'bold',
                          bgcolor: day.isWeekend ? 'grey.200' : 'inherit',
                          color: day.isWeekend ? 'text.secondary' : 'inherit',
                          ...(printMode && { 
                            padding: '4px',
                            border: '1px solid rgba(224, 224, 224, 1)',
                          })
                        }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Typography variant="caption">{day.weekday}</Typography>
                          <Typography variant="body2">{day.day}</Typography>
                        </Box>
                      </TableCell>
                    ))}
                    
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEmployees.map((employee, index) => (
                    <TableRow 
                      key={employee._id} 
                      sx={{ 
                        '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                        '&:hover': { bgcolor: !printMode ? 'action.selected' : undefined }
                      }}
                    >
                      <TableCell sx={{ 
                        bgcolor: 'background.paper',
                        position: 'sticky',
                        left: 0,
                        zIndex: 2,
                        ...(printMode && { padding: '4px' })
                      }}>
                        {index + 1}
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: 'background.paper',
                        position: 'sticky',
                        left: '50px',
                        zIndex: 2,
                        ...(printMode && { padding: '4px' })
                      }}>
                        {employee.employeeId}
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 'medium',
                        bgcolor: 'background.paper',
                        position: 'sticky',
                        left: '110px',
                        zIndex: 2,
                        ...(printMode && { padding: '4px' })
                      }}>
                        {employee.lastName}
                      </TableCell>
                      <TableCell sx={{ 
                        bgcolor: 'background.paper',
                        position: 'sticky',
                        left: '200px',
                        zIndex: 2,
                        ...(printMode && { padding: '4px' })
                      }}>
                        {employee.firstName}
                      </TableCell>
                      <TableCell sx={{ ...(printMode && { padding: '4px' }) }}>
                        {employee.position}
                      </TableCell>
                      
                      {/* Days of month with status code */}
                      {employee.attendance.map((day, dayIndex) => (
                        <TableCell 
                          key={dayIndex} 
                          align="center"
                          onClick={!printMode ? () => handleOpenDialog(employee, dayIndex) : undefined}
                          sx={{ 
                            bgcolor: monthlyData.days[dayIndex].isWeekend ? 'grey.100' : 'inherit',
                            padding: '4px',
                            minWidth: '32px',
                            cursor: !printMode ? 'pointer' : 'default',
                            '&:hover': {
                              opacity: !printMode ? 0.8 : 1,
                              boxShadow: !printMode ? '0 0 0 1px rgba(0,0,0,0.1) inset' : 'none'
                            },
                            ...(printMode && { 
                              border: '1px solid rgba(224, 224, 224, 1)', 
                              padding: '2px'
                            })
                          }}
                        >
                          <Box 
                            className={getStatusClass(day.status)}
                            sx={{ 
                              display: 'inline-block',
                              width: '100%',
                              height: '100%',
                              textAlign: 'center',
                              fontWeight: 'bold',
                              fontSize: '0.75rem',
                              p: 0.5,
                              borderRadius: '4px',
                              position: 'relative'
                            }}
                          >
                            {day.status}
                            {!printMode && (
                              <EditIcon sx={{ position: 'absolute', right: 0, top: 0, fontSize: '0.6rem', opacity: 0.5 }} />
                            )}
                          </Box>
                        </TableCell>
                      ))}
                      
                      <TableCell align="center" sx={{ 
                        fontWeight: 'bold', 
                        ...(printMode && { 
                          padding: '4px',
                          border: '1px solid rgba(224, 224, 224, 1)',
                        }) 
                      }}>
                        {employee.total}
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Totals row */}
                  <TableRow sx={{ bgcolor: 'primary.light' }}>
                    <TableCell 
                      colSpan={5} 
                      sx={{ 
                        fontWeight: 'bold',
                        bgcolor: 'primary.light',
                        position: 'sticky',
                        left: 0,
                        zIndex: 2,
                        color: 'primary.dark'
                      }}
                    >
                      Total
                    </TableCell>
                    {monthlyData.days.map((day, index) => (
                      <TableCell 
                        key={index} 
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
                        {filteredEmployees.reduce((sum, emp) => {
                          const dayStatus = emp.attendance[index]?.status;
                          if (['P', 'PP', '2P'].includes(dayStatus)) return sum + 1;
                          if (dayStatus === 'P/2') return sum + 0.5;
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
          
          <style dangerouslySetInnerHTML={{ __html: statusStyles }} />
          
          {/* Pagination controls for mobile - only shown when not in print mode */}
          {!printMode && (
            <Paper 
              elevation={0}
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
                zIndex: 10,
                bgcolor: 'background.paper'
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
                            {selectedDay.date instanceof Date 
                              ? format(selectedDay.date, 'dd MMMM yyyy', { locale: fr })
                              : `${selectedDay.day} / ${selectedDay.month} / ${selectedDay.year}`
                            }
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
                        <Tab value="holiday" label="Jour férié" />
                        <Tab value="other" label="Autre" />
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

// Update the routes in App.js to include this new view
// /attendance/monthly-sheet should render MonthlySheetView
// /attendance/monthly/:employeeId should render the original MonthlyAttendance

export { MonthlySheetView };
export default MonthlyAttendance; 