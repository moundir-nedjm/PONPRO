import React from 'react';
import { Box, Typography, Breadcrumbs, Link, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';

/**
 * A styled page header component with title, subtitle, and breadcrumbs
 * 
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle
 * @param {Array} props.breadcrumbs - Array of breadcrumb items
 * @param {React.ReactNode} props.icon - Icon to display next to title
 * @param {React.ReactNode} props.actions - Actions to display on the right
 * @param {Object} props.sx - Additional styles
 */
const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  icon,
  actions,
  sx = {},
  ...rest
}) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        mb: 4,
        display: 'flex',
        flexDirection: 'column',
        ...sx
      }}
      {...rest}
    >
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            return isLast ? (
              <Typography 
                key={`breadcrumb-${index}`} 
                color="text.primary"
                variant="body2"
                fontWeight={500}
              >
                {crumb.label}
              </Typography>
            ) : (
              <Link
                key={`breadcrumb-${index}`}
                component={RouterLink}
                to={crumb.path}
                underline="hover"
                color="text.secondary"
                variant="body2"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                {crumb.icon && (
                  <Box component="span" sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
                    {crumb.icon}
                  </Box>
                )}
                {crumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}
      
      {/* Header Content */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {icon && (
            <Box 
              sx={{ 
                mr: 2, 
                color: theme.palette.primary.main,
                display: 'flex',
                alignItems: 'center',
                fontSize: '2rem'
              }}
            >
              {icon}
            </Box>
          )}
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              fontWeight={700}
              color="text.primary"
              sx={{ mb: subtitle ? 0.5 : 0 }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="subtitle1" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        
        {/* Actions */}
        {actions && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader; 