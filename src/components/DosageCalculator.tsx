import React, { useState, useMemo } from 'react';
import { chemicals, translations } from './data/mockData';
import { DosageCalculation, Chemical } from './types';
import styles from './DosageCalculator.module.css';

interface DosageCalculatorProps {
  language?: 'it' | 'en';
  initialVolume?: number;
  onCalculationChange?: (calculation: DosageCalculation | null) => void;
}

const DosageCalculator: React.FC<DosageCalculatorProps> = ({ 
  language = 'it',
  initialVolume = 0,
  onCalculationChange
}) => {
  const [selectedChemicalId, setSelectedChemicalId] = useState<string>('');
  const [roomVolume, setRoomVolume] = useState<string>(initialVolume.toString());
  const [customDosage, setCustomDosage] = useState<string>('');
  const [useCustomDosage, setUseCustomDosage] = useState<boolean>(false);
  const [calculation, setCalculation] = useState<DosageCalculation | null>(null);

  const t = translations[language];

  const selectedChemical = useMemo(() => 
    chemicals.find(c => c.id === selectedChemicalId) || null,
    [selectedChemicalId]
  );

  const calculateDosage = () => {
    if (!selectedChemical || !roomVolume || parseFloat(roomVolume) <= 0) {
      setCalculation(null);
      onCalculationChange?.(null);
      return;
    }

    const volume = parseFloat(roomVolume);
    const dosagePerM3 = useCustomDosage && customDosage 
      ? parseFloat(customDosage) 
      : selectedChemical.dosagePerM3;

    if (dosagePerM3 <= 0) {
      setCalculation(null);
      onCalculationChange?.(null);
      return;
    }

    const totalDosage = Math.round(volume * dosagePerM3 * 100) / 100;

    // Generate safety recommendations based on chemical properties
    const safetyRecommendations: string[] = [
      selectedChemical.safetyNotes[language]
    ];

    // Add volume-based recommendations
    if (volume > 500) {
      safetyRecommendations.push(
        language === 'it' 
          ? 'Per ambienti grandi, utilizzare ventilazione adeguata'
          : 'For large spaces, ensure adequate ventilation'
      );
    }

    if (dosagePerM3 > 3) {
      safetyRecommendations.push(
        language === 'it'
          ? 'Concentrazione elevata - utilizzare DPI appropriati'
          : 'High concentration - use appropriate PPE'
      );
    }

    const newCalculation: DosageCalculation = {
      totalDosage,
      dosagePerM3,
      dilutionInstructions: selectedChemical.dilutionRatio 
        ? `${language === 'it' ? 'Diluizione' : 'Dilution'}: ${selectedChemical.dilutionRatio} ${language === 'it' ? 'con acqua' : 'with water'}`
        : undefined,
      safetyRecommendations
    };

    setCalculation(newCalculation);
    onCalculationChange?.(newCalculation);
  };

  const resetCalculation = () => {
    setSelectedChemicalId('');
    setRoomVolume('');
    setCustomDosage('');
    setUseCustomDosage(false);
    setCalculation(null);
    onCalculationChange?.(null);
  };

  const handleVolumeChange = (value: string) => {
    // Allow positive numbers with up to 2 decimal places
    if (value === '' || /^\d+\.?\d{0,2}$/.test(value)) {
      setRoomVolume(value);
    }
  };

  const handleCustomDosageChange = (value: string) => {
    // Allow positive numbers with up to 2 decimal places
    if (value === '' || /^\d+\.?\d{0,2}$/.test(value)) {
      setCustomDosage(value);
    }
  };

  // Auto-calculate when values change
  React.useEffect(() => {
    if (selectedChemicalId && roomVolume) {
      calculateDosage();
    } else {
      setCalculation(null);
      onCalculationChange?.(null);
    }
  }, [selectedChemicalId, roomVolume, customDosage, useCustomDosage]);

  const isFormValid = selectedChemicalId && roomVolume && parseFloat(roomVolume) > 0;

  return (
    <div className={styles.calculator}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t.dosageCalculator}</h2>
      </div>

      <div className={styles.form}>
        <div className={styles.section}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="chemical">
              {t.selectChemical}
            </label>
            <select
              id="chemical"
              className={styles.select}
              value={selectedChemicalId}
              onChange={(e) => setSelectedChemicalId(e.target.value)}
            >
              <option value="">{t.selectChemical}</option>
              {chemicals.map(chemical => (
                <option key={chemical.id} value={chemical.id}>
                  {chemical.name}
                </option>
              ))}
            </select>
          </div>

          {selectedChemical && (
            <div className={styles.chemicalInfo}>
              <p className={styles.chemicalDescription}>
                {selectedChemical.description[language]}
              </p>
              <div className={styles.chemicalDetails}>
                <span className={styles.defaultDosage}>
                  {language === 'it' ? 'Dosaggio standard' : 'Standard dosage'}: {selectedChemical.dosagePerM3} ml/m³
                </span>
                {selectedChemical.dilutionRatio && (
                  <span className={styles.dilution}>
                    {language === 'it' ? 'Diluizione' : 'Dilution'}: {selectedChemical.dilutionRatio}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.section}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="volume">
              {t.roomVolume}
            </label>
            <input
              id="volume"
              type="text"
              className={styles.input}
              value={roomVolume}
              onChange={(e) => handleVolumeChange(e.target.value)}
              placeholder="0.0"
            />
          </div>
        </div>

        {selectedChemical && (
          <div className={styles.section}>
            <div className={styles.customDosageSection}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={useCustomDosage}
                  onChange={(e) => setUseCustomDosage(e.target.checked)}
                />
                <span className={styles.checkboxLabel}>
                  {language === 'it' ? 'Usa dosaggio personalizzato' : 'Use custom dosage'}
                </span>
              </label>
              
              {useCustomDosage && (
                <div className={styles.inputGroup}>
                  <label className={styles.label} htmlFor="customDosage">
                    {language === 'it' ? 'Dosaggio personalizzato (ml/m³)' : 'Custom dosage (ml/m³)'}
                  </label>
                  <input
                    id="customDosage"
                    type="text"
                    className={styles.input}
                    value={customDosage}
                    onChange={(e) => handleCustomDosageChange(e.target.value)}
                    placeholder={selectedChemical.dosagePerM3.toString()}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button
            className={`${styles.button} ${styles.secondaryButton}`}
            onClick={resetCalculation}
          >
            {t.reset}
          </button>
        </div>
      </div>

      {calculation && selectedChemical && (
        <div className={styles.results}>
          <h3 className={styles.sectionTitle}>{t.results}</h3>
          
          <div className={styles.resultGrid}>
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>{t.totalDosage}:</span>
              <span className={styles.resultValue}>{calculation.totalDosage} ml</span>
            </div>
            
            <div className={styles.resultItem}>
              <span className={styles.resultLabel}>
                {language === 'it' ? 'Dosaggio per m³' : 'Dosage per m³'}:
              </span>
              <span className={styles.resultValue}>{calculation.dosagePerM3} ml/m³</span>
            </div>
            
            {calculation.dilutionInstructions && (
              <div className={styles.resultItem}>
                <span className={styles.resultLabel}>{t.dilutionInstructions}:</span>
                <span className={styles.resultValue}>{calculation.dilutionInstructions}</span>
              </div>
            )}
          </div>

          <div className={styles.safetySection}>
            <h4 className={styles.safetyTitle}>{t.safetyRecommendations}</h4>
            <ul className={styles.safetyList}>
              {calculation.safetyRecommendations.map((recommendation, index) => (
                <li key={index} className={styles.safetyItem}>
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.applicationInfo}>
            <h4 className={styles.applicationTitle}>
              {language === 'it' ? 'Applicazioni' : 'Applications'}
            </h4>
            <div className={styles.applicationTags}>
              {selectedChemical.applications.map(app => (
                <span key={app} className={styles.applicationTag}>
                  {app === 'odor-control' && (language === 'it' ? 'Controllo Odori' : 'Odor Control')}
                  {app === 'disinfection' && (language === 'it' ? 'Disinfezione' : 'Disinfection')}
                  {app === 'protection' && (language === 'it' ? 'Protezione' : 'Protection')}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {!isFormValid && selectedChemicalId && (
        <div className={styles.validationMessage}>
          {language === 'it' 
            ? 'Inserire un volume valido per calcolare il dosaggio'
            : 'Enter a valid volume to calculate dosage'
          }
        </div>
      )}
    </div>
  );
};

export default DosageCalculator;