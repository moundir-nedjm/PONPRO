import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiClient from '../../utils/api';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  FilterList as FilterListIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { startOfMonth, endOfMonth, format } from 'date-fns';

const COLORS = ['#4caf50', '#ff9800', '#f44336', '#9e9e9e'];

const AttendanceReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [summaryData, setSummaryData] = useState({
    present: 0,
    late: 0,
    absent: 0,
    total: 0
  });
  const [departmentData, setDepartmentData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    department: 'all',
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date())
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await apiClient.get('/departments');
        setDepartments(res.data.data || []);
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchAttendanceData();
  }, [filters]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      
      // Create URL parameters
      const params = new URLSearchParams();
      if (filters.startDate) {
        params.append('startDate', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate.toISOString());
      }
      if (filters.department && filters.department !== 'all') {
        params.append('department', filters.department);
      }
      
      const url = `/reports/attendance?${params.toString()}`;
      const res = await apiClient.get(url);
      
      console.log('Attendance report data:', res.data);
      
      if (res.data && res.data.success && res.data.data) {
        setAttendanceData(res.data.data.attendanceRecords || []);
        setSummaryData({
          present: res.data.data.summary.presentCount || 0,
          late: res.data.data.summary.lateCount || 0,
          absent: res.data.data.summary.absentCount || 0,
          total: res.data.data.summary.totalEmployees || 0
        });
        setDepartmentData(res.data.data.departmentBreakdown || []);
        setError(null);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError('Erreur lors du chargement des données. Veuillez réessayer plus tard.');
      
      // Reset data on error
      setAttendanceData([]);
      setSummaryData({ present: 0, late: 0, absent: 0, total: 0 });
      setDepartmentData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRefresh = () => {
    fetchAttendanceData();
  };

  // Initialize departmentData if undefined
  if (!departmentData) {
    setDepartmentData([]);
  }

  // Prepare data for pie chart
  const pieChartData = [
    { name: 'Present', value: summaryData.present, color: '#4caf50' },
    { name: 'Late', value: summaryData.late, color: '#ff9800' },
    { name: 'Absent', value: summaryData.absent, color: '#f44336' }
  ].filter(item => item.value > 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Attendance Report
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={filters.startDate}
              onChange={(date) => handleFilterChange('startDate', date)}
              renderInput={(params) => (
                <TextField {...params} sx={{ minWidth: 200 }} />
              )}
            />
            <DatePicker
              label="End Date"
              value={filters.endDate}
              onChange={(date) => handleFilterChange('endDate', date)}
              renderInput={(params) => (
                <TextField {...params} sx={{ minWidth: 200 }} />
              )}
            />
          </LocalizationProvider>
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="department-filter-label">Department</InputLabel>
            <Select
              labelId="department-filter-label"
              id="department-filter"
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              label="Department"
              startAdornment={
                <FilterListIcon sx={{ mr: 1, color: 'action.active' }} />
              }
            >
              <MenuItem value="all">All Departments</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept._id} value={dept._id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="info" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={3}>
                <Card sx={{ bgcolor: '#e8f5e9' }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Present
                    </Typography>
                    <Typography variant="h4" component="div">
                      {summaryData.present}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {summaryData.total > 0 
                        ? `${Math.round((summaryData.present / summaryData.total) * 100)}%` 
                        : '0%'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ bgcolor: '#fff3e0' }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Late
                    </Typography>
                    <Typography variant="h4" component="div">
                      {summaryData.late}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {summaryData.total > 0 
                        ? `${Math.round((summaryData.late / summaryData.total) * 100)}%` 
                        : '0%'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ bgcolor: '#ffebee' }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Absent
                    </Typography>
                    <Typography variant="h4" component="div">
                      {summaryData.absent}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {summaryData.total > 0 
                        ? `${Math.round((summaryData.absent / summaryData.total) * 100)}%` 
                        : '0%'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Total Records
                    </Typography>
                    <Typography variant="h4" component="div">
                      {summaryData.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      For selected period
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Attendance Distribution
                </Typography>
                <Paper sx={{ p: 2, height: 300 }}>
                  {pieChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body1" color="text.secondary">
                        No data available
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Department Breakdown
                </Typography>
                <Paper sx={{ p: 2, height: 300 }}>
                  {departmentData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={departmentData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="present" fill="#4caf50" name="Present" />
                        <Bar dataKey="late" fill="#ff9800" name="Late" />
                        <Bar dataKey="absent" fill="#f44336" name="Absent" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body1" color="text.secondary">
                        No data available
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom>
              Detailed Records
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Employee</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Check In</TableCell>
                    <TableCell>Check Out</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Hours</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceData.length > 0 ? (
                    attendanceData.map((record) => (
                      <TableRow key={record._id}>
                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell>{record.employee && `${record.employee.firstName || ''} ${record.employee.lastName || ''}`}</TableCell>
                        <TableCell>{record.employee?.department?.name || 'N/A'}</TableCell>
                        <TableCell>{record.checkIn || 'N/A'}</TableCell>
                        <TableCell>{record.checkOut || 'N/A'}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              bgcolor: 
                                record.status === 'present' ? '#e8f5e9' :
                                record.status === 'late' ? '#fff3e0' :
                                record.status === 'absent' ? '#ffebee' : 'grey.100',
                              color: 
                                record.status === 'present' ? 'success.dark' :
                                record.status === 'late' ? 'warning.dark' :
                                record.status === 'absent' ? 'error.dark' : 'text.secondary',
                            }}
                          >
                            {record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : 'N/A'}
                          </Box>
                        </TableCell>
                        <TableCell align="right">{record.workHours || 'N/A'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No attendance records found for the selected period.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default AttendanceReport; 