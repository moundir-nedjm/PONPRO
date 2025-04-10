import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  CircularProgress
} from '@mui/material';
import {
  Face as FaceIcon,
  Fingerprint as FingerprintIcon,
  CheckCircle as CheckIcon,
  Save as SaveIcon
} from '@mui/icons-material';

/**
 * A reusable dialog component for scanning biometric data
 * Supports both face recognition and fingerprint scanning
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to call when dialog is closed
 * @param {string} props.scanType - Type of scan ('faceRecognition' or 'fingerprint')
 * @param {Object} props.employee - Employee data for the scan
 * @param {Function} props.onScan - Function to call to initiate scanning
 * @param {Function} props.onSave - Function to call to save scan results
 * @param {boolean} props.scanning - Whether scanning is in progress
 * @param {Object} props.scanResult - Result of the scan operation
 */
const BiometricScanDialog = ({
  open,
  onClose,
  scanType,
  employee,
  onScan,
  onSave,
  scanning = false,
  scanResult = null
}) => {
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    onSave(notes);
    setNotes('');
  };

  const handleClose = () => {
    setNotes('');
    onClose();
  };

  const getTitle = () => {
    return scanType === 'faceRecognition' 
      ? 'Scanner le Visage'
      : 'Scanner l\'Empreinte';
  };

  const getIcon = () => {
    return scanType === 'faceRecognition' 
      ? <FaceIcon sx={{ fontSize: 80, color: 'text.secondary' }} />
      : <FingerprintIcon sx={{ fontSize: 80, color: 'text.secondary' }} />;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {getTitle()}
      </DialogTitle>
      <DialogContent>
        {employee && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">
              {employee.firstName} {employee.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {employee.employeeId}
            </Typography>
          </Box>
        )}

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          bgcolor: 'action.hover',
          height: 300,
          borderRadius: 1,
          mb: 2
        }}>
          {scanning ? (
            <CircularProgress />
          ) : scanResult ? (
            <Box sx={{ textAlign: 'center' }}>
              <CheckIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" color="success.main">
                Numérisation réussie
              </Typography>
              <Typography variant="body2">
                Qualité: {(scanResult.quality * 100).toFixed(0)}%
              </Typography>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              {getIcon()}
              <Typography variant="body1" sx={{ mt: 2 }}>
                Cliquez sur le bouton ci-dessous pour commencer la numérisation
              </Typography>
            </Box>
          )}
        </Box>

        {scanResult && (
          <TextField
            label="Notes (facultatif)"
            variant="outlined"
            fullWidth
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Annuler</Button>
        {!scanResult ? (
          <Button 
            onClick={onScan} 
            variant="contained" 
            color="primary"
            disabled={scanning}
            startIcon={scanning ? <CircularProgress size={20} /> : scanType === 'faceRecognition' ? <FaceIcon /> : <FingerprintIcon />}
          >
            {scanning ? 'Numérisation...' : 'Numériser'}
          </Button>
        ) : (
          <Button 
            onClick={handleSave} 
            variant="contained" 
            color="success"
            startIcon={<SaveIcon />}
          >
            Enregistrer
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BiometricScanDialog; 