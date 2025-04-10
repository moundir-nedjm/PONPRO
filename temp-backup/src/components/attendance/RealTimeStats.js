import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  CircularProgress, 
  Grid, 
  LinearProgress,
  Divider,
  Chip
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Groups as GroupsIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const RealTimeStats = ({ stats, loading, title = 'Statistiques en Temps Réel', todayOnly = false }) => {
  const { 
    total = 0, 
    present = 0, 
    late = 0, 
    absent = 0, 
    onTime = 0
  } = stats || {};

  const presentPercentage = total > 0 ? Math.round((present / total) * 100) : 0;
  const latePercentage = total > 0 ? Math.round((late / total) * 100) : 0;
  const absentPercentage = total > 0 ? Math.round((absent / total) * 100) : 0;
  const onTimePercentage = present > 0 ? Math.round((onTime / present) * 100) : 0;

  // Get current time to display
  const currentTime = new Date().toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // Format today's date
  const todayDate = format(new Date(), 'EEEE d MMMM yyyy', { locale: fr });

  const StatCard = ({ title, value, color, percentage, icon }) => (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box sx={{ 
          bgcolor: `${color}.light`, 
          color: `${color}.dark`, 
          p: 1, 
          borderRadius: 1,
          mr: 2
        }}>
          {icon}
        </Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" fontWeight="bold" sx={{ my: 1 }}>
        {value}
        <Typography variant="body2" component="span" sx={{ ml: 1, color: 'text.secondary' }}>
          ({percentage}%)
        </Typography>
      </Typography>
      <LinearProgress 
        variant="determinate" 
        value={percentage} 
        color={color}
        sx={{ height: 8, borderRadius: 4 }}
      />
    </Box>
  );

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        mb: 3, 
        borderRadius: 2, 
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" component="h2" fontWeight="bold">
            {title}
          </Typography>
          {todayOnly && (
            <Chip 
              icon={<CalendarIcon />} 
              label="Aujourd'hui" 
              color="primary" 
              size="small" 
              sx={{ ml: 2 }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            Mise à jour à {currentTime}
          </Typography>
          {loading && (
            <CircularProgress size={16} sx={{ ml: 2 }} />
          )}
        </Box>
      </Box>
      
      {/* Add today's date for clarity */}
      {todayOnly && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textTransform: 'capitalize' }}>
          {todayDate}
        </Typography>
      )}
      
      <Divider sx={{ mb: 2 }} />
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Présent" 
            value={present} 
            color="success" 
            percentage={presentPercentage} 
            icon={<GroupsIcon />} 
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="En Retard" 
            value={late} 
            color="warning" 
            percentage={latePercentage} 
            icon={<AccessTimeIcon />} 
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Absent" 
            value={absent} 
            color="error" 
            percentage={absentPercentage} 
            icon={<GroupsIcon />} 
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Ponctualité" 
            value={`${onTimePercentage}%`} 
            color="info" 
            percentage={onTimePercentage} 
            icon={<TrendingUpIcon />} 
          />
        </Grid>
      </Grid>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        mt: 2
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 1, 
          borderRadius: 1, 
          bgcolor: 'background.default',
          width: '100%',
          justifyContent: 'space-around',
          maxWidth: 800,
          mx: 'auto'
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Total Employés
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {total}
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Taux de Présence
            </Typography>
            <Typography variant="h6" fontWeight="bold" color={presentPercentage > 80 ? 'success.main' : presentPercentage > 60 ? 'warning.main' : 'error.main'}>
              {presentPercentage}%
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Taux d'Absentéisme
            </Typography>
            <Typography variant="h6" fontWeight="bold" color={absentPercentage < 10 ? 'success.main' : absentPercentage < 20 ? 'warning.main' : 'error.main'}>
              {absentPercentage}%
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default RealTimeStats; 