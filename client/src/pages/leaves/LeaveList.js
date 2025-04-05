import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const LeaveList = () => {
  const { currentUser } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/leaves');
        setLeaves(res.data.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching leaves:', err);
        setError('Failed to load leave requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved':
        return 'Approuvé';
      case 'pending':
        return 'En attente';
      case 'rejected':
        return 'Refusé';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    const matchesSearch = 
      leave.employee?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.employee?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || leave.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Demandes de Congé
        </Typography>
        <Button
          component={Link}
          to="/leaves/new"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          Demander un Congé
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher par employé ou motif..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mr: 2 }}
          />
          <FormControl variant="outlined" sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">Statut</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Statut"
              startAdornment={
                <InputAdornment position="start">
                  <FilterListIcon />
                </InputAdornment>
              }
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="pending">En attente</MenuItem>
              <MenuItem value="approved">Approuvé</MenuItem>
              <MenuItem value="rejected">Refusé</MenuItem>
              <MenuItem value="cancelled">Annulé</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employé</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Du</TableCell>
                  <TableCell>Au</TableCell>
                  <TableCell>Jours</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLeaves.length > 0 ? (
                  filteredLeaves.map((leave) => (
                    <TableRow key={leave._id}>
                      <TableCell>
                        <Link to={`/employees/${leave.employee?._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <Typography variant="body1" fontWeight="medium">
                            {`${leave.employee?.firstName} ${leave.employee?.lastName}`}
                          </Typography>
                        </Link>
                      </TableCell>
                      <TableCell>{leave.leaveType}</TableCell>
                      <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>{leave.numberOfDays}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={getStatusLabel(leave.status)}
                          color={getStatusColor(leave.status)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          component={Link}
                          to={`/leaves/${leave._id}`}
                          color="primary"
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        {(leave.status === 'pending' && 
                          (currentUser.role === 'admin' || currentUser._id === leave.employee?._id)) && (
                          <IconButton
                            component={Link}
                            to={`/leaves/edit/${leave._id}`}
                            color="primary"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Aucune demande de congé ne correspond à vos critères de recherche.' 
                        : 'Aucune demande de congé trouvée.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default LeaveList; 