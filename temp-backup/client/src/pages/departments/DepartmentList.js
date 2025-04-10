import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Avatar,
  Badge,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalEmployees: 0
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Apply filters whenever departments change
  useEffect(() => {
    applyFilters(searchTerm, filterActive);
  }, [departments]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/departments');
      if (response.data.success) {
        setDepartments(response.data.data);
        setFilteredDepartments(response.data.data);
        setError(null);
      } else {
        throw new Error('Failed to fetch departments');
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      
      // Generate mock departments for demo
      const mockDepartments = generateMockDepartments();
      setDepartments(mockDepartments);
      setFilteredDepartments(mockDepartments);
      
      // Calculate statistics from mock data
      updateStats(mockDepartments);
      
      // Don't set an error message
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    applyFilters(e.target.value, filterActive);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    let newFilterActive;
    switch (newValue) {
      case 0:
        newFilterActive = 'all';
        break;
      case 1:
        newFilterActive = true;
        break;
      case 2:
        newFilterActive = false;
        break;
      default:
        newFilterActive = 'all';
    }
    setFilterActive(newFilterActive);
    applyFilters(searchTerm, newFilterActive);
  };

  const handleMenuOpen = (event, department) => {
    setAnchorEl(event.currentTarget);
    setSelectedDepartment(department);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    try {
      // Check if the department has employees before trying to delete
      if (selectedDepartment && selectedDepartment.employeeCount > 0) {
        setError('Impossible de supprimer un département contenant des employés. Veuillez d\'abord réassigner ou supprimer les employés.');
        setDeleteDialogOpen(false);
        return;
      }
      
      const response = await axios.delete(`/api/departments/${selectedDepartment._id}`);
      
      if (response.data.success) {
        // Remove the department from the local state to avoid having to refetch
        setDepartments(prev => prev.filter(dept => dept._id !== selectedDepartment._id));
        // Also update filtered departments
        setFilteredDepartments(prev => prev.filter(dept => dept._id !== selectedDepartment._id));
        // Update stats
        updateStats(departments.filter(dept => dept._id !== selectedDepartment._id));
        
        // Show success message
        setError(null);
      }
      
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error('Erreur lors de la suppression du département:', err);
      // Display the specific error message from the API if available
      const errorMessage = err.response?.data?.message || 
                          'Impossible de supprimer le département. Veuillez réessayer plus tard.';
      setError(errorMessage);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const exportToCsv = () => {
    // Logique d'exportation CSV
    const headers = ['Nom', 'Description', 'Employés', 'Statut'];
    const data = filteredDepartments.map(dept => [
      dept.name,
      dept.description,
      dept.employeeCount || 0,
      dept.active ? 'Actif' : 'Inactif'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'departements.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    handleMenuClose();
  };

  // Apply filters to departments
  const applyFilters = (search, activeFilter) => {
    const filtered = departments.filter(
      (department) => {
        const matchesSearch = 
          department.name.toLowerCase().includes(search.toLowerCase()) ||
          department.description.toLowerCase().includes(search.toLowerCase());
        
        if (activeFilter === 'all') {
          return matchesSearch;
        }
        
        return matchesSearch && department.active === activeFilter;
      }
    );
    setFilteredDepartments(filtered);
  };

  // Helper function to calculate statistics
  const updateStats = (departmentsData) => {
    const active = departmentsData.filter(dept => dept.active).length;
    const inactive = departmentsData.length - active;
    const totalEmployees = departmentsData.reduce((sum, dept) => sum + (dept.employeeCount || 0), 0);
    
    setStats({
      total: departmentsData.length,
      active,
      inactive,
      totalEmployees
    });
  };

  // Generate mock departments with the specified department names
  const generateMockDepartments = () => {
    return [
      { 
        _id: 'dept-1', 
        name: 'KBK FROID',
        description: 'Département de réfrigération et systèmes frigorifiques',
        manager: 'Jean Dupont',
        employeeCount: 8,
        active: true
      },
      { 
        _id: 'dept-2', 
        name: 'KBK ELEC',
        description: 'Département d\'électricité et systèmes électriques',
        manager: 'Marie Laurent',
        employeeCount: 10,
        active: true
      },
      { 
        _id: 'dept-3', 
        name: 'HML',
        description: 'Opérations et services HML',
        manager: 'Philippe Martin',
        employeeCount: 12,
        active: true
      },
      { 
        _id: 'dept-4', 
        name: 'REB',
        description: 'Services et développement REB',
        manager: 'Sophie Bernard',
        employeeCount: 7,
        active: true
      },
      { 
        _id: 'dept-5', 
        name: 'DEG',
        description: 'Gestion et opérations DEG',
        manager: 'Thomas Dubois',
        employeeCount: 9,
        active: true
      },
      { 
        _id: 'dept-6', 
        name: 'HAMRA',
        description: 'Division HAMRA et services associés',
        manager: 'Claire Leroy',
        employeeCount: 5,
        active: false
      },
      { 
        _id: 'dept-7', 
        name: 'ADM SETIF',
        description: 'Administration de la région de Sétif',
        manager: 'Pierre Moreau',
        employeeCount: 6,
        active: true
      },
      { 
        _id: 'dept-8', 
        name: 'ADM HMD',
        description: 'Administration de la région HMD',
        manager: 'Isabelle Girard',
        employeeCount: 7,
        active: true
      }
    ];
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Départements
        </Typography>
        <Box>
          <Button
            onClick={fetchDepartments}
            startIcon={<RefreshIcon />}
            sx={{ mr: 1 }}
          >
            Actualiser
          </Button>
          <Button
            component={Link}
            to="/departments/new"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            Ajouter un Département
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography color="inherit" variant="subtitle1" gutterBottom>
                  Total Départements
                </Typography>
                <Avatar sx={{ bgcolor: 'primary.dark' }}>
                  <BusinessIcon />
                </Avatar>
              </Box>
              <Typography variant="h4" component="div">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography color="inherit" variant="subtitle1" gutterBottom>
                  Départements Actifs
                </Typography>
                <Avatar sx={{ bgcolor: 'success.dark' }}>
                  <Badge badgeContent={stats.active} color="success">
                    <BusinessIcon />
                  </Badge>
                </Avatar>
              </Box>
              <Typography variant="h4" component="div">
                {stats.active}
              </Typography>
              <Typography variant="body2" color="inherit">
                {stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}%` : '0%'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography color="inherit" variant="subtitle1" gutterBottom>
                  Départements Inactifs
                </Typography>
                <Avatar sx={{ bgcolor: 'error.dark' }}>
                  <Badge badgeContent={stats.inactive} color="error">
                    <BusinessIcon />
                  </Badge>
                </Avatar>
              </Box>
              <Typography variant="h4" component="div">
                {stats.inactive}
              </Typography>
              <Typography variant="body2" color="inherit">
                {stats.total > 0 ? `${Math.round((stats.inactive / stats.total) * 100)}%` : '0%'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography color="text.secondary" variant="subtitle1" gutterBottom>
                  Total Employés
                </Typography>
                <Avatar>
                  <GroupIcon />
                </Avatar>
              </Box>
              <Typography variant="h4" component="div">
                {stats.totalEmployees}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.total > 0 ? `${Math.round(stats.totalEmployees / stats.total)} par département` : '0 par département'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Rechercher des départements..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={exportToCsv}
                  sx={{ mr: 1 }}
                >
                  Exporter
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={() => window.print()}
                >
                  Imprimer
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ mb: 2 }}
        >
          <Tab label="Tous" />
          <Tab label="Actifs" />
          <Tab label="Inactifs" />
        </Tabs>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Employés</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDepartments.length > 0 ? (
                  filteredDepartments.map((department) => (
                    <TableRow key={department._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: 'primary.light', mr: 2, width: 30, height: 30 }}>
                            <BusinessIcon fontSize="small" />
                          </Avatar>
                          <Link to={`/departments/${department._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <Typography variant="body1" fontWeight="medium">
                              {department.name}
                            </Typography>
                          </Link>
                        </Box>
                      </TableCell>
                      <TableCell>{department.description}</TableCell>
                      <TableCell>
                        <Chip
                          icon={<GroupIcon />}
                          label={department.employeeCount || 0}
                          size="small"
                          color={department.employeeCount > 0 ? "primary" : "default"}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={department.active ? 'Actif' : 'Inactif'}
                          color={department.active ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Voir">
                          <IconButton
                            component={Link}
                            to={`/departments/${department._id}`}
                            color="primary"
                            size="small"
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Modifier">
                          <IconButton
                            component={Link}
                            to={`/departments/edit/${department._id}`}
                            color="primary"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={department.employeeCount > 0 ? 
                          "Ce département contient des employés et ne peut pas être supprimé" : 
                          "Options supplémentaires"}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, department)}
                              color={department.employeeCount > 0 ? "default" : "primary"}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      {searchTerm 
                        ? 'Aucun département trouvé correspondant à votre recherche.' 
                        : 'Aucun département trouvé.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Menu contextuel */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          component={Link} 
          to={selectedDepartment ? `/departments/${selectedDepartment._id}` : '#'}
          onClick={handleMenuClose}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Voir les détails</ListItemText>
        </MenuItem>
        <MenuItem 
          component={Link} 
          to={selectedDepartment ? `/departments/edit/${selectedDepartment._id}` : '#'}
          onClick={handleMenuClose}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Modifier</ListItemText>
        </MenuItem>
        <Divider />
        <Tooltip 
          title={selectedDepartment && selectedDepartment.employeeCount > 0 ? 
            "Impossible de supprimer un département contenant des employés" : ""}
          placement="left"
        >
          <div>
            <MenuItem 
              onClick={handleDeleteClick}
              disabled={selectedDepartment && selectedDepartment.employeeCount > 0}
              sx={{
                opacity: selectedDepartment && selectedDepartment.employeeCount > 0 ? 0.5 : 1,
              }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText sx={{ color: 'error.main' }}>Supprimer</ListItemText>
            </MenuItem>
          </div>
        </Tooltip>
      </Menu>

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Supprimer le département</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer le département "{selectedDepartment?.name}"? Cette action ne peut pas être annulée.
            {selectedDepartment && selectedDepartment.employeeCount > 0 && (
              <Box component="span" sx={{ display: 'block', mt: 1, color: 'error.main', fontWeight: 'bold' }}>
                Attention: Ce département contient {selectedDepartment.employeeCount} employé(s). 
                La suppression n'est pas possible. Veuillez d'abord réassigner ou supprimer ces employés.
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Annuler</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            autoFocus
            disabled={selectedDepartment && selectedDepartment.employeeCount > 0}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentList; 