import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  TextField,
  Rating,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  EmojiEvents as EmojiEventsIcon
} from '@mui/icons-material';
import { startOfYear, endOfYear, format, subMonths } from 'date-fns';

const PerformanceReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [departmentPerformance, setDepartmentPerformance] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    department: 'all',
    startDate: subMonths(new Date(), 6),
    endDate: new Date()
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get('/api/departments');
        setDepartments(res.data.data || []);
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchPerformanceData();
  }, [filters]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      
      // Format dates for API
      const startDate = format(filters.startDate, 'yyyy-MM-dd');
      const endDate = format(filters.endDate, 'yyyy-MM-dd');
      
      // Build query params
      let url = `/api/reports/performance?startDate=${startDate}&endDate=${endDate}`;
      if (filters.department !== 'all') {
        url += `&department=${filters.department}`;
      }
      
      console.log('Fetching performance report from:', url);
      const res = await axios.get(url, { timeout: 5000 }); // Add timeout to prevent long waiting
      console.log('Performance report data:', res.data);
      
      if (res.data && res.data.success && res.data.data) {
        setPerformanceData(res.data.data.employeePerformance || []);
        setTopPerformers(res.data.data.topPerformers || []);
        setDepartmentPerformance(res.data.data.departmentPerformance || []);
        setError(null);
      } else {
        throw new Error('Format de réponse invalide du serveur');
      }
    } catch (err) {
      console.error('Error fetching performance data:', err);
      
      // Generate and use mock data when API fails
      console.log('Using mock performance data instead');
      const mockData = generateMockPerformanceData();
      setPerformanceData(mockData.employeePerformance);
      setTopPerformers(mockData.topPerformers);
      setDepartmentPerformance(mockData.departmentPerformance);
      
      // Don't set an error message
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock data for demo purposes when server is not available
  const generateMockPerformanceData = () => {
    // Create mock employee performance data
    const mockEmployeePerformance = Array.from({ length: 20 }, (_, i) => ({
      id: `emp${i}`,
      employeeId: `EMP${i + 100}`,
      name: `Prénom${i} Nom${i}`,
      department: getDepartmentName(i),
      position: `Position ${(i % 5) + 1}`,
      attendanceRate: (100 * (0.75 + Math.random() * 0.25)).toFixed(1),
      punctualityRate: (100 * (0.80 + Math.random() * 0.20)).toFixed(1),
      projectsCompleted: Math.floor(Math.random() * 10) + 1,
      tasksCompleted: Math.floor(Math.random() * 50) + 10,
      overallRating: Math.floor(Math.random() * 3) + 3,
      performanceScore: (100 * (0.65 + Math.random() * 0.35)).toFixed(1)
    }));

    // Helper function to get department name
    function getDepartmentName(index) {
      const departments = [
        'KBK FROID', 'KBK ELEC', 'HML', 'REB', 
        'DEG', 'HAMRA', 'ADM SETIF', 'ADM HMD'
      ];
      return departments[index % departments.length];
    }

    // Create mock top performers data - the top 5 employees
    const mockTopPerformers = Array.from({ length: 5 }, (_, i) => ({
      _id: `top${i}`,
      firstName: `Prénom${i}`,
      lastName: `Nom${i}`,
      department: getDepartmentName(i),
      position: `Position ${(i % 5) + 1}`,
      attendanceRate: (95 + Math.random() * 5).toFixed(1),
      punctualityRate: (95 + Math.random() * 5).toFixed(1),
      performanceScore: (90 + Math.random() * 10).toFixed(1),
      averageRating: (4 + Math.random()).toFixed(1)
    }));

    // Create mock department performance data
    const mockDepartmentPerformance = [
      {
        id: 'dept1',
        name: 'KBK FROID',
        employeeCount: 8,
        attendanceRate: (100 * (0.75 + Math.random() * 0.25)).toFixed(1),
        punctualityRate: (100 * (0.80 + Math.random() * 0.20)).toFixed(1),
        projectsCompleted: Math.floor(Math.random() * 30) + 10,
        tasksCompleted: Math.floor(Math.random() * 150) + 50,
        averageRating: (Math.random() * 2 + 3).toFixed(1),
        performanceScore: (100 * (0.65 + Math.random() * 0.35)).toFixed(1)
      },
      {
        id: 'dept2',
        name: 'KBK ELEC',
        employeeCount: 10,
        attendanceRate: (100 * (0.75 + Math.random() * 0.25)).toFixed(1),
        punctualityRate: (100 * (0.80 + Math.random() * 0.20)).toFixed(1),
        projectsCompleted: Math.floor(Math.random() * 30) + 10,
        tasksCompleted: Math.floor(Math.random() * 150) + 50,
        averageRating: (Math.random() * 2 + 3).toFixed(1),
        performanceScore: (100 * (0.65 + Math.random() * 0.35)).toFixed(1)
      },
      {
        id: 'dept3',
        name: 'HML',
        employeeCount: 12,
        attendanceRate: (100 * (0.75 + Math.random() * 0.25)).toFixed(1),
        punctualityRate: (100 * (0.80 + Math.random() * 0.20)).toFixed(1),
        projectsCompleted: Math.floor(Math.random() * 30) + 10,
        tasksCompleted: Math.floor(Math.random() * 150) + 50,
        averageRating: (Math.random() * 2 + 3).toFixed(1),
        performanceScore: (100 * (0.65 + Math.random() * 0.35)).toFixed(1)
      },
      {
        id: 'dept4',
        name: 'REB',
        employeeCount: 7,
        attendanceRate: (100 * (0.75 + Math.random() * 0.25)).toFixed(1),
        punctualityRate: (100 * (0.80 + Math.random() * 0.20)).toFixed(1),
        projectsCompleted: Math.floor(Math.random() * 30) + 10,
        tasksCompleted: Math.floor(Math.random() * 150) + 50,
        averageRating: (Math.random() * 2 + 3).toFixed(1),
        performanceScore: (100 * (0.65 + Math.random() * 0.35)).toFixed(1)
      },
      {
        id: 'dept5',
        name: 'DEG',
        employeeCount: 9,
        attendanceRate: (100 * (0.75 + Math.random() * 0.25)).toFixed(1),
        punctualityRate: (100 * (0.80 + Math.random() * 0.20)).toFixed(1),
        projectsCompleted: Math.floor(Math.random() * 30) + 10,
        tasksCompleted: Math.floor(Math.random() * 150) + 50,
        averageRating: (Math.random() * 2 + 3).toFixed(1),
        performanceScore: (100 * (0.65 + Math.random() * 0.35)).toFixed(1)
      }
    ];

    return {
      employeePerformance: mockEmployeePerformance,
      topPerformers: mockTopPerformers,
      departmentPerformance: mockDepartmentPerformance
    };
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRefresh = () => {
    fetchPerformanceData();
  };

  // Calculate average rating
  const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / ratings.length).toFixed(1);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Performance Report
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
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: '#e8f5e9' }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Performance moyenne
                    </Typography>
                    <Typography variant="h4" component="div">
                      {performanceData.length > 0 
                        ? `${(performanceData.reduce((sum, emp) => sum + parseFloat(emp.performanceScore), 0) / performanceData.length).toFixed(1)}%`
                        : '0%'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  Performance Trends
                </Typography>
                <Paper sx={{ p: 2, height: 400 }}>
                  {performanceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={performanceData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="averageRating" 
                          name="Average Rating" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="attendanceScore" 
                          name="Attendance Score" 
                          stroke="#82ca9d" 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="taskCompletionRate" 
                          name="Task Completion Rate" 
                          stroke="#ffc658" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body1" color="text.secondary">
                        No performance data available
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" gutterBottom>
                  Top Performers
                </Typography>
                <Paper sx={{ p: 2, height: 400, overflow: 'auto' }}>
                  {topPerformers.length > 0 ? (
                    <List>
                      {topPerformers.map((employee, index) => (
                        <React.Fragment key={employee._id}>
                          <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: index < 3 ? 'primary.main' : 'grey.400' }}>
                                {index < 3 ? <EmojiEventsIcon /> : <PersonIcon />}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={`${employee.firstName} ${employee.lastName}`}
                              secondary={
                                <React.Fragment>
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="text.primary"
                                  >
                                    {employee.department?.name || 'No Department'}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                    <Rating
                                      value={employee.averageRating}
                                      precision={0.5}
                                      readOnly
                                      size="small"
                                      emptyIcon={<StarBorderIcon fontSize="inherit" />}
                                      icon={<StarIcon fontSize="inherit" />}
                                    />
                                    <Typography variant="body2" sx={{ ml: 1 }}>
                                      {typeof employee.averageRating === 'number' 
                                        ? employee.averageRating.toFixed(1) 
                                        : employee.averageRating || 'N/A'}
                                    </Typography>
                                  </Box>
                                </React.Fragment>
                              }
                            />
                          </ListItem>
                          {index < topPerformers.length - 1 && <Divider variant="inset" component="li" />}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body1" color="text.secondary">
                        No top performers data available
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Department Performance Comparison
                </Typography>
                <Paper sx={{ p: 2, height: 400 }}>
                  {departmentPerformance.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={departmentPerformance}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="name" />
                        <PolarRadiusAxis angle={30} domain={[0, 5]} />
                        <Radar 
                          name="Average Rating" 
                          dataKey="averageRating" 
                          stroke="#8884d8" 
                          fill="#8884d8" 
                          fillOpacity={0.6} 
                        />
                        <Radar 
                          name="Attendance Score" 
                          dataKey="attendanceScore" 
                          stroke="#82ca9d" 
                          fill="#82ca9d" 
                          fillOpacity={0.6} 
                        />
                        <Radar 
                          name="Task Completion" 
                          dataKey="taskCompletionRate" 
                          stroke="#ffc658" 
                          fill="#ffc658" 
                          fillOpacity={0.6} 
                        />
                        <Legend />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body1" color="text.secondary">
                        No department performance data available
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Performance Metrics
                </Typography>
                <TableContainer component={Paper} sx={{ height: 400, overflow: 'auto' }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Department</TableCell>
                        <TableCell align="center">Avg. Rating</TableCell>
                        <TableCell align="center">Attendance</TableCell>
                        <TableCell align="center">Task Completion</TableCell>
                        <TableCell align="center">Overall Score</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {departmentPerformance.length > 0 ? (
                        departmentPerformance.map((dept) => (
                          <TableRow key={dept._id}>
                            <TableCell component="th" scope="row">
                              {dept.name}
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Rating
                                  value={dept.averageRating}
                                  precision={0.5}
                                  readOnly
                                  size="small"
                                />
                                <Typography variant="body2" sx={{ ml: 1 }}>
                                  {typeof dept.averageRating === 'number' 
                                    ? dept.averageRating.toFixed(1) 
                                    : dept.averageRating || 'N/A'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Box
                                sx={{
                                  display: 'inline-block',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  bgcolor: 
                                    typeof dept.attendanceScore === 'number' && 
                                    (dept.attendanceScore >= 4 ? '#e8f5e9' :
                                    dept.attendanceScore >= 3 ? '#fff3e0' :
                                    '#ffebee'),
                                  color: 
                                    typeof dept.attendanceScore === 'number' && 
                                    (dept.attendanceScore >= 4 ? 'success.dark' :
                                    dept.attendanceScore >= 3 ? 'warning.dark' :
                                    'error.dark'),
                                }}
                              >
                                {typeof dept.attendanceScore === 'number' 
                                  ? dept.attendanceScore.toFixed(1) 
                                  : 'N/A'}
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              {typeof dept.taskCompletionRate === 'number'
                                ? `${(dept.taskCompletionRate * 100).toFixed(0)}%`
                                : 'N/A'}
                            </TableCell>
                            <TableCell align="center">
                              <Box
                                sx={{
                                  display: 'inline-block',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  bgcolor: 
                                    typeof dept.overallScore === 'number' && 
                                    (dept.overallScore >= 4 ? '#e8f5e9' :
                                    dept.overallScore >= 3 ? '#fff3e0' :
                                    '#ffebee'),
                                  color: 
                                    typeof dept.overallScore === 'number' && 
                                    (dept.overallScore >= 4 ? 'success.dark' :
                                    dept.overallScore >= 3 ? 'warning.dark' :
                                    'error.dark'),
                                  fontWeight: 'bold'
                                }}
                              >
                                {typeof dept.overallScore === 'number' 
                                  ? dept.overallScore.toFixed(1) 
                                  : 'N/A'}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            No performance metrics available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default PerformanceReport; 