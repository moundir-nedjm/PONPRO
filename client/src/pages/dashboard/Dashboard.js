import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Paper,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  EventNote as EventNoteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Engineering as EngineeringIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import apiClient from '../../utils/api';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const { currentUser, PROJECTS } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    pendingLeaves: 0,
    projects: [],
    recentAttendance: [],
    recentLeaves: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get deleted employee IDs from localStorage
        const storedDeletedIds = localStorage.getItem('pointgee_deleted_employees');
        const deletedIds = storedDeletedIds ? JSON.parse(storedDeletedIds) : [];
        
        // Fetch departments from the API - different approach for chef vs admin
        let departments = [];
        try {
          // For chef de projet, only get their departments
          if (currentUser && currentUser.role === 'chef' && currentUser.projects) {
            // Get only the departments that the chef is responsible for
            const chefDepartments = currentUser.projects.join(',');
            const response = await apiClient.get(`/departments?names=${chefDepartments}`);
            if (response.data.success) {
              departments = response.data.data.map(dept => ({
                name: dept.name,
                description: dept.description,
                employeeCount: dept.employeeCount || 0,
                active: dept.active
              }));
              console.log('Fetched chef departments:', departments);
            }
          } else {
            // For admin, get all departments
            const response = await apiClient.get('/departments');
            if (response.data.success) {
              departments = response.data.data.map(dept => ({
                name: dept.name,
                description: dept.description,
                employeeCount: dept.employeeCount || 0,
                active: dept.active
              }));
              console.log('Fetched all departments:', departments);
            }
          }
        } catch (err) {
          console.error('Error fetching departments from API:', err);
          // Fallback to demo data if API fails
          departments = [
            { name: 'KBK FROID', employeeCount: 12 },
            { name: 'KBK ELEC', employeeCount: 10 },
            { name: 'HML', employeeCount: 8 },
            { name: 'REB', employeeCount: 7 },
            { name: 'DEG', employeeCount: 9 },
            { name: 'HAMRA', employeeCount: 5 },
            { name: 'ADM SETIF', employeeCount: 6 },
            { name: 'ADM HMD', employeeCount: 7 }
          ];
          
          // If chef de projet, filter demo data too
          if (currentUser && currentUser.role === 'chef' && currentUser.projects) {
            departments = departments.filter(dept => 
              currentUser.projects.includes(dept.name)
            );
          }
        }
        
        // If no departments with employeeCount, generate default counts
        if (departments.length > 0 && departments.every(d => d.employeeCount === 0)) {
          const defaultCount = Math.floor(64 / departments.length);
          departments = departments.map(dept => ({
            ...dept,
            employeeCount: defaultCount
          }));
        }
        
        // Calculate total from projects
        const allEmployees = departments.reduce((sum, project) => sum + project.employeeCount, 0);
        
        // Scale attendance numbers based on employee count
        const attendanceRatio = allEmployees / 64; // Original demo had 64 employees
        const allPresent = Math.round(48 * attendanceRatio);
        const allAbsent = Math.round(10 * attendanceRatio);
        const allLate = Math.round(6 * attendanceRatio);
        
        // For chef de projet, we've already filtered departments,
        // so we don't need additional filtering here
        let filteredProjects = departments;
        let totalEmployees = allEmployees;
        let presentToday = allPresent;
        let absentToday = allAbsent;
        let lateToday = allLate;
        
        // Mock data for recent attendance
        const recentAttendance = [
          { id: 1, employeeName: 'Ahmed Benali', time: '08:45', status: 'present', project: 'KBK FROID' },
          { id: 2, employeeName: 'Fatima Zahra', time: '09:10', status: 'late', project: 'KBK ELEC' },
          { id: 3, employeeName: 'Mohammed Kaci', time: '08:30', status: 'present', project: 'HML' },
          { id: 4, employeeName: 'Amina Hadj', time: '08:55', status: 'present', project: 'REB' },
          { id: 5, employeeName: 'Karim Boudiaf', time: '09:20', status: 'late', project: 'DEG' }
        ];
        
        // Filter recent attendance by deleted employees
        const filteredAttendance = recentAttendance.filter((record, index) => 
          !deletedIds.includes(String(index + 1))
        );
        
        // Filter attendance by project if user is a team leader
        let userFilteredAttendance = filteredAttendance;
        if (currentUser && currentUser.role === 'chef' && currentUser.projects) {
          userFilteredAttendance = filteredAttendance.filter(record => 
            currentUser.projects.includes(record.project)
          );
        }
        
        // Mock data for leaves
        const recentLeaves = [
          { id: 1, employeeName: 'Samira Taleb', type: 'sick', status: 'pending', days: 2, project: 'HAMRA' },
          { id: 2, employeeName: 'Youcef Belmadi', type: 'annual', status: 'approved', days: 5, project: 'KBK FROID' },
          { id: 3, employeeName: 'Nawal Benkhalfa', type: 'unpaid', status: 'pending', days: 1, project: 'KBK ELEC' },
          { id: 4, employeeName: 'Amine Gherbi', type: 'sick', status: 'pending', days: 3, project: 'ADM SETIF' },
          { id: 5, employeeName: 'Leila Madani', type: 'annual', status: 'pending', days: 4, project: 'ADM HMD' }
        ];
        
        // Filter leaves by project if user is a team leader
        let filteredLeaves = recentLeaves;
        if (currentUser && currentUser.role === 'chef' && currentUser.projects) {
          filteredLeaves = recentLeaves.filter(leave => 
            currentUser.projects.includes(leave.project)
          );
        }
        
        // Update dashboard data
        setDashboardData({
          totalEmployees,
          presentToday,
          absentToday,
          lateToday,
          pendingLeaves: currentUser && currentUser.role === 'chef' ? 
            filteredLeaves.filter(l => l.status === 'pending').length : 3,
          projects: filteredProjects,
          recentAttendance: userFilteredAttendance,
          recentLeaves: filteredLeaves
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des données du tableau de bord:', err);
        setError('Erreur lors du chargement des données du tableau de bord');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  // Préparer les données des graphiques
  const attendanceChartData = {
    labels: ['Présent', 'En retard', 'Absent'],
    datasets: [
      {
        data: [dashboardData.presentToday, dashboardData.lateToday, dashboardData.absentToday],
        backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
        borderColor: ['#388e3c', '#f57c00', '#d32f2f'],
        borderWidth: 1,
      },
    ],
  };

  const projectChartData = {
    labels: dashboardData.projects.map(proj => proj.name),
    datasets: [
      {
        label: 'Nombre d\'employés',
        data: dashboardData.projects.map(proj => proj.employeeCount),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Check if user is not authenticated
  if (!currentUser) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Veuillez vous connecter pour accéder au tableau de bord.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {currentUser.role === 'chef' && currentUser.projects
            ? `Tableau de Bord - ${currentUser.projects.join(', ')}` 
            : 'Tableau de Bord'}
        </Typography>
        <Box>
          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager') && (
            <Button
              component={Link}
              to="/employees/new"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ mr: 2 }}
            >
              Nouvel Employé
            </Button>
          )}
          <Button
            component={Link}
            to="/attendance/today"
            variant="contained"
            color="secondary"
            startIcon={<AccessTimeIcon />}
          >
            Pointage
          </Button>
        </Box>
      </Box>

      {/* Cartes statistiques */}
      <Grid container spacing={3} className="dashboard-stats">
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PeopleIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Employés
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {dashboardData.totalEmployees}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentUser.role === 'chef' && currentUser.projects
                  ? `Total des employés de ${currentUser.projects.join(', ')}` 
                  : 'Total des employés'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <CheckCircleIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Présents
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {dashboardData.presentToday}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Employés présents aujourd'hui
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <AccessTimeIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  En retard
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {dashboardData.lateToday}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Employés en retard aujourd'hui
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                  <EventNoteIcon />
                </Avatar>
                <Typography variant="h6" component="div">
                  Congés
                </Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {dashboardData.pendingLeaves}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Demandes de congés en attente
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Graphiques et listes */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title={
                <Typography variant="h6">
                  {currentUser.role === 'chef' && currentUser.projects
                    ? `Présence - ${currentUser.projects.join(', ')}` 
                    : 'Présence Aujourd\'hui'}
                </Typography>
              }
            />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Pie data={attendanceChartData} options={{ maintainAspectRatio: false }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title={
                <Typography variant="h6">
                  {currentUser.role === 'chef' && currentUser.projects
                    ? `Employés par Projet - ${currentUser.projects.join(', ')}` 
                    : 'Employés par Projet'}
                </Typography>
              }
            />
            <Divider />
            <CardContent>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Bar 
                  data={projectChartData} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title={
                <Typography variant="h6">
                  Pointages Récents
                </Typography>
              }
            />
            <Divider />
            <CardContent>
              <List>
                {dashboardData.recentAttendance.map((record) => (
                  <Paper key={record.id} sx={{ mb: 1, p: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: record.status === 'present' ? 'success.main' : 'warning.main',
                            width: 36,
                            height: 36,
                            mr: 2
                          }}
                        >
                          {record.employeeName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {record.employeeName}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Chip 
                              label={record.project} 
                              size="small" 
                              sx={{ mr: 1, fontSize: '0.7rem' }} 
                              color="primary"
                              variant="outlined"
                            />
                            <Typography variant="caption" color="text.secondary">
                              {record.time}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Chip 
                        label={record.status === 'present' ? 'Présent' : 'En retard'} 
                        color={record.status === 'present' ? 'success' : 'warning'} 
                        size="small"
                      />
                    </Box>
                  </Paper>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title={
                <Typography variant="h6">
                  Projets
                </Typography>
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                {dashboardData.projects.map((project) => (
                  <Grid item xs={12} sm={6} key={project.name}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        display: 'flex', 
                        flexDirection: 'column',
                        height: '100%',
                        '&:hover': { boxShadow: 3 }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          <EngineeringIcon />
                        </Avatar>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {project.name}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <PeopleIcon sx={{ color: 'text.secondary', mr: 1, fontSize: '1rem' }} />
                        <Typography variant="body2" color="text.secondary">
                          {project.employeeCount} employés
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 