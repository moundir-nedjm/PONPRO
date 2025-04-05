import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  TextField, 
  Grid, 
  Button, 
  CircularProgress, 
  Alert, 
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  InputAdornment,
  Switch,
  FormControlLabel,
  Chip
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Business as BusinessIcon,
  Language as LanguageIcon,
  AccessTime as AccessTimeIcon,
  CalendarMonth as CalendarMonthIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useSettings } from '../../../../context/SettingsContext';
import { useOrganization } from '../../../../context/OrganizationContext';

// TabPanel component for tab management
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`org-tabpanel-${index}`}
      aria-labelledby={`org-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `org-tab-${index}`,
    'aria-controls': `org-tabpanel-${index}`,
  };
}

const OrganizationSettings = () => {
  const { showStatus } = useSettings();
  const { 
    organizationSettings,
    loading: contextLoading,
    error: contextError,
    saveOrganizationSettings 
  } = useOrganization();
  
  const [localSettings, setLocalSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  // Initialize local state with context data when component mounts
  useEffect(() => {
    if (organizationSettings) {
      setLocalSettings(organizationSettings);
    }
  }, [organizationSettings]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChange = (section, field) => (event) => {
    if (section) {
      setLocalSettings({
        ...localSettings,
        [section]: {
          ...localSettings[section],
          [field]: event.target.value
        }
      });
    } else {
      setLocalSettings({
        ...localSettings,
        [field]: event.target.value
      });
    }
  };

  const handleAddressChange = (field) => (event) => {
    setLocalSettings({
      ...localSettings,
      address: {
        ...localSettings.address,
        [field]: event.target.value
      }
    });
  };

  const handleWorkHoursChange = (field) => (event) => {
    setLocalSettings({
      ...localSettings,
      workHours: {
        ...localSettings.workHours,
        [field]: event.target.value
      }
    });
  };

  const handleLunchBreakChange = (field) => (event) => {
    setLocalSettings({
      ...localSettings,
      workHours: {
        ...localSettings.workHours,
        lunchBreak: {
          ...localSettings.workHours.lunchBreak,
          [field]: field === 'enabled' ? event.target.checked : event.target.value
        }
      }
    });
  };

  const handleNotificationChange = (field) => (event) => {
    setLocalSettings({
      ...localSettings,
      notifications: {
        ...localSettings.notifications,
        [field]: typeof event.target.checked !== 'undefined' ? event.target.checked : event.target.value
      }
    });
  };

  const handleNotificationEmailAdd = (email) => {
    if (email && !localSettings.notifications.adminEmails.includes(email)) {
      setLocalSettings({
        ...localSettings,
        notifications: {
          ...localSettings.notifications,
          adminEmails: [...localSettings.notifications.adminEmails, email]
        }
      });
    }
  };

  const handleNotificationEmailRemove = (email) => {
    setLocalSettings({
      ...localSettings,
      notifications: {
        ...localSettings.notifications,
        adminEmails: localSettings.notifications.adminEmails.filter(e => e !== email)
      }
    });
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSettings({
          ...localSettings,
          logo: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save to context
      const result = await saveOrganizationSettings(localSettings);
      
      if (result.success) {
        showStatus({
          type: 'success',
          message: 'Paramètres de l\'organisation enregistrés avec succès'
        });
      } else {
        throw new Error(result.error || 'Failed to save settings');
      }
    } catch (error) {
      showStatus({
        type: 'error',
        message: `Erreur lors de l'enregistrement des paramètres: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  if (contextLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (contextError) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {contextError}
      </Alert>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BusinessIcon sx={{ mr: 1 }} />
          <Typography variant="h5" component="h1">
            Paramètres de l'Organisation
          </Typography>
        </Box>
        <Typography color="textSecondary" sx={{ mb: 3 }}>
          Configurez les informations et les paramètres globaux de votre organisation
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="organization settings tabs">
            <Tab label="Informations Générales" {...a11yProps(0)} />
            <Tab label="Horaires & Calendrier" {...a11yProps(1)} />
            <Tab label="Localisation & Format" {...a11yProps(2)} />
            <Tab label="Notifications" {...a11yProps(3)} />
          </Tabs>
        </Box>
        
        {/* General Information Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom de l'entreprise"
                value={localSettings.companyName || ''}
                onChange={handleChange(null, 'companyName')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Raison sociale"
                value={localSettings.legalName || ''}
                onChange={handleChange(null, 'legalName')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Identifiant fiscal"
                value={localSettings.taxId || ''}
                onChange={handleChange(null, 'taxId')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Secteur d'activité"
                value={localSettings.industry || ''}
                onChange={handleChange(null, 'industry')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Site web"
                value={localSettings.website || ''}
                onChange={handleChange(null, 'website')}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LanguageIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email de contact"
                value={localSettings.email || ''}
                onChange={handleChange(null, 'email')}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Téléphone"
                value={localSettings.phone || ''}
                onChange={handleChange(null, 'phone')}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Adresse
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Rue et numéro"
                value={localSettings.address?.street || ''}
                onChange={handleAddressChange('street')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Ville"
                value={localSettings.address?.city || ''}
                onChange={handleAddressChange('city')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Région/Province"
                value={localSettings.address?.state || ''}
                onChange={handleAddressChange('state')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Code postal"
                value={localSettings.address?.postalCode || ''}
                onChange={handleAddressChange('postalCode')}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Pays</InputLabel>
                <Select
                  value={localSettings.address?.country || ''}
                  label="Pays"
                  onChange={handleAddressChange('country')}
                >
                  <MenuItem value="Morocco">Maroc</MenuItem>
                  <MenuItem value="Algeria">Algérie</MenuItem>
                  <MenuItem value="Tunisia">Tunisie</MenuItem>
                  <MenuItem value="France">France</MenuItem>
                  <MenuItem value="Belgium">Belgique</MenuItem>
                  <MenuItem value="Canada">Canada</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Logo de l'organisation
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Button
                variant="outlined"
                component="label"
                sx={{ mb: 2 }}
              >
                Télécharger un logo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
              </Button>
              
              {localSettings.logo && (
                <Box sx={{ mt: 2, border: '1px solid #eee', p: 2, borderRadius: 1 }}>
                  <img 
                    src={localSettings.logo} 
                    alt="Company Logo" 
                    style={{ maxWidth: '100%', maxHeight: '120px' }} 
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Work Hours & Calendar Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                <AccessTimeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Horaires de travail
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Heure de début"
                type="time"
                value={localSettings.workHours?.startTime || ''}
                onChange={handleWorkHoursChange('startTime')}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Heure de fin"
                type="time"
                value={localSettings.workHours?.endTime || ''}
                onChange={handleWorkHoursChange('endTime')}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl component="fieldset" margin="normal">
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Jours de travail
                </Typography>
                <Grid container spacing={1}>
                  {[
                    { day: 1, label: 'Lun' },
                    { day: 2, label: 'Mar' },
                    { day: 3, label: 'Mer' },
                    { day: 4, label: 'Jeu' },
                    { day: 5, label: 'Ven' },
                    { day: 6, label: 'Sam' },
                    { day: 0, label: 'Dim' },
                  ].map((day) => (
                    <Grid item key={day.day}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={localSettings.workHours?.workDays?.includes(day.day) || false}
                            onChange={(e) => {
                              const newDays = e.target.checked
                                ? [...(localSettings.workHours?.workDays || []), day.day]
                                : (localSettings.workHours?.workDays || []).filter(d => d !== day.day);
                              setLocalSettings({
                                ...localSettings,
                                workHours: {
                                  ...(localSettings.workHours || {}),
                                  workDays: newDays
                                }
                              });
                            }}
                            color="primary"
                          />
                        }
                        label={day.label}
                      />
                    </Grid>
                  ))}
                </Grid>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardHeader 
                  title="Pause déjeuner" 
                  action={
                    <FormControlLabel
                      control={
                        <Switch
                          checked={localSettings.workHours?.lunchBreak?.enabled || false}
                          onChange={handleLunchBreakChange('enabled')}
                          color="primary"
                        />
                      }
                      label="Activer"
                    />
                  }
                />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Heure de début"
                        type="time"
                        value={localSettings.workHours?.lunchBreak?.startTime || ''}
                        onChange={handleLunchBreakChange('startTime')}
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        disabled={!localSettings.workHours?.lunchBreak?.enabled}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Durée (minutes)"
                        type="number"
                        value={localSettings.workHours?.lunchBreak?.duration || ''}
                        onChange={handleLunchBreakChange('duration')}
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                        disabled={!localSettings.workHours?.lunchBreak?.enabled}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                <CalendarMonthIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Paramètres du calendrier
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Premier jour de la semaine</InputLabel>
                <Select
                  value={localSettings.weekStart || 1}
                  label="Premier jour de la semaine"
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    weekStart: e.target.value
                  })}
                >
                  <MenuItem value={1}>Lundi</MenuItem>
                  <MenuItem value={0}>Dimanche</MenuItem>
                  <MenuItem value={6}>Samedi</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Début de l'année fiscale (MM-JJ)"
                value={localSettings.fiscalYearStart || ''}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  fiscalYearStart: e.target.value
                })}
                margin="normal"
                placeholder="01-01"
              />
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Localization Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Fuseau horaire</InputLabel>
                <Select
                  value={localSettings.timeZone || ''}
                  label="Fuseau horaire"
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    timeZone: e.target.value
                  })}
                >
                  <MenuItem value="Africa/Casablanca">Casablanca (GMT+1)</MenuItem>
                  <MenuItem value="Europe/Paris">Paris (GMT+1/+2)</MenuItem>
                  <MenuItem value="Europe/London">Londres (GMT+0/+1)</MenuItem>
                  <MenuItem value="America/New_York">New York (GMT-5/-4)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Langue par défaut</InputLabel>
                <Select
                  value={localSettings.language || ''}
                  label="Langue par défaut"
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    language: e.target.value
                  })}
                >
                  <MenuItem value="fr">Français</MenuItem>
                  <MenuItem value="ar">Arabe</MenuItem>
                  <MenuItem value="en">Anglais</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Format de date</InputLabel>
                <Select
                  value={localSettings.dateFormat || ''}
                  label="Format de date"
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    dateFormat: e.target.value
                  })}
                >
                  <MenuItem value="DD/MM/YYYY">JJ/MM/AAAA (31/12/2023)</MenuItem>
                  <MenuItem value="MM/DD/YYYY">MM/JJ/AAAA (12/31/2023)</MenuItem>
                  <MenuItem value="YYYY-MM-DD">AAAA-MM-JJ (2023-12-31)</MenuItem>
                  <MenuItem value="DD-MMM-YYYY">JJ-MMM-AAAA (31-Déc-2023)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Format d'heure</InputLabel>
                <Select
                  value={localSettings.timeFormat || ''}
                  label="Format d'heure"
                  onChange={(e) => setLocalSettings({
                    ...localSettings,
                    timeFormat: e.target.value
                  })}
                >
                  <MenuItem value="24h">24h (14:30)</MenuItem>
                  <MenuItem value="12h">12h (2:30 PM)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Notifications Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Emails d'administration
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Adresses email qui recevront les notifications système
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={1}>
                  {localSettings.notifications?.adminEmails?.map((email, index) => (
                    <Grid item key={index}>
                      <Chip 
                        label={email} 
                        onDelete={() => handleNotificationEmailRemove(email)} 
                        sx={{ m: 0.5 }}
                      />
                    </Grid>
                  ))}
                </Grid>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <TextField
                    label="Ajouter un email"
                    size="small"
                    sx={{ mr: 1, flexGrow: 1 }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        handleNotificationEmailAdd(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <Button 
                    variant="outlined"
                    onClick={(e) => {
                      const input = e.currentTarget.previousSibling.querySelector('input');
                      if (input.value) {
                        handleNotificationEmailAdd(input.value);
                        input.value = '';
                      }
                    }}
                  >
                    Ajouter
                  </Button>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Rapports automatiques
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={localSettings.notifications?.dailyReports || false}
                        onChange={handleNotificationChange('dailyReports')}
                        color="primary"
                      />
                    }
                    label="Rapports quotidiens"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={localSettings.notifications?.weeklyReports || false}
                        onChange={handleNotificationChange('weeklyReports')}
                        color="primary"
                      />
                    }
                    label="Rapports hebdomadaires"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={localSettings.notifications?.monthlyReports || false}
                        onChange={handleNotificationChange('monthlyReports')}
                        color="primary"
                      />
                    }
                    label="Rapports mensuels"
                  />
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Alertes et notifications
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={localSettings.notifications?.irregularAttendance || false}
                        onChange={handleNotificationChange('irregularAttendance')}
                        color="primary"
                      />
                    }
                    label="Alertes de présence irrégulière"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={localSettings.notifications?.leaveRequests || false}
                        onChange={handleNotificationChange('leaveRequests')}
                        color="primary"
                      />
                    }
                    label="Notification des demandes de congé"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer les paramètres'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default OrganizationSettings; 