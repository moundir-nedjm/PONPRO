import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Tooltip,
  Typography,
  alpha,
  useTheme,
  Collapse,
  Badge,
  Avatar,
  Paper,
  IconButton,
  styled
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  Business as BusinessIcon,
  EventNote as EventNoteIcon,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Code as CodeIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  Print as PrintIcon,
  CalendarMonth as CalendarIcon,
  ExpandLess,
  ExpandMore,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  TrendingUp as TrendingUpIcon,
  Face as FaceIcon,
  Fingerprint as FingerprintIcon,
  QrCode as QrCodeIcon,
  Person as PersonIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import Logo from './Logo';
import { PoinproLogoIcon } from './Logo';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 280;

// Styled components
const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
  width: open ? drawerWidth : 72,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  overflowX: 'hidden',
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  '& .MuiDrawer-paper': {
    width: open ? drawerWidth : 72,
    overflowX: 'hidden',
    backgroundColor: theme.palette.common.white,
    backgroundImage: 'none',
    borderRight: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
    boxShadow: open ? `5px 0 20px ${alpha(theme.palette.common.black, 0.03)}` : 'none',
    transition: theme.transitions.create(['width', 'box-shadow'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  minHeight: '64px !important',
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
}));

const StyledListItemButton = styled(ListItemButton)(({ theme, active, open }) => ({
  margin: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.2s ease-in-out',
  minHeight: 48,
  justifyContent: open ? 'initial' : 'center',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.06),
  },
  ...(active && {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.15),
    },
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
  }),
  '& .MuiListItemIcon-root': {
    minWidth: 0,
    marginRight: open ? theme.spacing(2) : 'auto',
    justifyContent: 'center',
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    fontSize: 10,
    height: 18,
    minWidth: 18,
    padding: '0 4px',
    fontWeight: 600,
    boxShadow: `0 0 0 1.5px ${theme.palette.common.white}`,
  },
}));

// Category label for menu sections
const MenuCategory = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: theme.palette.text.secondary,
  opacity: 0.6,
  padding: theme.spacing(1.5, 3, 0.5),
}));

// Group menu items by category for better organization
const menuCategories = {
  main: [
    'Tableau de Bord',
    'Tableau de Bord Personnel',
    'Mes Statistiques'
  ],
  attendance: [
    'Pointage'
  ],
  management: [
    'Employés',
    'Départements',
    'Gestion des Renseignements'
  ],
  reports: [
    'Rapports'
  ],
  system: [
    'Aide',
    'Paramètres'
  ]
};

// Map menu items to their categories
const getMenuCategory = (title) => {
  if (menuCategories.main.includes(title)) return 'main';
  if (menuCategories.attendance.includes(title)) return 'attendance';
  if (menuCategories.management.includes(title)) return 'management';
  if (menuCategories.reports.includes(title)) return 'reports';
  if (menuCategories.system.includes(title)) return 'system';
  return null;
};

// Category labels
const categoryLabels = {
  main: 'Tableaux de Bord',
  attendance: 'Pointage & Présence',
  management: 'Gestion',
  reports: 'Rapports & Analyses',
  system: 'Système'
};

// Order of categories in the sidebar
const categoryOrder = ['main', 'attendance', 'management', 'reports', 'system'];

