import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  TextField,
  Snackbar
} from '@mui/material';
import {
  Face as FaceIcon,
  Fingerprint as FingerprintIcon,
  QrCode as QrCodeIcon,
  Save as SaveIcon,
  Camera as CameraIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import FaceScanner from '../attendance/FaceScanner';
import FingerprintScanner from '../attendance/FingerprintScanner';
import QRCode from 'qrcode.react';
import axios from 'axios';

const BiometricEnrollment = ({ employeeId, employeeName }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [faceSamples, setFaceSamples] = useState([]);
  const [fingerprintSamples, setFingerprintSamples] = useState([]);
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [openCamera, setOpenCamera] = useState(false);
  const [openFingerprint, setOpenFingerprint] = useState(false);
  const [openQrCodeDialog, setOpenQrCodeDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Face recognition functions
  const handleCaptureFace = () => {
    setOpenCamera(true);
  };

  const handleFaceCaptureSuccess = (data) => {
    const newSample = {
      id: Date.now(),
      image: data.image,
      timestamp: new Date().toISOString()
    };
    
    setFaceSamples([...faceSamples, newSample]);
    setOpenCamera(false);
    
    setSnackbar({
      open: true,
      message: `Échantillon de visage ${faceSamples.length + 1} capturé avec succès`,
      severity: 'success'
    });
  };

  const handleCloseFaceScanner = () => {
    setOpenCamera(false);
  };

  const handleDeleteFaceSample = (sampleId) => {
    setFaceSamples(faceSamples.filter(sample => sample.id !== sampleId));
  };

  const handleSaveFaceSamples = async () => {
    if (faceSamples.length < 3) {
      setSnackbar({
        open: true,
        message: 'Veuillez capturer au moins 3 échantillons de visage',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In a real implementation, this would send the face samples to the server
      console.log('Saving face samples for employee:', employeeId);
      console.log('Number of samples:', faceSamples.length);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      setSnackbar({
        open: true,
        message: 'Données de visage enregistrées avec succès',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error saving face samples:', err);
      setError('Erreur lors de l\'enregistrement des données faciales');
      setSnackbar({
        open: true,
        message: 'Erreur lors de l\'enregistrement des données faciales',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fingerprint functions
  const handleCaptureFingerprint = () => {
    setOpenFingerprint(true);
  };

  const handleFingerprintCaptureSuccess = (data) => {
    const newSample = {
      id: Date.now(),
      fingerprintData: data.fingerprintData || 'mock-fingerprint-data',
      timestamp: new Date().toISOString()
    };
    
    setFingerprintSamples([...fingerprintSamples, newSample]);
    setOpenFingerprint(false);
    
    setSnackbar({
      open: true,
      message: `Échantillon d'empreinte ${fingerprintSamples.length + 1} capturé avec succès`,
      severity: 'success'
    });
  };

  const handleCloseFingerprint = () => {
    setOpenFingerprint(false);
  };

  const handleDeleteFingerprintSample = (sampleId) => {
    setFingerprintSamples(fingerprintSamples.filter(sample => sample.id !== sampleId));
  };

  const handleSaveFingerprintSamples = async () => {
    if (fingerprintSamples.length < 3) {
      setSnackbar({
        open: true,
        message: 'Veuillez capturer au moins 3 échantillons d\'empreinte',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In a real implementation, this would send the fingerprint samples to the server
      console.log('Saving fingerprint samples for employee:', employeeId);
      console.log('Number of samples:', fingerprintSamples.length);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
      setSnackbar({
        open: true,
        message: 'Données d\'empreintes enregistrées avec succès',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error saving fingerprint samples:', err);
      setError('Erreur lors de l\'enregistrement des empreintes');
      setSnackbar({
        open: true,
        message: 'Erreur lors de l\'enregistrement des empreintes',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // QR code functions
  const handleGenerateQrCode = () => {
    // Generate a unique QR code for this employee
    // In a real application, this would likely involve some secure token generation
    const qrData = `EMP-${employeeId}-${Date.now()}`;
    setQrCodeValue(qrData);
    setOpenQrCodeDialog(true);
  };

  const handleCloseQrCodeDialog = () => {
    setOpenQrCodeDialog(false);
  };

  const handlePrintQrCode = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${employeeName}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; }
            .container { margin: 50px auto; max-width: 400px; }
            .qr-code { margin: 20px 0; }
            .employee-info { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="employee-info">
              <h2>${employeeName}</h2>
              <p>ID: ${employeeId}</p>
            </div>
            <div class="qr-code">
              <img src="${document.getElementById('qr-code').toDataURL()}" alt="QR Code" />
            </div>
            <p>Scannez ce QR code pour pointer votre présence</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSaveQrCode = async () => {
    if (!qrCodeValue) {
      setSnackbar({
        open: true,
        message: 'Veuillez d\'abord générer un QR code',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In a real implementation, this would send the QR code to the server
      console.log('Saving QR code for employee:', employeeId);
      console.log('QR code value:', qrCodeValue);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      setSnackbar({
        open: true,
        message: 'QR code enregistré avec succès',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error saving QR code:', err);
      setError('Erreur lors de l\'enregistrement du QR code');
      setSnackbar({
        open: true,
        message: 'Erreur lors de l\'enregistrement du QR code',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<FaceIcon />} label="Reconnaissance Faciale" />
          <Tab icon={<FingerprintIcon />} label="Empreinte Digitale" />
          <Tab icon={<QrCodeIcon />} label="QR Code" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Enregistrement des données faciales
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Capturez plusieurs images du visage de l'employé sous différents angles pour améliorer la précision de la reconnaissance.
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Données biométriques enregistrées avec succès
                </Alert>
              )}
              
              <Button
                variant="contained"
                startIcon={<CameraIcon />}
                onClick={handleCaptureFace}
                sx={{ mb: 3 }}
              >
                Capturer le visage
              </Button>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Échantillons capturés: {faceSamples.length}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {faceSamples.map(sample => (
                    <Paper key={sample.id} sx={{ p: 1, width: 120, position: 'relative' }}>
                      <img 
                        src={sample.image || 'https://via.placeholder.com/100x100?text=Face+Sample'} 
                        alt="Face sample" 
                        style={{ width: '100%', height: 'auto' }}
                      />
                      <Button 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteFaceSample(sample.id)}
                      >
                        Supprimer
                      </Button>
                    </Paper>
                  ))}
                </Box>
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSaveFaceSamples}
                disabled={loading || faceSamples.length < 3}
              >
                {loading ? <CircularProgress size={24} /> : 'Enregistrer les données faciales'}
              </Button>
            </Box>
          )}
          
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Enregistrement des empreintes digitales
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Capturez plusieurs échantillons de l'empreinte digitale de l'employé pour améliorer la précision de la reconnaissance.
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Données biométriques enregistrées avec succès
                </Alert>
              )}
              
              <Button
                variant="contained"
                startIcon={<FingerprintIcon />}
                onClick={handleCaptureFingerprint}
                sx={{ mb: 3 }}
              >
                Capturer l'empreinte
              </Button>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Échantillons capturés: {fingerprintSamples.length}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {fingerprintSamples.map(sample => (
                    <Paper key={sample.id} sx={{ p: 1, width: 120, position: 'relative' }}>
                      <FingerprintIcon sx={{ fontSize: 60, color: 'primary.main', display: 'block', mx: 'auto' }} />
                      <Typography variant="caption" display="block" textAlign="center">
                        {new Date(sample.timestamp).toLocaleTimeString()}
                      </Typography>
                      <Button 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteFingerprintSample(sample.id)}
                      >
                        Supprimer
                      </Button>
                    </Paper>
                  ))}
                </Box>
              </Box>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSaveFingerprintSamples}
                disabled={loading || fingerprintSamples.length < 3}
              >
                {loading ? <CircularProgress size={24} /> : 'Enregistrer les empreintes digitales'}
              </Button>
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Génération de QR Code
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Générez un QR code unique pour l'employé qu'il pourra utiliser pour pointer sa présence.
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  QR code enregistré avec succès
                </Alert>
              )}
              
              <Button
                variant="contained"
                startIcon={<QrCodeIcon />}
                onClick={handleGenerateQrCode}
                sx={{ mb: 3 }}
              >
                Générer un QR Code
              </Button>
              
              <Box sx={{ mb: 3 }}>
                {qrCodeValue && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveQrCode}
                    disabled={loading}
                    sx={{ ml: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Enregistrer le QR Code'}
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Face Scanner Dialog */}
      <FaceScanner
        open={openCamera}
        onClose={handleCloseFaceScanner}
        onSuccess={handleFaceCaptureSuccess}
        mode="enroll"
        title="Capture du visage pour l'enregistrement"
      />
      
      {/* Fingerprint Scanner Dialog */}
      <FingerprintScanner
        open={openFingerprint}
        onClose={handleCloseFingerprint}
        onSuccess={handleFingerprintCaptureSuccess}
        mode="enroll"
        title="Capture d'empreinte pour l'enregistrement"
      />
      
      {/* QR Code Dialog */}
      <Dialog
        open={openQrCodeDialog}
        onClose={handleCloseQrCodeDialog}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            QR Code généré pour {employeeName}
          </Typography>
          
          <Box sx={{ my: 3, display: 'flex', justifyContent: 'center' }}>
            {qrCodeValue && (
              <QRCode
                id="qr-code"
                value={qrCodeValue}
                size={200}
                level="H"
                includeMargin={true}
              />
            )}
          </Box>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Ce QR code est unique et lié à l'employé. Il peut être utilisé pour pointer sa présence.
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePrintQrCode}
            >
              Imprimer
            </Button>
            
            <Button
              variant="contained"
              onClick={handleCloseQrCodeDialog}
            >
              Fermer
            </Button>
          </Box>
        </Box>
      </Dialog>
      
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BiometricEnrollment;