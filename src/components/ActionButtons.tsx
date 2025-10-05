/**
 * ActionButtons Component
 * Botones de acción: Reset View y Share URL
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appStore';
import { copyCurrentURL } from '../utils/urlState';
import '../styles/ActionButtons.css';

const ActionButtons: React.FC = () => {
  const { t } = useTranslation();
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
      alert(t('actions.copy_error', 'No se pudo copiar la URL al portapapeles'));
    }
  };
  
  return (
    <div className="action-buttons-fixed">
      <button onClick={handleReset} className="action-button-compact reset-button-compact" title={t('actions.reset_view', 'Restablecer vista del mapa')}>
        🔄
      </button>
      
      <button onClick={handleShare} className="action-button-compact share-button-compact" title={t('actions.copy_link', 'Copiar enlace para compartir')}>
        {copySuccess ? '✅' : '🔗'}
      </button>
    </div>
  );
};

export default ActionButtons;
