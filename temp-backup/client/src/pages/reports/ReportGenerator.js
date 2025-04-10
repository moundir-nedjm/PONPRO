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
  Snackbar
} from '@mui/material';
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
import axios from 'axios';

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
        const res = await axios.get('/api/departments');
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Générateur de Rapports
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={pdfLoading ? <CircularProgress size={20} color="inherit" /> : <PdfIcon />}
          onClick={generatePDF}
          disabled={loading || pdfLoading}
        >
          Exporter en PDF
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              centered
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              aria-label="rapport tabs"
            >
              {reportTypes.map((report, index) => (
                <Tab key={report.id} label={report.label} />
              ))}
            </Tabs>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
          
          <Grid item xs={12} sm={4} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
              <DatePicker
                label="Date de début"
                value={dateRange.startDate}
                onChange={(date) => handleDateChange('startDate', date)}
                slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={4} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
              <DatePicker
                label="Date de fin"
                value={dateRange.endDate}
                onChange={(date) => handleDateChange('endDate', date)}
                slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="department-select-label">Département</InputLabel>
              <Select
                labelId="department-select-label"
                id="department-select"
                value={selectedDepartment}
                label="Département"
                onChange={handleDepartmentChange}
              >
                <MenuItem value="all">Tous les départements</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept._id} value={dept._id}>{dept.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4} md={3} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<ResetIcon />}
              onClick={handleResetFilters}
              sx={{ mt: 2 }}
            >
              Réinitialiser
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Box ref={reportContainerRef}>
        <Paper sx={{ p: 3 }}>
          {error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
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
      </Box>

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