const menuItems = [
  {
    title: 'Tableau de Bord',
    path: '/dashboard',
    icon: <DashboardIcon />,
    roles: ['admin', 'manager', 'user', 'chef']
  },
  {
    title: 'Employés',
    path: '/employees',
    icon: <PeopleIcon />,
    roles: ['admin', 'manager'],
    submenu: [
      {
        title: 'Liste des Employés',
        path: '/employees',
        roles: ['admin', 'manager']
      },
      {
        title: 'Ajouter un Employé',
        path: '/employees/new',
        roles: ['admin']
      }
    ]
  },
  {
    title: 'Tableau de Bord Personnel',
    path: '/employee/dashboard',
    icon: <PersonIcon />,
    roles: ['employee', 'chef'],
    description: 'Suivre votre assiduité et présence'
  },
  {
    title: 'Mes Statistiques',
    path: '/employee/stats',
    icon: <TrendingUpIcon />,
    roles: ['employee', 'chef'],
    description: 'Personal metrics with attendance patterns and work hours'
  },
  {
    title: 'Gestion des Renseignements',
    path: '/documents',
    icon: <DescriptionIcon />,
    roles: ['admin', 'manager', 'user', 'chef', 'employee'],
    description: 'Gérer les documents personnels et professionnels'
  },
  {
    title: 'Paramètres',
    path: '/employee/settings',
    icon: <SettingsIcon />,
    roles: ['employee', 'chef'],
    submenu: [
      {
        title: 'Reconnaissance Faciale',
        path: '/employee/settings/face',
        roles: ['employee', 'chef']
      },
      {
        title: 'Empreinte Digitale',
        path: '/employee/settings/fingerprint',
        roles: ['employee', 'chef']
      }
    ]
  },
  {
    title: 'Pointage',
    path: '/attendance',
    icon: <AccessTimeIcon />,
    roles: ['admin', 'manager', 'user', 'chef'],
    submenu: [
      {
        title: 'Pointage du Jour',
        path: '/attendance/today',
        roles: ['admin', 'manager', 'user', 'chef']
      },
      {
        title: 'Tableau Mensuel',
        path: '/attendance/monthly-sheet',
        roles: ['admin', 'manager', 'chef']
      },
      {
        title: 'Codes de Pointage',
        path: '/attendance/codes',
        roles: ['admin']
      },
      {
        title: 'Statistiques',
        path: '/attendance/stats',
        roles: ['admin', 'manager']
      }
    ]
  },
  {
    title: 'Départements',
    path: '/departments',
    icon: <BusinessIcon />,
    roles: ['admin']
  },
  {
    title: 'Rapports',
    path: '/reports',
    icon: <AssessmentIcon />,
    roles: ['admin', 'manager'],
    submenu: [
      {
        title: 'Générateur de Rapports',
        path: '/reports',
        roles: ['admin', 'manager']
      },
      {
        title: 'Rapport de Présence',
        path: '/reports/attendance',
        roles: ['admin', 'manager']
      },
      {
        title: 'Rapport de Congés',
        path: '/reports/leaves',
        roles: ['admin', 'manager']
      },
      {
        title: 'Rapport de Performance',
        path: '/reports/performance',
        roles: ['admin', 'manager']
      }
    ]
  },
  {
    title: 'Aide',
    path: '/help',
    icon: <HelpIcon />,
    roles: ['admin', 'manager', 'user', 'chef', 'employee'],
    description: 'Documentation et assistance utilisateur',
    submenu: [
      {
        title: 'Centre d\'Aide',
        path: '/help',
        roles: ['admin', 'manager', 'user', 'chef', 'employee']
      },
      {
        title: 'Démarrage',
        path: '/help/section/getting-started',
        roles: ['admin', 'manager', 'user', 'chef', 'employee']
      },
      {
        title: 'Pointage & Présence',
        path: '/help/section/attendance',
        roles: ['admin', 'manager', 'user', 'chef', 'employee']
      },
      {
        title: 'Guide Administrateur',
        path: '/help/section/for-admin',
        roles: ['admin']
      }
    ]
  },
  {
    title: 'Paramètres',
    path: '/settings',
    icon: <SettingsIcon />,
    roles: ['admin', 'manager', 'user'],
    submenu: [
      {
        title: 'Organisation',
        path: '/admin/settings/organization',
        roles: ['admin']
      },
      {
        title: 'Gestion des Accès',
        path: '/admin/settings/access',
        roles: ['admin']
      },
      {
        title: 'Détails de l\'Employé',
        path: '/employees/settings',
        roles: ['admin', 'manager']
      },
      {
        title: 'General',
        path: '/settings',
        roles: ['admin', 'manager', 'user']
      }
    ]
  },
  {
    title: 'Paramètres Administrateur',
    path: '/admin/settings',
    icon: <SettingsIcon />,
    roles: ['admin'],
    submenu: [
      {
        title: 'Organisation',
        path: '/admin/settings/organization',
        roles: ['admin'],
        description: 'Configurer les paramètres globaux de l\'organisation'
      }
    ]
  },
  {
    title: 'Biométrie de l\'équipe',
    icon: <FaceIcon />,
    path: '/team-biometrics',
    roles: ['team_leader', 'admin', 'chef']
  }
];

