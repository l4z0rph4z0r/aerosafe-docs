import React, { useState, useEffect } from 'react';
import { roomTypes, devices, translations } from './data/mockData';
import { RoomCalculation, Language } from './types';
import styles from './RoomCalculator.module.css';

interface RoomCalculatorProps {
  language?: 'it' | 'en';
  onCalculationChange?: (calculation: RoomCalculation | null) => void;
}

const RoomCalculator: React.FC<RoomCalculatorProps> = ({ 
  language = 'it', 
  onCalculationChange 
}) => {
  const [dimensions, setDimensions] = useState({
    length: '',
    width: '',
    height: ''
  });
  const [selectedRoomType, setSelectedRoomType] = useState('');
  const [calculation, setCalculation] = useState<RoomCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const t = translations[language];

  const calculateRoom = () => {
    if (!dimensions.length || !dimensions.width || !dimensions.height || !selectedRoomType) {
      return;
    }

    setIsCalculating(true);

    // Simulate calculation delay
    setTimeout(() => {
      const length = parseFloat(dimensions.length);
      const width = parseFloat(dimensions.width);
      const height = parseFloat(dimensions.height);
      
      const roomType = roomTypes.find(rt => rt.id === selectedRoomType);
      if (!roomType) return;

      const baseVolume = length * width * height;
      const adjustedVolume = baseVolume * roomType.multiplier;
      
      // Determine recommended device based on volume
      const recommendedDevice = adjustedVolume <= 200 
        ? devices.find(d => d.id === 'dfs-1')!
        : devices.find(d => d.id === 'dfs-4')!;

      // Calculate chemical quantity (example: 2.5ml per m³)
      const chemicalQuantity = Math.round(adjustedVolume * 2.5 * 10) / 10;

      // Calculate treatment duration (example: 1 minute per 10 m³)
      const treatmentDuration = Math.ceil(adjustedVolume / 10);

      const newCalculation: RoomCalculation = {
        volume: Math.round(adjustedVolume * 10) / 10,
        recommendedDevice,
        chemicalQuantity,
        treatmentDuration,
        estimatedCost: recommendedDevice.price ? recommendedDevice.price + (chemicalQuantity * 2) : undefined
      };

      setCalculation(newCalculation);
      onCalculationChange?.(newCalculation);
      setIsCalculating(false);
    }, 500);
  };

  const resetCalculation = () => {
    setDimensions({ length: '', width: '', height: '' });
    setSelectedRoomType('');
    setCalculation(null);
    onCalculationChange?.(null);
  };

  const handleInputChange = (field: keyof typeof dimensions, value: string) => {
    // Only allow positive numbers with up to 2 decimal places
    if (value === '' || /^\d+\.?\d{0,2}$/.test(value)) {
      setDimensions(prev => ({ ...prev, [field]: value }));
    }
  };

  const isFormValid = dimensions.length && dimensions.width && dimensions.height && selectedRoomType;

  return (
    <div className={styles.calculator}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t.roomCalculator}</h2>
      </div>

      <div className={styles.form}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>{t.roomDimensions}</h3>
          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="length">
                {t.length}
              </label>
              <input
                id="length"
                type="text"
                className={styles.input}
                value={dimensions.length}
                onChange={(e) => handleInputChange('length', e.target.value)}
                placeholder="0.0"
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="width">
                {t.width}
              </label>
              <input
                id="width"
                type="text"
                className={styles.input}
                value={dimensions.width}
                onChange={(e) => handleInputChange('width', e.target.value)}
                placeholder="0.0"
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="height">
                {t.height}
              </label>
              <input
                id="height"
                type="text"
                className={styles.input}
                value={dimensions.height}
                onChange={(e) => handleInputChange('height', e.target.value)}
                placeholder="0.0"
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="roomType">
              {t.roomType}
            </label>
            <select
              id="roomType"
              className={styles.select}
              value={selectedRoomType}
              onChange={(e) => setSelectedRoomType(e.target.value)}
            >
              <option value="">{t.selectRoomType}</option>
              {roomTypes.map(roomType => (
                <option key={roomType.id} value={roomType.id}>
                  {roomType.name[language]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={calculateRoom}
            disabled={!isFormValid || isCalculating}
          >
            {isCalculating ? t.loading : t.calculate}
          </button>
          <button
            className={`${styles.button} ${styles.secondaryButton}`}
            onClick={resetCalculation}
          >
            {t.reset}
          </button>
        </div>
      </div>

      {calculation && (
        <div className={styles.results}>
          <h3 className={styles.sectionTitle}>{t.results}</h3>
          <div className={styles.resultGrid}>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>{t.volume}:</span>
              <span className={styles.resultValue}>{calculation.volume} m³</span>
            </div>
            
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>{t.recommendedDevice}:</span>
              <span className={styles.resultValue}>{calculation.recommendedDevice.name}</span>
            </div>
            
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>{t.chemicalQuantity}:</span>
              <span className={styles.resultValue}>{calculation.chemicalQuantity} ml</span>
            </div>
            
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>{t.treatmentDuration}:</span>
              <span className={styles.resultValue}>{calculation.treatmentDuration} {t.minutes}</span>
            </div>

            {calculation.estimatedCost && (
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>{t.price}:</span>
                <span className={styles.resultValue}>€{calculation.estimatedCost}</span>
              </div>
            )}
          </div>
          
          <div className={styles.deviceDescription}>
            <p className={styles.description}>
              {calculation.recommendedDevice.description[language]}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomCalculator;