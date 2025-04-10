import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Card,
  CardContent,
  CardHeader,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import LogoFull from '../../components/auth/LogoFull';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email');
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState(null);
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();

  // Use both local and auth context errors
  const error = localError || authError;

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      employeeId: ''
    },
    validationSchema: Yup.object({
      email: loginMethod === 'email' ? Yup.string()
        .email('Adresse email invalide')
        .required('Email requis') : Yup.string(),
      password: Yup.string()
        .required('Mot de passe requis'),
      employeeId: loginMethod === 'employee' ? Yup.string()
        .required('ID employé requis') : Yup.string()
    }),
    onSubmit: async (values) => {
      const identifier = values.email || values.employeeId;
      console.log(`Submitting login form with: ${identifier}`);
      
      try {
        setLocalError('');
        const success = await login(identifier, values.password);
        if (success) {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Login submission error:', err);
        setLocalError('Erreur de connexion. Veuillez réessayer.');
      }
    }
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLoginMethodChange = (event, newValue) => {
    setLoginMethod(newValue);
  };

  const handleRememberMeChange = (event) => {
    setRememberMe(event.target.checked);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
      py: 4
    }}>
      <Container maxWidth="sm">
        <Card sx={{ boxShadow: 3 }}>
          <CardHeader 
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LogoFull />
              </Box>
            }
            subheader="Système de Pointage Professionnel Algérien"
          />
          <Divider />
          <CardContent>
            <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
              Bienvenue sur POINPRO
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
              Connectez-vous pour accéder à votre espace de gestion de présence et de pointage.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Utilisez les identifiants fournis par l'administrateur pour vous connecter.
            </Alert>

            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: '#f5f5f5' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Button 
                    fullWidth
                    variant={loginMethod === 'email' ? 'contained' : 'outlined'}
                    color="primary"
                    startIcon={<EmailIcon />}
                    onClick={() => setLoginMethod('email')}
                    sx={{ py: 1 }}
                  >
                    Email
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button 
                    fullWidth
                    variant={loginMethod === 'employee' ? 'contained' : 'outlined'}
                    color="primary"
                    startIcon={<PersonIcon />}
                    onClick={() => setLoginMethod('employee')}
                    sx={{ py: 1 }}
                  >
                    ID Employé
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            <form onSubmit={formik.handleSubmit}>
              {loginMethod === 'email' ? (
                <TextField
                  margin="normal"
                  fullWidth
                  id="email"
                  label="Adresse Email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" />
                      </InputAdornment>
                    )
                  }}
                />
              ) : (
                <TextField
                  margin="normal"
                  fullWidth
                  id="employeeId"
                  label="ID Employé"
                  name="employeeId"
                  autoComplete="username"
                  autoFocus
                  value={formik.values.employeeId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.employeeId && Boolean(formik.errors.employeeId)}
                  helperText={formik.touched.employeeId && formik.errors.employeeId}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="primary" />
                      </InputAdornment>
                    )
                  }}
                />
              )}
              <TextField
                margin="normal"
                fullWidth
                name="password"
                label="Mot de Passe"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={rememberMe} 
                      onChange={handleRememberMeChange} 
                      color="primary" 
                    />
                  }
                  label="Se souvenir de moi"
                />
                <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary">
                    Mot de passe oublié?
                  </Typography>
                </Link>
              </Box>
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 3, 
                  mb: 2, 
                  py: 1.5,
                  fontWeight: 'bold',
                  borderRadius: 2,
                  boxShadow: 2
                }}
                disabled={formik.isSubmitting}
                endIcon={<ArrowForwardIcon />}
              >
                Se Connecter
              </Button>
              
              <Grid container justifyContent="center" sx={{ mt: 2 }}>
                <Grid item>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1, display: 'inline' }}>
                    Vous n'avez pas de compte?
                  </Typography>
                  <Link to="/register" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', display: 'inline' }}>
                      Contacter l'administrateur
                    </Typography>
                  </Link>
                </Grid>
              </Grid>
            </form>
            
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} POINPRO - Tous droits réservés
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Version 2.5.0
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login; 