import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardMedia,
  Breadcrumbs,
  Link,
  Chip,
  IconButton,
  Tabs,
  Tab,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  Help as HelpIcon,
  AccessTime as AccessTimeIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
  Fingerprint as FingerprintIcon,
  BarChart as BarChartIcon,
  Bookmark as BookmarkIcon,
  VideoLibrary as VideoLibraryIcon,
  Article as ArticleIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Star as StarIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Help content sections
const helpSections = [
  {
    id: 'getting-started',
    title: 'Démarrage',
    icon: <HelpIcon color="primary" />,
    description: 'Commencer avec POINPRO',
    articles: [
      { id: 'introduction', title: 'Introduction à POINPRO', level: 'Débutant' },
      { id: 'first-login', title: 'Premier connexion', level: 'Débutant' },
      { id: 'interface-overview', title: "Vue d'ensemble de l'interface", level: 'Débutant' },
      { id: 'navigation', title: 'Navigation dans le système', level: 'Débutant' }
    ]
  },
  {
    id: 'attendance',
    title: 'Pointage & Présence',
    icon: <AccessTimeIcon color="primary" />,
    description: 'Gestion des pointages et présences',
    articles: [
      { id: 'daily-attendance', title: 'Pointage du jour', level: 'Débutant' },
      { id: 'check-in', title: 'Comment pointer', level: 'Débutant' },
      { id: 'biometric-attendance', title: 'Pointage biométrique', level: 'Intermédiaire' },
      { id: 'attendance-codes', title: 'Codes de pointage', level: 'Intermédiaire' },
      { id: 'monthly-sheet', title: 'Feuille mensuelle', level: 'Avancé' }
    ]
  },
  {
    id: 'employees',
    title: 'Gestion des Employés',
    icon: <PeopleIcon color="primary" />,
    description: 'Administration des employés',
    articles: [
      { id: 'adding-employees', title: 'Ajouter des employés', level: 'Intermédiaire' },
      { id: 'employee-profile', title: "Profil d'employé", level: 'Débutant' },
      { id: 'scheduling', title: 'Planification des horaires', level: 'Avancé' },
      { id: 'departments', title: 'Gestion des départements', level: 'Avancé' }
    ]
  },
  {
    id: 'documents',
    title: 'Gestion des Renseignements',
    icon: <DescriptionIcon color="primary" />,
    description: 'Documentation et fichiers',
    articles: [
      { id: 'document-upload', title: 'Télécharger des documents', level: 'Débutant' },
      { id: 'document-types', title: 'Types de documents', level: 'Intermédiaire' },
      { id: 'sharing-documents', title: 'Partage de documents', level: 'Intermédiaire' }
    ]
  },
  {
    id: 'reports',
    title: 'Rapports & Analyses',
    icon: <BarChartIcon color="primary" />,
    description: 'Génération et analyse de rapports',
    articles: [
      { id: 'attendance-reports', title: 'Rapports de présence', level: 'Intermédiaire' },
      { id: 'custom-reports', title: 'Rapports personnalisés', level: 'Avancé' },
      { id: 'exporting-data', title: 'Exporter des données', level: 'Intermédiaire' },
      { id: 'data-visualization', title: 'Visualisation des données', level: 'Avancé' }
    ]
  },
  {
    id: 'settings',
    title: 'Paramètres',
    icon: <SettingsIcon color="primary" />,
    description: 'Configuration du système',
    articles: [
      { id: 'user-settings', title: 'Paramètres utilisateur', level: 'Débutant' },
      { id: 'system-settings', title: 'Paramètres système', level: 'Avancé' },
      { id: 'access-management', title: 'Gestion des accès', level: 'Avancé' },
      { id: 'biometrics-setup', title: 'Configuration biométrique', level: 'Intermédiaire' }
    ]
  },
  {
    id: 'for-admin',
    title: 'Pour Administrateurs',
    icon: <FingerprintIcon color="primary" />,
    description: 'Guides spécifiques aux administrateurs',
    articles: [
      { id: 'admin-dashboard', title: "Tableau de bord d'administration", level: 'Avancé' },
      { id: 'user-roles', title: "Gestion des rôles d'utilisateurs", level: 'Avancé' },
      { id: 'system-backup', title: 'Sauvegarde du système', level: 'Avancé' },
      { id: 'security-best-practices', title: 'Meilleures pratiques de sécurité', level: 'Avancé' }
    ]
  }
];

