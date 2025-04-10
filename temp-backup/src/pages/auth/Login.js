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
  Chip,
  Avatar,
  Tab,
  Tabs,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Info as InfoIcon,
  Help as HelpIcon,
  Security as SecurityIcon,
  Business as BusinessIcon,
  ArrowForward as ArrowForwardIcon,
  Engineering as EngineeringIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import LogoFull from '../../components/auth/LogoFull';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email');
  const [rememberMe, setRememberMe] = useState(false);
  const { login, error, PROJECTS } = useAuth();
  const navigate = useNavigate();

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
      // Use the appropriate login method based on tab selection
      const loginIdentifier = loginMethod === 'email' ? values.email : values.employeeId;
      const success = await login(loginIdentifier, values.password);
      if (success) {
        navigate('/dashboard');
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

  // Define user types with their colors for the demo section
  const userTypes = [
    { role: 'Admin', color: '#4CAF50', description: 'Accès complet au système' },
    { role: 'Chef d\'équipe', color: '#FF9800', description: 'Gestion du pointage pour un projet spécifique', icon: <EngineeringIcon /> },
    { role: 'Employee', color: '#2196F3', description: 'Accès aux fonctionnalités de pointage', icon: <PersonIcon /> }
  ];

  // Demo credentials
  const demoCredentials = [
    { type: 'Admin', email: 'admin@poinpro.com', password: 'admin123' },
    { type: 'Adm HBK', email: 'adm.hbk@poinpro.com', password: 'admhbk123' },
    { type: 'Adm Setif', email: 'adm.setif@poinpro.com', password: 'admsetif123' },
    { type: 'Chef KBK FROID', email: 'kbk@poinpro.com', password: 'kbk123' },
    { type: 'Employee', email: 'employee@poinpro.com', password: 'employee123' },
    { type: 'Chef HBK ELEC', email: 'hbk@poinpro.com', password: 'hbk123' },
    { type: 'Chef HML', email: 'hml@poinpro.com', password: 'hml123' },
    { type: 'Chef REB', email: 'reb@poinpro.com', password: 'reb123' },
    { type: 'Chef DEG', email: 'deg@poinpro.com', password: 'deg123' },
    { type: 'Chef HAMRA', email: 'hamra@poinpro.com', password: 'hamra123' }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', boxShadow: 3 }}>
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

                <Tabs
                  value={loginMethod}
                  onChange={handleLoginMethodChange}
                  indicatorColor="primary"
                  textColor="primary"
                  variant="fullWidth"
                  sx={{ 
                    mb: 3,
                    '& .MuiTab-root': { 
                      fontWeight: 'bold',
                    }
                  }}
                >
                  <Tab 
                    label="Email" 
                    value="email" 
                    icon={<EmailIcon />} 
                    iconPosition="start"
                    sx={{ 
                      color: loginMethod === 'email' ? '#2196F3' : 'inherit',
                      '&.Mui-selected': {
                        backgroundColor: '#2196F320',
                      }
                    }}
                  />
                  <Tab 
                    label="ID Employé" 
                    value="employee" 
                    icon={<PersonIcon />} 
                    iconPosition="start"
                    sx={{ 
                      color: loginMethod === 'employee' ? '#4CAF50' : 'inherit',
                      '&.Mui-selected': {
                        backgroundColor: '#4CAF5020',
                      }
                    }}
                  />
                </Tabs>

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
                          Créer un compte
                        </Typography>
                      </Link>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', boxShadow: 3 }}>
              <CardHeader 
                title="Types d'utilisateurs"
                subheader="Choisissez votre profil pour vous connecter"
                avatar={
                  <Avatar sx={{ bgcolor: '#673AB7' }}>
                    <InfoIcon />
                  </Avatar>
                }
              />
              <Divider />
              <CardContent>
                {userTypes.map((type) => (
                  <Paper 
                    key={type.role} 
                    sx={{ 
                      p: 2, 
                      mb: 2, 
                      display: 'flex', 
                      alignItems: 'center',
                      boxShadow: 2,
                      '&:hover': { boxShadow: 4, bgcolor: `${type.color}05` }
                    }}
                  >
                    <Avatar sx={{ bgcolor: type.color, mr: 2 }}>
                      {type.role === 'Admin' && <SecurityIcon />}
                      {type.role === 'Chef d\'équipe' && <EngineeringIcon />}
                    </Avatar>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mr: 1 }}>
                          {type.role}
                        </Typography>
                        <Chip 
                          label={type.role} 
                          size="small" 
                          sx={{ 
                            bgcolor: type.color,
                            color: 'white',
                            fontWeight: 'bold'
                          }} 
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {type.description}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#333', mb: 2 }}>
                  Projets disponibles
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {PROJECTS.map((project) => (
                    <Chip 
                      key={project}
                      label={project} 
                      color="primary" 
                      variant="outlined"
                      sx={{ fontWeight: 'bold' }}
                    />
                  ))}
                </Box>
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#333', mb: 2 }}>
                  Comptes de démonstration
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  {demoCredentials.map((cred, index) => (
                    <Paper 
                      key={index}
                      sx={{ 
                        p: 1.5, 
                        mb: 1, 
                        display: 'flex', 
                        flexDirection: 'column',
                        boxShadow: 1,
                        '&:hover': { boxShadow: 2 }
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {cred.type}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          <strong>Email:</strong> {cred.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          <strong>Mot de passe:</strong> {cred.password}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
                
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
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Login; 