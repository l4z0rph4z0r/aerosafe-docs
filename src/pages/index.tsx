import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <Heading as="h1" className="hero__title">
              AeroSafe Documentation
            </Heading>
            <p className={clsx("hero__subtitle", styles.heroSubtitle)}>
              Documentazione tecnica completa per i sistemi di nebulizzazione DryFogS®
              e le soluzioni sanificanti professionali
            </p>
            <div className={styles.heroButtons}>
              <Link
                className={clsx("button button--secondary button--lg", styles.heroButton)}
                to="/docs">
                Inizia ora
              </Link>
              <Link
                className={clsx("button button--outline button--lg", styles.heroButtonOutline)}
                to="/docs/dispositivi/introduzione">
                Scopri i Dispositivi
              </Link>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroIcon}>
              <svg viewBox="0 0 100 100" className={styles.heroSvg}>
                <defs>
                  <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="45" fill="url(#heroGradient)" opacity="0.1"/>
                <circle cx="30" cy="30" r="3" fill="#2563eb"/>
                <circle cx="70" cy="35" r="2" fill="#16a34a"/>
                <circle cx="25" cy="60" r="2" fill="#2563eb"/>
                <circle cx="75" cy="65" r="3" fill="#16a34a"/>
                <circle cx="50" cy="75" r="2" fill="#2563eb"/>
                <circle cx="50" cy="25" r="2" fill="#16a34a"/>
                <path d="M20 50 Q50 20 80 50 Q50 80 20 50" stroke="url(#heroGradient)" strokeWidth="2" fill="none" opacity="0.6"/>
              </svg>
            </div>
          </div>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <div className={styles.heroStatNumber}>4</div>
            <div className={styles.heroStatLabel}>Modelli DFS</div>
          </div>
          <div className={styles.heroStat}>
            <div className={styles.heroStatNumber}>15+</div>
            <div className={styles.heroStatLabel}>Soluzioni Biocide</div>
          </div>
          <div className={styles.heroStat}>
            <div className={styles.heroStatNumber}>5</div>
            <div className={styles.heroStatLabel}>Settori di Applicazione</div>
          </div>
        </div>
      </div>
    </header>
  );
}

function TechnologySection() {
  return (
    <section className={styles.technologySection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Tecnologia DryFogS®</Heading>
          <p className={styles.sectionSubtitle}>
            La tecnologia brevettata per la nebulizzazione a secco che garantisce
            un'efficacia superiore nella sanificazione professionale
          </p>
        </div>
        <div className={styles.technologyGrid}>
          <div className={styles.technologyCard}>
            <div className={styles.technologyIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
            </div>
            <h3>Nebulizzazione Ultrafine</h3>
            <p>Particelle da 0.1 a 10 micron per una distribuzione omogenea e penetrazione ottimale</p>
          </div>
          <div className={styles.technologyCard}>
            <div className={styles.technologyIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11H1v3h8v3l8-4-8-4v2z"></path>
              </svg>
            </div>
            <h3>Controllo Automatico</h3>
            <p>Sistemi di controllo avanzati per dosaggio preciso e monitoraggio in tempo reale</p>
          </div>
          <div className={styles.technologyCard}>
            <div className={styles.technologyIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22,4 12,14.01 9,11.01"></polyline>
              </svg>
            </div>
            <h3>Efficacia Certificata</h3>
            <p>Testato secondo normative europee per efficacia battericida, virucida e fungicida</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductsSection() {
  return (
    <section className={styles.productsSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Gamma Prodotti</Heading>
          <p className={styles.sectionSubtitle}>
            Dispositivi e soluzioni per ogni esigenza di sanificazione professionale
          </p>
        </div>
        <div className={styles.productsGrid}>
          <Link to="/docs/dispositivi/dfs-1" className={styles.productCard}>
            <div className={styles.productHeader}>
              <div className={styles.productIcon}>DFS-1</div>
              <div className={styles.productBadge}>Compatto</div>
            </div>
            <h3>DFS-1 Compact</h3>
            <p>Dispositivo portatile per ambienti fino a 100 m³. Ideale per studi medici e piccoli uffici.</p>
            <div className={styles.productSpecs}>
              <span>• Portata: 50-100 m³</span>
              <span>• Peso: 2.5 kg</span>
              <span>• Autonomia: 4 ore</span>
            </div>
          </Link>
          <Link to="/docs/dispositivi/dfs-4" className={styles.productCard}>
            <div className={styles.productHeader}>
              <div className={styles.productIcon}>DFS-4</div>
              <div className={styles.productBadge}>Professionale</div>
            </div>
            <h3>DFS-4 Professional</h3>
            <p>Sistema avanzato per grandi ambienti fino a 1000 m³. Controllo remoto e programmazione automatica.</p>
            <div className={styles.productSpecs}>
              <span>• Portata: 500-1000 m³</span>
              <span>• Controllo remoto</span>
              <span>• Programmazione 24/7</span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

function QuickLinksSection() {
  return (
    <section className={styles.quickLinksSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Accesso Rapido</Heading>
          <p className={styles.sectionSubtitle}>
            Le risorse più consultate per iniziare subito
          </p>
        </div>
        <div className={styles.quickLinksGrid}>
          <Link to="/docs/guide/installazione" className={styles.quickLinkCard}>
            <div className={styles.quickLinkIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
            </div>
            <h4>Guida Installazione</h4>
            <p>Procedura step-by-step per l'installazione e configurazione</p>
          </Link>
          <Link to="/docs/prodotti/soluzioni-biocide" className={styles.quickLinkCard}>
            <div className={styles.quickLinkIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 17H7l-4-4 4-4h2V7l8 5-8 5v-2z"></path>
                <circle cx="16" cy="12" r="3"></circle>
              </svg>
            </div>
            <h4>Soluzioni Biocide</h4>
            <p>Catalogo completo delle soluzioni sanificanti certificate</p>
          </Link>
          <Link to="/docs/guide/manutenzione" className={styles.quickLinkCard}>
            <div className={styles.quickLinkIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
            </div>
            <h4>Manutenzione</h4>
            <p>Programmi di manutenzione e risoluzione problemi</p>
          </Link>
          <Link to="/docs/supporto/contatti" className={styles.quickLinkCard}>
            <div className={styles.quickLinkIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h4>Supporto Tecnico</h4>
            <p>Contatti diretti per assistenza specializzata</p>
          </Link>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <div className={styles.ctaContent}>
          <Heading as="h2">Inizia con AeroSafe</Heading>
          <p>
            Scopri come i sistemi DryFogS® possono migliorare la sanificazione
            nel tuo settore professionale
          </p>
          <div className={styles.ctaButtons}>
            <Link
              className="button button--primary button--lg"
              to="/docs">
              Esplora la Documentazione
            </Link>
            <Link
              className="button button--outline button--lg"
              to="/docs/settori/sanita">
              Soluzioni per Settore
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Homepage`}
      description="Documentazione tecnica completa per i sistemi di nebulizzazione DryFogS® e le soluzioni sanificanti AeroSafe">
      <HomepageHeader />
      <main>
        <TechnologySection />
        <HomepageFeatures />
        <ProductsSection />
        <QuickLinksSection />
        <CTASection />
      </main>
    </Layout>
  );
}