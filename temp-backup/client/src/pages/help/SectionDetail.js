import React from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Breadcrumbs,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Button,
  useTheme,
  alpha,
  Card,
  CardContent,
  CardActionArea
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Help as HelpIcon,
  Article as ArticleIcon,
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
  Fingerprint as FingerprintIcon,
  BarChart as BarChartIcon,
  School as SchoolIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';

// Section data
const helpSections = {
  'getting-started': {
    title: 'Démarrage',
    icon: <HelpIcon color="primary" />,
    description: 'Guides pour commencer avec POINPRO et comprendre les fonctionnalités de base.',
    articles: [
      { id: 'introduction', title: 'Introduction à POINPRO', level: 'Débutant', lastUpdated: '2023-10-15' },
      { id: 'first-login', title: 'Premier connexion', level: 'Débutant', lastUpdated: '2023-11-20' },
      { id: 'interface-overview', title: "Vue d'ensemble de l'interface", level: 'Débutant', lastUpdated: '2023-09-05' },
      { id: 'navigation', title: 'Navigation dans le système', level: 'Débutant', lastUpdated: '2023-09-10' }
    ]
  },
  'attendance': {
    title: 'Pointage & Présence',
    icon: <AccessTimeIcon color="primary" />,
    description: 'Guides pour la gestion des pointages quotidiens et le suivi de présence.',
    articles: [
      { id: 'daily-attendance', title: 'Pointage du jour', level: 'Débutant', lastUpdated: '2023-12-01' },
      { id: 'check-in', title: 'Comment pointer', level: 'Débutant', lastUpdated: '2023-11-05' },
      { id: 'biometric-attendance', title: 'Pointage biométrique', level: 'Intermédiaire', lastUpdated: '2023-10-20' },
      { id: 'attendance-codes', title: 'Codes de pointage', level: 'Intermédiaire', lastUpdated: '2023-09-15' },
      { id: 'monthly-sheet', title: 'Feuille mensuelle', level: 'Avancé', lastUpdated: '2023-08-30' }
    ]
  },
  'employees': {
    title: 'Gestion des Employés',
    icon: <PeopleIcon color="primary" />,
    description: 'Guides pour gérer les profils employés, les départements et les horaires.',
    articles: [
      { id: 'adding-employees', title: 'Ajouter des employés', level: 'Intermédiaire', lastUpdated: '2023-11-10' },
      { id: 'employee-profile', title: "Profil d'employé", level: 'Débutant', lastUpdated: '2023-10-25' },
      { id: 'scheduling', title: 'Planification des horaires', level: 'Avancé', lastUpdated: '2023-09-20' },
      { id: 'departments', title: 'Gestion des départements', level: 'Avancé', lastUpdated: '2023-08-15' }
    ]
  },
  'documents': {
    title: 'Gestion des Renseignements',
    icon: <DescriptionIcon color="primary" />,
    description: 'Guides pour gérer les documents et fichiers dans le système.',
    articles: [
      { id: 'document-upload', title: 'Télécharger des documents', level: 'Débutant', lastUpdated: '2023-11-15' },
      { id: 'document-types', title: 'Types de documents', level: 'Intermédiaire', lastUpdated: '2023-10-10' },
      { id: 'sharing-documents', title: 'Partage de documents', level: 'Intermédiaire', lastUpdated: '2023-09-25' }
    ]
  },
  'reports': {
    title: 'Rapports & Analyses',
    icon: <BarChartIcon color="primary" />,
    description: 'Guides pour générer et interpréter les rapports et analyses du système.',
    articles: [
      { id: 'attendance-reports', title: 'Rapports de présence', level: 'Intermédiaire', lastUpdated: '2023-11-25' },
      { id: 'custom-reports', title: 'Rapports personnalisés', level: 'Avancé', lastUpdated: '2023-10-30' },
      { id: 'exporting-data', title: 'Exporter des données', level: 'Intermédiaire', lastUpdated: '2023-10-05' },
      { id: 'data-visualization', title: 'Visualisation des données', level: 'Avancé', lastUpdated: '2023-09-30' }
    ]
  },
  'settings': {
    title: 'Paramètres',
    icon: <SettingsIcon color="primary" />,
    description: 'Guides pour configurer le système selon vos besoins.',
    articles: [
      { id: 'user-settings', title: 'Paramètres utilisateur', level: 'Débutant', lastUpdated: '2023-11-30' },
      { id: 'system-settings', title: 'Paramètres système', level: 'Avancé', lastUpdated: '2023-11-05' },
      { id: 'access-management', title: 'Gestion des accès', level: 'Avancé', lastUpdated: '2023-10-15' },
      { id: 'biometrics-setup', title: 'Configuration biométrique', level: 'Intermédiaire', lastUpdated: '2023-09-25' }
    ]
  },
  'for-admin': {
    title: 'Pour Administrateurs',
    icon: <FingerprintIcon color="primary" />,
    description: 'Guides spécifiques pour les administrateurs du système.',
    articles: [
      { id: 'admin-dashboard', title: "Tableau de bord d'administration", level: 'Avancé', lastUpdated: '2023-12-05' },
      { id: 'user-roles', title: "Gestion des rôles d'utilisateurs", level: 'Avancé', lastUpdated: '2023-11-20' },
      { id: 'system-backup', title: 'Sauvegarde du système', level: 'Avancé', lastUpdated: '2023-10-25' },
      { id: 'security-best-practices', title: 'Meilleures pratiques de sécurité', level: 'Avancé', lastUpdated: '2023-09-30' }
    ]
  }
};

