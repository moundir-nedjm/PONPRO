import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [initialValues, setInitialValues] = useState({
    firstName: '',
    lastName: '',
    employeeId: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    hireDate: new Date(),
    birthDate: new Date(1990, 0, 1),
    gender: 'male',
    nationalId: '',
    street: '',
    city: '',
    wilaya: '',
    postalCode: '',
    active: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real application, you would fetch this data from your API
        // For now, we'll use mock data
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock departments data
        const mockDepartments = [
          { id: '1', name: 'Administration' },
          { id: '2', name: 'Ressources Humaines' },
          { id: '3', name: 'Finance' },
          { id: '4', name: 'Informatique' },
          { id: '5', name: 'Marketing' },
          { id: '6', name: 'Production' }
        ];
        
        setDepartments(mockDepartments);
        
        if (isEditMode) {
          // Mock employee data for edit mode
          const mockEmployee = {
            id: '1',
            firstName: 'Ahmed',
            lastName: 'Benali',
            employeeId: 'EMP001',
            email: 'ahmed.benali@example.com',
            phone: '+213 555 123 456',
            position: 'Développeur Senior',
            department: '4', // ID of Informatique
            hireDate: '2020-05-15',
            birthDate: '1988-10-20',
            gender: 'male',
            nationalId: '88102012345',
            address: {
              street: '15 Rue des Oliviers',
              city: 'Alger',
              wilaya: 'Alger',
              postalCode: '16000'
            },
            active: true
          };
          
          setInitialValues({
            firstName: mockEmployee.firstName,
            lastName: mockEmployee.lastName,
            employeeId: mockEmployee.employeeId,
            email: mockEmployee.email,
            phone: mockEmployee.phone,
            position: mockEmployee.position,
            department: mockEmployee.department,
            hireDate: new Date(mockEmployee.hireDate),
            birthDate: new Date(mockEmployee.birthDate),
            gender: mockEmployee.gender,
            nationalId: mockEmployee.nationalId,
            street: mockEmployee.address.street,
            city: mockEmployee.address.city,
            wilaya: mockEmployee.address.wilaya,
            postalCode: mockEmployee.address.postalCode,
            active: mockEmployee.active
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Erreur lors du chargement des données');
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .required('Le prénom est requis')
      .max(50, 'Le prénom ne peut pas dépasser 50 caractères'),
    lastName: Yup.string()
      .required('Le nom est requis')
      .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
    employeeId: Yup.string()
      .required('L\'ID employé est requis'),
    email: Yup.string()
      .email('Adresse email invalide')
      .required('L\'email est requis'),
    phone: Yup.string()
      .required('Le numéro de téléphone est requis'),
    position: Yup.string()
      .required('Le poste est requis'),
    department: Yup.string()
      .required('Le département est requis'),
    hireDate: Yup.date()
      .required('La date d\'embauche est requise'),
    birthDate: Yup.date()
      .required('La date de naissance est requise')
      .max(new Date(), 'La date de naissance ne peut pas être dans le futur'),
    gender: Yup.string()
      .required('Le genre est requis'),
    nationalId: Yup.string()
      .required('Le numéro d\'identité nationale est requis'),
    street: Yup.string()
      .required('La rue est requise'),
    city: Yup.string()
      .required('La ville est requise'),
    wilaya: Yup.string()
      .required('La wilaya est requise'),
    postalCode: Yup.string()
      .required('Le code postal est requis')
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        // In a real application, you would call your API to save the employee
        // For now, we'll just log the values and navigate back
        
        console.log('Form values:', values);
        
        // Prepare data for API
        const employeeData = {
          firstName: values.firstName,
          lastName: values.lastName,
          employeeId: values.employeeId,
          email: values.email,
          phone: values.phone,
          position: values.position,
          department: values.department,
          hireDate: values.hireDate,
          birthDate: values.birthDate,
          gender: values.gender,
          nationalId: values.nationalId,
          address: {
            street: values.street,
            city: values.city,
            wilaya: values.wilaya,
            postalCode: values.postalCode
          },
          active: values.active
        };
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Navigate back to employee list or detail page
        if (isEditMode) {
          navigate(`/employees/${id}`);
        } else {
          navigate('/employees');
        }
      } catch (err) {
        console.error('Error saving employee:', err);
        setError('Erreur lors de l\'enregistrement de l\'employé');
      }
    }
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          component={Link}
          to={isEditMode ? `/employees/${id}` : '/employees'}
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {isEditMode ? 'Modifier l\'Employé' : 'Nouvel Employé'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Personal Information Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informations Personnelles
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="firstName"
                name="firstName"
                label="Prénom"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                helperText={formik.touched.firstName && formik.errors.firstName}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="lastName"
                name="lastName"
                label="Nom"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                helperText={formik.touched.lastName && formik.errors.lastName}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <DatePicker
                  label="Date de Naissance"
                  value={formik.values.birthDate}
                  onChange={(value) => formik.setFieldValue('birthDate', value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      id="birthDate"
                      name="birthDate"
                      error={formik.touched.birthDate && Boolean(formik.errors.birthDate)}
                      helperText={formik.touched.birthDate && formik.errors.birthDate}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Genre</FormLabel>
                <RadioGroup
                  row
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                >
                  <FormControlLabel value="male" control={<Radio />} label="Homme" />
                  <FormControlLabel value="female" control={<Radio />} label="Femme" />
                </RadioGroup>
                {formik.touched.gender && formik.errors.gender && (
                  <FormHelperText error>{formik.errors.gender}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="nationalId"
                name="nationalId"
                label="Numéro d'Identité Nationale"
                value={formik.values.nationalId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.nationalId && Boolean(formik.errors.nationalId)}
                helperText={formik.touched.nationalId && formik.errors.nationalId}
              />
            </Grid>

            {/* Employment Information Section */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Informations Professionnelles
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="employeeId"
                name="employeeId"
                label="ID Employé"
                value={formik.values.employeeId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.employeeId && Boolean(formik.errors.employeeId)}
                helperText={formik.touched.employeeId && formik.errors.employeeId}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="phone"
                name="phone"
                label="Téléphone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="position"
                name="position"
                label="Poste"
                value={formik.values.position}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.position && Boolean(formik.errors.position)}
                helperText={formik.touched.position && formik.errors.position}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl 
                fullWidth
                error={formik.touched.department && Boolean(formik.errors.department)}
              >
                <InputLabel id="department-label">Département</InputLabel>
                <Select
                  labelId="department-label"
                  id="department"
                  name="department"
                  value={formik.values.department}
                  label="Département"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.department && formik.errors.department && (
                  <FormHelperText>{formik.errors.department}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <DatePicker
                  label="Date d'Embauche"
                  value={formik.values.hireDate}
                  onChange={(value) => formik.setFieldValue('hireDate', value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      id="hireDate"
                      name="hireDate"
                      error={formik.touched.hireDate && Boolean(formik.errors.hireDate)}
                      helperText={formik.touched.hireDate && formik.errors.hireDate}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.active}
                    onChange={(e) => formik.setFieldValue('active', e.target.checked)}
                    name="active"
                    color="success"
                  />
                }
                label="Employé Actif"
              />
            </Grid>

            {/* Address Section */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Adresse
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="street"
                name="street"
                label="Rue"
                value={formik.values.street}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.street && Boolean(formik.errors.street)}
                helperText={formik.touched.street && formik.errors.street}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="city"
                name="city"
                label="Ville"
                value={formik.values.city}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.city && Boolean(formik.errors.city)}
                helperText={formik.touched.city && formik.errors.city}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="wilaya"
                name="wilaya"
                label="Wilaya"
                value={formik.values.wilaya}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.wilaya && Boolean(formik.errors.wilaya)}
                helperText={formik.touched.wilaya && formik.errors.wilaya}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="postalCode"
                name="postalCode"
                label="Code Postal"
                value={formik.values.postalCode}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.postalCode && Boolean(formik.errors.postalCode)}
                helperText={formik.touched.postalCode && formik.errors.postalCode}
              />
            </Grid>

            {/* Form Actions */}
            <Grid item xs={12} sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                component={Link}
                to={isEditMode ? `/employees/${id}` : '/employees'}
                variant="outlined"
                color="secondary"
                startIcon={<CancelIcon />}
                sx={{ mr: 2 }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={formik.isSubmitting}
              >
                {isEditMode ? 'Mettre à jour' : 'Enregistrer'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default EmployeeForm; 