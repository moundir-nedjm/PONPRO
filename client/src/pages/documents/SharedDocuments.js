import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Share as ShareIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Person as PersonIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  People as PeopleIcon,
  FolderShared as FolderSharedIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../utils/api';

const SharedDocuments = ({ documents, onDocumentView, onDocumentDownload, onShareDocument }) => {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [shareMessage, setShareMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sharedDocuments, setSharedDocuments] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  
  useEffect(() => {
    fetchSharedDocuments();
    fetchAvailableUsers();
  }, [currentUser.id]);
  
  const fetchSharedDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/users/${currentUser.id}/shared-documents`);
      
      if (response.data && response.data.success) {
        setSharedDocuments(response.data.data || []);
      } else {
        console.error('Invalid response format for shared documents:', response.data);
        setSharedDocuments([]);
      }
    } catch (err) {
      console.error('Error fetching shared documents:', err);
      setError('Erreur lors du chargement des documents partagés');
      setSharedDocuments([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAvailableUsers = async () => {
    try {
      setError(null);
      
      const response = await apiClient.get('/users');
      
      if (response.data && response.data.success) {
        // Filter out the current user
        setAvailableUsers(response.data.data.filter(user => user.id !== currentUser.id) || []);
      } else {
        console.error('Invalid response format for users:', response.data);
        setAvailableUsers([]);
      }
    } catch (err) {
      console.error('Error fetching available users:', err);
      setError('Erreur lors du chargement des utilisateurs');
      setAvailableUsers([]);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleOpenShareDialog = (document) => {
    setSelectedDocument(document);
    setSelectedUsers([]);
    setShareMessage('');
    setShareDialogOpen(true);
  };
  
  const handleCloseShareDialog = () => {
    setShareDialogOpen(false);
  };
  
  const handleShareDocument = async () => {
    if (!selectedDocument || selectedUsers.length === 0) {
      return;
    }
    
    setLoading(true);
    
    try {
      await Promise.all(selectedUsers.map(userId =>
        apiClient.post('/documents/share', {
          documentId: selectedDocument.id,
          userId,
          message: shareMessage
        })
      ));
      
      // If successful
      if (onShareDocument) {
        onShareDocument(selectedDocument.id, selectedUsers, shareMessage);
      }
    } catch (err) {
      console.error('Error sharing document:', err);
      setError('Erreur lors du partage du document');
    } finally {
      setLoading(false);
      handleCloseShareDialog();
    }
  };
  
  const handleUserSelect = (event) => {
    setSelectedUsers(event.target.value);
  };
  
  const handleMessageChange = (event) => {
    setShareMessage(event.target.value);
  };
  
  const getDocumentIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon />;
    } else if (mimeType === 'application/pdf') {
      return <PdfIcon />;
    } else {
      return <FileIcon />;
    }
  };
  
  const renderMySharedDocuments = () => {
    const mySharedDocs = documents.filter(doc => doc.shared);
    
    if (mySharedDocs.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          Vous n'avez partagé aucun document. Utilisez le bouton "Partager" pour partager vos documents avec d'autres utilisateurs.
        </Alert>
      );
    }
    
    return (
      <List>
        {mySharedDocs.map(doc => (
          <ListItem
            key={doc.id}
            sx={{
              mb: 1,
              borderRadius: 1,
              backgroundColor: 'background.paper',
              boxShadow: 1
            }}
          >
            <ListItemIcon>
              {getDocumentIcon(doc.mimeType)}
            </ListItemIcon>
            <ListItemText
              primary={doc.name}
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {doc.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Partagé le: {new Date(doc.sharedDate || doc.uploadDate).toLocaleDateString()}
                  </Typography>
                </Box>
              }
            />
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <Chip
                icon={<PeopleIcon />}
                label={`Partagé avec ${doc.sharedWithCount || 0} utilisateurs`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
            <ListItemSecondaryAction>
              <IconButton 
                edge="end" 
                aria-label="view" 
                title="Voir le document"
                onClick={() => onDocumentView(doc)}
              >
                <ViewIcon />
              </IconButton>
              <IconButton 
                edge="end" 
                aria-label="share" 
                title="Partager à nouveau"
                onClick={() => handleOpenShareDialog(doc)}
              >
                <ShareIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    );
  };
  
  const renderSharedWithMe = () => {
    if (sharedDocuments.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          Aucun document n'a été partagé avec vous.
        </Alert>
      );
    }
    
    return (
      <List>
        {sharedDocuments.map(share => (
          <ListItem
            key={share.id}
            sx={{
              mb: 1,
              borderRadius: 1,
              backgroundColor: 'background.paper',
              boxShadow: 1
            }}
          >
            <ListItemIcon>
              {getDocumentIcon(share.mimeType)}
            </ListItemIcon>
            <ListItemText
              primary={share.documentName}
              secondary={
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Partagé par: {share.sharedBy.name}
                  </Typography>
                  {share.message && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Message: {share.message}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    Reçu le: {new Date(share.sharedDate).toLocaleDateString()}
                  </Typography>
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <IconButton 
                edge="end" 
                aria-label="view" 
                title="Voir le document"
                onClick={() => onDocumentView({
                  id: share.documentId,
                  name: share.documentName,
                  fileUrl: share.documentUrl,
                  mimeType: share.mimeType
                })}
              >
                <ViewIcon />
              </IconButton>
              <IconButton 
                edge="end" 
                aria-label="download" 
                title="Télécharger"
                onClick={() => onDocumentDownload({
                  id: share.documentId,
                  name: share.documentName,
                  fileUrl: share.documentUrl,
                  mimeType: share.mimeType
                })}
              >
                <DownloadIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    );
  };
  
  if (loading && sharedDocuments.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FolderSharedIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
        <Typography variant="h6">
          Documents Partagés
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="shared documents tabs">
          <Tab label="Documents que j'ai partagés" id="tab-0" />
          <Tab 
            label="Partagés avec moi" 
            id="tab-1" 
            icon={sharedDocuments.length > 0 ? <Chip size="small" label={sharedDocuments.length} color="primary" /> : undefined}
            iconPosition="end"
          />
        </Tabs>
      </Box>
      
      <Box sx={{ mt: 2 }}>
        {tabValue === 0 ? (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ShareIcon />}
                onClick={() => handleOpenShareDialog(documents[0])}
                disabled={documents.length === 0}
              >
                Partager un Document
              </Button>
            </Box>
            {renderMySharedDocuments()}
          </>
        ) : (
          renderSharedWithMe()
        )}
      </Box>
      
      {/* Share Dialog */}
      <Dialog 
        open={shareDialogOpen} 
        onClose={handleCloseShareDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Partager un Document</DialogTitle>
        <DialogContent>
          {selectedDocument && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Document à partager:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  {getDocumentIcon(selectedDocument.mimeType)}
                  <Typography sx={{ ml: 1 }}>
                    {selectedDocument.name}
                  </Typography>
                </Box>
              </Box>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel id="share-users-label">Partager avec</InputLabel>
                <Select
                  labelId="share-users-label"
                  id="share-users"
                  multiple
                  value={selectedUsers}
                  onChange={handleUserSelect}
                  label="Partager avec"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((userId) => {
                        const user = availableUsers.find(u => u.id === userId);
                        return (
                          <Chip 
                            key={userId} 
                            label={user ? user.name : userId} 
                            size="small"
                            icon={<PersonIcon />}
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {availableUsers.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2">{user.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email} - {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Message (optionnel)"
                multiline
                rows={3}
                value={shareMessage}
                onChange={handleMessageChange}
                placeholder="Ajoutez un message pour les destinataires"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseShareDialog} disabled={loading}>
            Annuler
          </Button>
          <Button
            onClick={handleShareDocument}
            variant="contained"
            color="primary"
            disabled={!selectedDocument || selectedUsers.length === 0 || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <ShareIcon />}
          >
            {loading ? 'Partage en cours...' : 'Partager'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SharedDocuments; 