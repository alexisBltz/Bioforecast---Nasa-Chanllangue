/**
 * Toast Component
 * Componente para mostrar notificaciones temporales
 */
import React, { useEffect, useState } from 'react';
import '../styles/Toast.css';

interface ToastProps {
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'info', 
  duration = 1500, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Esperar a que termine la animación de salida
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast toast-${type} ${isVisible ? 'toast-enter' : 'toast-exit'}`}>
      <div className="toast-content">
        <span className="toast-icon">
          {type === 'info' && '🌊'}
          {type === 'warning' && '⚠️'}
          {type === 'error' && '❌'}
          {type === 'success' && '✅'}
        </span>
        <span className="toast-message">{message}</span>
      </div>
    </div>
  );
};

export default Toast;