// Mock data for AeroSafe components
import { RoomType, Device, Chemical, Product } from '../types';

export const roomTypes: RoomType[] = [
  {
    id: 'medical',
    name: { it: 'Medico', en: 'Medical' },
    multiplier: 1.2
  },
  {
    id: 'office',
    name: { it: 'Ufficio', en: 'Office' },
    multiplier: 1.0
  },
  {
    id: 'hotel',
    name: { it: 'Hotel', en: 'Hotel' },
    multiplier: 1.1
  },
  {
    id: 'restaurant',
    name: { it: 'Ristorante', en: 'Restaurant' },
    multiplier: 1.3
  },
  {
    id: 'funeral',
    name: { it: 'Funerario', en: 'Funeral Home' },
    multiplier: 1.4
  }
];

export const devices: Device[] = [
  {
    id: 'dfs-1',
    name: 'DryFogS DFS-1',
    maxVolume: 200,
    description: {
      it: 'Ideale per ambienti fino a 200 m³',
      en: 'Ideal for environments up to 200 m³'
    },
    price: 1200
  },
  {
    id: 'dfs-4',
    name: 'DryFogS DFS-4',
    maxVolume: 1000,
    description: {
      it: 'Perfetto per ambienti oltre i 200 m³',
      en: 'Perfect for environments over 200 m³'
    },
    price: 2500
  }
];

export const chemicals: Chemical[] = [
  {
    id: 'x-odor',
    name: 'X-Odor',
    dosagePerM3: 2.5,
    applications: ['odor-control'],
    safetyNotes: {
      it: 'Utilizzare guanti protettivi. Evitare il contatto con gli occhi.',
      en: 'Use protective gloves. Avoid eye contact.'
    },
    description: {
      it: 'Neutralizzatore di odori professionale',
      en: 'Professional odor neutralizer'
    }
  },
  {
    id: 'lee-plus',
    name: 'Lee Plus',
    dosagePerM3: 3.0,
    dilutionRatio: '1:10',
    applications: ['disinfection'],
    safetyNotes: {
      it: 'Diluire prima dell\'uso. Non mescolare con altri prodotti chimici.',
      en: 'Dilute before use. Do not mix with other chemicals.'
    },
    description: {
      it: 'Disinfettante ad ampio spettro',
      en: 'Broad-spectrum disinfectant'
    }
  },
  {
    id: 'sanapur-atomic',
    name: 'Sanapur Atomic',
    dosagePerM3: 4.0,
    applications: ['disinfection', 'protection'],
    safetyNotes: {
      it: 'Utilizzare in ambienti ventilati. Evitare l\'inalazione diretta.',
      en: 'Use in ventilated areas. Avoid direct inhalation.'
    },
    description: {
      it: 'Formula avanzata per disinfezione e protezione',
      en: 'Advanced formula for disinfection and protection'
    }
  }
];

export const products: Product[] = [
  {
    id: 'dryfogs-dfs1',
    name: 'DryFogS DFS-1',
    category: 'device',
    applications: ['odor-control', 'disinfection'],
    industries: ['medical', 'office', 'hotel'],
    roomSizes: ['small', 'medium'],
    description: {
      it: 'Sistema di nebulizzazione compatto per ambienti fino a 200 m³',
      en: 'Compact fogging system for environments up to 200 m³'
    },
    features: [
      { it: 'Nebulizzazione ultrafine', en: 'Ultra-fine fogging' },
      { it: 'Controllo automatico', en: 'Automatic control' },
      { it: 'Facile manutenzione', en: 'Easy maintenance' }
    ],
    price: 1200
  },
  {
    id: 'dryfogs-dfs4',
    name: 'DryFogS DFS-4',
    category: 'device',
    applications: ['odor-control', 'disinfection', 'protection'],
    industries: ['medical', 'restaurant', 'funeral'],
    roomSizes: ['large', 'extra-large'],
    description: {
      it: 'Sistema di nebulizzazione professionale per grandi ambienti',
      en: 'Professional fogging system for large environments'
    },
    features: [
      { it: 'Alta capacità', en: 'High capacity' },
      { it: 'Controllo remoto', en: 'Remote control' },
      { it: 'Dosaggio preciso', en: 'Precise dosing' }
    ],
    price: 2500
  },
  {
    id: 'x-odor-solution',
    name: 'X-Odor Solution',
    category: 'chemical',
    applications: ['odor-control'],
    industries: ['restaurant', 'hotel', 'office'],
    roomSizes: ['small', 'medium', 'large'],
    description: {
      it: 'Soluzione professionale per il controllo degli odori',
      en: 'Professional odor control solution'
    },
    features: [
      { it: 'Azione rapida', en: 'Fast action' },
      { it: 'Lunga durata', en: 'Long-lasting' },
      { it: 'Sicuro per l\'ambiente', en: 'Environmentally safe' }
    ],
    price: 45
  }
];

