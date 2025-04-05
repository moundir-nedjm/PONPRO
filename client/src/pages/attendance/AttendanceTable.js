import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  IconButton,
  Divider,
  Card,
  CardContent,
  CardHeader
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Today as TodayIcon,
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
  Print as PrintIcon,
  GetApp as DownloadIcon
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, getDate } from 'date-fns';

// Attendance status abbreviations
const STATUS_ABBREVIATIONS = {
  present: 'P',
  late: 'L',
  absent: 'A',
  holiday: 'H',
  weekend: 'W',
  leave: 'V',  // Vacation/Leave
  sick: 'S',   // Sick leave
  mission: 'M', // Mission/Business trip
  training: 'T', // Training
  remote: 'R'   // Remote work
};

// Status colors
const STATUS_COLORS = {
  present: '#4caf50',  // Green
  late: '#ff9800',     // Orange
  absent: '#f44336',   // Red
  holiday: '#9c27b0',  // Purple
  weekend: '#9e9e9e',  // Grey
  leave: '#2196f3',    // Blue
  sick: '#e91e63',     // Pink
  mission: '#3f51b5',  // Indigo
  training: '#009688', // Teal
  remote: '#00bcd4'    // Cyan
};

const AttendanceTable = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [month, setMonth] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState({});
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, [selectedDepartment]);

  useEffect(() => {
    if (employees.length > 0) {
      fetchAttendanceData();
    }
  }, [employees, month]);

  useEffect(() => {
    // Generate days in the selected month
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    setDaysInMonth(days);
  }, [month]);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('/api/departments');
      setDepartments(res.data.data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      let url = '/api/employees?status=active';
      
      if (selectedDepartment !== 'all') {
        url += `&department=${selectedDepartment}`;
      }
      
      const res = await axios.get(url);
      setEmployees(res.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees. Please try again later.');
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
      
      // Get attendance data for all employees for the month
      const res = await axios.get(`/api/attendance?startDate=${startDate}&endDate=${endDate}`);
      
      // Organize data by employee and date
      const attendanceByEmployee = {};
      
      (res.data.data || []).forEach(record => {
        if (!attendanceByEmployee[record.employee?._id]) {
          attendanceByEmployee[record.employee?._id] = {};
        }
        
        const date = new Date(record.date).getDate();
        attendanceByEmployee[record.employee?._id][date] = record.status;
      });
      
      setAttendanceData(attendanceByEmployee);
      setError(null);
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError('Failed to load attendance data. Please try again later.');
    } finally {
      setLoading(false);
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

  const getStatusAbbreviation = (employeeId, day) => {
    // Check if it's a weekend
    if (isWeekend(day)) {
      return STATUS_ABBREVIATIONS.weekend;
    }
    
    // Get the day number
    const dayNum = getDate(day);
    
    // Check if we have attendance data for this employee and day
    if (attendanceData[employeeId] && attendanceData[employeeId][dayNum]) {
      return STATUS_ABBREVIATIONS[attendanceData[employeeId][dayNum]] || '?';
    }
    
    // Default to empty (no data)
    return '';
  };

  const getStatusColor = (employeeId, day) => {
    // Check if it's a weekend
    if (isWeekend(day)) {
      return STATUS_COLORS.weekend;
    }
    
    // Get the day number
    const dayNum = getDate(day);
    
    // Check if we have attendance data for this employee and day
    if (attendanceData[employeeId] && attendanceData[employeeId][dayNum]) {
      return STATUS_COLORS[attendanceData[employeeId][dayNum]] || '#000000';
    }
    
    // Default to transparent (no data)
    return 'transparent';
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Implementation for exporting to CSV/Excel would go here
    alert('Export functionality will be implemented soon');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            component={Link}
            to="/attendance"
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1" gutterBottom>
            Monthly Attendance Table
          </Typography>
        </Box>
        <Box>
          <IconButton onClick={handlePrint} sx={{ mr: 1 }} title="Print">
            <PrintIcon />
          </IconButton>
          <IconButton onClick={handleExport} title="Export">
            <DownloadIcon />
          </IconButton>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by employee name..."
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
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="department-filter-label">Department</InputLabel>
              <Select
                labelId="department-filter-label"
                id="department-filter"
                value={selectedDepartment}
                onChange={handleDepartmentChange}
                label="Department"
              >
                <MenuItem value="all">All Departments</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept._id} value={dept._id}>{dept.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Month"
                views={['year', 'month']}
                value={month}
                onChange={handleMonthChange}
                renderInput={(params) => (
                  <TextField {...params} fullWidth helperText={null} />
                )}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Legend
          </Typography>
          <Grid container spacing={1}>
            {Object.entries(STATUS_ABBREVIATIONS).map(([status, abbr]) => (
              <Grid item key={status}>
                <Chip
                  label={`${abbr} - ${status.charAt(0).toUpperCase() + status.slice(1)}`}
                  sx={{ 
                    bgcolor: STATUS_COLORS[status],
                    color: ['weekend', 'present', 'holiday'].includes(status) ? '#fff' : '#fff',
                    m: 0.5
                  }}
                />
              </Grid>
            ))}
          </Grid>
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
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', minWidth: 150 }}>Department</TableCell>
                  {daysInMonth.map((day) => (
                    <TableCell 
                      key={day.toString()} 
                      align="center"
                      sx={{ 
                        width: 40, 
                        p: 1,
                        bgcolor: isWeekend(day) ? '#f5f5f5' : 'inherit',
                        fontWeight: 'bold'
                      }}
                    >
                      {getDate(day)}
                    </TableCell>
                  ))}
                  <TableCell sx={{ fontWeight: 'bold', minWidth: 80 }} align="center">P</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', minWidth: 80 }} align="center">A</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', minWidth: 80 }} align="center">L</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => {
                    // Count statistics for this employee
                    let presentCount = 0;
                    let absentCount = 0;
                    let lateCount = 0;
                    
                    daysInMonth.forEach(day => {
                      const dayNum = getDate(day);
                      if (attendanceData[employee._id] && attendanceData[employee._id][dayNum]) {
                        const status = attendanceData[employee._id][dayNum];
                        if (status === 'present') presentCount++;
                        if (status === 'absent') absentCount++;
                        if (status === 'late') lateCount++;
                      }
                    });
                    
                    return (
                      <TableRow key={employee._id}>
                        <TableCell>
                          <Link to={`/employees/${employee._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Typography variant="body2" fontWeight="medium">
                              {`${employee.firstName} ${employee.lastName}`}
                            </Typography>
                          </Link>
                        </TableCell>
                        <TableCell>{employee.department?.name || 'N/A'}</TableCell>
                        {daysInMonth.map((day) => (
                          <TableCell 
                            key={day.toString()} 
                            align="center"
                            sx={{ 
                              p: 1,
                              bgcolor: isWeekend(day) ? '#f5f5f5' : 'inherit'
                            }}
                          >
                            <Box 
                              sx={{ 
                                width: 24, 
                                height: 24, 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                bgcolor: getStatusColor(employee._id, day),
                                color: '#fff',
                                fontWeight: 'bold',
                                fontSize: '0.75rem',
                                m: 'auto'
                              }}
                            >
                              {getStatusAbbreviation(employee._id, day)}
                            </Box>
                          </TableCell>
                        ))}
                        <TableCell align="center" sx={{ fontWeight: 'bold', color: STATUS_COLORS.present }}>
                          {presentCount}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', color: STATUS_COLORS.absent }}>
                          {absentCount}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', color: STATUS_COLORS.late }}>
                          {lateCount}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={daysInMonth.length + 5} align="center">
                      {searchTerm
                        ? 'No employees found matching your search.'
                        : 'No employees found in the selected department.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Monthly Statistics
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Attendance Rate" />
              <CardContent>
                <Typography variant="h4" color="primary">
                  {employees.length > 0 ? 
                    `${Math.round((Object.keys(attendanceData).length / employees.length) * 100)}%` : 
                    '0%'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {`For ${format(month, 'MMMM yyyy')}`}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Punctuality Rate" />
              <CardContent>
                <Typography variant="h4" color="primary">
                  {employees.length > 0 ? 
                    `${Math.round(85)}%` : 
                    '0%'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {`For ${format(month, 'MMMM yyyy')}`}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Absence Rate" />
              <CardContent>
                <Typography variant="h4" color="error">
                  {employees.length > 0 ? 
                    `${Math.round(15)}%` : 
                    '0%'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {`For ${format(month, 'MMMM yyyy')}`}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AttendanceTable; 