import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiClient from '../../utils/api';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { format, startOfMonth, endOfMonth, parseISO, isValid } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import StatsButton from '../../components/attendance/StatsButton';

const AttendanceDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [departments, setDepartments] = useState([]);
  const [attendanceCodes, setAttendanceCodes] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({
    byCode: [],
    byCategory: [],
    byPaymentImpact: [],
    influencerStats: { influencer: 0, regular: 0 }
  });

  useEffect(() => {
    fetchDepartments();
    fetchAttendanceCodes();
  }, []);

  useEffect(() => {
    if (attendanceCodes.length > 0) {
      fetchAttendanceStats();
    }
  }, [selectedMonth, selectedDepartment, attendanceCodes]);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments');
      setDepartments(response.data.data);
    } catch (err) {
      setError('Erreur lors du chargement des départements');
      console.error(err);
    }
  };

  const fetchAttendanceCodes = async () => {
    try {
      const response = await apiClient.get('/attendance-codes');
      setAttendanceCodes(response.data.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des codes de présence');
      console.error('Error fetching attendance codes:', err);
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      setLoading(true);
      const start = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');
      
      // Dans un système réel, cette requête serait traitée par le backend
      // Ici, nous simulons les données pour la démonstration
      
      // Simuler les données de statistiques par code
      const byCodeData = attendanceCodes.map(code => ({
        name: code.code,
        value: Math.floor(Math.random() * 100),
        color: code.color
      })).sort((a, b) => b.value - a.value);
      
      // Simuler les données de statistiques par catégorie
      const categories = [...new Set(attendanceCodes.map(code => code.category))];
      const byCategoryData = categories.map(category => {
        const codesInCategory = attendanceCodes.filter(code => code.category === category);
        return {
          name: getCategoryLabel(category),
          value: codesInCategory.reduce((sum, code) => {
            const randomValue = Math.floor(Math.random() * 50);
            return sum + randomValue;
          }, 0),
          color: getCategoryColor(category)
        };
      });
      
      // Simuler les données de statistiques par impact sur la paie
      const paymentImpacts = [...new Set(attendanceCodes.map(code => code.paymentImpact))];
      const byPaymentImpactData = paymentImpacts.map(impact => {
        const codesWithImpact = attendanceCodes.filter(code => code.paymentImpact === impact);
        return {
          name: getPaymentImpactLabel(impact),
          value: codesWithImpact.reduce((sum, code) => {
            const randomValue = Math.floor(Math.random() * 50);
            return sum + randomValue;
          }, 0),
          color: getPaymentImpactColor(impact)
        };
      });
      
      // Simuler les données de statistiques influencer vs regular
      const influencerCodes = attendanceCodes.filter(code => code.influencer);
      const regularCodes = attendanceCodes.filter(code => !code.influencer);
      
      const influencerValue = influencerCodes.reduce((sum, code) => {
        const randomValue = Math.floor(Math.random() * 30);
        return sum + randomValue;
      }, 0);
      
      const regularValue = regularCodes.reduce((sum, code) => {
        const randomValue = Math.floor(Math.random() * 70);
        return sum + randomValue;
      }, 0);
      
      const influencerStats = [
        { name: 'Influencer', value: influencerValue, color: '#9c27b0' },
        { name: 'Régulier', value: regularValue, color: '#2196f3' }
      ];
      
      setAttendanceStats({
        byCode: byCodeData,
        byCategory: byCategoryData,
        byPaymentImpact: byPaymentImpactData,
        influencerStats
      });
      
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des statistiques de présence');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (newMonth) => {
    if (isValid(newMonth)) {
      setSelectedMonth(newMonth);
    }
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'present': 'Présent',
      'absent': 'Absent',
      'leave': 'Congé',
      'holiday': 'Jour Férié',
      'other': 'Autre'
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'present': '#4caf50',
      'absent': '#f44336',
      'leave': '#2196f3',
      'holiday': '#9c27b0',
      'other': '#ff9800'
    };
    return colors[category] || '#9e9e9e';
  };

  const getPaymentImpactLabel = (impact) => {
    const labels = {
      'full-pay': 'Paie complète',
      'partial-pay': 'Paie partielle',
      'no-pay': 'Sans paie',
      'premium': 'Prime'
    };
    return labels[impact] || impact;
  };

  const getPaymentImpactColor = (impact) => {
    const colors = {
      'full-pay': '#4caf50',
      'partial-pay': '#ff9800',
      'no-pay': '#f44336',
      'premium': '#9c27b0'
    };
    return colors[impact] || '#9e9e9e';
  };

  const formatTooltipValue = (value) => {
    return `${value} occurrences`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Tableau de Bord des Codes de Présence
        </Typography>
        <StatsButton variant="outlined" />
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <DatePicker
              label="Mois"
              views={['year', 'month']}
              value={selectedMonth}
              onChange={handleMonthChange}
              renderInput={(params) => <TextField {...params} fullWidth />}
              slotProps={{
                textField: { fullWidth: true }
              }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Département</InputLabel>
            <Select
              value={selectedDepartment}
              onChange={handleDepartmentChange}
              label="Département"
            >
              <MenuItem value="all">Tous les départements</MenuItem>
              {departments.map(dept => (
                <MenuItem key={dept._id} value={dept._id}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Distribution des codes de présence */}
          <Grid item xs={12} lg={6}>
            <Card>
              <CardHeader title="Distribution des Codes de Présence" />
              <Divider />
              <CardContent>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={attendanceStats.byCode.slice(0, 15)} // Limiter aux 15 premiers pour la lisibilité
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis />
                      <Tooltip formatter={formatTooltipValue} />
                      <Legend />
                      <Bar dataKey="value" name="Occurrences">
                        {attendanceStats.byCode.slice(0, 15).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Distribution par catégorie */}
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardHeader title="Distribution par Catégorie" />
              <Divider />
              <CardContent>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attendanceStats.byCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {attendanceStats.byCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={formatTooltipValue} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Distribution par impact sur la paie */}
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardHeader title="Distribution par Impact sur la Paie" />
              <Divider />
              <CardContent>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attendanceStats.byPaymentImpact}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {attendanceStats.byPaymentImpact.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={formatTooltipValue} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Distribution Influencer vs Regular */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Distribution Influencer vs Régulier" />
              <Divider />
              <CardContent>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={attendanceStats.influencerStats}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={formatTooltipValue} />
                      <Legend />
                      <Bar dataKey="value" name="Occurrences">
                        {attendanceStats.influencerStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AttendanceDashboard; 