import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Grid,
  Button,
  Switch,
  Divider,
  Card,
  CardContent,
  alpha,
  useTheme,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useSettings } from '../../../context/SettingsContext';

const languages = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' }
];

const timeZones = [
  { value: 'Europe/Paris', label: 'Europe/Paris (GMT+1)' },
  { value: 'Europe/London', label: 'Europe/London (GMT+0)' },
  { value: 'America/New_York', label: 'America/New_York (GMT-5)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (GMT+9)' }
];

const dateFormats = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' }
];

const timeFormats = [
  { value: '24h', label: '24h (14:30)' },
  { value: '12h', label: '12h (2:30 PM)' }
];

const startDays = [
  { value: 1, label: 'Lundi' },
  { value: 0, label: 'Dimanche' }
];

const defaultViews = [
  { value: 'monthly', label: 'Mensuel' },
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'daily', label: 'Journalier' }
];

const GeneralSettings = () => {
  const { settings, isLoading, updateSettings, resetSettings, exportSettings, importSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings.general);
  const [isLocalSettingsChanged, setIsLocalSettingsChanged] = useState(false);
  const [importFile, setImportFile] = useState(null);
  
  // Initialize local settings from context settings
  useEffect(() => {
    setLocalSettings(settings.general);
    setIsLocalSettingsChanged(false);
  }, [settings.general]);
  
  // Handle field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalSettings((prev) => ({
      ...prev,
      [name]: value
    }));
    setIsLocalSettingsChanged(true);
  };
  
  // Handle switch changes
  const handleSwitchChange = (name) => (e) => {
    setLocalSettings((prev) => ({
      ...prev,
      [name]: e.target.checked
    }));
    setIsLocalSettingsChanged(true);
  };
  
  // Save general settings
  const handleSave = () => {
    updateSettings('general', localSettings);
  };
  
  // Reset general settings to defaults
  const handleReset = () => {
    resetSettings('general');
  };
  
  // Handle importing settings from a file
  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setImportFile(file);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        importSettings(event.target.result);
      } catch (error) {
        console.error('Failed to import settings:', error);
      }
    };
    reader.readAsText(file);
  };
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'medium' }}>
        Paramètres Généraux
      </Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Localisation et Format
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="language-label">Langue</InputLabel>
                <Select
                  labelId="language-label"
                  name="language"
                  value={localSettings.language}
                  label="Langue"
                  onChange={handleChange}
                >
                  {languages.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="timezone-label">Fuseau Horaire</InputLabel>
                <Select
                  labelId="timezone-label"
                  name="timeZone"
                  value={localSettings.timeZone}
                  label="Fuseau Horaire"
                  onChange={handleChange}
                >
                  {timeZones.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="date-format-label">Format de Date</InputLabel>
                <Select
                  labelId="date-format-label"
                  name="dateFormat"
                  value={localSettings.dateFormat}
                  label="Format de Date"
                  onChange={handleChange}
                >
                  {dateFormats.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="time-format-label">Format d'Heure</InputLabel>
                <Select
                  labelId="time-format-label"
                  name="timeFormat"
                  value={localSettings.timeFormat}
                  label="Format d'Heure"
                  onChange={handleChange}
                >
                  {timeFormats.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Préférences d'Affichage
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="default-view-label">Vue par Défaut</InputLabel>
                <Select
                  labelId="default-view-label"
                  name="defaultView"
                  value={localSettings.defaultView}
                  label="Vue par Défaut"
                  onChange={handleChange}
                >
                  {defaultViews.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="start-day-label">Premier Jour de la Semaine</InputLabel>
                <Select
                  labelId="start-day-label"
                  name="startDayOfWeek"
                  value={localSettings.startDayOfWeek}
                  label="Premier Jour de la Semaine"
                  onChange={handleChange}
                >
                  {startDays.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Gestion des Paramètres
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Sauvegardez vos paramètres actuels, réinitialisez-les ou importez/exportez vos configurations.
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSave}
              disabled={!isLocalSettingsChanged}
            >
              Enregistrer les Paramètres
            </Button>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={handleReset}
            >
              Réinitialiser
            </Button>
          </Stack>
          
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Exportation et Importation
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={exportSettings}
            >
              Exporter les Paramètres
            </Button>
            <Box>
              <input
                accept=".json"
                style={{ display: 'none' }}
                id="import-settings-file"
                type="file"
                onChange={handleImportFile}
              />
              <label htmlFor="import-settings-file">
                <Button 
                  variant="outlined" 
                  component="span"
                >
                  Importer les Paramètres
                </Button>
              </label>
              {importFile && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Fichier: {importFile.name}
                </Typography>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default GeneralSettings; 