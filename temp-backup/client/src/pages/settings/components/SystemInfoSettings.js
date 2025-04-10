import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  alpha,
  useTheme,
  Stack,
  LinearProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Info as InfoIcon,
  Refresh as RefreshIcon,
  DownloadForOffline as DownloadIcon,
  DeleteForever as DeleteIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Cloud as CloudIcon,
  CloudUpload as CloudUploadIcon,
  DataUsage as DataUsageIcon,
  CreditCard as CreditCardIcon,
  Devices as DevicesIcon,
  SaveAlt as SaveAltIcon,
  Update as UpdateIcon,
  Code as CodeIcon,
  Cached as CachedIcon
} from '@mui/icons-material';
import { useSettings } from '../../../context/SettingsContext';

// Mock system data
const systemInfo = {
  version: '2.5.0',
  releaseDate: '15/06/2023',
  lastUpdate: '10/07/2023',
  environment: 'Production',
  database: 'MongoDB 5.0.14',
  server: 'Node.js 18.15.0',
  license: 'Enterprise',
  licenseExpiration: '31/12/2023',
  uptime: '15 jours, 7 heures',
  activeUsers: 58,
  totalEmployees: 120,
  totalDepartments: 8,
  storage: {
    total: 20, // GB
    used: 4.7, // GB
    available: 15.3 // GB
  },
  memory: {
    total: 8, // GB
    used: 3.8, // GB
    available: 4.2 // GB
  },
  services: [
    { name: 'API Service', status: 'operational', performance: 95 },
    { name: 'Database Service', status: 'operational', performance: 92 },
    { name: 'Biometric Service', status: 'operational', performance: 98 },
    { name: 'Email Service', status: 'warning', performance: 78 },
    { name: 'SMS Service', status: 'operational', performance: 90 },
    { name: 'Backup Service', status: 'operational', performance: 100 }
  ],
  recentUpdates: [
    { version: '2.5.0', date: '15/06/2023', type: 'feature', description: 'Ajout du module de rapports avancés et optimisation des performances' },
    { version: '2.4.2', date: '01/05/2023', type: 'bugfix', description: 'Correction des problèmes de synchronisation de données' },
    { version: '2.4.1', date: '15/04/2023', type: 'security', description: 'Mise à jour de sécurité pour la gestion des authentifications' },
    { version: '2.4.0', date: '01/03/2023', type: 'feature', description: 'Nouveau module de gestion des congés' }
  ]
};

const getStatusColor = (status) => {
  switch (status) {
    case 'operational':
      return 'success';
    case 'warning':
      return 'warning';
    case 'down':
      return 'error';
    default:
      return 'default';
  }
};

const getPerformanceColor = (performance) => {
  if (performance >= 90) return '#4caf50';
  if (performance >= 70) return '#ff9800';
  return '#f44336';
};

const getUpdateTypeColor = (type) => {
  switch (type) {
    case 'feature':
      return 'primary';
    case 'bugfix':
      return 'warning';
    case 'security':
      return 'error';
    default:
      return 'default';
  }
};

