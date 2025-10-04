/**
 * DateControls Component
 * Controles de fecha: selector, slider y play/pause
 */
import React, { useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import Slider from 'rc-slider';
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
  } = useAppStore();
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const indicatorData = getIndicatorById(indicator);
  
  // Play/Pause animation
  useEffect(() => {
    if (isPlaying) {
      const currentIndex = availableDates.indexOf(date);
      
      intervalRef.current = setInterval(() => {
        const nextIndex = (currentIndex + 1) % availableDates.length;
        if (nextIndex === 0) {
          setIsPlaying(false);
        } else {
          setDate(availableDates[nextIndex]);
        }
      }, playSpeed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, date, availableDates, playSpeed, setDate, setIsPlaying]);
  
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
  
  const currentIndex = availableDates.indexOf(date);
  const isStatic = indicatorData?.timeResolution === 'static';
  
  return (
    <div className="control-section">
      <label className="control-label">Fecha</label>
      
      <div className="date-picker-wrapper">
        <DatePicker
          selected={parseDate(date)}
          onChange={handleDatePickerChange}
          dateFormat="yyyy-MM-dd"
          className="date-picker-input"
          disabled={isStatic}
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
            <div className="slider-labels">
              <span>{availableDates[0]}</span>
              <span>{availableDates[availableDates.length - 1]}</span>
            </div>
          </div>
          
          <div className="play-controls">
            <button
              onClick={togglePlay}
              className="play-button"
              title={isPlaying ? 'Pausar animación' : 'Reproducir animación'}
            >
              {isPlaying ? '⏸️ Pausar' : '▶️ Reproducir'}
            </button>
            <span className="date-counter">
              {currentIndex + 1} / {availableDates.length}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default DateControls;
