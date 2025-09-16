import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function NotFound() {
  return (
    <Layout title="Pagina Non Trovata">
      <main className="container margin-vert--xl">
        <div className="row">
          <div className="col col--6 col--offset-3">
            <div className="text--center">
              <h1 className="hero__title" style={{fontSize: '5rem', color: '#2563eb'}}>404</h1>
              <p className="hero__subtitle" style={{fontSize: '1.5rem'}}>
                Pagina Non Trovata
              </p>
              <p style={{marginBottom: '2rem'}}>
                La pagina che stai cercando non esiste o è stata spostata.
              </p>
              <div>
                <Link
                  className="button button--primary button--lg margin-right--md"
                  to="/">
                  Torna alla Home
                </Link>
                <Link
                  className="button button--outline button--lg"
                  to="/docs/dispositivi/introduzione">
                  Vai alla Documentazione
                </Link>
              </div>
              <div style={{marginTop: '3rem', padding: '2rem', backgroundColor: '#f3f4f6', borderRadius: '8px'}}>
                <h3>Link Utili</h3>
                <ul style={{listStyle: 'none', padding: 0}}>
                  <li><Link to="/docs/dispositivi/dryfogs-pro">→ Dispositivi DryFogS</Link></li>
                  <li><Link to="/docs/prodotti/soluzioni-biocide">→ Prodotti Chimici</Link></li>
                  <li><Link to="/docs/guide/installazione">→ Guide Tecniche</Link></li>
                  <li><Link to="/docs/supporto/contatti">→ Supporto</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}