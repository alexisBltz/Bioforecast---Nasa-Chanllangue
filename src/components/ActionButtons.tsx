/**
 * ActionButtons Component
 * Botones de acción: Reset View y Share URL
 */
import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { copyCurrentURL } from '../utils/urlState';
import '../styles/ActionButtons.css';

const ActionButtons: React.FC = () => {
  const { resetView } = useAppStore();
  const [copySuccess, setCopySuccess] = useState(false);
  
  const handleReset = () => {
    resetView();
  };
  
  const handleShare = async () => {
    try {
      await copyCurrentURL();
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Error al copiar URL:', error);
      alert('No se pudo copiar la URL al portapapeles');
    }
  };
  
  return (
    <div className="control-section action-buttons">
      <button onClick={handleReset} className="action-button reset-button">
        🔄 Restablecer Vista
      </button>
      
      <button onClick={handleShare} className="action-button share-button">
        {copySuccess ? '✅ Copiado!' : '🔗 Compartir Vista'}
      </button>
    </div>
  );
};

export default ActionButtons;
