import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Chip,
  Grid,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Snackbar,
  TablePagination,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Security as SecurityIcon,
  Engineering as EngineeringIcon,
  Person as PersonIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const UserManagement = () => {
  const { currentUser, PROJECTS } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
    employeeId: '',
    projects: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      const response = await axios.get('/api/auth/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUsers(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Erreur lors du chargement des utilisateurs. Veuillez réessayer.');
      setLoading(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'employee',
      employeeId: '',
      projects: []
    });
    setFormErrors({});
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  // Open create user dialog
  const handleCreateUser = () => {
    setDialogMode('create');
    resetForm();
    setOpenDialog(true);
  };

  // Open edit user dialog
  const handleEditUser = (user) => {
    setDialogMode('edit');
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      confirmPassword: '',
      role: user.role,
      employeeId: user.employeeId || '',
      projects: user.projects || []
    });
    setOpenDialog(true);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Handle project selection
  const handleProjectChange = (event) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      projects: value
    });
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Le nom est requis';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email invalide';
    }
    
    if (dialogMode === 'create' || formData.password) {
      if (!formData.password) {
        errors.password = 'Le mot de passe est requis';
      } else if (formData.password.length < 6) {
        errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }
    
    if (formData.role === 'chef' && formData.projects.length === 0) {
      errors.projects = 'Sélectionnez au moins un projet';
    }
    
    return errors;
  };

  // Submit form data
  const handleSubmit = async () => {
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Prepare data for API
    const userData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      employeeId: formData.employeeId,
      projects: formData.projects
    };
    
    // Add password only if provided
    if (formData.password) {
      userData.password = formData.password;
    }
    
    try {
      const token = getAuthToken();
      let response;
      
      if (dialogMode === 'create') {
        // Create new user
        response = await axios.post('/api/auth/users', userData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setNotification({
          open: true,
          message: 'Utilisateur créé avec succès',
          severity: 'success'
        });
      } else {
        // Update existing user
        response = await axios.put(`/api/auth/users/${selectedUser._id}`, userData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setNotification({
          open: true,
          message: 'Utilisateur mis à jour avec succès',
          severity: 'success'
        });
      }
      
      // Close dialog and refresh user list
      handleCloseDialog();
      fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      setNotification({
        open: true,
        message: `Erreur: ${err.response?.data?.message || 'Une erreur est survenue'}`,
        severity: 'error'
      });
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) {
      return;
    }
    
    try {
      const token = getAuthToken();
      await axios.delete(`/api/auth/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setNotification({
        open: true,
        message: 'Utilisateur supprimé avec succès',
        severity: 'success'
      });
      
      // Refresh user list
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setNotification({
        open: true,
        message: `Erreur: ${err.response?.data?.message || 'Une erreur est survenue'}`,
        severity: 'error'
      });
    }
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get role color and icon
  const getRoleInfo = (role) => {
    switch (role) {
      case 'admin':
        return { color: '#f44336', icon: <SecurityIcon fontSize="small" /> };
      case 'chef':
        return { color: '#ff9800', icon: <EngineeringIcon fontSize="small" /> };
      case 'employee':
        return { color: '#4caf50', icon: <PersonIcon fontSize="small" /> };
      default:
        return { color: '#2196f3', icon: <PersonIcon fontSize="small" /> };
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestion des Utilisateurs
        </Typography>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchUsers}
            sx={{ mr: 1 }}
          >
            Actualiser
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateUser}
          >
            Nouvel Utilisateur
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Rôle</TableCell>
                    <TableCell>ID Employé</TableCell>
                    <TableCell>Projets</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => {
                    const roleInfo = getRoleInfo(user.role);
                    return (
                      <TableRow key={user._id} hover>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip 
                            icon={roleInfo.icon}
                            label={user.role === 'admin' ? 'Administrateur' : 
                                  user.role === 'chef' ? 'Chef de Projet' : 'Employé'}
                            sx={{ 
                              bgcolor: `${roleInfo.color}15`, 
                              color: roleInfo.color,
                              fontWeight: 'bold'
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{user.employeeId || '-'}</TableCell>
                        <TableCell>
                          {user.projects && user.projects.length > 0 ? (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {user.projects.map(project => (
                                <Chip
                                  key={project}
                                  label={project}
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                />
                              ))}
                            </Box>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Modifier">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleEditUser(user)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {user._id !== currentUser.id && (
                            <Tooltip title="Supprimer">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteUser(user._id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={users.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Lignes par page"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
            />
          </>
        )}
      </Paper>
      
      {/* User Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'create' ? 'Créer un nouvel utilisateur' : 'Modifier l\'utilisateur'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nom complet"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Mot de passe"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                fullWidth
                error={!!formErrors.password}
                helperText={formErrors.password || (dialogMode === 'edit' && 'Laissez vide pour conserver le mot de passe actuel')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Confirmer le mot de passe"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                fullWidth
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Rôle</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  label="Rôle"
                >
                  <MenuItem value="admin">Administrateur</MenuItem>
                  <MenuItem value="chef">Chef de Projet</MenuItem>
                  <MenuItem value="employee">Employé</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="ID Employé (optionnel)"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            {(formData.role === 'chef' || formData.role === 'employee') && (
              <Grid item xs={12}>
                <FormControl fullWidth error={!!formErrors.projects}>
                  <InputLabel>Projets</InputLabel>
                  <Select
                    multiple
                    name="projects"
                    value={formData.projects}
                    onChange={handleProjectChange}
                    label="Projets"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                  >
                    {PROJECTS.map((project) => (
                      <MenuItem key={project} value={project}>{project}</MenuItem>
                    ))}
                  </Select>
                  {formErrors.projects && (
                    <Typography variant="caption" color="error">
                      {formErrors.projects}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            startIcon={dialogMode === 'create' ? <AddIcon /> : <SaveIcon />}
          >
            {dialogMode === 'create' ? 'Créer' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement; 