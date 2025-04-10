import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Switch,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
  useTheme,
  Stack,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  LinearProgress,
  FormGroup,
  Chip
} from '@mui/material';
import {
  VisibilityOff,
  Visibility,
  Lock as LockIcon,
  Password as PasswordIcon,
  PhoneAndroid as PhoneIcon,
  Security as SecurityIcon,
  Delete as DeleteIcon,
  RemoveRedEye as EyeIcon,
  NoEncryption as NoEncryptionIcon,
  Fingerprint as FingerprintIcon,
  Key as KeyIcon,
  Schedule as ScheduleIcon,
  PhonelinkLock as DeviceLockIcon,
  LocationOn as LocationIcon,
  Block as BlockIcon,
  History as HistoryIcon,
  Computer as ComputerIcon
} from '@mui/icons-material';

// List of devices
const devices = [
  {
    id: 1,
    name: 'Ordinateur personnel',
    browser: 'Chrome',
    os: 'Windows 10',
    lastLogin: 'Aujourd\'hui, 10:25',
    ip: '192.168.1.1',
    location: 'Alger, Algérie',
    current: true
  },
  {
    id: 2,
    name: 'Téléphone mobile',
    browser: 'Safari',
    os: 'iOS 15',
    lastLogin: 'Hier, 18:45',
    ip: '41.107.xx.xx',
    location: 'Oran, Algérie',
    current: false
  },
  {
    id: 3,
    name: 'Tablette de bureau',
    browser: 'Firefox',
    os: 'Android 12',
    lastLogin: '15/05/2023, 09:12',
    ip: '196.20.xx.xx',
    location: 'Constantine, Algérie',
    current: false
  }
];

// Password strength indicator
const calculatePasswordStrength = (password) => {
  if (!password) return { score: 0, label: 'Aucun', color: '#ccc' };
  
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Character type checks
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  // Determine label and color based on score
  const strengthMap = [
    { score: 0, label: 'Aucun', color: '#ccc' },
    { score: 2, label: 'Faible', color: '#f44336' },
    { score: 4, label: 'Moyen', color: '#ff9800' },
    { score: 5, label: 'Fort', color: '#4caf50' },
    { score: 6, label: 'Très fort', color: '#2e7d32' }
  ];
  
  return strengthMap.find(s => score <= s.score) || strengthMap[strengthMap.length - 1];
};

