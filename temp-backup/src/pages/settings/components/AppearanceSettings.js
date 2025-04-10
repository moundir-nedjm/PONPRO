import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormControlLabel,
  Switch,
  Grid,
  Button,
  Card,
  CardContent,
  Slider,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  Divider,
  alpha,
  useTheme,
  Stack,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  FormatSize as FormatSizeIcon,
  Save as SaveIcon,
  Palette as PaletteIcon,
  Refresh as RefreshIcon,
  Contrast as ContrastIcon
} from '@mui/icons-material';
import { useSettings } from '../../../context/SettingsContext';

// Theme color options
const colorThemes = [
  { value: 'blue', color: '#1976d2', name: 'Bleu' },
  { value: 'indigo', color: '#3f51b5', name: 'Indigo' },
  { value: 'purple', color: '#9c27b0', name: 'Violet' },
  { value: 'teal', color: '#009688', name: 'Sarcelle' },
  { value: 'green', color: '#4caf50', name: 'Vert' },
  { value: 'orange', color: '#ff9800', name: 'Orange' },
  { value: 'red', color: '#f44336', name: 'Rouge' },
];

// Font families
const fontFamilies = [
  { value: 'Roboto, sans-serif', name: 'Roboto (Défaut)' },
  { value: 'Montserrat, sans-serif', name: 'Montserrat' },
  { value: 'Open Sans, sans-serif', name: 'Open Sans' },
  { value: 'Lato, sans-serif', name: 'Lato' },
  { value: 'Poppins, sans-serif', name: 'Poppins' },
];

// Sidebar widths
const sidebarWidths = [
  { value: 240, name: 'Standard (240px)' },
  { value: 280, name: 'Large (280px)' },
  { value: 200, name: 'Compact (200px)' },
];

const AppearanceSettings = () => {
  const { settings, isLoading, updateSettings, resetSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings.appearance);
  const [isLocalSettingsChanged, setIsLocalSettingsChanged] = useState(false);
  
  // Initialize local settings from context settings
  useEffect(() => {
    setLocalSettings(settings.appearance);
    setIsLocalSettingsChanged(false);
  }, [settings.appearance]);
  
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
  
  // Save appearance settings
  const handleSave = () => {
    updateSettings('appearance', localSettings);
  };
  
  // Reset appearance settings to defaults
  const handleReset = () => {
    resetSettings('appearance');
  };
  
  // Render color picker option
  const renderColorOption = (option) => (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box 
        sx={{ 
          width: 20, 
          height: 20, 
          borderRadius: '50%', 
          backgroundColor: option.color,
          mr: 1
        }} 
      />
      {option.name}
    </Box>
  );
  
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
        Paramètres d'Apparence
      </Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Thème et Couleurs
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="theme-label">Thème</InputLabel>
                <Select
                  labelId="theme-label"
                  name="theme"
                  value={localSettings.theme}
                  label="Thème"
                  onChange={handleChange}
                >
                  <MenuItem value="light">Clair</MenuItem>
                  <MenuItem value="dark">Sombre</MenuItem>
                  <MenuItem value="system">Système</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="primary-color-label">Couleur Principale</InputLabel>
                <Select
                  labelId="primary-color-label"
                  name="primaryColor"
                  value={localSettings.primaryColor}
                  label="Couleur Principale"
                  onChange={handleChange}
                  renderValue={(selected) => {
                    const option = colorThemes.find(opt => opt.value === selected);
                    return renderColorOption(option || { color: selected, name: selected });
                  }}
                >
                  {colorThemes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {renderColorOption(option)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="secondary-color-label">Couleur Secondaire</InputLabel>
                <Select
                  labelId="secondary-color-label"
                  name="secondaryColor"
                  value={localSettings.secondaryColor}
                  label="Couleur Secondaire"
                  onChange={handleChange}
                  renderValue={(selected) => {
                    const option = colorThemes.find(opt => opt.value === selected);
                    return renderColorOption(option || { color: selected, name: selected });
                  }}
                >
                  {colorThemes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {renderColorOption(option)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="border-radius-label">Rayon des Coins</InputLabel>
                <Select
                  labelId="border-radius-label"
                  name="borderRadius"
                  value={localSettings.borderRadius}
                  label="Rayon des Coins"
                  onChange={handleChange}
                >
                  <MenuItem value="small">Petit</MenuItem>
                  <MenuItem value="medium">Moyen</MenuItem>
                  <MenuItem value="large">Grand</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Densité et Taille
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="density-label">Densité de l'Interface</InputLabel>
                <Select
                  labelId="density-label"
                  name="density"
                  value={localSettings.density}
                  label="Densité de l'Interface"
                  onChange={handleChange}
                >
                  <MenuItem value="compact">Compacte</MenuItem>
                  <MenuItem value="comfortable">Confortable</MenuItem>
                  <MenuItem value="spacious">Spacieuse</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="font-size-label">Taille de la Police</InputLabel>
                <Select
                  labelId="font-size-label"
                  name="fontSize"
                  value={localSettings.fontSize}
                  label="Taille de la Police"
                  onChange={handleChange}
                >
                  <MenuItem value="small">Petite</MenuItem>
                  <MenuItem value="medium">Moyenne</MenuItem>
                  <MenuItem value="large">Grande</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={localSettings.enableAnimations}
                    onChange={handleSwitchChange('enableAnimations')}
                    color="primary"
                  />
                }
                label="Activer les Animations"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Mise en Page
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="table-layout-label">Disposition des Tableaux</InputLabel>
                <Select
                  labelId="table-layout-label"
                  name="tableLayout"
                  value={localSettings.tableLayout}
                  label="Disposition des Tableaux"
                  onChange={handleChange}
                >
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="compact">Compacte</MenuItem>
                  <MenuItem value="comfortable">Confortable</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="menu-style-label">Style du Menu</InputLabel>
                <Select
                  labelId="menu-style-label"
                  name="menuStyle"
                  value={localSettings.menuStyle}
                  label="Style du Menu"
                  onChange={handleChange}
                >
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="expanded">Étendu</MenuItem>
                  <MenuItem value="compact">Compact</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSave}
              disabled={!isLocalSettingsChanged}
            >
              Appliquer le Thème
            </Button>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={handleReset}
            >
              Réinitialiser
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AppearanceSettings; 