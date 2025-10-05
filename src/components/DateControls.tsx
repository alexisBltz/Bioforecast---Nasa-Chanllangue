/**
 * DateControls Component
 * Controles de fecha: selector, slider y play/pause
 */
import React, { useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import Slider from 'rc-slider';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appStore';
import { parseDate, formatDate } from '../utils/dateUtils';
import { getIndicatorById } from '../services/gibsConfig';
import 'react-datepicker/dist/react-datepicker.css';
import 'rc-slider/assets/index.css';
import '../styles/DateControls.css';

const DateControls: React.FC = () => {
  const {
    date,
    setDate,
    availableDates,
    isPlaying,
    setIsPlaying,
    playSpeed,
    indicator,
    loading,
    dateInterval,
    setDateInterval,
  } = useAppStore();
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const indicatorData = getIndicatorById(indicator);
  const [showIntervalSelector, setShowIntervalSelector] = useState(false);
  
  // Play/Pause animation - espera a que la capa se cargue completamente
  useEffect(() => {
    if (isPlaying) {
      const playNextFrame = () => {
        const currentIndex = availableDates.indexOf(date);
        const nextIndex = (currentIndex + 1) % availableDates.length;
        
        if (nextIndex === 0) {
          // Llegó al final, detener reproducción
          setIsPlaying(false);
          return;
        }
        
        // Solo cambiar a la siguiente fecha si no está cargando
        if (!loading) {
          setDate(availableDates[nextIndex]);
          // Programar el siguiente frame con el intervalo normal
          intervalRef.current = setTimeout(playNextFrame, playSpeed);
        } else {
          // Si está cargando, esperar un poco más y verificar nuevamente
          // Timeout máximo de 5 segundos para evitar quedarse atascado
          intervalRef.current = setTimeout(playNextFrame, Math.min(500, playSpeed));
        }
      };
      
      // Iniciar la reproducción
      intervalRef.current = setTimeout(playNextFrame, playSpeed);
    } else {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isPlaying, date, availableDates, playSpeed, setDate, setIsPlaying, loading]);
  
  const handleDatePickerChange = (selectedDate: Date | null) => {
    if (selectedDate) {
      setDate(formatDate(selectedDate));
    }
  };
  
  const handleSliderChange = (value: number | number[]) => {
    const index = Array.isArray(value) ? value[0] : value;
    setDate(availableDates[index]);
  };
  
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleIntervalChange = (newInterval: number) => {
    setDateInterval(newInterval);
    setShowIntervalSelector(false);
  };
  
  const handleGoToToday = () => {
    const store = useAppStore.getState();
    store.goToToday();
  };
  
  const currentIndex = availableDates.indexOf(date);
  const isStatic = indicatorData?.timeResolution === 'static';
  const { t } = useTranslation();
  
  // Calcular rango de fechas visible
  const getDateRange = () => {
    if (availableDates.length === 0) return { start: '', end: '' };
    return {
      start: availableDates[0],
      end: availableDates[availableDates.length - 1]
    };
  };
  
  const dateRange = getDateRange();
  const intervalOptions = [1, 2, 3, 4, 5, 7, 10, 15, 20, 30];
  
  return (
    <div className="control-section">
      <div className="date-controls-header">
  <label className="control-label">{t('date_controls.title', 'Date Controls')}</label>
        <button 
          className="today-button"
          onClick={handleGoToToday}
          disabled={isStatic}
          title={t('go_to_most_recent')}
        >
          📅 Hoy
        </button>
      </div>
      
      {/* Barra de rango de fechas */}
      {!isStatic && dateRange.start && dateRange.end && (
        <div className="date-range-bar">
          <div className="date-range-info">
            <span className="range-label">{t('date_controls.range_label', 'Available range:')}</span>
            <div className="range-dates">
              <span className="range-start">{dateRange.start}</span>
              <span className="range-separator">→</span>
              <span className="range-end">{dateRange.end}</span>
            </div>
          </div>
          <div className="date-range-stats">
            <span className="stats-item">
              <strong>{availableDates.length}</strong> {t('date_controls.dates', 'dates')}
            </span>
            <span className="stats-separator">•</span>
            <span className="stats-item">
              {t('date_controls.interval_label', 'Interval')}: <strong>{dateInterval}</strong> {t('date_controls.days', 'day')}{dateInterval > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
      
      {/* Selector de intervalo personalizado */}
      {!isStatic && (
        <div className="interval-selector-container">
          <button 
            className="interval-toggle-button"
            onClick={() => setShowIntervalSelector(!showIntervalSelector)}
            title="Cambiar intervalo entre fechas"
          >
            ⚙️ Intervalo: {dateInterval} día{dateInterval > 1 ? 's' : ''}
            <span className={`toggle-arrow ${showIntervalSelector ? 'open' : ''}`}>▼</span>
          </button>
          
          {showIntervalSelector && (
            <div className="interval-options">
              <div className="interval-options-header">
            <span>{t('date_controls.select_step', 'Select the step between dates:')}</span>
              </div>
              <div className="interval-grid">
                {intervalOptions.map(interval => (
                  <button
                    key={interval}
                    className={`interval-option ${dateInterval === interval ? 'active' : ''}`}
                    onClick={() => handleIntervalChange(interval)}
                    title={t('date_controls.step_title', { count: interval, defaultValue: `Step of ${interval} day${interval > 1 ? 's' : ''}` })}
                  >
                    {interval}d
                  </button>
                ))}
              </div>
              <div className="interval-help-text">
                {t('date_controls.interval_help', 'Bigger interval = fewer dates, faster loading')}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="date-picker-wrapper">
        <DatePicker
          selected={parseDate(date)}
          onChange={handleDatePickerChange}
          dateFormat="yyyy-MM-dd"
          className="date-picker-input"
          disabled={isStatic}
          placeholderText={t('date_controls.select_date', 'Select a date')}
        />
      </div>
      
      {!isStatic && availableDates.length > 1 && (
        <>
          <div className="slider-wrapper">
            <Slider
              min={0}
              max={availableDates.length - 1}
              value={currentIndex}
              onChange={handleSliderChange}
              className="date-slider"
            />
            <div className="slider-info">
              <div className="slider-labels">
                <span className="slider-label-start">{availableDates[0]}</span>
                <span className="slider-label-current">{date}</span>
                <span className="slider-label-end">{availableDates[availableDates.length - 1]}</span>
              </div>
            </div>
          </div>
          
          <div className="play-controls">
            <button
              onClick={togglePlay}
              className="play-button"
              title={isPlaying ? t('date_controls.pause_animation', 'Pause animation') : t('date_controls.play_animation', 'Play animation')}
              disabled={isPlaying && loading}
            >
              {isPlaying ? (loading ? `${t('loading', 'Loading')} ⏳` : '⏸️ ' + t('date_controls.pause', 'Pause')) : '▶️ ' + t('date_controls.play', 'Play')}
            </button>
            <span className="date-counter">
              {currentIndex + 1} / {availableDates.length}
              {isPlaying && loading && ` (${t('loading', 'loading...')})`}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default DateControls;
