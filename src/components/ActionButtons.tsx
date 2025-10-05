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
    <div className="action-buttons-fixed">
      <button onClick={handleReset} className="action-button-compact reset-button-compact" title="Restablecer vista del mapa">
        🔄
      </button>
      
      <button onClick={handleShare} className="action-button-compact share-button-compact" title="Copiar enlace para compartir">
        {copySuccess ? '✅' : '🔗'}
      </button>
    </div>
  );
};

export default ActionButtons;
