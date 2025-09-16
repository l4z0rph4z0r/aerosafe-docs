import React, { useState, useMemo } from 'react';
import { products, translations } from './data/mockData';
import { Product, FilterOptions } from './types';
import styles from './ProductSelector.module.css';

interface ProductSelectorProps {
  language?: 'it' | 'en';
  onProductSelect?: (product: Product) => void;
  onAddToQuote?: (product: Product) => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({ 
  language = 'it',
  onProductSelect,
  onAddToQuote
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    applications: [],
    industries: [],
    roomSizes: []
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const t = translations[language];

  // Get unique filter options
  const filterOptions = useMemo(() => {
    const applications = [...new Set(products.flatMap(p => p.applications))];
    const industries = [...new Set(products.flatMap(p => p.industries))];
    const roomSizes = [...new Set(products.flatMap(p => p.roomSizes))];

    return { applications, industries, roomSizes };
  }, []);

  // Filter products based on selected filters
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const applicationMatch = filters.applications.length === 0 || 
        filters.applications.some(app => product.applications.includes(app));
      
      const industryMatch = filters.industries.length === 0 || 
        filters.industries.some(ind => product.industries.includes(ind));
      
      const roomSizeMatch = filters.roomSizes.length === 0 || 
        filters.roomSizes.some(size => product.roomSizes.includes(size));

      return applicationMatch && industryMatch && roomSizeMatch;
    });
  }, [filters]);

  const handleFilterChange = (filterType: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  const clearFilters = () => {
    setFilters({ applications: [], industries: [], roomSizes: [] });
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleProductClick = (product: Product) => {
    onProductSelect?.(product);
  };

  const handleAddToQuote = (product: Product, event: React.MouseEvent) => {
    event.stopPropagation();
    onAddToQuote?.(product);
  };

  const formatPrice = (price: number) => `€${price}`;

  const getApplicationLabel = (app: string) => {
    const labels: Record<string, { it: string; en: string }> = {
      'odor-control': { it: 'Controllo Odori', en: 'Odor Control' },
      'disinfection': { it: 'Disinfezione', en: 'Disinfection' },
      'protection': { it: 'Protezione', en: 'Protection' }
    };
    return labels[app]?.[language] || app;
  };

  const getIndustryLabel = (industry: string) => {
    const labels: Record<string, { it: string; en: string }> = {
      'medical': { it: 'Medico', en: 'Medical' },
      'office': { it: 'Ufficio', en: 'Office' },
      'hotel': { it: 'Hotel', en: 'Hotel' },
      'restaurant': { it: 'Ristorante', en: 'Restaurant' },
      'funeral': { it: 'Funerario', en: 'Funeral' }
    };
    return labels[industry]?.[language] || industry;
  };

  const getRoomSizeLabel = (size: string) => {
    const labels: Record<string, { it: string; en: string }> = {
      'small': { it: 'Piccolo', en: 'Small' },
      'medium': { it: 'Medio', en: 'Medium' },
      'large': { it: 'Grande', en: 'Large' },
      'extra-large': { it: 'Extra Large', en: 'Extra Large' }
    };
    return labels[size]?.[language] || size;
  };

  return (
    <div className={styles.productSelector}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t.productSelector}</h2>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
          >
            ⊞
          </button>
          <button
            className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => setViewMode('list')}
            aria-label="List view"
          >
            ☰
          </button>
        </div>
      </div>

      <div className={styles.filters}>
        <h3 className={styles.filtersTitle}>{t.filterBy}</h3>
        
        <div className={styles.filterSection}>
          <h4 className={styles.filterLabel}>{t.application}</h4>
          <div className={styles.filterOptions}>
            {filterOptions.applications.map(app => (
              <label key={app} className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={filters.applications.includes(app)}
                  onChange={() => handleFilterChange('applications', app)}
                />
                <span className={styles.checkboxLabel}>
                  {getApplicationLabel(app)}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.filterSection}>
          <h4 className={styles.filterLabel}>{t.industry}</h4>
          <div className={styles.filterOptions}>
            {filterOptions.industries.map(industry => (
              <label key={industry} className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={filters.industries.includes(industry)}
                  onChange={() => handleFilterChange('industries', industry)}
                />
                <span className={styles.checkboxLabel}>
                  {getIndustryLabel(industry)}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.filterSection}>
          <h4 className={styles.filterLabel}>{t.roomSize}</h4>
          <div className={styles.filterOptions}>
            {filterOptions.roomSizes.map(size => (
              <label key={size} className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={filters.roomSizes.includes(size)}
                  onChange={() => handleFilterChange('roomSizes', size)}
                />
                <span className={styles.checkboxLabel}>
                  {getRoomSizeLabel(size)}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button className={styles.clearFilters} onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      <div className={styles.results}>
        <div className={styles.resultsHeader}>
          <span className={styles.resultCount}>
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </span>
          {selectedProducts.length > 0 && (
            <button className={styles.compareButton}>
              {t.compare} ({selectedProducts.length})
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className={styles.noResults}>
            <p>{t.noResults}</p>
          </div>
        ) : (
          <div className={`${styles.productGrid} ${viewMode === 'list' ? styles.listView : ''}`}>
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className={`${styles.productCard} ${selectedProducts.includes(product.id) ? styles.selected : ''}`}
                onClick={() => handleProductClick(product)}
              >
                {product.image && (
                  <div className={styles.productImage}>
                    <img src={product.image} alt={product.name} />
                  </div>
                )}
                
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.productDescription}>
                    {product.description[language]}
                  </p>
                  
                  <div className={styles.productMeta}>
                    <div className={styles.applications}>
                      {product.applications.slice(0, 2).map(app => (
                        <span key={app} className={styles.tag}>
                          {getApplicationLabel(app)}
                        </span>
                      ))}
                      {product.applications.length > 2 && (
                        <span className={styles.tag}>+{product.applications.length - 2}</span>
                      )}
                    </div>
                    
                    {product.price && (
                      <div className={styles.price}>
                        {formatPrice(product.price)}
                      </div>
                    )}
                  </div>

                  <div className={styles.features}>
                    {product.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className={styles.feature}>
                        ✓ {feature[language]}
                      </div>
                    ))}
                  </div>

                  <div className={styles.productActions}>
                    <button
                      className={styles.selectButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleProductSelection(product.id);
                      }}
                    >
                      {selectedProducts.includes(product.id) ? '✓' : '+'}
                    </button>
                    
                    <button
                      className={styles.quoteButton}
                      onClick={(e) => handleAddToQuote(product, e)}
                    >
                      {t.addToQuote}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSelector;