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
  Fingerprint as FingerprintIcon, 
  Close as CloseIcon,
  Check as CheckIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';

const FingerprintScanner = ({ 
  open, 
  onClose, 
  onSuccess, 
  mode, 
  employeeId = null,
  title = 'Scanner d\'Empreinte Digitale' 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (open && !scanning) {
      startScan();
    }
  }, [open, scanning]);

  const startScan = () => {
    setScanning(true);
    setLoading(true);
    setError(null);
    
    // Simulate fingerprint scanning process
    setTimeout(() => {
      setLoading(false);
      // For demo purposes only
      console.log('Fingerprint scan complete');
    }, 2000);
  };

  const processFingerprintScan = async () => {
    setProcessing(true);
    setError(null);
    
    try {
      console.log('Processing fingerprint scan...');
      
      // In a real implementation, you would send the fingerprint data to the server
      // Here we simulate the process for demo purposes
      const endpoint = mode === 'checkIn' 
        ? '/api/attendance/fingerprint-check-in' 
        : '/api/attendance/fingerprint-check-out';
      
      console.log(`Simulating request to ${endpoint}`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, create a mock successful response
      const mockEmployee = {
        _id: employeeId || 'mock-employee-1',
        firstName: 'Mohammed',
        lastName: 'Benali',
        position: 'Ingénieur'
      };
      
      console.log('Using mock employee data for demo:', mockEmployee);
      setScanResult({
        success: true,
        employee: mockEmployee
      });
      
      // Notify parent component with mock data
      onSuccess(mockEmployee);
    } catch (err) {
      console.error('Fingerprint scan error:', err);
      setError('Erreur lors de la lecture d\'empreinte digitale');
    } finally {
      setProcessing(false);
      setScanning(false);
    }
  };

  const resetScan = () => {
    setScanResult(null);
    setError(null);
    setScanning(false);
    startScan();
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
              bgcolor: '#f5f5f5'
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <CircularProgress />
                <Typography>
                  Veuillez poser votre doigt sur le capteur d'empreinte...
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <FingerprintIcon sx={{ fontSize: 100, color: scanning ? 'primary.main' : 'text.secondary' }} />
                <Typography variant="body1" align="center">
                  {scanning 
                    ? 'Placez votre doigt sur le capteur d\'empreinte' 
                    : 'Prêt à scanner'}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 3 }}>
        {!scanResult ? (
          <>
            <Button
              startIcon={<RefreshIcon />}
              onClick={resetScan}
              color="secondary"
              disabled={loading}
            >
              Recommencer
            </Button>
            
            <Button
              startIcon={<FingerprintIcon />}
              onClick={processFingerprintScan}
              variant="contained"
              color="primary"
              disabled={loading || processing}
            >
              {processing ? <CircularProgress size={24} /> : 'Valider l\'empreinte'}
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

export default FingerprintScanner; 