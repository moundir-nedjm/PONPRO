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
        
        // In a real application, you would fetch this data from your API
        // For demo purposes, we'll use mock data
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for all projects
        const allProjects = [
          { name: 'KBK FROID', employeeCount: 12 },
          { name: 'KBK ELEC', employeeCount: 10 },
          { name: 'HML', employeeCount: 8 },
          { name: 'REB', employeeCount: 7 },
          { name: 'DEG', employeeCount: 9 },
          { name: 'HAMRA', employeeCount: 5 },
          { name: 'ADM SETIF', employeeCount: 6 },
          { name: 'ADM HMD', employeeCount: 7 }
        ];
        
        // Check if we have deleted employees and adjust the counts accordingly
        const deletedCount = deletedIds.length;
        
        // We have 5 mock employees in the system (from EmployeeList)
        const baseEmployeeCount = 5;
        const remainingEmployees = Math.max(0, baseEmployeeCount - deletedCount);
        
        // Adjust all project employee counts proportionally
        if (deletedCount > 0) {
          const reductionFactor = remainingEmployees / baseEmployeeCount;
          allProjects.forEach(project => {
            project.employeeCount = Math.max(0, Math.floor(project.employeeCount * reductionFactor));
          });
        }

        // Calculate total from projects
        const allEmployees = allProjects.reduce((sum, project) => sum + project.employeeCount, 0);
        
        // Scale attendance numbers based on employee count
        const attendanceRatio = allEmployees / 64; // Original demo had 64 employees
        const allPresent = Math.round(48 * attendanceRatio);
        const allAbsent = Math.round(10 * attendanceRatio);
        const allLate = Math.round(6 * attendanceRatio);
        
        // Filter data based on user role
        let filteredProjects = allProjects;
        let totalEmployees = allEmployees;
        let presentToday = allPresent;
        let absentToday = allAbsent;
        let lateToday = allLate;
        
        // If user is a team leader, filter data for their project
        if (currentUser && currentUser.role === 'chef' && currentUser.projects) {
          filteredProjects = allProjects.filter(project => 
            currentUser.projects.includes(project.name)
          );
          
          // Calculate totals for filtered projects
          totalEmployees = filteredProjects.reduce((sum, project) => sum + project.employeeCount, 0);
          
          // Calculate proportionally the attendance for filtered projects
          const ratio = totalEmployees / allEmployees;
          presentToday = Math.round(allPresent * ratio);
          absentToday = Math.round(allAbsent * ratio);
          lateToday = Math.round(allLate * ratio);
        }
        
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
          {currentUser.role === 'chef' 
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
                {currentUser.role === 'chef' 
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
                  {currentUser.role === 'chef' 
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
                  {currentUser.role === 'chef' 
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