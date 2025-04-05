import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Breadcrumbs,
  Link,
  Divider,
  Button,
  Chip,
  useTheme,
  alpha,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Card,
  CardContent,
  Grid
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
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  BookmarkBorder as BookmarkBorderIcon,
  BookmarkAdded as BookmarkAddedIcon
} from '@mui/icons-material';

// Mock article content - in a real app, you would fetch this from an API
const mockArticleContent = {
  'getting-started': {
    'introduction': {
      title: 'Introduction à POINPRO',
      content: `
        <h2>Bienvenue sur POINPRO</h2>
        <p>POINPRO est une solution complète de gestion de présence et de pointage conçue pour simplifier le suivi du temps de travail des employés. Ce guide vous aidera à comprendre les fonctionnalités de base du système.</p>
        
        <h3>Qu'est-ce que POINPRO?</h3>
        <p>POINPRO est une application web moderne qui permet aux entreprises de toutes tailles de gérer efficacement la présence des employés, les horaires de travail et les rapports associés. Le système offre plusieurs méthodes de pointage, notamment la reconnaissance faciale, les empreintes digitales et les méthodes traditionnelles.</p>
        
        <h3>Principales fonctionnalités</h3>
        <ul>
          <li><strong>Pointage quotidien</strong> - Enregistrement des entrées et sorties des employés</li>
          <li><strong>Biométrie</strong> - Reconnaissance faciale et par empreinte digitale</li>
          <li><strong>Tableaux de bord</strong> - Visualisation des données en temps réel</li>
          <li><strong>Rapports</strong> - Génération de rapports détaillés</li>
          <li><strong>Gestion des employés</strong> - Base de données complète des employés</li>
          <li><strong>Paramètres flexibles</strong> - Configuration adaptée à vos besoins</li>
        </ul>
        
        <h3>Pour qui est POINPRO?</h3>
        <p>POINPRO est conçu pour différents types d'utilisateurs:</p>
        <ul>
          <li><strong>Administrateurs</strong> - Gestion complète du système</li>
          <li><strong>Managers</strong> - Supervision des équipes et des rapports</li>
          <li><strong>Chefs de projet</strong> - Suivi des membres de l'équipe</li>
          <li><strong>Employés</strong> - Enregistrement du temps et consultation de leurs données</li>
        </ul>
      `,
      lastUpdated: '2023-10-15',
      level: 'Débutant',
      author: 'Équipe POINPRO',
      relatedArticles: [
        { id: 'first-login', title: 'Premier connexion', section: 'getting-started' },
        { id: 'interface-overview', title: "Vue d'ensemble de l'interface", section: 'getting-started' },
        { id: 'navigation', title: 'Navigation dans le système', section: 'getting-started' }
      ]
    },
    'first-login': {
      title: 'Premier connexion',
      content: `
        <h2>Connexion et configuration initiale</h2>
        <p>Ce guide vous explique comment vous connecter à POINPRO pour la première fois et configurer votre compte.</p>
        
        <h3>Étape 1: Accéder à la page de connexion</h3>
        <p>Utilisez l'URL fournie par votre administrateur système pour accéder à la page de connexion POINPRO. L'URL ressemble généralement à: <code>https://votreentreprise.poinpro.com</code></p>
        
        <h3>Étape 2: Saisir vos identifiants</h3>
        <p>Pour votre première connexion, utilisez les informations d'identification temporaires qui vous ont été fournies:</p>
        <ul>
          <li><strong>Nom d'utilisateur</strong>: Généralement votre adresse e-mail professionnelle</li>
          <li><strong>Mot de passe</strong>: Le mot de passe temporaire fourni par votre administrateur</li>
        </ul>
        <p>Cliquez sur le bouton "Se connecter" pour continuer.</p>
        
        <h3>Étape 3: Changer votre mot de passe</h3>
        <p>Pour des raisons de sécurité, vous serez invité à changer votre mot de passe lors de votre première connexion. Votre nouveau mot de passe doit:</p>
        <ul>
          <li>Comporter au moins 8 caractères</li>
          <li>Inclure au moins une lettre majuscule</li>
          <li>Inclure au moins un chiffre</li>
          <li>Inclure au moins un caractère spécial</li>
        </ul>
        
        <h3>Étape 4: Configurer votre profil</h3>
        <p>Après avoir changé votre mot de passe, vous serez dirigé vers la page de configuration du profil où vous pourrez:</p>
        <ul>
          <li>Télécharger une photo de profil</li>
          <li>Vérifier et mettre à jour vos informations personnelles</li>
          <li>Configurer vos préférences de notification</li>
        </ul>
        
        <h3>Étape 5: Configuration biométrique (facultatif)</h3>
        <p>Si votre entreprise utilise des méthodes de pointage biométriques, vous pourriez être invité à configurer:</p>
        <ul>
          <li>Reconnaissance faciale</li>
          <li>Empreintes digitales</li>
        </ul>
        <p>Suivez les instructions à l'écran pour compléter cette configuration.</p>
      `,
      lastUpdated: '2023-11-20',
      level: 'Débutant',
      author: 'Équipe POINPRO',
      relatedArticles: [
        { id: 'introduction', title: 'Introduction à POINPRO', section: 'getting-started' },
        { id: 'interface-overview', title: "Vue d'ensemble de l'interface", section: 'getting-started' },
        { id: 'biometric-attendance', title: 'Pointage biométrique', section: 'attendance' }
      ]
    }
  },
  'attendance': {
    'daily-attendance': {
      title: 'Pointage du jour',
      content: `
        <h2>Gestion du pointage quotidien</h2>
        <p>La page "Pointage du Jour" est l'interface principale pour la gestion des entrées et sorties des employés au quotidien. Ce guide explique comment utiliser efficacement cette fonctionnalité.</p>
        
        <h3>Accéder au Pointage du Jour</h3>
        <p>Pour accéder à cette page:</p>
        <ol>
          <li>Connectez-vous à votre compte POINPRO</li>
          <li>Dans la barre latérale, cliquez sur "Pointage" puis "Pointage du Jour"</li>
        </ol>
        
        <h3>Vue d'ensemble de l'interface</h3>
        <p>L'interface de Pointage du Jour comprend plusieurs sections:</p>
        <ul>
          <li><strong>Entête</strong>: Affiche la date actuelle et les boutons d'action principaux</li>
          <li><strong>Statistiques</strong>: Résumé en temps réel des présences du jour</li>
          <li><strong>Barre de recherche</strong>: Pour trouver rapidement un employé spécifique</li>
          <li><strong>Table de pointage</strong>: Liste de tous les employés avec leur statut de pointage</li>
          <li><strong>Options de pointage</strong>: Méthodes disponibles pour l'enregistrement des pointages</li>
        </ul>
        
        <h3>Enregistrer un pointage manuellement</h3>
        <p>Pour les administrateurs ou managers qui doivent enregistrer un pointage pour un employé:</p>
        <ol>
          <li>Cliquez sur le bouton "Pointage Manuel" en haut de la page</li>
          <li>Dans la boîte de dialogue, recherchez et sélectionnez l'employé</li>
          <li>Sélectionnez le type de pointage (entrée, sortie, pause, etc.)</li>
          <li>Ajustez l'heure si nécessaire</li>
          <li>Ajoutez une note si requis</li>
          <li>Cliquez sur "Enregistrer"</li>
        </ol>
        
        <h3>Utiliser le pointage biométrique</h3>
        <p>Si votre système est configuré pour le pointage biométrique:</p>
        <ol>
          <li>Cliquez sur "Reconnaissance Faciale" ou "Empreinte Digitale"</li>
          <li>Suivez les instructions à l'écran pour compléter la vérification</li>
          <li>Une fois l'identité vérifiée, le pointage sera automatiquement enregistré</li>
        </ol>
        
        <h3>Filtrer et trier les données</h3>
        <p>Pour faciliter la gestion d'un grand nombre d'employés:</p>
        <ul>
          <li>Utilisez la barre de recherche pour trouver rapidement un employé</li>
          <li>Cliquez sur les en-têtes de colonne pour trier les données</li>
          <li>Utilisez les filtres disponibles pour afficher uniquement certaines catégories (présents, absents, retards, etc.)</li>
        </ul>
      `,
      lastUpdated: '2023-12-01',
      level: 'Débutant',
      author: 'Équipe POINPRO',
      relatedArticles: [
        { id: 'check-in', title: 'Comment pointer', section: 'attendance' },
        { id: 'biometric-attendance', title: 'Pointage biométrique', section: 'attendance' },
        { id: 'attendance-codes', title: 'Codes de pointage', section: 'attendance' }
      ]
    }
  }
};

// Get section info based on sectionId
const getSectionInfo = (sectionId) => {
  const sectionData = {
    'getting-started': {
      title: 'Démarrage',
      icon: <HelpIcon color="primary" />
    },
    'attendance': {
      title: 'Pointage & Présence',
      icon: <AccessTimeIcon color="primary" />
    },
    'employees': {
      title: 'Gestion des Employés',
      icon: <PeopleIcon color="primary" />
    },
    'documents': {
      title: 'Gestion des Renseignements',
      icon: <DescriptionIcon color="primary" />
    },
    'reports': {
      title: 'Rapports & Analyses',
      icon: <BarChartIcon color="primary" />
    },
    'settings': {
      title: 'Paramètres',
      icon: <SettingsIcon color="primary" />
    },
    'for-admin': {
      title: 'Pour Administrateurs',
      icon: <FingerprintIcon color="primary" />
    }
  };

  return sectionData[sectionId] || { title: 'Section Inconnue', icon: <HelpIcon color="primary" /> };
};

const ArticleDetail = () => {
  const { sectionId, articleId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(0);
  const [unhelpfulCount, setUnhelpfulCount] = useState(0);
  const [userRated, setUserRated] = useState(false);
  
  const sectionInfo = getSectionInfo(sectionId);

  useEffect(() => {
    // In a real app, you would fetch the article data from an API
    // Here we're using mock data
    setLoading(true);
    
    setTimeout(() => {
      if (mockArticleContent[sectionId]?.[articleId]) {
        setArticle(mockArticleContent[sectionId][articleId]);
      } else {
        // Handle article not found
        console.error('Article not found');
      }
      setLoading(false);
    }, 500); // Simulate loading delay
  }, [sectionId, articleId]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Typography>Chargement de l'article...</Typography>
      </Container>
    );
  }

  if (!article) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" color="error">Article non trouvé</Typography>
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

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    // In a real app, you would save this to user preferences
  };

  const handleHelpful = () => {
    if (!userRated) {
      setHelpfulCount(helpfulCount + 1);
      setUserRated(true);
      // In a real app, you would send this rating to the server
    }
  };

  const handleUnhelpful = () => {
    if (!userRated) {
      setUnhelpfulCount(unhelpfulCount + 1);
      setUserRated(true);
      // In a real app, you would send this rating to the server
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Breadcrumbs Navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" color="inherit">
          Accueil
        </Link>
        <Link component={RouterLink} to="/help" color="inherit">
          Aide
        </Link>
        <Link component={RouterLink} to={`/help/section/${sectionId}`} color="inherit">
          {sectionInfo.title}
        </Link>
        <Typography color="text.primary">{article.title}</Typography>
      </Breadcrumbs>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              mb: 4, 
              borderRadius: 2, 
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}
          >
            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <Button 
                startIcon={<ArrowBackIcon />} 
                onClick={() => navigate('/help')}
                variant="outlined"
                sx={{ mr: 2 }}
              >
                Retour
              </Button>
              <Box>
                <Chip 
                  icon={sectionInfo.icon} 
                  label={sectionInfo.title} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
                <Typography variant="h4" component="h1" gutterBottom>
                  {article.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
                  <Typography variant="body2">
                    Niveau: {article.level}
                  </Typography>
                  <Typography variant="body2">
                    Dernière mise à jour: {article.lastUpdated}
                  </Typography>
                  <Typography variant="body2">
                    Auteur: {article.author}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {/* Article Content */}
            <Box 
              dangerouslySetInnerHTML={{ __html: article.content }} 
              sx={{ 
                '& h2': { 
                  color: theme.palette.primary.main,
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  mb: 2,
                  mt: 4
                },
                '& h3': {
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  mb: 1.5,
                  mt: 3,
                  color: theme.palette.text.primary
                },
                '& p': {
                  mb: 2,
                  lineHeight: 1.6
                },
                '& ul, & ol': {
                  pl: 3,
                  mb: 3
                },
                '& li': {
                  mb: 1
                },
                '& code': {
                  backgroundColor: alpha(theme.palette.primary.light, 0.1),
                  borderRadius: 1,
                  px: 1,
                  py: 0.5,
                  fontFamily: 'monospace'
                }
              }}
            />
            
            <Divider sx={{ my: 3 }} />
            
            {/* Article Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" gutterBottom>
                  Cet article vous a-t-il été utile?
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button 
                    startIcon={<ThumbUpIcon />} 
                    size="small" 
                    variant={userRated && helpfulCount > 0 ? "contained" : "outlined"}
                    onClick={handleHelpful}
                    disabled={userRated}
                  >
                    Oui {helpfulCount > 0 && `(${helpfulCount})`}
                  </Button>
                  <Button 
                    startIcon={<ThumbDownIcon />} 
                    size="small" 
                    variant={userRated && unhelpfulCount > 0 ? "contained" : "outlined"}
                    onClick={handleUnhelpful}
                    disabled={userRated}
                  >
                    Non {unhelpfulCount > 0 && `(${unhelpfulCount})`}
                  </Button>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={handleBookmark} color={bookmarked ? "primary" : "default"}>
                  {bookmarked ? <BookmarkAddedIcon /> : <BookmarkBorderIcon />}
                </IconButton>
                <IconButton>
                  <ShareIcon />
                </IconButton>
                <IconButton>
                  <PrintIcon />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          {/* Related Articles */}
          <Card 
            elevation={0} 
            sx={{ 
              mb: 3, 
              borderRadius: 2, 
              border: `1px solid ${alpha(theme.palette.divider, 0.15)}`
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Articles connexes
              </Typography>
              <List dense>
                {article.relatedArticles?.map((related) => (
                  <ListItem 
                    key={related.id} 
                    disablePadding 
                    sx={{ mb: 0.5 }}
                    onClick={() => navigate(`/help/article/${related.section}/${related.id}`)}
                    button
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <ArticleIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={related.title}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
          
          {/* Additional Resources */}
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 2, 
              border: `1px solid ${alpha(theme.palette.divider, 0.15)}`
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ressources Supplémentaires
              </Typography>
              <List dense>
                <ListItem disablePadding sx={{ mb: 0.5 }} button>
                  <ListItemText 
                    primary="Télécharger en PDF"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ mb: 0.5 }} button>
                  <ListItemText 
                    primary="Tutoriel vidéo"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                <ListItem disablePadding sx={{ mb: 0.5 }} button>
                  <ListItemText 
                    primary="FAQ sur cette fonctionnalité"
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ArticleDetail; 