// Featured articles
const featuredArticles = [
  {
    id: 'first-login',
    title: 'Premier connexion',
    description: 'Apprenez comment vous connecter et configurer votre compte pour la première fois',
    image: '/help/first-login.jpg',
    section: 'getting-started'
  },
  {
    id: 'daily-attendance',
    title: 'Pointage du jour',
    description: 'Guide complet pour gérer les pointages quotidiens des employés',
    image: '/help/daily-attendance.jpg',
    section: 'attendance'
  },
  {
    id: 'biometric-attendance',
    title: 'Pointage biométrique',
    description: 'Comment utiliser les fonctionnalités de reconnaissance faciale et d\'empreinte digitale',
    image: '/help/biometric.jpg',
    section: 'attendance'
  }
];

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`help-tabpanel-${index}`}
      aria-labelledby={`help-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Help = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSectionClick = (sectionId) => {
    navigate(`/help/section/${sectionId}`);
  };

  const handleArticleClick = (sectionId, articleId) => {
    navigate(`/help/article/${sectionId}/${articleId}`);
  };

  // Filter sections based on user role
  const filterSectionsByRole = () => {
    if (!currentUser) return helpSections;

    if (currentUser.role === 'admin') {
      return helpSections;
    } else if (['manager', 'chef'].includes(currentUser.role)) {
      return helpSections.filter(section => section.id !== 'for-admin');
    } else {
      return helpSections.filter(section => !['for-admin'].includes(section.id));
    }
  };

  const filteredSections = filterSectionsByRole();

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      {/* Header */}
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
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: theme.palette.primary.main,
              fontWeight: 'bold'
            }}>
              <HelpIcon sx={{ mr: 1, fontSize: 32 }} /> Centre d'Aide POINPRO
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Trouvez toutes les informations dont vous avez besoin pour utiliser efficacement le système POINPRO.
            </Typography>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
              <Link component={RouterLink} to="/" color="inherit">
                Accueil
              </Link>
              <Typography color="text.primary">Aide</Typography>
            </Breadcrumbs>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Rechercher dans l'aide..."
              variant="outlined"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                bgcolor: 'background.paper',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.06)}`
                }
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Help Content Tabs */}
      <Box sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
            aria-label="help content tabs"
          >
            <Tab label="Accueil" icon={<HelpIcon />} iconPosition="start" />
            <Tab label="FAQ" icon={<QuestionAnswerIcon />} iconPosition="start" />
            <Tab label="Vidéos" icon={<VideoLibraryIcon />} iconPosition="start" />
            <Tab label="Guides" icon={<ArticleIcon />} iconPosition="start" />
          </Tabs>
        </Box>
        
        {/* Home Tab */}
        <TabPanel value={tabValue} index={0}>
          {/* Featured Articles */}
          <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 'medium' }}>
            Articles Populaires
          </Typography>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {featuredArticles.map((article) => (
              <Grid item xs={12} md={4} key={article.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.1)}`
                    },
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}
                  onClick={() => handleArticleClick(article.section, article.id)}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={article.image || '/help/placeholder.jpg'}
                    alt={article.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {article.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {article.description}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Chip 
                        label="Populaire" 
                        size="small" 
                        color="primary" 
                        icon={<StarIcon fontSize="small" />}
                        sx={{ 
                          borderRadius: 1,
                          '& .MuiChip-label': { fontWeight: 'medium' }
                        }}
                      />
                      <Typography variant="body2" color="primary" sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        fontWeight: 'medium'
                      }}>
                        Lire plus <KeyboardArrowRightIcon fontSize="small" />
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Help Sections */}
          <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 'medium' }}>
            Sections d'Aide
          </Typography>
          <Grid container spacing={2}>
            {filteredSections.map((section) => (
              <Grid item xs={12} sm={6} md={4} key={section.id}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    height: '100%',
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.light, 0.05),
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                      transform: 'translateY(-2px)'
                    }
                  }}
                  onClick={() => handleSectionClick(section.id)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Box 
                      sx={{ 
                        p: 1, 
                        borderRadius: 1, 
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        mr: 1.5
                      }}
                    >
                      {section.icon}
                    </Box>
                    <Typography variant="h6">{section.title}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {section.description}
                  </Typography>
                  <List dense sx={{ mt: 1 }}>
                    {section.articles.slice(0, 3).map((article) => (
                      <ListItem 
                        key={article.id}
                        disablePadding
                        sx={{ py: 0.5 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArticleClick(section.id, article.id);
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <ArticleIcon fontSize="small" color="action" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={article.title} 
                          primaryTypographyProps={{ 
                            variant: 'body2',
                            color: 'primary'
                          }}
                        />
                      </ListItem>
                    ))}
                    {section.articles.length > 3 && (
                      <ListItem 
                        sx={{ 
                          justifyContent: 'flex-end', 
                          py: 0.5, 
                          color: 'primary.main',
                          fontWeight: 'medium'
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          color="primary" 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center'
                          }}
                        >
                          Voir tout ({section.articles.length}) <KeyboardArrowRightIcon fontSize="small" />
                        </Typography>
                      </ListItem>
                    )}
                  </List>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
        
        {/* FAQ Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Foire Aux Questions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Contenu FAQ à venir
          </Typography>
        </TabPanel>
        
        {/* Videos Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Tutoriels Vidéo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Contenu vidéo à venir
          </Typography>
        </TabPanel>
        
        {/* Guides Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Guides Complets
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Guides détaillés à venir
          </Typography>
        </TabPanel>
      </Box>

      {/* Help Resources */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 2, 
          bgcolor: alpha(theme.palette.info.light, 0.1),
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
        }}
      >
        <Typography variant="h6" gutterBottom>
          Besoin d'aide supplémentaire?
        </Typography>
        <Typography variant="body2" paragraph>
          Si vous ne trouvez pas ce que vous cherchez, vous pouvez contacter notre équipe de support.
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BookmarkIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="body2">
                <Link href="#" underline="hover">Documentation technique</Link>
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <VideoLibraryIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="body2">
                <Link href="#" underline="hover">Vidéos de formation</Link>
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <QuestionAnswerIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="body2">
                <Link href="#" underline="hover">Contacter le support</Link>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Help; 