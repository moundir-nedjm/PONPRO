import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Divider,
  Card,
  CardContent,
  CardHeader,
  ButtonGroup
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Info as InfoIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';

const CATEGORIES = [
  { value: 'present', label: 'Présent' },
  { value: 'absent', label: 'Absent' },
  { value: 'leave', label: 'Congé' },
  { value: 'holiday', label: 'Jour Férié' },
  { value: 'other', label: 'Autre' }
];

const PAYMENT_IMPACTS = [
  { value: 'full-pay', label: 'Paie complète' },
  { value: 'partial-pay', label: 'Paie partielle' },
  { value: 'no-pay', label: 'Sans paie' },
  { value: 'premium', label: 'Prime' }
];

// Mock attendance codes data
const mockAttendanceCodes = [
  {
    _id: '1',
    code: 'P',
    description: 'Présent Une Journée - Employé présent pour une journée complète de travail (8 heures). Paie complète applicable.',
    category: 'present',
    color: '#4CAF50',
    influencer: false,
    paymentImpact: 'full-pay',
    active: true
  },
  {
    _id: '2',
    code: 'JT',
    description: 'Jours déjà travaillé - Journée déjà comptabilisée comme travaillée dans une période précédente. Utilisé pour éviter le double comptage.',
    category: 'present',
    color: '#66BB6A',
    influencer: false,
    paymentImpact: 'full-pay',
    active: true
  },
  {
    _id: '3',
    code: 'PP',
    description: 'Une Journée + Prime 1000.00 da - Présent une journée complète avec prime additionnelle. Utilisé pour les journées avec bonus de performance.',
    category: 'present',
    color: '#43A047',
    influencer: false,
    paymentImpact: 'premium',
    active: true
  },
  {
    _id: '4',
    code: '2P',
    description: 'Double Journée - Employé ayant travaillé l\'équivalent de deux journées (16 heures). Comptabilisé comme deux jours de travail.',
    category: 'present',
    color: '#2E7D32',
    influencer: false,
    paymentImpact: 'full-pay',
    active: true
  },
  {
    _id: '5',
    code: '2P/PP',
    description: 'Double Journée + Prime 1000.00 da - Double journée de travail (16 heures) avec prime additionnelle. Pour travail exceptionnel.',
    category: 'present',
    color: '#1B5E20',
    influencer: false,
    paymentImpact: 'premium',
    active: true
  },
  {
    _id: '6',
    code: 'PR',
    description: 'Une journée de remplacement - Journée travaillée en remplacement d\'une absence antérieure. Permet d\'équilibrer le temps de travail.',
    category: 'present',
    color: '#81C784',
    influencer: false,
    paymentImpact: 'full-pay',
    active: true
  },
  {
    _id: '7',
    code: 'PR/2-AN/2',
    description: 'Demi Journée de remplacement Absence non justifiée Demi Journée - Demi-journée travaillée en remplacement et demi-journée d\'absence non justifiée. Paie partielle applicable.',
    category: 'present',
    color: '#A5D6A7',
    influencer: false,
    paymentImpact: 'partial-pay',
    active: true
  },
  {
    _id: '8',
    code: 'PR/2-AN1/2',
    description: 'Demi Journée de remplacement Absence non justifiée Demi Journée Influencer - Demi-journée travaillée en remplacement et demi-journée d\'absence non justifiée pour un employé avec statut influenceur.',
    category: 'present',
    color: '#C8E6C9',
    influencer: true,
    paymentImpact: 'partial-pay',
    active: true
  },
  {
    _id: '9',
    code: 'PN',
    description: 'Présent En Permanence - Employé présent en permanence sur le lieu de travail. Utilisé pour le personnel de garde ou de surveillance continue.',
    category: 'present',
    color: '#388E3C',
    influencer: false,
    paymentImpact: 'full-pay',
    active: true
  },
  {
    _id: '10',
    code: 'P/2',
    description: 'Présent Demi Journée - Employé présent pour une demi-journée de travail (4 heures). Paie partielle applicable selon le contrat.',
    category: 'present',
    color: '#4CAF50',
    influencer: false,
    paymentImpact: 'partial-pay',
    active: true
  },
  {
    _id: '11',
    code: 'P/4',
    description: 'Présent Quart de la Journée - Employé présent pour un quart de journée (2 heures). Utilisé pour les interventions courtes ou formations partielles.',
    category: 'present',
    color: '#4CAF50',
    influencer: false,
    paymentImpact: 'partial-pay',
    active: true
  },
  {
    _id: '12',
    code: 'N-P/2',
    description: 'Nouveau recruté Demi Journée - Nouveau employé présent pour une demi-journée, généralement pour l\'intégration ou la formation initiale.',
    category: 'present',
    color: '#4CAF50',
    influencer: false,
    paymentImpact: 'partial-pay',
    active: true
  },
  {
    _id: '13',
    code: 'PH',
    description: 'P+ Heures Supplémentaire - Présent avec heures supplémentaires. Utilisé quand l\'employé effectue des heures au-delà de son horaire normal.',
    category: 'present',
    color: '#4CAF50',
    influencer: false,
    paymentImpact: 'premium',
    active: true
  },
  {
    _id: '14',
    code: 'PH/2',
    description: 'P+ Heures Supplémentaires/2 - Demi-journée avec heures supplémentaires. Pour comptabiliser des heures supplémentaires sur une demi-journée.',
    category: 'present',
    color: '#4CAF50',
    influencer: false,
    paymentImpact: 'premium',
    active: true
  },
  {
    _id: '15',
    code: 'PC',
    description: 'Présent + Conduite - Présent avec responsabilité de conduite de véhicule. Inclut une prime pour la conduite professionnelle.',
    category: 'present',
    color: '#4CAF50',
    influencer: false,
    paymentImpact: 'premium',
    active: true
  },
  {
    _id: '16',
    code: 'PC/2',
    description: 'Présent Demi journée + Conduite - Présent une demi-journée avec responsabilité de conduite. Prime de conduite applicable au prorata.',
    category: 'present',
    color: '#4CAF50',
    influencer: false,
    paymentImpact: 'premium',
    active: true
  },
  {
    _id: '17',
    code: 'MS',
    description: 'Mission - Employé en mission professionnelle externe. Inclut généralement des indemnités de déplacement et frais de mission.',
    category: 'present',
    color: '#4CAF50',
    influencer: false,
    paymentImpact: 'full-pay',
    active: true
  },
  {
    _id: '18',
    code: 'MS/2',
    description: 'Mission Demi Journée - Mission professionnelle d\'une demi-journée. Indemnités et frais calculés au prorata de la durée.',
    category: 'present',
    color: '#4CAF50',
    influencer: false,
    paymentImpact: 'partial-pay',
    active: true
  },
  {
    _id: '19',
    code: 'JF',
    description: 'Jours fériés - Jour férié légal avec maintien de salaire. Applicable à tous les employés selon le calendrier officiel des jours fériés.',
    category: 'holiday',
    color: '#FFC107',
    influencer: false,
    paymentImpact: 'full-pay',
    active: true
  },
  {
    _id: '20',
    code: 'W',
    description: 'Week end - Jour de repos hebdomadaire (généralement samedi et/ou dimanche). Non travaillé et non rémunéré (sauf exception).',
    category: 'holiday',
    color: '#607D8B',
    influencer: false,
    paymentImpact: 'no-pay',
    active: true
  },
  {
    _id: '21',
    code: 'W/2',
    description: 'Week end demi journée - Demi-journée de week-end. Utilisé quand une partie de la journée de repos est travaillée exceptionnellement.',
    category: 'holiday',
    color: '#607D8B',
    influencer: false,
    paymentImpact: 'no-pay',
    active: true
  },
  {
    _id: '22',
    code: 'HP',
    description: 'Changement de poste - Journée de transition lors d\'un changement de poste. Permet de suivre les mouvements internes du personnel.',
    category: 'other',
    color: '#9E9E9E',
    influencer: false,
    paymentImpact: 'full-pay',
    active: true
  },
  {
    _id: '23',
    code: 'CH',
    description: 'Changement de chantier - Journée consacrée au changement de lieu de travail ou de chantier. Inclut généralement le temps de déplacement.',
    category: 'other',
    color: '#9E9E9E',
    influencer: false,
    paymentImpact: 'full-pay',
    active: true
  },
  {
    _id: '24',
    code: 'DC',
    description: 'Absences pour Décès - Congé exceptionnel pour décès d\'un proche. Durée variable selon le lien de parenté conformément à la législation.',
    category: 'leave',
    color: '#9C27B0',
    influencer: false,
    paymentImpact: 'full-pay',
    active: true
  },
  {
    _id: '25',
    code: 'DCI',
    description: 'Absences pour Décès Influencer - Congé pour décès accordé à un employé avec statut influenceur. Conditions spécifiques potentiellement applicables.',
    category: 'leave',
    color: '#9C27B0',
    influencer: true,
    paymentImpact: 'full-pay',
    active: true
  },
  {
    _id: '26',
    code: 'DM',
    description: 'Démission - Jour de démission effective de l\'employé. Marque la fin du contrat à l\'initiative du salarié.',
    category: 'other',
    color: '#795548',
    influencer: false,
    paymentImpact: 'no-pay',
    active: true
  },
  {
    _id: '27',
    code: 'CRP',
    description: 'Congés de Récupération Payé - Congé accordé en récupération d\'heures supplémentaires ou de travail exceptionnel. Entièrement rémunéré.',
    category: 'leave',
    color: '#2196F3',
    influencer: false,
    paymentImpact: 'full-pay',
    active: true
  },
  {
    _id: '28',
    code: 'CRP/2',
    description: 'Congés de Récupération Payé demi journée - Demi-journée de récupération pour heures supplémentaires. Rémunération maintenue pour la demi-journée.',
    category: 'leave',
    color: '#2196F3',
    influencer: false,
    paymentImpact: 'partial-pay',
    active: true
  },
  {
    _id: '29',
    code: 'CRP.P',
    description: 'Congé Récupération Prêt Payé - Congé de récupération accordé par anticipation (prêt de jours). Sera compensé ultérieurement.',
    category: 'leave',
    color: '#2196F3',
    influencer: false,
    paymentImpact: 'full-pay',
    active: true
  },
  {
    _id: '30',
    code: 'CRP.P/2',
    description: 'Congé Récupération Prêt Payé demi journée - Demi-journée de récupération accordée par anticipation. Compensation ultérieure prévue.',
    category: 'leave',
    color: '#2196F3',
    influencer: false,
    paymentImpact: 'partial-pay',
    active: true
  },
  {
    _id: '31',
    code: 'CSS',
    description: 'Congé Sans Solde - Congé accordé sans rémunération à la demande de l\'employé. N\'affecte pas l\'ancienneté mais sans maintien de salaire.',
    category: 'leave',
    color: '#F44336',
    influencer: false,
    paymentImpact: 'no-pay',
    active: true
  },
  {
    _id: '32',
    code: 'SS/AI',
    description: 'Sans Solde Absance Irrégulière - Absence irrégulière convertie en congé sans solde. Utilisé pour régulariser administrativement une absence.',
    category: 'leave',
    color: '#F44336',
    influencer: false,
    paymentImpact: 'no-pay',
    active: true
  },
  {
    _id: '33',
    code: 'CM',
    description: 'Congé Maladie - Absence justifiée par un certificat médical. Maintien du salaire selon la convention collective et la législation.',
    category: 'leave',
    color: '#F44336',
    influencer: false,
    paymentImpact: 'full-pay',
    active: true
  },
  {
    _id: '34',
    code: 'CM.I',
    description: 'Congé Maladie Influencer - Congé maladie pour un employé avec statut influenceur. Traitement spécifique selon la politique de l\'entreprise.',
    category: 'leave',
    color: '#F44336',
    influencer: true,
    paymentImpact: 'full-pay',
    active: true
  },
  {
    _id: '35',
    code: 'CM/2',
    description: 'Congé Maladie demi journée - Congé maladie pour une demi-journée, justifié par un certificat médical. Salaire maintenu au prorata.',
    category: 'leave',
    color: '#F44336',
    influencer: false,
    paymentImpact: 'partial-pay',
    active: true
  },
  {
    _id: '36',
    code: 'CM1/2',
    description: 'Congé Maladie demi journée Influencer - Congé maladie d\'une demi-journée pour un employé avec statut influenceur. Traitement spécifique au prorata.',
    category: 'leave',
    color: '#F44336',
    influencer: true,
    paymentImpact: 'partial-pay',
    active: true
  },
  {
    _id: '37',
    code: 'CA',
    description: 'Congés Annuels - Congé annuel payé, prévu par le contrat de travail. Droit acquis selon l\'ancienneté et la législation du travail.',
    category: 'leave',
    color: '#2196F3',
    influencer: false,
    paymentImpact: 'full-pay',
    active: true
  },
  {
    _id: '38',
    code: 'AJ',
    description: 'Absense justifiée - Absence avec justificatif valide (autre que médical). Traitement salarial selon le motif et la convention.',
    category: 'absent',
    color: '#FF9800',
    influencer: false,
    paymentImpact: 'partial-pay',
    active: true
  },
  {
    _id: '39',
    code: 'AJ.I',
    description: 'Absense justifiée Influencer - Absence justifiée pour un employé avec statut influenceur. Traitement spécifique selon la politique interne.',
    category: 'absent',
    color: '#FF9800',
    influencer: true,
    paymentImpact: 'partial-pay',
    active: true
  },
  {
    _id: '40',
    code: 'AJ/2',
    description: 'Absense justifiée Demi Journée - Absence justifiée pour une demi-journée. Impact salarial au prorata selon le motif de l\'absence.',
    category: 'absent',
    color: '#FF9800',
    influencer: false,
    paymentImpact: 'partial-pay',
    active: true
  },
  {
    _id: '41',
    code: 'AJ1/2',
    description: 'Absense justifiée Demi Journée Influencer - Absence justifiée d\'une demi-journée pour un employé avec statut influenceur. Traitement spécifique.',
    category: 'absent',
    color: '#FF9800',
    influencer: true,
    paymentImpact: 'partial-pay',
    active: true
  },
  {
    _id: '42',
    code: 'AN',
    description: 'Absense non justifiée - Absence sans justificatif valable. Entraîne une retenue sur salaire et peut faire l\'objet de sanctions disciplinaires.',
    category: 'absent',
    color: '#9E9E9E',
    influencer: false,
    paymentImpact: 'no-pay',
    active: true
  },
  {
    _id: '43',
    code: 'AN.I',
    description: 'Absense non justifiée Influencer - Absence non justifiée pour un employé avec statut influenceur. Traitement spécifique mais avec retenue de salaire.',
    category: 'absent',
    color: '#9E9E9E',
    influencer: true,
    paymentImpact: 'no-pay',
    active: true
  },
  {
    _id: '44',
    code: 'AN/2',
    description: 'Absense non justifiée Demi Journée - Absence non justifiée d\'une demi-journée. Retenue sur salaire proportionnelle à la durée.',
    category: 'absent',
    color: '#9E9E9E',
    influencer: false,
    paymentImpact: 'no-pay',
    active: true
  },
  {
    _id: '45',
    code: 'AN1/2',
    description: 'Absense non justifiée Demi Journée Influencer - Absence non justifiée d\'une demi-journée pour un employé avec statut influenceur. Traitement spécifique.',
    category: 'absent',
    color: '#9E9E9E',
    influencer: true,
    paymentImpact: 'no-pay',
    active: true
  },
  {
    _id: '46',
    code: 'AP',
    description: 'Abandonnement de Poste Indiminisée - Abandon de poste avec indemnisation prévue. Généralement dans le cadre d\'un accord de départ négocié.',
    category: 'absent',
    color: '#D32F2F',
    influencer: false,
    paymentImpact: 'no-pay',
    active: true
  },
  {
    _id: '47',
    code: 'AP.I',
    description: 'Abandonnement de Poste Indiminisée Influencer - Abandon de poste indemnisé pour un employé avec statut influenceur. Conditions spéciales applicables.',
    category: 'absent',
    color: '#D32F2F',
    influencer: true,
    paymentImpact: 'no-pay',
    active: true
  },
  {
    _id: '48',
    code: 'AP1/2',
    description: 'Abandonnement de Poste Indiminisée Demi Journée - Abandon de poste indemnisé sur une demi-journée. Cas particulier pour départ en cours de journée.',
    category: 'absent',
    color: '#D32F2F',
    influencer: false,
    paymentImpact: 'no-pay',
    active: true
  },
  {
    _id: '49',
    code: 'AP.I1/2',
    description: 'Abandonnement de Poste Indiminisée Demi Journée Influencer - Abandon de poste indemnisé d\'une demi-journée pour un employé avec statut influenceur.',
    category: 'absent',
    color: '#D32F2F',
    influencer: true,
    paymentImpact: 'no-pay',
    active: true
  },
  {
    _id: '50',
    code: 'AP.N',
    description: 'Abandonnement de Poste non Indiminisée - Abandon de poste sans indemnisation. Constitue une faute grave pouvant justifier un licenciement.',
    category: 'absent',
    color: '#D32F2F',
    influencer: false,
    paymentImpact: 'no-pay',
    active: true
  },
  {
    _id: '51',
    code: 'AP.NI',
    description: 'Abandonnement de Poste non Indiminisée Influencer - Abandon de poste non indemnisé pour un employé avec statut influenceur. Traitement disciplinaire spécifique.',
    category: 'absent',
    color: '#D32F2F',
    influencer: true,
    paymentImpact: 'no-pay',
    active: true
  },
  {
    _id: '52',
    code: 'FC',
    description: 'Fin de Contrat - Dernier jour de contrat (CDD, intérim, période d\'essai). Marque la fin de la relation contractuelle.',
    category: 'other',
    color: '#795548',
    influencer: false,
    paymentImpact: 'no-pay',
    active: true
  },
  {
    _id: '53',
    code: 'AON',
    description: 'Absence autorisée Non Payée - Absence préalablement autorisée par la direction mais sans maintien de salaire. Accord formalisé requis.',
    category: 'absent',
    color: '#FF5722',
    influencer: false,
    paymentImpact: 'no-pay',
    active: true
  },
  {
    _id: '54',
    code: 'AON.I',
    description: 'Absence autorisée Non Payée Influencer - Absence autorisée sans salaire pour un employé avec statut influenceur. Conditions spécifiques applicables.',
    category: 'absent',
    color: '#FF5722',
    influencer: true,
    paymentImpact: 'no-pay',
    active: true
  },
  {
    _id: '55',
    code: 'AOP',
    description: 'Absence Autorisée Payée - Absence exceptionnelle autorisée avec maintien de salaire. Pour événements spéciaux reconnus par l\'entreprise.',
    category: 'absent',
    color: '#FF5722',
    influencer: false,
    paymentImpact: 'full-pay',
    active: true
  },
  {
    _id: '56',
    code: 'AOP.I',
    description: 'Absence Autorisée Payée Influencer - Absence autorisée avec salaire pour un employé avec statut influenceur. Traitement spécifique applicable.',
    category: 'absent',
    color: '#FF5722',
    influencer: true,
    paymentImpact: 'full-pay',
    active: true
  },
  {
    _id: '57',
    code: 'G.L',
    description: 'Grève Légal - Participation à un mouvement de grève légal. Suspension du contrat sans rémunération mais sans sanction disciplinaire.',
    category: 'absent',
    color: '#E64A19',
    influencer: false,
    paymentImpact: 'no-pay',
    active: true
  },
  {
    _id: '58',
    code: 'G.LI',
    description: 'Grève Légal Influencer - Participation à une grève légale pour un employé avec statut influenceur. Traitement spécifique applicable.',
    category: 'absent',
    color: '#E64A19',
    influencer: true,
    paymentImpact: 'no-pay',
    active: true
  },
  {
    _id: '59',
    code: 'G.I',
    description: 'Grève Illégal - Participation à un mouvement de grève non conforme aux dispositions légales. Peut entraîner des sanctions.',
    category: 'absent',
    color: '#E64A19',
    influencer: false,
    paymentImpact: 'no-pay',
    active: true
  },
  {
    _id: '60',
    code: 'G.II',
    description: 'Grève Illégal Influencer - Participation à une grève illégale pour un employé avec statut influenceur. Traitement disciplinaire spécifique.',
    category: 'absent',
    color: '#E64A19',
    influencer: true,
    paymentImpact: 'no-pay',
    active: true
  },
  {
    _id: '61',
    code: 'JD',
    description: 'Jour Déplacé - Jour de travail déplacé à une autre date. Permet de suivre les modifications du planning de travail.',
    category: 'other',
    color: '#9E9E9E',
    influencer: false,
    paymentImpact: 'full-pay',
    active: true
  },
  {
    _id: '62',
    code: 'D',
    description: 'Déclaré - Journée déclarée administrativement sans précision particulière. Utilisé pour des cas spécifiques de régularisation.',
    category: 'other',
    color: '#9E9E9E',
    influencer: false,
    paymentImpact: 'full-pay',
    active: true
  }
];

