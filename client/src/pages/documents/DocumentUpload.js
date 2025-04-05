import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  LinearProgress,
  FormHelperText,
  Grid,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AttachFileIcon from '@mui/icons-material/AttachFile';

const DocumentUpload = ({ 
  open, 
  onClose, 
  onUpload, 
  categories = [],
  currentUserRole,
  teamMembers = []
}) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [userIdToAssign, setUserIdToAssign] = useState('');
  
  const isAdmin = currentUserRole === 'admin';
  const isChef = currentUserRole === 'chef';
  
  const resetForm = () => {
    setFile(null);
    setFileName('');
    setDescription('');
    setCategory('');
    setUploading(false);
    setFileError('');
    setFormErrors({});
    setUserIdToAssign('');
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setFileError('Le fichier est trop volumineux. Taille maximale: 10MB');
        setFile(null);
      } else {
        setFile(selectedFile);
        setFileName(selectedFile.name);
        setFileError('');
      }
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!fileName.trim()) {
      errors.fileName = 'Le nom du fichier est requis';
    }
    
    if (!category) {
      errors.category = 'La catégorie est requise';
    }
    
    if (!file) {
      errors.file = 'Veuillez sélectionner un fichier';
    }
    
    // For admin/chef, require selecting a user if they chose to assign
    if ((isAdmin || isChef) && userIdToAssign === '') {
      errors.userIdToAssign = 'Veuillez sélectionner un utilisateur';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleUpload = async () => {
    if (!validateForm()) return;
    
    setUploading(true);
    
    try {
      // Prepare document data
      const documentData = {
        name: fileName,
        description,
        category,
        file,
        // If admin/chef is uploading for someone else, include the userId
        userId: (isAdmin || isChef) ? userIdToAssign : undefined
      };
      
      await onUpload(documentData);
      handleClose();
    } catch (error) {
      console.error('Error uploading document:', error);
      // Handle error
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Ajouter un nouveau document</Typography>
          <IconButton aria-label="close" onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Informations du document
              </Typography>
              
              <TextField
                fullWidth
                margin="normal"
                label="Nom du fichier"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                error={Boolean(formErrors.fileName)}
                helperText={formErrors.fileName}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="Description (optionnelle)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={4}
              />
              
              <FormControl 
                fullWidth 
                margin="normal"
                error={Boolean(formErrors.category)}
              >
                <InputLabel>Catégorie</InputLabel>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  label="Catégorie"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.category && <FormHelperText>{formErrors.category}</FormHelperText>}
              </FormControl>
              
              {/* User assignment for admin/chef */}
              {(isAdmin || isChef) && teamMembers.length > 0 && (
                <FormControl 
                  fullWidth 
                  margin="normal"
                  error={Boolean(formErrors.userIdToAssign)}
                >
                  <InputLabel>Assigner à</InputLabel>
                  <Select
                    value={userIdToAssign}
                    onChange={(e) => setUserIdToAssign(e.target.value)}
                    label="Assigner à"
                  >
                    <MenuItem value="">
                      <em>Moi-même</em>
                    </MenuItem>
                    <Divider />
                    {teamMembers.map((member) => (
                      <MenuItem key={member.id} value={member.id}>
                        {member.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {formErrors.userIdToAssign || 'Assigner ce document à un autre utilisateur'}
                  </FormHelperText>
                </FormControl>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                border: '2px dashed #ccc', 
                borderRadius: 2, 
                p: 3, 
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 3,
                backgroundColor: 'rgba(0, 0, 0, 0.02)'
              }}
            >
              <input
                type="file"
                id="document-upload"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              
              {file ? (
                <Box>
                  <AttachFileIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="body1" gutterBottom>
                    {file.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => {
                      document.getElementById('document-upload').click();
                    }}
                    sx={{ mt: 2 }}
                  >
                    Changer de fichier
                  </Button>
                </Box>
              ) : (
                <Box>
                  <UploadFileIcon color="action" sx={{ fontSize: 64, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Glissez et déposez votre fichier ici
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    ou
                  </Typography>
                  <Button 
                    variant="contained" 
                    component="label" 
                    htmlFor="document-upload"
                    sx={{ mt: 2 }}
                  >
                    Parcourir les fichiers
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Taille maximale: 10MB
                  </Typography>
                </Box>
              )}
              
              {fileError && (
                <Typography variant="caption" color="error" sx={{ mt: 2 }}>
                  {fileError}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
        
        {uploading && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress />
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={uploading}>
          Annuler
        </Button>
        <Button 
          onClick={handleUpload} 
          variant="contained" 
          disabled={uploading || Boolean(fileError)}
          startIcon={<UploadFileIcon />}
        >
          {uploading ? 'Téléchargement en cours...' : 'Télécharger'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentUpload; 