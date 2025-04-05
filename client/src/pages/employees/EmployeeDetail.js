import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  Event as EventIcon,
  Home as HomeIcon,
  Badge as BadgeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  AccessTime as AccessTimeIcon,
  EventNote as EventNoteIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

// TabPanel component for tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`employee-tabpanel-${index}`}
      aria-labelledby={`employee-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const EmployeeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        
        // Dans une application réelle, vous récupéreriez ces données depuis votre API
        // Pour l'instant, nous utiliserons des données fictives
        
        // Simuler un délai d'appel API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Données fictives d'employé
        const mockEmployee = {
          id: '1',
          firstName: 'Ahmed',
          lastName: 'Benali',
          employeeId: 'EMP001',
          email: 'ahmed.benali@example.com',
          phone: '+213 555 123 456',
          position: 'Développeur Senior',
          department: { id: '1', name: 'Informatique' },
          hireDate: '2020-05-15',
          birthDate: '1988-10-20',
          gender: 'male',
          nationalId: '88102012345',
          address: {
            street: '15 Rue des Oliviers',
            city: 'Alger',
            wilaya: 'Alger',
            postalCode: '16000'
          },
          active: true
        };
        
        // Données fictives de pointage
        const mockAttendance = [
          { id: '1', date: '2023-09-01', checkIn: '08:45', checkOut: '17:30', status: 'present', workHours: 8.75 },
          { id: '2', date: '2023-09-02', checkIn: '08:30', checkOut: '17:15', status: 'present', workHours: 8.75 },
          { id: '3', date: '2023-09-03', checkIn: '09:10', checkOut: '17:45', status: 'late', workHours: 8.58 },
          { id: '4', date: '2023-09-04', checkIn: '08:50', checkOut: '17:20', status: 'present', workHours: 8.5 },
          { id: '5', date: '2023-09-05', checkIn: '08:40', checkOut: '18:00', status: 'present', workHours: 9.33 }
        ];
        
        // Données fictives de congés
        const mockLeaves = [
          { id: '1', startDate: '2023-07-10', endDate: '2023-07-14', type: 'annual', status: 'approved', days: 5 },
          { id: '2', startDate: '2023-08-25', endDate: '2023-08-25', type: 'sick', status: 'approved', days: 1 },
          { id: '3', startDate: '2023-10-02', endDate: '2023-10-03', type: 'unpaid', status: 'pending', days: 2 }
        ];
        
        setEmployee(mockEmployee);
        setAttendanceRecords(mockAttendance);
        setLeaveRecords(mockLeaves);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des données de l\'employé:', err);
        setError('Erreur lors du chargement des données de l\'employé');
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      // Dans une application réelle, vous appelleriez votre API pour supprimer l'employé
      // Pour l'instant, nous allons simplement naviguer vers la liste des employés
      
      setDeleteDialogOpen(false);
      navigate('/employees');
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'employé:', err);
      setError('Erreur lors de la suppression de l\'employé');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
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

  if (!employee) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Employé non trouvé</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          component={Link}
          to="/employees"
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Détails de l'Employé
        </Typography>
        {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
          <Box>
            <Button
              component={Link}
              to={`/employees/edit/${employee.id}`}
              variant="outlined"
              startIcon={<EditIcon />}
              sx={{ mr: 2 }}
            >
              Modifier
            </Button>
            <Button
              component={Link}
              to={`/employees/${employee.id}/schedule`}
              variant="outlined"
              color="primary"
              startIcon={<ScheduleIcon />}
              sx={{ mr: 2 }}
            >
              Détails de l'Employé
            </Button>
            {currentUser.role === 'admin' && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDeleteClick}
              >
                Supprimer
              </Button>
            )}
          </Box>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Employee Profile Card */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mb: 2,
                  bgcolor: employee.gender === 'male' ? 'primary.main' : 'secondary.main',
                  fontSize: '3rem'
                }}
              >
                {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
              </Avatar>
              <Typography variant="h5" component="h2" align="center">
                {employee.firstName} {employee.lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center">
                {employee.position}
              </Typography>
              <Chip
                label={employee.active ? 'Actif' : 'Inactif'}
                color={employee.active ? 'success' : 'default'}
                sx={{ mt: 1 }}
              />
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <BadgeIcon />
                </ListItemIcon>
                <ListItemText
                  primary="ID Employé"
                  secondary={employee.employeeId}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Email"
                  secondary={employee.email}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Téléphone"
                  secondary={employee.phone}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BusinessIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Département"
                  secondary={employee.department.name}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <WorkIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Date d'embauche"
                  secondary={new Date(employee.hireDate).toLocaleDateString('fr-FR')}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Tabs Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="employee tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Informations Personnelles" />
                <Tab label="Pointages" />
                <Tab label="Congés" />
              </Tabs>
            </Box>

            {/* Personal Information Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardHeader title="Informations Personnelles" />
                    <Divider />
                    <CardContent>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <PersonIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="Nom Complet"
                            secondary={`${employee.firstName} ${employee.lastName}`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <EventIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="Date de Naissance"
                            secondary={new Date(employee.birthDate).toLocaleDateString('fr-FR')}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <BadgeIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="Numéro d'Identité Nationale"
                            secondary={employee.nationalId}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <PersonIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="Genre"
                            secondary={employee.gender === 'male' ? 'Homme' : 'Femme'}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card>
                    <CardHeader title="Adresse" />
                    <Divider />
                    <CardContent>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <HomeIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="Rue"
                            secondary={employee.address.street}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <HomeIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="Ville"
                            secondary={employee.address.city}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <HomeIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="Wilaya"
                            secondary={employee.address.wilaya}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <HomeIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="Code Postal"
                            secondary={employee.address.postalCode}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Attendance Tab */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Historique des Pointages</Typography>
                <Button
                  component={Link}
                  to={`/employees/${employee.id}/attendance`}
                  variant="outlined"
                  size="small"
                >
                  Voir Tout
                </Button>
              </Box>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Arrivée</TableCell>
                      <TableCell>Départ</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell align="right">Heures Travaillées</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{new Date(record.date).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>{record.checkIn}</TableCell>
                        <TableCell>{record.checkOut}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              record.status === 'present' ? 'Présent' :
                              record.status === 'late' ? 'En retard' :
                              record.status === 'absent' ? 'Absent' : record.status
                            }
                            color={
                              record.status === 'present' ? 'success' :
                              record.status === 'late' ? 'warning' :
                              record.status === 'absent' ? 'error' : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell align="right">{record.workHours} h</TableCell>
                      </TableRow>
                    ))}
                    {attendanceRecords.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          Aucun pointage trouvé
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            {/* Leave Tab */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Historique des Congés</Typography>
                <Button
                  component={Link}
                  to={`/employees/${employee.id}/leaves`}
                  variant="outlined"
                  size="small"
                >
                  Voir Tout
                </Button>
              </Box>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Période</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Jours</TableCell>
                      <TableCell>Statut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaveRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {new Date(record.startDate).toLocaleDateString('fr-FR')} - {new Date(record.endDate).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          {record.type === 'annual' ? 'Congé annuel' :
                           record.type === 'sick' ? 'Congé maladie' :
                           record.type === 'unpaid' ? 'Congé sans solde' : record.type}
                        </TableCell>
                        <TableCell>{record.days}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              record.status === 'approved' ? 'Approuvé' :
                              record.status === 'pending' ? 'En attente' :
                              record.status === 'rejected' ? 'Refusé' : record.status
                            }
                            color={
                              record.status === 'approved' ? 'success' :
                              record.status === 'pending' ? 'info' :
                              record.status === 'rejected' ? 'error' : 'default'
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {leaveRecords.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          Aucun congé trouvé
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Êtes-vous sûr de vouloir supprimer l'employé{' '}
            <strong>{employee.firstName} {employee.lastName}</strong>?
            Cette action est irréversible.
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

export default EmployeeDetail; 