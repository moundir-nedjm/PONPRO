import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { differenceInCalendarDays, addDays } from 'date-fns';

// Validation schema
const LeaveSchema = Yup.object().shape({
  leaveType: Yup.string()
    .required('Le type de congé est requis'),
  startDate: Yup.date()
    .required('La date de début est requise')
    .min(new Date(), 'La date de début ne peut pas être dans le passé'),
  endDate: Yup.date()
    .required('La date de fin est requise')
    .min(
      Yup.ref('startDate'),
      'La date de fin ne peut pas être antérieure à la date de début'
    ),
  reason: Yup.string()
    .max(500, 'Le motif est trop long')
    .required('Le motif est requis')
});

const leaveTypes = [
  { value: 'annual', label: 'Congé Annuel' },
  { value: 'sick', label: 'Congé Maladie' },
  { value: 'personal', label: 'Congé Personnel' },
  { value: 'maternity', label: 'Congé Maternité' },
  { value: 'paternity', label: 'Congé Paternité' },
  { value: 'unpaid', label: 'Congé Sans Solde' }
];

const LeaveForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isEditMode = Boolean(id);
  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [employeeLeaveBalance, setEmployeeLeaveBalance] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch employee leave balance
        const balanceRes = await axios.get(`/api/employees/${currentUser._id}/leave-balance`);
        setEmployeeLeaveBalance(balanceRes.data.data.leaveBalance || 0);
        
        // If edit mode, fetch leave details
        if (isEditMode) {
          const leaveRes = await axios.get(`/api/leaves/${id}`);
          setLeave(leaveRes.data.data);
          
          // Check if user is authorized to edit this leave
          if (leaveRes.data.data.employee._id !== currentUser._id && currentUser.role !== 'admin') {
            setError('You are not authorized to edit this leave request.');
          }
          
          // Check if leave is still pending
          if (leaveRes.data.data.status !== 'pending') {
            setError('Only pending leave requests can be edited.');
          }
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(
          err.response?.data?.message || 
          err.response?.data?.error || 
          'Failed to load data. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, currentUser._id, currentUser.role]);

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    // Add 1 to include both start and end dates
    return differenceInCalendarDays(end, start) + 1;
  };

  const initialValues = {
    leaveType: leave?.leaveType || 'annual',
    startDate: leave?.startDate ? new Date(leave.startDate) : new Date(),
    endDate: leave?.endDate ? new Date(leave.endDate) : addDays(new Date(), 1),
    reason: leave?.reason || ''
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setSubmitError(null);
      
      // Calculate number of days
      const numberOfDays = calculateDays(values.startDate, values.endDate);
      
      // Check if employee has enough leave balance for annual leave
      if (values.leaveType === 'annual' && numberOfDays > employeeLeaveBalance && !isEditMode) {
        setSubmitError(`Vous n'avez pas assez de solde de congés. Disponible: ${employeeLeaveBalance} jours`);
        setSubmitting(false);
        return;
      }
      
      const leaveData = {
        ...values,
        numberOfDays
      };
      
      if (isEditMode) {
        await axios.put(`/api/leaves/${id}`, leaveData);
      } else {
        await axios.post('/api/leaves', leaveData);
      }
      
      navigate('/leaves');
    } catch (err) {
      console.error('Error saving leave request:', err);
      setSubmitError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Failed to save leave request. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          component={Link}
          to="/leaves"
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Retour aux Demandes de Congé
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          component={Link}
          to="/leaves"
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Retour aux Demandes de Congé
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Modifier la Demande de Congé' : 'Demander un Congé'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {submitError}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Alert severity="info">
            Votre solde de congés actuel: <strong>{employeeLeaveBalance} jours</strong>
          </Alert>
        </Box>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Formik
            initialValues={initialValues}
            validationSchema={LeaveSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, touched, errors, values, handleChange, setFieldValue }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      select
                      fullWidth
                      id="leaveType"
                      name="leaveType"
                      label="Type de Congé"
                      value={values.leaveType}
                      onChange={handleChange}
                      error={touched.leaveType && Boolean(errors.leaveType)}
                      helperText={touched.leaveType && errors.leaveType}
                      variant="outlined"
                      required
                    >
                      {leaveTypes.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Field>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Date de Début"
                      value={values.startDate}
                      onChange={(date) => {
                        setFieldValue('startDate', date);
                        // If end date is before new start date, update end date
                        if (values.endDate < date) {
                          setFieldValue('endDate', date);
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          required
                          error={touched.startDate && Boolean(errors.startDate)}
                          helperText={touched.startDate && errors.startDate}
                        />
                      )}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: touched.startDate && Boolean(errors.startDate),
                          helperText: touched.startDate && errors.startDate
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Date de Fin"
                      value={values.endDate}
                      onChange={(date) => setFieldValue('endDate', date)}
                      minDate={values.startDate}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          required
                          error={touched.endDate && Boolean(errors.endDate)}
                          helperText={touched.endDate && errors.endDate}
                        />
                      )}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: touched.endDate && Boolean(errors.endDate),
                          helperText: touched.endDate && errors.endDate
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Nombre de Jours: {calculateDays(values.startDate, values.endDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      id="reason"
                      name="reason"
                      label="Motif du Congé"
                      value={values.reason}
                      onChange={handleChange}
                      error={touched.reason && Boolean(errors.reason)}
                      helperText={touched.reason && errors.reason}
                      variant="outlined"
                      multiline
                      rows={4}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        component={Link}
                        to="/leaves"
                        variant="outlined"
                        sx={{ mr: 1 }}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Soumission en cours...' : isEditMode ? 'Mettre à jour' : 'Soumettre la Demande'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </LocalizationProvider>
      </Paper>
    </Box>
  );
};

export default LeaveForm; 