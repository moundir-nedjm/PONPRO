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
  Schedule as ScheduleIcon,
  Face as FaceIcon,
  Fingerprint as FingerprintIcon,
  AddAPhoto as AddPhotoIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../utils/api';
import FaceScanner from '../../components/attendance/FaceScanner';
import UserCredentials from '../admin/UserCredentials';

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
  const [biometricStatus, setBiometricStatus] = useState({
    faceRecognition: { status: 'not_started', samplesCount: 0 },
    fingerprint: { status: 'not_started', samplesCount: 0 }
  });
  const [openFaceScanner, setOpenFaceScanner] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(null);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching employee with ID:', id);
      
      // Fetch employee data from API
      const employeeRes = await apiClient.get(`/employees/${id}`);
      
      console.log('Employee API response:', employeeRes?.data);
      
      if (!employeeRes.data || !employeeRes.data.success) {
        throw new Error('Failed to fetch employee data');
      }
      
      // Set employee data from API response
      setEmployee(employeeRes.data.data);
      
      // Set biometric status if available in the employee data
      if (employeeRes.data.data.biometricStatus) {
        setBiometricStatus(employeeRes.data.data.biometricStatus);
      }
      
      // Fetch attendance records and leave records
      const fetchAttendanceAndLeaveData = async () => {
        try {
          // Fetch attendance records
          const attendanceRes = await apiClient.get(`/employees/${id}/attendance`);
          if (attendanceRes.data && attendanceRes.data.success) {
            setAttendanceRecords(attendanceRes.data.data || []);
          } else {
            // Empty array if data not available
            setAttendanceRecords([]);
          }
          
          // Fetch leave records
          const leaveRes = await apiClient.get(`/employees/${id}/leaves`);
          if (leaveRes.data && leaveRes.data.success) {
            setLeaveRecords(leaveRes.data.data || []);
          } else {
            // Empty array if data not available
            setLeaveRecords([]);
          }
        } catch (err) {
          console.error('Error fetching attendance or leave data:', err);
          // Empty arrays for failed fetch
          setAttendanceRecords([]);
          setLeaveRecords([]);
        }
      };
      
      fetchAttendanceAndLeaveData();
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors du chargement des données de l\'employé:', err);
      setError('Erreur lors du chargement des données de l\'employé. Vérifiez l\'identifiant et réessayez.');
      setLoading(false);
    }
  };

  useEffect(() => {
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
      // Call API to delete the employee
      const deleteRes = await apiClient.delete(`/employees/${id}`);
      
      if (deleteRes.data && deleteRes.data.success) {
        setDeleteDialogOpen(false);
        navigate('/employees');
      } else {
        throw new Error('Failed to delete employee');
      }
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'employé:', err);
      setError('Erreur lors de la suppression de l\'employé');
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleOpenFaceScanner = () => {
    setOpenFaceScanner(true);
  };

  const handleCloseFaceScanner = () => {
    setOpenFaceScanner(false);
  };

  const handleFaceRegistrationSuccess = async (result) => {
    console.log('Face registration successful:', result);
    setBiometricSuccess('Visage enregistré avec succès!');
    
    // Update biometric status
    if (result && result.status) {
      setBiometricStatus(prevStatus => ({
        ...prevStatus,
        faceRecognition: {
          status: result.status,
          samplesCount: result.samplesCount || prevStatus.faceRecognition.samplesCount,
          enrollmentDate: new Date().toISOString()
        }
      }));
    }
    
    // Close scanner
    setOpenFaceScanner(false);
    
    // Refresh employee data after a short delay
    setTimeout(() => {
      fetchEmployeeData();
    }, 1000);
  };

  // Get status label and color for biometric status
  const getBiometricStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return { label: 'Enregistré', color: 'success' };
      case 'in_progress':
        return { label: 'En cours', color: 'warning' };
      case 'validated':
        return { label: 'Validé', color: 'success' };
      case 'rejected':
        return { label: 'Rejeté', color: 'error' };
      case 'not_started':
      default:
        return { label: 'Non enregistré', color: 'error' };
    }
  };

  // Render the biometrics tab
  const renderBiometricsTab = () => {
    const faceStatus = biometricStatus?.faceRecognition?.status || 'not_started';
    const fingerprintStatus = biometricStatus?.fingerprint?.status || 'not_started';
    
    const faceStatusInfo = getBiometricStatusInfo(faceStatus);
    const fingerprintStatusInfo = getBiometricStatusInfo(fingerprintStatus);
    
    return (
      <Box>
        {biometricSuccess && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setBiometricSuccess(null)}>
            {biometricSuccess}
          </Alert>
        )}
        
        <Typography variant="h6" gutterBottom>
          Informations Biométriques
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                avatar={<FaceIcon color="primary" />}
                title="Reconnaissance Faciale"
                subheader={
                  <Chip 
                    label={faceStatusInfo.label}
                    color={faceStatusInfo.color}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                }
                action={
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddPhotoIcon />}
                    onClick={handleOpenFaceScanner}
                    sx={{ mt: 1 }}
                  >
                    {faceStatus === 'not_started' ? 'Enregistrer' : 'Mettre à jour'}
                  </Button>
                }
              />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Échantillons: {biometricStatus?.faceRecognition?.samplesCount || 0}
                  </Typography>
                  
                  {biometricStatus?.faceRecognition?.enrollmentDate && (
                    <Typography variant="body2" color="text.secondary">
                      Date d'enregistrement: {new Date(biometricStatus.faceRecognition.enrollmentDate).toLocaleDateString()}
                    </Typography>
                  )}
                  
                  <Typography variant="body2" color="text.primary" sx={{ mt: 2 }}>
                    La reconnaissance faciale permet à l'employé de pointer sa présence rapidement et de manière sécurisée.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                avatar={<FingerprintIcon color="primary" />}
                title="Empreinte Digitale"
                subheader={
                  <Chip 
                    label={fingerprintStatusInfo.label}
                    color={fingerprintStatusInfo.color}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                }
                action={
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FingerprintIcon />}
                    disabled={true} // To be implemented in the future
                    sx={{ mt: 1 }}
                  >
                    {fingerprintStatus === 'not_started' ? 'Enregistrer' : 'Mettre à jour'}
                  </Button>
                }
              />
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Échantillons: {biometricStatus?.fingerprint?.samplesCount || 0}
                  </Typography>
                  
                  {biometricStatus?.fingerprint?.enrollmentDate && (
                    <Typography variant="body2" color="text.secondary">
                      Date d'enregistrement: {new Date(biometricStatus.fingerprint.enrollmentDate).toLocaleDateString()}
                    </Typography>
                  )}
                  
                  <Typography variant="body2" color="text.primary" sx={{ mt: 2 }}>
                    La reconnaissance par empreinte digitale sera disponible prochainement.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Sécurité et Accès
          </Typography>
        
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Validation des données biométriques" 
                      secondary="Les données biométriques sont cryptées et stockées de manière sécurisée conformément aux réglementations en vigueur."
                    />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <UserCredentials employeeId={employee?.employeeId} />
            </Grid>
          </Grid>
        </Box>
        
        {/* Face Scanner Dialog */}
        <FaceScanner 
          open={openFaceScanner}
          onClose={handleCloseFaceScanner}
          onSuccess={handleFaceRegistrationSuccess}
          mode="register"
          employeeId={id}
          employeeName={`${employee.firstName} ${employee.lastName}`}
        />
      </Box>
    );
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
              to={`/employees/edit/${employee._id || employee.id}`}
              variant="outlined"
              startIcon={<EditIcon />}
              sx={{ mr: 2 }}
            >
              Modifier
            </Button>
            <Button
              component={Link}
              to={`/employees/${employee._id || employee.id}/schedule`}
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
                {employee.firstName || ''} {employee.lastName || ''}
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center">
                {employee.position || 'Sans poste'}
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
                  secondary={employee.employeeId || 'Non spécifié'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Email"
                  secondary={employee.email || 'Non spécifié'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Téléphone"
                  secondary={employee.phone || 'Non spécifié'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <BusinessIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Département"
                  secondary={employee.department?.name || 'Non spécifié'}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <WorkIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Date d'embauche"
                  secondary={employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('fr-FR') : 'Non spécifié'}
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
                <Tab label="Biométrie" />
                {currentUser.role === 'admin' && <Tab label="Identifiants & Sécurité" />}
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
                            secondary={employee.birthDate ? new Date(employee.birthDate).toLocaleDateString('fr-FR') : 'Non spécifié'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <BadgeIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="Numéro d'Identité Nationale"
                            secondary={employee.nationalId || 'Non spécifié'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <PersonIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="Genre"
                            secondary={employee.gender === 'male' ? 'Homme' : employee.gender === 'female' ? 'Femme' : 'Non spécifié'}
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
                            secondary={employee.address?.street || 'Non spécifié'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <HomeIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="Ville"
                            secondary={employee.address?.city || 'Non spécifié'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <HomeIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="Wilaya"
                            secondary={employee.address?.wilaya || 'Non spécifié'}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <HomeIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="Code Postal"
                            secondary={employee.address?.postalCode || 'Non spécifié'}
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

            {/* Biometrics Tab */}
            <TabPanel value={tabValue} index={3}>
              {renderBiometricsTab()}
            </TabPanel>

            {/* Credentials Tab - Admin Only */}
            {currentUser.role === 'admin' && (
              <TabPanel value={tabValue} index={4}>
                <Box sx={{ p: 2 }}>
                  <UserCredentials employeeId={employee?.employeeId} />
                </Box>
              </TabPanel>
            )}
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