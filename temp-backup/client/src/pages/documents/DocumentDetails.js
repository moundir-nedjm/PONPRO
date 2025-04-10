import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  Divider,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  AccountCircle as UserIcon,
  Folder as FolderIcon,
  History as HistoryIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Help as HelpIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';

const DocumentDetails = ({ 
  open, 
  onClose, 
  document, 
  onDelete, 
  onDownload, 
  onStatusChange,
  currentUserRole,
  canModify = false
}) => {
  const [loading, setLoading] = useState(false);
  
  if (!document) return null;
  
  const getDocumentIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon fontSize="large" color="primary" />;
    } else if (mimeType === 'application/pdf') {
      return <PdfIcon fontSize="large" color="primary" />;
    } else {
      return <FileIcon fontSize="large" color="primary" />;
    }
  };
  
  const getStatusChip = (status) => {
    switch (status) {
      case 'verified':
        return <Chip label="Vérifié" color="success" icon={<CheckCircleIcon />} />;
      case 'pending':
        return <Chip label="En attente" color="warning" icon={<HelpIcon />} />;
      case 'rejected':
        return <Chip label="Rejeté" color="error" icon={<CancelIcon />} />;
      default:
        return <Chip label="Inconnu" icon={<HelpIcon />} />;
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
  
  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    try {
      const documentId = document._id || document.id;
      await onStatusChange(documentId, newStatus);
    } catch (error) {
      console.error('Error changing status:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const isAdmin = currentUserRole === 'admin';
  const isChef = currentUserRole === 'chef';
  
  // Calculate if status can be changed by current user
  const canChangeStatus = (isAdmin || (isChef && !document.userId === currentUserRole)) && 
                         document.status !== 'verified';
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Détails du Document</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={1} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {getDocumentIcon(document.mimeType)}
                <Box sx={{ ml: 2 }}>
                  <Typography variant="h6">{document.name}</Typography>
                  <Box sx={{ mt: 1 }}>
                    {getStatusChip(document.status)}
                  </Box>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Description
              </Typography>
              <Typography variant="body2" paragraph>
                {document.description || "Aucune description fournie."}
              </Typography>
              
              {document.userName && document.userId !== currentUserRole && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Propriétaire
                  </Typography>
                  <Typography variant="body2">
                    {document.userName}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ mt: 'auto', pt: 2 }}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Aperçu du document
                  </Typography>
                  <Box 
                    sx={{ 
                      height: 250, 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      backgroundColor: 'rgba(0, 0, 0, 0.03)',
                      borderRadius: 1
                    }}
                  >
                    {document.mimeType.startsWith('image/') ? (
                      <Box 
                        component="img" 
                        src={document.fileUrl} 
                        alt={document.name}
                        sx={{ 
                          maxHeight: '100%', 
                          maxWidth: '100%', 
                          objectFit: 'contain'
                        }}
                      />
                    ) : (
                      <Box sx={{ textAlign: 'center' }}>
                        {getDocumentIcon(document.mimeType)}
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Prévisualisation non disponible
                        </Typography>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          startIcon={<DownloadIcon />}
                          sx={{ mt: 2 }}
                          onClick={() => onDownload(document)}
                        >
                          Télécharger pour voir
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Informations
              </Typography>
              
              <List dense sx={{ mt: 1 }}>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CalendarIcon fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Date d'upload" 
                    secondary={formatDate(document.uploadDate)} 
                  />
                </ListItem>
                
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <FolderIcon fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Catégorie" 
                    secondary={document.category} 
                  />
                </ListItem>
                
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <DescriptionIcon fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Type" 
                    secondary={document.name} 
                  />
                </ListItem>
                
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <UserIcon fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Propriétaire" 
                    secondary={document.userName || 'Utilisateur courant'} 
                  />
                </ListItem>
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Show status change options for admin and chef (for their team) */}
              {(isAdmin || (isChef && document.userId !== currentUserRole)) && (
                <>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Actions administrateur
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleStatusChange('verified')}
                      disabled={document.status === 'verified' || loading}
                      sx={{ mb: 1 }}
                    >
                      Marquer comme vérifié
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => handleStatusChange('rejected')}
                      disabled={document.status === 'rejected' || loading}
                      sx={{ mb: 1 }}
                    >
                      Rejeter le document
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="warning"
                      startIcon={<HelpIcon />}
                      onClick={() => handleStatusChange('pending')}
                      disabled={document.status === 'pending' || loading}
                    >
                      Marquer comme en attente
                    </Button>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                </>
              )}
              
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Actions
              </Typography>
              
              <Button
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={() => onDownload(document)}
                sx={{ mb: 1 }}
              >
                Télécharger
              </Button>
              
              {/* Only show delete button if user owns the document or is admin */}
              {canModify && (
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    const documentId = document._id || document.id;
                    onDelete(documentId);
                    onClose();
                  }}
                >
                  Supprimer
                </Button>
              )}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentDetails; 