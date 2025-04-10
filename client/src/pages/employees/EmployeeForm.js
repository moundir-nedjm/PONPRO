import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
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
import apiClient from '../../utils/api';

const EmployeeForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
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
    active: true,
    contractEndDate: null,
    maritalStatus: '',
    insuranceNumber: '',
    insuranceProvider: '',
    dependents: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch departments from API
        const departmentsResponse = await apiClient.get('/departments');
        
        if (departmentsResponse.data.success) {
          // Transform departments data to match the format expected by the form
          const departmentsData = departmentsResponse.data.data.map(dept => ({
            id: dept._id,
            name: dept.name
          }));
          
          setDepartments(departmentsData);
        } else {
          throw new Error('Failed to fetch departments');
        }
        
        if (isEditMode) {
          console.log('Edit mode detected, fetching employee with ID:', id);
          
          // Fetch employee data for edit mode
          const employeeResponse = await apiClient.get(`/employees/${id}`);
          
          console.log('Employee edit data response:', employeeResponse?.data);
          
          if (employeeResponse.data.success) {
            const employeeData = employeeResponse.data.data;
            
            // Ensure we have the correct department ID format
            let departmentId = employeeData.department;
            if (typeof departmentId === 'object' && departmentId._id) {
              departmentId = departmentId._id;
            }
            
            setInitialValues({
              firstName: employeeData.firstName,
              lastName: employeeData.lastName,
              employeeId: employeeData.employeeId,
              email: employeeData.email,
              phone: employeeData.phone || '',
              position: employeeData.position,
              department: departmentId,
              hireDate: new Date(employeeData.hireDate),
              birthDate: employeeData.birthDate ? new Date(employeeData.birthDate) : new Date(1990, 0, 1),
              gender: employeeData.gender || 'male',
              nationalId: employeeData.nationalId || '',
              street: employeeData.address?.street || '',
              city: employeeData.address?.city || '',
              wilaya: employeeData.address?.wilaya || '',
              postalCode: employeeData.address?.postalCode || '',
              active: employeeData.active,
              contractEndDate: employeeData.contractEndDate ? new Date(employeeData.contractEndDate) : null,
              maritalStatus: employeeData.maritalStatus || '',
              insuranceNumber: employeeData.insurance?.number || '',
              insuranceProvider: employeeData.insurance?.provider || '',
              dependents: employeeData.insurance?.dependents || 0
            });
          } else {
            throw new Error('Failed to fetch employee data');
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Erreur lors du chargement des données. Vérifiez l\'identifiant de l\'employé et réessayez.');
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  // Limit department options based on user role
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin' && currentUser.projects) {
      // For department heads, limit department choices to their assigned projects
      const availableDepartments = departments.filter(
        dept => currentUser.projects.includes(dept.name)
      );
      
      if (availableDepartments.length > 0 && !isEditMode) {
        // Auto-select the first available department for new employees
        setInitialValues(prev => ({
          ...prev,
          department: availableDepartments[0].id
        }));
      }
    }
  }, [departments, currentUser, isEditMode]);

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
      .required('Le code postal est requis'),
    maritalStatus: Yup.string(),
    insuranceNumber: Yup.string(),
    insuranceProvider: Yup.string(),
    dependents: Yup.number().min(0, 'Le nombre de personnes à charge ne peut pas être négatif')
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        setError(null); // Clear previous errors
        
        // Prepare data for API
        const employeeData = {
          firstName: values.firstName,
          lastName: values.lastName,
          employeeId: values.employeeId,
          email: values.email,
          phone: values.phone,
          position: values.position,
          department: values.department,
          // Store the department name for easier filtering
          departmentName: departments.find(d => d.id === values.department)?.name || '',
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
          active: values.active,
          contractEndDate: values.contractEndDate,
          maritalStatus: values.maritalStatus,
          insurance: {
            number: values.insuranceNumber,
            provider: values.insuranceProvider,
            dependents: values.dependents
          }
        };
        
        console.log('Saving employee data:', employeeData);
        
        // Validate essential fields
        if (!employeeData.department) {
          throw new Error('Département non sélectionné. Veuillez sélectionner un département valide.');
        }
        
        // Call API endpoint based on edit or create mode
        let response;
        if (isEditMode) {
          response = await apiClient.put(`/employees/${id}`, employeeData);
        } else {
          response = await apiClient.post('/employees', employeeData);
        }
        
        if (response && response.data.success) {
          console.log('Employee saved successfully:', response.data);
          
          // Navigate back to employee list or detail page
          if (isEditMode) {
            navigate(`/employees/${id}`);
          } else {
            navigate('/employees');
          }
        } else {
          throw new Error(response?.data?.message || 'Failed to save employee data');
        }
      } catch (err) {
        console.error('Error saving employee:', err);
        
        // Extract error message from the API response if possible
        let errorMessage = 'Erreur lors de l\'enregistrement de l\'employé';
        
        if (err.response && err.response.data) {
          // More detailed error from API
          if (err.response.data.message) {
            errorMessage = err.response.data.message;
          }
          
          // If there are validation errors, list them
          if (err.response.data.errors) {
            const validationErrors = Object.entries(err.response.data.errors)
              .map(([field, message]) => `${field}: ${message}`)
              .join(', ');
            
            errorMessage += ` - ${validationErrors}`;
          }
          
          // Check for missing fields specifically
          if (err.response.data.message && err.response.data.message.includes('Missing required fields')) {
            errorMessage = err.response.data.message;
          }
          
          // Check for duplicate key errors
          if (err.response.data.message && err.response.data.message.includes('Duplicate')) {
            errorMessage = err.response.data.message;
            // If we know which field caused the issue
            if (err.response.data.field) {
              const fieldLabels = {
                'email': 'Email',
                'employeeId': 'ID Employé'
              };
              const fieldLabel = fieldLabels[err.response.data.field] || err.response.data.field;
              errorMessage = `${fieldLabel} déjà utilisé. Veuillez en choisir un autre.`;
            }
          }
        } else if (err.message) {
          // Use the error object's message
          errorMessage = err.message;
        }
        
        // If it's a network error (no response)
        if (err.request && !err.response) {
          errorMessage = 'Erreur de connexion au serveur. Vérifiez que le serveur est en cours d\'exécution.';
        }
        
        setError(errorMessage);
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
              <FormControl fullWidth>
                <InputLabel id="maritalStatus-label">Situation Familiale</InputLabel>
                <Select
                  labelId="maritalStatus-label"
                  id="maritalStatus"
                  name="maritalStatus"
                  value={formik.values.maritalStatus}
                  label="Situation Familiale"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="single">Célibataire</MenuItem>
                  <MenuItem value="married">Marié(e)</MenuItem>
                  <MenuItem value="divorced">Divorcé(e)</MenuItem>
                  <MenuItem value="widowed">Veuf/Veuve</MenuItem>
                  <MenuItem value="pacs">Pacsé(e)</MenuItem>
                </Select>
              </FormControl>
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

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <DatePicker
                  label="Date de Fin de Contrat"
                  value={formik.values.contractEndDate}
                  onChange={(value) => formik.setFieldValue('contractEndDate', value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      id="contractEndDate"
                      name="contractEndDate"
                      error={formik.touched.contractEndDate && Boolean(formik.errors.contractEndDate)}
                      helperText={formik.touched.contractEndDate && formik.errors.contractEndDate}
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

            {/* Insurance Information Section */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Informations d'Assurance
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="insuranceProvider"
                name="insuranceProvider"
                label="Prestataire d'Assurance"
                value={formik.values.insuranceProvider}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.insuranceProvider && Boolean(formik.errors.insuranceProvider)}
                helperText={formik.touched.insuranceProvider && formik.errors.insuranceProvider}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="insuranceNumber"
                name="insuranceNumber"
                label="Numéro d'Assurance"
                value={formik.values.insuranceNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.insuranceNumber && Boolean(formik.errors.insuranceNumber)}
                helperText={formik.touched.insuranceNumber && formik.errors.insuranceNumber}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="dependents"
                name="dependents"
                label="Nombre de Personnes à Charge"
                type="number"
                value={formik.values.dependents}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.dependents && Boolean(formik.errors.dependents)}
                helperText={formik.touched.dependents && formik.errors.dependents}
                InputProps={{ inputProps: { min: 0 } }}
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