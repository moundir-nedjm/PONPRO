import { createTheme } from '@mui/material/styles';

// Define custom colors for attendance statuses
export const statusColors = {
  present: { bg: '#e8f5e9', text: '#2e7d32' },
  presentPremium: { bg: '#81c784', text: '#1b5e20' },
  absent: { bg: '#ffcdd2', text: '#c62828' },
  absentJustified: { bg: '#ffecb3', text: '#ef6c00' },
  halfDay: { bg: '#dcedc8', text: '#33691e' },
  weekend: { bg: '#f5f5f5', text: '#9e9e9e' },
  mission: { bg: '#bbdefb', text: '#1565c0' },
  aop: { bg: '#e1bee7', text: '#6a1b9a' },
  ca: { bg: '#b3e5fc', text: '#0277bd' },
  cm: { bg: '#d1c4e9', text: '#4527a0' },
  hp: { bg: '#c5cae9', text: '#283593' },
  css: { bg: '#ffccbc', text: '#bf360c' },
  crp: { bg: '#f8bbd0', text: '#ad1457' },
  ph: { bg: '#b2dfdb', text: '#00695c' },
  jt: { bg: '#c8e6c9', text: '#2e7d32' },
  twoP: { bg: '#a5d6a7', text: '#1b5e20' },
  aj: { bg: '#fff9c4', text: '#f57f17' },
  an: { bg: '#ffcdd2', text: '#c62828' },
  aon: { bg: '#f8bbd0', text: '#880e4f' },
};

// Helper function to get status style
export const getStatusStyle = (code) => {
  switch(code) {
    case 'P': return statusColors.present;
    case 'PP': return statusColors.presentPremium;
    case 'AOP': return statusColors.aop;
    case 'AN': return statusColors.absent;
    case 'MS': return statusColors.mission;
    case 'AJ': return statusColors.absentJustified;
    case 'P/2': return statusColors.halfDay;
    case 'W': return statusColors.weekend;
    case 'CA': return statusColors.ca;
    case 'CM': return statusColors.cm;
    case 'HP': return statusColors.hp;
    case 'JT': return statusColors.jt;
    case 'CSS': return statusColors.css;
    case 'CRP': return statusColors.crp;
    case 'PH': return statusColors.ph;
    case '2P': return statusColors.twoP;
    case 'AON': return statusColors.aon;
    default: return { bg: '#f5f5f5', text: '#000000' };
  }
};

// Create custom MUI theme with attendance styling
export const attendanceTheme = createTheme({
  components: {
    MuiChip: {
      variants: [
        {
          props: { variant: 'attendance', color: 'present' },
          style: {
            backgroundColor: statusColors.present.bg,
            color: statusColors.present.text,
            fontWeight: 'bold',
          },
        },
        {
          props: { variant: 'attendance', color: 'absent' },
          style: {
            backgroundColor: statusColors.absent.bg,
            color: statusColors.absent.text,
            fontWeight: 'bold',
          },
        },
        {
          props: { variant: 'attendance', color: 'late' },
          style: {
            backgroundColor: statusColors.absentJustified.bg,
            color: statusColors.absentJustified.text,
            fontWeight: 'bold',
          },
        },
      ],
    },
  },
});

// CSS classes for status codes (for use with className)
export const statusClasses = {
  'P': 'status-present',
  'PP': 'status-present-premium',
  'AOP': 'status-aop',
  'AN': 'status-absent',
  'MS': 'status-mission',
  'AJ': 'status-absent-justified',
  'P/2': 'status-half-day',
  'W': 'status-weekend',
  'CA': 'status-ca',
  'CM': 'status-cm',
  'HP': 'status-hp',
  'JT': 'status-jt',
  'CSS': 'status-css',
  'CRP': 'status-crp',
  'PH': 'status-ph',
  '2P': 'status-2p',
};

// CSS string to include in components
export const statusStyles = `
  .status-present { background-color: #e8f5e9; color: #2e7d32; }
  .status-present-premium { background-color: #81c784; color: #1b5e20; }
  .status-absent { background-color: #ffcdd2; color: #c62828; }
  .status-absent-justified { background-color: #ffecb3; color: #ef6c00; }
  .status-half-day { background-color: #dcedc8; color: #33691e; }
  .status-weekend { background-color: #f5f5f5; color: #9e9e9e; }
  .status-mission { background-color: #bbdefb; color: #1565c0; }
  .status-aop { background-color: #e1bee7; color: #6a1b9a; }
  .status-ca { background-color: #b3e5fc; color: #0277bd; }
  .status-cm { background-color: #d1c4e9; color: #4527a0; }
  .status-hp { background-color: #c5cae9; color: #283593; }
  .status-css { background-color: #ffccbc; color: #bf360c; }
  .status-crp { background-color: #f8bbd0; color: #ad1457; }
  .status-ph { background-color: #b2dfdb; color: #00695c; }
  .status-jt { background-color: #c8e6c9; color: #2e7d32; }
  .status-2p { background-color: #a5d6a7; color: #1b5e20; }
`; 