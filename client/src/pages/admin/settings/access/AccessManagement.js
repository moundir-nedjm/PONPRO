import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Button,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  TextField,
  InputAdornment,
  Chip,
  Switch,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Save as SaveIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  Groups as GroupsIcon,
  LockOpen as LockOpenIcon
} from '@mui/icons-material';
import axios from 'axios';

// Sidebar menu items structure (imported from Sidebar.js)
const sidebarSections = [
  {
    category: 'Tableaux de Bord',
    items: [
      { id: 'dashboard', name: 'Tableau de Bord', description: 'Tableau de bord principal avec statistiques globales' },
      { id: 'personal_dashboard', name: 'Tableau de Bord Personnel', description: 'Tableau de bord individuel pour les employés' },
      { id: 'stats', name: 'Mes Statistiques', description: 'Statistiques personnelles de présence' }
    ]
  },
  {
    category: 'Pointage & Présence',
    items: [
      { id: 'attendance', name: 'Pointage du Jour', description: 'Gestion des pointages quotidiens' },
      { id: 'attendance_history', name: 'Historique des Pointages', description: 'Historique complet des pointages' },
      { id: 'attendance_requests', name: 'Demandes de Modification', description: 'Gestion des demandes de modification de pointage' }
    ]
  },
  {
    category: 'Gestion',
    items: [
      { id: 'employees', name: 'Employés', description: 'Gestion complète des employés' },
      { id: 'departments', name: 'Départements', description: 'Gestion des départements' },
      { id: 'documents', name: 'Gestion des Renseignements', description: 'Gestion des documents' }
    ]
  },
  {
    category: 'Rapports & Analyses',
    items: [
      { id: 'reports', name: 'Rapports', description: 'Génération de rapports divers' },
      { id: 'charts', name: 'Graphiques', description: 'Visualisations et analyses détaillées' }
    ]
  },
  {
    category: 'Système',
    items: [
      { id: 'settings', name: 'Paramètres', description: 'Configuration générale du système' },
      { id: 'help', name: 'Aide', description: 'Documentation et assistance' }
    ]
  }
];

// User roles
const userRoles = [
  { id: 'admin', name: 'Administrateur', description: 'Accès complet au système' },
  { id: 'chef', name: 'Chef de Projet', description: 'Gestion des équipes et pointages' },
  { id: 'employee', name: 'Employé', description: 'Utilisateur standard' }
];

