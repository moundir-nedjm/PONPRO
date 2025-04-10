import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiClient from '../../utils/api';
import { Link } from 'react-router-dom';
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
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Divider,
  Card,
  CardContent,
  CardHeader,
  ButtonGroup
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Info as InfoIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';

const CATEGORIES = [
  { value: 'present', label: 'Présent' },
  { value: 'absent', label: 'Absent' },
  { value: 'leave', label: 'Congé' },
  { value: 'holiday', label: 'Jour Férié' },
  { value: 'other', label: 'Autre' }
];

const PAYMENT_IMPACTS = [
  { value: 'full-pay', label: 'Paie complète' },
  { value: 'partial-pay', label: 'Paie partielle' },
  { value: 'no-pay', label: 'Sans paie' },
  { value: 'premium', label: 'Prime' }
];

const AttendanceCodes = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCode, setCurrentCode] = useState({
    code: '',
    description: '',
    category: 'present',
    color: '#4682B4',
    influencer: false,
    paymentImpact: 'full-pay'
  });

  useEffect(() => {
    fetchAttendanceCodes();
  }, []);

  // Fetch attendance codes from API
  const fetchAttendanceCodes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/attendance-codes');
      
      if (response.data && response.data.success) {
        setCodes(response.data.data || []);
      } else {
        // Empty array if no data
        setCodes([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching attendance codes:', err);
      setError('Erreur lors du chargement des codes de présence');
      setCodes([]);
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterCategory(e.target.value);
  };

  const handleOpenDialog = (code = null) => {
    if (code) {
      setCurrentCode(code);
      setEditMode(true);
    } else {
      setCurrentCode({
        code: '',
        description: '',
        category: 'present',
        color: '#4682B4',
        influencer: false,
        paymentImpact: 'full-pay'
      });
      setEditMode(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentCode({
      ...currentCode,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      
      if (editMode) {
        // Use the real API to update
        const response = await apiClient.put(`/api/attendance-codes/${currentCode._id}`, currentCode);
        
        if (response.data && response.data.success) {
          // Update the codes array with the updated code
          const updatedCodes = codes.map(code => 
            code._id === currentCode._id ? response.data.data : code
          );
          setCodes(updatedCodes);
        } else {
          throw new Error(response.data?.message || 'Erreur de mise à jour');
        }
      } else {
        // Use the real API to create
        const response = await apiClient.post('/api/attendance-codes', currentCode);
        
        if (response.data && response.data.success) {
          // Add the new code to the array
          setCodes([...codes, response.data.data]);
        } else {
          throw new Error(response.data?.message || 'Erreur de création');
        }
      }
      
      handleCloseDialog();
    } catch (err) {
      setError(`Erreur lors de l'enregistrement du code: ${err.message}`);
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce code de présence ?')) {
      try {
        setError(null);
        
        // Use the real API to delete
        const response = await apiClient.delete(`/api/attendance-codes/${id}`);
        
        if (response.data && response.data.success) {
          // Filter out the deleted code
          const updatedCodes = codes.filter(code => code._id !== id);
          setCodes(updatedCodes);
        } else {
          throw new Error(response.data?.message || 'Erreur de suppression');
        }
      } catch (err) {
        setError(`Erreur lors de la suppression: ${err.message}`);
        console.error(err);
      }
    }
  };

  // Filter codes based on search term and category
  const filteredCodes = codes.filter(code => {
    const matchesSearch = code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         code.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || code.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardHeader
          title="Codes de Présence Français"
          subheader="Gestion des codes de suivi de présence et du temps de travail"
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                component={Link}
                to="/attendance/codes-dashboard"
                variant="outlined"
                color="primary"
                startIcon={<DashboardIcon />}
              >
                Tableau de Bord des Codes
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Nouveau Code
              </Button>
            </Box>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Rechercher"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Catégorie</InputLabel>
                <Select
                  value={filterCategory}
                  onChange={handleFilterChange}
                  label="Catégorie"
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterListIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">Toutes les catégories</MenuItem>
                  {CATEGORIES.map(category => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Catégorie</TableCell>
                    <TableCell>Couleur</TableCell>
                    <TableCell>Impact sur la paie</TableCell>
                    <TableCell>Influenceur</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCodes.length > 0 ? (
                    filteredCodes.map(code => (
                      <TableRow key={code._id}>
                        <TableCell>
                          <Chip
                            label={code.code}
                            sx={{
                              bgcolor: code.color,
                              color: '#fff',
                              fontWeight: 'bold'
                            }}
                          />
                        </TableCell>
                        <TableCell>{code.description}</TableCell>
                        <TableCell>
                          {CATEGORIES.find(cat => cat.value === code.category)?.label || code.category}
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor: code.color,
                              borderRadius: '4px'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {PAYMENT_IMPACTS.find(impact => impact.value === code.paymentImpact)?.label || code.paymentImpact}
                        </TableCell>
                        <TableCell>
                          {code.influencer ? 'Oui' : 'Non'}
                        </TableCell>
                        <TableCell>
                          <ButtonGroup size="small">
                            <Tooltip title="Modifier">
                              <IconButton onClick={() => handleOpenDialog(code)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton onClick={() => handleDelete(code._id)} color="error">
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </ButtonGroup>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Aucun code de présence trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md">
        <DialogTitle>
          {editMode ? 'Modifier le Code de Présence' : 'Ajouter un Nouveau Code de Présence'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Code"
                name="code"
                value={currentCode.code}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Couleur"
                name="color"
                value={currentCode.color}
                onChange={handleInputChange}
                type="color"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={currentCode.description}
                onChange={handleInputChange}
                required
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Catégorie</InputLabel>
                <Select
                  name="category"
                  value={currentCode.category}
                  onChange={handleInputChange}
                  label="Catégorie"
                >
                  {CATEGORIES.map(category => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Impact sur la paie</InputLabel>
                <Select
                  name="paymentImpact"
                  value={currentCode.paymentImpact}
                  onChange={handleInputChange}
                  label="Impact sur la paie"
                >
                  {PAYMENT_IMPACTS.map(impact => (
                    <MenuItem key={impact.value} value={impact.value}>
                      {impact.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <Grid container alignItems="center">
                  <Grid item>
                    <Typography variant="body1" component="label" htmlFor="influencer">
                      Influenceur:
                    </Typography>
                  </Grid>
                  <Grid item sx={{ ml: 2 }}>
                    <input
                      type="checkbox"
                      id="influencer"
                      name="influencer"
                      checked={currentCode.influencer}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMode ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceCodes; 