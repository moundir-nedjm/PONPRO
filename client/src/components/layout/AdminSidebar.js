import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  SupervisedUserCircle as UserIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import LogoFull from '../auth/LogoFull';

const AdminSidebar = ({ width = 240 }) => {
  const location = useLocation();
  
  const menuItems = [
    {
      text: 'Tableau de Bord',
      icon: <DashboardIcon />,
      path: '/admin/dashboard'
    },
    {
      text: 'Gestion des Utilisateurs',
      icon: <UserIcon />,
      path: '/admin/users'
    },
    {
      text: 'Paramètres',
      icon: <SettingsIcon />,
      path: '/admin/settings'
    }
  ];
  
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
          backgroundColor: '#233044',
          color: '#fff'
        }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LogoFull />
      </Box>
      
      <Box sx={{ p: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 1,
          p: 1
        }}>
          <AdminIcon sx={{ color: '#fff', mr: 1 }} />
          <Box>
            <Typography variant="subtitle2" color="inherit">
              Panneau d'Administration
            </Typography>
            <Typography variant="caption" color="inherit" sx={{ opacity: 0.7 }}>
              Accès complet au système
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
      
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              color: '#fff',
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)'
                }
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              },
              my: 0.5,
              borderRadius: 1
            }}
          >
            <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default AdminSidebar; 