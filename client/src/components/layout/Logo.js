import React from 'react';
import { Box, Typography, useTheme, SvgIcon } from '@mui/material';
import { alpha } from '@mui/material/styles';

// Custom POINPRO logo as an SVG icon
const PoinproLogoIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 36 36">
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
        <stop offset="100%" stopColor="currentColor" stopOpacity="0.7" />
      </linearGradient>
    </defs>
    <path 
      d="M18 2C9.163 2 2 9.163 2 18s7.163 16 16 16 16-7.163 16-16S26.837 2 18 2z" 
      fill="url(#logoGradient)" 
    />
    <path 
      d="M18 5c-7.18 0-13 5.82-13 13s5.82 13 13 13 13-5.82 13-13S25.18 5 18 5zm0 23c-5.523 0-10-4.477-10-10s4.477-10 10-10 10 4.477 10 10-4.477 10-10 10z" 
      fill="currentColor" 
      opacity="0.9"
    />
    <path 
      d="M18 11v7l5 5" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      fill="none"
    />
    <circle 
      cx="18" 
      cy="18" 
      r="2" 
      fill="currentColor"
    />
  </SvgIcon>
);

const Logo = ({ variant = 'default', showTagline = true }) => {
  const theme = useTheme();
  
  // Styles for different logo variants
  const styles = {
    default: {
      container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
      logoContainer: {
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
      },
      logoIcon: {
        color: theme.palette.common.white,
        fontSize: 36,
        marginRight: 1.5,
        filter: `drop-shadow(0 0 3px ${theme.palette.primary.dark})`,
      },
      logoText: {
        fontWeight: 800,
        letterSpacing: '1px',
        fontSize: '1.6rem',
        color: theme.palette.common.white,
        textShadow: `0 1px 2px ${theme.palette.primary.dark}`,
        fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
      },
      logoHighlight: {
        color: theme.palette.secondary.light,
        fontWeight: 800,
      },
      taglineContainer: {
        display: 'flex',
        flexDirection: 'column',
        ml: 0.5,
      },
      companyName: {
        fontSize: '0.7rem',
        fontWeight: 500,
        letterSpacing: '0.5px',
        color: theme.palette.grey[200],
        lineHeight: 1,
        mb: 0.3,
      },
      tagline: {
        fontSize: '0.65rem',
        fontWeight: 400,
        color: theme.palette.grey[300],
        letterSpacing: '0.3px',
        lineHeight: 1,
      },
    },
    sidebar: {
      container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      },
      logoContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 1,
      },
      logoIcon: {
        color: theme.palette.primary.main,
        fontSize: 34,
        marginRight: 0.8,
        filter: `drop-shadow(0 0 3px ${alpha(theme.palette.primary.main, 0.3)})`,
      },
      logoText: {
        fontWeight: 800,
        letterSpacing: '1px',
        fontSize: '1.4rem',
        color: theme.palette.primary.dark,
        background: `-webkit-linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main} 70%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
      },
      logoHighlight: {
        background: `-webkit-linear-gradient(45deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main} 70%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 800,
      },
      companyName: {
        fontSize: '0.7rem',
        fontWeight: 500,
        letterSpacing: '0.5px',
        color: theme.palette.text.secondary,
        textAlign: 'center',
        mb: 0.5,
      },
      tagline: {
        fontSize: '0.65rem',
        fontWeight: 400,
        color: theme.palette.text.secondary,
        textAlign: 'center',
        letterSpacing: '0.3px',
      },
    },
    // Add small variant for compatibility
    small: {
      container: {
        display: 'flex',
        alignItems: 'center',
      },
      logoContainer: {
        display: 'flex',
        alignItems: 'center',
      },
      logoIcon: {
        color: theme.palette.primary.main,
        fontSize: 28,
        marginRight: 1,
      },
      logoText: {
        fontWeight: 800,
        letterSpacing: '1px',
        fontSize: '1.2rem',
        color: theme.palette.primary.main,
        fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
      },
      logoHighlight: {
        color: theme.palette.secondary.main,
        fontWeight: 800,
      },
      taglineContainer: {
        display: 'none',
      },
      companyName: {
        display: 'none',
      },
      tagline: {
        display: 'none',
      },
    },
  };
  
  // Use default variant if the specified variant doesn't exist
  const currentStyle = styles[variant] || styles.default;
  
  return (
    <Box sx={currentStyle.container}>
      <Box sx={currentStyle.logoContainer}>
        <PoinproLogoIcon sx={currentStyle.logoIcon} />
        <Typography variant="h6" sx={currentStyle.logoText}>
          POIN<Box component="span" sx={currentStyle.logoHighlight}>PRO</Box>
        </Typography>
      </Box>
      
      {showTagline && variant === 'default' && (
        <Box sx={currentStyle.taglineContainer}>
          <Typography variant="caption" sx={currentStyle.companyName}>
            EURL NEDJM FROID
          </Typography>
          <Typography variant="caption" sx={currentStyle.tagline}>
            Système de pointage avancé
          </Typography>
        </Box>
      )}
      
      {showTagline && variant === 'sidebar' && (
        <>
          <Typography variant="caption" sx={currentStyle.companyName}>
            EURL NEDJM FROID
          </Typography>
          <Typography variant="caption" sx={currentStyle.tagline}>
            Système de pointage avancé
          </Typography>
        </>
      )}
    </Box>
  );
};

export { PoinproLogoIcon };
export default Logo; 