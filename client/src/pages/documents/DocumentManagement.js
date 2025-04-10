import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  AlertTitle,
  CircularProgress,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tabs,
  Tab,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Menu,
  Tooltip,
  FormHelperText,
  ListSubheader
} from '@mui/material';
import {
  Description as DescriptionIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  AttachFile as AttachFileIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  School as SchoolIcon,
  Badge as BadgeIcon,
  Work as WorkIcon,
  HealthAndSafety as HealthIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Share as ShareIcon,
  History as HistoryIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Help as HelpIcon,
  Dashboard as DashboardIcon,
  Close as CloseIcon,
  People as PeopleIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import apiClient from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import DocumentDetails from './DocumentDetails';
import DocumentHistory from './DocumentHistory';
import SharedDocuments from './SharedDocuments';
import DocumentAnalytics from './DocumentAnalytics';

const DocumentManagement = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('date_desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'dashboard'
  const [teamDocuments, setTeamDocuments] = useState([]);
  const [viewingMode, setViewingMode] = useState(currentUser.role === 'admin' ? 'all' : 'personal');
  const [deletedDocumentIds, setDeletedDocumentIds] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  
  const fileInputRef = useRef(null);
  
  const isAdmin = currentUser.role === 'admin';
  const isChef = currentUser.role === 'chef';
  const isEmployee = currentUser.role === 'employee';
  
  const documentCategories = [
    { id: 'identity', label: 'Pièces d\'identité', icon: <BadgeIcon /> },
    { id: 'family', label: 'Situation Familiale', icon: <PeopleIcon /> },
    { id: 'education', label: 'Diplômes et Formations', icon: <SchoolIcon /> },
    { id: 'professional', label: 'Documents Professionnels', icon: <WorkIcon /> },
    { id: 'health', label: 'Santé et Assurance', icon: <HealthIcon /> },
    { id: 'financial', label: 'Documents Financiers', icon: <AccountBalanceIcon /> },
    { id: 'other', label: 'Autres Documents', icon: <FileIcon /> },
  ];
  
  const documentTypes = {
    identity: [
      { id: 'national_id', label: 'Carte Nationale d\'Identité' },
      { id: 'passport', label: 'Passeport' },
      { id: 'residence_permit', label: 'Titre de Séjour' },
      { id: 'birth_certificate', label: 'Acte de Naissance' },
      { id: 'driver_license', label: 'Permis de Conduire' },
      { id: 'electoral_card', label: 'Carte Électorale' }
    ],
    family: [
      { id: 'marriage_certificate', label: 'Acte de Mariage' },
      { id: 'family_record', label: 'Livret de Famille' },
      { id: 'divorce_decree', label: 'Jugement de Divorce' },
      { id: 'child_birth', label: 'Acte de Naissance Enfant' },
      { id: 'pacs', label: 'Attestation PACS' }
    ],
    education: [
      { id: 'diploma_high_school', label: 'Diplôme Baccalauréat' },
      { id: 'diploma_bachelor', label: 'Diplôme Licence/Bachelor' },
      { id: 'diploma_master', label: 'Diplôme Master' },
      { id: 'diploma_doctorate', label: 'Diplôme Doctorat' },
      { id: 'certificate', label: 'Certificat Professionnel' },
      { id: 'training', label: 'Attestation de Formation' },
      { id: 'transcript', label: 'Relevé de Notes' },
      { id: 'language_certificate', label: 'Certificat de Langue' }
    ],
    professional: [
      { id: 'resume', label: 'CV' },
      { id: 'contract', label: 'Contrat de Travail' },
      { id: 'amendment', label: 'Avenant au Contrat' },
      { id: 'reference', label: 'Lettre de Référence' },
      { id: 'evaluation', label: 'Évaluation Professionnelle' },
      { id: 'work_certificate', label: 'Certificat de Travail' },
      { id: 'non_compete', label: 'Clause de Non-Concurrence' },
      { id: 'confidentiality', label: 'Accord de Confidentialité' }
    ],
    health: [
      { id: 'medical_certificate', label: 'Certificat Médical' },
      { id: 'vaccination', label: 'Carnet de Vaccination' },
      { id: 'insurance_health', label: 'Assurance Maladie' },
      { id: 'insurance_life', label: 'Assurance Vie' },
      { id: 'insurance_liability', label: 'Assurance Responsabilité Civile' },
      { id: 'safety_training', label: 'Formation Sécurité' },
      { id: 'disability', label: 'Attestation d\'Invalidité' },
      { id: 'work_accident', label: 'Déclaration Accident du Travail' }
    ],
    financial: [
      { id: 'pay_slip', label: 'Bulletin de Paie' },
      { id: 'tax_notice', label: 'Avis d\'Imposition' },
      { id: 'bank_details', label: 'RIB/Coordonnées Bancaires' },
      { id: 'savings_account', label: 'Relevé de Compte Épargne' },
      { id: 'loan_agreement', label: 'Contrat de Prêt' },
      { id: 'pension_statement', label: 'Relevé de Retraite' }
    ],
    other: [
      { id: 'housing', label: 'Contrat de Bail/Titre de Propriété' },
      { id: 'utility_bill', label: 'Facture (Eau, Électricité, etc.)' },
      { id: 'car_registration', label: 'Carte Grise' },
      { id: 'insurance_car', label: 'Assurance Véhicule' },
      { id: 'other', label: 'Autre Document' },
    ],
  };

  useEffect(() => {
    // Load deleted document IDs from localStorage
    const storedDeletedIds = localStorage.getItem('deletedDocumentIds');
    if (storedDeletedIds) {
      setDeletedDocumentIds(JSON.parse(storedDeletedIds));
    }
    
    fetchDocuments();
    if (isAdmin || isChef) {
      fetchTeamDocuments();
      fetchEmployees();
    }
  }, [currentUser]);
  
  useEffect(() => {
    // Apply filters and search
    filterDocuments();
  }, [documents, searchQuery, filterStatus, sortOption, viewingMode, teamDocuments]);
  
  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting to fetch documents...');
      
      // Get deleted document IDs from localStorage
      const storedDeletedIds = localStorage.getItem('deletedDocumentIds');
      const deletedIds = storedDeletedIds ? JSON.parse(storedDeletedIds) : [];
      
      const response = await apiClient.get('/documents');
      
      if (response.data && response.data.success) {
        const documentData = response.data.data || [];
        console.log('Successfully fetched documents from API:', documentData.length);
        
        // Filter out deleted documents
        const filteredData = documentData.filter(doc => 
          !deletedIds.includes(doc.id) && !deletedIds.includes(doc._id)
        );
        
        setDocuments(filteredData);
        setFilteredDocuments(filteredData);
      } else {
        console.error('API returned invalid format:', response.data);
        setError('Erreur lors du chargement des documents: Format de réponse invalide');
        setDocuments([]);
        setFilteredDocuments([]);
      }
    } catch (err) {
      console.error('Error in document fetching:', err);
      const errorDetails = err.response ? 
        `${err.response.status} - ${err.response.statusText}` : 
        (err.message || 'Erreur inconnue');
      
      setError(`Erreur lors du chargement des documents: ${errorDetails}`);
      setDocuments([]);
      setFilteredDocuments([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Get team documents if admin or chef
  const fetchTeamDocuments = async () => {
    if (!isAdmin && !isChef) return;
    
    try {
      const response = await apiClient.get('/documents/team');
      
      if (response.data && response.data.success) {
        const teamData = response.data.data || [];
        
        // Get deleted document IDs from localStorage
        const storedDeletedIds = localStorage.getItem('deletedDocumentIds');
        const deletedIds = storedDeletedIds ? JSON.parse(storedDeletedIds) : [];
        
        // Filter out deleted documents from team data
        const filteredTeamData = teamData.filter(doc => 
          !deletedIds.includes(doc.id) && !deletedIds.includes(doc._id)
        );
        
        setTeamDocuments(filteredTeamData);
      } else {
        console.error('API returned invalid format for team documents:', response.data);
        setTeamDocuments([]);
      }
    } catch (err) {
      console.error('Error fetching team documents:', err);
      setTeamDocuments([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await apiClient.get('/employees');
      
      if (response.data && response.data.success) {
        const employeeData = response.data.data || [];
        console.log('Successfully fetched employees:', employeeData.length);
        setEmployees(employeeData);
      } else {
        console.error('API returned invalid format for employees:', response.data);
        setEmployees([]);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setEmployees([]);
    }
  };

  const filterDocuments = () => {
    let docsToFilter = [];
    
    // Determine which documents to show based on role and viewing mode
    if (isAdmin) {
      if (viewingMode === 'all') {
        docsToFilter = [...documents, ...teamDocuments];
      } else if (viewingMode === 'pending') {
        docsToFilter = [...documents, ...teamDocuments].filter(doc => doc.status === 'pending');
      } else {
        docsToFilter = documents;
      }
    } else if (isChef) {
      if (viewingMode === 'team') {
        docsToFilter = teamDocuments;
      } else if (viewingMode === 'pending') {
        docsToFilter = teamDocuments.filter(doc => doc.status === 'pending');
      } else {
        docsToFilter = documents;
      }
    } else {
      // Employee can only see their own documents
      docsToFilter = documents;
    }
    
    // Apply status filter if not already filtered by viewingMode
    if (viewingMode !== 'pending' && filterStatus !== 'all') {
      docsToFilter = docsToFilter.filter(doc => doc.status === filterStatus);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      docsToFilter = docsToFilter.filter(doc => 
        doc.name.toLowerCase().includes(query) || 
        (doc.description && doc.description.toLowerCase().includes(query)) ||
        (doc.userName && doc.userName.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    docsToFilter.sort((a, b) => {
      switch (sortOption) {
        case 'date_asc':
          return new Date(a.uploadDate) - new Date(b.uploadDate);
        case 'date_desc':
          return new Date(b.uploadDate) - new Date(a.uploadDate);
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return new Date(b.uploadDate) - new Date(a.uploadDate);
      }
    });
    
    setFilteredDocuments(docsToFilter);
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleOpenUploadDialog = () => {
    setUploadDialogOpen(true);
    setSelectedFile(null);
    setDocumentType('');
    setDocumentDescription('');
    setUploadProgress(0);
    setSelectedEmployeeId(currentUser.id);
  };
  
  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
  };
  
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };
  
  const handleTypeChange = (event) => {
    setDocumentType(event.target.value);
  };
  
  const handleDescriptionChange = (event) => {
    setDocumentDescription(event.target.value);
  };
  
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };
  
  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
  };
  
  const handleMenuOpen = (event, document) => {
    setSelectedDocument(document);
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setDetailsDialogOpen(true);
    handleMenuClose();
  };
  
  const handleViewHistory = (document) => {
    setSelectedDocument(document);
    setHistoryDialogOpen(true);
    handleMenuClose();
  };
  
  const handleDownloadDocument = async (document) => {
    try {
      // Create a link to download the file
      const link = document.fileUrl;
      
      // Create an anchor element and simulate click to download
      const a = document.createElement('a');
      a.href = link;
      a.download = document.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading document:', err);
      setError('Erreur lors du téléchargement du document');
    }
  };
  
  const handleShareDocument = (documentId, users, message) => {
    // In a real app, this would call an API to share the document
    console.log('Sharing document:', documentId, 'with users:', users, 'message:', message);
    setSuccess('Document partagé avec succès.');
    
    // Update the document's shared status in our local state
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              shared: true, 
              sharedWithCount: users.length,
              sharedDate: new Date().toISOString()
            } 
          : doc
      )
    );
  };
  
  const handleStatusChange = async (documentId, newStatus) => {
    try {
      const response = await apiClient.patch(`/documents/${documentId}/status`, { 
        status: newStatus 
      });
      
      if (response.data && response.data.success) {
        const updatedDocument = response.data.data;
        
        // Update document in state
        setDocuments(documents.map(doc => 
          doc._id === documentId || doc.id === documentId ? updatedDocument : doc
        ));
        
        setSuccess(`Status du document mis à jour: ${newStatus}`);
      } else {
        throw new Error('Failed to update document status');
      }
    } catch (err) {
      console.error('Error updating document status:', err);
      setError('Erreur lors de la mise à jour du statut du document');
    }
  };
  
  const handleUploadDocument = async (documentData) => {
    try {
      setIsUploading(true);
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', documentData.file);
      formData.append('name', documentData.name);
      formData.append('description', documentData.description || '');
      formData.append('category', documentData.category);
      
      // If admin/chef is uploading for someone else
      if (documentData.userId) {
        formData.append('userId', documentData.userId);
      }
      
      const response = await apiClient.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      if (response.data && response.data.success) {
        // Add new document to state
        const newDocument = response.data.data;
        setDocuments([newDocument, ...documents]);
        setSuccess('Document téléchargé avec succès');
      } else {
        throw new Error('Failed to upload document: Invalid response format');
      }
      
      setUploadDialogOpen(false);
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Erreur lors du téléchargement du document. Veuillez réessayer.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  const handleDeleteDocument = async (documentId) => {
    try {
      const response = await apiClient.delete(`/documents/${documentId}`);
      
      if (!response.data || !response.data.success) {
        throw new Error('Failed to delete document');
      }
      
      // Add the document ID to deletedDocumentIds
      const updatedDeletedIds = [...deletedDocumentIds, documentId];
      setDeletedDocumentIds(updatedDeletedIds);
      
      // Store the deleted IDs in localStorage for persistence
      localStorage.setItem('deletedDocumentIds', JSON.stringify(updatedDeletedIds));
      
      // Remove document from state
      setDocuments(documents.filter(doc => doc._id !== documentId && doc.id !== documentId));
      setTeamDocuments(teamDocuments.filter(doc => doc._id !== documentId && doc.id !== documentId));
      setSuccess('Document supprimé avec succès');
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Erreur lors de la suppression du document');
    }
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
  
  const getStatusChip = (status) => {
    switch (status) {
      case 'verified':
        return <Chip label="Vérifié" color="success" size="small" icon={<CheckCircleIcon />} />;
      case 'pending':
        return <Chip label="En attente" color="warning" size="small" icon={<HelpIcon />} />;
      case 'rejected':
        return <Chip label="Rejeté" color="error" size="small" icon={<CancelIcon />} />;
      default:
        return <Chip label="Inconnu" size="small" />;
    }
  };
  
  const renderDocumentsByCategory = (category) => {
    const filtered = filteredDocuments.filter(doc => 
      // Handle both mock data (using type field) and API data (using category field)
      doc.category === category || doc.type === category
    );
    
    if (filtered.length === 0) {
      return (
        <Alert severity="info" sx={{ my: 2 }}>
          Aucun document dans cette catégorie. Cliquez sur "Ajouter un document" pour commencer.
        </Alert>
      );
    }
    
    return (
      <List>
        {filtered.map(doc => (
          <ListItem
            key={doc.id || doc._id}
            sx={{
              mb: 1,
              borderRadius: 1,
              backgroundColor: 'background.paper',
              boxShadow: 1,
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              py: { xs: 1.5, sm: 1 },
              px: { xs: 2, sm: 2 }
            }}
          >
            <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', mb: { xs: 1, sm: 0 } }}>
              <ListItemIcon sx={{ minWidth: { xs: 36, sm: 42 } }}>
                {getDocumentIcon(doc.mimeType)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Typography variant="body1" noWrap sx={{ maxWidth: { xs: '180px', sm: '220px', md: 'none' } }}>
                      {doc.name}
                    </Typography>
                    {/* Show user name for documents not belonging to current user */}
                    {doc.userId !== currentUser.id && doc.userName && (
                      <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                        ({doc.userName})
                      </Typography>
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 1 }}>
                      {doc.description || "Aucune description"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Uploadé le {new Date(doc.uploadDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                }
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mt: { xs: 1, sm: 0 } }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {getStatusChip(doc.status)}
                {doc.shared && (
                  <Chip label="Partagé" color="primary" size="small" icon={<ShareIcon fontSize="small" />} variant="outlined" />
                )}
              </Box>
              <IconButton
                edge="end"
                aria-label="more"
                onClick={(e) => handleMenuOpen(e, doc)}
                size="small"
              >
                <MoreIcon />
              </IconButton>
            </Box>
          </ListItem>
        ))}
      </List>
    );
  };
  
  const handleViewingModeChange = (event) => {
    setViewingMode(event.target.value);
  };
  
  const handleEmployeeChange = (event) => {
    setSelectedEmployeeId(event.target.value);
  };
  
  if (loading && documents.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <DescriptionIcon color="primary" sx={{ fontSize: { xs: 24, sm: 28 }, mr: 1 }} />
          <Typography variant="h5" component="h1" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
            Gestion des Renseignements
          </Typography>
        </Box>
        <Typography color="textSecondary" gutterBottom>
          {isAdmin ? (
            "Gérez les documents de tous les utilisateurs et validez les pièces en attente."
          ) : isChef ? (
            "Gérez vos documents personnels et validez les pièces des membres de votre équipe."
          ) : (
            "Gérez vos documents personnels et professionnels dans un espace centralisé et sécurisé."
          )}
        </Typography>
      </Paper>
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          <AlertTitle>Succès</AlertTitle>
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          <AlertTitle>Erreur</AlertTitle>
          {error}
        </Alert>
      )}
      
      {/* Filter, Search and View Controls */}
      <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 } }}>
        <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="center">
          {/* First row for role-specific view options */}
          {(isAdmin || isChef) && (
            <Grid item xs={12} sx={{ mb: 1 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {isAdmin && (
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel id="viewing-mode-label">Mode de visualisation</InputLabel>
                    <Select
                      labelId="viewing-mode-label"
                      id="viewing-mode"
                      value={viewingMode}
                      label="Mode de visualisation"
                      onChange={handleViewingModeChange}
                    >
                      <MenuItem value="all">Tous les documents</MenuItem>
                      <MenuItem value="pending">Documents en attente</MenuItem>
                      <MenuItem value="personal">Mes documents</MenuItem>
                    </Select>
                  </FormControl>
                )}
                {isChef && (
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel id="viewing-mode-label">Mode de visualisation</InputLabel>
                    <Select
                      labelId="viewing-mode-label"
                      id="viewing-mode"
                      value={viewingMode}
                      label="Mode de visualisation"
                      onChange={handleViewingModeChange}
                    >
                      <MenuItem value="personal">Mes documents</MenuItem>
                      <MenuItem value="team">Documents de l'équipe</MenuItem>
                      <MenuItem value="pending">Documents en attente</MenuItem>
                    </Select>
                  </FormControl>
                )}
                {(viewingMode === 'pending' || viewingMode === 'all' || viewingMode === 'team') && (
                  <Chip 
                    label={`${filteredDocuments.filter(doc => doc.status === 'pending').length} document(s) en attente`} 
                    color="warning"
                    variant="outlined"
                    icon={<HelpIcon />}
                  />
                )}
              </Box>
            </Grid>
          )}
          
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="Rechercher un document..."
              value={searchQuery}
              onChange={handleSearchChange}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="filter-status-label">Statut</InputLabel>
              <Select
                labelId="filter-status-label"
                id="filter-status"
                value={filterStatus}
                label="Statut"
                onChange={handleFilterChange}
                startAdornment={<FilterIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />}
                disabled={viewingMode === 'pending'}
              >
                <MenuItem value="all">Tous</MenuItem>
                <MenuItem value="verified">Vérifiés</MenuItem>
                <MenuItem value="pending">En attente</MenuItem>
                <MenuItem value="rejected">Rejetés</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-label">Trier par</InputLabel>
              <Select
                labelId="sort-label"
                id="sort"
                value={sortOption}
                label="Trier par"
                onChange={handleSortChange}
                startAdornment={<SortIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                <MenuItem value="date_desc">Date (récent)</MenuItem>
                <MenuItem value="date_asc">Date (ancien)</MenuItem>
                <MenuItem value="name_asc">Nom (A-Z)</MenuItem>
                <MenuItem value="name_desc">Nom (Z-A)</MenuItem>
                {(isAdmin || isChef) && <MenuItem value="status">Statut</MenuItem>}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' }, mt: { xs: 1, sm: 0 } }}>
            <Box sx={{ mr: 1, display: 'flex' }}>
              <Tooltip title="Vue liste">
                <IconButton 
                  size="medium"
                  color={viewMode === 'list' ? 'primary' : 'default'} 
                  onClick={() => handleViewModeChange('list')}
                >
                  <DescriptionIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Vue tableau de bord">
                <IconButton 
                  size="medium"
                  color={viewMode === 'dashboard' ? 'primary' : 'default'} 
                  onClick={() => handleViewModeChange('dashboard')}
                >
                  <DashboardIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Button
              variant="contained"
              color="primary"
              size="medium"
              startIcon={<UploadIcon />}
              onClick={handleOpenUploadDialog}
              disabled={viewingMode !== 'personal' && viewingMode !== 'all'}
              sx={{ whiteSpace: 'nowrap' }}
            >
              {window.innerWidth <= 600 ? 'Ajouter' : 'Ajouter un Document'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Dashboard View */}
      {viewMode === 'dashboard' && (
        <>
          <DocumentAnalytics documents={filteredDocuments} />
          <SharedDocuments 
            documents={documents} 
            onDocumentView={handleViewDocument}
            onDocumentDownload={handleDownloadDocument}
            onShareDocument={handleShareDocument}
          />
        </>
      )}
      
      {/* List View */}
      {viewMode === 'list' && (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              aria-label="document categories tabs"
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ 
                minHeight: { xs: '42px', sm: '48px' }, 
                '& .MuiTab-root': { 
                  minHeight: { xs: '42px', sm: '48px' }, 
                  py: { xs: 0.5, sm: 1 }, 
                  px: { xs: 1, sm: 2 },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                } 
              }}
            >
              {documentCategories.map((category, index) => (
                <Tab 
                  key={category.id}
                  icon={category.icon} 
                  iconPosition="start" 
                  label={category.label}
                  id={`document-tab-${index}`}
                  aria-controls={`document-tabpanel-${index}`}
                />
              ))}
            </Tabs>
          </Box>
          
          {documentCategories.map((category, index) => (
            <Box
              key={category.id}
              role="tabpanel"
              hidden={tabValue !== index}
              id={`document-tabpanel-${index}`}
              aria-labelledby={`document-tab-${index}`}
            >
              {tabValue === index && (
                <Box sx={{ py: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {category.label}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {renderDocumentsByCategory(category.id)}
                </Box>
              )}
            </Box>
          ))}
        </>
      )}
      
      {/* Document Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewDocument(selectedDocument)}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Voir les détails</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDownloadDocument(selectedDocument)}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Télécharger</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleViewHistory(selectedDocument)}>
          <ListItemIcon>
            <HistoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Historique</ListItemText>
        </MenuItem>
        
        {/* Status change options for admin and chef (for team members) */}
        {((isAdmin || isChef) && (selectedDocument?.userId !== currentUser.id)) && (
          <>
            <Divider />
            <MenuItem 
              onClick={() => {
                handleStatusChange(selectedDocument.id, 'verified');
                handleMenuClose();
              }}
              disabled={selectedDocument?.status === 'verified'}
            >
              <ListItemIcon>
                <CheckCircleIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText>Valider le document</ListItemText>
            </MenuItem>
            <MenuItem 
              onClick={() => {
                handleStatusChange(selectedDocument.id, 'rejected');
                handleMenuClose();
              }}
              disabled={selectedDocument?.status === 'rejected'}
            >
              <ListItemIcon>
                <CancelIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Rejeter le document</ListItemText>
            </MenuItem>
          </>
        )}
        
        {/* Only show delete for user's own documents */}
        {(selectedDocument?.userId === currentUser.id || isAdmin) && (
          <>
            <Divider />
            <MenuItem onClick={() => {
              handleMenuClose();
              handleDeleteDocument(selectedDocument.id);
            }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ color: 'error' }}>Supprimer</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
      
      {/* Document Details Dialog */}
      <DocumentDetails 
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        document={selectedDocument}
        onDelete={handleDeleteDocument}
        onDownload={handleDownloadDocument}
        onStatusChange={handleStatusChange}
        currentUserRole={currentUser.role}
        canModify={selectedDocument?.userId === currentUser.id || isAdmin}
      />
      
      {/* Document History Dialog */}
      <DocumentHistory 
        open={historyDialogOpen}
        onClose={() => setHistoryDialogOpen(false)}
        documentId={selectedDocument?.id}
      />
      
      {/* Upload Dialog */}
      <Dialog 
        open={uploadDialogOpen} 
        onClose={handleCloseUploadDialog}
        maxWidth="md"
        fullWidth
        sx={{ '& .MuiDialog-paper': { m: { xs: 1, sm: 2 }, width: { xs: 'calc(100% - 16px)', sm: 'auto' } } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Ajouter un Document</Typography>
            <IconButton onClick={handleCloseUploadDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Veuillez sélectionner un document à télécharger et fournir les informations nécessaires.
          </DialogContentText>
          
          {(isAdmin || isChef) && (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="employee-label">Propriétaire du document</InputLabel>
              <Select
                labelId="employee-label"
                id="employee-select"
                value={selectedEmployeeId}
                label="Propriétaire du document"
                onChange={handleEmployeeChange}
              >
                <MenuItem value={currentUser.id}>
                  Moi-même ({currentUser.name || 'Utilisateur actuel'})
                </MenuItem>
                <Divider />
                {employees.map(employee => (
                  <MenuItem key={employee._id} value={employee._id}>
                    {employee.firstName} {employee.lastName} - {employee.employeeId}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Ce document sera ajouté au dossier de cet employé
              </FormHelperText>
            </FormControl>
          )}
          
          {!isAdmin && !isChef && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Ce document sera ajouté à votre dossier personnel
            </Alert>
          )}
          
          <Box sx={{ py: 2, display: 'flex', justifyContent: 'center', mb: 2 }}>
            {selectedFile ? (
              <Box sx={{ textAlign: 'center' }}>
                {selectedFile.type.startsWith('image/') ? (
                  <Box 
                    component="img" 
                    src={URL.createObjectURL(selectedFile)} 
                    alt="Preview"
                    sx={{ 
                      maxHeight: 150, 
                      maxWidth: '100%', 
                      objectFit: 'contain',
                      mb: 1
                    }}
                  />
                ) : (
                  <FileIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
                )}
                <Typography variant="body2">
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </Typography>
                <Button 
                  variant="text" 
                  size="small"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  sx={{ mt: 1 }}
                >
                  Changer de fichier
                </Button>
              </Box>
            ) : (
              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFileIcon />}
                sx={{ py: 2, px: 3 }}
              >
                Sélectionner un Fichier
                <input
                  type="file"
                  ref={fileInputRef}
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.txt"
                />
              </Button>
            )}
          </Box>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="document-type-label">Type de Document</InputLabel>
            <Select
              labelId="document-type-label"
              id="document-type"
              value={documentType}
              label="Type de Document"
              onChange={handleTypeChange}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 400
                  }
                }
              }}
            >
              {documentCategories.map(category => [
                <ListSubheader key={`header-${category.id}`} sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  {React.cloneElement(category.icon, { fontSize: 'small', sx: { mr: 1 } })}
                  {category.label}
                </ListSubheader>,
                ...documentTypes[category.id].map(type => (
                  <MenuItem key={type.id} value={type.id} sx={{ pl: 4 }}>
                    {type.label}
                  </MenuItem>
                ))
              ]).flat()}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Description (optionnelle)"
            multiline
            rows={2}
            value={documentDescription}
            onChange={handleDescriptionChange}
            sx={{ mb: 2 }}
          />
          
          {isUploading && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">Envoi...</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseUploadDialog} disabled={isUploading}>
            Annuler
          </Button>
          <Button 
            onClick={() => handleUploadDocument({ 
              file: selectedFile, 
              name: documentType ? 
                documentTypes[documentCategories.find(cat => 
                  documentTypes[cat.id].some(type => type.id === documentType)
                )?.id]?.find(type => type.id === documentType)?.label || documentType : 
                selectedFile?.name,
              description: documentDescription, 
              category: documentType,
              userId: selectedEmployeeId
            })} 
            variant="contained" 
            color="primary"
            disabled={!selectedFile || !documentType || isUploading}
            startIcon={<UploadIcon />}
          >
            {isUploading ? 'Envoi en cours...' : 'Télécharger'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DocumentManagement; 