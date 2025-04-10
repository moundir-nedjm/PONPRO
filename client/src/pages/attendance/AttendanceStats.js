import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Snackbar
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import {
  ArrowBack as ArrowBackIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  CalendarMonth as CalendarIcon,
  PictureAsPdf as PdfIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  PointElement,
  LineElement
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { format as formatDate } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from 'axios';

// Enregistrer les composants ChartJS
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  PointElement,
  LineElement
);

// Fonction pour générer des couleurs aléatoires
const generateRandomColors = (count) => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const r = Math.floor(Math.random() * 200);
    const g = Math.floor(Math.random() * 200);
    const b = Math.floor(Math.random() * 200);
    colors.push(`rgba(${r}, ${g}, ${b}, 0.7)`);
  }
  return colors;
};

const AttendanceStats = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  });
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState({
    byStatus: {},
    byDepartment: {},
    byEmployee: {},
    byDate: {},
    topEmployees: [],
    lateEmployees: []
  });
  const [pdfLoading, setPdfLoading] = useState(false);
  const chartRef = React.useRef(null);
  const [snackbar, setSnackbar] = useState(null);

  useEffect(() => {
    fetchData();
  }, [dateRange, selectedDepartment]);

  // Fetch employees from API
  const fetchEmployees = async () => {
    try {
      const res = await axios.get('/api/employees/active');
      
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setEmployees(res.data.data);
      } else if (Array.isArray(res.data)) {
        setEmployees(res.data);
      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setEmployees([]);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real departments from API
      const deptRes = await axios.get('/api/departments');
      let realDepartments = [];
      
      if (deptRes.data && deptRes.data.success && Array.isArray(deptRes.data.data)) {
        realDepartments = deptRes.data.data;
      } else if (Array.isArray(deptRes.data)) {
        realDepartments = deptRes.data;
      }
      
      setDepartments(realDepartments);
      
      // Filter employees by department
      const filteredEmployees = selectedDepartment === 'all' 
        ? employees
        : employees.filter(emp => emp.department && (emp.department._id === selectedDepartment || emp.department.id === selectedDepartment));
      
      // Fetch attendance statistics by status
      const params = new URLSearchParams();
      
      if (dateRange.startDate) {
        params.append('startDate', dateRange.startDate.toISOString());
      }
      if (dateRange.endDate) {
        params.append('endDate', dateRange.endDate.toISOString());
      }
      if (selectedDepartment && selectedDepartment !== 'all') {
        params.append('department', selectedDepartment);
      }
      
      const statsRes = await axios.get(`/api/attendance/stats?${params.toString()}`);
      
      let attendanceByStatus = {
        present: 0,
        late: 0,
        absent: 0
      };
      
      let attendanceByDepartment = {};
      let attendanceByEmployee = {};
      let attendanceByDate = {};
      let topEmployees = [];
      let lateEmployees = [];
      
      if (statsRes.data && statsRes.data.success) {
        const statsData = statsRes.data.data;
        
        // Process real data from API
        if (statsData.statusCounts) {
          attendanceByStatus = {
            present: statsData.statusCounts.present || 0,
            late: statsData.statusCounts.late || 0,
            absent: statsData.statusCounts.absent || 0
          };
        }
        
        if (statsData.departmentStats && Array.isArray(statsData.departmentStats)) {
          statsData.departmentStats.forEach(dept => {
            attendanceByDepartment[dept.name] = {
              present: dept.presentCount || 0,
              late: dept.lateCount || 0,
              absent: dept.absentCount || 0
            };
          });
        }
        
        if (statsData.employeeStats && Array.isArray(statsData.employeeStats)) {
          statsData.employeeStats.forEach(emp => {
            const empName = `${emp.firstName} ${emp.lastName}`;
            attendanceByEmployee[empName] = {
              present: emp.presentCount || 0,
              late: emp.lateCount || 0,
              absent: emp.absentCount || 0
            };
          });
          
          // Sort and extract top employees
          topEmployees = statsData.employeeStats
            .map(emp => ({
              id: emp.id,
              name: `${emp.firstName} ${emp.lastName}`,
              department: emp.department?.name,
              presentDays: emp.presentCount || 0,
              totalDays: (emp.presentCount || 0) + (emp.lateCount || 0) + (emp.absentCount || 0),
              punctualityRate: emp.punctualityRate || 0
            }))
            .sort((a, b) => b.punctualityRate - a.punctualityRate)
            .slice(0, 5);
          
          // Sort and extract late employees
          lateEmployees = statsData.employeeStats
            .map(emp => ({
              id: emp.id,
              name: `${emp.firstName} ${emp.lastName}`,
              department: emp.department?.name,
              lateDays: emp.lateCount || 0,
              totalDays: (emp.presentCount || 0) + (emp.lateCount || 0) + (emp.absentCount || 0),
              lateRate: emp.lateRate || 0
            }))
            .sort((a, b) => b.lateRate - a.lateRate)
            .slice(0, 5);
        }
        
        if (statsData.dailyStats && Array.isArray(statsData.dailyStats)) {
          statsData.dailyStats.forEach(day => {
            const dateStr = new Date(day.date).toISOString().split('T')[0];
            attendanceByDate[dateStr] = {
              present: day.presentCount || 0,
              late: day.lateCount || 0, 
              absent: day.absentCount || 0
            };
          });
        }
      } else {
        console.warn('Invalid attendance stats response format:', statsRes.data);
      }
      
      setAttendanceData({
        byStatus: attendanceByStatus,
        byDepartment: attendanceByDepartment,
        byEmployee: attendanceByEmployee,
        byDate: attendanceByDate,
        topEmployees: topEmployees,
        lateEmployees: lateEmployees
      });
      
      setLoading(false);
      
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError('Erreur lors du chargement des données. Veuillez réessayer plus tard.');
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Préparer les données pour les graphiques
  const statusChartData = {
    labels: ['Présent', 'En retard', 'Absent'],
    datasets: [
      {
        data: [
          attendanceData.byStatus.present || 0,
          attendanceData.byStatus.late || 0,
          attendanceData.byStatus.absent || 0
        ],
        backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
        borderColor: ['#388e3c', '#f57c00', '#d32f2f'],
        borderWidth: 1,
      },
    ],
  };

  const departmentChartData = {
    labels: Object.keys(attendanceData.byDepartment),
    datasets: [
      {
        label: 'Présent',
        data: Object.values(attendanceData.byDepartment).map(d => d.present),
        backgroundColor: '#4caf50',
      },
      {
        label: 'En retard',
        data: Object.values(attendanceData.byDepartment).map(d => d.late),
        backgroundColor: '#ff9800',
      },
      {
        label: 'Absent',
        data: Object.values(attendanceData.byDepartment).map(d => d.absent),
        backgroundColor: '#f44336',
      },
    ],
  };

  const employeeChartData = {
    labels: Object.keys(attendanceData.byEmployee),
    datasets: [
      {
        label: 'Présent',
        data: Object.values(attendanceData.byEmployee).map(d => d.present),
        backgroundColor: '#4caf50',
      },
      {
        label: 'En retard',
        data: Object.values(attendanceData.byEmployee).map(d => d.late),
        backgroundColor: '#ff9800',
      },
      {
        label: 'Absent',
        data: Object.values(attendanceData.byEmployee).map(d => d.absent),
        backgroundColor: '#f44336',
      },
    ],
  };

  // Préparer les données pour le graphique de tendance
  const dates = Object.keys(attendanceData.byDate).sort();
  const trendChartData = {
    labels: dates.map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }),
    datasets: [
      {
        label: 'Présent',
        data: dates.map(date => attendanceData.byDate[date].present),
        borderColor: '#4caf50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'En retard',
        data: dates.map(date => attendanceData.byDate[date].late),
        borderColor: '#ff9800',
        backgroundColor: 'rgba(255, 152, 0, 0.2)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Absent',
        data: dates.map(date => attendanceData.byDate[date].absent),
        borderColor: '#f44336',
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Add PDF generation function
  const generatePDF = async () => {
    try {
      setPdfLoading(true);
      
      // Get the container element for the current tab view
      const tabContentElement = document.getElementById(`tab-content-${tabValue}`);
      if (!tabContentElement) {
        throw new Error('Cannot find content element to generate PDF');
      }
      
      // Scale factor for better quality
      const scaleFactor = 2;
      
      // Create canvas from the element
      const canvas = await html2canvas(tabContentElement, {
        scale: scaleFactor,
        useCORS: true,
        logging: false
      });
      
      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add title
      const title = 'Rapport de Présence';
      pdf.setFontSize(18);
      pdf.text(title, 105, 15, { align: 'center' });
      
      // Add date range
      const dateRangeText = `Période: ${formatDate(dateRange.startDate, 'dd/MM/yyyy')} - ${formatDate(dateRange.endDate, 'dd/MM/yyyy')}`;
      pdf.setFontSize(12);
      pdf.text(dateRangeText, 105, 25, { align: 'center' });
      
      // Add department info
      const departmentText = `Département: ${selectedDepartment === 'all' ? 'Tous les départements' : departments.find(d => d.id === selectedDepartment)?.name}`;
      pdf.text(departmentText, 105, 32, { align: 'center' });
      
      // Get the canvas as an image
      const imgData = canvas.toDataURL('image/png');
      
      // Add the image to the PDF
      pdf.addImage(imgData, 'PNG', 0, 40, imgWidth, imgHeight);
      
      // Add footer
      const footerText = `Généré le ${formatDate(new Date(), 'dd/MM/yyyy à HH:mm')} | POINPRO`;
      pdf.setFontSize(10);
      pdf.text(footerText, 105, 290, { align: 'center' });
      
      // Download the PDF
      pdf.save(`rapport-presence-${formatDate(new Date(), 'yyyyMMdd_HHmmss')}.pdf`);
      
    } catch (err) {
      console.error('Erreur lors de la génération du PDF:', err);
      setSnackbar({
        open: true,
        message: 'Erreur lors de la génération du PDF',
        severity: 'error'
      });
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          component={Link}
          to="/attendance"
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Retour
        </Button>
        <Typography variant="h4" component="h1">
          Statistiques de Présence
        </Typography>
        
        {/* Add PDF export button */}
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          color="primary"
          startIcon={pdfLoading ? <CircularProgress size={20} color="inherit" /> : <PdfIcon />}
          onClick={generatePDF}
          disabled={loading || pdfLoading}
          sx={{ ml: 2 }}
        >
          Exporter PDF
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="department-select-label">Département</InputLabel>
              <Select
                labelId="department-select-label"
                value={selectedDepartment}
                label="Département"
                onChange={handleDepartmentChange}
              >
                <MenuItem value="all">Tous les départements</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={8}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker
                  label="Date de début"
                  value={dateRange.startDate}
                  onChange={(date) => handleDateRangeChange('startDate', date)}
                />
                <DatePicker
                  label="Date de fin"
                  value={dateRange.endDate}
                  onChange={(date) => handleDateRangeChange('endDate', date)}
                />
              </Box>
            </LocalizationProvider>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} centered>
          <Tab icon={<PieChartIcon />} label="Vue d'ensemble" />
          <Tab icon={<BarChartIcon />} label="Par département" />
          <Tab icon={<PeopleIcon />} label="Par employé" />
          <Tab icon={<TimelineIcon />} label="Tendances" />
          <Tab icon={<CalendarIcon />} label="Classements" />
        </Tabs>
      </Box>

      {/* Vue d'ensemble */}
      {tabValue === 0 && (
        <Grid container spacing={3} id="tab-content-0" ref={chartRef}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Répartition des Présences
              </Typography>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Pie data={statusChartData} options={{ maintainAspectRatio: false }} />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Statistiques Globales
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Card sx={{ bgcolor: 'success.light', color: 'white', textAlign: 'center', p: 2 }}>
                    <Typography variant="h3">{attendanceData.byStatus.present || 0}</Typography>
                    <Typography variant="body2">Présents</Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card sx={{ bgcolor: 'warning.light', color: 'white', textAlign: 'center', p: 2 }}>
                    <Typography variant="h3">{attendanceData.byStatus.late || 0}</Typography>
                    <Typography variant="body2">En retard</Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card sx={{ bgcolor: 'error.light', color: 'white', textAlign: 'center', p: 2 }}>
                    <Typography variant="h3">{attendanceData.byStatus.absent || 0}</Typography>
                    <Typography variant="body2">Absents</Typography>
                  </Card>
                </Grid>
              </Grid>
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Taux de présence
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ flexGrow: 1, bgcolor: 'grey.300', height: 10, borderRadius: 5 }}>
                    <Box 
                      sx={{ 
                        width: `${Math.round(attendanceData.byStatus.present / (attendanceData.byStatus.present + attendanceData.byStatus.late + attendanceData.byStatus.absent) * 100)}%`, 
                        bgcolor: 'success.main', 
                        height: 10, 
                        borderRadius: 5 
                      }} 
                    />
                  </Box>
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    {Math.round(attendanceData.byStatus.present / (attendanceData.byStatus.present + attendanceData.byStatus.late + attendanceData.byStatus.absent) * 100)}%
                  </Typography>
                </Box>
                <Typography variant="subtitle1" gutterBottom>
                  Taux de retard
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ flexGrow: 1, bgcolor: 'grey.300', height: 10, borderRadius: 5 }}>
                    <Box 
                      sx={{ 
                        width: `${Math.round(attendanceData.byStatus.late / (attendanceData.byStatus.present + attendanceData.byStatus.late + attendanceData.byStatus.absent) * 100)}%`, 
                        bgcolor: 'warning.main', 
                        height: 10, 
                        borderRadius: 5 
                      }} 
                    />
                  </Box>
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    {Math.round(attendanceData.byStatus.late / (attendanceData.byStatus.present + attendanceData.byStatus.late + attendanceData.byStatus.absent) * 100)}%
                  </Typography>
                </Box>
                <Typography variant="subtitle1" gutterBottom>
                  Taux d'absence
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flexGrow: 1, bgcolor: 'grey.300', height: 10, borderRadius: 5 }}>
                    <Box 
                      sx={{ 
                        width: `${Math.round(attendanceData.byStatus.absent / (attendanceData.byStatus.present + attendanceData.byStatus.late + attendanceData.byStatus.absent) * 100)}%`, 
                        bgcolor: 'error.main', 
                        height: 10, 
                        borderRadius: 5 
                      }} 
                    />
                  </Box>
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    {Math.round(attendanceData.byStatus.absent / (attendanceData.byStatus.present + attendanceData.byStatus.late + attendanceData.byStatus.absent) * 100)}%
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Par département */}
      {tabValue === 1 && (
        <Paper sx={{ p: 3 }} id="tab-content-1" ref={chartRef}>
          <Typography variant="h6" gutterBottom>
            Présence par Département
          </Typography>
          <Box sx={{ height: 400 }}>
            <Bar 
              data={departmentChartData} 
              options={{ 
                maintainAspectRatio: false,
                scales: {
                  x: {
                    stacked: false,
                  },
                  y: {
                    stacked: false,
                    beginAtZero: true
                  }
                }
              }} 
            />
          </Box>
          <Divider sx={{ my: 3 }} />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Département</TableCell>
                  <TableCell align="right">Présents</TableCell>
                  <TableCell align="right">En retard</TableCell>
                  <TableCell align="right">Absents</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Taux de présence</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(attendanceData.byDepartment).map(([dept, data]) => {
                  const total = data.present + data.late + data.absent;
                  const rate = Math.round((data.present / total) * 100);
                  return (
                    <TableRow key={dept}>
                      <TableCell>{dept}</TableCell>
                      <TableCell align="right">{data.present}</TableCell>
                      <TableCell align="right">{data.late}</TableCell>
                      <TableCell align="right">{data.absent}</TableCell>
                      <TableCell align="right">{total}</TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={`${rate}%`} 
                          color={rate > 80 ? 'success' : rate > 60 ? 'warning' : 'error'} 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Par employé */}
      {tabValue === 2 && (
        <Paper sx={{ p: 3 }} id="tab-content-2" ref={chartRef}>
          <Typography variant="h6" gutterBottom>
            Présence par Employé
          </Typography>
          <Box sx={{ height: 400 }}>
            <Bar 
              data={employeeChartData} 
              options={{ 
                maintainAspectRatio: false,
                scales: {
                  x: {
                    stacked: false,
                  },
                  y: {
                    stacked: false,
                    beginAtZero: true
                  }
                }
              }} 
            />
          </Box>
          <Divider sx={{ my: 3 }} />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employé</TableCell>
                  <TableCell align="right">Présents</TableCell>
                  <TableCell align="right">En retard</TableCell>
                  <TableCell align="right">Absents</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Taux de présence</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(attendanceData.byEmployee).map(([emp, data]) => {
                  const total = data.present + data.late + data.absent;
                  const rate = Math.round((data.present / total) * 100);
                  return (
                    <TableRow key={emp}>
                      <TableCell>{emp}</TableCell>
                      <TableCell align="right">{data.present}</TableCell>
                      <TableCell align="right">{data.late}</TableCell>
                      <TableCell align="right">{data.absent}</TableCell>
                      <TableCell align="right">{total}</TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={`${rate}%`} 
                          color={rate > 80 ? 'success' : rate > 60 ? 'warning' : 'error'} 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Tendances */}
      {tabValue === 3 && (
        <Paper sx={{ p: 3 }} id="tab-content-3" ref={chartRef}>
          <Typography variant="h6" gutterBottom>
            Tendances de Présence
          </Typography>
          <Box sx={{ height: 400 }}>
            <Line 
              data={trendChartData} 
              options={{ 
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }} 
            />
          </Box>
        </Paper>
      )}

      {/* Classements */}
      {tabValue === 4 && (
        <Grid container spacing={3} id="tab-content-4" ref={chartRef}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top 5 des Employés les Plus Ponctuels
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employé</TableCell>
                      <TableCell>Département</TableCell>
                      <TableCell align="right">Jours présent</TableCell>
                      <TableCell align="right">Taux de ponctualité</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceData.topEmployees.map((emp) => (
                      <TableRow key={emp.id}>
                        <TableCell>{emp.name}</TableCell>
                        <TableCell>{emp.department}</TableCell>
                        <TableCell align="right">{emp.presentDays}/{emp.totalDays}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${emp.punctualityRate}%`} 
                            color="success" 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top 5 des Employés en Retard
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employé</TableCell>
                      <TableCell>Département</TableCell>
                      <TableCell align="right">Jours en retard</TableCell>
                      <TableCell align="right">Taux de retard</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceData.lateEmployees.map((emp) => (
                      <TableRow key={emp.id}>
                        <TableCell>{emp.name}</TableCell>
                        <TableCell>{emp.department}</TableCell>
                        <TableCell align="right">{emp.lateDays}/{emp.totalDays}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${emp.lateRate}%`} 
                            color="error" 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Add snackbar for notifications */}
      <Snackbar
        open={snackbar?.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar?.severity || 'info'} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AttendanceStats; 