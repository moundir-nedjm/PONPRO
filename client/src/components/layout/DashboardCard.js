import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardActions, 
  Typography, 
  Box, 
  IconButton, 
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

/**
 * A styled card component for dashboard and other sections
 * 
 * @param {Object} props
 * @param {string} props.title - The card title
 * @param {React.ReactNode} props.icon - Icon to display in the header
 * @param {React.ReactNode} props.action - Custom action component for the header
 * @param {React.ReactNode} props.children - Card content
 * @param {React.ReactNode} props.footer - Footer content
 * @param {string} props.color - Primary color accent (primary, secondary, success, error, warning, info)
 * @param {boolean} props.elevation - Whether to show card elevation
 * @param {Object} props.sx - Additional styles
 */
const DashboardCard = ({ 
  title, 
  icon, 
  action, 
  children, 
  footer,
  color = 'primary',
  elevation = true,
  sx = {},
  ...rest
}) => {
  const theme = useTheme();
  
  // Get color from theme based on the color prop
  const getColor = () => {
    if (!color) return theme.palette.primary.main;
    return theme.palette[color]?.main || theme.palette.primary.main;
  };
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: elevation ? theme.shadows[3] : 'none',
        border: elevation ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.7)}`,
        ...sx
      }}
      {...rest}
    >
      {/* Colored accent at the top of the card */}
      {color && (
        <Box 
          sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: getColor(),
          }} 
        />
      )}
      
      {title && (
        <CardHeader
          title={
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1.125rem' }}>
              {title}
            </Typography>
          }
          avatar={icon && (
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: getColor(),
              }}
            >
              {icon}
            </Box>
          )}
          action={action || (
            <IconButton aria-label="settings" size="small">
              <MoreVertIcon />
            </IconButton>
          )}
          sx={{ 
            pb: 1,
            pt: 2,
            px: 3,
          }}
        />
      )}
      
      <CardContent 
        sx={{ 
          flexGrow: 1,
          pt: title ? 0 : 2,
          px: 3,
          pb: footer ? 1 : 3,
        }}
      >
        {children}
      </CardContent>
      
      {footer && (
        <>
          <Divider />
          <CardActions sx={{ px: 3, py: 1.5 }}>
            {footer}
          </CardActions>
        </>
      )}
    </Card>
  );
};

export default DashboardCard; 