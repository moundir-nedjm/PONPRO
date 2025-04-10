const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// Mock document data
const mockDocuments = [
  {
    id: '1',
    userId: 'user123',
    userName: 'Employe Test',
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
    userId: 'user123',
    userName: 'Employe Test',
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
    userId: 'user123',
    userName: 'Employe Test',
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
    userId: 'user123',
    userName: 'Employe Test',
    category: 'health',
    name: 'Certificat Médical',
    description: 'Certificat médical d\'aptitude au travail',
    fileUrl: 'https://example.com/document4.pdf',
    mimeType: 'application/pdf',
    uploadDate: '2023-08-12T11:20:00Z',
    status: 'verified',
    shared: false
  }
];

// Mock shared documents
const mockSharedDocuments = [
  {
    id: '101',
    documentId: '1',
    documentName: 'Carte Nationale d\'Identité',
    documentType: 'national_id',
    documentUrl: 'https://example.com/document1.pdf',
    mimeType: 'application/pdf',
    sharedBy: {
      id: 'user456',
      name: 'Marie Dupont'
    },
    sharedWith: {
      id: 'user123',
      name: 'Employe Test'
    },
    sharedDate: '2023-12-10T09:30:00Z',
    message: 'Voici ma CNI pour le dossier administratif.'
  }
];

// Mock document history
const mockDocumentHistory = [
  {
    id: '1001',
    documentId: '1',
    action: 'upload',
    status: 'pending',
    timestamp: '2023-11-15T10:30:00Z',
    user: 'Employe Test',
    details: 'Document ajouté au système'
  },
  {
    id: '1002',
    documentId: '1',
    action: 'status_change',
    status: 'verified',
    timestamp: '2023-11-17T14:45:00Z',
    user: 'Admin User',
    details: 'Document vérifié par l\'administrateur'
  }
];

// Mock users
const mockUsers = [
  {
    id: 'user123',
    name: 'Employe Test',
    email: 'employe@example.com',
    role: 'employee'
  },
  {
    id: 'user456',
    name: 'Marie Dupont',
    email: 'marie.dupont@example.com',
    role: 'manager'
  },
  {
    id: 'user789',
    name: 'Thomas Martin',
    email: 'thomas.martin@example.com',
    role: 'chef'
  }
];

// GET /api/documents - Get all documents for the current user
router.get('/', verifyToken, (req, res) => {
  const userDocuments = mockDocuments.filter(doc => doc.userId === req.user.id);
  
  res.status(200).json({
    success: true,
    data: userDocuments
  });
});

// GET /api/documents/team - Get team documents (for admin/chef)
router.get('/team', verifyToken, (req, res) => {
  // In a real app, would filter by team/department
  // Using limited data for now
  const teamDocuments = mockDocuments.filter(doc => doc.userId !== req.user.id);
  
  res.status(200).json({
    success: true,
    data: teamDocuments
  });
});

// GET /api/documents/:id - Get a specific document
router.get('/:id', verifyToken, (req, res) => {
  const document = mockDocuments.find(doc => doc.id === req.params.id);
  
  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document non trouvé'
    });
  }
  
  res.status(200).json({
    success: true,
    data: document
  });
});

// GET /api/documents/:id/history - Get document history
router.get('/:id/history', verifyToken, (req, res) => {
  const history = mockDocumentHistory.filter(item => item.documentId === req.params.id);
  
  res.status(200).json({
    success: true,
    data: history
  });
});

// POST /api/documents - Upload a new document
router.post('/', verifyToken, (req, res) => {
  // In a real app, would handle file upload
  const newDocument = {
    id: `doc-${Date.now()}`,
    userId: req.user.id,
    userName: req.user.name,
    category: req.body.category || 'other',
    name: req.body.name || 'Document sans nom',
    description: req.body.description || '',
    fileUrl: 'https://example.com/new-document.pdf',
    mimeType: 'application/pdf',
    uploadDate: new Date().toISOString(),
    status: 'pending',
    shared: false
  };
  
  // In a real app, would save to database
  mockDocuments.push(newDocument);
  
  res.status(201).json({
    success: true,
    data: newDocument
  });
});

// PATCH /api/documents/:id/status - Update document status
router.patch('/:id/status', verifyToken, (req, res) => {
  const documentIndex = mockDocuments.findIndex(doc => doc.id === req.params.id);
  
  if (documentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Document non trouvé'
    });
  }
  
  // Update the status
  mockDocuments[documentIndex].status = req.body.status;
  
  res.status(200).json({
    success: true,
    data: mockDocuments[documentIndex]
  });
});

// POST /api/documents/share - Share a document
router.post('/share', verifyToken, (req, res) => {
  const { documentId, userId, message } = req.body;
  
  const document = mockDocuments.find(doc => doc.id === documentId);
  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document non trouvé'
    });
  }
  
  const user = mockUsers.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Utilisateur non trouvé'
    });
  }
  
  // Create a new shared document entry
  const newSharedDocument = {
    id: `share-${Date.now()}`,
    documentId,
    documentName: document.name,
    documentType: document.category,
    documentUrl: document.fileUrl,
    mimeType: document.mimeType,
    sharedBy: {
      id: req.user.id,
      name: req.user.name
    },
    sharedWith: {
      id: user.id,
      name: user.name
    },
    sharedDate: new Date().toISOString(),
    message: message || ''
  };
  
  // Update the original document shared status
  document.shared = true;
  document.sharedWithCount = (document.sharedWithCount || 0) + 1;
  document.sharedDate = new Date().toISOString();
  
  // In a real app, would save to database
  mockSharedDocuments.push(newSharedDocument);
  
  res.status(201).json({
    success: true,
    data: newSharedDocument
  });
});

// GET /api/users/:id/shared-documents - Get documents shared with the user
router.get('/users/:id/shared-documents', verifyToken, (req, res) => {
  // Ensure user can only access their own shared documents
  if (req.params.id !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Accès non autorisé'
    });
  }
  
  const sharedDocuments = mockSharedDocuments.filter(doc => 
    doc.sharedWith.id === req.params.id
  );
  
  res.status(200).json({
    success: true,
    data: sharedDocuments
  });
});

// GET /api/users - Get all users
router.get('/users', verifyToken, (req, res) => {
  // In a real app, would filter based on permissions
  res.status(200).json({
    success: true,
    data: mockUsers
  });
});

// DELETE /api/documents/:id - Delete a document
router.delete('/:id', verifyToken, (req, res) => {
  const documentIndex = mockDocuments.findIndex(doc => doc.id === req.params.id);
  
  if (documentIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Document non trouvé'
    });
  }
  
  // Ensure user can only delete their own documents (except admin)
  if (mockDocuments[documentIndex].userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Accès non autorisé'
    });
  }
  
  // In a real app, would remove from database
  mockDocuments.splice(documentIndex, 1);
  
  res.status(200).json({
    success: true,
    message: 'Document supprimé avec succès'
  });
});

module.exports = router; 