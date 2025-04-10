import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiClient from '../../utils/api';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  HelpOutline as HelpIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Print as PrintIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

// TabPanel component for tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`code-tabpanel-${index}`}
      aria-labelledby={`code-tab-${index}`}
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

const AttendanceCodeLegend = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [codes, setCodes] = useState([]);
  const [filteredCodes, setFilteredCodes] = useState([]);
  const [sections, setSections] = useState({
    blueGreen: [],
    greenYellowPurple: [],
    redBlue: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchAttendanceCodes();
  }, []);

  useEffect(() => {
    if (codes.length > 0) {
      organizeCodes();
      applyFilters();
    }
  }, [codes, searchTerm, categoryFilter, paymentFilter]);

  const fetchAttendanceCodes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/attendance-codes');
      setCodes(response.data.data || []);
      setFilteredCodes(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des codes de présence');
      console.error('Error fetching attendance codes:', err);
      setCodes([]);
      setFilteredCodes([]);
    } finally {
      setLoading(false);
    }
  };

  const organizeCodes = () => {
    // Organiser les codes par section selon leur couleur
    // Cette logique est simplifiée et pourrait être améliorée avec une catégorisation plus précise
    const blueGreen = [];
    const greenYellowPurple = [];
    const redBlue = [];

    filteredCodes.forEach(code => {
      const color = code.color.toLowerCase();
      
      // Logique simplifiée basée sur les valeurs hexadécimales
      if (color.includes('4682b4') || color.includes('4caf50')) {
        blueGreen.push(code);
      } else if (color.includes('9acd32') || color.includes('ffeb3b') || color.includes('9c27b0')) {
        greenYellowPurple.push(code);
      } else if (color.includes('b22222') || color.includes('2196f3')) {
        redBlue.push(code);
      } else {
        // Par défaut, placer dans la section centrale
        greenYellowPurple.push(code);
      }
    });

    setSections({
      blueGreen,
      greenYellowPurple,
      redBlue
    });
  };

  const applyFilters = () => {
    let filtered = [...codes];
    
    // Apply search term filter
    if (searchTerm) {
      filtered = filtered.filter(code => 
        code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(code => code.category === categoryFilter);
    }
    
    // Apply payment impact filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(code => code.paymentImpact === paymentFilter);
    }
    
    setFilteredCodes(filtered);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryFilterChange = (event) => {
    setCategoryFilter(event.target.value);
  };

  const handlePaymentFilterChange = (event) => {
    setPaymentFilter(event.target.value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setPaymentFilter('all');
  };

  const handlePrint = () => {
    window.print();
  };

  const renderCodeSection = (title, codes, expanded = false) => (
    <Accordion defaultExpanded={expanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls={`${title.replace(/\s+/g, '-').toLowerCase()}-content`}
        id={`${title.replace(/\s+/g, '-').toLowerCase()}-header`}
      >
        <Typography variant="h6">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {codes.map(code => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={code._id}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  borderLeft: `4px solid ${code.color}`
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Chip
                    label={code.code}
                    style={{
                      backgroundColor: code.color,
                      color: '#fff',
                      fontWeight: 'bold'
                    }}
                  />
                  <Tooltip title="Détails du code">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="body2" gutterBottom>
                  {code.description}
                </Typography>
                <Box sx={{ mt: 'auto', pt: 1 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">
                        Catégorie:
                      </Typography>
                      <Typography variant="body2">
                        {getCategoryLabel(code.category)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">
                        Impact:
                      </Typography>
                      <Typography variant="body2">
                        {getPaymentImpactLabel(code.paymentImpact)}
                      </Typography>
                    </Grid>
                    {code.influencer && (
                      <Grid item xs={12}>
                        <Chip
                          label="Influencer"
                          size="small"
                          color="secondary"
                          sx={{ mt: 1 }}
                        />
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  const renderTableView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Code</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Catégorie</TableCell>
            <TableCell>Impact sur la paie</TableCell>
            <TableCell>Influencer</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredCodes.map((code) => (
            <TableRow key={code._id} sx={{ 
              '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
              borderLeft: `4px solid ${code.color}`
            }}>
              <TableCell>
                <Chip
                  label={code.code}
                  style={{
                    backgroundColor: code.color,
                    color: '#fff',
                    fontWeight: 'bold'
                  }}
                />
              </TableCell>
              <TableCell>{code.description}</TableCell>
              <TableCell>{getCategoryLabel(code.category)}</TableCell>
              <TableCell>{getPaymentImpactLabel(code.paymentImpact)}</TableCell>
              <TableCell>{code.influencer ? 'Oui' : 'Non'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const getCategoryLabel = (category) => {
    const labels = {
      'present': 'Présent',
      'absent': 'Absent',
      'leave': 'Congé',
      'holiday': 'Jour Férié',
      'other': 'Autre'
    };
    return labels[category] || category;
  };

  const getPaymentImpactLabel = (impact) => {
    const labels = {
      'full-pay': 'Paie complète',
      'partial-pay': 'Paie partielle',
      'no-pay': 'Sans paie',
      'premium': 'Prime'
    };
    return labels[impact] || impact;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Légende des Codes de Présence
        </Typography>
        <Box>
          <Tooltip title="Imprimer la légende">
            <IconButton onClick={handlePrint}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Les codes sont organisés en trois sections selon leur catégorie et leur couleur">
            <IconButton>
              <HelpIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

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
        <Box>
          <Alert severity="info" sx={{ mb: 3 }}>
            Ce guide de référence complet permet au personnel RH ou de paie de coder avec précision les feuilles de temps et les registres de présence pour différentes catégories d'employés.
          </Alert>

          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Rechercher"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchTerm('')}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="category-filter-label">Catégorie</InputLabel>
                  <Select
                    labelId="category-filter-label"
                    value={categoryFilter}
                    onChange={handleCategoryFilterChange}
                    label="Catégorie"
                  >
                    <MenuItem value="all">Toutes les catégories</MenuItem>
                    <MenuItem value="present">Présent</MenuItem>
                    <MenuItem value="absent">Absent</MenuItem>
                    <MenuItem value="leave">Congé</MenuItem>
                    <MenuItem value="holiday">Jour Férié</MenuItem>
                    <MenuItem value="other">Autre</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="payment-filter-label">Impact sur la paie</InputLabel>
                  <Select
                    labelId="payment-filter-label"
                    value={paymentFilter}
                    onChange={handlePaymentFilterChange}
                    label="Impact sur la paie"
                  >
                    <MenuItem value="all">Tous les impacts</MenuItem>
                    <MenuItem value="full-pay">Paie complète</MenuItem>
                    <MenuItem value="partial-pay">Paie partielle</MenuItem>
                    <MenuItem value="no-pay">Sans paie</MenuItem>
                    <MenuItem value="premium">Prime</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                >
                  Réinitialiser
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Caractéristiques du système:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Code couleur cohérent
                  </Typography>
                  <Typography variant="body2">
                    Les codes sont regroupés par couleur selon leur type: tons bleus/verts pour la présence, tons verts/jaunes/violets pour les congés et changements, et tons rouges/bleus pour les absences et situations spéciales.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Catégories "Influencer"
                  </Typography>
                  <Typography variant="body2">
                    De nombreux codes incluent une désignation "Influencer", indiquant un traitement spécial pour les employés avec ce statut particulier.
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Journées partielles
                  </Typography>
                  <Typography variant="body2">
                    Le système prend en compte les journées partielles (demi-journées et quarts de journée) avec des codes spécifiques.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="code view tabs">
              <Tab label="Vue par catégorie" id="code-tab-0" aria-controls="code-tabpanel-0" />
              <Tab label="Vue tableau" id="code-tab-1" aria-controls="code-tabpanel-1" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {filteredCodes.length === 0 ? (
              <Alert severity="info">Aucun code ne correspond aux critères de recherche.</Alert>
            ) : (
              <>
                {renderCodeSection('Présence (Bleu/Vert)', sections.blueGreen, true)}
                {renderCodeSection('Congés et Changements (Vert/Jaune/Violet)', sections.greenYellowPurple)}
                {renderCodeSection('Absences et Situations Spéciales (Rouge/Bleu)', sections.redBlue)}
              </>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {filteredCodes.length === 0 ? (
              <Alert severity="info">Aucun code ne correspond aux critères de recherche.</Alert>
            ) : (
              renderTableView()
            )}
          </TabPanel>
        </Box>
      )}
    </Box>
  );
};

export default AttendanceCodeLegend; 