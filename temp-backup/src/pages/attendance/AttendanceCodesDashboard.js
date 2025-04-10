import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Tooltip,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tabs,
  Tab,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  FilterList as FilterListIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Sick as SickIcon,
  BeachAccess as BeachAccessIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  ChildCare as ChildCareIcon,
  LocalHospital as LocalHospitalIcon,
  EventBusy as EventBusyIcon,
  EventAvailable as EventAvailableIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

// Définition des codes de présence
const attendanceCodes = [
  // Section Présent (Vert)
  {
    section: "Présent",
    color: "#4CAF50",
    codes: [
      { code: "P", label: "Présent Une Journée", description: "Employé présent pour une journée complète de travail (8 heures). Paie complète applicable.", icon: <CheckCircleIcon /> },
      { code: "JT", label: "Jours déjà travaillé", description: "Journée déjà comptabilisée comme travaillée dans une période précédente. Utilisé pour éviter le double comptage.", icon: <CheckCircleIcon /> },
      { code: "PP", label: "Une Journée + Prime", description: "Présent une journée complète avec prime additionnelle de 1000.00 DA. Utilisé pour les journées avec bonus de performance.", icon: <CheckCircleIcon /> },
      { code: "2P", label: "Double Journée", description: "Employé ayant travaillé l'équivalent de deux journées (16 heures). Comptabilisé comme deux jours de travail.", icon: <CheckCircleIcon /> },
      { code: "2P/PP", label: "Double Journée + Prime", description: "Double journée de travail (16 heures) avec prime additionnelle de 1000.00 DA. Pour travail exceptionnel.", icon: <CheckCircleIcon /> },
      { code: "PR", label: "Journée de remplacement", description: "Journée travaillée en remplacement d'une absence antérieure. Permet d'équilibrer le temps de travail.", icon: <CheckCircleIcon /> },
      { code: "PR/2-AN/2", label: "Demi Journée remplacement/absence", description: "Demi-journée travaillée en remplacement et demi-journée d'absence non justifiée. Paie partielle applicable.", icon: <HourglassEmptyIcon /> },
      { code: "PR/2-AN1/2", label: "Demi Journée remplacement/absence influenceur", description: "Demi-journée travaillée en remplacement et demi-journée d'absence non justifiée pour un employé avec statut influenceur.", icon: <InfoIcon /> },
      { code: "PN", label: "Présent En Permanence", description: "Employé présent en permanence sur le lieu de travail. Utilisé pour le personnel de garde ou de surveillance continue.", icon: <CheckCircleIcon /> },
      { code: "P/2", label: "Présent Demi Journée", description: "Employé présent pour une demi-journée de travail (4 heures). Paie partielle applicable selon le contrat.", icon: <HourglassEmptyIcon /> },
      { code: "P/4", label: "Présent Quart de Journée", description: "Employé présent pour un quart de journée (2 heures). Utilisé pour les interventions courtes ou formations partielles.", icon: <HourglassEmptyIcon /> },
      { code: "N-P/2", label: "Nouveau recruté Demi Journée", description: "Nouveau employé présent pour une demi-journée, généralement pour l'intégration ou la formation initiale.", icon: <HourglassEmptyIcon /> },
      { code: "PH", label: "Heures Supplémentaires", description: "Présent avec heures supplémentaires. Utilisé quand l'employé effectue des heures au-delà de son horaire normal.", icon: <CheckCircleIcon /> },
      { code: "PH/2", label: "Heures Supplémentaires/2", description: "Demi-journée avec heures supplémentaires. Pour comptabiliser des heures supplémentaires sur une demi-journée.", icon: <HourglassEmptyIcon /> },
      { code: "PC", label: "Présent + Conduite", description: "Présent avec responsabilité de conduite de véhicule. Inclut une prime pour la conduite professionnelle.", icon: <CheckCircleIcon /> },
      { code: "PC/2", label: "Présent Demi journée + Conduite", description: "Présent une demi-journée avec responsabilité de conduite. Prime de conduite applicable au prorata.", icon: <HourglassEmptyIcon /> }
    ]
  },
  // Section Mission (Ambre)
  {
    section: "Mission",
    color: "#FF9800",
    codes: [
      { code: "MS", label: "Mission", description: "Employé en mission professionnelle externe. Inclut généralement des indemnités de déplacement et frais de mission.", icon: <WorkIcon /> },
      { code: "MS/2", label: "Mission Demi Journée", description: "Mission professionnelle d'une demi-journée. Indemnités et frais calculés au prorata de la durée.", icon: <WorkIcon /> },
      { code: "HP", label: "Changement de poste", description: "Journée de transition lors d'un changement de poste. Permet de suivre les mouvements internes du personnel.", icon: <WorkIcon /> },
      { code: "CH", label: "Changement de chantier", description: "Journée consacrée au changement de lieu de travail ou de chantier. Inclut généralement le temps de déplacement.", icon: <WorkIcon /> },
      { code: "JD", label: "Jour Déplacé", description: "Jour de travail déplacé à une autre date. Permet de suivre les modifications du planning de travail.", icon: <EventAvailableIcon /> }
    ]
  },
  // Section Congés Payés (Bleu)
  {
    section: "Congés Payés",
    color: "#2196F3",
    codes: [
      { code: "CA", label: "Congés Annuels", description: "Congé annuel payé, prévu par le contrat de travail. Droit acquis selon l'ancienneté et la législation du travail.", icon: <BeachAccessIcon /> },
      { code: "CRP", label: "Congés de Récupération Payé", description: "Congé accordé en récupération d'heures supplémentaires ou de travail exceptionnel. Entièrement rémunéré.", icon: <EventAvailableIcon /> },
      { code: "CRP/2", label: "Congés de Récupération Payé demi journée", description: "Demi-journée de récupération pour heures supplémentaires. Rémunération maintenue pour la demi-journée.", icon: <EventAvailableIcon /> },
      { code: "CRP.P", label: "Congé Récupération Prêt Payé", description: "Congé de récupération accordé par anticipation (prêt de jours). Sera compensé ultérieurement.", icon: <EventAvailableIcon /> },
      { code: "CRP.P/2", label: "Congé Récupération Prêt Payé demi journée", description: "Demi-journée de récupération accordée par anticipation. Compensation ultérieure prévue.", icon: <EventAvailableIcon /> },
      { code: "DC", label: "Absences pour Décès", description: "Congé exceptionnel pour décès d'un proche. Durée variable selon le lien de parenté conformément à la législation.", icon: <EventAvailableIcon /> },
      { code: "DCI", label: "Absences pour Décès Influencer", description: "Congé pour décès accordé à un employé avec statut influenceur. Conditions spécifiques potentiellement applicables.", icon: <EventAvailableIcon /> },
      { code: "AOP", label: "Absence Autorisée Payée", description: "Absence exceptionnelle autorisée avec maintien de salaire. Pour événements spéciaux reconnus par l'entreprise.", icon: <EventAvailableIcon /> },
      { code: "AOP.I", label: "Absence Autorisée Payée Influencer", description: "Absence autorisée avec salaire pour un employé avec statut influenceur. Traitement spécifique applicable.", icon: <EventAvailableIcon /> }
    ]
  },
  // Section Congé Maladie (Rouge)
  {
    section: "Congé Maladie",
    color: "#F44336",
    codes: [
      { code: "CM", label: "Congé Maladie", description: "Absence justifiée par un certificat médical. Maintien du salaire selon la convention collective et la législation.", icon: <SickIcon /> },
      { code: "CM.I", label: "Congé Maladie Influencer", description: "Congé maladie pour un employé avec statut influenceur. Traitement spécifique selon la politique de l'entreprise.", icon: <SickIcon /> },
      { code: "CM/2", label: "Congé Maladie Demi-journée", description: "Congé maladie pour une demi-journée, justifié par un certificat médical. Salaire maintenu au prorata.", icon: <SickIcon /> },
      { code: "CM1/2", label: "Congé Maladie Demi-journée Influencer", description: "Congé maladie d'une demi-journée pour un employé avec statut influenceur. Traitement spécifique au prorata.", icon: <SickIcon /> }
    ]
  },
  // Section Congé sans Solde (Orange foncé)
  {
    section: "Congé sans Solde",
    color: "#E64A19",
    codes: [
      { code: "CSS", label: "Congé Sans Solde", description: "Congé accordé sans rémunération à la demande de l'employé. N'affecte pas l'ancienneté mais sans maintien de salaire.", icon: <EventBusyIcon /> },
      { code: "SS/AI", label: "Sans Solde Absance Irrégulière", description: "Absence irrégulière convertie en congé sans solde. Utilisé pour régulariser administrativement une absence.", icon: <EventBusyIcon /> },
      { code: "AON", label: "Absence autorisée Non Payée", description: "Absence préalablement autorisée par la direction mais sans maintien de salaire. Accord formalisé requis.", icon: <EventBusyIcon /> },
      { code: "AON.I", label: "Absence autorisée Non Payée Influencer", description: "Absence autorisée sans salaire pour un employé avec statut influenceur. Conditions spécifiques applicables.", icon: <EventBusyIcon /> }
    ]
  },
  // Section Absence justifiée (Jaune)
  {
    section: "Absence justifiée",
    color: "#FFC107",
    codes: [
      { code: "AJ", label: "Absense justifiée", description: "Absence avec justificatif valide (autre que médical). Traitement salarial selon le motif et la convention.", icon: <InfoIcon /> },
      { code: "AJ.I", label: "Absense justifiée Influencer", description: "Absence justifiée pour un employé avec statut influenceur. Traitement spécifique selon la politique interne.", icon: <InfoIcon /> },
      { code: "AJ/2", label: "Absense justifiée Demi Journée", description: "Absence justifiée pour une demi-journée. Impact salarial au prorata selon le motif de l'absence.", icon: <HourglassEmptyIcon /> },
      { code: "AJ1/2", label: "Absense justifiée Demi Journée Influencer", description: "Absence justifiée d'une demi-journée pour un employé avec statut influenceur. Traitement spécifique.", icon: <InfoIcon /> }
    ]
  },
  // Section Absence non justifiée (Gris foncé)
  {
    section: "Absence non justifiée",
    color: "#616161",
    codes: [
      { code: "AN", label: "Absense non justifiée", description: "Absence sans justificatif valable. Entraîne une retenue sur salaire et peut faire l'objet de sanctions disciplinaires.", icon: <CancelIcon /> },
      { code: "AN.I", label: "Absense non justifiée Influencer", description: "Absence non justifiée pour un employé avec statut influenceur. Traitement spécifique mais avec retenue de salaire.", icon: <CancelIcon /> },
      { code: "AN/2", label: "Absense non justifiée Demi Journée", description: "Absence non justifiée d'une demi-journée. Retenue sur salaire proportionnelle à la durée.", icon: <HourglassEmptyIcon /> },
      { code: "AN1/2", label: "Absense non justifiée Demi Journée Influencer", description: "Absence non justifiée d'une demi-journée pour un employé avec statut influenceur. Traitement spécifique.", icon: <CancelIcon /> }
    ]
  },
  // Section Abandonnement de Poste (Rouge foncé)
  {
    section: "Abandonnement de Poste",
    color: "#B71C1C",
    codes: [
      { code: "AP", label: "Abandonnement de Poste Indiminisée", description: "Abandon de poste avec indemnisation prévue. Généralement dans le cadre d'un accord de départ négocié.", icon: <CancelIcon /> },
      { code: "AP.I", label: "Abandonnement de Poste Indiminisée Influencer", description: "Abandon de poste indemnisé pour un employé avec statut influenceur. Conditions spéciales applicables.", icon: <CancelIcon /> },
      { code: "AP1/2", label: "Abandonnement de Poste Indiminisée Demi Journée", description: "Abandon de poste indemnisé sur une demi-journée. Cas particulier pour départ en cours de journée.", icon: <HourglassEmptyIcon /> },
      { code: "AP.I1/2", label: "Abandonnement de Poste Indiminisée Demi Journée Influencer", description: "Abandon de poste indemnisé d'une demi-journée pour un employé avec statut influenceur.", icon: <CancelIcon /> },
      { code: "AP.N", label: "Abandonnement de Poste non Indiminisée", description: "Abandon de poste sans indemnisation. Constitue une faute grave pouvant justifier un licenciement.", icon: <CancelIcon /> },
      { code: "AP.NI", label: "Abandonnement de Poste non Indiminisée Influencer", description: "Abandon de poste non indemnisé pour un employé avec statut influenceur. Traitement disciplinaire spécifique.", icon: <CancelIcon /> }
    ]
  },
  // Section Grève (Rouge-orange)
  {
    section: "Grève",
    color: "#FF5722",
    codes: [
      { code: "G.L", label: "Grève Légal", description: "Participation à un mouvement de grève légal. Suspension du contrat sans rémunération mais sans sanction disciplinaire.", icon: <EventBusyIcon /> },
      { code: "G.LI", label: "Grève Légal Influencer", description: "Participation à une grève légale pour un employé avec statut influenceur. Traitement spécifique applicable.", icon: <EventBusyIcon /> },
      { code: "G.I", label: "Grève Illégal", description: "Participation à un mouvement de grève non conforme aux dispositions légales. Peut entraîner des sanctions.", icon: <EventBusyIcon /> },
      { code: "G.II", label: "Grève Illégal Influencer", description: "Participation à une grève illégale pour un employé avec statut influenceur. Traitement disciplinaire spécifique.", icon: <EventBusyIcon /> }
    ]
  },
  // Section Jours Fériés et Week-end (Violet)
  {
    section: "Jours Fériés et Week-end",
    color: "#673AB7",
    codes: [
      { code: "JF", label: "Jours fériés", description: "Jour férié légal avec maintien de salaire. Applicable à tous les employés selon le calendrier officiel des jours fériés.", icon: <EventAvailableIcon /> },
      { code: "W", label: "Week end", description: "Jour de repos hebdomadaire (généralement samedi et/ou dimanche). Non travaillé et non rémunéré (sauf exception).", icon: <EventAvailableIcon /> },
      { code: "W/2", label: "Week end demi journée", description: "Demi-journée de week-end. Utilisé quand une partie de la journée de repos est travaillée exceptionnellement.", icon: <HourglassEmptyIcon /> }
    ]
  },
  // Section Fin de Contrat (Marron)
  {
    section: "Fin de Contrat",
    color: "#795548",
    codes: [
      { code: "DM", label: "Démission", description: "Jour de démission effective de l'employé. Marque la fin du contrat à l'initiative du salarié.", icon: <CancelIcon /> },
      { code: "FC", label: "Fin de Contrat", description: "Dernier jour de contrat (CDD, intérim, période d'essai). Marque la fin de la relation contractuelle.", icon: <CancelIcon /> }
    ]
  },
  // Section Autres (Bleu-gris)
  {
    section: "Autres",
    color: "#607D8B",
    codes: [
      { code: "D", label: "Déclaré", description: "Journée déclarée administrativement sans précision particulière. Utilisé pour des cas spécifiques de régularisation.", icon: <InfoIcon /> }
    ]
  }
];

const AttendanceCodesDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [codeDetailOpen, setCodeDetailOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState(null);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSectionChange = (event, newValue) => {
    setSelectedSection(newValue);
  };

  const handleCodeClick = (code) => {
    setSelectedCode(code);
    setCodeDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setCodeDetailOpen(false);
  };

  const exportToCsv = () => {
    const headers = ['Code', 'Libellé', 'Description', 'Section'];
    const data = attendanceCodes.flatMap(section => 
      section.codes.map(code => [
        code.code,
        code.label,
        code.description,
        section.section
      ])
    );
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'codes_presence.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCodes = attendanceCodes
    .filter(section => selectedSection === 'all' || section.section === selectedSection)
    .map(section => ({
      ...section,
      codes: section.codes.filter(code => 
        code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(section => section.codes.length > 0);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tableau de Bord des Codes de Présence
        </Typography>
        <Box>
          <Button
            component={Link}
            to="/attendance"
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 1 }}
          >
            Retour
          </Button>
          <Button
            component={Link}
            to="/attendance/codes"
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            sx={{ mr: 1 }}
          >
            Gérer les Codes
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            sx={{ mr: 1 }}
          >
            Imprimer
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={exportToCsv}
          >
            Exporter
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Guide des Codes de Présence
        </Typography>
        <Typography variant="body1" paragraph>
          Ce tableau de bord présente tous les codes utilisés pour le suivi de présence des employés. 
          Utilisez ces codes pour remplir les feuilles de temps et les registres de présence.
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body1">
            <strong>Légende des suffixes:</strong>
          </Typography>
          <Typography variant="body2">
            • <strong>/2</strong> - Indique une demi-journée
          </Typography>
          <Typography variant="body2">
            • <strong>/I</strong> - Indique un statut influencé par un facteur externe
          </Typography>
        </Alert>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher un code..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {filteredCodes.reduce((total, section) => total + section.codes.length, 0)} codes trouvés
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedSection}
          onChange={handleSectionChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            '& .MuiTab-root': { 
              fontWeight: 'bold',
              minWidth: 120
            }
          }}
        >
          <Tab label="Tous les codes" value="all" />
          {attendanceCodes.map((section) => (
            <Tab 
              key={section.section} 
              label={section.section} 
              value={section.section}
              sx={{ 
                color: section.color,
                '&.Mui-selected': {
                  backgroundColor: `${section.color}20`,
                  color: section.color
                }
              }}
            />
          ))}
        </Tabs>
      </Paper>

      {filteredCodes.length === 0 ? (
        <Alert severity="info">
          Aucun code ne correspond à votre recherche.
        </Alert>
      ) : (
        filteredCodes.map((section) => (
          <Paper key={section.section} sx={{ mb: 3, overflow: 'hidden', boxShadow: 3 }}>
            <Box sx={{ bgcolor: section.color, p: 2, color: 'white' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{section.section}</Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: `${section.color}15` }}>
                    <TableCell width="10%" sx={{ fontWeight: 'bold' }}>Code</TableCell>
                    <TableCell width="20%" sx={{ fontWeight: 'bold' }}>Libellé</TableCell>
                    <TableCell width="50%" sx={{ fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell width="20%" align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {section.codes.map((code) => (
                    <TableRow key={code.code} hover sx={{ '&:hover': { bgcolor: `${section.color}10` } }}>
                      <TableCell>
                        <Chip 
                          label={code.code} 
                          color="primary" 
                          sx={{ 
                            bgcolor: section.color,
                            fontWeight: 'bold',
                            color: 'white'
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: section.color, 
                              width: 24, 
                              height: 24,
                              mr: 1
                            }}
                          >
                            {code.icon}
                          </Avatar>
                          <Typography sx={{ fontWeight: 'medium' }}>{code.label}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{code.description}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Détails">
                          <IconButton 
                            size="small" 
                            onClick={() => handleCodeClick(code)}
                            sx={{ color: section.color }}
                          >
                            <InfoIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ))
      )}

      {/* Dialogue de détails du code */}
      <Dialog
        open={codeDetailOpen}
        onClose={handleCloseDetail}
        maxWidth="sm"
        fullWidth
      >
        {selectedCode && (
          <>
            <DialogTitle>
              Détails du Code: {selectedCode.code}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: attendanceCodes.find(s => 
                          s.codes.some(c => c.code === selectedCode.code)
                        )?.color,
                        mr: 2
                      }}
                    >
                      {selectedCode.icon}
                    </Avatar>
                    <Typography variant="h6">{selectedCode.label}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Description</Typography>
                  <Typography variant="body1" paragraph>
                    {selectedCode.description}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Catégorie</Typography>
                  <Chip 
                    label={attendanceCodes.find(s => 
                      s.codes.some(c => c.code === selectedCode.code)
                    )?.section} 
                    sx={{ 
                      bgcolor: attendanceCodes.find(s => 
                        s.codes.some(c => c.code === selectedCode.code)
                      )?.color,
                      color: 'white'
                    }} 
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Utilisation</Typography>
                  <Typography variant="body1">
                    Ce code doit être utilisé pour {selectedCode.description.toLowerCase()}.
                    {selectedCode.code.includes('/2') && (
                      <Box component="span" sx={{ display: 'block', mt: 1 }}>
                        <strong>Note:</strong> Ce code représente une demi-journée.
                      </Box>
                    )}
                    {selectedCode.code.includes('/I') && (
                      <Box component="span" sx={{ display: 'block', mt: 1 }}>
                        <strong>Note:</strong> Ce code indique un statut influencé par un facteur externe.
                      </Box>
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetail}>Fermer</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Section d'aide */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Comment utiliser les codes de présence
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Pour les responsables RH
            </Typography>
            <Typography variant="body2" paragraph>
              1. Utilisez ces codes pour remplir les feuilles de temps quotidiennes.
            </Typography>
            <Typography variant="body2" paragraph>
              2. Assurez-vous de vérifier les justificatifs pour les absences.
            </Typography>
            <Typography variant="body2" paragraph>
              3. Pour les codes avec suffixe "/I", documentez le facteur d'influence.
            </Typography>
            <Typography variant="body2">
              4. Générez des rapports mensuels pour analyser les tendances de présence.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Pour les responsables de paie
            </Typography>
            <Typography variant="body2" paragraph>
              1. Les codes "P" et "M" sont comptabilisés comme temps de travail normal.
            </Typography>
            <Typography variant="body2" paragraph>
              2. Les codes "CM", "CA", "CE" et "CMA" sont des absences justifiées rémunérées.
            </Typography>
            <Typography variant="body2" paragraph>
              3. Les codes "CSS" et "A" sont des absences non rémunérées.
            </Typography>
            <Typography variant="body2">
              4. Les codes "/2" comptent pour une demi-journée de travail ou d'absence.
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AttendanceCodesDashboard; 