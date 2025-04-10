import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const weekdays = [
  { value: 'monday', label: 'Lundi' },
  { value: 'tuesday', label: 'Mardi' },
  { value: 'wednesday', label: 'Mercredi' },
  { value: 'thursday', label: 'Jeudi' },
  { value: 'friday', label: 'Vendredi' },
  { value: 'saturday', label: 'Samedi' },
  { value: 'sunday', label: 'Dimanche' }
];

const EmployeeSchedule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState({
    weekday: 'monday',
    startTime: '08:00',
    endTime: '17:00',
    isWorkDay: true,
    breakStart: '12:00',
    breakEnd: '13:00'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        // Récupérer les données de l'employé
        const employeeResponse = await fetch(`/api/employees/${id}`);
        if (!employeeResponse.ok) {
          throw new Error('Échec de la récupération des données de l\'employé');
        }
        const employeeData = await employeeResponse.json();
        setEmployee(employeeData.data);

        // Récupérer les horaires de l'employé
        const schedulesResponse = await fetch(`/api/employees/${id}/schedules`);
        if (!schedulesResponse.ok) {
          throw new Error('Échec de la récupération des horaires de l\'employé');
        }
        const schedulesData = await schedulesResponse.json();
        setSchedules(schedulesData.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [id]);

  const handleOpenDialog = (schedule = null) => {
    if (schedule) {
      setCurrentSchedule(schedule);
      setIsEditing(true);
    } else {
      setCurrentSchedule({
        weekday: 'monday',
        startTime: '08:00',
        endTime: '17:00',
        isWorkDay: true,
        breakStart: '12:00',
        breakEnd: '13:00'
      });
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentSchedule({
      ...currentSchedule,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleTimeChange = (name, value) => {
    const timeString = value ? format(value, 'HH:mm') : null;
    setCurrentSchedule({
      ...currentSchedule,
      [name]: timeString
    });
  };

  const handleSubmit = async () => {
    try {
      const url = isEditing
        ? `/api/schedules/${currentSchedule._id}`
        : '/api/schedules';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const payload = {
        ...currentSchedule,
        employee: id
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Échec de l\'enregistrement de l\'horaire');
      }
      
      const result = await response.json();
      
      if (isEditing) {
        setSchedules(schedules.map(schedule => 
          schedule._id === currentSchedule._id ? result.data : schedule
        ));
      } else {
        setSchedules([...schedules, result.data]);
      }
      
      setSnackbar({
        open: true,
        message: `Horaire ${isEditing ? 'modifié' : 'ajouté'} avec succès`,
        severity: 'success'
      });
      
      handleCloseDialog();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  const handleDelete = async (scheduleId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet horaire ?')) {
      try {
        const response = await fetch(`/api/schedules/${scheduleId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Échec de la suppression de l\'horaire');
        }
        
        setSchedules(schedules.filter(schedule => schedule._id !== scheduleId));
        
        setSnackbar({
          open: true,
          message: 'Horaire supprimé avec succès',
          severity: 'success'
        });
      } catch (err) {
        setSnackbar({
          open: true,
          message: err.message,
          severity: 'error'
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getWeekdayLabel = (value) => {
    const day = weekdays.find(day => day.value === value);
    return day ? day.label : value;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(`/employees/${id}`)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          Détails de l'Employé {employee?.name}
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Détails des horaires de travail</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Ajouter un horaire
          </Button>
        </Box>

        {schedules.length === 0 ? (
          <Alert severity="info">Aucun horaire défini pour cet employé</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Jour</TableCell>
                  <TableCell>Début</TableCell>
                  <TableCell>Fin</TableCell>
                  <TableCell>Pause début</TableCell>
                  <TableCell>Pause fin</TableCell>
                  <TableCell>Jour travaillé</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules
                  .sort((a, b) => {
                    const order = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                    return order.indexOf(a.weekday) - order.indexOf(b.weekday);
                  })
                  .map((schedule) => (
                    <TableRow key={schedule._id}>
                      <TableCell>{getWeekdayLabel(schedule.weekday)}</TableCell>
                      <TableCell>{schedule.startTime}</TableCell>
                      <TableCell>{schedule.endTime}</TableCell>
                      <TableCell>{schedule.breakStart || '-'}</TableCell>
                      <TableCell>{schedule.breakEnd || '-'}</TableCell>
                      <TableCell>{schedule.isWorkDay ? 'Oui' : 'Non'}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(schedule)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(schedule._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditing ? 'Modifier l\'horaire' : 'Ajouter un nouvel horaire'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="weekday-label">Jour de la semaine</InputLabel>
                <Select
                  labelId="weekday-label"
                  name="weekday"
                  value={currentSchedule.weekday}
                  onChange={handleInputChange}
                  label="Jour de la semaine"
                >
                  {weekdays.map((day) => (
                    <MenuItem key={day.value} value={day.value}>
                      {day.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <TimePicker
                  label="Heure de début"
                  value={currentSchedule.startTime ? new Date(`2022-01-01T${currentSchedule.startTime}`) : null}
                  onChange={(newValue) => handleTimeChange('startTime', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <TimePicker
                  label="Heure de fin"
                  value={currentSchedule.endTime ? new Date(`2022-01-01T${currentSchedule.endTime}`) : null}
                  onChange={(newValue) => handleTimeChange('endTime', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <TimePicker
                  label="Début de pause"
                  value={currentSchedule.breakStart ? new Date(`2022-01-01T${currentSchedule.breakStart}`) : null}
                  onChange={(newValue) => handleTimeChange('breakStart', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <TimePicker
                  label="Fin de pause"
                  value={currentSchedule.breakEnd ? new Date(`2022-01-01T${currentSchedule.breakEnd}`) : null}
                  onChange={(newValue) => handleTimeChange('breakEnd', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="is-work-day-label">Jour travaillé</InputLabel>
                <Select
                  labelId="is-work-day-label"
                  name="isWorkDay"
                  value={currentSchedule.isWorkDay}
                  onChange={handleInputChange}
                  label="Jour travaillé"
                >
                  <MenuItem value={true}>Oui</MenuItem>
                  <MenuItem value={false}>Non</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmployeeSchedule; 