import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Badge,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  Stack,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Face as FaceIcon,
  Fingerprint as FingerprintIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  HourglassEmpty as PendingIcon,
  QuestionMark as QuestionMarkIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useBiometrics } from '../../context/BiometricContext';
import BiometricActions from '../../components/biometrics/BiometricActions';
import SocketService, { SOCKET_EVENTS } from '../../utils/socket';
import apiClient from '../../utils/api';

// Biometric status chip component
const BiometricStatusChip = ({ status }) => {
  let color = 'default';
  let icon = <QuestionMarkIcon />;
  let label = 'Non démarré';

  switch (status) {
    case 'not_started':
      color = 'default';
      icon = <QuestionMarkIcon />;
      label = 'Non démarré';
      break;
    case 'in_progress':
      color = 'warning';
      icon = <PendingIcon />;
      label = 'En cours';
      break;
    case 'completed':
      color = 'info';
      icon = <PendingIcon />;
      label = 'En attente de validation';
      break;
    case 'validated':
      color = 'success';
      icon = <CheckIcon />;
      label = 'Validé';
      break;
    case 'rejected':
      color = 'error';
      icon = <CloseIcon />;
      label = 'Rejeté';
      break;
    default:
      break;
  }

  return (
    <Chip
      icon={icon}
      label={label}
      color={color}
      size="small"
      sx={{ minWidth: '120px' }}
    />
  );
};

