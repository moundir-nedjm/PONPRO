import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  IconButton,
  Tooltip,
  Badge,
  Stack,
  Typography
} from '@mui/material';
import {
  Face as FaceIcon,
  Fingerprint as FingerprintIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  HourglassEmpty as PendingIcon
} from '@mui/icons-material';
import { useBiometrics } from '../../context/BiometricContext';
import BiometricStatusChip from './BiometricStatusChip';
import FaceScanCamera from './FaceScanCamera';
import FingerprintScanDialog from './FingerprintScanDialog';

const getBadgeColor = (status) => {
  switch (status) {
    case 'validated': return 'success';
    case 'rejected': return 'error';
    case 'completed': return 'info';
    case 'in_progress': return 'warning';
    default: return 'default';
  }
};

const getBadgeContent = (status) => {
  switch (status) {
    case 'validated': return <CheckIcon fontSize="small" />;
    case 'rejected': return <CloseIcon fontSize="small" />;
    case 'completed': return <PendingIcon fontSize="small" />;
    case 'in_progress': return <PendingIcon fontSize="small" />;
    default: return null;
  }
};

const BiometricActions = ({ 
  employee, 
  onScanComplete, 
  onValidationRequest,
  canValidate,
  compact = false,
  adminMode = false
}) => {
  const { hasSufficientQuality } = useBiometrics();
  
  // State for face scan dialog
  const [faceScanOpen, setFaceScanOpen] = useState(false);
  
  // State for fingerprint scan dialog
  const [fingerprintScanOpen, setFingerprintScanOpen] = useState(false);
  
  // Get biometric statuses
  const faceStatus = employee?.biometricStatus?.faceRecognition?.status || 'not_started';
  const fingerprintStatus = employee?.biometricStatus?.fingerprint?.status || 'not_started';

  // Handle face scan completion - now handles multi-pose data
  const handleFaceScanComplete = (result) => {
    if (result.success) {
      // For multi-pose face scanning
      onScanComplete(
        employee.id, 
        'faceRecognition', 
        result.quality, 
        result.multiPoseImages
      );
    }
    setFaceScanOpen(false);
  };

  // Handle fingerprint scan completion
  const handleFingerprintScanComplete = (result) => {
    if (result.success) {
      onScanComplete(
        employee.id, 
        'fingerprint', 
        result.quality, 
        result.data
      );
    }
    setFingerprintScanOpen(false);
  };

  // Admin mode - only show validation controls for admins
  if (adminMode) {
    return (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {/* Face recognition validation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <BiometricStatusChip status={faceStatus} size="small" />
          
          {faceStatus === 'completed' && canValidate && (
            <Tooltip title="Valider la reconnaissance faciale">
              <IconButton
                size="small"
                color="primary"
                onClick={() => onValidationRequest(employee, 'faceRecognition')}
              >
                <CheckIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Fingerprint validation */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 2 }}>
          <BiometricStatusChip status={fingerprintStatus} size="small" />
          
          {fingerprintStatus === 'completed' && canValidate && (
            <Tooltip title="Valider l'empreinte digitale">
              <IconButton
                size="small"
                color="primary"
                onClick={() => onValidationRequest(employee, 'fingerprint')}
              >
                <CheckIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    );
  }

  // Render compact version (icon buttons only)
  if (compact) {
    return (
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {/* Face recognition button */}
        <Tooltip title="Scanner le visage (multi-pose)">
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={getBadgeContent(faceStatus)}
            color={getBadgeColor(faceStatus)}
          >
            <IconButton 
              size="small" 
              color="primary"
              onClick={() => setFaceScanOpen(true)}
              disabled={faceStatus === 'validated'}
            >
              <FaceIcon />
            </IconButton>
          </Badge>
        </Tooltip>

        {/* Fingerprint button */}
        <Tooltip title="Scanner l'empreinte digitale">
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={getBadgeContent(fingerprintStatus)}
            color={getBadgeColor(fingerprintStatus)}
          >
            <IconButton 
              size="small" 
              color="primary"
              onClick={() => setFingerprintScanOpen(true)}
              disabled={fingerprintStatus === 'validated'}
            >
              <FingerprintIcon />
            </IconButton>
          </Badge>
        </Tooltip>

        {/* Validation buttons only shown for completed biometrics when user can validate */}
        {canValidate && faceStatus === 'completed' && (
          <Tooltip title="Valider la reconnaissance faciale">
            <IconButton
              size="small"
              color="primary"
              onClick={() => onValidationRequest(employee, 'faceRecognition')}
            >
              <CheckIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {canValidate && fingerprintStatus === 'completed' && (
          <Tooltip title="Valider l'empreinte digitale">
            <IconButton
              size="small"
              color="primary"
              onClick={() => onValidationRequest(employee, 'fingerprint')}
            >
              <CheckIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {/* Face scan dialog */}
        <FaceScanCamera
          open={faceScanOpen}
          onClose={() => setFaceScanOpen(false)}
          onComplete={handleFaceScanComplete}
          employee={employee}
        />

        {/* Fingerprint scan dialog */}
        <FingerprintScanDialog
          open={fingerprintScanOpen}
          onClose={() => setFingerprintScanOpen(false)}
          onComplete={handleFingerprintScanComplete}
          employee={employee}
        />
      </Box>
    );
  }

  // Render full version with status chips
  return (
    <Stack spacing={1}>
      {/* Face recognition row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ minWidth: '120px' }}>
          Visage:
        </Typography>
        <BiometricStatusChip status={faceStatus} />
        
        <Tooltip title="Scanner le visage (multi-pose)">
          <IconButton
            size="small"
            color="primary"
            onClick={() => setFaceScanOpen(true)}
            disabled={faceStatus === 'validated'}
            sx={{ ml: 1 }}
          >
            <FaceIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        {canValidate && faceStatus === 'completed' && (
          <Tooltip title="Valider la reconnaissance faciale">
            <IconButton
              size="small"
              color="primary"
              onClick={() => onValidationRequest(employee, 'faceRecognition')}
            >
              <CheckIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      {/* Fingerprint row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ minWidth: '120px' }}>
          Empreinte:
        </Typography>
        <BiometricStatusChip status={fingerprintStatus} />
        
        <Tooltip title="Scanner l'empreinte digitale">
          <IconButton
            size="small"
            color="primary"
            onClick={() => setFingerprintScanOpen(true)}
            disabled={fingerprintStatus === 'validated'}
            sx={{ ml: 1 }}
          >
            <FingerprintIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        {canValidate && fingerprintStatus === 'completed' && (
          <Tooltip title="Valider l'empreinte digitale">
            <IconButton
              size="small"
              color="primary"
              onClick={() => onValidationRequest(employee, 'fingerprint')}
            >
              <CheckIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Face scan dialog */}
      <FaceScanCamera
        open={faceScanOpen}
        onClose={() => setFaceScanOpen(false)}
        onComplete={handleFaceScanComplete}
        employee={employee}
      />

      {/* Fingerprint scan dialog */}
      <FingerprintScanDialog
        open={fingerprintScanOpen}
        onClose={() => setFingerprintScanOpen(false)}
        onComplete={handleFingerprintScanComplete}
        employee={employee}
      />
    </Stack>
  );
};

BiometricActions.propTypes = {
  employee: PropTypes.object.isRequired,
  onScanComplete: PropTypes.func,
  onValidationRequest: PropTypes.func.isRequired,
  canValidate: PropTypes.bool,
  compact: PropTypes.bool,
  adminMode: PropTypes.bool
};

export default BiometricActions; 