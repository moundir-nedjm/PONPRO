import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Menu,
  MenuItem,
  Avatar,
  Box,
  Badge,
  Tooltip,
  Divider,
  ListItemIcon,
  alpha,
  useTheme,
  Button,
  Stack,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  styled,
  InputBase,
  ClickAwayListener,
  Grow,
  Popper
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Logout,
  Settings,
  Person,
  Dashboard as DashboardIcon,
  HelpOutline as HelpIcon,
  Search as SearchIcon,
  ArrowForwardIos as ArrowIcon,
  AssignmentTurnedIn as TaskIcon,
  EventNote as CalendarIcon,
  StackedBarChart as StatsIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  ErrorOutline as ErrorIcon,
  InfoOutlined as InfoIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import Logo from './Logo';
import { useAuth } from '../../context/AuthContext';

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main} 60%)`,
  boxShadow: `0 4px 20px ${alpha(theme.palette.primary.dark, 0.2)}`,
  height: 64,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  minHeight: '64px !important',
  padding: theme.spacing(0, 1.5),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(0, 3),
  },
  display: 'flex',
  justifyContent: 'space-between',
}));

const SearchWrapper = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius * 3,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
  display: 'flex',
  alignItems: 'center',
  transition: theme.transitions.create('all', {
    duration: theme.transitions.duration.shorter,
  }),
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

const ActionIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.common.white, 0.1),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.2),
  },
  borderRadius: theme.shape.borderRadius * 1.5,
  margin: theme.spacing(0, 0.5),
  transition: 'all 0.2s ease',
  padding: theme.spacing(1),
}));

const NotificationList = styled(List)(({ theme }) => ({
  padding: 0,
  '& .MuiListItem-root': {
    padding: theme.spacing(1, 2),
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.05),
    },
    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  },
}));

const NotificationItem = styled(ListItem)(({ theme, notificationtype }) => ({
  position: 'relative',
  paddingLeft: theme.spacing(2),
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 4,
    height: '70%',
    backgroundColor: 
      notificationtype === 'success' ? theme.palette.success.main :
      notificationtype === 'error' ? theme.palette.error.main :
      notificationtype === 'warning' ? theme.palette.warning.main :
      theme.palette.info.main,
    borderRadius: theme.shape.borderRadius,
  },
}));

const Header = ({ open, toggleDrawer }) => {
  const theme = useTheme();
  const { currentUser, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [quickActionsAnchorEl, setQuickActionsAnchorEl] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsMenuOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleQuickActionsOpen = (event) => {
    setQuickActionsAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsMenuClose = () => {
    setNotificationsAnchorEl(null);
  };
  
  const handleQuickActionsClose = () => {
    setQuickActionsAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
  };

  // Mock notifications for display
  const notifications = [
    {
      id: 1,
      title: 'Pointage validé',
      message: 'Votre pointage du 15/06/2023 a été approuvé.',
      time: '10 min',
      type: 'success',
      icon: <CheckIcon fontSize="small" color="success" />
    },
    {
      id: 2,
      title: 'Demande de congé',
      message: 'Votre demande de congé est en attente d\'approbation.',
      time: '1 heure',
      type: 'info',
      icon: <InfoIcon fontSize="small" color="info" />
    },
    {
      id: 3,
      title: 'Attention retard',
      message: 'Vous avez 3 retards ce mois-ci.',
      time: '2 heures',
      type: 'warning',
      icon: <ErrorIcon fontSize="small" color="warning" />
    },
    {
      id: 4,
      title: 'Évaluation requise',
      message: 'Vous avez une évaluation de performance à compléter.',
      time: '1 jour',
      type: 'error',
      icon: <ErrorIcon fontSize="small" color="error" />
    }
  ];

  return (
    <StyledAppBar elevation={4}>
      <StyledToolbar>
        {/* Left section: Menu button and Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            edge="start"
            sx={{
              mr: 2,
              borderRadius: 1.5,
              backgroundColor: alpha(theme.palette.common.white, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.2),
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Logo variant="default" showTagline={false} />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                display: { xs: 'none', sm: 'block' },
                fontWeight: 700,
                letterSpacing: '0.5px',
                ml: 1
              }}
            >
              POINPRO
            </Typography>
          </Link>
          
          {/* Search bar */}
          <Box 
            sx={{ 
              display: { xs: searchOpen ? 'block' : 'none', md: 'block' },
              position: { xs: 'absolute', md: 'static' },
              left: searchOpen ? 0 : 'auto',
              right: searchOpen ? 0 : 'auto',
              top: searchOpen ? 0 : 'auto',
              width: searchOpen ? '100%' : 'auto',
              zIndex: searchOpen ? 1300 : 1,
              backgroundColor: searchOpen ? theme.palette.primary.main : 'transparent',
              paddingY: searchOpen ? 1 : 0,
              paddingX: searchOpen ? 2 : 0,
            }}
          >
            <SearchWrapper>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Rechercher..."
                inputProps={{ 'aria-label': 'search' }}
              />
              {searchOpen && (
                <IconButton 
                  size="small" 
                  sx={{ color: 'white' }} 
                  onClick={toggleSearch}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </SearchWrapper>
          </Box>
        </Box>
        
        {/* Center section: Quick access buttons */}
        <Box 
          sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            alignItems: 'center', 
            gap: 0.5,
            ml: 2
          }}
        >
          <Button
            variant="contained"
            color="primary"
            disableElevation
            startIcon={<TaskIcon />}
            component={Link}
            to="/attendance/today"
            sx={{ 
              bgcolor: alpha(theme.palette.common.white, 0.15),
              '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.25) },
              borderRadius: theme.shape.borderRadius * 2,
              textTransform: 'none',
              px: 2,
              fontWeight: 500
            }}
          >
            Pointage
          </Button>
          <Button
            variant="contained"
            color="primary"
            disableElevation
            startIcon={<CalendarIcon />}
            component={Link}
            to="/leaves"
            sx={{ 
              bgcolor: alpha(theme.palette.common.white, 0.15),
              '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.25) },
              borderRadius: theme.shape.borderRadius * 2,
              textTransform: 'none',
              px: 2,
              fontWeight: 500
            }}
          >
            Congés
          </Button>
          <Button
            variant="contained"
            color="primary"
            disableElevation
            startIcon={<StatsIcon />}
            component={Link}
            to="/reports"
            sx={{ 
              bgcolor: alpha(theme.palette.common.white, 0.15),
              '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.25) },
              borderRadius: theme.shape.borderRadius * 2,
              textTransform: 'none',
              px: 2,
              fontWeight: 500
            }}
          >
            Rapports
          </Button>
        </Box>

        {/* Right section: Actions and user profile */}
        <Stack direction="row" spacing={0.5} alignItems="center">
          {/* Search icon (mobile) */}
          <Tooltip title="Rechercher">
            <ActionIconButton 
              color="inherit"
              onClick={toggleSearch}
              sx={{ display: { md: 'none' } }}
            >
              <SearchIcon />
            </ActionIconButton>
          </Tooltip>

          {/* Quick Actions */}
          <Tooltip title="Actions rapides">
            <ActionIconButton 
              color="inherit"
              onClick={handleQuickActionsOpen}
              sx={{ display: { xs: 'flex', md: 'none' } }}
            >
              <ArrowIcon />
            </ActionIconButton>
          </Tooltip>

          {/* Help */}
          <Tooltip title="Aide">
            <ActionIconButton 
              color="inherit"
              component={Link}
              to="/help"
            >
              <HelpIcon />
            </ActionIconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <ActionIconButton
              color="inherit"
              onClick={handleNotificationsMenuOpen}
            >
              <Badge 
                badgeContent={notifications.length} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: 10,
                    height: 18,
                    minWidth: 18,
                  }
                }}
              >
                <NotificationsIcon />
              </Badge>
            </ActionIconButton>
          </Tooltip>

          {/* Profile */}
          <Tooltip title={currentUser?.name || 'Profil'}>
            <ActionIconButton
              edge="end"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
              sx={{ ml: 0.5 }}
            >
              <Avatar 
                alt={currentUser?.name} 
                src="/avatar-placeholder.jpg" 
                sx={{ 
                  width: 32, 
                  height: 32,
                  border: `2px solid ${alpha(theme.palette.common.white, 0.7)}`
                }} 
              />
            </ActionIconButton>
          </Tooltip>
        </Stack>
      </StyledToolbar>

      {/* Notifications Menu */}
      <Popper
        open={Boolean(notificationsAnchorEl)}
        anchorEl={notificationsAnchorEl}
        placement="bottom-end"
        transition
        disablePortal
        style={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Grow
            {...TransitionProps}
            style={{ transformOrigin: 'right top' }}
          >
            <Paper 
              elevation={6} 
              sx={{ 
                width: 320, 
                maxHeight: 380, 
                overflowY: 'auto',
                mt: 1,
                borderRadius: 2,
                boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.15)}`
              }}
            >
              <ClickAwayListener onClickAway={handleNotificationsMenuClose}>
                <Box>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      px: 2,
                      py: 1.5
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      Notifications
                    </Typography>
                    <Chip
                      label={`${notifications.length} nouvelles`}
                      size="small"
                      color="primary"
                      sx={{ 
                        height: 24,
                        borderRadius: 3,
                        fontWeight: 500,
                        fontSize: '0.75rem'
                      }}
                    />
                  </Box>
                  <NotificationList>
                    {notifications.map((notification) => (
                      <NotificationItem 
                        key={notification.id} 
                        button 
                        notificationtype={notification.type}
                      >
                        <ListItemAvatar sx={{ minWidth: 40 }}>
                          {notification.icon}
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight="medium">
                              {notification.title}
                            </Typography>
                          }
                          secondary={
                            <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                                {notification.message}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <TimeIcon sx={{ fontSize: 12, mr: 0.5, color: theme.palette.text.disabled }} />
                                <Typography variant="caption" color="text.disabled">
                                  {notification.time}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </NotificationItem>
                    ))}
                  </NotificationList>
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      display: 'flex', 
                      justifyContent: 'center',
                      borderTop: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <Button
                      component={Link}
                      to="/notifications"
                      color="primary"
                      onClick={handleNotificationsMenuClose}
                      sx={{ 
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '0.875rem'
                      }}
                    >
                      Voir toutes les notifications
                    </Button>
                  </Box>
                </Box>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>

      {/* Profile Menu */}
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 4,
          sx: {
            mt: 1.5,
            width: 220,
            borderRadius: 2,
            overflow: 'visible',
            boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.15)}`,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: -10,
              right: 16,
              width: 20,
              height: 20,
              bgcolor: 'background.paper',
              transform: 'rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
            {currentUser?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentUser?.email}
          </Typography>
        </Box>

        <Divider />

        <MenuItem 
          component={Link} 
          to="/employee/dashboard" 
          onClick={handleMenuClose}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <DashboardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Tableau de bord" 
            primaryTypographyProps={{ variant: 'body2' }}
          />
        </MenuItem>

        <MenuItem 
          component={Link} 
          to="/profile" 
          onClick={handleMenuClose}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Mon profil" 
            primaryTypographyProps={{ variant: 'body2' }}
          />
        </MenuItem>

        <MenuItem 
          component={Link} 
          to="/settings" 
          onClick={handleMenuClose}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Paramètres" 
            primaryTypographyProps={{ variant: 'body2' }}
          />
        </MenuItem>

        <Divider />

        <MenuItem 
          onClick={handleLogout}
          sx={{ 
            py: 1.5,
            color: theme.palette.error.main,
          }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Déconnexion" 
            primaryTypographyProps={{ 
              variant: 'body2',
              fontWeight: 'medium'
            }}
          />
        </MenuItem>
      </Menu>

      {/* Quick Actions Menu (Mobile) */}
      <Menu
        anchorEl={quickActionsAnchorEl}
        open={Boolean(quickActionsAnchorEl)}
        onClose={handleQuickActionsClose}
        PaperProps={{
          elevation: 4,
          sx: {
            mt: 1.5,
            width: 200,
            maxWidth: '100%',
            borderRadius: 2,
            boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.15)}`,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          component={Link} 
          to="/attendance/today" 
          onClick={handleQuickActionsClose}
        >
          <ListItemIcon>
            <TaskIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Pointage" 
            primaryTypographyProps={{ variant: 'body2' }}
          />
        </MenuItem>
        <MenuItem 
          component={Link} 
          to="/leaves" 
          onClick={handleQuickActionsClose}
        >
          <ListItemIcon>
            <CalendarIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Congés" 
            primaryTypographyProps={{ variant: 'body2' }}
          />
        </MenuItem>
        <MenuItem 
          component={Link} 
          to="/reports" 
          onClick={handleQuickActionsClose}
        >
          <ListItemIcon>
            <StatsIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Rapports" 
            primaryTypographyProps={{ variant: 'body2' }}
          />
        </MenuItem>
      </Menu>
    </StyledAppBar>
  );
};

export default Header; 