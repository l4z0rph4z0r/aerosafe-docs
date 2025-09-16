// TypeScript interfaces for AeroSafe interactive components

export interface Translation {
  it: string;
  en: string;
}

export interface RoomType {
  id: string;
  name: Translation;
  multiplier: number;
}

export interface Device {
  id: string;
  name: string;
  maxVolume: number;
  description: Translation;
  price?: number;
}

export interface Chemical {
  id: string;
  name: string;
  dosagePerM3: number;
  dilutionRatio?: string;
  applications: string[];
  safetyNotes: Translation;
  description: Translation;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  applications: string[];
  industries: string[];
  roomSizes: string[];
  image?: string;
  description: Translation;
  features: Translation[];
  price?: number;
}

export interface RoomCalculation {
  volume: number;
  recommendedDevice: Device;
  chemicalQuantity: number;
  treatmentDuration: number;
  estimatedCost?: number;
}

export interface DosageCalculation {
  totalDosage: number;
  dosagePerM3: number;
  dilutionInstructions?: string;
  safetyRecommendations: string[];
}

export interface Language {
  code: 'it' | 'en';
  name: string;
}

export interface FilterOptions {
  applications: string[];
  industries: string[];
  roomSizes: string[];
}