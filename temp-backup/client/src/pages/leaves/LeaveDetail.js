import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  TextField
} from '@mui/material';
import {
  Event as EventIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const LeaveDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/leaves/${id}`);
        setLeave(res.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching leave:', err);
        setError('Failed to load leave details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveData();
  }, [id]);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/leaves/${id}`);
      setDeleteDialogOpen(false);
      navigate('/leaves');
    } catch (err) {
      console.error('Error deleting leave:', err);
      setError('Failed to delete leave request. Please try again later.');
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleApproveClick = () => {
    setApproveDialogOpen(true);
  };

  const handleApproveConfirm = async () => {
    try {
      await axios.put(`/api/leaves/${id}/status`, { status: 'approved' });
      setApproveDialogOpen(false);
      // Refresh leave data
      const res = await axios.get(`/api/leaves/${id}`);
      setLeave(res.data.data);
    } catch (err) {
      console.error('Error approving leave:', err);
      setError('Failed to approve leave request. Please try again later.');
      setApproveDialogOpen(false);
    }
  };

  const handleApproveCancel = () => {
    setApproveDialogOpen(false);
  };

  const handleRejectClick = () => {
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    try {
      await axios.put(`/api/leaves/${id}/status`, { 
        status: 'rejected',
        rejectionReason: rejectReason 
      });
      setRejectDialogOpen(false);
      setRejectReason('');
      // Refresh leave data
      const res = await axios.get(`/api/leaves/${id}`);
      setLeave(res.data.data);
    } catch (err) {
      console.error('Error rejecting leave:', err);
      setError('Failed to reject leave request. Please try again later.');
      setRejectDialogOpen(false);
    }
  };

  const handleRejectCancel = () => {
    setRejectDialogOpen(false);
    setRejectReason('');
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!leave) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Demande de congé introuvable.</Alert>
      </Box>
    );
  }

  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'manager';
  const isOwnLeave = currentUser._id === leave.employee?._id;
  const canEdit = leave.status === 'pending' && isOwnLeave;
  const canDelete = leave.status === 'pending' && (isAdmin || isOwnLeave);
  const canApproveReject = leave.status === 'pending' && isAdmin && !isOwnLeave;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          component={Link}
          to="/leaves"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Retour aux Demandes de Congé
        </Button>
        <Box>
          {canEdit && (
            <Button
              component={Link}
              to={`/leaves/edit/${id}`}
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              sx={{ mr: 1 }}
            >
              Modifier
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
              sx={{ mr: 1 }}
            >
              Supprimer
            </Button>
          )}
          {canApproveReject && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckIcon />}
                onClick={handleApproveClick}
                sx={{ mr: 1 }}
              >
                Approuver
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<CloseIcon />}
                onClick={handleRejectClick}
              >
                Refuser
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <EventIcon />
              </Avatar>
              <Typography variant="h5" component="h1">
                Demande de Congé
              </Typography>
              <Chip
                label={getStatusLabel(leave.status)}
                color={getStatusColor(leave.status)}
                size="small"
                sx={{ ml: 2 }}
              />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Type de Congé
                </Typography>
                <Typography variant="body1" paragraph>
                  {leave.leaveType}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Nombre de Jours
                </Typography>
                <Typography variant="body1" paragraph>
                  {leave.numberOfDays}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Date de Début
                </Typography>
                <Typography variant="body1" paragraph>
                  {new Date(leave.startDate).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Date de Fin
                </Typography>
                <Typography variant="body1" paragraph>
                  {new Date(leave.endDate).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Motif
                </Typography>
                <Typography variant="body1" paragraph>
                  {leave.reason || 'Aucun motif fourni.'}
                </Typography>
              </Grid>
              {leave.status === 'rejected' && leave.rejectionReason && (
                <Grid item xs={12}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Motif du Refus
                  </Typography>
                  <Typography variant="body1" paragraph color="error">
                    {leave.rejectionReason}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Demandé le
                </Typography>
                <Typography variant="body1">
                  {new Date(leave.createdAt).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              avatar={
                <Avatar>
                  <PersonIcon />
                </Avatar>
              }
              title="Informations sur l'Employé"
            />
            <Divider />
            <CardContent>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Nom
              </Typography>
              <Typography variant="body1" paragraph>
                <Link to={`/employees/${leave.employee?._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  {`${leave.employee?.firstName} ${leave.employee?.lastName}`}
                </Link>
              </Typography>
              
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Département
              </Typography>
              <Typography variant="body1" paragraph>
                {leave.employee?.department?.name || 'Non assigné'}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Poste
              </Typography>
              <Typography variant="body1" paragraph>
                {leave.employee?.position || 'Non spécifié'}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" gutterBottom>
                Solde de Congés
              </Typography>
              <Typography variant="body1">
                {leave.employee?.leaveBalance || 0} jours restants
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Supprimer la Demande de Congé</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cette demande de congé ? Cette action ne peut pas être annulée.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Annuler</Button>
          <Button onClick={handleDeleteConfirm} color="error">Supprimer</Button>
        </DialogActions>
      </Dialog>

      {/* Approve Confirmation Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={handleApproveCancel}
      >
        <DialogTitle>Approuver la Demande de Congé</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir approuver cette demande de congé ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleApproveCancel}>Annuler</Button>
          <Button onClick={handleApproveConfirm} color="success">Approuver</Button>
        </DialogActions>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={handleRejectCancel}
      >
        <DialogTitle>Refuser la Demande de Congé</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Veuillez fournir un motif pour le refus de cette demande de congé.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="rejectionReason"
            label="Motif du Refus"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRejectCancel}>Annuler</Button>
          <Button 
            onClick={handleRejectConfirm} 
            color="error" 
            disabled={!rejectReason.trim()}
          >
            Refuser
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveDetail; 