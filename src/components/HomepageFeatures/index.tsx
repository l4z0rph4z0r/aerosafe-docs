import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  icon: string;
  description: ReactNode;
  link: string;
  color: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Dispositivi DryFogS',
    icon: '🌫️',
    description: (
      <>
        Nebulizzatori professionali per la sanificazione di ambienti.
        Tecnologia avanzata per la diffusione di biocidi in forma di nebbia secca.
      </>
    ),
    link: '/docs/dispositivi/introduzione',
    color: 'blue'
  },
  {
    title: 'Soluzioni Chimiche',
    icon: '🧪',
    description: (
      <>
        Prodotti biocidi certificati per ogni esigenza di sanificazione.
        Formulazioni specifiche per sanità, alimentare e settore funerario.
      </>
    ),
    link: '/docs/prodotti/soluzioni-biocide',
    color: 'green'
  },
  {
    title: 'Guide Tecniche',
    icon: '📋',
    description: (
      <>
        Manuali di installazione, configurazione e manutenzione.
        Procedure operative e best practice per l'utilizzo ottimale.
      </>
    ),
    link: '/docs/guide/installazione',
    color: 'orange'
  },
  {
    title: 'Settori di Applicazione',
    icon: '🏥',
    description: (
      <>
        Soluzioni specifiche per sanità, industria alimentare e settore funerario.
        Protocolli personalizzati per ogni ambiente professionale.
      </>
    ),
    link: '/docs/settori/sanita',
    color: 'purple'
  },
];

function Feature({title, icon, description, link, color}: FeatureItem) {
  return (
    <div className={clsx('col col--6 margin-bottom--lg')}>
      <Link to={link} className={clsx(styles.featureCard, styles[`featureCard--${color}`])}>
        <div className={styles.featureIcon}>{icon}</div>
        <div className={styles.featureContent}>
          <Heading as="h3" className={styles.featureTitle}>{title}</Heading>
          <p className={styles.featureDescription}>{description}</p>
          <span className={styles.featureLink}>Esplora →</span>
        </div>
      </Link>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="text--center margin-bottom--xl">
          <Heading as="h2">Documentazione AeroSafe</Heading>
          <p className={styles.featuresSubtitle}>
            Accedi alla documentazione completa organizzata per categorie tematiche
          </p>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
