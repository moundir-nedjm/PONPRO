import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import { 
  CalendarMonth as CalendarIcon,
  FilterList as FilterIcon,
  Info as InfoIcon,
  ViewList as ListViewIcon,
  ViewModule as GridViewIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const AlgerianHolidays = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState('list');
  const [selectedTypes, setSelectedTypes] = useState(['national', 'religious', 'civil', 'cultural']);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Liste des jours fériés algériens
  const holidays = [
    { 
      name: "Jour de l'an", 
      date: (year) => `${year}-01-01`, 
      description: "Nouvel an grégorien", 
      type: "civil",
      longDescription: "Le jour de l'an marque le début de l'année civile dans le calendrier grégorien. En Algérie, c'est un jour férié officiel où les administrations et la plupart des entreprises sont fermées."
    },
    { 
      name: "Yennayer (Nouvel An Amazigh)", 
      date: (year) => `${year}-01-12`, 
      description: "Nouvel an berbère", 
      type: "cultural",
      longDescription: "Yennayer marque le début de l'année agricole dans le calendrier amazigh (berbère). Cette fête est célébrée principalement dans les régions berbérophones d'Algérie avec des plats traditionnels comme le couscous et des cérémonies culturelles. Depuis 2018, c'est un jour férié national en Algérie."
    },
    { 
      name: "Fête de la Révolution", 
      date: (year) => `${year}-11-01`, 
      description: "Commémoration du déclenchement de la guerre d'indépendance", 
      type: "national",
      longDescription: "La Fête de la Révolution commémore le déclenchement de la guerre d'indépendance algérienne le 1er novembre 1954. Cette date marque le début de la lutte armée contre la colonisation française qui a duré jusqu'en 1962. Des cérémonies officielles et des défilés militaires sont organisés à travers le pays."
    },
    { 
      name: "Fête de l'Indépendance", 
      date: (year) => `${year}-07-05`, 
      description: "Commémoration de l'indépendance de l'Algérie", 
      type: "national",
      longDescription: "La Fête de l'Indépendance célèbre la proclamation de l'indépendance de l'Algérie le 5 juillet 1962, après 132 ans de colonisation française et une guerre de libération de huit ans. C'est l'une des fêtes nationales les plus importantes en Algérie, marquée par des défilés militaires, des discours officiels et des festivités populaires."
    },
    { 
      name: "Fête du Travail", 
      date: (year) => `${year}-05-01`, 
      description: "Journée internationale des travailleurs", 
      type: "civil",
      longDescription: "La Fête du Travail est célébrée le 1er mai en Algérie comme dans de nombreux pays. Cette journée honore les luttes ouvrières et les acquis sociaux des travailleurs. Des manifestations syndicales et des discours sur les droits des travailleurs sont organisés dans les grandes villes."
    },
    { 
      name: "Aïd el-Fitr", 
      date: (year) => {
        // Dates approximatives pour 2023-2025
        const dates = {
          2023: `2023-04-21`,
          2024: `2024-04-10`,
          2025: `2025-03-30`,
        };
        return dates[year] || `${year}-04-10`;
      }, 
      description: "Fête de la rupture du jeûne (2 jours)", 
      type: "religious",
      longDescription: "L'Aïd el-Fitr marque la fin du mois sacré de Ramadan. Cette fête de trois jours commence par une prière collective le matin, suivie de visites familiales et d'échanges de cadeaux. Les plats traditionnels comme les gâteaux et pâtisseries sont préparés pour l'occasion. C'est une période de joie, de partage et de réconciliation."
    },
    { 
      name: "Aïd el-Adha", 
      date: (year) => {
        // Dates approximatives pour 2023-2025
        const dates = {
          2023: `2023-06-28`,
          2024: `2024-06-16`,
          2025: `2025-06-06`,
        };
        return dates[year] || `${year}-06-16`;
      }, 
      description: "Fête du sacrifice (2 jours)", 
      type: "religious",
      longDescription: "L'Aïd el-Adha, ou fête du sacrifice, commémore la soumission d'Ibrahim (Abraham) à Dieu. Les familles sacrifient traditionnellement un mouton et partagent la viande entre famille, amis et personnes dans le besoin. Cette fête de trois jours est l'une des plus importantes du calendrier musulman et est célébrée environ 70 jours après l'Aïd el-Fitr."
    },
    { 
      name: "Nouvel An Hégirien", 
      date: (year) => {
        // Dates approximatives pour 2023-2025
        const dates = {
          2023: `2023-07-19`,
          2024: `2024-07-07`,
          2025: `2025-06-27`,
        };
        return dates[year] || `${year}-07-07`;
      }, 
      description: "Nouvel an musulman", 
      type: "religious",
      longDescription: "Le Nouvel An Hégirien marque le début de l'année dans le calendrier musulman. Il commémore l'Hégire, la migration du prophète Mohammed de La Mecque à Médine en 622 après J.-C. Bien que ce soit un jour férié en Algérie, il est généralement célébré de manière plus sobre que d'autres fêtes religieuses."
    },
    { 
      name: "Achoura", 
      date: (year) => {
        // Dates approximatives pour 2023-2025
        const dates = {
          2023: `2023-07-28`,
          2024: `2024-07-17`,
          2025: `2025-07-06`,
        };
        return dates[year] || `${year}-07-17`;
      }, 
      description: "Commémoration religieuse", 
      type: "religious",
      longDescription: "Achoura est célébrée le 10e jour du mois de Muharram dans le calendrier musulman. Pour les musulmans sunnites, c'est un jour de jeûne volontaire. En Algérie, cette journée est aussi associée à des traditions de charité et de partage. Dans certaines régions, des plats spéciaux sont préparés pour l'occasion."
    },
    { 
      name: "Mawlid Ennabaoui", 
      date: (year) => {
        // Dates approximatives pour 2023-2025
        const dates = {
          2023: `2023-09-27`,
          2024: `2024-09-16`,
          2025: `2025-09-05`,
        };
        return dates[year] || `${year}-09-16`;
      }, 
      description: "Naissance du prophète Mohammed", 
      type: "religious",
      longDescription: "Le Mawlid Ennabaoui célèbre la naissance du prophète Mohammed. En Algérie, cette fête est marquée par des récitations du Coran, des chants religieux et des rassemblements dans les mosquées. Des bonbons et des sucreries sont distribués aux enfants, et de nombreuses familles préparent des plats spéciaux pour l'occasion."
    }
  ];

  const getTypeColor = (type) => {
    switch(type) {
      case 'national':
        return '#1976d2'; // bleu
      case 'religious':
        return '#43a047'; // vert
      case 'civil':
        return '#e53935'; // rouge
      case 'cultural':
        return '#9c27b0'; // violet
      default:
        return '#757575'; // gris
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'national':
        return 'National';
      case 'religious':
        return 'Religieux';
      case 'civil':
        return 'Civil';
      case 'cultural':
        return 'Culturel';
      default:
        return type;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const handleTypeChange = (event, newTypes) => {
    if (newTypes.length > 0) {
      setSelectedTypes(newTypes);
    }
  };

  const handleHolidayClick = (holiday) => {
    setSelectedHoliday(holiday);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Générer les années pour le sélecteur
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 2; i <= currentYear + 2; i++) {
    years.push(i);
  }

  // Filtrer les jours fériés par type
  const filteredHolidays = holidays
    .filter(holiday => selectedTypes.includes(holiday.type))
    .map(holiday => ({
      ...holiday,
      dateString: holiday.date(selectedYear)
    }))
    .sort((a, b) => new Date(a.dateString) - new Date(b.dateString));

  return (
    <>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Jours Fériés Algériens</Typography>
          
          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              size="small"
            >
              <ToggleButton value="list" aria-label="liste">
                <Tooltip title="Vue liste">
                  <ListViewIcon />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="grid" aria-label="grille">
                <Tooltip title="Vue grille">
                  <GridViewIcon />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
            
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel id="year-select-label">Année</InputLabel>
              <Select
                labelId="year-select-label"
                value={selectedYear}
                label="Année"
                onChange={handleYearChange}
                size="small"
              >
                {years.map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ mr: 2 }}>Filtrer par type:</Typography>
          <ToggleButtonGroup
            value={selectedTypes}
            onChange={handleTypeChange}
            size="small"
          >
            <ToggleButton value="national" aria-label="national">
              <Chip 
                label="National" 
                size="small"
                sx={{ 
                  bgcolor: getTypeColor('national'),
                  color: 'white'
                }}
              />
            </ToggleButton>
            <ToggleButton value="religious" aria-label="religious">
              <Chip 
                label="Religieux" 
                size="small"
                sx={{ 
                  bgcolor: getTypeColor('religious'),
                  color: 'white'
                }}
              />
            </ToggleButton>
            <ToggleButton value="civil" aria-label="civil">
              <Chip 
                label="Civil" 
                size="small"
                sx={{ 
                  bgcolor: getTypeColor('civil'),
                  color: 'white'
                }}
              />
            </ToggleButton>
            <ToggleButton value="cultural" aria-label="cultural">
              <Chip 
                label="Culturel" 
                size="small"
                sx={{ 
                  bgcolor: getTypeColor('cultural'),
                  color: 'white'
                }}
              />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {viewMode === 'list' ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Détails</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHolidays.map((holiday, index) => (
                  <TableRow key={index}>
                    <TableCell>{holiday.name}</TableCell>
                    <TableCell>{formatDate(holiday.dateString)}</TableCell>
                    <TableCell>{holiday.description}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getTypeLabel(holiday.type)} 
                        size="small"
                        sx={{ 
                          bgcolor: getTypeColor(holiday.type),
                          color: 'white'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => handleHolidayClick(holiday)}
                        color="primary"
                      >
                        <InfoIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Grid container spacing={2}>
            {filteredHolidays.map((holiday, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    borderTop: `4px solid ${getTypeColor(holiday.type)}`,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardHeader
                    title={holiday.name}
                    subheader={formatDate(holiday.dateString)}
                    action={
                      <IconButton 
                        size="small" 
                        onClick={() => handleHolidayClick(holiday)}
                        color="primary"
                      >
                        <InfoIcon />
                      </IconButton>
                    }
                  />
                  <Divider />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {holiday.description}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Chip 
                        label={getTypeLabel(holiday.type)} 
                        size="small"
                        sx={{ 
                          bgcolor: getTypeColor(holiday.type),
                          color: 'white'
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Dialogue de détails */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedHoliday && (
          <>
            <DialogTitle sx={{ 
              borderBottom: `4px solid ${getTypeColor(selectedHoliday.type)}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              {selectedHoliday.name}
              <IconButton
                aria-label="close"
                onClick={handleCloseDialog}
                sx={{ color: 'grey.500' }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1">
                  {formatDate(selectedHoliday.dateString)}
                </Typography>
                <Chip 
                  label={getTypeLabel(selectedHoliday.type)} 
                  size="small"
                  sx={{ 
                    bgcolor: getTypeColor(selectedHoliday.type),
                    color: 'white'
                  }}
                />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <DialogContentText>
                {selectedHoliday.longDescription}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Fermer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default AlgerianHolidays; 