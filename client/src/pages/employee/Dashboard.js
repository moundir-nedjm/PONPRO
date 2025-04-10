import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  Box,
  Divider,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  LinearProgress,
  useTheme,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';
import {
  AccessTime as ClockIcon,
  EventAvailable as CalendarIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
  TrendingUp as TrendingUpIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Assignment as AssignmentIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import axios from 'axios';
import apiClient from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import moment from 'moment';
import 'moment/locale/fr';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import DepartmentDetail from '../departments/DepartmentDetail';

// Set moment to French locale
moment.locale('fr');

const EmployeeDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  
  // For Admin Dept users
  const [departmentId, setDepartmentId] = useState(null);
  const [departmentData, setDepartmentData] = useState(null);
  const [departmentEmployees, setDepartmentEmployees] = useState([]);
  const [loadingDepartment, setLoadingDepartment] = useState(false);
  const [departmentError, setDepartmentError] = useState(null);
  const [departmentStats, setDepartmentStats] = useState({
    totalEmployees: 0,
    present: 0,
    late: 0,
    absent: 0,
    onLeave: 0,
    pendingLeaves: 0,
    projectDistribution: [],
    attendanceDistribution: []
  });
  
  // Check if user is an admin department user (not chef)
  const isAdminDept = currentUser && 
    currentUser.role === 'admin' && 
    currentUser.projects && 
    currentUser.projects.length > 0;

  useEffect(() => {
    // For admin dept users, fetch department data
    if (isAdminDept) {
      fetchChefDepartmentData();
    } else {
      // For everyone else (including Chef d'Équipe), fetch personal dashboard
      fetchDashboardData();
    }
  }, [currentUser]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/employees/${currentUser.id}/dashboard`);
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Impossible de charger les données du tableau de bord. Veuillez réessayer plus tard.');
      setDashboardData({
        attendanceStats: { present: 0, absent: 0, late: 0, onTime: 0 },
        todayStatus: null,
        recentAttendance: [],
        upcomingLeaves: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch department data for Chef d'Équipe
  const fetchChefDepartmentData = async () => {
    try {
      setLoadingDepartment(true);
      console.log('Fetching department data for team leader:', currentUser.projects);
      
      // Get the department from the user's projects
      const departmentName = currentUser.projects[0];
      let foundDepartmentId = null;
      let departmentData = null;
      
      // First try an exact match by name
      try {
        const deptResponse = await apiClient.get(`/departments?name=${encodeURIComponent(departmentName)}`);
        console.log('Department response:', deptResponse);
        
        if (deptResponse.data.success && deptResponse.data.data.length > 0) {
          departmentData = deptResponse.data.data[0];
          foundDepartmentId = departmentData._id;
          setDepartmentData(departmentData);
          setDepartmentId(foundDepartmentId);
          setDepartmentError(null);
        } else {
          // If no exact match, try a search or get all departments and filter
          try {
            // Try search endpoint first
            const searchResponse = await apiClient.get(`/departments/search?term=${encodeURIComponent(departmentName)}`);
            if (searchResponse.data.success && searchResponse.data.data.length > 0) {
              departmentData = searchResponse.data.data[0];
              foundDepartmentId = departmentData._id;
              setDepartmentData(departmentData);
              setDepartmentId(foundDepartmentId);
              setDepartmentError(null);
            } else {
              // Fall back to loading all departments and filtering
              const allDeptResponse = await apiClient.get('/departments');
              if (allDeptResponse.data.success) {
                // Find a matching department
                const departments = allDeptResponse.data.data;
                const matchedDept = departments.find(dept => 
                  dept.name.includes(departmentName) || departmentName.includes(dept.name)
                );
                if (matchedDept) {
                  departmentData = matchedDept;
                  foundDepartmentId = matchedDept._id;
                  setDepartmentData(departmentData);
                  setDepartmentId(foundDepartmentId);
                  setDepartmentError(null);
                } else {
                  console.error('No matching department found for:', departmentName);
                  setDepartmentError('Département non trouvé.');
                }
              } else {
                console.error('Error fetching all departments');
                setDepartmentError('Erreur lors du chargement des départements.');
              }
            }
          } catch (searchErr) {
            console.error('Error searching for department:', searchErr);
            setDepartmentError('Erreur lors de la recherche du département.');
          }
        }
      } catch (err) {
        console.error('Error fetching department by name:', err);
        setDepartmentError('Erreur lors du chargement des données du département.');
      }
      
      // If we found a department, fetch its employees
      if (foundDepartmentId) {
        try {
          const employeesResponse = await apiClient.get(`/departments/${foundDepartmentId}/employees`);
          if (employeesResponse.data.success) {
            setDepartmentEmployees(employeesResponse.data.data || []);
          }
        } catch (err) {
          console.error('Error fetching department employees:', err);
        }
        
        // Calculate department stats
        if (departmentData) {
          const totalEmployees = departmentEmployees.length;
          
          try {
            // Fetch real attendance data from API
            const attendanceResponse = await apiClient.get(`/departments/${foundDepartmentId}/attendance/today`);
            
            if (attendanceResponse.data.success) {
              const attendanceData = attendanceResponse.data.data || {};
              const present = attendanceData.presentCount || 0;
              const late = attendanceData.lateCount || 0;
              const absent = (totalEmployees - present - late) || 0;
              const onLeave = attendanceData.leaveCount || 0;
              
              // Get pending leaves if available
              let pendingLeaves = 0;
              try {
                const leavesResponse = await apiClient.get(`/departments/${foundDepartmentId}/leaves/pending`);
                if (leavesResponse.data.success) {
                  pendingLeaves = leavesResponse.data.data?.length || 0;
                }
              } catch (leaveErr) {
                console.error('Error fetching pending leaves:', leaveErr);
              }
              
              const attendanceDistribution = [
                { name: 'Présent', value: present, color: '#4caf50' },
                { name: 'En retard', value: late, color: '#ff9800' },
                { name: 'Absent', value: absent, color: '#f44336' }
              ];
              
              // Get project distribution from department data
              const projectDistribution = [];
              if (departmentData.projects) {
                departmentData.projects.forEach(project => {
                  const employeesInProject = project.employeeCount || 0;
                  projectDistribution.push({
                    name: project.name || `Projet ${project.id || ''}`,
                    value: employeesInProject
                  });
                });
              }
              
              setDepartmentStats({
                totalEmployees,
                present,
                late,
                absent,
                onLeave,
                pendingLeaves,
                attendanceDistribution,
                projectDistribution
              });
            } else {
              throw new Error('Invalid attendance data format');
            }
          } catch (err) {
            console.error('Error fetching department attendance:', err);
            // Default to zeros if API fails
            setDepartmentStats({
              totalEmployees,
              present: 0,
              late: 0,
              absent: 0,
              onLeave: 0,
              pendingLeaves: 0,
              attendanceDistribution: [
                { name: 'Présent', value: 0, color: '#4caf50' },
                { name: 'En retard', value: 0, color: '#ff9800' },
                { name: 'Absent', value: 0, color: '#f44336' }
              ],
              projectDistribution: []
            });
          }
        }
      }
    } catch (err) {
      console.error('Error in fetchChefDepartmentData:', err);
      setDepartmentError('Erreur lors du chargement des données du département');
    } finally {
      setLoadingDepartment(false);
    }
  };

  // Helper function to get status chip
  const getStatusChip = (status) => {
    let chipProps = {
      label: 'En attente',
      color: 'default',
      icon: <PendingIcon fontSize="small" />
    };
    
    switch(status) {
      case 'present':
        chipProps = {
          label: 'Présent',
          color: 'success',
          icon: <CheckIcon fontSize="small" />
        };
        break;
      case 'absent':
        chipProps = {
          label: 'Absent',
          color: 'error',
          icon: <CancelIcon fontSize="small" />
        };
        break;
      case 'late':
        chipProps = {
          label: 'En retard',
          color: 'warning',
          icon: <ClockIcon fontSize="small" />
        };
        break;
      default:
        break;
    }
    
    return (
      <Chip
        size="small"
        icon={chipProps.icon}
        label={chipProps.label}
        color={chipProps.color}
        sx={{ fontWeight: 500 }}
      />
    );
  };

  if (loading || (isAdminDept && loadingDepartment)) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Error state for department data
  if (isAdminDept && departmentError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {departmentError}
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => fetchChefDepartmentData()}
        >
          Réessayer
        </Button>
      </Container>
    );
  }

  // Error state for regular employee dashboard
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3, bgcolor: theme.palette.error.light, color: theme.palette.error.contrastText }}>
          <Typography variant="h6">{error}</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={() => window.location.reload()}
          >
            Réessayer
          </Button>
        </Paper>
      </Container>
    );
  }

  // Admin Dashboard - showing specific department data
  if (isAdminDept && departmentData) {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
    
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom component="h1" sx={{ fontWeight: 600, mb: 3 }}>
          Tableau de Bord Administrateur
        </Typography>

        {/* Department stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Total Employees */}
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 2,
                boxShadow: theme.shadows[3],
                bgcolor: 'primary.light',
                color: 'primary.contrastText'
              }}
            >
              <CardContent sx={{ flexGrow: 1, py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, mr: 1 }}>
                    <GroupIcon />
                  </Avatar>
                  <Typography variant="subtitle1" component="h3">
                    Employés
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {departmentStats.totalEmployees}
                </Typography>
                <Typography variant="body2">
                  Total des employés
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Present employees */}
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 2,
                boxShadow: theme.shadows[3],
                bgcolor: 'success.light',
                color: 'success.contrastText'
              }}
            >
              <CardContent sx={{ flexGrow: 1, py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40, mr: 1 }}>
                    <CheckIcon />
                  </Avatar>
                  <Typography variant="subtitle1" component="h3">
                    Présents
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {departmentStats.present}
                </Typography>
                <Typography variant="body2">
                  Employés présents aujourd'hui
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Late employees */}
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 2,
                boxShadow: theme.shadows[3],
                bgcolor: 'warning.light',
                color: 'warning.contrastText'
              }}
            >
              <CardContent sx={{ flexGrow: 1, py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', width: 40, height: 40, mr: 1 }}>
                    <ClockIcon />
                  </Avatar>
                  <Typography variant="subtitle1" component="h3">
                    En retard
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {departmentStats.late}
                </Typography>
                <Typography variant="body2">
                  Employés en retard aujourd'hui
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Pending leaves */}
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderRadius: 2,
                boxShadow: theme.shadows[3],
                bgcolor: 'info.light',
                color: 'info.contrastText'
              }}
            >
              <CardContent sx={{ flexGrow: 1, py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'info.main', width: 40, height: 40, mr: 1 }}>
                    <AssignmentIcon />
                  </Avatar>
                  <Typography variant="subtitle1" component="h3">
                    Congés
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {departmentStats.pendingLeaves}
                </Typography>
                <Typography variant="body2">
                  Demandes de congés en attente
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          {/* Attendance Chart */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[3] }}>
              <CardHeader 
                title="Présence Aujourd'hui" 
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                sx={{ bgcolor: theme.palette.background.default }}
              />
              <Divider />
              <CardContent sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentStats.attendanceDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {departmentStats.attendanceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Project Distribution Chart */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[3] }}>
              <CardHeader 
                title="Employés par Projet" 
                titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                sx={{ bgcolor: theme.palette.background.default }}
              />
              <Divider />
              <CardContent sx={{ height: 300 }}>
                {departmentStats.projectDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={departmentStats.projectDistribution}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <RechartsTooltip />
                      <Bar dataKey="value" name="Nombre d'employés" fill="#8884d8">
                        {departmentStats.projectDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body1" color="text.secondary">
                      Aucune donnée de projet disponible
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to={`/departments/detail/${departmentId}`}
            sx={{ mx: 1 }}
          >
            Voir Détails du Département
          </Button>
          <Button
            variant="outlined"
            color="primary"
            component={Link}
            to="/attendance/today"
            sx={{ mx: 1 }}
          >
            Gestion des Pointages
          </Button>
        </Box>
      </Container>
    );
  }

  // For regular employees and Chef users, render the standard employee dashboard
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1" sx={{ fontWeight: 600, mb: 3 }}>
        Tableau de Bord Personnel
      </Typography>

      {/* Today's Status */}
      <Card sx={{ mb: 4, borderRadius: 2, boxShadow: theme.shadows[3] }}>
        <CardHeader 
          title="Statut du Jour" 
          titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
          avatar={<Avatar sx={{ bgcolor: theme.palette.primary.main }}><CalendarIcon /></Avatar>}
          sx={{ bgcolor: theme.palette.background.default }}
        />
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ mr: 2 }}>
                  <Typography variant="h5" component="div">{moment().format('dddd, D MMMM YYYY')}</Typography>
                  <Typography variant="body2" color="text.secondary">Aujourd'hui</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
                <Typography variant="body1" sx={{ mr: 2 }}>Statut:</Typography>
                {getStatusChip(dashboardData?.todayStatus || 'pending')}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: theme.palette.background.default, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Résumé</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Cette semaine</Typography>
                  <Typography variant="body2" fontWeight={500}>{dashboardData?.attendanceStats.present || 0}/{dashboardData?.attendanceStats.present + dashboardData?.attendanceStats.absent || 0} jours</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">A l'heure</Typography>
                  <Typography variant="body2" fontWeight={500}>{dashboardData?.attendanceStats.onTime || 0} jours</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">En retard</Typography>
                  <Typography variant="body2" fontWeight={500}>{dashboardData?.attendanceStats.late || 0} jours</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        {/* Recent Attendance */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 2, height: '100%', boxShadow: theme.shadows[3] }}>
            <CardHeader 
              title="Pointages Récents" 
              titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
              avatar={<Avatar sx={{ bgcolor: theme.palette.primary.main }}><ClockIcon /></Avatar>}
              sx={{ bgcolor: theme.palette.background.default }}
            />
            <Divider />
            <List sx={{ p: 0 }}>
              {dashboardData?.recentAttendance?.map((record) => (
                <React.Fragment key={record.id}>
                  <ListItem sx={{ py: 2 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="body1">
                            {moment(record.date).format('dddd, D MMMM')}
                          </Typography>
                          {getStatusChip(record.status)}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', mt: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 3 }}>
                            Arrivée: <Box component="span" fontWeight={600}>{record.checkIn}</Box>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Départ: <Box component="span" fontWeight={600}>{record.checkOut || '—'}</Box>
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Button 
                component={Link}
                to="/employee/attendance" 
                color="primary"
                endIcon={<TrendingUpIcon />}
                sx={{ textTransform: 'none' }}
              >
                Voir l'historique complet
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Upcoming Leaves */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 2, height: '100%', boxShadow: theme.shadows[3] }}>
            <CardHeader 
              title="Congés à venir" 
              titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
              avatar={<Avatar sx={{ bgcolor: theme.palette.primary.main }}><CalendarIcon /></Avatar>}
              sx={{ bgcolor: theme.palette.background.default }}
            />
            <Divider />
            {dashboardData?.upcomingLeaves?.length > 0 ? (
              <List>
                {dashboardData.upcomingLeaves.map((leave) => (
                  <ListItem key={leave.id} sx={{ py: 2 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        <CalendarIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1">{leave.type}</Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            Du {moment(leave.startDate).format('D MMM YYYY')} au {moment(leave.endDate).format('D MMM YYYY')}
                          </Typography>
                          <Chip 
                            label={leave.status === 'approved' ? 'Approuvé' : leave.status === 'pending' ? 'En attente' : 'Refusé'} 
                            color={leave.status === 'approved' ? 'success' : leave.status === 'pending' ? 'warning' : 'error'}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Aucun congé prévu prochainement.
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary"
                  size="small"
                  component={Link}
                  to="/employee/leaves/new"
                >
                  Demander un congé
                </Button>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EmployeeDashboard; 