import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  Container, 
  Paper, 
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Settings as SettingsIcon,
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
  LockOpen as LockOpenIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

// Import settings components
import GeneralSettings from './components/GeneralSettings';
import AppearanceSettings from './components/AppearanceSettings';
import NotificationSettings from './components/NotificationSettings';
import SecuritySettings from './components/SecuritySettings';
import SystemInfoSettings from './components/SystemInfoSettings';
import AccessManagement from '../admin/settings/access/AccessManagement';

// Create TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
}

const Settings = () => {
  const [tabValue, setTabValue] = useState(0);
  const { currentUser, hasAccess } = useAuth();
  const { status } = useSettings();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Define tabs configuration with role-based access
  const allTabs = [
    { 
      label: 'Général', 
      icon: <SettingsIcon />, 
      component: <GeneralSettings />,
      roles: ['admin', 'manager', 'chef', 'employee', 'user']
    },
    { 
      label: 'Apparence', 
      icon: <PaletteIcon />, 
      component: <AppearanceSettings />,
      roles: ['admin', 'manager', 'chef', 'employee', 'user']
    },
    { 
      label: 'Notifications', 
      icon: <NotificationsIcon />, 
      component: <NotificationSettings />,
      roles: ['admin', 'manager', 'chef', 'employee', 'user']
    },
    { 
      label: 'Sécurité', 
      icon: <SecurityIcon />, 
      component: <SecuritySettings />,
      roles: ['admin', 'manager', 'chef', 'employee', 'user']
    },
    { 
      label: 'Gestion des Accès', 
      icon: <LockOpenIcon />, 
      component: <AccessManagement />,
      roles: ['admin'] // Only admin can manage user access
    },
    { 
      label: 'Système', 
      icon: <InfoIcon />, 
      component: <SystemInfoSettings />,
      roles: ['admin'] // Restrict system info to admins only
    }
  ];

  // Filter tabs based on user role
  const tabs = allTabs.filter(tab => hasAccess(tab.roles));
  
  // If the current tab is no longer accessible after filtering, reset to the first tab
  if (tabValue >= tabs.length) {
    setTabValue(0);
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Paper sx={{ mb: 3, p: 2, backgroundColor: 'background.paper' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Paramètres
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Personnalisez l'application selon vos préférences
        </Typography>
      </Paper>
      
      <Paper sx={{ minHeight: 650 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="paramètres de l'application"
          >
            {tabs.map((tab, index) => (
              <Tab 
                key={index}
                label={tab.label} 
                icon={tab.icon} 
                iconPosition="start"
                {...a11yProps(index)} 
              />
            ))}
          </Tabs>
        </Box>
        
        {tabs.map((tab, index) => (
          <TabPanel key={index} value={tabValue} index={index}>
            {tab.component}
          </TabPanel>
        ))}
      </Paper>
      
      <Snackbar 
        open={status.show} 
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={status.severity} 
          sx={{ width: '100%' }}
        >
          {status.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings; 