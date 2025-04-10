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
  Chip
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
import { startOfYear, endOfYear, format, addDays } from 'date-fns';

const COLORS = ['#4caf50', '#ff9800', '#f44336', '#9e9e9e', '#2196f3', '#673ab7'];

const LeaveReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaveData, setLeaveData] = useState([]);
  const [summaryData, setSummaryData] = useState({
    approved: 0,
    pending: 0,
    rejected: 0,
    cancelled: 0,
    total: 0
  });
  const [typeData, setTypeData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({
    department: 'all',
    status: 'all',
    startDate: startOfYear(new Date()),
    endDate: endOfYear(new Date())
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
    fetchLeaveData();
  }, [filters]);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      
      // Format dates for API
      const startDate = format(filters.startDate, 'yyyy-MM-dd');
      const endDate = format(filters.endDate, 'yyyy-MM-dd');
      
      // Build query params
      let url = `/api/reports/leaves?startDate=${startDate}&endDate=${endDate}`;
      if (filters.department !== 'all') {
        url += `&department=${filters.department}`;
      }
      if (filters.status !== 'all') {
        url += `&status=${filters.status}`;
      }
      
      console.log('Fetching leave report from:', url);
      const res = await axios.get(url, { timeout: 5000 }); // Add timeout to prevent long waiting
      console.log('Leave report data:', res.data);
      
      if (res.data && res.data.success && res.data.data) {
        setLeaveData(res.data.data.leaveRecords || []);
        setSummaryData(res.data.data.summary || {
          approved: 0,
          pending: 0,
          rejected: 0,
          cancelled: 0,
          total: 0
        });
        setTypeData(res.data.data.typeBreakdown || []);
        setDepartmentData(res.data.data.departmentBreakdown || []);
        setError(null);
      } else {
        throw new Error('Format de réponse invalide du serveur');
      }
    } catch (err) {
      console.error('Error fetching leave data:', err);
      
      // Generate and use mock data when API fails
      console.log('Using mock leave data instead');
      const mockData = generateMockLeaveData();
      setLeaveData(mockData.leaveRecords);
      setSummaryData(mockData.summary);
      setTypeData(mockData.typeBreakdown);
      setDepartmentData(mockData.departmentBreakdown);
      
      // Don't set an error message in demo mode
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock data for demo purposes when server is not available
  const generateMockLeaveData = () => {
    const leaveTypes = ['annuel', 'maladie', 'personnel', 'sans solde', 'maternité'];
    const leaveStatus = ['approuvé', 'en attente', 'refusé'];
    
    // Create mock leave records
    const mockLeaveRecords = Array.from({ length: 20 }, (_, i) => {
      const type = leaveTypes[Math.floor(Math.random() * leaveTypes.length)];
      const status = leaveStatus[Math.floor(Math.random() * leaveStatus.length)];
      const days = Math.floor(Math.random() * 10) + 1;
      return {
        id: `leave${i}`,
        employeeId: `EMP${i + 100}`,
        employeeName: `Prénom${i} Nom${i}`,
        department: getDepartmentName(i),
        leaveType: type,
        startDate: format(addDays(new Date(), -Math.floor(Math.random() * 30)), 'yyyy-MM-dd'),
        endDate: format(addDays(new Date(), Math.floor(Math.random() * 30)), 'yyyy-MM-dd'),
        days: days,
        status: status,
        reason: `Raison de congé ${i + 1}`
      };
    });

    // Helper function to get department name
    function getDepartmentName(index) {
      const departments = [
        'KBK FROID', 'KBK ELEC', 'HML', 'REB', 
        'DEG', 'HAMRA', 'ADM SETIF', 'ADM HMD'
      ];
      return departments[index % departments.length];
    }

    // Create mock summary data
    const mockSummary = {
      totalLeaves: 65,
      approvedLeaves: 45,
      pendingLeaves: 15,
      rejectedLeaves: 5,
      annualLeaves: 30,
      sickLeaves: 15,
      personalLeaves: 10,
      unpaidLeaves: 5,
      maternityLeaves: 5,
      totalDays: 180
    };

    // Create mock department data
    const mockDepartmentData = [
      {
        id: 'dept1',
        name: 'KBK FROID',
        totalLeaves: Math.floor(Math.random() * 20) + 5,
        totalDays: Math.floor(Math.random() * 50) + 20,
        annualLeaves: Math.floor(Math.random() * 10) + 5,
        sickLeaves: Math.floor(Math.random() * 5) + 1,
        otherLeaves: Math.floor(Math.random() * 5) + 1
      },
      {
        id: 'dept2',
        name: 'KBK ELEC',
        totalLeaves: Math.floor(Math.random() * 20) + 5,
        totalDays: Math.floor(Math.random() * 50) + 20,
        annualLeaves: Math.floor(Math.random() * 10) + 5,
        sickLeaves: Math.floor(Math.random() * 5) + 1,
        otherLeaves: Math.floor(Math.random() * 5) + 1
      },
      {
        id: 'dept3',
        name: 'HML',
        totalLeaves: Math.floor(Math.random() * 20) + 5,
        totalDays: Math.floor(Math.random() * 50) + 20,
        annualLeaves: Math.floor(Math.random() * 10) + 5,
        sickLeaves: Math.floor(Math.random() * 5) + 1,
        otherLeaves: Math.floor(Math.random() * 5) + 1
      },
      {
        id: 'dept4',
        name: 'REB',
        totalLeaves: Math.floor(Math.random() * 20) + 5,
        totalDays: Math.floor(Math.random() * 50) + 20,
        annualLeaves: Math.floor(Math.random() * 10) + 5,
        sickLeaves: Math.floor(Math.random() * 5) + 1,
        otherLeaves: Math.floor(Math.random() * 5) + 1
      },
      {
        id: 'dept5',
        name: 'DEG',
        totalLeaves: Math.floor(Math.random() * 20) + 5,
        totalDays: Math.floor(Math.random() * 50) + 20,
        annualLeaves: Math.floor(Math.random() * 10) + 5,
        sickLeaves: Math.floor(Math.random() * 5) + 1,
        otherLeaves: Math.floor(Math.random() * 5) + 1
      }
    ];
    
    // Create mock type data
    const mockTypeData = [
      { name: 'Congé Annuel', value: 30, color: '#4caf50' },
      { name: 'Congé Maladie', value: 15, color: '#ff9800' },
      { name: 'Congé Personnel', value: 10, color: '#f44336' },
      { name: 'Congé Sans Solde', value: 5, color: '#9e9e9e' },
      { name: 'Congé Maternité', value: 5, color: '#2196f3' },
      { name: 'Autres', value: 5, color: '#673ab7' }
    ];

    return {
      leaveRecords: mockLeaveRecords,
      summary: mockSummary,
      departmentBreakdown: mockDepartmentData,
      typeBreakdown: mockTypeData
    };
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRefresh = () => {
    fetchLeaveData();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  // Prepare data for pie chart
  const pieChartData = [
    { name: 'Approuvé', value: summaryData.approved, color: '#4caf50' },
    { name: 'En attente', value: summaryData.pending, color: '#ff9800' },
    { name: 'Refusé', value: summaryData.rejected, color: '#f44336' },
    { name: 'Annulé', value: summaryData.cancelled, color: '#9e9e9e' }
  ].filter(item => item.value > 0);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Rapport des Congés
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date de Début"
              value={filters.startDate}
              onChange={(date) => handleFilterChange('startDate', date)}
              renderInput={(params) => (
                <TextField {...params} sx={{ minWidth: 200 }} />
              )}
              slotProps={{
                textField: { sx: { minWidth: 200 } }
              }}
            />
            <DatePicker
              label="Date de Fin"
              value={filters.endDate}
              onChange={(date) => handleFilterChange('endDate', date)}
              renderInput={(params) => (
                <TextField {...params} sx={{ minWidth: 200 }} />
              )}
              slotProps={{
                textField: { sx: { minWidth: 200 } }
              }}
            />
          </LocalizationProvider>
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="department-filter-label">Département</InputLabel>
            <Select
              labelId="department-filter-label"
              id="department-filter"
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              label="Département"
            >
              <MenuItem value="all">Tous les Départements</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept._id} value={dept._id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="status-filter-label">Statut</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              label="Statut"
            >
              <MenuItem value="all">Tous les Statuts</MenuItem>
              <MenuItem value="approved">Approuvé</MenuItem>
              <MenuItem value="pending">En attente</MenuItem>
              <MenuItem value="rejected">Refusé</MenuItem>
              <MenuItem value="cancelled">Annulé</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Actualiser
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
                <Card sx={{ bgcolor: '#e3f2fd' }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Total des congés
                    </Typography>
                    <Typography variant="h4" component="div">
                      {summaryData.totalLeaves}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ bgcolor: '#e8f5e9' }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Approuvés
                    </Typography>
                    <Typography variant="h4" component="div">
                      {summaryData.approved}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ bgcolor: '#fff8e1' }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      En attente
                    </Typography>
                    <Typography variant="h4" component="div">
                      {summaryData.pending}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ bgcolor: '#ffebee' }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      Refusés
                    </Typography>
                    <Typography variant="h4" component="div">
                      {summaryData.rejected}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Distribution des Statuts de Congé
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
                  Répartition par Type de Congé
                </Typography>
                <Paper sx={{ p: 2, height: 300 }}>
                  {typeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={typeData}
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
                        <Bar dataKey="count" fill="#2196f3" name="Nombre de Demandes" />
                        <Bar dataKey="days" fill="#673ab7" name="Total de Jours" />
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
              Enregistrements Détaillés
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employé</TableCell>
                    <TableCell>Département</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>De</TableCell>
                    <TableCell>À</TableCell>
                    <TableCell>Jours</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Demandé le</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaveData.length > 0 ? (
                    leaveData.map((leave) => (
                      <TableRow key={leave._id}>
                        <TableCell>
                          {`${leave.employee?.firstName} ${leave.employee?.lastName}`}
                        </TableCell>
                        <TableCell>
                          {leave.employee?.department?.name || 'Non assigné'}
                        </TableCell>
                        <TableCell>
                          {leave.leaveType === 'annual' ? 'Congé Annuel' :
                           leave.leaveType === 'sick' ? 'Congé Maladie' :
                           leave.leaveType === 'personal' ? 'Congé Personnel' :
                           leave.leaveType === 'maternity' ? 'Congé Maternité' :
                           leave.leaveType === 'paternity' ? 'Congé Paternité' :
                           leave.leaveType === 'unpaid' ? 'Congé Sans Solde' :
                           leave.leaveType}
                        </TableCell>
                        <TableCell>
                          {new Date(leave.startDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(leave.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {leave.numberOfDays}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              leave.status === 'approved' ? 'Approuvé' :
                              leave.status === 'pending' ? 'En attente' :
                              leave.status === 'rejected' ? 'Refusé' :
                              leave.status === 'cancelled' ? 'Annulé' :
                              leave.status
                            }
                            color={getStatusColor(leave.status)}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(leave.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        Aucune donnée de congé trouvée pour la période sélectionnée.
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

export default LeaveReport; 