import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const EmployeeList = () => {
  const { currentUser } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deletedEmployeeIds, setDeletedEmployeeIds] = useState([]);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const STORAGE_KEY = 'pointgee_deleted_employees';

  const fetchEmployees = useCallback(async () => {
    try {
      if (refreshCounter === 0) {
        setLoading(true);
      }
      
      const storedDeletedIds = localStorage.getItem(STORAGE_KEY);
      const deletedIds = storedDeletedIds ? JSON.parse(storedDeletedIds) : [];
      
      setDeletedEmployeeIds(deletedIds);
      
      if (refreshCounter === 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const mockData = [
        {
          id: '1',
          firstName: 'Ahmed',
          lastName: 'Benali',
          employeeId: 'EMP001',
          email: 'ahmed.benali@example.com',
          phone: '+213 555 123 456',
          position: 'Développeur Senior',
          department: { name: 'Informatique' },
          hireDate: '2020-05-15',
          active: true
        },
        {
          id: '2',
          firstName: 'Fatima',
          lastName: 'Zahra',
          employeeId: 'EMP002',
          email: 'fatima.zahra@example.com',
          phone: '+213 555 789 012',
          position: 'Responsable RH',
          department: { name: 'Ressources Humaines' },
          hireDate: '2019-03-10',
          active: true
        },
        {
          id: '3',
          firstName: 'Mohammed',
          lastName: 'Kaci',
          employeeId: 'EMP003',
          email: 'mohammed.kaci@example.com',
          phone: '+213 555 345 678',
          position: 'Comptable',
          department: { name: 'Finance' },
          hireDate: '2021-01-20',
          active: true
        },
        {
          id: '4',
          firstName: 'Amina',
          lastName: 'Hadj',
          employeeId: 'EMP004',
          email: 'amina.hadj@example.com',
          phone: '+213 555 901 234',
          position: 'Directrice Marketing',
          department: { name: 'Marketing' },
          hireDate: '2018-11-05',
          active: true
        },
        {
          id: '5',
          firstName: 'Karim',
          lastName: 'Boudiaf',
          employeeId: 'EMP005',
          email: 'karim.boudiaf@example.com',
          phone: '+213 555 567 890',
          position: 'Technicien',
          department: { name: 'Production' },
          hireDate: '2022-02-15',
          active: false
        }
      ];
      
      const filteredMockData = mockData.filter(emp => !deletedIds.includes(emp.id));
      
      console.log('Fetched employees, filtering out deleted IDs:', deletedIds);
      console.log('Employees after filtering:', filteredMockData);
      
      setEmployees(filteredMockData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Erreur lors du chargement des employés');
      setLoading(false);
    }
  }, [refreshCounter]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const idToDelete = employeeToDelete.id;
      
      setEmployees(prevEmployees => 
        prevEmployees.filter(emp => emp.id !== idToDelete)
      );
      
      const updatedDeletedIds = [...deletedEmployeeIds, idToDelete];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDeletedIds));
      
      console.log('Deleting employee with ID:', idToDelete);
      console.log('Updated deleted IDs:', updatedDeletedIds);
      
      setDeletedEmployeeIds(updatedDeletedIds);
      
      setDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError('Erreur lors de la suppression de l\'employé');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  };

  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    
    return (
      fullName.includes(searchTermLower) ||
      employee.employeeId.toLowerCase().includes(searchTermLower) ||
      employee.email.toLowerCase().includes(searchTermLower) ||
      employee.position.toLowerCase().includes(searchTermLower) ||
      employee.department.name.toLowerCase().includes(searchTermLower)
    );
  });

  const paginatedEmployees = filteredEmployees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Gestion des Employés
        </Typography>
        {currentUser.role === 'admin' && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            to="/employees/new"
          >
            Nouvel Employé
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Rechercher un employé..."
            value={searchTerm}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell>Poste</TableCell>
                <TableCell>Département</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.employeeId}</TableCell>
                  <TableCell>
                    {employee.firstName} {employee.lastName}
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.phone}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.department.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={employee.active ? 'Actif' : 'Inactif'}
                      color={employee.active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box className="table-actions">
                      <Tooltip title="Voir">
                        <IconButton
                          component={Link}
                          to={`/employees/${employee.id}`}
                          size="small"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {(currentUser.role === 'admin' || currentUser.role === 'manager') && (
                        <>
                          <Tooltip title="Modifier">
                            <IconButton
                              component={Link}
                              to={`/employees/edit/${employee.id}`}
                              size="small"
                              color="primary"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {currentUser.role === 'admin' && (
                            <Tooltip title="Supprimer">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteClick(employee)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedEmployees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Aucun employé trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredEmployees.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Êtes-vous sûr de vouloir supprimer l'employé{' '}
            <strong>
              {employeeToDelete
                ? `${employeeToDelete.firstName} ${employeeToDelete.lastName}`
                : ''}
            </strong>
            ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Annuler</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeList; 