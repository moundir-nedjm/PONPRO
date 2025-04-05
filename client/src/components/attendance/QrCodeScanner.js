import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  CircularProgress, 
  Paper, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Alert,
  IconButton
} from '@mui/material';
import { 
  QrCodeScanner as QrCodeIcon, 
  Close as CloseIcon,
  Check as CheckIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';

const QrCodeScanner = ({ 
  open, 
  onClose, 
  onSuccess, 
  mode, 
  title = 'Scanner de QR Code' 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState('');

  useEffect(() => {
    if (open) {
      startScan();
    } else {
      resetScan();
    }
  }, [open]);

  const startScan = () => {
    setScanning(true);
    setLoading(true);
    setError(null);
    
    // Simulate QR code scanning process
    setTimeout(() => {
      setLoading(false);
      // For demo purposes, generate a mock employee QR code
      const mockEmployeeId = 'emp_' + Math.floor(Math.random() * 1000);
      setQrCodeValue(mockEmployeeId);
      console.log('QR code scan complete with value:', mockEmployeeId);
    }, 2000);
  };

  const processQrCode = async () => {
    if (!qrCodeValue) return;
    
    setProcessing(true);
    setError(null);
    
    try {
      console.log('Processing QR code scan:', qrCodeValue);
      
      // In a real implementation, you would send the QR code value to the server
      // Here we simulate the process for demo purposes
      const endpoint = mode === 'checkIn' 
        ? '/api/attendance/qrcode-check-in' 
        : '/api/attendance/qrcode-check-out';
      
      console.log(`Simulating request to ${endpoint}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, create a mock successful response
      const mockEmployee = {
        _id: qrCodeValue,
        firstName: 'Ali',
        lastName: 'Benali',
        position: 'Technicien'
      };
      
      console.log('Using mock employee data for demo:', mockEmployee);
      setScanResult({
        success: true,
        employee: mockEmployee
      });
      
      // Notify parent component with mock data
      onSuccess(mockEmployee);
    } catch (err) {
      console.error('QR code scan error:', err);
      setError('Erreur lors de la lecture du QR code');
    } finally {
      setProcessing(false);
      setScanning(false);
    }
  };

  const resetScan = () => {
    setQrCodeValue('');
    setScanResult(null);
    setError(null);
    setScanning(false);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {scanResult && scanResult.success && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              {mode === 'checkIn' 
                ? 'Pointage d\'entrée réussi !' 
                : 'Pointage de sortie réussi !'}
              <Typography variant="body2">
                Employé: {scanResult.employee.firstName} {scanResult.employee.lastName}
              </Typography>
            </Alert>
          )}
          
          <Paper 
            elevation={3} 
            sx={{ 
              width: '100%', 
              height: 300,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: '#f5f5f5',
              position: 'relative'
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <CircularProgress />
                <Typography>
                  Scannez le QR code de l'employé...
                </Typography>
              </Box>
            ) : qrCodeValue ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <QrCodeIcon sx={{ fontSize: 100, color: 'success.main' }} />
                <Typography variant="body1" align="center">
                  QR Code détecté!
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary">
                  ID: {qrCodeValue}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <QrCodeIcon sx={{ fontSize: 100, color: scanning ? 'primary.main' : 'text.secondary' }} />
                <Typography variant="body1" align="center">
                  {scanning 
                    ? 'Placez le QR code devant la caméra' 
                    : 'Prêt à scanner'}
                </Typography>
                <Typography variant="body2" align="center" color="text.secondary">
                  Assurez-vous que le QR code est bien visible et éclairé
                </Typography>
              </Box>
            )}
            
            {scanning && (
              <Box 
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  border: '2px solid #1976d2',
                  borderRadius: 1,
                  pointerEvents: 'none',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent 0%, #1976d2 50%, transparent 100%)',
                    animation: 'scanLine 2s linear infinite'
                  },
                  '@keyframes scanLine': {
                    '0%': {
                      transform: 'translateY(-50px)'
                    },
                    '50%': {
                      transform: 'translateY(50px)'
                    },
                    '100%': {
                      transform: 'translateY(-50px)'
                    }
                  }
                }}
              />
            )}
          </Paper>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 3 }}>
        {!scanResult ? (
          <>
            <Button
              startIcon={<RefreshIcon />}
              onClick={startScan}
              color="secondary"
              disabled={loading || processing}
            >
              Recommencer
            </Button>
            
            <Button
              startIcon={<QrCodeIcon />}
              onClick={processQrCode}
              variant="contained"
              color="primary"
              disabled={loading || processing || !qrCodeValue}
            >
              {processing ? <CircularProgress size={24} /> : 'Valider le scan'}
            </Button>
          </>
        ) : (
          <Button
            startIcon={<CheckIcon />}
            onClick={onClose}
            variant="contained"
            color="success"
            fullWidth
          >
            Terminer
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default QrCodeScanner; 