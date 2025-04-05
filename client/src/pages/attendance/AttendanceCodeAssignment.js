import React, { useState, useEffect } from 'react';
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
  CardHeader
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const AttendanceCodeAssignment = () => {
  const [employees, setEmployees] = useState([]);
  const [attendanceCodes, setAttendanceCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentAttendance, setCurrentAttendance] = useState(null);
  const [selectedCode, setSelectedCode] = useState('');
  const [premiumAmount, setPremiumAmount] = useState(0);

  useEffect(() => {
    fetchEmployees();
    fetchAttendanceCodes();
  }, []);

  useEffect(() => {
    if (selectedEmployee && selectedMonth) {
      fetchAttendanceData();
    }
  }, [selectedEmployee, selectedMonth]);

  useEffect(() => {
    // Generate days in the selected month
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    const days = eachDayOfInterval({ start, end });
    setDaysInMonth(days);
  }, [selectedMonth]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/employees');
      setEmployees(response.data.data);
    } catch (err) {
      setError('Erreur lors du chargement des employés');
      console.error(err);
    }
  };

  const fetchAttendanceCodes = async () => {
    try {
      const response = await axios.get('/api/attendance-codes');
      setAttendanceCodes(response.data.data);
    } catch (err) {
      setError('Erreur lors du chargement des codes de présence');
      console.error(err);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const start = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');
      
      const response = await axios.get(`/api/attendance/employee/${selectedEmployee}/codes`, {
        params: { startDate: start, endDate: end }
      });
      
      setAttendanceData(response.data.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données de présence');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEmployeeChange = (e) => {
    setSelectedEmployee(e.target.value);
  };

  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
  };

  const handleOpenDialog = (attendance) => {
    setCurrentAttendance(attendance);
    setSelectedCode(attendance.code || '');
    setPremiumAmount(attendance.premiumAmount || 0);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentAttendance(null);
    setSelectedCode('');
    setPremiumAmount(0);
  };

  const handleCodeChange = (e) => {
    setSelectedCode(e.target.value);
    
    // If premium code is selected, set default premium amount
    const code = attendanceCodes.find(c => c.code === e.target.value);
    if (code && code.paymentImpact === 'premium') {
      setPremiumAmount(1000); // Default premium amount
    } else {
      setPremiumAmount(0);
    }
  };

  const handlePremiumChange = (e) => {
    setPremiumAmount(parseFloat(e.target.value) || 0);
  };

  const handleSubmit = async () => {
    try {
      await axios.put(`/api/attendance/${currentAttendance._id}/code`, {
        attendanceCode: selectedCode,
        premiumAmount
      });
      
      fetchAttendanceData();
      handleCloseDialog();
    } catch (err) {
      setError('Erreur lors de la mise à jour du code de présence');
      console.error(err);
    }
  };

  const getAttendanceForDay = (day) => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    return attendanceData.find(att => 
      format(parseISO(att.date), 'yyyy-MM-dd') === formattedDay
    );
  };

  const getCodeColor = (code) => {
    const codeObj = attendanceCodes.find(c => c.code === code);
    return codeObj ? codeObj.color : '#9e9e9e';
  };

  const getCodeDescription = (code) => {
    const codeObj = attendanceCodes.find(c => c.code === code);
    return codeObj ? codeObj.description : '';
  };

  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee =>
    `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardHeader
          title="Assignation des Codes de Présence"
          subheader="Gérer les codes de présence des employés"
        />
        <Divider />
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                label="Rechercher un employé"
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
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Employé</InputLabel>
                <Select
                  value={selectedEmployee}
                  onChange={handleEmployeeChange}
                  label="Employé"
                >
                  <MenuItem value="">
                    <em>Sélectionner un employé</em>
                  </MenuItem>
                  {filteredEmployees.map(employee => (
                    <MenuItem key={employee._id} value={employee._id}>
                      {employee.firstName} {employee.lastName} ({employee.employeeId})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <DatePicker
                  label="Mois"
                  views={['year', 'month']}
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  slotProps={{
                    textField: { fullWidth: true }
                  }}
                />
              </LocalizationProvider>
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
          ) : selectedEmployee ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Jour</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Impact sur la Paie</TableCell>
                    <TableCell>Prime</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {daysInMonth.map(day => {
                    const attendance = getAttendanceForDay(day);
                    const isWeekendDay = isWeekend(day);
                    
                    return (
                      <TableRow 
                        key={format(day, 'yyyy-MM-dd')}
                        sx={{ 
                          backgroundColor: isWeekendDay ? 'rgba(0, 0, 0, 0.04)' : 'inherit'
                        }}
                      >
                        <TableCell>{format(day, 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{format(day, 'EEEE', { locale: fr })}</TableCell>
                        <TableCell>
                          {attendance?.code ? (
                            <Chip
                              label={attendance.code}
                              style={{
                                backgroundColor: getCodeColor(attendance.code),
                                color: '#fff',
                                fontWeight: 'bold'
                              }}
                            />
                          ) : isWeekendDay ? (
                            <Chip
                              label="W"
                              style={{
                                backgroundColor: '#9e9e9e',
                                color: '#fff',
                                fontWeight: 'bold'
                              }}
                            />
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {attendance?.code ? getCodeDescription(attendance.code) : 
                           isWeekendDay ? 'Week-end' : '-'}
                        </TableCell>
                        <TableCell>
                          {attendance?.paymentImpact || (isWeekendDay ? 'Sans paie' : '-')}
                        </TableCell>
                        <TableCell>
                          {attendance?.premiumAmount ? `${attendance.premiumAmount.toFixed(2)} DA` : '-'}
                        </TableCell>
                        <TableCell>
                          {attendance && (
                            <Tooltip title="Modifier le code">
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenDialog(attendance)}
                              >
                                <EditIcon />
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
          ) : (
            <Alert severity="info">
              Veuillez sélectionner un employé pour afficher ses données de présence.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Edit Attendance Code Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Modifier le Code de Présence
        </DialogTitle>
        <DialogContent>
          {currentAttendance && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  Date: {format(parseISO(currentAttendance.date), 'dd/MM/yyyy')}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Code de Présence</InputLabel>
                  <Select
                    value={selectedCode}
                    onChange={handleCodeChange}
                    label="Code de Présence"
                  >
                    <MenuItem value="">
                      <em>Aucun code</em>
                    </MenuItem>
                    {attendanceCodes.map(code => (
                      <MenuItem key={code._id} value={code.code}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              backgroundColor: code.color,
                              borderRadius: '50%',
                              mr: 1
                            }}
                          />
                          {code.code} - {code.description}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Montant de la Prime (DA)"
                  type="number"
                  value={premiumAmount}
                  onChange={handlePremiumChange}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">DA</InputAdornment>
                  }}
                  helperText="Applicable uniquement pour les codes avec prime"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceCodeAssignment; 