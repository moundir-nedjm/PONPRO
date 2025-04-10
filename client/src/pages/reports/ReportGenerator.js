import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Snackbar,
  useMediaQuery,
  Stack,
  TextField
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { format, addMonths, endOfMonth, startOfMonth } from 'date-fns';
import {
  PictureAsPdf as PdfIcon,
  Print as PrintIcon,
  FilterList as FilterIcon,
  RestartAlt as ResetIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import apiClient from '../../utils/api';

// Import your individual report components
import AttendanceReport from './AttendanceReport';
import LeaveReport from './LeaveReport';
import PerformanceReport from './PerformanceReport';

const reportTypes = [
  { id: 'attendance', label: 'Rapport de Présence', component: AttendanceReport },
  { id: 'leave', label: 'Rapport de Congés', component: LeaveReport },
  { id: 'performance', label: 'Rapport de Performance', component: PerformanceReport },
];

const ReportGenerator = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const [activeTab, setActiveTab] = useState(0);
  const [selectedReport, setSelectedReport] = useState(reportTypes[0].id);
  const [dateRange, setDateRange] = useState({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  });
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const reportContainerRef = useRef(null);

  // Fetch departments on component mount
  React.useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await apiClient.get('/departments');
        setDepartments(res.data.data || []);
      } catch (err) {
        console.error('Error fetching departments:', err);
        // Mock departments for demo
        setDepartments([
          { _id: 'dept1', name: 'KBK FROID' },
          { _id: 'dept2', name: 'KBK ELEC' },
          { _id: 'dept3', name: 'HML' },
          { _id: 'dept4', name: 'REB' },
          { _id: 'dept5', name: 'DEG' },
          { _id: 'dept6', name: 'HAMRA' },
          { _id: 'dept7', name: 'ADM SETIF' },
          { _id: 'dept8', name: 'ADM HMD' }
        ]);
      }
    };

    fetchDepartments();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedReport(reportTypes[newValue].id);
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
  };

  const handleResetFilters = () => {
    setDateRange({
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
    });
    setSelectedDepartment('all');
  };

  const generatePDF = async () => {
    try {
      setPdfLoading(true);
      
      // Get the report container element
      const reportElement = reportContainerRef.current;
      if (!reportElement) {
        throw new Error('Cannot find report element to generate PDF');
      }
      
      // Scale factor for better quality
      const scaleFactor = 2;
      
      // Create canvas from the element
      const canvas = await html2canvas(reportElement, {
        scale: scaleFactor,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add title
      const reportTitle = reportTypes.find(r => r.id === selectedReport)?.label || 'Rapport';
      pdf.setFontSize(18);
      pdf.text(reportTitle, 105, 15, { align: 'center' });
      
      // Add date range
      const dateRangeText = `Période: ${format(dateRange.startDate, 'dd/MM/yyyy')} - ${format(dateRange.endDate, 'dd/MM/yyyy')}`;
      pdf.setFontSize(12);
      pdf.text(dateRangeText, 105, 25, { align: 'center' });
      
      // Add department info
      const departmentText = `Département: ${selectedDepartment === 'all' ? 'Tous les départements' : departments.find(d => d._id === selectedDepartment)?.name}`;
      pdf.text(departmentText, 105, 32, { align: 'center' });
      
      // Get the canvas as an image
      const imgData = canvas.toDataURL('image/png');
      
      // Add the image to PDF (handling pagination if content is too long)
      pdf.addImage(imgData, 'PNG', 0, 40, imgWidth, imgHeight);
      heightLeft -= (pageHeight - 40);
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Add footer
      const footerText = `Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm')} | POINPRO`;
      pdf.setPage(pdf.getNumberOfPages());
      pdf.setFontSize(10);
      pdf.text(footerText, 105, 290, { align: 'center' });
      
      // Download the PDF
      const fileName = `${selectedReport}-${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
      pdf.save(fileName);
      
      setSnackbar({
        open: true,
        message: `Rapport exporté avec succès: ${fileName}`,
        severity: 'success'
      });
      
    } catch (err) {
      console.error('Error generating PDF:', err);
      setSnackbar({
        open: true,
        message: `Erreur lors de la génération du PDF: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setPdfLoading(false);
    }
  };

  // Select the current report component
  const ReportComponent = reportTypes[activeTab].component;

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
        <Typography 
          variant="h5" 
          component="h1" 
          gutterBottom
          sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}
        >
          Générateur de Rapports
        </Typography>
        <Typography color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Générez des rapports détaillés sur la présence, les congés et la performance des employés.
        </Typography>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="report type tabs"
        >
          {reportTypes.map((report, index) => (
            <Tab
              key={report.id}
              label={report.label}
              id={`report-tab-${index}`}
              aria-controls={`report-tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </Paper>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterIcon color="primary" sx={{ mr: 1, fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
          <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Filtres de Rapport
          </Typography>
        </Box>
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Date Filters */}
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
              <Grid container spacing={{ xs: 1, sm: 2 }}>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Date de début"
                    value={dateRange.startDate}
                    onChange={(date) => handleDateChange('startDate', date)}
                    renderInput={(params) => <TextField {...params} fullWidth size={isMobile ? "small" : "medium"} />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Date de fin"
                    value={dateRange.endDate}
                    onChange={(date) => handleDateChange('endDate', date)}
                    renderInput={(params) => <TextField {...params} fullWidth size={isMobile ? "small" : "medium"} />}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
          </Grid>
          
          {/* Department Filter */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <InputLabel id="department-label">Département</InputLabel>
              <Select
                labelId="department-label"
                id="department-select"
                value={selectedDepartment}
                label="Département"
                onChange={handleDepartmentChange}
              >
                <MenuItem value="all">Tous les départements</MenuItem>
                {departments.map((department) => (
                  <MenuItem key={department._id} value={department._id}>
                    {department.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {/* Reset Button */}
          <Grid item xs={12} sm={6} md={2} sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'center' } }}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ResetIcon />}
              onClick={handleResetFilters}
              fullWidth
              size={isMobile ? "small" : "medium"}
            >
              Réinitialiser
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={{ xs: 1, sm: 2 }}
        sx={{ 
          mb: { xs: 2, sm: 3 },
          justifyContent: { xs: 'stretch', sm: 'flex-end' }
        }}
      >
        <Button
          variant="outlined"
          color="primary"
          startIcon={<PrintIcon />}
          onClick={() => window.print()}
          fullWidth={isMobile}
          size={isMobile ? "small" : "medium"}
        >
          Imprimer
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={pdfLoading ? <CircularProgress size={20} color="inherit" /> : <PdfIcon />}
          onClick={generatePDF}
          disabled={pdfLoading}
          fullWidth={isMobile}
          size={isMobile ? "small" : "medium"}
        >
          {isMobile ? 'PDF' : 'Exporter en PDF'}
        </Button>
      </Stack>

      <Paper 
        ref={reportContainerRef} 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          mb: { xs: 2, sm: 3 },
          overflow: 'auto'
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            mb: { xs: 2, sm: 3 }
          }}
        >
          <Typography 
            variant="h6" 
            component="h2"
            sx={{ 
              fontSize: { xs: '1rem', sm: '1.25rem' },
              mb: { xs: 1, sm: 0 }
            }}
          >
            {reportTypes.find(r => r.id === selectedReport)?.label || 'Rapport'}
          </Typography>
          <Typography 
            variant="subtitle2" 
            color="textSecondary"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            {`Période: ${format(dateRange.startDate, 'dd/MM/yyyy')} - ${format(dateRange.endDate, 'dd/MM/yyyy')}`}
          </Typography>
        </Box>

        {error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <ReportComponent 
            dateRange={dateRange}
            department={selectedDepartment}
            departments={departments}
          />
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportGenerator; 