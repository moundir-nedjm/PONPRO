import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper,
  Grid
} from '@mui/material';
import { 
  ErrorOutline as ErrorIcon,
  Home as HomeIcon
} from '@mui/icons-material';

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center', 
          minHeight: '100vh',
          p: 3
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 5, 
            borderRadius: 2, 
            textAlign: 'center',
            border: '1px solid rgba(0, 0, 0, 0.12)'
          }}
        >
          <Grid container spacing={3} alignItems="center" justifyContent="center">
            <Grid item xs={12}>
              <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
              <Typography variant="h3" color="error" gutterBottom>
                404 - Page Non Trouvée
              </Typography>
              <Typography variant="h5" color="textSecondary" gutterBottom>
                La page que vous recherchez n'existe pas ou a été déplacée.
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph sx={{ mt: 2 }}>
                Vérifiez l'URL ou retournez au tableau de bord.
              </Typography>
            </Grid>
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button 
                component={Link} 
                to="/dashboard" 
                variant="contained" 
                color="primary" 
                startIcon={<HomeIcon />}
                size="large"
              >
                Retour au Tableau de Bord
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFound; 