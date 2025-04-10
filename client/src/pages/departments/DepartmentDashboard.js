import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Alert, CircularProgress, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../utils/api';
import DepartmentDetail from './DepartmentDetail';
import { useAuth } from '../../context/AuthContext';

const DepartmentDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [departmentId, setDepartmentId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Make sure we have a chef user with projects
    if (!currentUser) {
      setError("Utilisateur non authentifié. Veuillez vous connecter à nouveau.");
      setLoading(false);
      return;
    }
    
    // Check if user is a chef or admin department
    const isChefOrAdminDept = currentUser.role === 'chef' || 
                            (currentUser.name && currentUser.name.startsWith('Adm '));
    
    if (!isChefOrAdminDept) {
      setError("Vous n'avez pas les permissions nécessaires pour accéder au tableau de bord du département.");
      setLoading(false);
      return;
    }
    
    // Check if user has projects assigned
    if (!currentUser.projects || !Array.isArray(currentUser.projects) || currentUser.projects.length === 0) {
      setError("Aucun département n'est assigné à votre compte. Veuillez contacter l'administrateur.");
      setLoading(false);
      return;
    }

    // If all checks pass, find the department
    findDepartmentId();
  }, [currentUser]);

  const findDepartmentId = async () => {
    try {
      setLoading(true);
      console.log('Current user data:', currentUser);
      
      // Get the department name from the user's projects
      // The project might be stored as an ID, name, or object
      const departmentName = currentUser.projects[0];
      console.log('Looking for department with name/id:', departmentName);
      
      // First try to get all departments and match by ID or name
      try {
        const allDeptResponse = await apiClient.get('/departments');
        console.log('All departments response:', allDeptResponse);
        
        if (allDeptResponse.data && (allDeptResponse.data.success || allDeptResponse.data.data || allDeptResponse.data.departments)) {
          // Handle different API response formats
          const departments = allDeptResponse.data.data || 
                             allDeptResponse.data.departments || 
                             (Array.isArray(allDeptResponse.data) ? allDeptResponse.data : []);
          
          console.log('Departments found:', departments);
          
          // Try to find by exact ID match first (if departmentName is an ID)
          let matchedDept = departments.find(dept => dept._id === departmentName || dept.id === departmentName);
          
          // If no ID match, try by name
          if (!matchedDept) {
            matchedDept = departments.find(dept => 
              dept.name && departmentName && (
                dept.name.toLowerCase() === departmentName.toLowerCase() ||
                dept.name.toLowerCase().includes(departmentName.toLowerCase()) ||
                (typeof departmentName === 'string' && departmentName.toLowerCase().includes(dept.name.toLowerCase()))
              )
            );
          }
          
          if (matchedDept) {
            console.log('Found matching department:', matchedDept);
            setDepartmentId(matchedDept._id || matchedDept.id);
            setError(null);
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching all departments:', err);
        // Continue to other methods rather than failing immediately
      }
      
      // If all departments approach failed, try direct API call with the department name
      if (typeof departmentName === 'string') {
        try {
          const response = await apiClient.get(`/departments?name=${encodeURIComponent(departmentName)}`);
          console.log('Department by name response:', response);
          
          if (response.data && response.data.success && response.data.data && response.data.data.length > 0) {
            setDepartmentId(response.data.data[0]._id);
            setError(null);
            return;
          }
        } catch (nameErr) {
          console.error('Error finding department by name:', nameErr);
          // Continue to other methods
        }
      }
      
      // Try by specific ID lookup if departmentName could be an ID
      if (typeof departmentName === 'string' && /^[a-f0-9]{24}$/i.test(departmentName)) {
        try {
          const idResponse = await apiClient.get(`/departments/${departmentName}`);
          console.log('Department by ID response:', idResponse);
          
          if (idResponse.data && (idResponse.data.success || idResponse.data.department || idResponse.data.data)) {
            const dept = idResponse.data.department || idResponse.data.data;
            if (dept) {
              setDepartmentId(departmentName);
              setError(null);
              return;
            }
          }
        } catch (idErr) {
          console.error('Error finding department by ID:', idErr);
          // Continue to the next method
        }
      }
      
      // If all previous attempts failed, try search endpoint
      if (typeof departmentName === 'string') {
        try {
          const searchResponse = await apiClient.get(`/departments/search?term=${encodeURIComponent(departmentName)}`);
          console.log('Department search response:', searchResponse);
          
          if (searchResponse.data && searchResponse.data.success && searchResponse.data.data && searchResponse.data.data.length > 0) {
            setDepartmentId(searchResponse.data.data[0]._id);
            setError(null);
            return;
          }
        } catch (searchErr) {
          console.error('Error searching for department:', searchErr);
          // This was our last attempt
        }
      }
      
      // If we've tried everything and still couldn't find it
      setError(`Aucun département trouvé pour "${departmentName}". Veuillez contacter l'administrateur pour associer votre compte à un département.`);
      
    } catch (err) {
      console.error('Error in department lookup process:', err);
      setError("Erreur lors de la recherche du département. Vérifiez vos permissions et réessayez.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Chargement du tableau de bord du département...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => findDepartmentId()}
            >
              Réessayer
            </Button>
          }
        >
          {error}
        </Alert>
        
        <Box sx={{ mt: 3, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
          <Typography variant="h6" gutterBottom>
            Impossible d'accéder au tableau de bord du département
          </Typography>
          <Typography variant="body1" paragraph>
            Votre compte utilisateur doit être associé à un département pour accéder à cette fonctionnalité. 
            Si vous êtes Chef de Département ou Administrateur, veuillez vérifier que vous êtes bien associé 
            à un département dans vos paramètres.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pour tout problème d'accès, veuillez contacter l'administrateur.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => findDepartmentId()}
              sx={{ mr: 2 }}
            >
              Réessayer
            </Button>
            <Button 
              variant="outlined"
              onClick={() => navigate('/employee/dashboard')}
            >
              Retour au tableau de bord personnel
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  if (!departmentId) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">
          Aucun département n'a été trouvé pour votre compte. Veuillez contacter l'administrateur.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1" sx={{ fontWeight: 600, mb: 3 }}>
        Tableau de Bord du Département
      </Typography>
      
      <DepartmentDetail departmentId={departmentId} isEmbedded={true} />
    </Container>
  );
};

export default DepartmentDashboard; 