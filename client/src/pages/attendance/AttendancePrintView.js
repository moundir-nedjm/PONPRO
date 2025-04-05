import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  Print as PrintIcon,
  ArrowBack as ArrowBackIcon,
  GetApp as DownloadIcon
} from '@mui/icons-material';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useReactToPrint } from 'react-to-print';

const AttendancePrintView = () => {
  const { employeeId, month, year } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceCodes, setAttendanceCodes] = useState([]);
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [summary, setSummary] = useState({
    present: 0,
    absent: 0,
    leave: 0,
    holiday: 0,
    other: 0,
    premium: 0,
    influencer: 0
  });

  useEffect(() => {
    if (employeeId && month && year) {
      const selectedDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      
      // Générer les jours du mois
      const start = startOfMonth(selectedDate);
      const end = endOfMonth(selectedDate);
      const days = eachDayOfInterval({ start, end });
      setDaysInMonth(days);
      
      fetchEmployee();
      fetchAttendanceCodes();
      fetchAttendanceData(selectedDate);
    }
  }, [employeeId, month, year]);

  useEffect(() => {
    if (attendanceData.length > 0 && attendanceCodes.length > 0) {
      calculateSummary();
    }
  }, [attendanceData, attendanceCodes]);

  const fetchEmployee = async () => {
    try {
      const response = await axios.get(`/api/employees/${employeeId}`);
      setEmployee(response.data.data);
    } catch (err) {
      setError('Erreur lors du chargement des informations de l\'employé');
      console.error(err);
    }
  };

  const fetchAttendanceCodes = async () => {
    try {
      const response = await axios.get('/api/attendance-codes');
      setAttendanceCodes(response.data.data);
    } catch (err) {
      setError('Erreur lors du chargement des codes de présence');
      console.error(err);
    }
  };

  const fetchAttendanceData = async (selectedDate) => {
    try {
      setLoading(true);
      const start = format(startOfMonth(selectedDate), 'yyyy-MM-dd');
      const end = format(endOfMonth(selectedDate), 'yyyy-MM-dd');
      
      const response = await axios.get(`/api/attendance/employee/${employeeId}/codes`, {
        params: { startDate: start, endDate: end }
      });
      
      setAttendanceData(response.data.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données de présence');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = () => {
    const newSummary = {
      present: 0,
      absent: 0,
      leave: 0,
      holiday: 0,
      other: 0,
      premium: 0,
      influencer: 0
    };

    attendanceData.forEach(att => {
      const code = attendanceCodes.find(c => c.code === att.code);
      if (code) {
        newSummary[code.category]++;
        
        if (code.paymentImpact === 'premium') {
          newSummary.premium += att.premiumAmount || 0;
        }
        
        if (code.influencer) {
          newSummary.influencer++;
        }
      }
    });

    // Ajouter les weekends comme jours fériés
    daysInMonth.forEach(day => {
      if (isWeekend(day)) {
        const hasAttendance = attendanceData.some(att => 
          format(parseISO(att.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
        );
        
        if (!hasAttendance) {
          newSummary.holiday++;
        }
      }
    });

    setSummary(newSummary);
  };

  const getAttendanceForDay = (day) => {
    const formattedDay = format(day, 'yyyy-MM-dd');
    return attendanceData.find(att => 
      format(parseISO(att.date), 'yyyy-MM-dd') === formattedDay
    );
  };

  const getCodeColor = (code) => {
    const codeObj = attendanceCodes.find(c => c.code === code);
    return codeObj ? codeObj.color : '#9e9e9e';
  };

  const getCodeDescription = (code) => {
    const codeObj = attendanceCodes.find(c => c.code === code);
    return codeObj ? codeObj.description : '';
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Feuille_Presence_${employee?.lastName}_${employee?.firstName}_${month}_${year}`,
  });

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Retour
        </Button>
        <Box>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ mr: 1 }}
          >
            Imprimer
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
          >
            Exporter PDF
          </Button>
        </Box>
      </Box>

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
        <Paper sx={{ p: 3 }} ref={printRef}>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              Feuille de Présence
            </Typography>
            <Typography variant="h6">
              {format(new Date(parseInt(year), parseInt(month) - 1, 1), 'MMMM yyyy', { locale: fr })}
            </Typography>
          </Box>

          {employee && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">
                  Employé: {employee.firstName} {employee.lastName}
                </Typography>
                <Typography variant="body2">
                  ID: {employee.employeeId}
                </Typography>
                <Typography variant="body2">
                  Poste: {employee.position}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6} sx={{ textAlign: { md: 'right' } }}>
                <Typography variant="body2">
                  Date d'embauche: {format(parseISO(employee.hireDate), 'dd/MM/yyyy')}
                </Typography>
                <Typography variant="body2">
                  Département: {employee.department?.name || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          )}

          <Divider sx={{ mb: 3 }} />

          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Jour</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Impact sur la Paie</TableCell>
                  <TableCell>Prime (DA)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {daysInMonth.map(day => {
                  const attendance = getAttendanceForDay(day);
                  const isWeekendDay = isWeekend(day);
                  
                  return (
                    <TableRow 
                      key={format(day, 'yyyy-MM-dd')}
                      sx={{ 
                        backgroundColor: isWeekendDay ? 'rgba(0, 0, 0, 0.04)' : 'inherit'
                      }}
                    >
                      <TableCell>{format(day, 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{format(day, 'EEEE', { locale: fr })}</TableCell>
                      <TableCell>
                        {attendance?.code ? (
                          <Chip
                            label={attendance.code}
                            style={{
                              backgroundColor: getCodeColor(attendance.code),
                              color: '#fff',
                              fontWeight: 'bold'
                            }}
                            size="small"
                          />
                        ) : isWeekendDay ? (
                          <Chip
                            label="W"
                            style={{
                              backgroundColor: '#9e9e9e',
                              color: '#fff',
                              fontWeight: 'bold'
                            }}
                            size="small"
                          />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {attendance?.code ? getCodeDescription(attendance.code) : 
                         isWeekendDay ? 'Week-end' : '-'}
                      </TableCell>
                      <TableCell>
                        {attendance?.paymentImpact || (isWeekendDay ? 'Sans paie' : '-')}
                      </TableCell>
                      <TableCell>
                        {attendance?.premiumAmount ? `${attendance.premiumAmount.toFixed(2)}` : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Résumé du Mois
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      Jours de présence: {summary.present}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      Jours d'absence: {summary.absent}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      Jours de congé: {summary.leave}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      Jours fériés/Weekend: {summary.holiday}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      Autres: {summary.other}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      Codes Influencer: {summary.influencer}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Informations de Paie
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Total des primes: {summary.premium.toFixed(2)} DA
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        Signature de l'employé:
                      </Typography>
                      <Box sx={{ height: 60, borderBottom: '1px solid #ddd', mt: 1 }} />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        Signature du responsable:
                      </Typography>
                      <Box sx={{ height: 60, borderBottom: '1px solid #ddd', mt: 1 }} />
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="textSecondary">
              Document généré le {format(new Date(), 'dd/MM/yyyy à HH:mm')}
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default AttendancePrintView; 