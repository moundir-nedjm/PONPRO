import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import axios from 'axios';

const EmployeeSettings = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/employees');
      
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setEmployees(res.data.data);
        setFilteredEmployees(res.data.data);
      } else if (Array.isArray(res.data)) {
        setEmployees(res.data);
        setFilteredEmployees(res.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    
    if (value === '') {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(
        employee => 
          employee.firstName.toLowerCase().includes(value) ||
          employee.lastName.toLowerCase().includes(value) ||
          employee.employeeId.toLowerCase().includes(value) ||
          employee.department.name.toLowerCase().includes(value) ||
          employee.position.toLowerCase().includes(value)
      );
      setFilteredEmployees(filtered);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestion des Employés
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Sélectionnez un employé pour voir ou modifier ses détails
        </Typography>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher un employé..."
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <List>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <React.Fragment key={employee.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1">
                          {employee.firstName} {employee.lastName}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {employee.position}
                          </Typography>
                          {" — "}
                          <Typography component="span" variant="body2">
                            {employee.department.name} • {employee.employeeId}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        size="small"
                        label={employee.active ? 'Actif' : 'Inactif'}
                        color={employee.active ? 'success' : 'default'}
                        sx={{ mr: 1 }}
                      />
                      <IconButton
                        component={Link}
                        to={`/employees/${employee.id}`}
                        color="primary"
                        edge="end"
                        aria-label="voir"
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        component={Link}
                        to={`/employees/edit/${employee.id}`}
                        color="secondary"
                        edge="end"
                        aria-label="modifier"
                        sx={{ ml: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))
            ) : (
              <Alert severity="info">
                Aucun employé trouvé correspondant à votre recherche.
              </Alert>
            )}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default EmployeeSettings; 