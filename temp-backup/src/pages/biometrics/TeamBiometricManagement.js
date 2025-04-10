import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Avatar,
  CircularProgress,
  Alert,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Face as FaceIcon,
  Fingerprint as FingerprintIcon,
  ViewList as ViewListIcon,
  Person as PersonIcon,
  HowToReg as ValidateIcon,
  CheckCircle as CheckIcon,
  Cancel as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useBiometrics } from '../../context/BiometricContext';

// Import shared components
import BiometricStatusChip from '../../components/biometrics/StatusChip';
import BiometricScanDialog from '../../components/biometrics/ScanDialog';

const TeamBiometricManagement = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [validationNotes, setValidationNotes] = useState('');
  
  // Use the biometrics context
  const {
    loading,
    error,
    setError,
    teamMembers,
    selectedEmployee,
    setSelectedEmployee,
    scanDialogOpen,
    scanType,
    scanning,
    scanResult,
    fetchTeamMembers,
    openScanDialog,
    closeScanDialog,
    handleScan,
    saveScanResult,
    validateBiometricEnrollment
  } = useBiometrics();

  // Initial load
  useEffect(() => {
    // Check if user is a team leader or chef
    if (!currentUser || (currentUser.role !== 'team_leader' && currentUser.role !== 'chef')) {
      navigate('/dashboard');
      return;
    }
    
    fetchTeamMembers();
  }, [currentUser, fetchTeamMembers, navigate]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleOpenScanDialog = (type) => {
    if (!selectedEmployee) return;
    openScanDialog(type, selectedEmployee);
  };

  const handleSaveScan = () => {
    saveScanResult('');
  };

  const handleValidate = async (employee, type, decision) => {
    await validateBiometricEnrollment(employee, type, decision, validationNotes);
    setValidationNotes('');
  };

  const getFilteredEmployees = () => {
    if (activeTab === 0) {
      // All employees tab
      return teamMembers;
    } else if (activeTab === 1) {
      // Face recognition tab
      return teamMembers.filter(emp => 
        emp.biometricStatus.faceRecognition.status !== 'validated'
      );
    } else {
      // Fingerprint tab
      return teamMembers.filter(emp => 
        emp.biometricStatus.fingerprint.status !== 'validated'
      );
    }
  };

  if (loading && teamMembers.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestion Biométrique de l'Équipe
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<ViewListIcon />} label="Tous les Employés" />
          <Tab icon={<FaceIcon />} label="Reconnaissance Faciale" />
          <Tab icon={<FingerprintIcon />} label="Empreintes Digitales" />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        {/* Employee List */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, height: '70vh', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              {activeTab === 0 ? 'Employés' : activeTab === 1 ? 'Reconnaissance Faciale' : 'Empreintes Digitales'}
            </Typography>
            <List>
              {getFilteredEmployees().map((employee) => (
                <ListItem
                  key={employee.id}
                  button
                  selected={selectedEmployee && selectedEmployee.id === employee.id}
                  onClick={() => handleSelectEmployee(employee)}
                  sx={{ 
                    mb: 1, 
                    borderRadius: 1,
                    bgcolor: (selectedEmployee && selectedEmployee.id === employee.id) ? 'action.selected' : 'background.paper',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={employee.photo}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${employee.firstName} ${employee.lastName}`}
                    secondary={`${employee.position} - ${employee.department.name}`}
                    primaryTypographyProps={{ variant: 'subtitle1' }}
                    secondaryTypographyProps={{ variant: 'body2' }}
                  />
                  <ListItemSecondaryAction>
                    {activeTab === 0 ? (
                      <PersonIcon color="primary" />
                    ) : activeTab === 1 ? (
                      <BiometricStatusChip status={employee.biometricStatus.faceRecognition.status} />
                    ) : (
                      <BiometricStatusChip status={employee.biometricStatus.fingerprint.status} />
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {getFilteredEmployees().length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                  Aucun employé trouvé
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Employee Details */}
        <Grid item xs={12} md={6} lg={8}>
          <Paper sx={{ p: 3, height: '70vh', overflow: 'auto' }}>
            {selectedEmployee ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar 
                    src={selectedEmployee.photo} 
                    sx={{ width: 80, height: 80, mr: 2 }}
                  >
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5">
                      {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {selectedEmployee.position}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedEmployee.department.name}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  {/* Face Recognition Card */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                            <FaceIcon sx={{ mr: 1 }} /> Reconnaissance Faciale
                          </Typography>
                          <BiometricStatusChip status={selectedEmployee.biometricStatus.faceRecognition.status} />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Échantillons: {selectedEmployee.biometricStatus.faceRecognition.samplesCount || 0}
                        </Typography>
                        
                        {selectedEmployee.biometricStatus.faceRecognition.enrollmentDate && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Date d'enregistrement: {new Date(selectedEmployee.biometricStatus.faceRecognition.enrollmentDate).toLocaleDateString()}
                          </Typography>
                        )}
                        
                        {selectedEmployee.biometricStatus.faceRecognition.validationDate && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Date de validation: {new Date(selectedEmployee.biometricStatus.faceRecognition.validationDate).toLocaleDateString()}
                          </Typography>
                        )}
                        
                        {selectedEmployee.biometricStatus.faceRecognition.validationNotes && (
                          <Alert severity="info" sx={{ mt: 1 }}>
                            {selectedEmployee.biometricStatus.faceRecognition.validationNotes}
                          </Alert>
                        )}
                      </CardContent>
                      <CardActions>
                        <Button 
                          startIcon={<FaceIcon />} 
                          variant="contained" 
                          color="primary"
                          fullWidth
                          onClick={() => handleOpenScanDialog('faceRecognition')}
                          disabled={selectedEmployee.biometricStatus.faceRecognition.status === 'validated'}
                        >
                          Scanner le Visage
                        </Button>
                      </CardActions>
                      
                      {selectedEmployee.biometricStatus.faceRecognition.status === 'completed' && (
                        <CardActions>
                          <Button 
                            startIcon={<CheckIcon />} 
                            color="success" 
                            onClick={() => handleValidate(selectedEmployee, 'faceRecognition', 'validated')}
                            sx={{ flex: 1 }}
                          >
                            Valider
                          </Button>
                          <Button 
                            startIcon={<CloseIcon />} 
                            color="error"
                            onClick={() => handleValidate(selectedEmployee, 'faceRecognition', 'rejected')}
                            sx={{ flex: 1 }}
                          >
                            Rejeter
                          </Button>
                        </CardActions>
                      )}

                      {selectedEmployee.biometricStatus.faceRecognition.status === 'completed' && (
                        <Box sx={{ px: 2, pb: 2 }}>
                          <TextField
                            label="Notes de validation"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={2}
                            value={validationNotes}
                            onChange={(e) => setValidationNotes(e.target.value)}
                            size="small"
                          />
                        </Box>
                      )}
                    </Card>
                  </Grid>

                  {/* Fingerprint Card */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                            <FingerprintIcon sx={{ mr: 1 }} /> Empreinte Digitale
                          </Typography>
                          <BiometricStatusChip status={selectedEmployee.biometricStatus.fingerprint.status} />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Échantillons: {selectedEmployee.biometricStatus.fingerprint.samplesCount || 0}
                        </Typography>
                        
                        {selectedEmployee.biometricStatus.fingerprint.enrollmentDate && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Date d'enregistrement: {new Date(selectedEmployee.biometricStatus.fingerprint.enrollmentDate).toLocaleDateString()}
                          </Typography>
                        )}
                        
                        {selectedEmployee.biometricStatus.fingerprint.validationDate && (
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Date de validation: {new Date(selectedEmployee.biometricStatus.fingerprint.validationDate).toLocaleDateString()}
                          </Typography>
                        )}
                        
                        {selectedEmployee.biometricStatus.fingerprint.validationNotes && (
                          <Alert severity="info" sx={{ mt: 1 }}>
                            {selectedEmployee.biometricStatus.fingerprint.validationNotes}
                          </Alert>
                        )}
                      </CardContent>
                      <CardActions>
                        <Button 
                          startIcon={<FingerprintIcon />} 
                          variant="contained" 
                          color="primary"
                          fullWidth
                          onClick={() => handleOpenScanDialog('fingerprint')}
                          disabled={selectedEmployee.biometricStatus.fingerprint.status === 'validated'}
                        >
                          Scanner l'Empreinte
                        </Button>
                      </CardActions>
                      
                      {selectedEmployee.biometricStatus.fingerprint.status === 'completed' && (
                        <CardActions>
                          <Button 
                            startIcon={<CheckIcon />} 
                            color="success" 
                            onClick={() => handleValidate(selectedEmployee, 'fingerprint', 'validated')}
                            sx={{ flex: 1 }}
                          >
                            Valider
                          </Button>
                          <Button 
                            startIcon={<CloseIcon />} 
                            color="error"
                            onClick={() => handleValidate(selectedEmployee, 'fingerprint', 'rejected')}
                            sx={{ flex: 1 }}
                          >
                            Rejeter
                          </Button>
                        </CardActions>
                      )}

                      {selectedEmployee.biometricStatus.fingerprint.status === 'completed' && (
                        <Box sx={{ px: 2, pb: 2 }}>
                          <TextField
                            label="Notes de validation"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={2}
                            value={validationNotes}
                            onChange={(e) => setValidationNotes(e.target.value)}
                            size="small"
                          />
                        </Box>
                      )}
                    </Card>
                  </Grid>
                </Grid>
              </>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="body1" color="text.secondary">
                  Sélectionnez un employé pour voir les détails
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Scan Dialog using shared component */}
      <BiometricScanDialog
        open={scanDialogOpen}
        onClose={closeScanDialog}
        scanType={scanType}
        employee={selectedEmployee}
        onScan={handleScan}
        onSave={handleSaveScan}
        scanning={scanning}
        scanResult={scanResult}
      />
    </Container>
  );
};

export default TeamBiometricManagement; 