import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import apiClient from '../../utils/api';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';
import {
  Business as BusinessIcon,
  Group as GroupIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Event as EventIcon,
  Search as SearchIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { useAuth } from '../../context/AuthContext';

const DepartmentDetail = ({ departmentId, isEmbedded }) => {
  // Get the ID from props if provided, otherwise from URL params
  const { id: urlId } = useParams();
  const id = departmentId || urlId;
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    positionDistribution: [],
    attendanceStats: {
      present: 0,
      late: 0,
      absent: 0,
      onLeave: 0
    },
    genderDistribution: {
      male: 0,
      female: 0,
      other: 0
    },
    averageSalary: 0,
    averageAge: 0,
    seniorityDistribution: []
  });

  // Get auth context at component level
  const { currentUser } = useAuth();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  useEffect(() => {
    fetchDepartmentData();
  }, [id]);

  const fetchDepartmentData = async () => {
    try {
      setLoading(true);
      console.log('Fetching department data for ID:', id); // Debug log
      
      // Use the currentUser from component scope instead of fetching it inside the function
      console.log('Current user:', currentUser); // Debug log
      
      // Use our centralized API client
      const res = await apiClient.get(`/departments/${id}`);
      console.log('Department API response:', res); // Debug log
      
      // Check if a chef d'equipe is trying to access a department they're not responsible for
      if (currentUser?.role === 'chef' && currentUser?.projects) {
        const departmentData = res.data.data;
        const userDepartments = currentUser.projects;
        
        // Verify this department is in the chef's projects
        if (!userDepartments.includes(departmentData.name)) {
          console.error('Chef d\'équipe attempted to access unauthorized department');
          setError('Vous n\'avez pas accès à ce département.');
          setLoading(false);
          return;
        }
      }
      
      setDepartment(res.data.data);
      
      // Fetch employees in this department
      const empRes = await apiClient.get(`/employees?department=${id}`);
      console.log('Employees API response:', empRes); // Debug log
      const employeesData = empRes.data.data || [];
      setEmployees(employeesData);
      
      // Calculate statistics
      calculateStats(employeesData);
      
      setError(null);
    } catch (err) {
      console.error('Error loading department details:', err);
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);
        
        if (err.response.status === 404) {
          setError('Le département demandé n\'existe pas.');
        } else {
          setError(`Impossible de charger les détails du département. ${err.response?.data?.message || 'Veuillez réessayer plus tard.'}`);
        }
      } else if (err.request) {
        console.error('No response received from server');
        setError('Aucune réponse du serveur. Veuillez vérifier votre connexion Internet.');
      } else {
        setError('Impossible de charger les détails du département. Veuillez réessayer plus tard.');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (employeesData) => {
    // Position distribution
    const positions = {};
    employeesData.forEach(emp => {
      const position = emp.position || 'Non spécifié';
      positions[position] = (positions[position] || 0) + 1;
    });
    
    const positionDistribution = Object.entries(positions).map(([name, value]) => ({
      name,
      value
    }));
    
    // Gender distribution
    const genderDistribution = {
      male: employeesData.filter(emp => emp.gender === 'male').length,
      female: employeesData.filter(emp => emp.gender === 'female').length,
      other: employeesData.filter(emp => emp.gender && emp.gender !== 'male' && emp.gender !== 'female').length
    };
    
    // Seniority distribution
    const currentYear = new Date().getFullYear();
    const seniorityGroups = {
      'Moins de 1 an': 0,
      '1-2 ans': 0,
      '3-5 ans': 0,
      '6-10 ans': 0,
      'Plus de 10 ans': 0
    };
    
    employeesData.forEach(emp => {
      if (!emp.hireDate) return;
      
      const hireYear = new Date(emp.hireDate).getFullYear();
      const yearsOfService = currentYear - hireYear;
      
      if (yearsOfService < 1) seniorityGroups['Moins de 1 an']++;
      else if (yearsOfService <= 2) seniorityGroups['1-2 ans']++;
      else if (yearsOfService <= 5) seniorityGroups['3-5 ans']++;
      else if (yearsOfService <= 10) seniorityGroups['6-10 ans']++;
      else seniorityGroups['Plus de 10 ans']++;
    });
    
    const seniorityDistribution = Object.entries(seniorityGroups).map(([name, value]) => ({
      name,
      value
    }));
    
    // Average salary
    const totalSalary = employeesData.reduce((sum, emp) => sum + (emp.salary || 0), 0);
    const averageSalary = employeesData.length > 0 ? Math.round(totalSalary / employeesData.length) : 0;
    
    // Average age
    const totalAge = employeesData.reduce((sum, emp) => {
      if (!emp.birthDate) return sum;
      const birthYear = new Date(emp.birthDate).getFullYear();
      return sum + (currentYear - birthYear);
    }, 0);
    const averageAge = employeesData.length > 0 ? Math.round(totalAge / employeesData.length) : 0;
    
    // Get real attendance data instead of mock
    let attendanceStats = {
      present: 0,
      late: 0,
      absent: 0,
      onLeave: 0
    };
    
    // Try to fetch real attendance data
    const fetchAttendanceStats = async () => {
      try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        const employeeIds = employeesData.map(emp => emp._id).join(',');
        
        if (employeeIds.length > 0) {
          const response = await apiClient.get(`/attendance?date=${today}&employees=${employeeIds}`);
          
          if (response.data.success && response.data.data.length > 0) {
            const attendanceData = response.data.data;
            
            // Count different attendance statuses
            attendanceStats = {
              present: attendanceData.filter(a => a.status === 'present').length,
              late: attendanceData.filter(a => a.status === 'late').length,
              absent: attendanceData.filter(a => a.status === 'absent').length,
              onLeave: attendanceData.filter(a => a.status === 'on_leave').length
            };
            
            // Set stats with the new attendance data
            setStats({
              positionDistribution,
              genderDistribution,
              seniorityDistribution,
              averageSalary,
              averageAge,
              attendanceStats
            });
            
            return true;
          }
        }
        return false;
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        return false;
      }
    };
    
    // Start fetch but don't wait for it
    fetchAttendanceStats().then(success => {
      if (!success) {
        // If real data fetch failed, use mock data (only in development)
        if (process.env.NODE_ENV === 'development') {
          console.log('Using mock attendance data');
          attendanceStats = {
            present: Math.floor(Math.random() * employeesData.length),
            late: Math.floor(Math.random() * 5),
            absent: Math.floor(Math.random() * 3),
            onLeave: Math.floor(Math.random() * 2)
          };
        }
        
        // Set stats with mock or empty attendance data
        setStats({
          positionDistribution,
          genderDistribution,
          seniorityDistribution,
          averageSalary,
          averageAge,
          attendanceStats
        });
      }
    });
    
    // Set initial stats without waiting for attendance data
    setStats({
      positionDistribution,
      genderDistribution,
      seniorityDistribution,
      averageSalary,
      averageAge,
      attendanceStats: {
        present: 0,
        late: 0,
        absent: 0,
        onLeave: 0
      }
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await apiClient.delete(`/departments/${id}`);
      setDeleteDialogOpen(false);
      navigate('/departments');
    } catch (err) {
      console.error('Erreur lors de la suppression du département:', err);
      setError('Impossible de supprimer le département. Veuillez réessayer plus tard.');
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const exportEmployeesToCsv = () => {
    const headers = ['Nom', 'Prénom', 'Email', 'Téléphone', 'Poste', 'Date d\'embauche'];
    const data = employees.map(emp => [
      emp.lastName,
      emp.firstName,
      emp.email,
      emp.phone,
      emp.position,
      emp.hireDate ? new Date(emp.hireDate).toLocaleDateString() : 'N/A'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `employes_${department.name}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

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

  if (!department) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Département non trouvé.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Only show Back button and action buttons if not embedded */}
      {!isEmbedded && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          mb: { xs: 2, sm: 3 },
          gap: { xs: 1, sm: 0 }
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: { xs: 1, sm: 0 }
          }}>
            <Button
              component={Link}
              to="/departments"
              startIcon={<ArrowBackIcon />}
              sx={{ mr: { xs: 0, sm: 2 }, mb: { xs: 1, sm: 0 }, fontSize: isMobile ? '0.8rem' : 'inherit' }}
              size={isMobile ? "small" : "medium"}
            >
              Retour aux Départements
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant={isMobile ? "h5" : "h4"} component="h1" sx={{ mr: 1 }}>
                {department.name}
              </Typography>
              <Chip
                label={department.active ? 'Actif' : 'Inactif'}
                color={department.active ? 'success' : 'default'}
                size="small"
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Button
              onClick={fetchDepartmentData}
              startIcon={<RefreshIcon />}
              size={isMobile ? "small" : "medium"}
            >
              Actualiser
            </Button>
            <Button
              component={Link}
              to={`/departments/edit/${id}`}
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              size={isMobile ? "small" : "medium"}
            >
              Modifier
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
              size={isMobile ? "small" : "medium"}
            >
              Supprimer
            </Button>
          </Box>
        </Box>
      )}
      
      {/* Department header - shown in both modes, but styled differently when embedded */}
      {isEmbedded ? (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <BusinessIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1">
                {department.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <Chip
                  label={department.active ? 'Actif' : 'Inactif'}
                  color={department.active ? 'success' : 'default'}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {department.description}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Button
            onClick={fetchDepartmentData}
            startIcon={<RefreshIcon />}
            size={isMobile ? "small" : "medium"}
          >
            Actualiser
          </Button>
        </Box>
      ) : null}

      <Grid container spacing={2} sx={{ mb: { xs: 2, sm: 3 } }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader 
              avatar={
                <Avatar sx={{ bgcolor: 'primary.main', width: isMobile ? 32 : 40, height: isMobile ? 32 : 40 }}>
                  <BusinessIcon fontSize={isMobile ? "small" : "medium"} />
                </Avatar>
              }
              title="Informations du Département"
              titleTypographyProps={{ variant: isMobile ? 'subtitle1' : 'h6' }}
            />
            <Divider />
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: isMobile ? '0.9rem' : 'inherit' }}>
                {department.description || 'Aucune description fournie.'}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Statut
                  </Typography>
                  <Chip
                    label={department.active ? 'Actif' : 'Inactif'}
                    color={department.active ? 'success' : 'default'}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Employés
                  </Typography>
                  <Chip
                    icon={<GroupIcon fontSize="small" />}
                    label={employees.length}
                    color="primary"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Créé le
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: isMobile ? '0.9rem' : 'inherit' }}>
                    {new Date(department.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Typography>
                </Grid>
                {department.updatedAt && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Dernière mise à jour
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: isMobile ? '0.9rem' : 'inherit' }}>
                      {new Date(department.updatedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader 
              avatar={
                <Avatar sx={{ bgcolor: 'primary.main', width: isMobile ? 32 : 40, height: isMobile ? 32 : 40 }}>
                  <BarChartIcon fontSize={isMobile ? "small" : "medium"} />
                </Avatar>
              }
              title="Statistiques du Département"
              titleTypographyProps={{ variant: isMobile ? 'subtitle1' : 'h6' }}
              action={
                <Tooltip title="Imprimer">
                  <IconButton onClick={() => window.print()} size={isMobile ? "small" : "medium"}>
                    <PrintIcon fontSize={isMobile ? "small" : "medium"} />
                  </IconButton>
                </Tooltip>
              }
            />
            <Divider />
            <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography variant={isMobile ? "h5" : "h4"} color="primary.main">
                      {employees.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Employés
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography variant={isMobile ? "h5" : "h4"} color="primary.main">
                      {stats.averageAge || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Âge moyen
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography variant={isMobile ? "h5" : "h4"} color="primary.main">
                      {stats.averageSalary ? `${stats.averageSalary.toLocaleString()} DA` : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Salaire moyen
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <Typography variant={isMobile ? "h5" : "h4"} color="success.main">
                      {stats.attendanceStats.present}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Présents aujourd'hui
                    </Typography>
                  </Box>
                </Grid>
                
                {stats.positionDistribution.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom align="center" sx={{ mt: 1 }}>
                      Distribution des Postes
                    </Typography>
                    <Box sx={{ height: isMobile ? 200 : 250 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.positionDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => isMobile ? `${(percent * 100).toFixed(0)}%` : `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={isMobile ? 60 : 80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {stats.positionDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                          {!isMobile && <Legend />}
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </Grid>
                )}
                
                {stats.seniorityDistribution.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom align="center" sx={{ mt: 1 }}>
                      Ancienneté des Employés
                    </Typography>
                    <Box sx={{ height: isMobile ? 200 : 250 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={stats.seniorityDistribution}
                          margin={{ 
                            top: 20, 
                            right: isMobile ? 10 : 30, 
                            left: isMobile ? 10 : 20, 
                            bottom: 5 
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" fontSize={isMobile ? 10 : 12} />
                          <YAxis fontSize={isMobile ? 10 : 12} />
                          <RechartsTooltip />
                          <Bar dataKey="value" name="Employés" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab icon={<GroupIcon fontSize={isMobile ? "small" : "medium"} />} label="Employés" />
          <Tab icon={<BarChartIcon fontSize={isMobile ? "small" : "medium"} />} label="Statistiques" />
        </Tabs>
        
        {tabValue === 0 && (
          <Box sx={{ p: { xs: 1, sm: 2 } }}>
            <Box sx={{ 
              mb: 2, 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 1
            }}>
              <TextField
                placeholder="Rechercher des employés..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{ width: { xs: '100%', sm: '50%' } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={exportEmployeesToCsv}
                  size={isMobile ? "small" : "medium"}
                >
                  Exporter
                </Button>
                <Button
                  component={Link}
                  to="/employees/new"
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  size={isMobile ? "small" : "medium"}
                >
                  Ajouter un Employé
                </Button>
              </Box>
            </Box>
            
            {employees.length > 0 ? (
              isMobile ? (
                // Mobile card view for employees
                <Box>
                  {filteredEmployees.map((employee) => (
                    <Card key={employee._id} sx={{ mb: 2 }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                          <Avatar sx={{ mr: 1.5 }}>
                            <PersonIcon fontSize="small" />
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {`${employee.firstName} ${employee.lastName}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {employee._id}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Stack spacing={1} sx={{ mb: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" noWrap sx={{ maxWidth: '100%' }}>
                              {employee.email}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {employee.phone || 'N/A'}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <WorkIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {employee.position || 'Non spécifié'}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {employee.hireDate 
                                ? new Date(employee.hireDate).toLocaleDateString('fr-FR')
                                : 'Non spécifié'
                              }
                            </Typography>
                          </Box>
                        </Stack>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <IconButton
                            component={Link}
                            to={`/employees/${employee._id}`}
                            color="primary"
                            size="small"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            component={Link}
                            to={`/employees/edit/${employee._id}`}
                            color="primary"
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                // Table view for tablet/desktop
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employé</TableCell>
                        {!isTablet && <TableCell>Email</TableCell>}
                        {!isTablet && <TableCell>Téléphone</TableCell>}
                        <TableCell>Poste</TableCell>
                        <TableCell>Date d'embauche</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredEmployees.map((employee) => (
                        <TableRow key={employee._id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ mr: 2 }}>
                                <PersonIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="body1" fontWeight="medium">
                                  {`${employee.firstName} ${employee.lastName}`}
                                </Typography>
                                {isTablet && (
                                  <>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      {employee.email}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {employee.phone || 'N/A'}
                                    </Typography>
                                  </>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          {!isTablet && (
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                {employee.email}
                              </Box>
                            </TableCell>
                          )}
                          {!isTablet && (
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                                {employee.phone || 'N/A'}
                              </Box>
                            </TableCell>
                          )}
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <WorkIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              {employee.position || 'Non spécifié'}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              {employee.hireDate 
                                ? new Date(employee.hireDate).toLocaleDateString('fr-FR')
                                : 'Non spécifié'
                              }
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Voir">
                              <IconButton
                                component={Link}
                                to={`/employees/${employee._id}`}
                                color="primary"
                                size="small"
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Modifier">
                              <IconButton
                                component={Link}
                                to={`/employees/edit/${employee._id}`}
                                color="primary"
                                size="small"
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                Aucun employé dans ce département.
              </Typography>
            )}
          </Box>
        )}
        
        {tabValue === 1 && (
          <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="Distribution par Genre" 
                    titleTypographyProps={{ variant: isMobile ? 'subtitle1' : 'h6' }}
                  />
                  <Divider />
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Box sx={{ height: isMobile ? 250 : 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Hommes', value: stats.genderDistribution.male },
                              { name: 'Femmes', value: stats.genderDistribution.female },
                              { name: 'Autre', value: stats.genderDistribution.other }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => isMobile ? `${(percent * 100).toFixed(0)}%` : `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={isMobile ? 60 : 80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            <Cell fill="#1e88e5" />
                            <Cell fill="#e91e63" />
                            <Cell fill="#9c27b0" />
                          </Pie>
                          <RechartsTooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader 
                    title="Présence Aujourd'hui" 
                    titleTypographyProps={{ variant: isMobile ? 'subtitle1' : 'h6' }}
                  />
                  <Divider />
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Box sx={{ height: isMobile ? 250 : 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Présent', value: stats.attendanceStats.present },
                              { name: 'En retard', value: stats.attendanceStats.late },
                              { name: 'Absent', value: stats.attendanceStats.absent },
                              { name: 'En congé', value: stats.attendanceStats.onLeave }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => isMobile ? `${(percent * 100).toFixed(0)}%` : `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={isMobile ? 60 : 80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            <Cell fill="#4caf50" />
                            <Cell fill="#ff9800" />
                            <Cell fill="#f44336" />
                            <Cell fill="#9c27b0" />
                          </Pie>
                          <RechartsTooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Supprimer le Département</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer le département "{department.name}"? Cette action ne peut pas être annulée.
            {employees.length > 0 && (
              <Box component="span" sx={{ display: 'block', mt: 1, color: 'error.main' }}>
                Attention: Ce département contient {employees.length} employé(s). La suppression peut affecter ces employés.
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Annuler</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentDetail; 