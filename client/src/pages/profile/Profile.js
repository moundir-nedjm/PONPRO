import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Person as PersonIcon,
  Save as SaveIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

// Validation schemas
const ProfileSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'First name is too short')
    .max(50, 'First name is too long')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name is too short')
    .max(50, 'Last name is too long')
    .required('Last name is required'),
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9+\-\s()]*$/, 'Invalid phone number'),
  address: Yup.string()
    .max(200, 'Address is too long')
});

const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required')
});

// TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
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

const Profile = () => {
  const { currentUser, updateProfile, changePassword, error: authError } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProfileSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    setProfileError(null);
    setProfileSuccess(false);
    
    try {
      const success = await updateProfile(values);
      if (success) {
        setProfileSuccess(true);
      } else {
        setProfileError(authError || 'Failed to update profile. Please try again.');
      }
    } catch (err) {
      setProfileError('An unexpected error occurred. Please try again.');
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (values, { setSubmitting, resetForm }) => {
    setLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);
    
    try {
      const success = await changePassword(values.currentPassword, values.newPassword);
      if (success) {
        setPasswordSuccess(true);
        resetForm();
      } else {
        setPasswordError(authError || 'Failed to change password. Please try again.');
      }
    } catch (err) {
      setPasswordError('An unexpected error occurred. Please try again.');
      console.error('Password change error:', err);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  if (!currentUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
              <Avatar
                sx={{ width: 100, height: 100, mb: 2, bgcolor: 'primary.main' }}
              >
                {currentUser.firstName?.charAt(0)}{currentUser.lastName?.charAt(0)}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {currentUser.firstName} {currentUser.lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {currentUser.position || 'No position specified'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentUser.department?.name || 'No department assigned'}
              </Typography>
              <Box sx={{ mt: 2, width: '100%' }}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{currentUser.email}</Typography>
                </Box>
                {currentUser.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{currentUser.phone}</Typography>
                  </Box>
                )}
                {currentUser.address && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <HomeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{currentUser.address}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BadgeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    Employee ID: {currentUser.employeeId || 'Not assigned'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
                <Tab icon={<PersonIcon />} label="Edit Profile" id="profile-tab-0" aria-controls="profile-tabpanel-0" />
                <Tab icon={<LockIcon />} label="Change Password" id="profile-tab-1" aria-controls="profile-tabpanel-1" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              {profileSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Profile updated successfully!
                </Alert>
              )}
              {profileError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {profileError}
                </Alert>
              )}

              <Formik
                initialValues={{
                  firstName: currentUser.firstName || '',
                  lastName: currentUser.lastName || '',
                  email: currentUser.email || '',
                  phone: currentUser.phone || '',
                  address: currentUser.address || ''
                }}
                validationSchema={ProfileSchema}
                onSubmit={handleProfileSubmit}
                enableReinitialize
              >
                {({ isSubmitting, touched, errors, values, handleChange }) => (
                  <Form>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Field
                          as={TextField}
                          fullWidth
                          id="firstName"
                          name="firstName"
                          label="First Name"
                          value={values.firstName}
                          onChange={handleChange}
                          error={touched.firstName && Boolean(errors.firstName)}
                          helperText={touched.firstName && errors.firstName}
                          variant="outlined"
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Field
                          as={TextField}
                          fullWidth
                          id="lastName"
                          name="lastName"
                          label="Last Name"
                          value={values.lastName}
                          onChange={handleChange}
                          error={touched.lastName && Boolean(errors.lastName)}
                          helperText={touched.lastName && errors.lastName}
                          variant="outlined"
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          fullWidth
                          id="email"
                          name="email"
                          label="Email"
                          value={values.email}
                          onChange={handleChange}
                          error={touched.email && Boolean(errors.email)}
                          helperText={touched.email && errors.email}
                          variant="outlined"
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          fullWidth
                          id="phone"
                          name="phone"
                          label="Phone"
                          value={values.phone}
                          onChange={handleChange}
                          error={touched.phone && Boolean(errors.phone)}
                          helperText={touched.phone && errors.phone}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          fullWidth
                          id="address"
                          name="address"
                          label="Address"
                          value={values.address}
                          onChange={handleChange}
                          error={touched.address && Boolean(errors.address)}
                          helperText={touched.address && errors.address}
                          variant="outlined"
                          multiline
                          rows={3}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={<SaveIcon />}
                          disabled={isSubmitting || loading}
                        >
                          {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Form>
                )}
              </Formik>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {passwordSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Password changed successfully!
                </Alert>
              )}
              {passwordError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {passwordError}
                </Alert>
              )}

              <Formik
                initialValues={{
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                }}
                validationSchema={PasswordSchema}
                onSubmit={handlePasswordSubmit}
              >
                {({ isSubmitting, touched, errors, values, handleChange }) => (
                  <Form>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          fullWidth
                          id="currentPassword"
                          name="currentPassword"
                          label="Current Password"
                          type="password"
                          value={values.currentPassword}
                          onChange={handleChange}
                          error={touched.currentPassword && Boolean(errors.currentPassword)}
                          helperText={touched.currentPassword && errors.currentPassword}
                          variant="outlined"
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          fullWidth
                          id="newPassword"
                          name="newPassword"
                          label="New Password"
                          type="password"
                          value={values.newPassword}
                          onChange={handleChange}
                          error={touched.newPassword && Boolean(errors.newPassword)}
                          helperText={touched.newPassword && errors.newPassword}
                          variant="outlined"
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Field
                          as={TextField}
                          fullWidth
                          id="confirmPassword"
                          name="confirmPassword"
                          label="Confirm New Password"
                          type="password"
                          value={values.confirmPassword}
                          onChange={handleChange}
                          error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                          helperText={touched.confirmPassword && errors.confirmPassword}
                          variant="outlined"
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={<LockIcon />}
                          disabled={isSubmitting || loading}
                        >
                          {loading ? 'Changing...' : 'Change Password'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Form>
                )}
              </Formik>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile; 