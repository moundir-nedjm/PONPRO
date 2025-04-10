import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Paper,
  CircularProgress
} from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import {
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Help as HelpIcon,
  History as HistoryIcon,
  Download as DownloadIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import apiClient from '../../utils/api';

const DocumentHistory = ({ open, onClose, documentId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentHistory, setDocumentHistory] = useState([]);

  useEffect(() => {
    if (open && documentId) {
      fetchDocumentHistory();
    }
  }, [open, documentId]);

  const fetchDocumentHistory = async () => {
    if (!documentId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get(`/documents/${documentId}/history`);
      
      if (response.data && response.data.success) {
        setDocumentHistory(response.data.data || []);
      } else {
        setError('Erreur lors du chargement de l\'historique');
        setDocumentHistory([]);
      }
    } catch (err) {
      console.error('Error fetching document history:', err);
      setError('Erreur lors du chargement de l\'historique');
      setDocumentHistory([]);
    } finally {
      setLoading(false);
    }
  };
  
  const getActionIcon = (action, status) => {
    switch (action) {
      case 'upload':
        return <UploadIcon />;
      case 'status_change':
        if (status === 'verified') {
          return <CheckCircleIcon />;
        } else if (status === 'rejected') {
          return <CancelIcon />;
        } else {
          return <HelpIcon />;
        }
      case 'edit':
        return <EditIcon />;
      case 'delete':
        return <DeleteIcon />;
      case 'download':
        return <DownloadIcon />;
      default:
        return <HistoryIcon />;
    }
  };
  
  const getActionColor = (action, status) => {
    switch (action) {
      case 'upload':
        return 'primary';
      case 'status_change':
        if (status === 'verified') {
          return 'success';
        } else if (status === 'rejected') {
          return 'error';
        } else {
          return 'warning';
        }
      case 'edit':
        return 'info';
      case 'delete':
        return 'error';
      case 'download':
        return 'secondary';
      default:
        return 'grey';
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getActionText = (item) => {
    switch (item.action) {
      case 'upload':
        return 'Document ajouté';
      case 'status_change':
        if (item.status === 'verified') {
          return 'Document vérifié';
        } else if (item.status === 'rejected') {
          return 'Document rejeté';
        } else {
          return 'Statut changé à En attente';
        }
      case 'edit':
        return 'Document modifié';
      case 'delete':
        return 'Document supprimé';
      case 'download':
        return 'Document téléchargé';
      default:
        return 'Action inconnue';
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HistoryIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Historique du Document</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <InfoIcon color="error" sx={{ fontSize: 40, mb: 2 }} />
            <Typography color="error">{error}</Typography>
          </Box>
        ) : documentHistory.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <InfoIcon color="info" sx={{ fontSize: 40, mb: 2 }} />
            <Typography>Aucun historique disponible pour ce document</Typography>
          </Box>
        ) : (
          <Timeline position="alternate">
            {documentHistory.map((item) => (
              <TimelineItem key={item.id}>
                <TimelineOppositeContent color="text.secondary">
                  {formatDate(item.timestamp)}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color={getActionColor(item.action, item.status)}>
                    {getActionIcon(item.action, item.status)}
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {getActionText(item)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.details}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Par: {item.user}
                    </Typography>
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentHistory; 