const EmployeeList = () => {
  const { currentUser } = useAuth();
  const { 
    saveBiometricScan,
    validateBiometricEnrollment,
    socketConnected
  } = useBiometrics();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deletedEmployeeIds, setDeletedEmployeeIds] = useState([]);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [bioValidationDialog, setBioValidationDialog] = useState({
    open: false,
    employee: null,
    type: null
  });

  const STORAGE_KEY = 'pointgee_deleted_employees';

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Initialize socket event listeners for this component
  useEffect(() => {
    // Listen for employee events
    const handleEmployeeCreated = (employee) => {
      console.log('Real-time: New employee created', employee);
      setEmployees(prev => [...prev, employee]);
    };
    
    const handleEmployeeUpdated = (employee) => {
      console.log('Real-time: Employee updated', employee);
      setEmployees(prev => 
        prev.map(emp => emp._id === employee._id ? employee : emp)
      );
    };
    
    const handleEmployeeDeleted = (employeeId) => {
      console.log('Real-time: Employee deleted', employeeId);
      setEmployees(prev => prev.filter(emp => emp._id !== employeeId));
    };
    
    // Subscribe to events
    SocketService.on(SOCKET_EVENTS.EMPLOYEE_CREATED, handleEmployeeCreated);
    SocketService.on(SOCKET_EVENTS.EMPLOYEE_UPDATED, handleEmployeeUpdated);
    SocketService.on(SOCKET_EVENTS.EMPLOYEE_DELETED, handleEmployeeDeleted);
    
    // Cleanup on unmount
    return () => {
      SocketService.off(SOCKET_EVENTS.EMPLOYEE_CREATED, handleEmployeeCreated);
      SocketService.off(SOCKET_EVENTS.EMPLOYEE_UPDATED, handleEmployeeUpdated);
      SocketService.off(SOCKET_EVENTS.EMPLOYEE_DELETED, handleEmployeeDeleted);
    };
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      if (refreshCounter === 0) {
        setLoading(true);
      }
      
      const storedDeletedIds = localStorage.getItem(STORAGE_KEY);
      const deletedIds = storedDeletedIds ? JSON.parse(storedDeletedIds) : [];
      
      setDeletedEmployeeIds(deletedIds);
      
      // Build query parameters based on user role
      let endpoint = '/employees';
      
      // If user is a department head/chef, filter by their assigned projects/departments
      if (currentUser && (currentUser.role === 'chef' || currentUser.role === 'team_leader') && currentUser.projects && currentUser.projects.length > 0) {
        // Get list of departments managed by this chef/team leader
        const departmentParams = currentUser.projects.map(proj => `department=${encodeURIComponent(proj)}`).join('&');
        endpoint = `/employees?${departmentParams}`;
        console.log('Fetching employees with filter:', endpoint);
      }
      
      // Fetch employees from API using centralized apiClient
      const response = await apiClient.get(endpoint);
      
      if (response.data.success) {
        console.log('Fetched employees:', response.data.data);
        
        // Filter out locally deleted employees
        const filteredEmployees = response.data.data.filter(
          employee => !deletedIds.includes(employee._id)
        );
        
        setEmployees(filteredEmployees);
        setError(null);
      } else {
        throw new Error('Failed to fetch employees');
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Erreur lors du chargement des employés. Veuillez réessayer plus tard.');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [refreshCounter, currentUser]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const idToDelete = employeeToDelete._id || employeeToDelete.id;
      
      // Send DELETE request to the server first
      const response = await apiClient.delete(`/employees/${idToDelete}`);
      
      if (!response.data || !response.data.success) {
        throw new Error('Failed to delete employee from server');
      }
      
      // Only update local state after successful server delete
      setEmployees(prevEmployees => 
        prevEmployees.filter(emp => (emp._id || emp.id) !== idToDelete)
      );
      
      // Store in local storage as backup
      const updatedDeletedIds = [...deletedEmployeeIds, idToDelete];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDeletedIds));
      
      console.log('Successfully deleted employee with ID:', idToDelete);
      console.log('Updated deleted IDs:', updatedDeletedIds);
      
      setDeletedEmployeeIds(updatedDeletedIds);
      
      // Force refresh of employee list after deletion
      setRefreshCounter(prev => prev + 1);
      
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError('Erreur lors de la suppression de l\'employé');
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  };

  // Biometric validation handlers
  const handleBiometricValidation = (employee, type) => {
    setBioValidationDialog({
      open: true,
      employee,
      type
    });
  };

  const handleBioValidationClose = () => {
    setBioValidationDialog({
      open: false,
      employee: null,
      type: null
    });
  };

  const handleBioValidationConfirm = async (decision) => {
    const { employee, type } = bioValidationDialog;
    
    try {
      // Use the BiometricContext to validate the enrollment
      await validateBiometricEnrollment(employee.id, type, decision);
      
      // Update employee data locally
      const updatedEmployees = employees.map(emp => {
        if (emp.id === employee.id) {
          return {
            ...emp,
            biometricStatus: {
              ...emp.biometricStatus,
              [type]: {
                ...emp.biometricStatus[type],
                status: decision
              }
            }
          };
        }
        return emp;
      });
      
      setEmployees(updatedEmployees);
      handleBioValidationClose();
    } catch (err) {
      console.error('Error validating biometric data:', err);
      setError('Erreur lors de la validation des données biométriques');
    }
  };

  const handleBiometricScanComplete = useCallback(async (employeeId, type, quality, data) => {
    try {
      // Use the BiometricContext to save the scan
      await saveBiometricScan(employeeId, type, quality, data);
      
      // For multi-pose face scans, quality threshold is higher
      const isFaceMultiPose = type === 'faceRecognition' && data && typeof data === 'object' && Object.keys(data).length > 1;
      
      // Update local state
      setEmployees(prevEmployees => 
        prevEmployees.map(emp => {
          if (emp.id === employeeId) {
            const currentStatus = emp.biometricStatus?.[type]?.status || 'not_started';
            const currentCount = emp.biometricStatus?.[type]?.samplesCount || 0;
            
            // Determine new status based on current status and sample count
            let newStatus = currentStatus;
            
            // For multi-pose face scanning, we count each pose as a sample
            const samplesIncrement = isFaceMultiPose ? Object.keys(data).length : 1;
            const newCount = currentCount + samplesIncrement;
            
            if (currentStatus === 'not_started' || currentStatus === 'in_progress') {
              // Multi-pose scanning is considered more complete with fewer samples
              const requiredSamples = isFaceMultiPose ? 1 : 3;
              newStatus = newCount >= requiredSamples ? 'completed' : 'in_progress';
            }
            
            return {
              ...emp,
              biometricStatus: {
                ...emp.biometricStatus,
                [type]: {
                  status: newStatus,
                  samplesCount: newCount
                }
              }
            };
          }
          return emp;
        })
      );
      
      // Refresh the employee list after a short delay
      setTimeout(() => setRefreshCounter(prev => prev + 1), 1000);
      
    } catch (err) {
      console.error('Error saving biometric scan:', err);
      setError('Erreur lors de l\'enregistrement des données biométriques');
    }
  }, [saveBiometricScan, setRefreshCounter]);

  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    
    return (
      fullName.includes(searchTermLower) ||
      (employee.employeeId && employee.employeeId.toLowerCase().includes(searchTermLower)) ||
      (employee.email && employee.email.toLowerCase().includes(searchTermLower)) ||
      (employee.position && employee.position.toLowerCase().includes(searchTermLower)) ||
      (employee.department && employee.department.name && employee.department.name.toLowerCase().includes(searchTermLower))
    );
  });

  const paginatedEmployees = filteredEmployees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Determine if current user can validate biometrics (admin or team_leader)
  const canValidateBiometrics = currentUser && 
    (currentUser.role === 'admin' || currentUser.role === 'team_leader' || currentUser.role === 'chef');

  // Determine if current user is admin (only validation) or chef/manager (full functionality)
  const isAdmin = currentUser && currentUser.role === 'admin';
  const isTeamLeader = currentUser && (currentUser.role === 'chef' || currentUser.role === 'team_leader');

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        mb: 3,
        gap: 2
      }}>
        <Typography variant="h5" component="h1">
          {isAdmin ? 'Validation Biométrique des Employés' : 'Gestion des Employés'}
        </Typography>
        {currentUser.role === 'admin' && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            to="/employees/new"
            fullWidth={isMobile}
            sx={{ minHeight: { xs: '42px', sm: 'auto' } }}
          >
            Nouvel Employé
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ p: { xs: 1, sm: 2 } }}>
          <TextField
            fullWidth
            placeholder="Rechercher un employé..."
            value={searchTerm}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {isMobile ? (
          // Card view for mobile
          <Box sx={{ p: { xs: 1, sm: 2 } }}>
            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((employee) => (
                <Card key={employee.id} sx={{ mb: 2, overflow: 'visible' }}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack spacing={1}>
                      <Typography variant="h6">
                        {employee.firstName} {employee.lastName}
                      </Typography>
                      
                      <Box>
                        <Typography variant="caption" color="text.secondary">ID:</Typography>
                        <Typography variant="body2">{employee.employeeId}</Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" color="text.secondary">Email:</Typography>
                        <Typography variant="body2" 
                          sx={{ 
                            wordBreak: 'break-word', 
                            overflowWrap: 'break-word'
                          }}
                        >
                          {employee.email}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" color="text.secondary">Poste:</Typography>
                        <Typography variant="body2">{employee.position}</Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" color="text.secondary">Département:</Typography>
                        <Typography variant="body2">{employee.department?.name || 'Non assigné'}</Typography>
                      </Box>
                      
                      {!isAdmin && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">Statut:</Typography>
                          <Box sx={{ mt: 0.5 }}>
                            <Chip
                              label={employee.active ? 'Actif' : 'Inactif'}
                              color={employee.active ? 'success' : 'default'}
                              size="small"
                            />
                          </Box>
                        </Box>
                      )}
                      
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {isAdmin ? 'Validation Biométrique:' : 'Données Biométriques:'}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <BiometricActions 
                            employee={employee}
                            onScanComplete={isAdmin ? null : handleBiometricScanComplete}
                            onValidationRequest={handleBiometricValidation}
                            canValidate={canValidateBiometrics}
                            compact={false}
                            adminMode={isAdmin}
                          />
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, gap: 1 }}>
                        <Tooltip title="Voir les détails">
                          <IconButton
                            component={Link}
                            to={`/employees/${employee._id || employee.id}`}
                            size="small"
                            color="primary"
                            sx={{ padding: 1 }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        {currentUser.role === 'admin' && (
                          <>
                            <Tooltip title="Modifier">
                              <IconButton
                                component={Link}
                                to={`/employees/edit/${employee._id || employee.id}`}
                                size="small"
                                color="primary"
                                sx={{ padding: 1 }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleDeleteClick(employee)}
                                sx={{ padding: 1 }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Aucun employé trouvé</Typography>
              </Box>
            )}
          </Box>
        ) : (
          // Table view for tablet and desktop
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell>Email</TableCell>
                  {!isTablet && !isAdmin && <TableCell>Téléphone</TableCell>}
                  <TableCell>Poste</TableCell>
                  <TableCell>Département</TableCell>
                  {!isAdmin && <TableCell>Statut</TableCell>}
                  <TableCell>{isAdmin ? 'Validation Biométrique' : 'Données Biométriques'}</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedEmployees.length > 0 ? (
                  paginatedEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>{employee.employeeId}</TableCell>
                      <TableCell>
                        {employee.firstName} {employee.lastName}
                      </TableCell>
                      <TableCell sx={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {employee.email}
                      </TableCell>
                      {!isTablet && !isAdmin && <TableCell>{employee.phone}</TableCell>}
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>{employee.department?.name || 'Non assigné'}</TableCell>
                      {!isAdmin && (
                        <TableCell>
                          <Chip
                            label={employee.active ? 'Actif' : 'Inactif'}
                            color={employee.active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <BiometricActions 
                          employee={employee}
                          onScanComplete={isAdmin ? null : handleBiometricScanComplete}
                          onValidationRequest={handleBiometricValidation}
                          canValidate={canValidateBiometrics}
                          compact={true}
                          adminMode={isAdmin}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Voir les détails">
                          <IconButton
                            component={Link}
                            to={`/employees/${employee._id || employee.id}`}
                            size="small"
                            color="primary"
                            sx={{ padding: isTablet ? 1 : undefined }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {currentUser.role === 'admin' && (
                          <>
                            <Tooltip title="Modifier">
                              <IconButton
                                component={Link}
                                to={`/employees/edit/${employee._id || employee.id}`}
                                size="small"
                                color="primary"
                                sx={{ padding: isTablet ? 1 : undefined }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleDeleteClick(employee)}
                                sx={{ padding: isTablet ? 1 : undefined }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isTablet ? 9 : 10} align="center">
                      Aucun employé trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredEmployees.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={isMobile ? "" : "Lignes par page:"}
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        fullScreen={isMobile}
      >
        <DialogTitle id="delete-dialog-title">
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Êtes-vous sûr de vouloir supprimer l'employé{' '}
            <strong>
              {employeeToDelete
                ? `${employeeToDelete.firstName} ${employeeToDelete.lastName}`
                : ''}
            </strong>
            ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Annuler</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Biometric Validation Dialog */}
      <Dialog
        open={bioValidationDialog.open}
        onClose={handleBioValidationClose}
        aria-labelledby="bio-validation-dialog-title"
        fullScreen={isMobile}
      >
        <DialogTitle id="bio-validation-dialog-title">
          Validation des données biométriques
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Voulez-vous valider ou rejeter les données 
            {bioValidationDialog.type === 'faceRecognition' ? ' de reconnaissance faciale ' : ' d\'empreinte digitale '}
            pour l'employé{' '}
            <strong>
              {bioValidationDialog.employee
                ? `${bioValidationDialog.employee.firstName} ${bioValidationDialog.employee.lastName}`
                : ''}
            </strong>
            ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBioValidationClose}>Annuler</Button>
          <Button onClick={() => handleBioValidationConfirm('rejected')} color="error">
            Rejeter
          </Button>
          <Button onClick={() => handleBioValidationConfirm('validated')} color="success" autoFocus>
            Valider
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeList; 