const AccessManagement = () => {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedRole, setSelectedRole] = useState('chef');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // Initialize permissions data
  useEffect(() => {
    fetchPermissions();
  }, []);

  // Fetch permissions from API (mock data for now)
  const fetchPermissions = async () => {
    setLoading(true);
    
    try {
      // In a real implementation, you would fetch from the server
      // Mock data for demonstration
      const mockPermissions = {};
      
      userRoles.forEach(role => {
        mockPermissions[role.id] = {};
        
        sidebarSections.forEach(section => {
          section.items.forEach(item => {
            // Set default permissions - Admin has access to everything
            // Chef has access to most things except some admin features
            // Employees have limited access
            if (role.id === 'admin') {
              mockPermissions[role.id][item.id] = true;
            } else if (role.id === 'chef') {
              mockPermissions[role.id][item.id] = !['settings', 'departments'].includes(item.id);
            } else if (role.id === 'employee') {
              mockPermissions[role.id][item.id] = ['personal_dashboard', 'stats', 'attendance', 'documents', 'help'].includes(item.id);
            }
          });
        });
      });
      
      setPermissions(mockPermissions);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      setSnackbar({
        open: true,
        message: "Erreur lors du chargement des permissions",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle permission toggle
  const handlePermissionChange = (role, itemId) => {
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [itemId]: !prev[role][itemId]
      }
    }));
  };

  // Save permissions
  const savePermissions = async () => {
    setSaveLoading(true);
    
    try {
      // In a real implementation, you would save to the server
      // For demonstration, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setSnackbar({
        open: true,
        message: "Permissions enregistrées avec succès",
        severity: "success"
      });
    } catch (error) {
      console.error("Error saving permissions:", error);
      setSnackbar({
        open: true,
        message: "Erreur lors de l'enregistrement des permissions",
        severity: "error"
      });
    } finally {
      setSaveLoading(false);
    }
  };

  // Handle role change
  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  // Open edit dialog
  const handleOpenEditDialog = (item) => {
    setEditingItem(item);
    setOpenDialog(true);
  };

  // Close edit dialog
  const handleCloseEditDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  // Filter items based on search term
  const filterItems = (items) => {
    if (!searchTerm) return items;
    
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        fontWeight: 'bold',
        color: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <LockOpenIcon /> Gestion des Accès Utilisateurs
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Configurez les permissions d'accès aux fonctionnalités du système pour chaque rôle d'utilisateur.
      </Typography>
      
      {/* Control Panel */}
      <Paper elevation={0} sx={{ 
        p: 2, 
        mb: 3, 
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2 
      }}>
        <Box sx={{ 
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2
        }}>
          <TextField
            placeholder="Rechercher une fonctionnalité..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="role-select-label">Rôle à configurer</InputLabel>
              <Select
                labelId="role-select-label"
                value={selectedRole}
                onChange={handleRoleChange}
                label="Rôle à configurer"
              >
                {userRoles.map(role => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Tooltip title="Rafraîchir">
              <IconButton onClick={fetchPermissions} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<SaveIcon />}
              onClick={savePermissions}
              disabled={saveLoading}
            >
              {saveLoading ? <CircularProgress size={24} /> : 'Enregistrer'}
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* Role Information Card */}
      <Paper elevation={0} sx={{ 
        p: 2, 
        mb: 3, 
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'primary.light'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <GroupsIcon fontSize="large" sx={{ color: 'primary.main' }} />
          <Box>
            <Typography variant="h6" sx={{ color: 'primary.dark', fontWeight: 'bold' }}>
              {userRoles.find(r => r.id === selectedRole)?.name || selectedRole}
            </Typography>
            <Typography variant="body2" sx={{ color: 'primary.dark' }}>
              {userRoles.find(r => r.id === selectedRole)?.description || 'Configuration des accès pour ce rôle'}
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      {/* Permissions Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden'
        }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <TableCell width="35%" sx={{ fontWeight: 'bold' }}>Fonctionnalité</TableCell>
                <TableCell width="45%" sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell width="10%" align="center" sx={{ fontWeight: 'bold' }}>Accès</TableCell>
                <TableCell width="10%" align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sidebarSections.map((section) => (
                <React.Fragment key={section.category}>
                  <TableRow sx={{ backgroundColor: 'rgba(0,0,0,0.04)' }}>
                    <TableCell 
                      colSpan={4}
                      sx={{ 
                        fontWeight: 'bold', 
                        color: 'text.primary',
                        borderBottom: '1px solid rgba(224, 224, 224, 1)',
                        py: 1
                      }}
                    >
                      {section.category}
                    </TableCell>
                  </TableRow>
                  
                  {filterItems(section.items).map((item) => (
                    <TableRow 
                      key={item.id}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: 'rgba(0,0,0,0.02)'
                        }
                      }}
                    >
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {item.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          checked={permissions[selectedRole]?.[item.id] || false}
                          onChange={() => handlePermissionChange(selectedRole, item.id)}
                          color="primary"
                          inputProps={{ 'aria-label': `Activer/désactiver l'accès à ${item.name}` }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Configurer les permissions détaillées">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => handleOpenEditDialog(item)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Permission Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Configuration avancée - {editingItem?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Niveaux de permission pour {userRoles.find(r => r.id === selectedRole)?.name}
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="access-level-label">Niveau d'accès</InputLabel>
                <Select
                  labelId="access-level-label"
                  value="read"
                  label="Niveau d'accès"
                >
                  <MenuItem value="none">Aucun accès</MenuItem>
                  <MenuItem value="read">Lecture seule</MenuItem>
                  <MenuItem value="write">Lecture et écriture</MenuItem>
                  <MenuItem value="full">Accès complet</MenuItem>
                </Select>
              </FormControl>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                <Typography variant="body2" fontWeight="medium">Permissions spécifiques</Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Voir</Typography>
                  <Checkbox checked={true} />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Ajouter</Typography>
                  <Checkbox checked={permissions[selectedRole]?.[editingItem?.id] || false} />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Modifier</Typography>
                  <Checkbox checked={permissions[selectedRole]?.[editingItem?.id] || false} />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Supprimer</Typography>
                  <Checkbox checked={false} />
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Annuler</Button>
          <Button variant="contained" onClick={handleCloseEditDialog}>Appliquer</Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AccessManagement; 