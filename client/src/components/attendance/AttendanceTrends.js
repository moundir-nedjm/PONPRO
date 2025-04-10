import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Divider,
  Chip
} from '@mui/material';
import { format, subDays, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

const AttendanceTrends = ({ weeklyData = [] }) => {
  // Handle empty data properly
  if (!weeklyData || weeklyData.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Aucune donnée disponible pour afficher les tendances
        </Typography>
      </Box>
    );
  }

  const maxAttendance = Math.max(...weeklyData.map(day => day.total));
  const startDate = format(weeklyData[0].date, 'd MMM', { locale: fr });
  const endDate = format(weeklyData[weeklyData.length - 1].date, 'd MMM', { locale: fr });

  return (
    <Paper elevation={2} sx={{ p: 2, borderRadius: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="h2" fontWeight="bold" gutterBottom>
          Tendances de Présence Hebdomadaire
        </Typography>
        <Chip 
          label={`${startDate} - ${endDate}`} 
          color="primary" 
          variant="outlined"
        />
      </Box>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        Comparaison des données de présence sur les 7 derniers jours
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ display: 'flex', height: 200, justifyContent: 'space-between', mt: 2 }}>
        {weeklyData.map((day, index) => {
          const dayName = format(day.date, 'EEE', { locale: fr });
          const dayNumber = format(day.date, 'd');
          const isCurrentDay = isToday(day.date);
          
          const presentHeight = (day.present / maxAttendance) * 100;
          const lateHeight = (day.late / maxAttendance) * 100;
          const absentHeight = (day.absent / maxAttendance) * 100;
          
          return (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                width: `${100 / weeklyData.length}%`,
                position: 'relative'
              }}
            >
              <Box 
                sx={{ 
                  height: '100%', 
                  width: '100%', 
                  display: 'flex',
                  flexDirection: 'column-reverse',
                  justifyContent: 'flex-start',
                  alignItems: 'center'
                }}
              >
                <Box 
                  sx={{ 
                    height: `${presentHeight}%`, 
                    width: 30, 
                    bgcolor: 'success.main',
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4
                  }} 
                />
                <Box 
                  sx={{ 
                    height: `${lateHeight}%`, 
                    width: 30, 
                    bgcolor: 'warning.main' 
                  }} 
                />
                <Box 
                  sx={{ 
                    height: `${absentHeight}%`, 
                    width: 30, 
                    bgcolor: 'error.main',
                    borderBottomLeftRadius: 4,
                    borderBottomRightRadius: 4
                  }} 
                />
              </Box>
              
              <Box 
                sx={{ 
                  mt: 1, 
                  textAlign: 'center',
                  pt: 1,
                  width: '100%',
                  borderTop: isCurrentDay ? '2px solid #1976d2' : 'none'
                }}
              >
                <Typography 
                  variant="body2" 
                  color={isCurrentDay ? 'primary.main' : 'text.secondary'}
                  fontWeight={isCurrentDay ? 'bold' : 'normal'}
                >
                  {dayName}
                </Typography>
                <Typography 
                  variant="body2" 
                  fontWeight={isCurrentDay ? 'bold' : 'normal'}
                  color={isCurrentDay ? 'primary.main' : 'text.primary'}
                >
                  {dayNumber}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: 'success.main', mr: 1, borderRadius: 1 }} />
          <Typography variant="body2">Présent</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: 'warning.main', mr: 1, borderRadius: 1 }} />
          <Typography variant="body2">En retard</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 16, height: 16, bgcolor: 'error.main', mr: 1, borderRadius: 1 }} />
          <Typography variant="body2">Absent</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default AttendanceTrends; 