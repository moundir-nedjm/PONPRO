import React, { useState, useRef } from 'react';
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
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Grid
} from '@mui/material';
import { 
  Print as PrintIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';

const HolidaysPrint = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const printRef = useRef();
  
  // Liste des jours fériés algériens
  const holidays = [
    { 
      name: "Jour de l'an", 
      date: (year) => `${year}-01-01`, 
      description: "Nouvel an grégorien", 
      type: "civil"
    },
    { 
      name: "Yennayer (Nouvel An Amazigh)", 
      date: (year) => `${year}-01-12`, 
      description: "Nouvel an berbère", 
      type: "cultural"
    },
    { 
      name: "Fête de la Révolution", 
      date: (year) => `${year}-11-01`, 
      description: "Commémoration du déclenchement de la guerre d'indépendance", 
      type: "national"
    },
    { 
      name: "Fête de l'Indépendance", 
      date: (year) => `${year}-07-05`, 
      description: "Commémoration de l'indépendance de l'Algérie", 
      type: "national"
    },
    { 
      name: "Fête du Travail", 
      date: (year) => `${year}-05-01`, 
      description: "Journée internationale des travailleurs", 
      type: "civil"
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
      type: "religious"
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
      type: "religious"
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
      type: "religious"
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
      type: "religious"
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
      type: "religious"
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

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Calendrier des jours fériés algériens ${selectedYear}`,
  });

  // Générer les années pour le sélecteur
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 2; i <= currentYear + 2; i++) {
    years.push(i);
  }

  // Organiser les jours fériés par mois
  const holidaysByMonth = holidays
    .map(holiday => ({
      ...holiday,
      dateString: holiday.date(selectedYear),
      dateObj: new Date(holiday.date(selectedYear))
    }))
    .sort((a, b) => a.dateObj - b.dateObj)
    .reduce((acc, holiday) => {
      const month = holiday.dateObj.getMonth();
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(holiday);
      return acc;
    }, {});

  // Noms des mois en français
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'space-between' }}>
        <Typography variant="h5" component="h2">
          Calendrier des Jours Fériés Algériens
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
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
          
          <Button 
            variant="contained" 
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Imprimer
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box ref={printRef} sx={{ p: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              Calendrier des Jours Fériés Algériens {selectedYear}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Document officiel - POINPRO
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarIcon sx={{ mr: 1 }} /> Légende
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: getTypeColor('national'), mr: 1, borderRadius: 1 }} />
                  <Typography variant="body2">Fêtes Nationales</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: getTypeColor('religious'), mr: 1, borderRadius: 1 }} />
                  <Typography variant="body2">Fêtes Religieuses</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: getTypeColor('civil'), mr: 1, borderRadius: 1 }} />
                  <Typography variant="body2">Fêtes Civiles</Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: getTypeColor('cultural'), mr: 1, borderRadius: 1 }} />
                  <Typography variant="body2">Fêtes Culturelles</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="25%">Date</TableCell>
                  <TableCell width="25%">Nom</TableCell>
                  <TableCell width="30%">Description</TableCell>
                  <TableCell width="20%">Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(holidaysByMonth).map(([monthIndex, monthHolidays]) => (
                  <React.Fragment key={monthIndex}>
                    <TableRow>
                      <TableCell 
                        colSpan={4} 
                        sx={{ 
                          bgcolor: 'primary.main', 
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        {monthNames[parseInt(monthIndex)]}
                      </TableCell>
                    </TableRow>
                    {monthHolidays.map((holiday, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(holiday.dateString)}</TableCell>
                        <TableCell>{holiday.name}</TableCell>
                        <TableCell>{holiday.description}</TableCell>
                        <TableCell>
                          <Box sx={{ 
                            display: 'inline-block',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: getTypeColor(holiday.type),
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 'medium'
                          }}>
                            {getTypeLabel(holiday.type)}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Note: Les dates des fêtes religieuses islamiques sont basées sur le calendrier lunaire et peuvent varier de 1 à 2 jours.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default HolidaysPrint; 