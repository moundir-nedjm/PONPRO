import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Paper
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
  Download as DownloadIcon
} from '@mui/icons-material';

const DocumentHistory = ({ open, onClose, documentId, history = [] }) => {
  // This would normally fetch history from an API based on documentId
  // For now, we'll use mock data if no history is provided
  const mockHistory = [
    {
      id: '1',
      documentId: documentId,
      action: 'upload',
      status: 'pending',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
      user: 'John Doe',
      details: 'Document ajouté au système'
    },
    {
      id: '2',
      documentId: documentId,
      action: 'status_change',
      status: 'verified',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
      user: 'Admin User',
      details: 'Document vérifié par l\'administrateur'
    },
    {
      id: '3',
      documentId: documentId,
      action: 'download',
      status: 'verified',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      user: 'Jane Smith',
      details: 'Document téléchargé par un utilisateur'
    }
  ];

  const documentHistory = history.length > 0 ? history : mockHistory;
  
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
      </DialogContent>
    </Dialog>
  );
};

export default DocumentHistory; 