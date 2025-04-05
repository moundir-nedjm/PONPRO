import React from 'react';
import { Button, IconButton, Tooltip, useTheme, alpha } from '@mui/material';

/**
 * A styled action button component with icon support
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {string} props.label - Button label
 * @param {string} props.tooltip - Tooltip text
 * @param {string} props.color - Button color (primary, secondary, success, error, warning, info)
 * @param {string} props.variant - Button variant (contained, outlined, text)
 * @param {string} props.size - Button size (small, medium, large)
 * @param {boolean} props.iconOnly - Whether to show only the icon
 * @param {function} props.onClick - Click handler
 * @param {Object} props.sx - Additional styles
 */
const ActionButton = ({
  icon,
  label,
  tooltip,
  color = 'primary',
  variant = 'contained',
  size = 'medium',
  iconOnly = false,
  onClick,
  sx = {},
  ...rest
}) => {
  const theme = useTheme();
  
  // Determine button content based on iconOnly prop
  const buttonContent = iconOnly ? (
    <Tooltip title={tooltip || label} arrow>
      <IconButton
        color={color}
        size={size}
        onClick={onClick}
        sx={{
          backgroundColor: variant === 'contained' ? theme.palette[color].main : 'transparent',
          color: variant === 'contained' ? theme.palette[color].contrastText : theme.palette[color].main,
          border: variant === 'outlined' ? `1.5px solid ${alpha(theme.palette[color].main, 0.5)}` : 'none',
          '&:hover': {
            backgroundColor: variant === 'contained' 
              ? theme.palette[color].dark 
              : variant === 'outlined'
                ? alpha(theme.palette[color].main, 0.08)
                : alpha(theme.palette[color].main, 0.05),
            border: variant === 'outlined' ? `1.5px solid ${theme.palette[color].main}` : 'none',
          },
          ...sx
        }}
        {...rest}
      >
        {icon}
      </IconButton>
    </Tooltip>
  ) : (
    <Button
      variant={variant}
      color={color}
      size={size}
      startIcon={icon}
      onClick={onClick}
      sx={{
        fontWeight: 600,
        borderRadius: '8px',
        textTransform: 'none',
        boxShadow: variant === 'contained' ? theme.shadows[2] : 'none',
        '&:hover': {
          boxShadow: variant === 'contained' ? theme.shadows[4] : 'none',
        },
        ...sx
      }}
      {...rest}
    >
      {label}
    </Button>
  );
  
  // Wrap with tooltip if provided and not iconOnly (iconOnly already has tooltip)
  return tooltip && !iconOnly ? (
    <Tooltip title={tooltip} arrow>
      {buttonContent}
    </Tooltip>
  ) : (
    buttonContent
  );
};

export default ActionButton; 