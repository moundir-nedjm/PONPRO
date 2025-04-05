import React, { useState } from 'react';
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  IconButton,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Today as TodayIcon,
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
  Print as PrintIcon,
  GetApp as DownloadIcon,
  Edit as EditIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { format, getDate, getDay, isWeekend } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAttendance } from '../../context/AttendanceContext';

// Codes de présence avec leurs couleurs
const ATTENDANCE_CODES = {
  'P': { label: 'Présent Une Journée', color: '#4CAF50' },
  'JT': { label: 'Jours déjà travaillé', color: '#66BB6A' },
  'PP': { label: 'Une Journée + Prime 1000.00 da', color: '#43A047' },
  '2P': { label: 'Double Journée', color: '#2E7D32' },
  '2P/PP': { label: 'Double Journée + Prime 1000.00 da', color: '#1B5E20' },
  'PR': { label: 'Une journée de remplacement', color: '#81C784' },
  'PR/2-AN/2': { label: 'Demi Journée de remplacement Absence non justifiée Demi Journée', color: '#A5D6A7' },
  'PR/2-AN1/2': { label: 'Demi Journée de remplacement Absence non justifiée Demi Journée Influencer', color: '#C8E6C9' },
  'PN': { label: 'Présent En Permanence', color: '#388E3C' },
  'P/2': { label: 'Présent Demi Journée', color: '#4CAF50' },
  'P/4': { label: 'Présent Quart de la Journée', color: '#81C784' },
  'N-P/2': { label: 'Nouveau recruté Demi Journée', color: '#A5D6A7' },
  'PH': { label: 'P+ Heures Supplémentaire', color: '#00C853' },
  'PH/2': { label: 'P+ Heures Supplémentaires/2', color: '#69F0AE' },
  'PC': { label: 'Présent + Conduite', color: '#00E676' },
  'PC/2': { label: 'Présent Demi journée + Conduite', color: '#B9F6CA' },
  'MS': { label: 'Mission', color: '#FFC107' },
  'MS/2': { label: 'Mission Demi Journée', color: '#FFD54F' },
  'JF': { label: 'Jours fériés', color: '#FF9800' },
  'W': { label: 'Week end', color: '#607D8B' },
  'W/2': { label: 'Week end demi journée', color: '#90A4AE' },
  'HP': { label: 'Changement de poste', color: '#78909C' },
  'CH': { label: 'Changement de chantier', color: '#546E7A' },
  'DC': { label: 'Absences pour Décès', color: '#455A64' },
  'DCI': { label: 'Absences pour Décès Influencer', color: '#37474F' },
  'DM': { label: 'Démission', color: '#263238' },
  'CRP': { label: 'Congés de Récupération Payé', color: '#8BC34A' },
  'CRP/2': { label: 'Congés de Récupération Payé demi journée', color: '#9CCC65' },
  'CRP.P': { label: 'Congé Récupération Prêt Payé', color: '#7CB342' },
  'CRP.P/2': { label: 'Congé Récupération Prêt Payé demi journée', color: '#AED581' },
  'CSS': { label: 'Congé Sans Solde', color: '#FF9800' },
  'SS/AI': { label: 'Sans Solde Absance Irrégulière', color: '#FFA726' },
  'CM': { label: 'Congé Maladie', color: '#F44336' },
  'CM.I': { label: 'Congé Maladie Influencer', color: '#EF5350' },
  'CM/2': { label: 'Congé Maladie demi journée', color: '#E57373' },
  'CM1/2': { label: 'Congé Maladie demi journée Influencer', color: '#FFCDD2' },
  'CA': { label: 'Congés Annuels', color: '#2196F3' },
  'AJ': { label: 'Absense justifiée', color: '#90CAF9' },
  'AJ.I': { label: 'Absense justifiée Influencer', color: '#BBDEFB' },
  'AJ/2': { label: 'Absense justifiée Demi Journée', color: '#64B5F6' },
  'AJ1/2': { label: 'Absense justifiée Demi Journée Influencer', color: '#42A5F5' },
  'AN': { label: 'Absense non justifiée', color: '#9E9E9E' },
  'AN.I': { label: 'Absense non justifiée Influencer', color: '#BDBDBD' },
  'AN/2': { label: 'Absense non justifiée Demi Journée', color: '#E0E0E0' },
  'AN1/2': { label: 'Absense non justifiée Demi Journée Influencer', color: '#EEEEEE' },
  'AP': { label: 'Abandonnement de Poste Indiminisée', color: '#D32F2F' },
  'AP.I': { label: 'Abandonnement de Poste Indiminisée Influencer', color: '#E53935' },
  'AP1/2': { label: 'Abandonnement de Poste Indiminisée Demi Journée', color: '#EF5350' },
  'AP.I1/2': { label: 'Abandonnement de Poste Indiminisée Demi Journée Influencer', color: '#F44336' },
  'AP.N': { label: 'Abandonnement de Poste non Indiminisée', color: '#C62828' },
  'AP.NI': { label: 'Abandonnement de Poste non Indiminisée Influencer', color: '#B71C1C' },
  'FC': { label: 'Fin de Contrat', color: '#795548' },
  'AON': { label: 'Absence autorisée Non Payée', color: '#8D6E63' },
  'AON.I': { label: 'Absence autorisée Non Payée Influencer', color: '#A1887F' },
  'AOP': { label: 'Absence Autorisée Payée', color: '#6D4C41' },
  'AOP.I': { label: 'Absence Autorisée Payée Influencer', color: '#5D4037' },
  'G.L': { label: 'Grève Légal', color: '#9C27B0' },
  'G.LI': { label: 'Grève Légal Influencer', color: '#AB47BC' },
  'G.I': { label: 'Grève Illégal', color: '#8E24AA' },
  'G.II': { label: 'Grève Illégal Influencer', color: '#7B1FA2' },
  'JD': { label: 'Jour Déplacé', color: '#673AB7' },
  'D': { label: 'Déclaré', color: '#5E35B1' }
};

