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
  LockOutlined as LockIcon,
  Home as HomeIcon
} from '@mui/icons-material';

const Unauthorized = () => {
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
              <LockIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
              <Typography variant="h3" color="error" gutterBottom>
                403 - Accès Refusé
              </Typography>
              <Typography variant="h5" color="textSecondary" gutterBottom>
                Vous n'avez pas les autorisations nécessaires pour accéder à cette page.
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph sx={{ mt: 2 }}>
                Si vous pensez qu'il s'agit d'une erreur, veuillez contacter votre administrateur.
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

export default Unauthorized; 