import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  IconButton, 
  Menu, 
  MenuItem, 
  Divider, 
  ListItemIcon, 
  ListItemText,
  Paper
} from '@mui/material';
import DocumentDetails from './DocumentDetails';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpIcon from '@mui/icons-material/Help';
import ImageIcon from '@mui/icons-material/Image';
import PdfIcon from '@mui/icons-material/PictureAsPdf';
import FileIcon from '@mui/icons-material/InsertDriveFile';
import PersonIcon from '@mui/icons-material/Person';

const DocumentList = ({ 
  documents = [], 
  onDelete, 
  onDownload, 
  onStatusChange, 
  currentUserRole,
  currentUserId 
}) => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuDocument, setMenuDocument] = useState(null);
  
  const handleMenuOpen = (event, document) => {
    setAnchorEl(event.currentTarget);
    setMenuDocument(document);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuDocument(null);
  };
  
  const handleOpenDetails = (document) => {
    setSelectedDocument(document);
    setDetailsOpen(true);
  };
  
  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };
  
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
        return <Chip size="small" label="Vérifié" color="success" icon={<CheckCircleIcon />} />;
      case 'pending':
        return <Chip size="small" label="En attente" color="warning" icon={<HelpIcon />} />;
      case 'rejected':
        return <Chip size="small" label="Rejeté" color="error" icon={<CancelIcon />} />;
      default:
        return <Chip size="small" label="Inconnu" icon={<HelpIcon />} />;
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const isAdmin = currentUserRole === 'admin';
  const isChef = currentUserRole === 'chef';
  
  // Check if current user can modify document (owner or admin)
  const canModifyDocument = (document) => {
    return isAdmin || document.userId === currentUserId;
  };
  
  // Check if current user can change document status (admin or chef for their team)
  const canChangeStatus = (document) => {
    return isAdmin || (isChef && document.userId !== currentUserId);
  };
  
  if (!documents || documents.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Aucun document trouvé pour cette catégorie
        </Typography>
      </Paper>
    );
  }
  
  return (
    <>
      <Grid container spacing={2}>
        {documents.map((document) => (
          <Grid item xs={12} sm={6} md={4} key={document.id}>
            <Card 
              variant="outlined" 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
            >
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getDocumentIcon(document.mimeType)}
                  </Box>
                  
                  <IconButton 
                    size="small" 
                    onClick={(event) => handleMenuOpen(event, document)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                
                <Typography variant="h6" component="div" noWrap sx={{ mb: 1 }}>
                  {document.name}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, flexGrow: 1 }}>
                  {document.description && document.description.length > 60 
                    ? `${document.description.substring(0, 60)}...` 
                    : document.description || 'Aucune description fournie.'}
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                  {getStatusChip(document.status)}
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(document.uploadDate)}
                  </Typography>
                </Box>
                
                {/* Show owner name for admin and chef users */}
                {(isAdmin || isChef) && document.userName && document.userId !== currentUserId && (
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                    <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', fontSize: '0.875rem' }} />
                    <Typography variant="caption" color="text.secondary">
                      {document.userName}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleOpenDetails(menuDocument);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Voir les détails</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          onDownload(menuDocument);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Télécharger</ListItemText>
        </MenuItem>
        
        {menuDocument && canChangeStatus(menuDocument) && menuDocument.status !== 'verified' && (
          <MenuItem onClick={() => {
            onStatusChange(menuDocument.id, 'verified');
            handleMenuClose();
          }}>
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText>Marquer comme vérifié</ListItemText>
          </MenuItem>
        )}
        
        {menuDocument && canChangeStatus(menuDocument) && menuDocument.status !== 'rejected' && (
          <MenuItem onClick={() => {
            onStatusChange(menuDocument.id, 'rejected');
            handleMenuClose();
          }}>
            <ListItemIcon>
              <CancelIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Rejeter</ListItemText>
          </MenuItem>
        )}
        
        {menuDocument && canChangeStatus(menuDocument) && menuDocument.status !== 'pending' && (
          <MenuItem onClick={() => {
            onStatusChange(menuDocument.id, 'pending');
            handleMenuClose();
          }}>
            <ListItemIcon>
              <HelpIcon fontSize="small" color="warning" />
            </ListItemIcon>
            <ListItemText>Marquer comme en attente</ListItemText>
          </MenuItem>
        )}
        
        {menuDocument && canModifyDocument(menuDocument) && (
          <>
            <Divider />
            <MenuItem onClick={() => {
              onDelete(menuDocument.id);
              handleMenuClose();
            }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Supprimer</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
      
      {selectedDocument && (
        <DocumentDetails
          open={detailsOpen}
          onClose={handleCloseDetails}
          document={selectedDocument}
          onDelete={onDelete}
          onDownload={onDownload}
          onStatusChange={onStatusChange}
          currentUserRole={currentUserRole}
          canModify={selectedDocument && canModifyDocument(selectedDocument)}
        />
      )}
    </>
  );
};

export default DocumentList; 