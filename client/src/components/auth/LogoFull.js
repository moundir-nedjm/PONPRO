import React from 'react';
import { Box, Typography, useTheme, Paper } from '@mui/material';
import { AccessTime as AccessTimeIcon } from '@mui/icons-material';

const LogoFull = () => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 4,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontSize: '0.9rem',
          fontWeight: 500,
          letterSpacing: '1px',
          color: theme.palette.text.secondary,
          textAlign: 'center',
          mb: 0.5,
        }}
      >
        EURL NEDJM FROID
      </Typography>
      
      <Paper
        elevation={4}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          mb: 2,
          width: 200,
          height: 200,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
          }}
        />
        
        <AccessTimeIcon
          sx={{
            fontSize: 80,
            color: theme.palette.common.white,
            mb: 2,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
          }}
        />
        
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            letterSpacing: '2px',
            color: theme.palette.common.white,
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
        >
          POINTPRO
        </Typography>
      </Paper>
      
      <Typography
        variant="body2"
        sx={{
          fontSize: '1rem',
          fontWeight: 500,
          color: theme.palette.text.primary,
          textAlign: 'center',
          letterSpacing: '0.5px',
        }}
      >
        Système de pointage
      </Typography>
    </Box>
  );
};

export default LogoFull; 