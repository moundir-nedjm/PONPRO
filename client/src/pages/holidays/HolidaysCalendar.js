import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Tooltip,
  IconButton,
  Button
} from '@mui/material';
import { Link } from 'react-router-dom';
import { 
  CalendarMonth as CalendarIcon,
  Info as InfoIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  ViewList as ListIcon,
  Print as PrintIcon
} from '@mui/icons-material';

const HolidaysCalendar = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  
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

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Générer les années pour le sélecteur
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 2; i <= currentYear + 2; i++) {
    years.push(i);
  }

  // Noms des mois en français
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Noms des jours en français
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  // Obtenir les jours du mois actuel
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Obtenir les jours fériés pour le mois actuel
  const getHolidaysForMonth = () => {
    return holidays
      .map(holiday => {
        const dateString = holiday.date(selectedYear);
        const date = new Date(dateString);
        return {
          ...holiday,
          dateString,
          date
        };
      })
      .filter(holiday => holiday.date.getMonth() === currentMonth);
  };

  // Créer le calendrier
  const createCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedYear, currentMonth);
    const firstDay = getFirstDayOfMonth(selectedYear, currentMonth);
    const holidaysInMonth = getHolidaysForMonth();
    
    // Créer un mapping des jours fériés par jour du mois
    const holidaysByDay = {};
    holidaysInMonth.forEach(holiday => {
      const day = holiday.date.getDate();
      if (!holidaysByDay[day]) {
        holidaysByDay[day] = [];
      }
      holidaysByDay[day].push(holiday);
    });
    
    // Créer les semaines
    const calendar = [];
    let days = [];
    
    // Ajouter les jours vides pour le début du mois
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Ajouter les jours du mois
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        holidays: holidaysByDay[i] || []
      });
      
      // Si c'est la fin de la semaine ou le dernier jour du mois
      if (days.length === 7 || i === daysInMonth) {
        // Ajouter des jours vides à la fin si nécessaire
        while (days.length < 7) {
          days.push(null);
        }
        
        calendar.push(days);
        days = [];
      }
    }
    
    return calendar.map((week, weekIndex) => (
      <React.Fragment key={`week-${weekIndex}`}>
        {week.map((day, dayIndex) => (
          <Grid item xs={12/7} key={`day-${weekIndex}-${dayIndex}`}>
            {day ? (
              <Card 
                sx={{ 
                  height: '100%',
                  minHeight: 100,
                  position: 'relative',
                  bgcolor: day.holidays.length > 0 ? 'rgba(25, 118, 210, 0.05)' : 'white',
                  border: day.holidays.length > 0 ? '1px solid rgba(25, 118, 210, 0.2)' : '1px solid #e0e0e0',
                  '&:hover': {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent sx={{ p: 1 }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      position: 'absolute',
                      top: 5,
                      right: 8,
                      fontWeight: 'medium',
                      color: 'text.secondary'
                    }}
                  >
                    {day.day}
                  </Typography>
                  
                  <Box sx={{ mt: 3 }}>
                    {day.holidays.map((holiday, index) => (
                      <Tooltip 
                        key={index} 
                        title={
                          <Box>
                            <Typography variant="subtitle2">{holiday.name}</Typography>
                            <Typography variant="body2">{holiday.description}</Typography>
                          </Box>
                        }
                      >
                        <Chip 
                          label={holiday.name}
                          size="small"
                          sx={{ 
                            mb: 0.5,
                            bgcolor: getTypeColor(holiday.type),
                            color: 'white',
                            fontSize: '0.7rem',
                            height: 20,
                            maxWidth: '100%',
                            '& .MuiChip-label': {
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }
                          }}
                        />
                      </Tooltip>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Box sx={{ 
                height: '100%',
                minHeight: 100,
                bgcolor: 'rgba(0,0,0,0.03)',
                borderRadius: 1
              }} />
            )}
          </Grid>
        ))}
      </React.Fragment>
    ));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Calendrier
        </Typography>
        
        <Box>
          <Button 
            component={Link} 
            to="/holidays" 
            variant="outlined" 
            startIcon={<ListIcon />}
            color="primary"
            sx={{ mr: 2 }}
          >
            Liste des Jours Fériés
          </Button>
          
          <Button 
            component={Link} 
            to="/holidays/print" 
            variant="outlined" 
            startIcon={<PrintIcon />}
            color="primary"
          >
            Version Imprimable
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={handlePrevMonth}>
              <PrevIcon />
            </IconButton>
            <Typography variant="h6" sx={{ mx: 2 }}>
              {monthNames[currentMonth]} {selectedYear}
            </Typography>
            <IconButton onClick={handleNextMonth}>
              <NextIcon />
            </IconButton>
          </Box>
          
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="year-select-label">Année</InputLabel>
            <Select
              labelId="year-select-label"
              id="year-select"
              value={selectedYear}
              label="Année"
              onChange={handleYearChange}
            >
              {years.map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        <Grid container spacing={1}>
          {/* Jours de la semaine */}
          {dayNames.map((day, index) => (
            <Grid item xs={12/7} key={`header-${index}`}>
              <Box sx={{ 
                textAlign: 'center', 
                py: 1,
                fontWeight: 'bold',
                color: index === 0 || index === 6 ? 'error.main' : 'text.primary'
              }}>
                {day}
              </Box>
            </Grid>
          ))}
          
          {/* Jours du mois */}
          {createCalendar()}
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Légende
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Chip 
            label="Fête Nationale" 
            sx={{ bgcolor: getTypeColor('national'), color: 'white' }} 
          />
          <Chip 
            label="Fête Religieuse" 
            sx={{ bgcolor: getTypeColor('religious'), color: 'white' }} 
          />
          <Chip 
            label="Jour Férié Civil" 
            sx={{ bgcolor: getTypeColor('civil'), color: 'white' }} 
          />
          <Chip 
            label="Fête Culturelle" 
            sx={{ bgcolor: getTypeColor('cultural'), color: 'white' }} 
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default HolidaysCalendar; 