const SystemInfoSettings = () => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmBackupDialog, setConfirmBackupDialog] = useState(false);
  const [confirmRestoreDialog, setConfirmRestoreDialog] = useState(false);
  const [confirmClearCacheDialog, setConfirmClearCacheDialog] = useState(false);
  const { showStatus } = useSettings();
  
  const handleRefreshStatus = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      showStatus('État du système mis à jour', 'success');
    }, 1500);
  };
  
  const handleBackup = () => {
    setConfirmBackupDialog(false);
    showStatus('Sauvegarde du système en cours. Vous recevrez une notification une fois terminée.', 'info');
  };
  
  const handleRestore = () => {
    setConfirmRestoreDialog(false);
    showStatus('Restauration du système en cours. Cette opération peut prendre plusieurs minutes.', 'info');
  };
  
  const handleClearCache = () => {
    setConfirmClearCacheDialog(false);
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      showStatus('Cache du système effacé avec succès', 'success');
    }, 1500);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'medium' }}>
        Informations Système
      </Typography>
      
      {isLoading && (
        <LinearProgress sx={{ mb: 3 }} />
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InfoIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Informations Générales
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Button 
                  startIcon={<RefreshIcon />} 
                  size="small" 
                  onClick={handleRefreshStatus}
                  disabled={isLoading}
                >
                  Actualiser
                </Button>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <List dense disablePadding>
                    <ListItem>
                      <ListItemText 
                        primary="Version" 
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {systemInfo.version}
                            <Chip 
                              label="Dernière version" 
                              size="small" 
                              color="success" 
                              sx={{ ml: 1, height: 20 }} 
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Date de sortie" secondary={systemInfo.releaseDate} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Dernière mise à jour" secondary={systemInfo.lastUpdate} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Environnement" secondary={systemInfo.environment} />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <List dense disablePadding>
                    <ListItem>
                      <ListItemText primary="Base de données" secondary={systemInfo.database} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Serveur" secondary={systemInfo.server} />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Licence" 
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {`${systemInfo.license} (expire: ${systemInfo.licenseExpiration})`}
                          </Box>
                        } 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Temps de fonctionnement" secondary={systemInfo.uptime} />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <DataUsageIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">
                  Statistiques d'Utilisation
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      textAlign: 'center',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="h5" color="primary.main" fontWeight="medium">
                      {systemInfo.activeUsers}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Utilisateurs actifs
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      textAlign: 'center',
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="h5" color="secondary.main" fontWeight="medium">
                      {systemInfo.totalEmployees}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Employés
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      textAlign: 'center',
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="h5" color="success.main" fontWeight="medium">
                      {systemInfo.totalDepartments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Départements
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <UpdateIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Historique des Mises à Jour
                </Typography>
              </Box>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Version</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Description</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {systemInfo.recentUpdates.map((update, index) => (
                      <TableRow key={index}>
                        <TableCell>{update.version}</TableCell>
                        <TableCell>{update.date}</TableCell>
                        <TableCell>
                          <Chip 
                            label={update.type.charAt(0).toUpperCase() + update.type.slice(1)} 
                            size="small" 
                            color={getUpdateTypeColor(update.type)} 
                          />
                        </TableCell>
                        <TableCell>{update.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SpeedIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  État du Système
                </Typography>
              </Box>
              
              <List>
                {systemInfo.services.map((service, index) => (
                  <ListItem key={index} dense>
                    <ListItemIcon>
                      {service.status === 'operational' ? (
                        <CheckCircleIcon color="success" />
                      ) : service.status === 'warning' ? (
                        <WarningIcon color="warning" />
                      ) : (
                        <ErrorIcon color="error" />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={service.name} 
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">
                              Performance
                            </Typography>
                            <Typography variant="caption">
                              {service.performance}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={service.performance} 
                            sx={{ 
                              height: 6, 
                              borderRadius: 3,
                              bgcolor: alpha(theme.palette.grey[500], 0.2),
                              '& .MuiLinearProgress-bar': {
                                bgcolor: getPerformanceColor(service.performance)
                              }
                            }}
                          />
                        </Box>
                      }
                    />
                    <Chip 
                      label={service.status === 'operational' ? 'Opérationnel' : service.status === 'warning' ? 'Avertissement' : 'Arrêté'} 
                      size="small" 
                      color={getStatusColor(service.status)} 
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
          
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StorageIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Ressources Système
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">
                    Espace Disque
                  </Typography>
                  <Typography variant="body2">
                    {systemInfo.storage.used} Go / {systemInfo.storage.total} Go
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(systemInfo.storage.used / systemInfo.storage.total) * 100} 
                  sx={{ 
                    height: 10, 
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {systemInfo.storage.available} Go disponibles
                </Typography>
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">
                    Mémoire
                  </Typography>
                  <Typography variant="body2">
                    {systemInfo.memory.used} Go / {systemInfo.memory.total} Go
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(systemInfo.memory.used / systemInfo.memory.total) * 100} 
                  sx={{ 
                    height: 10, 
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      bgcolor: theme.palette.secondary.main
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {systemInfo.memory.available} Go disponibles
                </Typography>
              </Box>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CloudIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Maintenance
                </Typography>
              </Box>
              
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  onClick={() => setConfirmBackupDialog(true)}
                >
                  Sauvegarder le Système
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<SaveAltIcon />}
                  fullWidth
                  onClick={() => setConfirmRestoreDialog(true)}
                >
                  Restaurer le Système
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<CachedIcon />}
                  fullWidth
                  onClick={() => setConfirmClearCacheDialog(true)}
                >
                  Vider le Cache
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Confirm Backup Dialog */}
      <Dialog
        open={confirmBackupDialog}
        onClose={() => setConfirmBackupDialog(false)}
      >
        <DialogTitle>Confirmer la sauvegarde</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Voulez-vous vraiment créer une sauvegarde complète du système? Cette opération peut prendre plusieurs minutes et pourrait affecter les performances du système.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmBackupDialog(false)}>Annuler</Button>
          <Button onClick={handleBackup} color="primary" variant="contained">
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirm Restore Dialog */}
      <Dialog
        open={confirmRestoreDialog}
        onClose={() => setConfirmRestoreDialog(false)}
      >
        <DialogTitle>Confirmer la restauration</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Attention! La restauration du système va remplacer toutes les données actuelles par celles de la sauvegarde. Cette opération est irréversible.
          </DialogContentText>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Toutes les sessions utilisateurs seront déconnectées et le système sera temporairement indisponible pendant la restauration.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRestoreDialog(false)}>Annuler</Button>
          <Button onClick={handleRestore} color="error" variant="contained">
            Restaurer
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirm Clear Cache Dialog */}
      <Dialog
        open={confirmClearCacheDialog}
        onClose={() => setConfirmClearCacheDialog(false)}
      >
        <DialogTitle>Confirmer la suppression du cache</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Voulez-vous vraiment vider le cache du système? Cette opération peut améliorer les performances mais peut entraîner un ralentissement temporaire pendant que le cache se reconstruit.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClearCacheDialog(false)}>Annuler</Button>
          <Button onClick={handleClearCache} color="primary" variant="contained">
            Vider le Cache
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SystemInfoSettings; 