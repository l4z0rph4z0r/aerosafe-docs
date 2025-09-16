import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * AeroSafe Documentation Sidebars Configuration
 * 
 * Organized by industries, technology, and products
 * Cleaned up structure focusing on actual content
 */
const sidebars: SidebarsConfig = {
  // Main documentation sidebar
  docsSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: '🏠 Home',
    },
    {
      type: 'category',
      label: '🔧 Dispositivi DryFogS',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'prodotti/dfs-1',
          label: 'DFS-1 Carrellato',
        },
        {
          type: 'doc',
          id: 'prodotti/dfs-4',
          label: 'DFS-4 Professional',
        },
        {
          type: 'doc',
          id: 'prodotti/h1-0',
          label: 'H1.0 Compatto',
        },
        {
          type: 'doc',
          id: 'prodotti/i-genio',
          label: 'i.Genio Smart',
        },
      ],
    },
    {
      type: 'category',
      label: '🧪 Soluzioni Chimiche',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'prodotti/sanapur-atomic',
          label: 'SANAPUR Atomic',
        },
        {
          type: 'doc',
          id: 'prodotti/silver-shield',
          label: 'Silver Shield®',
        },
        {
          type: 'doc',
          id: 'prodotti/lee-plus-antiodor',
          label: 'LEE Plus® Anti-odore',
        },
        {
          type: 'doc',
          id: 'prodotti/lee-plus-vegetale',
          label: 'LEE Plus® Vegetale',
        },
        {
          type: 'doc',
          id: 'prodotti/x-odor',
          label: 'X-ODOR Neutralizzante',
        },
      ],
    },
    {
      type: 'category',
      label: '🔬 Tecnologia',
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'tecnologia/dryfogs-tecnologia-overview',
          label: 'DryFogS© Overview',
        },
        {
          type: 'doc',
          id: 'tecnologia/dryfogs-tecnologia-approfondimento',
          label: 'DryFogS© Approfondimento',
        },
        {
          type: 'doc',
          id: 'tecnologia/sanapur-disinfettanti-naturali',
          label: 'SANAPUR - Disinfettanti Naturali',
        },
        {
          type: 'doc',
          id: 'tecnologia/lee-plus-purificatore-vegetale',
          label: 'LEE Plus - Purificatore Vegetale',
        },
      ],
    },
    {
      type: 'category',
      label: '🏥 Settore Sanitario',
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'sanita/ambito-sanitario',
          label: 'Ambito Sanitario',
        },
        {
          type: 'doc',
          id: 'sanita/disinfezione-odontoiatria',
          label: 'Odontoiatria',
        },
        {
          type: 'doc',
          id: 'sanita/disinfezione-veterinaria',
          label: 'Veterinaria',
        },
        {
          type: 'doc',
          id: 'sanita/ambito-funerario',
          label: 'Servizi Funebri',
        },
        {
          type: 'doc',
          id: 'sanita/x-odor-funerario',
          label: 'X-ODOR Funerario',
        },
      ],
    },
    {
      type: 'category',
      label: '🏭 Settori Industriali',
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'settori/food-industry',
          label: 'Food Industry',
        },
        {
          type: 'doc',
          id: 'settori/beverage-industry',
          label: 'Beverage Industry',
        },
        {
          type: 'doc',
          id: 'settori/sicurezza-alimentare',
          label: 'Sicurezza Alimentare',
        },
        {
          type: 'doc',
          id: 'settori/conservazione-ortofrutta',
          label: 'Conservazione Ortofrutta',
        },
        {
          type: 'doc',
          id: 'settori/container-reefer',
          label: 'Container Reefer',
        },
        {
          type: 'doc',
          id: 'settori/trasporto-pubblico',
          label: 'Trasporto Pubblico',
        },
        {
          type: 'doc',
          id: 'settori/navale',
          label: 'Settore Navale',
        },
        {
          type: 'doc',
          id: 'settori/collettivita',
          label: 'Collettività',
        },
      ],
    },
    {
      type: 'category',
      label: '📚 Tutorial',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'tutorials/index',
          label: 'Panoramica Tutorial',
        },
        {
          type: 'doc',
          id: 'tutorials/x-odor-agenzie-funebri',
          label: 'X-ODOR per Agenzie Funebri',
        },
      ],
    },
  ],
};

export default sidebars;
