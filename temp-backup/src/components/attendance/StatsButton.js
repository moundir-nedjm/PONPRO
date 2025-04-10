import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Tooltip } from '@mui/material';
import { BarChart as BarChartIcon } from '@mui/icons-material';

/**
 * Bouton pour accéder rapidement à la page de statistiques de présence
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.variant - La variante du bouton (contained, outlined, text)
 * @param {string} props.color - La couleur du bouton (primary, secondary, etc.)
 * @param {Object} props.sx - Les styles supplémentaires à appliquer au bouton
 * @param {boolean} props.showText - Afficher ou non le texte du bouton
 * @returns {JSX.Element} Le composant StatsButton
 */
const StatsButton = ({ 
  variant = 'contained', 
  color = 'primary', 
  sx = {}, 
  showText = true 
}) => {
  return (
    <Tooltip title="Statistiques de présence">
      <Button
        component={Link}
        to="/attendance/stats"
        variant={variant}
        color={color}
        startIcon={<BarChartIcon />}
        sx={sx}
      >
        {showText && "Statistiques"}
      </Button>
    </Tooltip>
  );
};

export default StatsButton; 