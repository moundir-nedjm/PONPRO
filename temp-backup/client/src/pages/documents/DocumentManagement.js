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
  Tooltip
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
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
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
  
  const fileInputRef = useRef(null);
  
  const isAdmin = currentUser.role === 'admin';
  const isChef = currentUser.role === 'chef';
  const isEmployee = currentUser.role === 'employee';
  
  const documentCategories = [
    { id: 'identity', label: 'Pièces d\'identité', icon: <BadgeIcon /> },
    { id: 'education', label: 'Diplômes et Formations', icon: <SchoolIcon /> },
    { id: 'professional', label: 'Documents Professionnels', icon: <WorkIcon /> },
    { id: 'health', label: 'Santé et Sécurité', icon: <HealthIcon /> },
    { id: 'other', label: 'Autres Documents', icon: <FileIcon /> },
  ];
  
  const documentTypes = {
    identity: [
      { id: 'national_id', label: 'Carte Nationale d\'Identité' },
      { id: 'passport', label: 'Passeport' },
      { id: 'residence_permit', label: 'Titre de Séjour' },
      { id: 'birth_certificate', label: 'Acte de Naissance' },
    ],
    education: [
      { id: 'diploma', label: 'Diplôme' },
      { id: 'certificate', label: 'Certificat' },
      { id: 'training', label: 'Formation' },
      { id: 'transcript', label: 'Relevé de Notes' },
    ],
    professional: [
      { id: 'resume', label: 'CV' },
      { id: 'contract', label: 'Contrat de Travail' },
      { id: 'reference', label: 'Lettre de Référence' },
      { id: 'evaluation', label: 'Évaluation Professionnelle' },
    ],
    health: [
      { id: 'medical_certificate', label: 'Certificat Médical' },
      { id: 'vaccination', label: 'Carnet de Vaccination' },
      { id: 'insurance', label: 'Assurance Santé' },
      { id: 'safety_training', label: 'Formation Sécurité' },
    ],
    other: [
      { id: 'other', label: 'Autre Document' },
    ],
  };

  // Mock document data with more examples
  const mockDocuments = [
    {
      id: '1',
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'national_id',
      category: 'identity',
      name: 'Carte Nationale d\'Identité',
      description: 'Carte d\'identité valide jusqu\'au 12/05/2027',
      fileUrl: 'https://example.com/document1.pdf',
      mimeType: 'application/pdf',
      uploadDate: '2023-11-15T10:30:00Z',
      status: 'verified',
      shared: false
    },
    {
      id: '2',
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'diploma',
      category: 'education',
      name: 'Diplôme d\'Ingénieur',
      description: 'Diplôme d\'ingénieur en informatique',
      fileUrl: 'https://example.com/document2.pdf',
      mimeType: 'application/pdf',
      uploadDate: '2023-10-05T14:45:00Z',
      status: 'verified',
      shared: true,
      sharedWithCount: 2,
      sharedDate: '2023-10-10T09:15:00Z'
    },
    {
      id: '3',
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'contract',
      category: 'professional',
      name: 'Contrat de Travail',
      description: 'Contrat de travail CDI',
      fileUrl: 'https://example.com/document3.pdf',
      mimeType: 'application/pdf',
      uploadDate: '2023-09-20T09:15:00Z',
      status: 'pending',
      shared: false
    },
    {
      id: '4',
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'medical_certificate',
      category: 'health',
      name: 'Certificat Médical',
      description: 'Certificat médical d\'aptitude au travail',
      fileUrl: 'https://example.com/document4.pdf',
      mimeType: 'application/pdf',
      uploadDate: '2023-08-12T11:20:00Z',
      status: 'verified',
      shared: false
    },
    {
      id: '5',
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'passport',
      category: 'identity',
      name: 'Passeport',
      description: 'Passeport valide jusqu\'au 05/03/2029',
      fileUrl: 'https://example.com/document5.pdf',
      mimeType: 'application/pdf',
      uploadDate: '2023-12-01T15:10:00Z',
      status: 'pending',
      shared: false
    },
    {
      id: '6',
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'training',
      category: 'education',
      name: 'Formation RGPD',
      description: 'Certificat de formation sur la protection des données',
      fileUrl: 'https://example.com/document6.pdf',
      mimeType: 'application/pdf',
      uploadDate: '2023-11-28T13:25:00Z',
      status: 'verified',
      shared: true,
      sharedWithCount: 5,
      sharedDate: '2023-12-05T10:30:00Z'
    },
    {
      id: '7',
      userId: currentUser.id,
      userName: currentUser.name,
      type: 'vaccination',
      category: 'health',
      name: 'Carnet de Vaccination',
      description: 'Certificat de vaccination COVID-19',
      fileUrl: 'https://example.com/document7.jpg',
      mimeType: 'image/jpeg',
      uploadDate: '2023-07-15T09:45:00Z',
      status: 'rejected',
      shared: false
    }
  ];
  
  // Mock team documents for chef
  const mockTeamDocuments = [
    {
      id: '101',
      userId: 'user123',
      userName: 'Jean Dupont',
      type: 'national_id',
      category: 'identity',
      name: 'Carte Nationale d\'Identité',
      description: 'Carte d\'identité valide jusqu\'au 03/12/2028',
      fileUrl: 'https://example.com/document101.pdf',
      mimeType: 'application/pdf',
      uploadDate: '2023-11-10T14:30:00Z',
      status: 'pending',
      shared: false
    },
    {
      id: '102',
      userId: 'user456',
      userName: 'Sophie Martin',
      type: 'diploma',
      category: 'education',
      name: 'Diplôme de Master',
      description: 'Master en gestion de projet',
      fileUrl: 'https://example.com/document102.pdf',
      mimeType: 'application/pdf',
      uploadDate: '2023-10-22T11:45:00Z',
      status: 'pending',
      shared: false
    },
    {
      id: '103',
      userId: 'user789',
      userName: 'Pierre Laurent',
      type: 'medical_certificate',
      category: 'health',
      name: 'Certificat Médical',
      description: 'Certificat médical annuel',
      fileUrl: 'https://example.com/document103.pdf',
      mimeType: 'application/pdf',
      uploadDate: '2023-12-05T09:20:00Z',
      status: 'pending',
      shared: false
    }
  ];

  useEffect(() => {
    // Load deleted document IDs from localStorage
    const storedDeletedIds = localStorage.getItem('deletedDocumentIds');
    if (storedDeletedIds) {
      setDeletedDocumentIds(JSON.parse(storedDeletedIds));
    }
    
    fetchDocuments();
    fetchTeamMembers();
  }, [currentUser]);
  
  useEffect(() => {
    // Apply filters and search
    filterDocuments();
  }, [documents, searchQuery, filterStatus, sortOption, viewingMode, teamDocuments]);
  
  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get authentication token
      const token = localStorage.getItem('token');
      
      // Get deleted document IDs from localStorage
      const storedDeletedIds = localStorage.getItem('deletedDocumentIds');
      const deletedIds = storedDeletedIds ? JSON.parse(storedDeletedIds) : [];
      
      if (!token) {
        // If no token, use mock data
        console.log('No authentication token found, using mock data');
        
        // Filter out deleted documents from mock data
        const filteredMockData = mockDocuments.filter(doc => 
          !deletedIds.includes(doc.id) && !deletedIds.includes(doc._id)
        );
        
        setDocuments(filteredMockData);
        setFilteredDocuments(filteredMockData);
        
        if (isAdmin || isChef) {
          // Also filter team documents
          const filteredTeamData = mockTeamDocuments.filter(doc => 
            !deletedIds.includes(doc.id) && !deletedIds.includes(doc._id)
          );
          setTeamDocuments(filteredTeamData);
        }
        return;
      }
      
      // Make API call to get documents based on user role
      const response = await fetch('/api/documents', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Filter out deleted documents from API response
      const filteredData = data.filter(doc => 
        !deletedIds.includes(doc.id) && !deletedIds.includes(doc._id)
      );
      
      setDocuments(filteredData);
      setFilteredDocuments(filteredData);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Erreur lors du chargement des documents. Utilisation des données de démonstration.');
      
      // Get deleted document IDs from localStorage
      const storedDeletedIds = localStorage.getItem('deletedDocumentIds');
      const deletedIds = storedDeletedIds ? JSON.parse(storedDeletedIds) : [];
      
      // Fall back to mock data and filter out deleted documents
      const filteredMockData = mockDocuments.filter(doc => 
        !deletedIds.includes(doc.id) && !deletedIds.includes(doc._id)
      );
      
      setDocuments(filteredMockData);
      setFilteredDocuments(filteredMockData);
      
      if (isAdmin || isChef) {
        // Also filter team documents
        const filteredTeamData = mockTeamDocuments.filter(doc => 
          !deletedIds.includes(doc.id) && !deletedIds.includes(doc._id)
        );
        setTeamDocuments(filteredTeamData);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Get team members if admin or chef
  const fetchTeamMembers = async () => {
    if (!isAdmin && !isChef) return;
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        // If no token, use mock data
        console.log('No authentication token found, using mock team data');
        setTeamDocuments(mockTeamDocuments);
        return;
      }
      
      const response = await fetch('/api/documents/team/members', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch team members: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setTeamDocuments(data);
    } catch (err) {
      console.error('Error fetching team members:', err);
      // Fall back to mock data
      setTeamDocuments(mockTeamDocuments);
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
      const response = await fetch(`/api/documents/${documentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update document status');
      }
      
      const updatedDocument = await response.json();
      
      // Update document in state
      setDocuments(documents.map(doc => 
        doc._id === documentId || doc.id === documentId ? updatedDocument : doc
      ));
      
      setSuccess(`Status du document mis à jour: ${newStatus}`);
    } catch (err) {
      console.error('Error updating document status:', err);
      setError('Erreur lors de la mise à jour du statut du document');
    }
  };
  
  const handleUploadDocument = async (documentData) => {
    try {
      setIsUploading(true);
      
      // Check if mock mode (no API)
      const token = localStorage.getItem('token');
      if (!token) {
        // Simulate successful upload with mock data
        console.log('Mocking document upload:', documentData);
        
        // Create a mock document
        const newDocument = {
          id: `mock-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.name,
          category: documentData.category,
          name: documentData.name,
          description: documentData.description || '',
          fileUrl: URL.createObjectURL(documentData.file),
          mimeType: documentData.file.type,
          size: documentData.file.size,
          uploadDate: new Date().toISOString(),
          status: 'pending',
          shared: false
        };
        
        // Add to state after a delay to simulate API call
        setTimeout(() => {
          setDocuments([newDocument, ...documents]);
          setSuccess('Document téléchargé avec succès (mode démo)');
          setUploadDialogOpen(false);
          setIsUploading(false);
        }, 1500);
        
        return;
      }
      
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
      
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Failed to upload document: ${response.status} ${response.statusText}`);
      }
      
      // Add new document to state
      const newDocument = await response.json();
      setDocuments([newDocument, ...documents]);
      setSuccess('Document téléchargé avec succès');
      setUploadDialogOpen(false);
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Erreur lors du téléchargement du document. Veuillez réessayer.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDeleteDocument = async (documentId) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
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
              boxShadow: 1
            }}
          >
            <ListItemIcon>
              {getDocumentIcon(doc.mimeType)}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1">{doc.name}</Typography>
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
                  <Typography variant="body2" color="text.secondary">
                    {doc.description || "Aucune description"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Uploadé le {new Date(doc.uploadDate).toLocaleDateString()}
                  </Typography>
                </Box>
              }
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
              {getStatusChip(doc.status)}
              {doc.shared && (
                <Chip label="Partagé" color="primary" size="small" icon={<ShareIcon fontSize="small" />} variant="outlined" />
              )}
            </Box>
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="more"
                onClick={(e) => handleMenuOpen(e, doc)}
              >
                <MoreIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    );
  };
  
  const handleViewingModeChange = (event) => {
    setViewingMode(event.target.value);
  };
  
  if (loading && documents.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <DescriptionIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
          <Typography variant="h5" component="h1">
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
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
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
          <Grid item xs={12} sm={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Box sx={{ mr: 1 }}>
              <Tooltip title="Vue liste">
                <IconButton 
                  color={viewMode === 'list' ? 'primary' : 'default'} 
                  onClick={() => handleViewModeChange('list')}
                >
                  <DescriptionIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Vue tableau de bord">
                <IconButton 
                  color={viewMode === 'dashboard' ? 'primary' : 'default'} 
                  onClick={() => handleViewModeChange('dashboard')}
                >
                  <DashboardIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<UploadIcon />}
              onClick={handleOpenUploadDialog}
              disabled={viewingMode !== 'personal' && viewingMode !== 'all'}
            >
              Ajouter un Document
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
            >
              {documentCategories.map(category => (
                <Box key={category.id}>
                  <MenuItem disabled sx={{ opacity: 0.7, fontWeight: 'bold' }}>
                    {category.label}
                  </MenuItem>
                  {documentTypes[category.id].map(type => (
                    <MenuItem key={type.id} value={type.id} sx={{ pl: 4 }}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Box>
              ))}
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
              category: documentType 
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