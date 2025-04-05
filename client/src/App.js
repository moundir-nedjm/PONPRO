import React, { useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useSettings } from './context/SettingsContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { SocketProvider } from './context/SocketContext';
import { AttendanceProvider } from './context/AttendanceContext';
import { OrganizationProvider } from './context/OrganizationContext';

// Layout Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import NotFound from './pages/errors/NotFound';
import Unauthorized from './pages/errors/Unauthorized';
import Login from './pages/auth/Login';

// Dashboard and Main Pages
import Dashboard from './pages/dashboard/Dashboard';
// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeStats from './pages/employee/Stats';
import EmployeeBiometrics from './pages/employee/Biometrics';
import FaceSettings from './pages/employee/settings/face';
import FingerprintSettings from './pages/employee/settings/fingerprint';
import AdminBiometricsSettings from './pages/admin/settings/biometrics';
import DocumentManagement from './pages/documents/DocumentManagement';

// Employee Pages
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeDetail from './pages/employees/EmployeeDetail';
import EmployeeForm from './pages/employees/EmployeeForm';
import EmployeeSchedule from './pages/employees/EmployeeSchedule';

// Attendance Pages
import AttendanceList from './pages/attendance/AttendanceList';
import AttendanceForm from './pages/attendance/AttendanceForm';
import TodayAttendance from './pages/attendance/TodayAttendance';
import AttendanceTable from './pages/attendance/AttendanceTable';
import AttendanceCodes from './pages/attendance/AttendanceCodes';
import AttendanceCodeAssignment from './pages/attendance/AttendanceCodeAssignment';
import AttendanceDashboard from './pages/attendance/AttendanceDashboard';
import AttendancePrintView from './pages/attendance/AttendancePrintView';
import AttendanceStats from './pages/attendance/AttendanceStats';
import AttendanceCodesDashboard from './pages/attendance/AttendanceCodesDashboard';
import AttendanceMonthlySheet from './pages/attendance/AttendanceMonthlySheet';
import MonthlyAttendance, { MonthlySheetView } from './pages/attendance/MonthlyAttendance';

// Attendance Components
import AttendanceCodeLegend from './components/attendance/AttendanceCodeLegend';

// Department Pages
import DepartmentList from './pages/departments/DepartmentList';
import DepartmentDetail from './pages/departments/DepartmentDetail';
import DepartmentForm from './pages/departments/DepartmentForm';

// Leave Pages
import LeaveList from './pages/leaves/LeaveList';
import LeaveDetail from './pages/leaves/LeaveDetail';
import LeaveForm from './pages/leaves/LeaveForm';

// Report Pages
import AttendanceReport from './pages/reports/AttendanceReport';
import LeaveReport from './pages/reports/LeaveReport';
import PerformanceReport from './pages/reports/PerformanceReport';
import ReportGenerator from './pages/reports/ReportGenerator';

// Holidays Page
import Holidays from './pages/holidays/Holidays';
import HolidaysPrint from './pages/holidays/HolidaysPrint';
import HolidaysCalendar from './pages/holidays/HolidaysCalendar';

// Profile Pages
import Profile from './pages/profile/Profile';

// Settings Pages
import Settings from './pages/settings';

// Admin Settings
import OrganizationSettings from './pages/admin/settings/organization';
import AccessManagement from './pages/admin/settings/access';

// Help Pages
import Help from './pages/help';
import ArticleDetail from './pages/help/ArticleDetail';
import SectionDetail from './pages/help/SectionDetail';