export const translations = {
  it: {
    // Room Calculator
    roomCalculator: 'Calcolatore Ambiente',
    roomDimensions: 'Dimensioni Ambiente',
    length: 'Lunghezza (m)',
    width: 'Larghezza (m)',
    height: 'Altezza (m)',
    roomType: 'Tipo Ambiente',
    selectRoomType: 'Seleziona tipo ambiente',
    calculate: 'Calcola',
    results: 'Risultati',
    volume: 'Volume',
    recommendedDevice: 'Dispositivo Consigliato',
    chemicalQuantity: 'Quantità Prodotto Chimico',
    treatmentDuration: 'Durata Trattamento',
    minutes: 'minuti',
    
    // Product Selector
    productSelector: 'Selettore Prodotti',
    filterBy: 'Filtra per',
    application: 'Applicazione',
    industry: 'Settore',
    roomSize: 'Dimensione Ambiente',
    allApplications: 'Tutte le Applicazioni',
    allIndustries: 'Tutti i Settori',
    allRoomSizes: 'Tutte le Dimensioni',
    addToQuote: 'Aggiungi al Preventivo',
    compare: 'Confronta',
    
    // Dosage Calculator
    dosageCalculator: 'Calcolatore Dosaggio',
    selectChemical: 'Seleziona Prodotto Chimico',
    roomVolume: 'Volume Ambiente (m³)',
    totalDosage: 'Dosaggio Totale',
    safetyRecommendations: 'Raccomandazioni di Sicurezza',
    dilutionInstructions: 'Istruzioni per Diluizione',
    
    // Common
    reset: 'Reset',
    error: 'Errore',
    loading: 'Caricamento...',
    noResults: 'Nessun risultato trovato',
    price: 'Prezzo',
    features: 'Caratteristiche',
    description: 'Descrizione'
  },
  en: {
    // Room Calculator
    roomCalculator: 'Room Calculator',
    roomDimensions: 'Room Dimensions',
    length: 'Length (m)',
    width: 'Width (m)',
    height: 'Height (m)',
    roomType: 'Room Type',
    selectRoomType: 'Select room type',
    calculate: 'Calculate',
    results: 'Results',
    volume: 'Volume',
    recommendedDevice: 'Recommended Device',
    chemicalQuantity: 'Chemical Quantity',
    treatmentDuration: 'Treatment Duration',
    minutes: 'minutes',
    
    // Product Selector
    productSelector: 'Product Selector',
    filterBy: 'Filter by',
    application: 'Application',
    industry: 'Industry',
    roomSize: 'Room Size',
    allApplications: 'All Applications',
    allIndustries: 'All Industries',
    allRoomSizes: 'All Room Sizes',
    addToQuote: 'Add to Quote',
    compare: 'Compare',
    
    // Dosage Calculator
    dosageCalculator: 'Dosage Calculator',
    selectChemical: 'Select Chemical Product',
    roomVolume: 'Room Volume (m³)',
    totalDosage: 'Total Dosage',
    safetyRecommendations: 'Safety Recommendations',
    dilutionInstructions: 'Dilution Instructions',
    
    // Common
    reset: 'Reset',
    error: 'Error',
    loading: 'Loading...',
    noResults: 'No results found',
    price: 'Price',
    features: 'Features',
    description: 'Description'
  }
};