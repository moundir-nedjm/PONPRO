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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  CircularProgress,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Edit as EditIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  VpnKey as KeyIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon, 
  VisibilityOff as VisibilityOffIcon,
  Security as SecurityIcon,
  Engineering as EngineeringIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const UserCredentials = ({ employeeId }) => {
  const { currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [openCreateUserDialog, setOpenCreateUserDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    employeeId: '',
    password: '',
    confirmPassword: '',
    role: 'employee'
  });
  const [formErrors, setFormErrors] = useState({});
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    severity: 'info'
  });

  // Fetch user data by employeeId
  useEffect(() => {
    const fetchUserData = async () => {
      if (!employeeId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Récupérer le token depuis le contexte d'authentification plutôt que localStorage
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const token = localStorage.getItem('authToken');
        
        console.log("Tentative de récupération utilisateur avec token:", token ? "présent" : "absent");
        
        if (!token) {
          console.error("Aucun token d'authentification trouvé");
          setUser(null);
          setError(null); // Pas d'erreur visible, juste aucun utilisateur trouvé
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`${API_URL}/api/auth/users?employeeId=${employeeId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        });
        
        console.log("Réponse API:", response.data);
        
        if (response.data.data && response.data.data.length > 0) {
          setUser(response.data.data[0]);
          setFormData({
            email: response.data.data[0].email || '',
            employeeId: response.data.data[0].employeeId || '',
            password: '',
            confirmPassword: '',
            role: response.data.data[0].role || 'employee'
          });
          setError(null);
        } else {
          // Aucune erreur, juste pas d'utilisateur
          setUser(null);
          setError(null);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        if (err.response?.status === 401) {
          // Erreur d'authentification
          setError(null);
          setUser(null);
        } else {
          setError('Erreur lors du chargement des données utilisateur');
        }
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [employeeId, currentUser]);

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

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Open password change dialog
  const handleOpenPasswordDialog = () => {
    setFormData({
      ...formData,
      password: '',
      confirmPassword: ''
    });
    setFormErrors({});
    setOpenPasswordDialog(true);
  };

  // Close password change dialog
  const handleClosePasswordDialog = () => {
    setOpenPasswordDialog(false);
  };

  // Toggle edit mode
  const handleToggleEditMode = () => {
    if (editMode) {
      // Cancel edit - reset form data
      setFormData({
        email: user?.email || '',
        employeeId: user?.employeeId || '',
        password: '',
        confirmPassword: '',
        role: user?.role || 'employee'
      });
      setFormErrors({});
    }
    setEditMode(!editMode);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email invalide';
    }
    
    if (!formData.employeeId.trim()) {
      errors.employeeId = 'L\'ID employé est requis';
    }
    
    return errors;
  };

  // Validate password form
  const validatePasswordForm = () => {
    const errors = {};
    
    if (!formData.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    return errors;
  };

  // Save user credentials
  const handleSaveCredentials = async () => {
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }
      
      await axios.put(`${API_URL}/api/auth/users/${user._id}`, {
        email: formData.email,
        employeeId: formData.employeeId,
        role: formData.role
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });
      
      // Update local state
      setUser({
        ...user,
        email: formData.email,
        employeeId: formData.employeeId,
        role: formData.role
      });
      
      setNotification({
        show: true,
        message: 'Identifiants mis à jour avec succès',
        severity: 'success'
      });
      
      setEditMode(false);
    } catch (err) {
      console.error('Error updating user credentials:', err);
      let errorMessage = 'Erreur lors de la mise à jour des identifiants';
      
      if (err.response?.status === 401) {
        errorMessage = "Vous n'êtes pas autorisé à effectuer cette opération";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setNotification({
        show: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  // Change password
  const handleChangePassword = async () => {
    // Validate password form
    const errors = validatePasswordForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }
      
      await axios.put(`${API_URL}/api/auth/users/${user._id}`, {
        password: formData.password
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });
      
      setNotification({
        show: true,
        message: 'Mot de passe changé avec succès',
        severity: 'success'
      });
      
      handleClosePasswordDialog();
    } catch (err) {
      console.error('Error changing password:', err);
      let errorMessage = 'Erreur lors du changement de mot de passe';
      
      if (err.response?.status === 401) {
        errorMessage = "Vous n'êtes pas autorisé à effectuer cette opération";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setNotification({
        show: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  };

  // Clear notification
  const handleClearNotification = () => {
    setNotification({
      show: false,
      message: '',
      severity: 'info'
    });
  };

  // Create new user account
  const handleCreateUser = async () => {
    console.log("Fonction handleCreateUser appelée!");
    
    // Validate form
    const errors = validateForm();
    console.log("Résultat validation:", errors);
    
    if (!formData.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    if (Object.keys(errors).length > 0) {
      console.log("Erreurs de validation détectées:", errors);
      setFormErrors(errors);
      return;
    }
    
    try {
      console.log("Tentative de création de compte utilisateur...");
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }
      
      console.log("Création d'un compte utilisateur avec les données:", {
        employeeId: employeeId,
        email: formData.email,
        role: formData.role
      });
      
      // Premier essai avec le chemin API complet
      try {
        const response = await axios.post(`${API_URL}/api/auth/users`, {
          name: `${employeeId} User`, // Nom temporaire, peut être mis à jour plus tard
          email: formData.email,
          password: formData.password,
          role: formData.role,
          employeeId: employeeId
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        });
        
        console.log("Réponse création utilisateur:", response.data);
        
        if (response.data.success) {
          setUser(response.data.user);
          setNotification({
            show: true,
            message: 'Compte utilisateur créé avec succès',
            severity: 'success'
          });
          
          setOpenCreateUserDialog(false);
        }
      } catch (apiError) {
        console.error("Erreur API principale:", apiError);
        
        // Deuxième essai avec le chemin relatif
        try {
          console.log("Tentative avec chemin relatif...");
          const fallbackResponse = await axios.post(`/api/auth/users`, {
            name: `${employeeId} User`,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            employeeId: employeeId
          }, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log("Réponse avec chemin relatif:", fallbackResponse.data);
          
          if (fallbackResponse.data.success) {
            setUser(fallbackResponse.data.user);
            setNotification({
              show: true,
              message: 'Compte utilisateur créé avec succès',
              severity: 'success'
            });
            
            setOpenCreateUserDialog(false);
          }
        } catch (fallbackError) {
          console.error("Erreur API fallback:", fallbackError);
          throw fallbackError; // Relancer pour le catch externe
        }
      }
    } catch (err) {
      console.error('Error creating user:', err);
      let errorMessage = 'Erreur lors de la création du compte';
      
      if (err.response?.status === 401) {
        errorMessage = "Vous n'êtes pas autorisé à effectuer cette opération";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      // Tenter de créer l'utilisateur sans l'appel API (pour débogage uniquement)
      alert("Tentative de création manuelle du compte pour débogage");
      
      // Créer un utilisateur factice pour contourner le problème
      setUser({
        _id: 'temp_' + Date.now(),
        email: formData.email,
        employeeId: employeeId,
        role: formData.role
      });
      
      setNotification({
        show: true,
        message: "Compte créé en mode débogage (non sauvegardé sur le serveur)",
        severity: 'warning'
      });
      
      setOpenCreateUserDialog(false);
    }
  };
  
  // Close create user dialog
  const handleCloseCreateUserDialog = () => {
    setOpenCreateUserDialog(false);
    setFormErrors({});
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardHeader 
        title="Identifiants & Sécurité" 
        action={
          currentUser.role === 'admin' && (
            <Tooltip title={editMode ? "Annuler" : "Modifier"}>
              <IconButton onClick={handleToggleEditMode}>
                {editMode ? <CancelIcon /> : <EditIcon />}
              </IconButton>
            </Tooltip>
          )
        }
      />
      <Divider />
      <CardContent>
        {notification.show && (
          <Alert 
            severity={notification.severity} 
            sx={{ mb: 2 }}
            onClose={handleClearNotification}
          >
            {notification.message}
          </Alert>
        )}
        
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : user ? (
          <>
            <List>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                {editMode ? (
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    variant="outlined"
                    size="small"
                    sx={{ ml: -1 }}
                  />
                ) : (
                  <ListItemText
                    primary="Email"
                    secondary={user.email || 'Non spécifié'}
                  />
                )}
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <BadgeIcon />
                </ListItemIcon>
                {editMode ? (
                  <TextField
                    fullWidth
                    label="ID Employé"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    error={!!formErrors.employeeId}
                    helperText={formErrors.employeeId}
                    variant="outlined"
                    size="small"
                    sx={{ ml: -1 }}
                  />
                ) : (
                  <ListItemText
                    primary="ID Employé"
                    secondary={user.employeeId || 'Non spécifié'}
                  />
                )}
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Rôle"
                  secondary={
                    user.role === 'admin' ? 'Administrateur' :
                    user.role === 'chef' ? 'Chef de Projet' : 'Employé'
                  }
                />
                {user.role === 'chef' && (
                  <ListItemSecondaryAction>
                    <Box>
                      {user.projects && user.projects.map(project => (
                        <Chip 
                          key={project} 
                          label={project} 
                          size="small" 
                          sx={{ mr: 0.5, mb: 0.5 }} 
                        />
                      ))}
                    </Box>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <KeyIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Mot de passe"
                  secondary="••••••••"
                />
                {currentUser.role === 'admin' && (
                  <ListItemSecondaryAction>
                    <Tooltip title="Changer le mot de passe">
                      <IconButton edge="end" onClick={handleOpenPasswordDialog}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            </List>
            
            {editMode && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveCredentials}
                >
                  Enregistrer
                </Button>
              </Box>
            )}
          </>
        ) : (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              Cet employé n'a pas de compte utilisateur pour accéder au système.
            </Alert>
            
            {currentUser.role === 'admin' && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button 
                  variant="contained"
                  color="primary"
                  startIcon={<PersonIcon />}
                  onClick={() => setOpenCreateUserDialog(true)}
                >
                  Créer un compte utilisateur
                </Button>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
      
      {/* Password Change Dialog */}
      <Dialog open={openPasswordDialog} onClose={handleClosePasswordDialog}>
        <DialogTitle>Changer le mot de passe</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Nouveau mot de passe"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                )
              }}
            />
            <TextField
              fullWidth
              label="Confirmer le mot de passe"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog} color="inherit">
            Annuler
          </Button>
          <Button onClick={handleChangePassword} color="primary" variant="contained">
            Changer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create User Dialog - Simplified version */}
      <Dialog 
        open={openCreateUserDialog} 
        onClose={handleCloseCreateUserDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Créer un compte utilisateur</DialogTitle>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            console.log("Formulaire soumis!");
            handleCreateUser();
          }}
        >
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                margin="normal"
                required
              />
              
              <TextField
                fullWidth
                label="ID Employé"
                name="employeeId"
                value={employeeId}
                disabled
                margin="normal"
              />
              
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Rôle</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <MenuItem value="admin">Administrateur</MenuItem>
                  <MenuItem value="chef">Chef de Projet</MenuItem>
                  <MenuItem value="employee">Employé</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Mot de passe"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                error={!!formErrors.password}
                helperText={formErrors.password}
                margin="normal"
                required
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      type="button"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  )
                }}
              />
              
              <TextField
                fullWidth
                label="Confirmer le mot de passe"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
                margin="normal"
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCloseCreateUserDialog} 
              color="inherit"
              type="button"
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              color="primary" 
              variant="contained"
            >
              Créer
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Card>
  );
};

export default UserCredentials; 