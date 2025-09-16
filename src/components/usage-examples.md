# AeroSafe Interactive Components - Usage Examples

## Overview
This package contains three interactive React TypeScript components for AeroSafe's website:

1. **RoomCalculator** - Calculate room volume and device recommendations
2. **ProductSelector** - Filter and select products with comparison features
3. **DosageCalculator** - Calculate chemical dosages based on room volume

All components are bilingual (Italian/English) with responsive Material-UI-inspired design.

## Quick Start

```tsx
import React from 'react';
import { RoomCalculator, ProductSelector, DosageCalculator } from './components';

// Use individual components
function MyPage() {
  return (
    <div>
      <RoomCalculator language="en" />
      <ProductSelector language="it" />
      <DosageCalculator language="en" initialVolume={50} />
    </div>
  );
}

// Or use the combined interface
import AeroSafeTools from './components/AeroSafeTools';

function ToolsPage() {
  return <AeroSafeTools language="en" activeTab="calculator" />;
}
```

## Component APIs

### RoomCalculator

```tsx
interface RoomCalculatorProps {
  language?: 'it' | 'en';
  onCalculationChange?: (calculation: RoomCalculation | null) => void;
}

// Usage
<RoomCalculator 
  language="it"
  onCalculationChange={(calc) => console.log('Room calculated:', calc)}
/>
```

**Features:**
- Input room dimensions (length, width, height)
- Select room type (medical, office, hotel, restaurant, funeral)
- Automatic volume calculation with type-specific multipliers
- Device recommendation (DFS-1 for <200m³, DFS-4 for >200m³)
- Chemical quantity calculation
- Treatment duration estimation
- Mobile responsive design

### ProductSelector

```tsx
interface ProductSelectorProps {
  language?: 'it' | 'en';
  onProductSelect?: (product: Product) => void;
  onAddToQuote?: (product: Product) => void;
}

// Usage
<ProductSelector
  language="en"
  onProductSelect={(product) => console.log('Selected:', product)}
  onAddToQuote={(product) => console.log('Added to quote:', product)}
/>
```

**Features:**
- Multi-criteria filtering (application, industry, room size)
- Grid/list view toggle
- Product comparison selection
- Add to quote functionality
- Responsive product cards
- Bilingual product information

### DosageCalculator

```tsx
interface DosageCalculatorProps {
  language?: 'it' | 'en';
  initialVolume?: number;
  onCalculationChange?: (calculation: DosageCalculation | null) => void;
}

// Usage
<DosageCalculator
  language="it"
  initialVolume={100}
  onCalculationChange={(calc) => console.log('Dosage calculated:', calc)}
/>
```

**Features:**
- Chemical product selection (X-Odor, Lee Plus, Sanapur Atomic)
- Room volume input
- Custom dosage override option
- Automatic calculation on input change
- Safety recommendations
- Dilution instructions
- Application tags

### AeroSafeTools (Combined Interface)

```tsx
interface AeroSafeToolsProps {
  language?: 'it' | 'en';
  activeTab?: 'calculator' | 'selector' | 'dosage';
}

// Usage
<AeroSafeTools 
  language="en" 
  activeTab="calculator"
/>
```

**Features:**
- Tabbed interface with all three tools
- Sidebar with calculation summary
- Cross-component data sharing
- Quote management
- Responsive layout

## Styling

Components use CSS Modules with Material-UI-inspired design:

- **Colors**: Primary blue (#1565c0), light backgrounds
- **Typography**: Modern font weights and sizing
- **Spacing**: Consistent 8px grid system
- **Shadows**: Subtle elevation effects
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first approach with breakpoints

## Bilingual Support

All text content is externalized in the translations object:

```tsx
const translations = {
  it: {
    roomCalculator: 'Calcolatore Ambiente',
    calculate: 'Calcola',
    // ... more translations
  },
  en: {
    roomCalculator: 'Room Calculator',
    calculate: 'Calculate',
    // ... more translations
  }
};
```

## Data Models

### Room Types
- Medical (1.2x multiplier)
- Office (1.0x multiplier)  
- Hotel (1.1x multiplier)
- Restaurant (1.3x multiplier)
- Funeral (1.4x multiplier)

### Devices
- DFS-1: Up to 200m³, €1,200
- DFS-4: Over 200m³, €2,500

### Chemicals
- X-Odor: 2.5ml/m³, odor control
- Lee Plus: 3.0ml/m³, disinfection, 1:10 dilution
- Sanapur Atomic: 4.0ml/m³, disinfection + protection

## Mobile Responsiveness

All components are fully responsive with:
- **Desktop**: Multi-column layouts, hover effects
- **Tablet**: Adjusted grid layouts, maintained functionality
- **Mobile**: Single-column layouts, touch-friendly buttons
- **Small Mobile**: Optimized for 320px width

## Accessibility

Components include:
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- High contrast mode support
- Reduced motion preferences
- Screen reader compatibility

## Browser Support

- Chrome 88+
- Firefox 78+
- Safari 14+
- Edge 88+

## Performance

- Lazy loading for large datasets
- Debounced search/filter operations
- Memoized calculations
- Optimized re-renders with React.memo
- CSS modules for efficient styling

## Customization

Components accept custom props and can be styled with:
- CSS module overrides
- Custom theme provider
- CSS custom properties
- Styled-components integration