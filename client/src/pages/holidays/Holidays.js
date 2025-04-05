import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button
} from '@mui/material';
import { Link } from 'react-router-dom';
import { 
  Print as PrintIcon, 
  CalendarMonth as CalendarIcon 
} from '@mui/icons-material';
import AlgerianHolidays from '../dashboard/AlgerianHolidays';

const Holidays = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Jours Fériés
        </Typography>
        
        <Box>
          <Button 
            component={Link} 
            to="/holidays/calendar" 
            variant="outlined" 
            startIcon={<CalendarIcon />}
            color="primary"
            sx={{ mr: 2 }}
          >
            Vue Calendrier
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
        <Typography variant="body1" paragraph>
          Cette page présente les jours fériés officiels en Algérie, incluant les fêtes nationales, religieuses, civiles et culturelles.
        </Typography>
        <Typography variant="body1" paragraph>
          Les dates des fêtes religieuses islamiques sont basées sur le calendrier lunaire et peuvent varier de 1 à 2 jours par rapport aux dates indiquées, en fonction de l'observation de la lune.
        </Typography>
      </Paper>
      
      <AlgerianHolidays />
    </Box>
  );
};

export default Holidays; 