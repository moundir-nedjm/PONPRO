import React from 'react';
import { Chip } from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CloseIcon,
  HourglassEmpty as PendingIcon,
  QuestionMark as QuestionMarkIcon,
  Refresh as RefreshIcon,
  HowToReg as ValidateIcon
} from '@mui/icons-material';

/**
 * A reusable component that displays the status of biometric enrollment
 * for employees with color-coding and icons for visual clarity.
 *
 * @param {Object} props - Component props
 * @param {string} props.status - The status of the biometric enrollment
 * @param {string} props.size - Size of the chip (small or medium)
 * @param {Object} props.sx - Additional styles to apply to the chip
 */
const BiometricStatusChip = ({ status = 'not_started', size = 'small', sx = {} }) => {
  let color = 'default';
  let icon = <QuestionMarkIcon />;
  let label = 'Non démarré';

  switch (status) {
    case 'not_started':
      color = 'default';
      icon = <QuestionMarkIcon />;
      label = 'Non démarré';
      break;
    case 'in_progress':
      color = 'warning';
      icon = <RefreshIcon />;
      label = 'En cours';
      break;
    case 'completed':
      color = 'info';
      icon = <ValidateIcon />;
      label = 'En attente';
      break;
    case 'validated':
      color = 'success';
      icon = <CheckIcon />;
      label = 'Validé';
      break;
    case 'rejected':
      color = 'error';
      icon = <CloseIcon />;
      label = 'Rejeté';
      break;
    case 'pending_validation':
      color = 'primary';
      icon = <PendingIcon />;
      label = 'En attente';
      break;
    default:
      // Default to not_started for undefined or unknown status
      color = 'default';
      icon = <QuestionMarkIcon />;
      label = 'Non démarré';
      break;
  }

  return (
    <Chip
      icon={icon}
      label={label}
      color={color}
      size={size}
      sx={{ minWidth: '120px', ...sx }}
    />
  );
};

export default BiometricStatusChip; 