import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AccessManagement = () => {
  const [accessRights, setAccessRights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAccessRights();
  }, []);

  const fetchAccessRights = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/access-rights');
      
      if (response.data && response.data.success) {
        setAccessRights(response.data.data || []);
      } else {
        setAccessRights([]);
      }
      
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching access rights:', err);
      setError('Erreur lors du chargement des droits d\'accès');
      setAccessRights([]);
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default AccessManagement; 