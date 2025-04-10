import React from 'react';
import PropTypes from 'prop-types';
import { Chip } from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  HourglassEmpty as PendingIcon,
  QuestionMark as QuestionMarkIcon
} from '@mui/icons-material';

/**
 * Component to display biometric status as a chip
 * 
 * @param {Object} props
 * @param {string} props.status - Status of the biometric data ('not_started', 'in_progress', 'completed', 'validated', 'rejected')
 */
const BiometricStatusChip = ({ status }) => {
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
      icon = <PendingIcon />;
      label = 'En cours';
      break;
    case 'completed':
      color = 'info';
      icon = <PendingIcon />;
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
    default:
      break;
  }

  return (
    <Chip
      icon={icon}
      label={label}
      color={color}
      size="small"
      sx={{ minWidth: '120px' }}
    />
  );
};

BiometricStatusChip.propTypes = {
  status: PropTypes.oneOf([
    'not_started',
    'in_progress',
    'completed',
    'validated',
    'rejected'
  ]).isRequired
};

export default BiometricStatusChip; 