// Jours de la semaine en français
const DAYS_OF_WEEK = ['D', 'L', 'M', 'ME', 'J', 'V', 'S'];

const AttendanceMonthlySheet = () => {
  // Use the shared context instead of local state
  const {
    attendanceData,
    filteredEmployees,
    departments,
    selectedDepartment,
    month,
    daysInMonth,
    loading,
    error,
    searchTerm,
    lastUpdated,
    handleSearchChange,
    handleDepartmentChange,
    handleMonthChange,
    getAttendanceCode,
    getDepartmentName,
    updateAttendanceCode
  } = useAttendance();

  // Local state for UI components
  const [legendOpen, setLegendOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEdit, setCurrentEdit] = useState({ employeeId: null, day: null, code: '' });

  const getCodeColor = (code) => {
    return ATTENDANCE_CODES[code]?.color || 'transparent';
  };

  const handleCellClick = (employeeId, day) => {
    const dayNum = getDate(day);
    const currentCode = getAttendanceCode(employeeId, day);
    
    setCurrentEdit({
      employeeId,
      day: dayNum,
      code: currentCode
    });
    
    setEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  const handleCodeChange = (e) => {
    setCurrentEdit({
      ...currentEdit,
      code: e.target.value
    });
  };

  const handleSaveCode = async () => {
    const { employeeId, day, code } = currentEdit;
    const success = await updateAttendanceCode(employeeId, day, code);
    
    if (success) {
      setEditDialogOpen(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Implémentation pour l'exportation en CSV/Excel
    const headers = ['Matricule', 'Nom', 'Prénom', 'Poste'];
    
    // Ajouter les jours du mois aux en-têtes
    daysInMonth.forEach(day => {
      headers.push(getDate(day).toString());
    });
    
    headers.push('Total');
    
    // Préparer les données
    const data = filteredEmployees.map(employee => {
      const row = [
        employee._id.substring(0, 5),
        employee.lastName,
        employee.firstName,
        employee.position || 'N/A'
      ];
      
      // Ajouter les codes de présence pour chaque jour
      let totalPresent = 0;
      daysInMonth.forEach(day => {
        const code = getAttendanceCode(employee._id, day);
        row.push(code);
        if (code === 'P') totalPresent++;
      });
      
      // Ajouter le total
      row.push(totalPresent.toString());
      
      return row;
    });
    
    // Créer le contenu CSV
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');
    
    // Télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pointage_${format(month, 'yyyy-MM')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculer les totaux par code
  const calculateTotals = () => {
    const totals = {};
    
    // Initialiser les totaux à 0 pour chaque code
    Object.keys(ATTENDANCE_CODES).forEach(code => {
      totals[code] = 0;
    });
    
    // Compter les occurrences de chaque code
    filteredEmployees.forEach(employee => {
      daysInMonth.forEach(day => {
        const code = getAttendanceCode(employee._id, day);
        if (code) {
          totals[code] = (totals[code] || 0) + 1;
        }
      });
    });
    
    return totals;
  };

  const totals = calculateTotals();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              component={Link}
              to="/attendance"
              startIcon={<ArrowBackIcon />}
              size="small"
              sx={{ mr: 1 }}
            >
              Retour
            </Button>
            <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 0 }}>
              Fiche de Pointage Mensuelle
            </Typography>
          </Box>
          <Box>
            <IconButton onClick={() => setLegendOpen(true)} sx={{ mr: 1 }} size="small" title="Légende">
              <HelpIcon />
            </IconButton>
            <IconButton onClick={handlePrint} sx={{ mr: 1 }} size="small" title="Imprimer">
              <PrintIcon />
            </IconButton>
            <IconButton onClick={handleExport} size="small" title="Exporter">
              <DownloadIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
              <DatePicker
                views={['year', 'month']}
                label="Mois"
                minDate={new Date('2020-01-01')}
                maxDate={new Date('2030-12-31')}
                value={month}
                onChange={handleMonthChange}
                renderInput={(params) => <TextField {...params} fullWidth helperText={null} size="small" />}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Département</InputLabel>
              <Select
                value={selectedDepartment}
                onChange={handleDepartmentChange}
                label="Département"
              >
                <MenuItem value="all">Tous les départements</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept._id} value={dept._id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              label="Rechercher un employé"
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
        </Grid>
      </Paper>

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
        <Paper sx={{ overflow: 'auto', maxWidth: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} className="print-container">
          <Box sx={{ p: 1, bgcolor: '#1976d2', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
            <Typography variant="h6" sx={{ fontSize: '1rem', color: 'white', fontWeight: 'bold' }}>
              Fiche de Pointage des Salariés du mois de {format(month, 'MMMM yyyy', { locale: fr })} / {getDepartmentName()}
            </Typography>
          </Box>
          
          <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)', width: '100%', overflowX: 'auto' }}>
            <Table stickyHeader size="small" sx={{ tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', width: 40, padding: '6px 4px', bgcolor: '#f5f5f5' }}>N°</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 60, padding: '6px 4px', bgcolor: '#f5f5f5' }}>Mat</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 100, padding: '6px 4px', bgcolor: '#f5f5f5' }}>Nom</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 100, padding: '6px 4px', bgcolor: '#f5f5f5' }}>Prénom</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', width: 120, padding: '6px 4px', bgcolor: '#f5f5f5' }}>Poste Occupé</TableCell>
                  
                  {/* Jours du mois regroupés par semaine */}
                  {daysInMonth.map((day, index) => {
                    const dayOfWeek = DAYS_OF_WEEK[getDay(day)];
                    const dayNum = getDate(day);
                    const isWeekendDay = isWeekend(day);
                    
                    return (
                      <TableCell 
                        key={index} 
                        align="center"
                        sx={{ 
                          width: 30, 
                          padding: '4px 2px',
                          bgcolor: isWeekendDay ? '#e3f2fd' : '#f5f5f5',
                          borderLeft: index > 0 && getDay(day) === 0 ? '2px solid #1976d2' : 'inherit',
                          fontWeight: 'bold'
                        }}
                      >
                        <Box sx={{ lineHeight: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', fontSize: '0.7rem', color: isWeekendDay ? '#1976d2' : 'inherit' }}>
                            {dayOfWeek}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', fontSize: '0.7rem', color: isWeekendDay ? '#1976d2' : 'inherit' }}>
                            {dayNum}
                          </Typography>
                        </Box>
                      </TableCell>
                    );
                  })}
                  
                  <TableCell sx={{ fontWeight: 'bold', width: 60, padding: '6px 4px', bgcolor: '#f5f5f5' }} align="center">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmployees.map((employee, index) => {
                  // Calculer le total de jours présents
                  let totalPresent = 0;
                  daysInMonth.forEach(day => {
                    const code = getAttendanceCode(employee._id, day);
                    if (code === 'P') totalPresent++;
                  });
                  
                  return (
                    <TableRow key={employee._id} hover sx={{ '&:nth-of-type(odd)': { bgcolor: 'rgba(0, 0, 0, 0.02)' } }}>
                      <TableCell sx={{ padding: '4px 2px', borderBottom: '1px solid #e0e0e0' }}>{index + 1}</TableCell>
                      <TableCell sx={{ padding: '4px 2px', borderBottom: '1px solid #e0e0e0', fontWeight: 'medium' }}>{employee._id.substring(0, 5)}</TableCell>
                      <TableCell sx={{ padding: '4px 2px', borderBottom: '1px solid #e0e0e0', fontWeight: 'medium' }}>{employee.lastName}</TableCell>
                      <TableCell sx={{ padding: '4px 2px', borderBottom: '1px solid #e0e0e0' }}>{employee.firstName}</TableCell>
                      <TableCell sx={{ padding: '4px 2px', borderBottom: '1px solid #e0e0e0' }}>{employee.position || 'N/A'}</TableCell>
                      
                      {daysInMonth.map((day, dayIndex) => {
                        const code = getAttendanceCode(employee._id, day);
                        const bgColor = getCodeColor(code);
                        const isWeekendDay = isWeekend(day);
                        
                        return (
                          <TableCell 
                            key={dayIndex} 
                            align="center"
                            onClick={() => handleCellClick(employee._id, day)}
                            sx={{ 
                              cursor: 'pointer',
                              padding: '2px 1px',
                              bgcolor: code ? `${bgColor}33` : isWeekendDay ? '#e3f2fd33' : 'inherit',
                              color: code ? `${bgColor}` : 'inherit',
                              fontWeight: 'bold',
                              borderBottom: '1px solid #e0e0e0',
                              borderRadius: '4px',
                              '&:hover': {
                                bgcolor: code ? `${bgColor}66` : '#f5f5f5',
                                boxShadow: 'inset 0 0 0 1px #1976d2',
                              }
                            }}
                          >
                            {code}
                          </TableCell>
                        );
                      })}
                      
                      <TableCell align="center" sx={{ fontWeight: 'bold', padding: '4px 2px', borderBottom: '1px solid #e0e0e0', color: '#1976d2' }}>
                        {totalPresent}
                      </TableCell>
                    </TableRow>
                  );
                })}
                
                {/* Ligne des totaux */}
                <TableRow sx={{ bgcolor: '#e3f2fd' }}>
                  <TableCell colSpan={5} sx={{ fontWeight: 'bold', padding: '6px 4px', color: '#1976d2' }}>
                    Total
                  </TableCell>
                  
                  {daysInMonth.map((day, dayIndex) => {
                    // Compter le nombre d'employés avec chaque code pour ce jour
                    const dayCounts = {};
                    filteredEmployees.forEach(employee => {
                      const code = getAttendanceCode(employee._id, day);
                      dayCounts[code] = (dayCounts[code] || 0) + 1;
                    });
                    
                    // Trouver le code le plus fréquent
                    let maxCode = '';
                    let maxCount = 0;
                    Object.entries(dayCounts).forEach(([code, count]) => {
                      if (count > maxCount) {
                        maxCode = code;
                        maxCount = count;
                      }
                    });
                    
                    return (
                      <TableCell 
                        key={dayIndex} 
                        align="center"
                        sx={{ 
                          fontWeight: 'bold',
                          padding: '4px 2px',
                          bgcolor: getCodeColor(maxCode) ? `${getCodeColor(maxCode)}33` : '#e3f2fd',
                          color: '#1976d2'
                        }}
                      >
                        {dayCounts['P'] || 0}
                      </TableCell>
                    );
                  })}
                  
                  <TableCell align="center" sx={{ fontWeight: 'bold', padding: '4px 2px', bgcolor: '#1976d2', color: 'white' }}>
                    {totals['P'] || 0}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Dialogue de légende */}
      <Dialog open={legendOpen} onClose={() => setLegendOpen(false)} maxWidth="md">
        <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>Légende des Codes de Présence</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {Object.entries(ATTENDANCE_CODES).map(([code, { label, color }]) => (
              <Grid item xs={6} sm={4} md={3} key={code}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, p: 1, borderRadius: '4px', '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' } }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: color,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '4px',
                      mr: 1.5,
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  >
                    {code}
                  </Box>
                  <Typography variant="body1">{label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={() => setLegendOpen(false)} variant="contained" color="primary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue d'édition de code */}
      <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
        <DialogTitle sx={{ bgcolor: '#1976d2', color: 'white' }}>Modifier le Code de Présence</DialogTitle>
        <DialogContent sx={{ p: 3, pt: 2, minWidth: '300px' }}>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Code de Présence</InputLabel>
            <Select
              value={currentEdit.code}
              onChange={handleCodeChange}
              label="Code de Présence"
            >
              {Object.entries(ATTENDANCE_CODES).map(([code, { label, color }]) => (
                <MenuItem key={code} value={code}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        bgcolor: color,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '4px',
                        mr: 1.5,
                        fontWeight: 'bold',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }}
                    >
                      {code}
                    </Box>
                    <Typography>{label}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={handleEditDialogClose} sx={{ mr: 1 }}>Annuler</Button>
          <Button onClick={handleSaveCode} variant="contained" color="primary">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Typography variant="body2" color="text.secondary">
          Total employés: {filteredEmployees.length}
        </Typography>
        {lastUpdated && (
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Dernière mise à jour: {format(lastUpdated, 'HH:mm:ss')}
          </Typography>
        )}
      </Box>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .MuiDialog-root {
            display: none !important;
          }
        }
      `}</style>
    </Box>
  );
};

export default AttendanceMonthlySheet; 