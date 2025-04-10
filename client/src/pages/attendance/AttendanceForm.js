import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationOnIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const AttendanceForm = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              });
            },
            (error) => {
              console.error('Error getting location:', error);
            }
          );
        }
        
        // Fetch employees
        await fetchEmployees();
        
        // Fetch today's attendance data
        try {
          const res = await axios.get('/api/attendance/today');
          
          if (res.data && res.data.success) {
            const records = res.data.data.records || [];
            
            // Convert to map for easier lookup
            const attendanceMap = {};
            records.forEach(record => {
              if (record.employee && record.employee._id) {
                attendanceMap[record.employee._id] = {
                  id: record._id,
                  checkIn: record.checkIn ? new Date(record.checkIn.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : null,
                  checkOut: record.checkOut ? new Date(record.checkOut.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : null
                };
              }
            });
            
            setTodayAttendance(attendanceMap);
            
            // If the current user is not an admin or manager, pre-select their employee ID
            if (currentUser.role === 'user' && currentUser.employeeId) {
              if (attendanceMap[currentUser.employeeId]) {
                setSelectedEmployee(currentUser.employeeId);
                
                // Check if the user has already checked in today
                if (attendanceMap[currentUser.employeeId].checkOut) {
                  // Already checked out
                  setError('Vous avez déjà pointé votre entrée et sortie aujourd\'hui');
                } else {
                  // Checked in but not out
                  setIsCheckingOut(true);
                }
              }
            }
          }
        } catch (err) {
          console.error('Error fetching today\'s attendance:', err);
          setTodayAttendance({});
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Erreur lors du chargement des données');
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/employees/active');
      
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setEmployees(res.data.data);
      } else if (Array.isArray(res.data)) {
        setEmployees(res.data);
      } else {
        setEmployees([]);
      }
      
      // Try to find employee matching current user
      if (currentUser && currentUser.employeeId) {
        const userEmployee = res.data.data.find(emp => 
          emp._id === currentUser.employeeId || emp.id === currentUser.employeeId
        );
        if (userEmployee) {
          setSelectedEmployee(userEmployee);
        }
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeChange = (event) => {
    const employeeId = event.target.value;
    setSelectedEmployee(employeeId);
    
    // Check if the employee has already checked in today
    if (todayAttendance && todayAttendance[employeeId]) {
      if (todayAttendance[employeeId].checkOut) {
        // Already checked out
        setError('Cet employé a déjà pointé son entrée et sa sortie aujourd\'hui');
        setIsCheckingOut(false);
      } else {
        // Checked in but not out
        setError(null);
        setIsCheckingOut(true);
      }
    } else {
      // Not checked in yet
      setError(null);
      setIsCheckingOut(false);
    }
  };

  const handleNotesChange = (event) => {
    setNotes(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      setLoading(true);
      
      // In a real application, you would call your API to save the attendance record
      // For now, we'll just simulate a successful submission
      
      // Prepare data for API
      const attendanceData = {
        employee: selectedEmployee,
        notes,
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude
        } : null
      };
      
      console.log('Attendance data:', attendanceData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      if (isCheckingOut) {
        setSuccess('Pointage de sortie enregistré avec succès');
      } else {
        setSuccess('Pointage d\'entrée enregistré avec succès');
      }
      
      // Reset form
      setNotes('');
      
      // Redirect after a delay
      setTimeout(() => {
        navigate('/attendance');
      }, 2000);
    } catch (err) {
      console.error('Error saving attendance:', err);
      setError('Erreur lors de l\'enregistrement du pointage');
      setLoading(false);
    }
  };

  if (loading && !success) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          component={Link}
          to="/attendance"
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {isCheckingOut ? 'Pointage de Sortie' : 'Pointage d\'Entrée'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Typography variant="h6" gutterBottom>
                {isCheckingOut ? 'Enregistrer une Sortie' : 'Enregistrer une Entrée'}
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth disabled={currentUser.role === 'user' || success}>
                    <InputLabel id="employee-label">Employé</InputLabel>
                    <Select
                      labelId="employee-label"
                      id="employee"
                      value={selectedEmployee}
                      label="Employé"
                      onChange={handleEmployeeChange}
                      required
                    >
                      {employees.map((employee) => (
                        <MenuItem key={employee.id} value={employee.id}>
                          {employee.firstName} {employee.lastName} ({employee.employeeId})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="notes"
                    name="notes"
                    label="Notes (optionnel)"
                    multiline
                    rows={3}
                    value={notes}
                    onChange={handleNotesChange}
                    disabled={success}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {location 
                        ? `Localisation: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` 
                        : 'Localisation non disponible'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color={isCheckingOut ? 'secondary' : 'primary'}
                    fullWidth
                    size="large"
                    startIcon={<AccessTimeIcon />}
                    disabled={!selectedEmployee || success || (todayAttendance && todayAttendance[selectedEmployee]?.checkOut)}
                  >
                    {isCheckingOut ? 'Pointer la Sortie' : 'Pointer l\'Entrée'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informations
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {selectedEmployeeData ? (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    {selectedEmployeeData.firstName} {selectedEmployeeData.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    ID: {selectedEmployeeData.employeeId}
                  </Typography>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Statut Aujourd'hui:
                    </Typography>
                    {todayAttendance && todayAttendance[selectedEmployee] ? (
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
                          <Typography variant="body2">
                            Entrée: {todayAttendance[selectedEmployee].checkIn}
                          </Typography>
                        </Box>
                        {todayAttendance[selectedEmployee].checkOut && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'error.main' }} />
                            <Typography variant="body2">
                              Sortie: {todayAttendance[selectedEmployee].checkOut}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Chip 
                        label="Pas encore pointé aujourd'hui" 
                        color="warning" 
                        size="small" 
                      />
                    )}
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      <NotesIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                      N'oubliez pas de pointer votre sortie à la fin de la journée.
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Sélectionnez un employé pour voir ses informations.
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Instructions
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1, mt: 0.3 }} />
                <Typography variant="body2">
                  Pointez votre entrée dès votre arrivée au travail.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <CheckCircleIcon color="success" sx={{ mr: 1, mt: 0.3 }} />
                <Typography variant="body2">
                  Pointez votre sortie avant de quitter le lieu de travail.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <CheckCircleIcon color="success" sx={{ mr: 1, mt: 0.3 }} />
                <Typography variant="body2">
                  Assurez-vous que votre localisation est activée pour un pointage précis.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AttendanceForm; 