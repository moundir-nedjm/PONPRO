import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Divider,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress
} from '@mui/material';
import {
  InsertChart as ChartIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  Folder as FolderIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Badge as BadgeIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  HealthAndSafety as HealthIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';

const DocumentAnalytics = ({ documents = [] }) => {
  // Calculate document statistics
  const totalDocuments = documents.length;
  
  const documentsByCategory = documents.reduce((acc, doc) => {
    const category = doc.category || 'other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  
  const documentsByStatus = documents.reduce((acc, doc) => {
    const status = doc.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  
  const verifiedCount = documentsByStatus.verified || 0;
  const pendingCount = documentsByStatus.pending || 0;
  const rejectedCount = documentsByStatus.rejected || 0;
  
  const verificationRate = totalDocuments > 0 ? (verifiedCount / totalDocuments) * 100 : 0;
  
  // Get upload frequency by month
  const uploadsByMonth = documents.reduce((acc, doc) => {
    const date = new Date(doc.uploadDate);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    acc[monthYear] = (acc[monthYear] || 0) + 1;
    return acc;
  }, {});
  
  // Sort months chronologically
  const sortedMonths = Object.keys(uploadsByMonth).sort((a, b) => {
    const [monthA, yearA] = a.split('/').map(Number);
    const [monthB, yearB] = b.split('/').map(Number);
    return yearA !== yearB ? yearA - yearB : monthA - monthB;
  });
  
  // Get most recent months (up to 6)
  const recentMonths = sortedMonths.slice(-6);
  
  // Format month names
  const formatMonth = (monthStr) => {
    const [month, year] = monthStr.split('/').map(Number);
    return new Date(year, month - 1).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  };
  
  // Category icons mapping
  const categoryIcons = {
    identity: <BadgeIcon />,
    education: <SchoolIcon />,
    professional: <WorkIcon />,
    health: <HealthIcon />,
    other: <FileIcon />
  };
  
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <ChartIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
        <Typography variant="h6">
          Statistiques des Documents
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        {/* Document Status Summary */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AssessmentIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight={600}>
                Statut des Documents
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2">Documents Vérifiés</Typography>
                <Chip 
                  label={`${verifiedCount} (${Math.round(verifiedCount / totalDocuments * 100) || 0}%)`} 
                  size="small" 
                  color="success" 
                  icon={<CheckCircleIcon />}
                />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={verifiedCount / totalDocuments * 100 || 0} 
                color="success"
                sx={{ height: 8, borderRadius: 1, mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2">Documents En Attente</Typography>
                <Chip 
                  label={`${pendingCount} (${Math.round(pendingCount / totalDocuments * 100) || 0}%)`} 
                  size="small" 
                  color="warning" 
                  icon={<PendingIcon />}
                />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={pendingCount / totalDocuments * 100 || 0} 
                color="warning"
                sx={{ height: 8, borderRadius: 1, mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2">Documents Rejetés</Typography>
                <Chip 
                  label={`${rejectedCount} (${Math.round(rejectedCount / totalDocuments * 100) || 0}%)`} 
                  size="small" 
                  color="error" 
                  icon={<CancelIcon />}
                />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={rejectedCount / totalDocuments * 100 || 0} 
                color="error"
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3 }}>
              <Box sx={{ 
                position: 'relative', 
                display: 'inline-flex',
                width: 120,
                height: 120
              }}>
                <CircularProgressWithLabel value={verificationRate} />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption" component="div" color="text.secondary">
                    Taux de vérification
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Documents by Category */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PieChartIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight={600}>
                Documents par Catégorie
              </Typography>
            </Box>
            
            <List dense>
              {Object.entries(documentsByCategory).map(([category, count]) => (
                <ListItem key={category} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {categoryIcons[category] || <FolderIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={getCategoryLabel(category)}
                    secondary={`${count} document${count > 1 ? 's' : ''}`}
                  />
                  <Box sx={{ width: '40%' }}>
                    <LinearProgress
                      variant="determinate"
                      value={count / totalDocuments * 100}
                      sx={{ 
                        height: 6, 
                        borderRadius: 1,
                        bgcolor: 'background.default'
                      }}
                      color={getCategoryColor(category)}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2, minWidth: 40, textAlign: 'right' }}>
                    {Math.round(count / totalDocuments * 100)}%
                  </Typography>
                </ListItem>
              ))}
            </List>
            
            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Total: {totalDocuments} document{totalDocuments !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        {/* Upload Trends */}
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TimelineIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight={600}>
                Tendances d'Upload
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 150, mt: 3, mb: 1 }}>
              {recentMonths.map(month => {
                const count = uploadsByMonth[month];
                const maxUploads = Math.max(...Object.values(uploadsByMonth));
                const percentage = maxUploads > 0 ? (count / maxUploads) * 100 : 0;
                
                return (
                  <Box 
                    key={month} 
                    sx={{ 
                      flex: 1,
                      mx: 0.5,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}
                  >
                    <Typography variant="caption">{count}</Typography>
                    <Box 
                      sx={{ 
                        width: 30, 
                        height: `${percentage}%`, 
                        bgcolor: 'primary.main',
                        borderRadius: '4px 4px 0 0',
                        minHeight: 4,
                        transition: 'height 0.3s ease'
                      }} 
                    />
                    <Typography variant="caption" sx={{ mt: 1, fontSize: '0.7rem', textAlign: 'center' }}>
                      {formatMonth(month)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {recentMonths.length === 0 ? (
                  "Aucune donnée d'upload disponible"
                ) : (
                  `${Object.values(uploadsByMonth).reduce((a, b) => a + b, 0)} documents uploadés au total`
                )}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

// Helper component for circular progress
const CircularProgressWithLabel = ({ value }) => {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <Box
        sx={{
          width: 120,
          height: 120,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h5" component="div" color="primary">
          {`${Math.round(value)}%`}
        </Typography>
      </Box>
      <CircularProgress 
        variant="determinate" 
        value={100} 
        size={120} 
        thickness={4} 
        sx={{ color: theme => theme.palette.grey[200] }} 
      />
      <CircularProgress 
        variant="determinate" 
        value={value} 
        size={120} 
        thickness={4} 
        color="primary" 
        sx={{ 
          position: 'absolute',
          left: 0,
        }} 
      />
    </Box>
  );
};

// Helper function to get category label
const getCategoryLabel = (category) => {
  const labels = {
    identity: 'Pièces d\'identité',
    education: 'Diplômes et Formations',
    professional: 'Documents Professionnels',
    health: 'Santé et Sécurité',
    other: 'Autres Documents'
  };
  
  return labels[category] || 'Autre';
};

// Helper function to get category color
const getCategoryColor = (category) => {
  const colors = {
    identity: 'primary',
    education: 'secondary',
    professional: 'info',
    health: 'success',
    other: 'warning'
  };
  
  return colors[category] || 'primary';
};

export default DocumentAnalytics; 