// Create a separate component that uses the settings context
const AppWithTheme = () => {
  const { settings } = useSettings();
  
  // Create a theme based on settings
  const theme = useMemo(() => {
    // Default theme configuration
    const defaultTheme = {
      palette: {
        mode: settings?.appearance?.theme === 'system' 
          ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
          : settings?.appearance?.theme || 'light',
        primary: {
          main: settings?.appearance?.primaryColor || '#1976d2',
        },
        secondary: {
          main: settings?.appearance?.secondaryColor || '#dc004e',
        },
      },
      typography: {
        fontSize: settings?.appearance?.fontSize === 'small' ? 12 : 
                 settings?.appearance?.fontSize === 'large' ? 16 : 14,
      },
      shape: {
        borderRadius: settings?.appearance?.borderRadius === 'small' ? 4 : 
                     settings?.appearance?.borderRadius === 'large' ? 16 : 8,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              padding: settings?.appearance?.density === 'compact' ? '6px 16px' : 
                      settings?.appearance?.density === 'spacious' ? '16px 24px' : '12px 16px',
            },
          },
        },
        MuiListItem: {
          styleOverrides: {
            root: {
              padding: settings?.appearance?.density === 'compact' ? '4px 16px' : 
                      settings?.appearance?.density === 'spacious' ? '12px 24px' : '8px 16px',
            },
          },
        },
      },
    };
    
    // Create the theme
    return createTheme(defaultTheme);
  }, [settings?.appearance]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Routes des Employés */}
          <Route path="employees">
            <Route index element={<EmployeeList />} />
            <Route path=":id" element={<EmployeeDetail />} />
            <Route path=":id/schedule" element={<EmployeeSchedule />} />
            <Route path="new" element={<EmployeeForm />} />
            <Route path="edit/:id" element={<EmployeeForm />} />
          </Route>

          {/* Routes de l'Espace Employé */}
          <Route path="employee">
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="stats" element={<EmployeeStats />} />
            <Route path="biometrics" element={<EmployeeBiometrics />} />
            <Route path="settings">
              <Route index element={<Navigate to="/employee/settings/face" />} />
              <Route path="face" element={
                <ProtectedRoute element={<FaceSettings />} allowedRoles={['employee', 'chef']} />
              } />
              <Route path="fingerprint" element={
                <ProtectedRoute element={<FingerprintSettings />} allowedRoles={['employee', 'chef']} />
              } />
            </Route>
          </Route>

          {/* Routes de Pointage */}
          <Route path="attendance">
            <Route index element={<AttendanceList />} />
            <Route path="today" element={<TodayAttendance />} />
            <Route path="table" element={<AttendanceTable />} />
            <Route path="monthly-sheet" element={<MonthlySheetView />} />
            <Route path="checkin" element={<AttendanceForm />} />
            <Route path="codes" element={<AttendanceCodes />} />
            <Route path="codes-dashboard" element={<AttendanceCodesDashboard />} />
            <Route path="code-assignment" element={<AttendanceCodeAssignment />} />
            <Route path="dashboard" element={<AttendanceDashboard />} />
            <Route path="stats" element={<AttendanceStats />} />
            <Route path="legend" element={<AttendanceCodeLegend />} />
            <Route path="print/:employeeId/:month/:year" element={<AttendancePrintView />} />
            <Route path="monthly/:employeeId" element={<MonthlyAttendance />} />
          </Route>

          {/* Routes des Départements */}
          <Route path="departments">
            <Route index element={<DepartmentList />} />
            <Route path=":id" element={<DepartmentDetail />} />
            <Route path="new" element={<DepartmentForm />} />
            <Route path="edit/:id" element={<DepartmentForm />} />
          </Route>

          {/* Routes des Congés */}
          <Route path="leaves">
            <Route index element={<LeaveList />} />
            <Route path=":id" element={<LeaveDetail />} />
            <Route path="new" element={<LeaveForm />} />
            <Route path="edit/:id" element={<LeaveForm />} />
          </Route>

          {/* Routes des Rapports */}
          <Route path="reports">
            <Route index element={<ReportGenerator />} />
            <Route path="generator" element={<ReportGenerator />} />
            <Route path="attendance" element={<AttendanceReport />} />
            <Route path="leaves" element={<LeaveReport />} />
            <Route path="performance" element={<PerformanceReport />} />
          </Route>

          {/* Routes du Calendrier */}
          <Route path="holidays">
            <Route index element={<Holidays />} />
            <Route path="print" element={<HolidaysPrint />} />
            <Route path="calendar" element={<HolidaysCalendar />} />
          </Route>

          {/* Route du Profil */}
          <Route path="profile" element={<Profile />} />

          {/* Route de Gestion des Renseignements */}
          <Route path="documents" element={<DocumentManagement />} />

          {/* Help Routes */}
          <Route path="help">
            <Route index element={<Help />} />
            <Route path="section/:sectionId" element={<SectionDetail />} />
            <Route path="article/:sectionId/:articleId" element={<ArticleDetail />} />
          </Route>

          {/* Settings Route */}
          <Route path="settings" element={<Settings />} />

          {/* Admin Routes */}
          <Route path="admin">
            <Route path="settings">
              <Route index element={<Navigate to="/admin/settings/organization" />} />
              <Route path="organization" element={
                <ProtectedRoute element={<OrganizationSettings />} allowedRoles={['admin']} />
              } />
              <Route path="biometrics" element={
                <ProtectedRoute element={<AdminBiometricsSettings />} allowedRoles={['admin']} />
              } />
              <Route path="access" element={
                <ProtectedRoute element={<AccessManagement />} allowedRoles={['admin']} />
              } />
            </Route>
          </Route>
        </Route>

        {/* Error Routes */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
};

function App() {
  // Move the providers here and use AppWithTheme
  return (
    <AuthProvider>
      <SettingsProvider>
        <SocketProvider>
          <OrganizationProvider>
            <AttendanceProvider>
              <AppWithTheme />
            </AttendanceProvider>
          </OrganizationProvider>
        </SocketProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
