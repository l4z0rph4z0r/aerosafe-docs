import React, { useState } from 'react';
import RoomCalculator from './RoomCalculator';
import ProductSelector from './ProductSelector';
import DosageCalculator from './DosageCalculator';
import { RoomCalculation, Product, DosageCalculation } from './types';
import styles from './AeroSafeTools.module.css';

interface AeroSafeToolsProps {
  language?: 'it' | 'en';
  activeTab?: 'calculator' | 'selector' | 'dosage';
}

const AeroSafeTools: React.FC<AeroSafeToolsProps> = ({ 
  language = 'it',
  activeTab = 'calculator'
}) => {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [roomCalculation, setRoomCalculation] = useState<RoomCalculation | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [dosageCalculation, setDosageCalculation] = useState<DosageCalculation | null>(null);

  const translations = {
    it: {
      roomCalculator: 'Calcolatore Ambiente',
      productSelector: 'Selettore Prodotti',
      dosageCalculator: 'Calcolatore Dosaggio',
      quote: 'Preventivo',
      addedToQuote: 'Aggiunto al preventivo',
      totalProducts: 'Prodotti totali',
      estimatedTotal: 'Totale stimato'
    },
    en: {
      roomCalculator: 'Room Calculator',
      productSelector: 'Product Selector',
      dosageCalculator: 'Dosage Calculator',
      quote: 'Quote',
      addedToQuote: 'Added to quote',
      totalProducts: 'Total products',
      estimatedTotal: 'Estimated total'
    }
  };

  const t = translations[language];

  const handleRoomCalculation = (calculation: RoomCalculation | null) => {
    setRoomCalculation(calculation);
    // Auto-switch to dosage calculator if room is calculated
    if (calculation && currentTab === 'calculator') {
      setTimeout(() => setCurrentTab('dosage'), 1000);
    }
  };

  const handleProductSelect = (product: Product) => {
    console.log('Selected product:', product);
    // Could open a modal or navigate to product detail
  };

  const handleAddToQuote = (product: Product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev; // Don't add duplicates
      }
      return [...prev, product];
    });
    
    // Show notification or feedback
    console.log(`${product.name} ${t.addedToQuote}`);
  };

  const handleDosageCalculation = (calculation: DosageCalculation | null) => {
    setDosageCalculation(calculation);
  };

  const getEstimatedTotal = () => {
    return selectedProducts.reduce((total, product) => total + (product.price || 0), 0);
  };

  const tabContent = {
    calculator: (
      <RoomCalculator 
        language={language}
        onCalculationChange={handleRoomCalculation}
      />
    ),
    selector: (
      <ProductSelector 
        language={language}
        onProductSelect={handleProductSelect}
        onAddToQuote={handleAddToQuote}
      />
    ),
    dosage: (
      <DosageCalculator 
        language={language}
        initialVolume={roomCalculation?.volume || 0}
        onCalculationChange={handleDosageCalculation}
      />
    )
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.mainTitle}>AeroSafe Interactive Tools</h1>
        
        <nav className={styles.tabs}>
          <button
            className={`${styles.tab} ${currentTab === 'calculator' ? styles.active : ''}`}
            onClick={() => setCurrentTab('calculator')}
          >
            {t.roomCalculator}
          </button>
          <button
            className={`${styles.tab} ${currentTab === 'selector' ? styles.active : ''}`}
            onClick={() => setCurrentTab('selector')}
          >
            {t.productSelector}
          </button>
          <button
            className={`${styles.tab} ${currentTab === 'dosage' ? styles.active : ''}`}
            onClick={() => setCurrentTab('dosage')}
          >
            {t.dosageCalculator}
          </button>
        </nav>
      </div>

      <div className={styles.content}>
        <div className={styles.mainContent}>
          {tabContent[currentTab]}
        </div>

        {(selectedProducts.length > 0 || roomCalculation || dosageCalculation) && (
          <div className={styles.sidebar}>
            <div className={styles.summary}>
              <h3 className={styles.summaryTitle}>{t.quote}</h3>
              
              {roomCalculation && (
                <div className={styles.summarySection}>
                  <h4>Room Calculation</h4>
                  <div className={styles.summaryItem}>
                    <span>Volume: {roomCalculation.volume} m³</span>
                    <span>Device: {roomCalculation.recommendedDevice.name}</span>
                  </div>
                </div>
              )}

              {dosageCalculation && (
                <div className={styles.summarySection}>
                  <h4>Dosage</h4>
                  <div className={styles.summaryItem}>
                    <span>Total: {dosageCalculation.totalDosage} ml</span>
                    <span>Rate: {dosageCalculation.dosagePerM3} ml/m³</span>
                  </div>
                </div>
              )}

              {selectedProducts.length > 0 && (
                <div className={styles.summarySection}>
                  <h4>{t.totalProducts}: {selectedProducts.length}</h4>
                  {selectedProducts.map(product => (
                    <div key={product.id} className={styles.summaryItem}>
                      <span>{product.name}</span>
                      {product.price && <span>€{product.price}</span>}
                    </div>
                  ))}
                  
                  <div className={styles.total}>
                    <strong>{t.estimatedTotal}: €{getEstimatedTotal()}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AeroSafeTools;