// Special styling for the logo when sidebar is collapsed
const CollapsedLogo = styled(Box)(({ theme }) => ({
  width: 36,
  height: 36,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.2)}, ${alpha(theme.palette.primary.main, 0.1)})`,
  boxShadow: `0 2px 6px ${alpha(theme.palette.primary.main, 0.15)}`,
  padding: 4,
}));

const Sidebar = ({ open, toggleDrawer }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, hasAccess, logout } = useAuth();
  
  // State for expanded submenus
  const [expandedMenus, setExpandedMenus] = React.useState({});
  
  const handleToggleSubmenu = (path) => {
    setExpandedMenus(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };
  
  // Check if a path is active
  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/') {
      return true;
    }
    return location.pathname.startsWith(path);
  };
  
  // Check if user has access to menu item
  const checkAccess = (roles) => {
    return hasAccess(roles);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // If no user is logged in, don't render the sidebar
  if (!currentUser) {
    return null;
  }

  return (
    <StyledDrawer
      open={open}
      variant="permanent"
    >
      <DrawerHeader>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: open ? 'flex-start' : 'center',
          width: '100%',
          transition: theme.transitions.create(['opacity', 'justify-content'], {
            duration: theme.transitions.duration.shorter,
          }),
          background: open ? `linear-gradient(120deg, ${alpha(theme.palette.primary.light, 0.05)}, ${alpha(theme.palette.background.default, 0)})` : 'none',
          borderRadius: 2,
          p: 1
        }}>
          {open ? (
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center'
            }}>
              <Logo variant="sidebar" />
              <Typography 
                variant="subtitle1" 
                fontWeight="bold" 
                sx={{ 
                  ml: 0.5,
                  color: theme.palette.primary.main,
                  letterSpacing: '0.5px',
                  background: `-webkit-linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main} 70%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '1.2rem'
                }}
              >
                POINPRO
              </Typography>
            </Box>
          ) : (
            <CollapsedLogo>
              <PoinproLogoIcon
                sx={{
                  color: theme.palette.primary.main,
                  fontSize: 30,
                  filter: `drop-shadow(0 1px 2px ${alpha(theme.palette.primary.main, 0.3)})`
                }}
              />
            </CollapsedLogo>
          )}
        </Box>
        {open && (
          <IconButton 
            onClick={toggleDrawer} 
            size="small" 
            sx={{ 
              ml: 1,
              background: alpha(theme.palette.primary.light, 0.1),
              '&:hover': {
                background: alpha(theme.palette.primary.light, 0.2),
              }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
      </DrawerHeader>

      {/* User profile section */}
      {open && (
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          mb: 1,
          mt: 1
        }}>
          <Avatar 
            src="/avatar-placeholder.jpg"
            sx={{ 
              width: 70, 
              height: 70, 
              mb: 1,
              border: `3px solid ${alpha(theme.palette.primary.light, 0.3)}`,
              boxShadow: `0 0 15px ${alpha(theme.palette.primary.light, 0.2)}`
            }}
          />
          <Typography 
            variant="subtitle1" 
            fontWeight="bold" 
            sx={{ color: theme.palette.text.primary }}
          >
            {currentUser.name}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.text.secondary,
              mb: 1.5
            }}
          >
            {currentUser.role === 'admin' ? 'Administrateur' : 
             currentUser.role === 'manager' ? 'Gestionnaire' : 
             currentUser.role === 'chef' ? 'Chef de Projet' : 
             currentUser.role === 'user' ? 'Utilisateur' : 
             currentUser.role === 'employee' ? 'Employé' : 
             currentUser.role}
          </Typography>
          <Paper
            elevation={0}
            sx={{
              bgcolor: alpha(theme.palette.success.main, 0.1),
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80%',
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: theme.palette.success.main,
                mr: 1,
                boxShadow: `0 0 5px ${alpha(theme.palette.success.main, 0.5)}`
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.success.dark,
                fontWeight: 'medium',
              }}
            >
              En ligne
            </Typography>
          </Paper>
        </Box>
      )}

      {open && <Divider sx={{ mx: 2, opacity: 0.6 }} />}

      {/* Main navigation */}
      <List sx={{ pt: 1, mt: 0, width: '100%' }}>
        {/* Group menu items by category in defined order */}
        {categoryOrder.map(category => {
          // Filter menu items for this category
          const categoryItems = menuItems.filter(item => 
            getMenuCategory(item.title) === category &&
            checkAccess(item.roles)
          );
          
          // Skip empty categories
          if (categoryItems.length === 0) return null;
          
          return (
            <React.Fragment key={category}>
              {/* Display category label if drawer is open */}
              {open && (
                <MenuCategory variant="overline">
                  {categoryLabels[category]}
                </MenuCategory>
              )}
              
              {/* Menu items for this category */}
              {categoryItems.map((item) => {
                // Check if item has a submenu
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                const isMenuExpanded = expandedMenus[item.path];
                const isItemActive = isActive(item.path);

                return (
                  <React.Fragment key={item.path}>
                    <ListItem 
                      disablePadding 
                      sx={{ display: 'block', mb: 0.5 }}
                    >
                      <StyledListItemButton
                        component={hasSubmenu ? 'div' : Link}
                        to={hasSubmenu ? undefined : item.path}
                        onClick={hasSubmenu ? () => handleToggleSubmenu(item.path) : undefined}
                        active={isItemActive ? 1 : 0}
                        open={open}
                        sx={{
                          px: 2.5,
                          minHeight: 44,
                          justifyContent: open ? 'initial' : 'center',
                          boxShadow: isItemActive ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}` : 'none',
                          transition: 'all 0.2s ease',
                          borderLeft: isItemActive ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                          pl: isItemActive ? 2.2 : 2.5,
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            mr: open ? 2 : 'auto',
                            justifyContent: 'center',
                            color: isItemActive ? theme.palette.primary.main : theme.palette.text.secondary,
                            transition: 'color 0.3s ease',
                            fontSize: isItemActive ? '1.1rem' : '1rem',
                          }}
                        >
                          {item.badge ? (
                            <StyledBadge
                              badgeContent={item.badge.content}
                              color={item.badge.color}
                              anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                              }}
                            >
                              {item.icon}
                            </StyledBadge>
                          ) : (
                            item.icon
                          )}
                        </ListItemIcon>
                        {open && (
                          <>
                            <ListItemText 
                              primary={item.title} 
                              primaryTypographyProps={{ 
                                noWrap: true,
                                fontWeight: isItemActive ? 'medium' : 'regular',
                                fontSize: '0.875rem',
                              }}
                              secondary={item.description}
                              secondaryTypographyProps={{
                                noWrap: true,
                                fontSize: '0.75rem',
                                sx: { 
                                  opacity: 0.7,
                                  display: isItemActive ? 'block' : 'none'
                                }
                              }}
                            />
                            {hasSubmenu && (isMenuExpanded ? <ExpandLess /> : <ExpandMore />)}
                          </>
                        )}
                      </StyledListItemButton>
                    </ListItem>

                    {/* Submenu */}
                    {hasSubmenu && open && (
                      <Collapse in={isMenuExpanded} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          {item.submenu.map((subItem) => {
                            // Check if user has access to this submenu item
                            if (!checkAccess(subItem.roles)) return null;
                            
                            const isSubItemActive = isActive(subItem.path);

                            return (
                              <ListItem 
                                key={subItem.path} 
                                disablePadding 
                                sx={{ display: 'block' }}
                              >
                                <StyledListItemButton
                                  component={Link}
                                  to={subItem.path}
                                  active={isSubItemActive ? 1 : 0}
                                  sx={{
                                    pl: 8,
                                    py: 0.75,
                                    minHeight: 36,
                                    borderRadius: 1,
                                    mx: 2,
                                    backgroundColor: isSubItemActive 
                                      ? alpha(theme.palette.primary.main, 0.08)
                                      : 'transparent',
                                    '&:before': isSubItemActive ? {
                                      content: '""',
                                      position: 'absolute',
                                      left: '4px',
                                      top: '50%',
                                      transform: 'translateY(-50%)',
                                      width: '4px',
                                      height: '60%',
                                      backgroundColor: theme.palette.primary.main,
                                      borderRadius: '4px'
                                    } : {},
                                  }}
                                >
                                  <ListItemText 
                                    primary={subItem.title} 
                                    primaryTypographyProps={{ 
                                      variant: 'body2', 
                                      noWrap: true,
                                      fontWeight: isSubItemActive ? 'medium' : 'regular',
                                      fontSize: '0.815rem'
                                    }}
                                  />
                                </StyledListItemButton>
                              </ListItem>
                            );
                          })}
                        </List>
                      </Collapse>
                    )}
                  </React.Fragment>
                );
              })}
              
              {/* Add a small gap between categories */}
              {open && <Box sx={{ height: 16 }} />}
            </React.Fragment>
          );
        })}
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
      
      {/* Logout button */}
      {open && (
        <Box sx={{ p: 2 }}>
          <Divider sx={{ mb: 2, opacity: 0.6 }} />
          <StyledListItemButton
            onClick={handleLogout}
            sx={{
              px: 2.5,
              py: 1.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.error.main, 0.08),
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.15),
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.2s',
              boxShadow: `0 2px 10px ${alpha(theme.palette.error.main, 0.12)}`,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: 2,
                justifyContent: 'center',
                color: theme.palette.error.main,
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Déconnexion" 
              primaryTypographyProps={{ 
                color: theme.palette.error.main,
                fontWeight: 'medium'
              }}
            />
          </StyledListItemButton>
        </Box>
      )}
    </StyledDrawer>
  );
};

export default Sidebar; 