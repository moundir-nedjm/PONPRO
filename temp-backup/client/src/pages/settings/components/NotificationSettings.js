import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  Grid,
  Button,
  Card,
  CardContent,
  TextField,
  Divider,
  Chip,
  Stack,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  alpha,
  useTheme,
  Alert
} from '@mui/material';
import {
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  Event as EventIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  Assignment as AssignmentIcon,
  Sync as SyncIcon,
  Sms as SmsIcon
} from '@mui/icons-material';

const NotificationSettings = ({ showMessage }) => {
  const theme = useTheme();
  const [settings, setSettings] = useState({
    // Email notifications
    emailNotifications: true,
    emailDailyDigest: false,
    emailWeeklySummary: true,
    
    // Push notifications
    pushNotifications: true,
    pushAttendanceAlert: true,
    pushNewTask: true,
    pushAttendanceValidation: true,
    pushHolidays: false,
    
    // SMS notifications
    smsNotifications: false,
    smsAttendanceAlert: true,
    smsAbsenceWarning: true,
    
    // Notification timing
    notifyBeforeShift: true,
    notifyBeforeShiftMinutes: 30,
    notifyMissedAttendance: true,
    
    // Quiet hours
    enableQuietHours: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
  });

  const [emails, setEmails] = useState(['user@example.com']);
  const [newEmail, setNewEmail] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState(['+213 5 55 123 456']);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value, checked } = event.target;
    setSettings({
      ...settings,
      [name]: event.target.type === 'checkbox' ? checked : value
    });
  };

  const handleAddEmail = () => {
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setErrors({ ...errors, email: 'Adresse email invalide' });
      return;
    }
    
    setEmails([...emails, newEmail]);
    setNewEmail('');
    setErrors({ ...errors, email: null });
  };

  const handleDeleteEmail = (emailToDelete) => {
    setEmails(emails.filter(email => email !== emailToDelete));
  };

  const handleAddPhoneNumber = () => {
    // Simple phone number validation
    const phoneRegex = /^\+?[0-9\s]{10,15}$/;
    if (!phoneRegex.test(newPhoneNumber)) {
      setErrors({ ...errors, phone: 'Numéro de téléphone invalide' });
      return;
    }
    
    setPhoneNumbers([...phoneNumbers, newPhoneNumber]);
    setNewPhoneNumber('');
    setErrors({ ...errors, phone: null });
  };

  const handleDeletePhoneNumber = (phoneToDelete) => {
    setPhoneNumbers(phoneNumbers.filter(phone => phone !== phoneToDelete));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Here you would make an API call to save the settings
    console.log('Notification settings saved:', { 
      ...settings, 
      notificationEmails: emails,
      notificationPhones: phoneNumbers
    });
    showMessage('Paramètres de notification enregistrés avec succès');
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'medium' }}>
        Paramètres de Notification
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Notifications par Email
                </Typography>
              </Box>
              
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={handleChange}
                      name="emailNotifications"
                      color="primary"
                    />
                  }
                  label="Activer les notifications par email"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailDailyDigest}
                      onChange={handleChange}
                      name="emailDailyDigest"
                      color="primary"
                      disabled={!settings.emailNotifications}
                    />
                  }
                  label="Résumé quotidien"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailWeeklySummary}
                      onChange={handleChange}
                      name="emailWeeklySummary"
                      color="primary"
                      disabled={!settings.emailNotifications}
                    />
                  }
                  label="Résumé hebdomadaire"
                />
              </FormGroup>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Adresses email pour les notifications
              </Typography>
              
              <Stack direction="row" sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ajouter une adresse email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email}
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddEmail}
                  disabled={!newEmail}
                >
                  Ajouter
                </Button>
              </Stack>
              
              <List dense>
                {emails.map((email, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <EmailIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={email} />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleDeleteEmail(email)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SmsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Notifications par SMS
                </Typography>
              </Box>
              
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.smsNotifications}
                      onChange={handleChange}
                      name="smsNotifications"
                      color="primary"
                    />
                  }
                  label="Activer les notifications par SMS"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.smsAttendanceAlert}
                      onChange={handleChange}
                      name="smsAttendanceAlert"
                      color="primary"
                      disabled={!settings.smsNotifications}
                    />
                  }
                  label="Alertes de pointage"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.smsAbsenceWarning}
                      onChange={handleChange}
                      name="smsAbsenceWarning"
                      color="primary"
                      disabled={!settings.smsNotifications}
                    />
                  }
                  label="Alertes d'absence"
                />
              </FormGroup>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Numéros de téléphone pour les SMS
              </Typography>
              
              <Stack direction="row" sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ajouter un numéro de téléphone"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddPhoneNumber}
                  disabled={!newPhoneNumber}
                >
                  Ajouter
                </Button>
              </Stack>
              
              <List dense>
                {phoneNumbers.map((phone, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <SmsIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={phone} />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleDeletePhoneNumber(phone)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NotificationsIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Notifications Push
                </Typography>
              </Box>
              
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.pushNotifications}
                      onChange={handleChange}
                      name="pushNotifications"
                      color="primary"
                    />
                  }
                  label="Activer les notifications push"
                />
              </FormGroup>
              
              <Divider sx={{ my: 2 }} />
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <TimeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Alertes de pointage" 
                    secondary="Notifications pour les pointages à effectuer"
                  />
                  <Switch
                    edge="end"
                    checked={settings.pushAttendanceAlert}
                    onChange={handleChange}
                    name="pushAttendanceAlert"
                    disabled={!settings.pushNotifications}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <AssignmentIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Nouvelles tâches" 
                    secondary="Notifications pour les nouvelles tâches assignées"
                  />
                  <Switch
                    edge="end"
                    checked={settings.pushNewTask}
                    onChange={handleChange}
                    name="pushNewTask"
                    disabled={!settings.pushNotifications}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <SyncIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Validation des pointages" 
                    secondary="Notifications lorsqu'un pointage est validé"
                  />
                  <Switch
                    edge="end"
                    checked={settings.pushAttendanceValidation}
                    onChange={handleChange}
                    name="pushAttendanceValidation"
                    disabled={!settings.pushNotifications}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <EventIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Jours fériés" 
                    secondary="Notifications pour les jours fériés à venir"
                  />
                  <Switch
                    edge="end"
                    checked={settings.pushHolidays}
                    onChange={handleChange}
                    name="pushHolidays"
                    disabled={!settings.pushNotifications}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Planification des Notifications
                </Typography>
              </Box>
              
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifyBeforeShift}
                      onChange={handleChange}
                      name="notifyBeforeShift"
                      color="primary"
                    />
                  }
                  label="Notifier avant le début du service"
                />
                
                <Box sx={{ pl: 4, mt: 1, mb: 2 }}>
                  <TextField
                    label="Minutes avant le service"
                    type="number"
                    value={settings.notifyBeforeShiftMinutes}
                    onChange={handleChange}
                    name="notifyBeforeShiftMinutes"
                    disabled={!settings.notifyBeforeShift}
                    size="small"
                    InputProps={{ inputProps: { min: 5, max: 120 } }}
                  />
                </Box>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifyMissedAttendance}
                      onChange={handleChange}
                      name="notifyMissedAttendance"
                      color="primary"
                    />
                  }
                  label="Notifier en cas d'absence de pointage"
                />
                
                <Divider sx={{ my: 2 }} />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableQuietHours}
                      onChange={handleChange}
                      name="enableQuietHours"
                      color="primary"
                    />
                  }
                  label="Activer les heures silencieuses"
                />
                
                <Box sx={{ pl: 4, mt: 1, display: 'flex', gap: 2 }}>
                  <TextField
                    label="Début"
                    type="time"
                    value={settings.quietHoursStart}
                    onChange={handleChange}
                    name="quietHoursStart"
                    disabled={!settings.enableQuietHours}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                  
                  <TextField
                    label="Fin"
                    type="time"
                    value={settings.quietHoursEnd}
                    onChange={handleChange}
                    name="quietHoursEnd"
                    disabled={!settings.enableQuietHours}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </FormGroup>
              
              {settings.enableQuietHours && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Aucune notification ne sera envoyée entre {settings.quietHoursStart} et {settings.quietHoursEnd}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          sx={{
            px: 4, 
            py: 1.2,
            boxShadow: theme => `0px 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
          }}
        >
          Enregistrer les Paramètres
        </Button>
      </Box>
    </Box>
  );
};

export default NotificationSettings; 