const LevelChip = ({ level }) => {
  const theme = useTheme();
  let color;
  let icon;
  
  switch(level) {
    case 'Débutant':
      color = 'success';
      icon = 1;
      break;
    case 'Intermédiaire':
      color = 'primary';
      icon = 2;
      break;
    case 'Avancé':
      color = 'secondary';
      icon = 3;
      break;
    default:
      color = 'default';
      icon = 1;
  }
  
  return (
    <Chip 
      label={level} 
      size="small" 
      color={color} 
      icon={<Box component="span">{icon}</Box>}
      variant="outlined"
      sx={{ 
        borderRadius: 1,
        '& .MuiChip-label': { fontWeight: 'medium' }
      }}
    />
  );
};

const SectionDetail = () => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Get section data
  const section = helpSections[sectionId];
  
  if (!section) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" color="error">Section non trouvée</Typography>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/help')}
            sx={{ mt: 2 }}
          >
            Retour à l'aide
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" color="inherit">
          Accueil
        </Link>
        <Link component={RouterLink} to="/help" color="inherit">
          Aide
        </Link>
        <Typography color="text.primary">{section.title}</Typography>
      </Breadcrumbs>
      
      {/* Section Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2,
          background: `linear-gradient(120deg, ${alpha(theme.palette.primary.light, 0.12)}, ${alpha(theme.palette.background.default, 0)})`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Box 
              sx={{ 
                p: 1.5, 
                borderRadius: 2, 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {section.icon}
            </Box>
          </Grid>
          <Grid item xs>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {section.title}
              </Typography>
              <Button 
                startIcon={<ArrowBackIcon />} 
                onClick={() => navigate('/help')}
                variant="outlined"
                size="small"
                sx={{ mt: -1 }}
              >
                Retour
              </Button>
            </Box>
            <Typography variant="body1" paragraph>
              {section.description}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {section.articles.length} articles dans cette section
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Filter and Sort Options */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3
        }}
      >
        <Typography variant="h5">
          Articles
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            size="small" 
            startIcon={<FilterListIcon />}
            variant="outlined"
          >
            Filtrer
          </Button>
          <Button 
            size="small"
            startIcon={<SchoolIcon />}
            variant="outlined"
          >
            Niveau
          </Button>
        </Box>
      </Box>
      
      {/* Articles List */}
      <Grid container spacing={2}>
        {section.articles.map((article) => (
          <Grid item xs={12} sm={6} md={4} key={article.id}>
            <Card 
              elevation={0} 
              sx={{ 
                height: '100%',
                border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                borderRadius: 2,
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.08)}`,
                  transform: 'translateY(-4px)',
                  borderColor: alpha(theme.palette.primary.main, 0.3)
                }
              }}
            >
              <CardActionArea 
                sx={{ height: '100%' }}
                onClick={() => navigate(`/help/article/${sectionId}/${article.id}`)}
              >
                <CardContent sx={{ height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
                    <ArticleIcon color="primary" />
                    <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
                      {article.title}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <LevelChip level={article.level} />
                    <Typography variant="caption" color="text.secondary">
                      Mis à jour: {article.lastUpdated}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Additional Resources */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mt: 4, 
          borderRadius: 2, 
          bgcolor: alpha(theme.palette.info.light, 0.1),
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
        }}
      >
        <Typography variant="h6" gutterBottom>
          Ressources connexes sur {section.title}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <List dense disablePadding>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ArticleIcon fontSize="small" color="info" />
                </ListItemIcon>
                <ListItemText 
                  primary="Documents téléchargeables" 
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} sm={4}>
            <List dense disablePadding>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ArticleIcon fontSize="small" color="info" />
                </ListItemIcon>
                <ListItemText 
                  primary="Vidéos de formation" 
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} sm={4}>
            <List dense disablePadding>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ArticleIcon fontSize="small" color="info" />
                </ListItemIcon>
                <ListItemText 
                  primary="Foire aux questions" 
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default SectionDetail; 