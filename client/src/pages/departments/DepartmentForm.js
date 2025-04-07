import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import apiClient from '../../utils/api';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

// Validation schema
const DepartmentSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name is too short')
    .max(50, 'Name is too long')
    .required('Department name is required'),
  description: Yup.string()
    .max(500, 'Description is too long'),
  active: Yup.boolean()
});

const DepartmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const fetchDepartment = async () => {
      if (!isEditMode) return;
      
      try {
        setLoading(true);
        const res = await apiClient.get(`/departments/${id}`);
        setDepartment(res.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching department:', err);
        setError('Failed to load department details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartment();
  }, [id, isEditMode]);

  const initialValues = {
    name: department?.name || '',
    description: department?.description || '',
    active: department?.active ?? true
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setSubmitError(null);
      
      if (isEditMode) {
        await apiClient.put(`/departments/${id}`, values);
      } else {
        await apiClient.post('/departments', values);
      }
      
      navigate('/departments');
    } catch (err) {
      console.error('Error saving department:', err);
      setSubmitError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Failed to save department. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          component={Link}
          to="/departments"
          startIcon={<ArrowBackIcon />}
          sx={{ mr: 2 }}
        >
          Back to Departments
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Edit Department' : 'Create Department'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {submitError}
          </Alert>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={DepartmentSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, touched, errors, values, handleChange }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="name"
                    name="name"
                    label="Department Name"
                    value={values.name}
                    onChange={handleChange}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="description"
                    name="description"
                    label="Description"
                    value={values.description}
                    onChange={handleChange}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                    variant="outlined"
                    multiline
                    rows={4}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={values.active}
                        onChange={handleChange}
                        name="active"
                        color="primary"
                      />
                    }
                    label="Active"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      component={Link}
                      to="/departments"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Department'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default DepartmentForm; 