const SecuritySettings = ({ showMessage }) => {
  const theme = useTheme();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmLogoutDialogOpen, setConfirmLogoutDialogOpen] = useState(false);
  const [deviceToLogout, setDeviceToLogout] = useState(null);
  
  const [settings, setSettings] = useState({
    // Password
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    
    // Two-factor authentication
    twoFactorEnabled: false,
    twoFactorMethod: 'sms',
    phoneNumber: '',
    
    // Session settings
    sessionTimeout: 30,
    rememberDevice: true,
    
    // Security restrictions
    restrictUnknownDevices: false,
    restrictUnknownLocations: false,
    requirePasswordChange: 90, // days
  });

  const handleChange = (event) => {
    const { name, value, checked } = event.target;
    setSettings({
      ...settings,
      [name]: event.target.type === 'checkbox' ? checked : value
    });
  };

  const handleClickShowPassword = (field) => {
    if (field === 'currentPassword') setShowCurrentPassword(!showCurrentPassword);
    if (field === 'newPassword') setShowNewPassword(!showNewPassword);
    if (field === 'confirmPassword') setShowConfirmPassword(!showConfirmPassword);
  };

  const handleConfirmLogout = (device) => {
    setDeviceToLogout(device);
    setConfirmLogoutDialogOpen(true);
  };

  const handleDeviceLogout = () => {
    // Here you would make an API call to log out the device
    console.log('Logging out device:', deviceToLogout);
    showMessage(`Session terminée pour l'appareil: ${deviceToLogout.name}`);
    setConfirmLogoutDialogOpen(false);
  };

  const handlePasswordChange = (event) => {
    event.preventDefault();
    
    // Validate form
    if (!settings.currentPassword) {
      showMessage('Veuillez entrer votre mot de passe actuel', 'error');
      return;
    }
    
    if (settings.newPassword.length < 8) {
      showMessage('Le nouveau mot de passe doit contenir au moins 8 caractères', 'error');
      return;
    }
    
    if (settings.newPassword !== settings.confirmPassword) {
      showMessage('Les mots de passe ne correspondent pas', 'error');
      return;
    }
    
    // Here you would make an API call to change the password
    console.log('Changing password');
    showMessage('Mot de passe modifié avec succès');
    
    // Reset form
    setSettings({
      ...settings,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleSaveSettings = (event) => {
    event.preventDefault();
    // Here you would make an API call to save the settings
    console.log('Security settings saved:', settings);
    showMessage('Paramètres de sécurité enregistrés avec succès');
  };

  // Calculate password strength
  const passwordStrength = calculatePasswordStrength(settings.newPassword);

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'medium' }}>
        Paramètres de Sécurité
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PasswordIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Changer le Mot de Passe
                </Typography>
              </Box>
              
              <Box component="form" onSubmit={handlePasswordChange} sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Mot de passe actuel"
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={settings.currentPassword}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => handleClickShowPassword('currentPassword')}
                          edge="end"
                        >
                          {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                
                <TextField
                  fullWidth
                  margin="normal"
                  label="Nouveau mot de passe"
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={settings.newPassword}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => handleClickShowPassword('newPassword')}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                
                {settings.newPassword && (
                  <Box sx={{ mt: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption">Force du mot de passe</Typography>
                      <Typography variant="caption" sx={{ color: passwordStrength.color }}>
                        {passwordStrength.label}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(passwordStrength.score / 6) * 100}
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.grey[500], 0.2),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: passwordStrength.color
                        }
                      }}
                    />
                  </Box>
                )}
                
                <TextField
                  fullWidth
                  margin="normal"
                  label="Confirmer le nouveau mot de passe"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={settings.confirmPassword}
                  onChange={handleChange}
                  error={settings.newPassword && settings.confirmPassword && settings.newPassword !== settings.confirmPassword}
                  helperText={settings.newPassword && settings.confirmPassword && settings.newPassword !== settings.confirmPassword ? 'Les mots de passe ne correspondent pas' : ''}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => handleClickShowPassword('confirmPassword')}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                
                <Box sx={{ mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={!settings.currentPassword || !settings.newPassword || !settings.confirmPassword}
                  >
                    Changer le Mot de Passe
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PhoneIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Authentification à Deux Facteurs
                </Typography>
              </Box>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.twoFactorEnabled}
                    onChange={handleChange}
                    name="twoFactorEnabled"
                    color="primary"
                  />
                }
                label="Activer l'authentification à deux facteurs"
              />
              
              {settings.twoFactorEnabled && (
                <Box sx={{ mt: 2 }}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="two-factor-method-label">Méthode d'authentification</InputLabel>
                    <Select
                      labelId="two-factor-method-label"
                      id="twoFactorMethod"
                      name="twoFactorMethod"
                      value={settings.twoFactorMethod}
                      label="Méthode d'authentification"
                      onChange={handleChange}
                    >
                      <MenuItem value="sms">SMS</MenuItem>
                      <MenuItem value="email">Email</MenuItem>
                      <MenuItem value="app">Application d'authentification</MenuItem>
                    </Select>
                  </FormControl>
                  
                  {settings.twoFactorMethod === 'sms' && (
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Numéro de téléphone"
                      name="phoneNumber"
                      value={settings.phoneNumber}
                      onChange={handleChange}
                      placeholder="+213 X XX XX XX XX"
                    />
                  )}
                  
                  {settings.twoFactorMethod === 'app' && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 160,
                          height: 160,
                          border: `1px solid ${theme.palette.divider}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2,
                          p: 1
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Code QR à scanner avec votre application d'authentification
                        </Typography>
                      </Box>
                      
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Code de secours
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        XXXX-XXXX-XXXX-XXXX
                      </Typography>
                      
                      <Alert severity="warning" sx={{ mt: 2, textAlign: 'left' }}>
                        Notez ce code de secours et gardez-le en lieu sûr. Il vous permettra de vous connecter si vous perdez l'accès à votre appareil d'authentification.
                      </Alert>
                    </Box>
                  )}
                  
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                  >
                    {settings.twoFactorMethod === 'app' ? 'Vérifier le code' : 'Envoyer le code de vérification'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SecurityIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Restrictions de Sécurité
                </Typography>
              </Box>
              
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.restrictUnknownDevices}
                      onChange={handleChange}
                      name="restrictUnknownDevices"
                      color="primary"
                    />
                  }
                  label="Bloquer les connexions depuis de nouveaux appareils"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.restrictUnknownLocations}
                      onChange={handleChange}
                      name="restrictUnknownLocations"
                      color="primary"
                    />
                  }
                  label="Bloquer les connexions depuis des emplacements inhabituels"
                />
              </FormGroup>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Politique de mot de passe
                </Typography>
                
                <FormControl fullWidth margin="normal" size="small">
                  <InputLabel id="password-change-label">Exiger le changement de mot de passe tous les</InputLabel>
                  <Select
                    labelId="password-change-label"
                    id="requirePasswordChange"
                    name="requirePasswordChange"
                    value={settings.requirePasswordChange}
                    label="Exiger le changement de mot de passe tous les"
                    onChange={handleChange}
                  >
                    <MenuItem value={30}>30 jours</MenuItem>
                    <MenuItem value={60}>60 jours</MenuItem>
                    <MenuItem value={90}>90 jours</MenuItem>
                    <MenuItem value={180}>180 jours</MenuItem>
                    <MenuItem value={0}>Jamais</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Paramètres de session
                </Typography>
                
                <FormControl fullWidth margin="normal" size="small">
                  <InputLabel id="session-timeout-label">Déconnexion automatique après inactivité</InputLabel>
                  <Select
                    labelId="session-timeout-label"
                    id="sessionTimeout"
                    name="sessionTimeout"
                    value={settings.sessionTimeout}
                    label="Déconnexion automatique après inactivité"
                    onChange={handleChange}
                  >
                    <MenuItem value={5}>5 minutes</MenuItem>
                    <MenuItem value={15}>15 minutes</MenuItem>
                    <MenuItem value={30}>30 minutes</MenuItem>
                    <MenuItem value={60}>1 heure</MenuItem>
                    <MenuItem value={120}>2 heures</MenuItem>
                    <MenuItem value={0}>Jamais</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.rememberDevice}
                      onChange={handleChange}
                      name="rememberDevice"
                      color="primary"
                    />
                  }
                  label="Se souvenir des appareils approuvés pendant 30 jours"
                />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DeviceLockIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Appareils Connectés
                </Typography>
              </Box>
              
              <List sx={{ width: '100%' }}>
                {devices.map((device) => (
                  <React.Fragment key={device.id}>
                    <ListItem 
                      alignItems="flex-start"
                      secondaryAction={
                        !device.current && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<BlockIcon />}
                            onClick={() => handleConfirmLogout(device)}
                          >
                            Déconnecter
                          </Button>
                        )
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: device.current ? 'primary.main' : 'grey.400' }}>
                          <ComputerIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {device.name}
                            {device.current && (
                              <Chip 
                                label="Cet appareil" 
                                size="small" 
                                color="primary" 
                                sx={{ ml: 1, height: 20 }} 
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {device.browser} sur {device.os}
                            </Typography>
                            <Typography component="div" variant="caption" color="text.secondary">
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <HistoryIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                                  {device.lastLogin}
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <LocationIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                                  {device.location}
                                </Box>
                              </Box>
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="button"
          variant="contained"
          color="primary"
          startIcon={<LockIcon />}
          onClick={handleSaveSettings}
          sx={{
            px: 4, 
            py: 1.2,
            boxShadow: theme => `0px 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
          }}
        >
          Enregistrer les Paramètres de Sécurité
        </Button>
      </Box>
      
      {/* Confirm logout dialog */}
      <Dialog
        open={confirmLogoutDialogOpen}
        onClose={() => setConfirmLogoutDialogOpen(false)}
      >
        <DialogTitle>Confirmer la déconnexion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir déconnecter l'appareil "{deviceToLogout?.name}"? Cette action terminera toutes les sessions actives sur cet appareil.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmLogoutDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleDeviceLogout} color="error" variant="contained">
            Déconnecter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecuritySettings; 