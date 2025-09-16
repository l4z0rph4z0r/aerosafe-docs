import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'AeroSafe Documentation',
  tagline: 'Complete documentation for DryFogS nebulizers and sanitizing solutions',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://docs.aerosafe.it',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/',

  // AeroSafe specific deployment config
  organizationName: 'l4z0rph4z0r',
  projectName: 'aerosafe-docs',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Multi-language support: Italian (default) and English
  i18n: {
    defaultLocale: 'it',
    locales: ['it', 'en'],
    localeConfigs: {
      it: {
        label: 'Italiano',
        direction: 'ltr',
        htmlLang: 'it-IT',
        calendar: 'gregory',
        path: 'it',
      },
      en: {
        label: 'English',
        direction: 'ltr',
        htmlLang: 'en-US',
        calendar: 'gregory',
        path: 'en',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          editUrl: 'https://github.com/l4z0rph4z0r/aerosafe-docs/edit/main/',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        blog: {
          showReadingTime: true,
          readingTime: ({content, frontMatter, defaultReadingTime, locale}) =>
            defaultReadingTime({content, locale, options: {wordsPerMinute: 300}}),
          feedOptions: {
            type: ['rss', 'atom'],
            title: 'AeroSafe News & Updates',
            description: 'Novità su sanificazione professionale, tecnologia DryFogS e normative del settore',
            xslt: true,
          },
          blogTitle: 'AeroSafe News',
          blogDescription: 'Aggiornamenti su tecnologie di sanificazione, normative e best practices',
          postsPerPage: 10,
          blogSidebarTitle: 'Post recenti',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [],

  themes: [],

  themeConfig: {
    // AeroSafe metadata
    metadata: [
      {name: 'keywords', content: 'aerosafe, dryfogs, nebulizzatori, sanificazione, igienizzazione, healthcare, food safety, disinfezione, sistemi di nebulizzazione, perossido di idrogeno, bio-sicurezza'},
      {name: 'description', content: 'Documentazione completa per i nebulizzatori DryFogS e le soluzioni sanificanti AeroSafe per settori sanitario, alimentare, hospitality e servizi funebri'},
      {name: 'author', content: 'AeroSafe (IST S.r.l.s.)'},
      {name: 'robots', content: 'index, follow'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1.0'},
      {property: 'og:type', content: 'website'},
      {property: 'og:site_name', content: 'AeroSafe Documentation'},
      {property: 'og:title', content: 'AeroSafe Documentation - Nebulizzatori DryFogS'},
      {property: 'og:description', content: 'Documentazione tecnica completa per sistemi di sanificazione professionale DryFogS'},
      {property: 'og:image', content: 'https://docs.aerosafe.it/img/aerosafe-social-card.jpg'},
      {property: 'og:image:width', content: '1200'},
      {property: 'og:image:height', content: '630'},
      {property: 'og:url', content: 'https://docs.aerosafe.it'},
      {property: 'og:locale', content: 'it_IT'},
      {property: 'og:locale:alternate', content: 'en_US'},
      {name: 'twitter:card', content: 'summary_large_image'},
      {name: 'twitter:title', content: 'AeroSafe Documentation'},
      {name: 'twitter:description', content: 'Documentazione tecnica per sistemi di sanificazione DryFogS'},
      {name: 'twitter:image', content: 'https://docs.aerosafe.it/img/aerosafe-social-card.jpg'},
    ],
    image: 'img/aerosafe-social-card.jpg',
    
    // Custom color mode with AeroSafe branding
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    
    navbar: {
      title: 'AeroSafe',
      logo: {
        alt: 'IST Logo',
        src: 'img/IST-srl_logo.png',
        srcDark: 'img/IST-srl_logo.png',
        href: '/',
        target: '_self',
        width: 120,
        height: 40,
      },
      hideOnScroll: false,
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Documentazione',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://www.aerosafe.it',
          label: 'Sito Web',
          position: 'right',
        },
        {
          href: 'https://github.com/l4z0rph4z0r/aerosafe-docs',
          label: 'GitHub',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      style: 'dark',
      logo: {
        alt: 'IST Logo',
        src: 'img/IST-srl_logo.png',
        href: 'https://www.istreatment.com',
        width: 160,
        height: 54,
      },
      links: [
        {
          title: 'Documentazione',
          items: [
            {
              label: 'Introduzione',
              to: '/docs/',
            },
            {
              label: 'Prodotti DFS',
              to: '/docs/prodotti/dfs-1',
            },
            {
              label: 'Tecnologia DryFogS',
              to: '/docs/tecnologia/dryfogs-tecnologia-overview',
            },
            {
              label: 'Supporto',
              to: '/docs/supporto/contatti',
            },
          ],
        },
        {
          title: 'Settori di Applicazione',
          items: [
            {
              label: 'Sanitario',
              to: '/docs/sanita/ambito-sanitario',
            },
            {
              label: 'Sicurezza Alimentare',
              to: '/docs/settori/sicurezza-alimentare',
            },
            {
              label: 'Collettività',
              to: '/docs/settori/collettivita',
            },
            {
              label: 'Servizi Funebri',
              to: '/docs/sanita/ambito-funerario',
            },
          ],
        },
        {
          title: 'AeroSafe',
          items: [
            {
              label: 'Sito Web',
              href: 'https://www.aerosafe.it',
            },
            {
              label: 'Contatti',
              href: 'https://www.aerosafe.it/contatti',
            },
            {
              label: 'Supporto',
              href: 'https://www.aerosafe.it/supporto',
            },
            {
              label: 'Blog',
              to: '/blog',
            },
          ],
        },
        {
          title: 'Risorse',
          items: [
            {
              label: 'Documentazione GitHub',
              href: 'https://github.com/l4z0rph4z0r/aerosafe-docs',
            },
            {
              label: 'Privacy Policy',
              href: 'https://www.aerosafe.it/privacy',
            },
            {
              label: 'Termini di Servizio',
              href: 'https://www.aerosafe.it/termini',
            },
          ],
        },
      ],
      copyright: `
        <div style="margin-bottom: 16px;">
          <strong>AeroSafe (IST S.r.l.s.)</strong><br/>
          Nebulizzatori DryFogS e Soluzioni Sanificanti Professionali
        </div>
        <div style="font-size: 14px; opacity: 0.8;">
          Copyright © ${new Date().getFullYear()} IST S.r.l.s. Tutti i diritti riservati.<br/>
          P.IVA: IT12345678901 | Via dell'Industria 123, 20100 Milano
        </div>
      `,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'yaml', 'docker'],
    },
    
    // Algolia Search Configuration (disabled - using local search)
    // algolia: {
    //   appId: 'YOUR_APP_ID',
    //   apiKey: 'YOUR_SEARCH_API_KEY',
    //   indexName: 'aerosafe_docs',
    //   contextualSearch: true,
    //   searchPagePath: 'search',
    // },
    
    // Announcement bar for important updates
    announcementBar: {
      id: 'aerosafe_promo', // Any value that will identify this message
      content:
        '🔬 Nuovo DryFogS Pro 2024 disponibile! <a target="_blank" rel="noopener noreferrer" href="https://www.aerosafe.it/prodotti/dryfogs-pro">Scopri le nuove funzionalità</a> per la sanificazione professionale.',
      backgroundColor: '#16a34a',
      textColor: '#ffffff',
      isCloseable: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