const AttendanceCodes = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCode, setCurrentCode] = useState({
    code: '',
    description: '',
    category: 'present',
    color: '#4682B4',
    influencer: false,
    paymentImpact: 'full-pay'
  });

  useEffect(() => {
    fetchAttendanceCodes();
  }, []);

  const fetchAttendanceCodes = async () => {
    try {
      setLoading(true);
      // Use mock data instead of API call
      setCodes(mockAttendanceCodes);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des codes de présence');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterCategory(e.target.value);
  };

  const handleOpenDialog = (code = null) => {
    if (code) {
      setCurrentCode(code);
      setEditMode(true);
    } else {
      setCurrentCode({
        code: '',
        description: '',
        category: 'present',
        color: '#4682B4',
        influencer: false,
        paymentImpact: 'full-pay'
      });
      setEditMode(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCurrentCode({
      ...currentCode,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        // Mock update - find and update the code in the array
        const updatedCodes = codes.map(code => 
          code._id === currentCode._id ? { ...currentCode } : code
        );
        setCodes(updatedCodes);
      } else {
        // Mock create - add a new code to the array
        const newCode = {
          ...currentCode,
          _id: Date.now().toString(), // Generate a unique ID
          active: true
        };
        setCodes([...codes, newCode]);
      }
      handleCloseDialog();
    } catch (err) {
      setError('Erreur lors de l\'enregistrement du code de présence');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce code de présence ?')) {
      try {
        // Mock delete - filter out the code from the array
        const updatedCodes = codes.filter(code => code._id !== id);
        setCodes(updatedCodes);
      } catch (err) {
        setError('Erreur lors de la suppression du code de présence');
        console.error(err);
      }
    }
  };

  // Filter codes based on search term and category
  const filteredCodes = codes.filter(code => {
    const matchesSearch = code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         code.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || code.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardHeader
          title="Codes de Présence Français"
          subheader="Gestion des codes de suivi de présence et du temps de travail"
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                component={Link}
                to="/attendance/codes-dashboard"
                variant="outlined"
                color="primary"
                startIcon={<DashboardIcon />}
              >
                Tableau de Bord des Codes
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Nouveau Code
              </Button>
            </Box>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Rechercher"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Catégorie</InputLabel>
                <Select
                  value={filterCategory}
                  onChange={handleFilterChange}
                  label="Catégorie"
                  startAdornment={
                    <InputAdornment position="start">
                      <FilterListIcon />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">Toutes les catégories</MenuItem>
                  {CATEGORIES.map(category => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Catégorie</TableCell>
                    <TableCell>Couleur</TableCell>
                    <TableCell>Impact sur la paie</TableCell>
                    <TableCell>Influenceur</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCodes.length > 0 ? (
                    filteredCodes.map(code => (
                      <TableRow key={code._id}>
                        <TableCell>
                          <Chip
                            label={code.code}
                            sx={{
                              bgcolor: code.color,
                              color: '#fff',
                              fontWeight: 'bold'
                            }}
                          />
                        </TableCell>
                        <TableCell>{code.description}</TableCell>
                        <TableCell>
                          {CATEGORIES.find(cat => cat.value === code.category)?.label || code.category}
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor: code.color,
                              borderRadius: '4px'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {PAYMENT_IMPACTS.find(impact => impact.value === code.paymentImpact)?.label || code.paymentImpact}
                        </TableCell>
                        <TableCell>
                          {code.influencer ? 'Oui' : 'Non'}
                        </TableCell>
                        <TableCell>
                          <ButtonGroup size="small">
                            <Tooltip title="Modifier">
                              <IconButton onClick={() => handleOpenDialog(code)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton onClick={() => handleDelete(code._id)} color="error">
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </ButtonGroup>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Aucun code de présence trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md">
        <DialogTitle>
          {editMode ? 'Modifier le Code de Présence' : 'Ajouter un Nouveau Code de Présence'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Code"
                name="code"
                value={currentCode.code}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Couleur"
                name="color"
                value={currentCode.color}
                onChange={handleInputChange}
                type="color"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={currentCode.description}
                onChange={handleInputChange}
                required
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Catégorie</InputLabel>
                <Select
                  name="category"
                  value={currentCode.category}
                  onChange={handleInputChange}
                  label="Catégorie"
                >
                  {CATEGORIES.map(category => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Impact sur la paie</InputLabel>
                <Select
                  name="paymentImpact"
                  value={currentCode.paymentImpact}
                  onChange={handleInputChange}
                  label="Impact sur la paie"
                >
                  {PAYMENT_IMPACTS.map(impact => (
                    <MenuItem key={impact.value} value={impact.value}>
                      {impact.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <Grid container alignItems="center">
                  <Grid item>
                    <Typography variant="body1" component="label" htmlFor="influencer">
                      Influenceur:
                    </Typography>
                  </Grid>
                  <Grid item sx={{ ml: 2 }}>
                    <input
                      type="checkbox"
                      id="influencer"
                      name="influencer"
                      checked={currentCode.influencer}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMode ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceCodes; 