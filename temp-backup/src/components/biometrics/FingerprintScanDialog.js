import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  Stack,
  useTheme,
  LinearProgress
} from '@mui/material';
import {
  Fingerprint as FingerprintIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  Replay as RetryIcon,
  TouchApp as TouchIcon
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

/**
 * Fingerprint scanning component
 * Provides a guided user interface for capturing fingerprint biometric data
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to call when dialog is closed
 * @param {Function} props.onComplete - Function to call when fingerprint is captured
 * @param {Object} props.employee - The employee whose fingerprint is being scanned
 */
const FingerprintScanDialog = ({ open, onClose, onComplete, employee }) => {
  const theme = useTheme();
  const [scanStatus, setScanStatus] = useState('waiting'); // waiting, scanning, success, error
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [fingerprintData, setFingerprintData] = useState(null);
  
  // Start scanning animation when component opens
  useEffect(() => {
    if (open && scanStatus === 'waiting') {
      // Auto-start scanning after a brief delay
      const timer = setTimeout(() => {
        startScan();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [open, scanStatus]);
  
  // Handle progress updates during scanning
  useEffect(() => {
    let timer;
    if (scanStatus === 'scanning') {
      timer = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          if (newProgress >= 100) {
            clearInterval(timer);
            handleScanComplete();
            return 100;
          }
          return newProgress;
        });
      }, 200);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [scanStatus]);
  
  // Start the scan process
  const startScan = () => {
    setScanStatus('scanning');
    setProgress(0);
  };
  
  // Handle scan completion
  const handleScanComplete = () => {
    // Calculate random quality score between 0.75 and 0.98
    const randomQuality = 0.75 + Math.random() * 0.23;
    setQuality(randomQuality);
    
    // Generate mock fingerprint data
    setFingerprintData('fingerprint-template-data');
    
    // Update status to success
    setScanStatus('success');
  };
  
  // Handle successful capture
  const handleConfirmCapture = () => {
    if (fingerprintData && onComplete) {
      onComplete({
        success: true,
        data: fingerprintData,
        quality: quality
      });
    }
    handleClose();
  };
  
  // Reset the scanner for a new capture
  const handleRetry = () => {
    setFingerprintData(null);
    setScanStatus('waiting');
    setProgress(0);
    startScan();
  };
  
  // Close the dialog
  const handleClose = () => {
    onClose();
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: theme.palette.primary.main,
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FingerprintIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Scanner l'Empreinte Digitale
            {employee && ` - ${employee.firstName} ${employee.lastName}`}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} color="inherit" size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, position: 'relative' }}>
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}>
          {/* Fingerprint Scanner Visualization */}
          <Paper 
            elevation={4} 
            sx={{ 
              width: 200,
              height: 260,
              borderRadius: 2,
              mb: 3,
              overflow: 'hidden',
              position: 'relative',
              bgcolor: scanStatus === 'success' 
                ? alpha(theme.palette.success.light, 0.2)
                : theme.palette.grey[900]
            }}
          >
            {/* Scan animation */}
            {scanStatus === 'scanning' && (
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                backgroundImage: `linear-gradient(90deg, 
                  ${theme.palette.primary.main}, 
                  ${theme.palette.secondary.main}, 
                  ${theme.palette.primary.main})`,
                backgroundSize: '200% 100%',
                animation: 'scanAnimation 2s infinite',
                transform: `translateY(${Math.floor(progress)}%)`,
                transition: 'transform 0.2s ease-in-out',
                '@keyframes scanAnimation': {
                  '0%': {
                    backgroundPosition: '0% 0%',
                  },
                  '100%': {
                    backgroundPosition: '-200% 0%',
                  },
                },
              }}/>
            )}
            
            {/* Fingerprint Icon */}
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: scanStatus === 'success' ? 1 : 0.5,
              color: scanStatus === 'success' ? theme.palette.success.main : theme.palette.common.white,
              transition: 'all 0.3s ease'
            }}>
              {scanStatus === 'success' ? (
                <CheckIcon sx={{ fontSize: 80 }} />
              ) : (
                <FingerprintIcon sx={{ fontSize: 80 }} />
              )}
            </Box>
            
            {/* Success overlay */}
            {scanStatus === 'success' && (
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                p: 1,
                bgcolor: alpha(theme.palette.success.main, 0.8),
                color: 'white',
                textAlign: 'center'
              }}>
                <Typography variant="body2" fontWeight="medium">
                  Empreinte capturée!
                </Typography>
              </Box>
            )}
          </Paper>
          
          {/* Instructions */}
          {scanStatus === 'waiting' && (
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
              Préparez-vous à scanner l'empreinte
            </Typography>
          )}
          
          {scanStatus === 'scanning' && (
            <>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                Placez votre doigt sur le scanner
              </Typography>
              <Box sx={{ width: '100%', mb: 2 }}>
                <LinearProgress variant="determinate" value={progress} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Scan en cours: {Math.floor(progress)}%
              </Typography>
            </>
          )}
          
          {scanStatus === 'success' && (
            <Stack spacing={1} alignItems="center">
              <Typography variant="h6" color="success.main" sx={{ mb: 1 }}>
                Scan Réussi!
              </Typography>
              <Paper sx={{ p: 1, bgcolor: theme.palette.success.light, color: 'white', borderRadius: 2 }}>
                <Typography variant="body2">
                  Qualité: {(quality * 100).toFixed(0)}%
                </Typography>
              </Paper>
            </Stack>
          )}
          
          {scanStatus === 'error' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage || 'Une erreur est survenue lors du scan.'}
            </Alert>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, bgcolor: theme.palette.grey[100] }}>
        {scanStatus === 'success' ? (
          <>
            <Button 
              onClick={handleRetry} 
              startIcon={<RetryIcon />}
              color="secondary"
            >
              Recommencer
            </Button>
            <Button 
              onClick={handleConfirmCapture} 
              variant="contained" 
              color="success"
              startIcon={<CheckIcon />}
            >
              Confirmer
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClose}>Annuler</Button>
            <Button 
              onClick={startScan}
              variant="contained" 
              color="primary"
              disabled={scanStatus === 'scanning'}
              startIcon={scanStatus === 'scanning' ? <CircularProgress size={20} /> : <TouchIcon />}
            >
              {scanStatus === 'scanning' ? 'Scan en cours...' : 'Scanner'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FingerprintScanDialog; 