const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Load env vars
dotenv.config();

// Load models
const AttendanceCode = require('../models/AttendanceCode');

// Connect to DB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/poinpro', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Attendance codes data - all 66 codes
const attendanceCodes = [
  // Present category
  {
    code: 'P',
    name: 'Présent Une Journée',
    description: 'Employé présent pour une journée complète de travail (8 heures). Paie complète applicable.',
    category: 'present',
    color: '#4682B4',
    influencer: false,
    paymentImpact: 'full-pay'
  },
  {
    code: 'JT',
    name: 'Jours déjà travaillé',
    description: 'Journée déjà comptabilisée comme travaillée dans une période précédente. Utilisé pour éviter le double comptage.',
    category: 'present',
    color: '#4682B4',
    influencer: false,
    paymentImpact: 'full-pay'
  },
  {
    code: 'PP',
    name: 'Une Journée + Prime',
    description: 'Présent une journée complète avec prime additionnelle de 1000.00 DA. Utilisé pour les journées avec bonus de performance.',
    category: 'present',
    color: '#4682B4',
    influencer: false,
    paymentImpact: 'premium'
  },
  {
    code: '2P',
    name: 'Double Journée',
    description: 'Employé ayant travaillé l\'équivalent de deux journées (16 heures). Comptabilisé comme deux jours de travail.',
    category: 'present',
    color: '#4682B4',
    influencer: false,
    paymentImpact: 'premium'
  },
  {
    code: '2P/PP',
    name: 'Double Journée + Prime',
    description: 'Double journée de travail (16 heures) avec prime additionnelle de 1000.00 DA. Pour travail exceptionnel.',
    category: 'present',
    color: '#4682B4',
    influencer: false,
    paymentImpact: 'premium'
  },
  {
    code: 'PR',
    name: 'Journée de remplacement',
    description: 'Journée travaillée en remplacement d\'une absence antérieure. Permet d\'équilibrer le temps de travail.',
    category: 'present',
    color: '#4682B4',
    influencer: false,
    paymentImpact: 'full-pay'
  },
  {
    code: 'PR/2-AN/2',
    name: 'Demi Journée remplacement/absence',
    description: 'Demi-journée travaillée en remplacement et demi-journée d\'absence non justifiée. Paie partielle applicable.',
    category: 'present',
    color: '#4682B4',
    influencer: false,
    paymentImpact: 'partial-pay'
  },
  {
    code: 'PR/2-AN1/2',
    name: 'Demi Journée remplacement/absence influenceur',
    description: 'Demi-journée travaillée en remplacement et demi-journée d\'absence non justifiée pour un employé avec statut influenceur.',
    category: 'present',
    color: '#4682B4',
    influencer: true,
    paymentImpact: 'partial-pay'
  },
  {
    code: 'PN',
    name: 'Présent En Permanence',
    description: 'Employé présent en permanence sur le lieu de travail. Utilisé pour le personnel de garde ou de surveillance continue.',
    category: 'present',
    color: '#4682B4',
    influencer: false,
    paymentImpact: 'full-pay'
  },
  {
    code: 'P/2',
    name: 'Présent Demi Journée',
    description: 'Employé présent pour une demi-journée de travail (4 heures). Paie partielle applicable selon le contrat.',
    category: 'present',
    color: '#4682B4',
    influencer: false,
    paymentImpact: 'partial-pay'
  },
  {
    code: 'P/4',
    name: 'Présent Quart de Journée',
    description: 'Employé présent pour un quart de journée (2 heures). Utilisé pour les interventions courtes ou formations partielles.',
    category: 'present',
    color: '#4682B4',
    influencer: false,
    paymentImpact: 'partial-pay'
  },
  {
    code: 'N-P/2',
    name: 'Nouveau recruté Demi Journée',
    description: 'Nouveau employé présent pour une demi-journée, généralement pour l\'intégration ou la formation initiale.',
    category: 'present',
    color: '#4682B4',
    influencer: false,
    paymentImpact: 'partial-pay'
  },
  {
    code: 'PH',
    name: 'Heures Supplémentaires',
    description: 'Présent avec heures supplémentaires. Utilisé quand l\'employé effectue des heures au-delà de son horaire normal.',
    category: 'present',
    color: '#4682B4',
    influencer: false,
    paymentImpact: 'premium'
  },
  {
    code: 'PH/2',
    name: 'Heures Supplémentaires/2',
    description: 'Demi-journée avec heures supplémentaires. Pour comptabiliser des heures supplémentaires sur une demi-journée.',
    category: 'present',
    color: '#4682B4',
    influencer: false,
    paymentImpact: 'premium'
  },
  {
    code: 'PC',
    name: 'Présent + Conduite',
    description: 'Présent avec responsabilité de conduite de véhicule. Inclut une prime pour la conduite professionnelle.',
    category: 'present',
    color: '#4682B4',
    influencer: false,
    paymentImpact: 'premium'
  },
  {
    code: 'PC/2',
    name: 'Présent Demi journée + Conduite',
    description: 'Présent une demi-journée avec responsabilité de conduite. Prime de conduite applicable au prorata.',
    category: 'present',
    color: '#4682B4',
    influencer: false,
    paymentImpact: 'partial-pay'
  },
  
  // Mission category
  {
    code: 'MS',
    name: 'Mission',
    description: 'Employé en mission professionnelle externe. Inclut généralement des indemnités de déplacement et frais de mission.',
    category: 'mission',
    color: '#9ACD32',
    influencer: false,
    paymentImpact: 'full-pay'
  },
  {
    code: 'MS/2',
    name: 'Mission Demi Journée',
    description: 'Mission professionnelle d\'une demi-journée. Indemnités et frais calculés au prorata de la durée.',
    category: 'mission',
    color: '#9ACD32',
    influencer: false,
    paymentImpact: 'partial-pay'
  },
  {
    code: 'HP',
    name: 'Changement de poste',
    description: 'Journée de transition lors d\'un changement de poste. Permet de suivre les mouvements internes du personnel.',
    category: 'mission',
    color: '#9ACD32',
    influencer: false,
    paymentImpact: 'full-pay'
  },
  {
    code: 'CH',
    name: 'Changement de chantier',
    description: 'Journée consacrée au changement de lieu de travail ou de chantier. Inclut généralement le temps de déplacement.',
    category: 'mission',
    color: '#9ACD32',
    influencer: false,
    paymentImpact: 'full-pay'
  },
  {
    code: 'JD',
    name: 'Jour Déplacé',
    description: 'Jour de travail déplacé à une autre date. Permet de suivre les modifications du planning de travail.',
    category: 'mission',
    color: '#9ACD32',
    influencer: false,
    paymentImpact: 'full-pay'
  },
  
  // Leave category
  {
    code: 'CA',
    name: 'Congés Annuels',
    description: 'Congé annuel payé, prévu par le contrat de travail. Droit acquis selon l\'ancienneté et la législation du travail.',
    category: 'leave',
    color: '#2196f3',
    influencer: false,
    paymentImpact: 'full-pay'
  },
  {
    code: 'CRP',
    name: 'Congés de Récupération Payé',
    description: 'Congé accordé en récupération d\'heures supplémentaires ou de travail exceptionnel. Entièrement rémunéré.',
    category: 'leave',
    color: '#2196f3',
    influencer: false,
    paymentImpact: 'full-pay'
  },
  {
    code: 'CRP/2',
    name: 'Congés de Récupération Payé demi journée',
    description: 'Demi-journée de récupération pour heures supplémentaires. Rémunération maintenue pour la demi-journée.',
    category: 'leave',
    color: '#2196f3',
    influencer: false,
    paymentImpact: 'partial-pay'
  },
  {
    code: 'CRP.P',
    name: 'Congé Récupération Prêt Payé',
    description: 'Congé de récupération accordé par anticipation (prêt de jours). Sera compensé ultérieurement.',
    category: 'leave',
    color: '#2196f3',
    influencer: false,
    paymentImpact: 'full-pay'
  },
  {
    code: 'CRP.P/2',
    name: 'Congé Récupération Prêt Payé demi journée',
    description: 'Demi-journée de récupération accordée par anticipation. Compensation ultérieure prévue.',
    category: 'leave',
    color: '#2196f3',
    influencer: false,
    paymentImpact: 'partial-pay'
  },
  {
    code: 'DC',
    name: 'Absences pour Décès',
    description: 'Congé exceptionnel pour décès d\'un proche. Durée variable selon le lien de parenté conformément à la législation.',
    category: 'leave',
    color: '#2196f3',
    influencer: false,
    paymentImpact: 'full-pay'
  },
  {
    code: 'DCI',
    name: 'Absences pour Décès Influencer',
    description: 'Congé pour décès accordé à un employé avec statut influenceur. Conditions spécifiques potentiellement applicables.',
    category: 'leave',
    color: '#2196f3',
    influencer: true,
    paymentImpact: 'full-pay'
  },
  {
    code: 'AOP',
    name: 'Absence Autorisée Payée',
    description: 'Absence exceptionnelle autorisée avec maintien de salaire. Pour événements spéciaux reconnus par l\'entreprise.',
    category: 'leave',
    color: '#2196f3',
    influencer: false,
    paymentImpact: 'full-pay'
  },
  {
    code: 'AOP.I',
    name: 'Absence Autorisée Payée Influencer',
    description: 'Absence autorisée avec salaire pour un employé avec statut influenceur. Traitement spécifique applicable.',
    category: 'leave',
    color: '#2196f3',
    influencer: true,
    paymentImpact: 'full-pay'
  },
  
  // Sick leave category
  {
    code: 'CM',
    name: 'Congé Maladie',
    description: 'Absence justifiée par un certificat médical. Maintien du salaire selon la convention collective et la législation.',
    category: 'leave',
    color: '#3f51b5',
    influencer: false,
    paymentImpact: 'full-pay'
  },
  {
    code: 'CM.I',
    name: 'Congé Maladie Influencer',
    description: 'Congé maladie pour un employé avec statut influenceur. Traitement spécifique selon la politique de l\'entreprise.',
    category: 'leave',
    color: '#3f51b5',
    influencer: true,
    paymentImpact: 'full-pay'
  },
  {
    code: 'CM/2',
    name: 'Congé Maladie Demi-journée',
    description: 'Congé maladie pour une demi-journée, justifié par un certificat médical. Salaire maintenu au prorata.',
    category: 'leave',
    color: '#3f51b5',
    influencer: false,
    paymentImpact: 'partial-pay'
  },
  {
    code: 'CM1/2',
    name: 'Congé Maladie Demi-journée Influencer',
    description: 'Congé maladie d\'une demi-journée pour un employé avec statut influenceur. Traitement spécifique au prorata.',
    category: 'leave',
    color: '#3f51b5',
    influencer: true,
    paymentImpact: 'partial-pay'
  },
  
  // Unpaid leave category
  {
    code: 'CSS',
    name: 'Congé Sans Solde',
    description: 'Congé accordé sans rémunération à la demande de l\'employé. N\'affecte pas l\'ancienneté mais sans maintien de salaire.',
    category: 'leave',
    color: '#ff9800',
    influencer: false,
    paymentImpact: 'no-pay'
  },
  {
    code: 'SS/AI',
    name: 'Sans Solde Absance Irrégulière',
    description: 'Absence irrégulière convertie en congé sans solde. Utilisé pour régulariser administrativement une absence.',
    category: 'leave',
    color: '#ff9800',
    influencer: false,
    paymentImpact: 'no-pay'
  },
  {
    code: 'AON',
    name: 'Absence autorisée Non Payée',
    description: 'Absence préalablement autorisée par la direction mais sans maintien de salaire. Accord formalisé requis.',
    category: 'leave',
    color: '#ff9800',
    influencer: false,
    paymentImpact: 'no-pay'
  },
  {
    code: 'AON.I',
    name: 'Absence autorisée Non Payée Influencer',
    description: 'Absence autorisée sans salaire pour un employé avec statut influenceur. Conditions spécifiques applicables.',
    category: 'leave',
    color: '#ff9800',
    influencer: true,
    paymentImpact: 'no-pay'
  },
  
  // Justified absence category
  {
    code: 'AJ',
    name: 'Absense justifiée',
    description: 'Absence avec justificatif valide (autre que médical). Traitement salarial selon le motif et la convention.',
    category: 'absent',
    color: '#ff9800',
    influencer: false,
    paymentImpact: 'partial-pay'
  },
  {
    code: 'AJ.I',
    name: 'Absense justifiée Influencer',
    description: 'Absence justifiée pour un employé avec statut influenceur. Traitement spécifique selon la politique interne.',
    category: 'absent',
    color: '#ff9800',
    influencer: true,
    paymentImpact: 'partial-pay'
  },
  {
    code: 'AJ/2',
    name: 'Absense justifiée Demi Journée',
    description: 'Absence justifiée pour une demi-journée. Impact salarial au prorata selon le motif de l\'absence.',
    category: 'absent',
    color: '#ff9800',
    influencer: false,
    paymentImpact: 'partial-pay'
  },
  {
    code: 'AJ1/2',
    name: 'Absense justifiée Demi Journée Influencer',
    description: 'Absence justifiée d\'une demi-journée pour un employé avec statut influenceur. Traitement spécifique.',
    category: 'absent',
    color: '#ff9800',
    influencer: true,
    paymentImpact: 'partial-pay'
  },
  
  // Unjustified absence category
  {
    code: 'AN',
    name: 'Absense non justifiée',
    description: 'Absence sans justificatif valable. Entraîne une retenue sur salaire et peut faire l\'objet de sanctions disciplinaires.',
    category: 'absent',
    color: '#f44336',
    influencer: false,
    paymentImpact: 'no-pay'
  },
  {
    code: 'AN.I',
    name: 'Absense non justifiée Influencer',
    description: 'Absence non justifiée pour un employé avec statut influenceur. Traitement spécifique mais avec retenue de salaire.',
    category: 'absent',
    color: '#f44336',
    influencer: true,
    paymentImpact: 'no-pay'
  },
  {
    code: 'AN/2',
    name: 'Absense non justifiée Demi Journée',
    description: 'Absence non justifiée d\'une demi-journée. Retenue sur salaire proportionnelle à la durée.',
    category: 'absent',
    color: '#f44336',
    influencer: false,
    paymentImpact: 'partial-pay'
  },
  {
    code: 'AN1/2',
    name: 'Absense non justifiée Demi Journée Influencer',
    description: 'Absence non justifiée d\'une demi-journée pour un employé avec statut influenceur. Traitement spécifique.',
    category: 'absent',
    color: '#f44336',
    influencer: true,
    paymentImpact: 'partial-pay'
  },
  
  // Job abandonment category
  {
    code: 'AP',
    name: 'Abandonnement de Poste Indemnisé',
    description: 'Abandon de poste avec indemnisation prévue. Généralement dans le cadre d\'un accord de départ négocié.',
    category: 'absent',
    color: '#e91e63',
    influencer: false,
    paymentImpact: 'full-pay'
  },
  {
    code: 'AP.I',
    name: 'Abandonnement de Poste Indemnisé Influencer',
    description: 'Abandon de poste indemnisé pour un employé avec statut influenceur. Conditions spéciales applicables.',
    category: 'absent',
    color: '#e91e63',
    influencer: true,
    paymentImpact: 'full-pay'
  },
  {
    code: 'AP1/2',
    name: 'Abandonnement Poste Indemnisé Demi Journée',
    description: 'Abandon de poste indemnisé sur une demi-journée. Cas particulier pour départ en cours de journée.',
    category: 'absent',
    color: '#e91e63',
    influencer: false,
    paymentImpact: 'partial-pay'
  },
  {
    code: 'AP.I1/2',
    name: 'Abandon Poste Indemnisé Demi Jour Influencer',
    description: 'Abandon de poste indemnisé d\'une demi-journée pour un employé avec statut influenceur.',
    category: 'absent',
    color: '#e91e63',
    influencer: true,
    paymentImpact: 'partial-pay'
  },
  {
    code: 'AP.N',
    name: 'Abandonnement de Poste non Indemnisé',
    description: 'Abandon de poste sans indemnisation. Constitue une faute grave pouvant justifier un licenciement.',
    category: 'absent',
    color: '#e91e63',
    influencer: false,
    paymentImpact: 'no-pay'
  },
  {
    code: 'AP.NI',
    name: 'Abandon Poste non Indemnisé Influencer',
    description: 'Abandon de poste non indemnisé pour un employé avec statut influenceur. Traitement disciplinaire spécifique.',
    category: 'absent',
    color: '#e91e63',
    influencer: true,
    paymentImpact: 'no-pay'
  },
  
  // Strike category
  {
    code: 'G.L',
    name: 'Grève Légal',
    description: 'Participation à un mouvement de grève légal. Suspension du contrat sans rémunération mais sans sanction disciplinaire.',
    category: 'absent',
    color: '#795548',
    influencer: false,
    paymentImpact: 'no-pay'
  },
  {
    code: 'G.LI',
    name: 'Grève Légal Influencer',
    description: 'Participation à une grève légale pour un employé avec statut influenceur. Traitement spécifique applicable.',
    category: 'absent',
    color: '#795548',
    influencer: true,
    paymentImpact: 'no-pay'
  },
  {
    code: 'G.I',
    name: 'Grève Illégal',
    description: 'Participation à un mouvement de grève non conforme aux dispositions légales. Peut entraîner des sanctions.',
    category: 'absent',
    color: '#795548',
    influencer: false,
    paymentImpact: 'no-pay'
  },
  {
    code: 'G.II',
    name: 'Grève Illégal Influencer',
    description: 'Participation à une grève illégale pour un employé avec statut influenceur. Traitement disciplinaire spécifique.',
    category: 'absent',
    color: '#795548',
    influencer: true,
    paymentImpact: 'no-pay'
  },
  
  // Holidays and Weekend category
  {
    code: 'JF',
    name: 'Jours fériés',
    description: 'Jour férié légal avec maintien de salaire. Applicable à tous les employés selon le calendrier officiel des jours fériés.',
    category: 'holiday',
    color: '#607d8b',
    influencer: false,
    paymentImpact: 'full-pay'
  },
  {
    code: 'W',
    name: 'Week end',
    description: 'Jour de repos hebdomadaire (généralement samedi et/ou dimanche). Non travaillé et non rémunéré (sauf exception).',
    category: 'holiday',
    color: '#9e9e9e',
    influencer: false,
    paymentImpact: 'no-pay'
  },
  {
    code: 'W/2',
    name: 'Week end demi journée',
    description: 'Demi-journée de week-end. Utilisé quand une partie de la journée de repos est travaillée exceptionnellement.',
    category: 'holiday',
    color: '#9e9e9e',
    influencer: false,
    paymentImpact: 'partial-pay'
  },
  
  // End of Contract category
  {
    code: 'DM',
    name: 'Démission',
    description: 'Jour de démission effective de l\'employé. Marque la fin du contrat à l\'initiative du salarié.',
    category: 'other',
    color: '#9c27b0',
    influencer: false,
    paymentImpact: 'no-pay'
  },
  {
    code: 'FC',
    name: 'Fin de Contrat',
    description: 'Dernier jour de contrat (CDD, intérim, période d\'essai). Marque la fin de la relation contractuelle.',
    category: 'other',
    color: '#9c27b0',
    influencer: false,
    paymentImpact: 'full-pay'
  },
  
  // Other category
  {
    code: 'D',
    name: 'Déclaré',
    description: 'Journée déclarée administrativement sans précision particulière. Utilisé pour des cas spécifiques de régularisation.',
    category: 'other',
    color: '#607d8b',
    influencer: false,
    paymentImpact: 'full-pay'
  }
];

// Import data to DB
const importData = async () => {
  try {
    // Clear existing data
    await AttendanceCode.deleteMany();
    
    // Insert new data
    await AttendanceCode.insertMany(attendanceCodes);
    
    console.log('Data Imported!'.green.inverse);
    process.exit();
  } catch (err) {
    console.error(`${err}`.red);
    process.exit(1);
  }
};

// Delete all data from DB
const deleteData = async () => {
  try {
    await AttendanceCode.deleteMany();
    
    console.log('Data Destroyed!'.red.inverse);
    process.exit();
  } catch (err) {
    console.error(`${err}`.red);
    process.exit(1);
  }
};

// Command line args
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please add an argument: -i (import) or -d (delete)');
  process.exit();
} 