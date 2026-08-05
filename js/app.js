// HK STUDIO — CORE APPLICATION SCRIPT (V2.0 MULTI-PAGE)

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. ACTIVE NAVIGATION TAB HIGHLIGHT ---
  const path = window.location.pathname;
  const page = path.split('/').pop() || 'index.html';
  
  document.querySelectorAll('.nav-links a, .drawer-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === page) {
      link.classList.add('active-nav');
    } else if ((page === 'index.html' || page === '') && href === 'index.html') {
      link.classList.add('active-nav');
    }
  });


  // --- 2. BILINGUAL SYSTEM and THEME MANAGEMENT ---
  let currentLang = localStorage.getItem('hk_lang') || 'fr';
  const langButtons = document.querySelectorAll('.lang button, .lang-drawer button');

  // A. Theme Switcher Logic
  let currentTheme = localStorage.getItem('hk_theme') || 'dark';

  function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hk_theme', theme);

    // Update labels and text of all theme buttons on the page
    document.querySelectorAll('.theme-btn').forEach(btn => {
      if (theme === 'dark') {
        btn.setAttribute('data-fr', 'Clair');
        btn.setAttribute('data-en', 'Light');
        btn.textContent = currentLang === 'fr' ? 'Clair' : 'Light';
      } else {
        btn.setAttribute('data-fr', 'Sombre');
        btn.setAttribute('data-en', 'Dark');
        btn.textContent = currentLang === 'fr' ? 'Sombre' : 'Dark';
      }
    });
  }

  // Initialize theme early
  setTheme(currentTheme);

  // Bind click listener for all theme buttons
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
      setTheme(nextTheme);
    });
  });

  // B. Bilingual Logic
  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('hk_lang', lang);
    document.documentElement.lang = lang;

    // Toggle translations for data attributes
    document.querySelectorAll('[data-fr]').forEach(el => {
      const translation = el.getAttribute(`data-${lang}`);
      if (translation !== null) {
        if (el.tagName === 'TITLE') {
          document.title = translation;
        } else if (el.tagName === 'META') {
          el.setAttribute('content', translation);
        } else {
          el.innerHTML = translation;
        }
      }
    });

    // Update form placeholders
    document.querySelectorAll('[data-fr-placeholder]').forEach(el => {
      const placeholderVal = el.getAttribute(`data-${lang}-placeholder`);
      if (placeholderVal) {
        el.placeholder = placeholderVal;
      }
    });

    // Update active class on language buttons
    langButtons.forEach(btn => {
      btn.classList.toggle('on', btn.dataset.lang === lang);
    });

    // Refresh dynamic parts if they exist on this page
    if (typeof updateROICalculations === 'function') {
      updateROICalculations();
    }
    if (typeof updateBriefPreview === 'function') {
      updateBriefPreview();
    }

    // Refresh theme labels language
    setTheme(currentTheme);
  }

  // Bind language click events
  langButtons.forEach(b => {
    b.addEventListener('click', () => {
      setLang(b.dataset.lang);
    });
  });

  // NOTE: Language is initialized at the very END of this handler (see section 10),
  // once every page-specific element the translator/refreshers touch has been
  // declared. Calling setLang() here would invoke updateROICalculations()/
  // updateBriefPreview() before their `const` elements exist -> ReferenceError
  // (temporal dead zone), which previously aborted ALL script below this point.


  // --- 3. MOBILE NAVIGATION DRAWER ---
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const closeDrawer = document.getElementById('closeDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');

  function openMobileMenu() {
    if (mobileDrawer && drawerOverlay) {
      mobileDrawer.classList.add('open');
      drawerOverlay.classList.add('show');
    }
  }

  function closeMobileMenu() {
    if (mobileDrawer && drawerOverlay) {
      mobileDrawer.classList.remove('open');
      drawerOverlay.classList.remove('show');
    }
  }

  if (burgerBtn) burgerBtn.addEventListener('click', openMobileMenu);
  if (closeDrawer) closeDrawer.addEventListener('click', closeMobileMenu);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeMobileMenu);

  // Close mobile drawer when link clicked
  document.querySelectorAll('.drawer-links a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });


  // --- 4. SERVICES ACCORDION (SERVICES PAGE ONLY) ---
  const svcItems = document.querySelectorAll('.svc-item');
  if (svcItems.length > 0) {
    svcItems.forEach(item => {
      const headerRow = item.querySelector('.header-row');
      if (headerRow) {
        headerRow.addEventListener('click', () => {
          const isOpen = item.classList.contains('active');
          
          // Close all accordions
          svcItems.forEach(i => i.classList.remove('active'));
          
          // Toggle current one
          if (!isOpen) {
            item.classList.add('active');
          }
        });
      }
    });

    // Open accordion based on URL hash, or fallback to first one
    const hash = window.location.hash;
    let openedFromHash = false;
    if (hash) {
      const targetSvc = document.querySelector(hash);
      if (targetSvc && targetSvc.classList.contains('svc-item')) {
        svcItems.forEach(i => i.classList.remove('active'));
        targetSvc.classList.add('active');
        openedFromHash = true;
        // Smooth scroll to it after a short delay
        setTimeout(() => {
          targetSvc.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      }
    }
    
    if (!openedFromHash) {
      svcItems[0].classList.add('active');
    }
  }


  // --- 5. ROI CALCULATOR (ROI PAGE ONLY) ---
  const inputEmployees = document.getElementById('inputEmployees');
  const inputHours = document.getElementById('inputHours');
  const inputRate = document.getElementById('inputRate');
  const valEmployees = document.getElementById('valEmployees');
  const valHours = document.getElementById('valHours');
  const valRate = document.getElementById('valRate');
  const resHours = document.getElementById('resHours');
  const resMonthly = document.getElementById('resMonthly');
  const resYearly = document.getElementById('resYearly');
  const resPercentage = document.getElementById('resPercentage');
  const progressFill = document.getElementById('progressFill');
  const btnXOF = document.getElementById('btnXOF');
  const btnEUR = document.getElementById('btnEUR');

  let currentCurrency = 'XOF'; // XOF or EUR
  const EUR_RATE = 655.957; // 1 EUR = 655.957 XOF

  function formatNumber(number, isCurrency = false) {
    if (isCurrency) {
      if (currentCurrency === 'XOF') {
        return number.toLocaleString('fr-FR') + ' FCFA';
      } else {
        return number.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + ' €';
      }
    }
    return number.toLocaleString('fr-FR');
  }

  function updateROICalculations() {
    if (!inputEmployees) return; // Exit if not on the ROI page

    const employees = parseInt(inputEmployees.value);
    const wastedHours = parseInt(inputHours.value);
    const rateRaw = parseInt(inputRate.value);

    // Update labels
    valEmployees.textContent = employees;
    valHours.textContent = `${wastedHours} h`;

    if (currentCurrency === 'XOF') {
      valRate.textContent = `${formatNumber(rateRaw)} FCFA`;
    } else {
      const rateEUR = Math.round((rateRaw / EUR_RATE) * 10) / 10;
      valRate.textContent = `${rateEUR} €`;
    }

    // MATH
    const monthlyHoursSaved = employees * wastedHours * 4;
    resHours.innerHTML = `${formatNumber(monthlyHoursSaved)} <span class="unit">${currentLang === 'fr' ? 'Heures' : 'Hours'}</span>`;

    const monthlySavingsRaw = monthlyHoursSaved * rateRaw; // in XOF
    const yearlySavingsRaw = monthlySavingsRaw * 12; // in XOF

    if (currentCurrency === 'XOF') {
      resMonthly.innerHTML = `${formatNumber(monthlySavingsRaw)} <span class="unit">FCFA</span>`;
      resYearly.innerHTML = `${formatNumber(yearlySavingsRaw)} <span class="unit">FCFA</span>`;
    } else {
      const monthlySavingsEUR = Math.round(monthlySavingsRaw / EUR_RATE);
      const yearlySavingsEUR = Math.round(yearlySavingsRaw / EUR_RATE);
      resMonthly.innerHTML = `${formatNumber(monthlySavingsEUR)} <span class="unit">€</span>`;
      resYearly.innerHTML = `${formatNumber(yearlySavingsEUR)} <span class="unit">€</span>`;
    }

    const productivityGain = Math.round((wastedHours / 40) * 100);
    resPercentage.textContent = currentLang === 'fr' 
      ? `Gain de productivité : +${productivityGain}%` 
      : `Productivity gain: +${productivityGain}%`;

    const fillPercent = Math.min(100, Math.max(0, productivityGain * 2));
    progressFill.style.width = `${fillPercent}%`;
  }

  // Bind ROI listeners
  if (inputEmployees) {
    inputEmployees.addEventListener('input', updateROICalculations);
    inputHours.addEventListener('input', updateROICalculations);
    inputRate.addEventListener('input', updateROICalculations);
    
    if (btnXOF) {
      btnXOF.addEventListener('click', () => {
        currentCurrency = 'XOF';
        btnXOF.classList.add('on');
        btnEUR.classList.remove('on');
        updateROICalculations();
      });
    }

    if (btnEUR) {
      btnEUR.addEventListener('click', () => {
        currentCurrency = 'EUR';
        btnEUR.classList.add('on');
        btnXOF.classList.remove('on');
        updateROICalculations();
      });
    }
    
    // Initial call
    updateROICalculations();
  }


  // --- 6. PORTFOLIO DRAWER (WORK PAGE ONLY) ---
  const workCards = document.querySelectorAll('.w-card[data-project]');
  const portfolioSheet = document.getElementById('portfolioSheet');
  const sheetOverlay = document.getElementById('sheetOverlay');
  const closeSheet = document.getElementById('closeSheet');
  const sheetContent = document.getElementById('sheetContent');

  const portfolioData = {
    p1: {
      tags: { fr: 'FinTech et Crédit', en: 'FinTech and Credit' },
      title: { fr: 'IA pour la Microfinance', en: 'AI for Microfinance' },
      client: 'Confidentiel (Abidjan, CI)',
      date: '2025',
      challenge: {
        fr: 'Le client faisait face à des retards de 3 à 5 jours dans la validation des demandes de micro-crédits à cause d\'analyses manuelles fastidieuses et un taux élevé de dossiers frauduleux.',
        en: 'The client faced 3 to 5-day delays in validating micro-credit requests due to tedious manual analysis and a high rate of fraudulent files.'
      },
      solution: {
        fr: 'Intégration d\'un pipeline de données automatisé (n8n) connecté à un modèle prédictif d\'évaluation de risques (scoring) basé sur GPT-4o. Analyse instantanée des relevés bancaires mobiles (Wave/Orange Money) et détection automatique des anomalies.',
        en: 'Integration of an automated data pipeline (n8n) connected to a predictive risk assessment (scoring) model based on GPT-4o. Instant analysis of mobile bank statements (Wave/Orange Money) and automated anomaly detection.'
      },
      impact: {
        fr: 'Temps de traitement réduit de 4 jours à 4 minutes. Taux d\'erreur de classification inférieur à 1.5%. Plus de 12 millions FCFA économisés sur les fraudes dès les 3 premiers mois.',
        en: 'Processing time reduced from 4 days to 4 minutes. Classification error rate below 1.5%. Over 12 million FCFA saved in fraud within the first 3 months.'
      },
      stack: ['n8n', 'OpenAI API', 'Python', 'Supabase', 'Wave API']
    },
    p2: {
      tags: { fr: 'Opérations et CRM', en: 'Operations and CRM' },
      title: { fr: 'Automatisation de Facturation', en: 'Billing Automation' },
      client: 'Distributeur FMCG (Zone Industrielle Yopougon)',
      date: '2026',
      challenge: {
        fr: 'Saisie manuelle quotidienne de plus de 150 factures et bons de commande dans le logiciel comptable Sage, provoquant des erreurs régulières de stocks et des retards de livraison.',
        en: 'Daily manual entry of over 150 invoices and purchase orders into Sage accounting software, causing regular stock errors and delivery delays.'
      },
      solution: {
        fr: 'Création de scénarios automatisés sur Make.com reliant les formulaires de commande terrain (formulaires WhatsApp) à l\'API Sage. Mise en place d\'un extracteur OCR intelligent (AI Vision) pour parser les PDFs reçus.',
        en: 'Creation of automated scenarios on Make.com linking field order forms (WhatsApp forms) to the Sage API. Implementation of an intelligent OCR extractor (AI Vision) to parse received PDFs.'
      },
      impact: {
        fr: 'Élimination totale des doubles saisies. Livraison accélérée de 24h. 90 heures de travail administratif récupérées chaque mois pour l\'équipe comptable.',
        en: 'Total elimination of double entries. Delivery accelerated by 24h. 90 hours of administrative work recovered every month for the accounting team.'
      },
      stack: ['Make.com', 'Sage API', 'OpenAI Vision', 'Airtable', 'WhatsApp API']
    },
    p3: {
      tags: { fr: 'GenAI et Support', en: 'GenAI and Support' },
      title: { fr: 'Assistant Client WhatsApp', en: 'WhatsApp Client Assistant' },
      client: 'Agence Immobilière Leader (Cocody, CI)',
      date: '2025',
      challenge: {
        fr: 'Plus de 300 demandes WhatsApp reçues par jour. Les agents commerciaux passaient 80% de leur temps à répondre aux mêmes questions d\'inventaire plutôt que de faire des visites.',
        en: 'Over 300 WhatsApp inquiries received daily. Sales agents spent 80% of their time answering repetitive inventory questions instead of conducting property visits.'
      },
      solution: {
        fr: 'Déploiement d\'un agent conversationnel IA avancé branché sur le catalogue immobilier de l\'agence. Utilisation du RAG (Retrieval-Augmented Generation) pour répondre précisément sur les disponibilités, prix et localisations.',
        en: 'Deployment of an advanced AI conversational agent plugged into the agency\'s property catalog. Utilization of RAG (Retrieval-Augmented Generation) to answer precisely about availability, prices, and locations.'
      },
      impact: {
        fr: '85% des demandes résolues de manière autonome sans intervention humaine. Qualification automatique des prospects avec relance planifiée dans le CRM.',
        en: '85% of queries resolved autonomously without human intervention. Automated lead qualification with scheduled follow-ups in the CRM.'
      },
      stack: ['n8n', 'Flowise', 'Claude 3.5 Sonnet', 'Supabase Vector', 'ManyChat']
    }
  };

  function openPortfolioSheet(projectId) {
    const data = portfolioData[projectId];
    if (!data || !sheetContent || !portfolioSheet || !sheetOverlay) return;

    const stackTagsHTML = data.stack.map(s => `<span class="tag">${s}</span>`).join('');

    sheetContent.innerHTML = `
      <div class="sheet-header-graphic" style="height: 10px; background: repeating-linear-gradient(45deg, var(--line), var(--line) 4px, transparent 4px, transparent 8px);"></div>
      <div class="sheet-meta">
        <span class="tag">${data.tags[currentLang]}</span>
        <h2>${data.title[currentLang]}</h2>
        <div class="sheet-meta-grid">
          <div class="sheet-meta-item">
            <span class="mono label">${currentLang === 'fr' ? 'Client' : 'Client'}</span>
            <span class="val">${data.client}</span>
          </div>
          <div class="sheet-meta-item">
            <span class="mono label">${currentLang === 'fr' ? 'Année' : 'Year'}</span>
            <span class="val">${data.date}</span>
          </div>
        </div>
      </div>
      <div class="sheet-body">
        <div class="sheet-section">
          <h3 class="mono">${currentLang === 'fr' ? 'Défi initial' : 'The Challenge'}</h3>
          <p>${data.challenge[currentLang]}</p>
        </div>
        <div class="sheet-section">
          <h3 class="mono">${currentLang === 'fr' ? 'Solution déployée' : 'Solution Deployed'}</h3>
          <p>${data.solution[currentLang]}</p>
        </div>
        <div class="sheet-section">
          <h3 class="mono">${currentLang === 'fr' ? 'Impact commercial' : 'Business Impact'}</h3>
          <div class="sheet-impact-card">
            <h4>${currentLang === 'fr' ? 'Résultats :' : 'Results:'}</h4>
            <p>${data.impact[currentLang]}</p>
          </div>
        </div>
        <div class="sheet-section">
          <h3 class="mono">${currentLang === 'fr' ? 'Stack Technologique' : 'Tech Stack'}</h3>
          <div class="sheet-tech-list">
            ${stackTagsHTML}
          </div>
        </div>
      </div>
      <div style="margin-top: 30px;">
        <a href="contact.html" class="btn" id="sheetCTABtn" style="width: 100%; justify-content: center;">${currentLang === 'fr' ? 'Automatiser mon projet similaire' : 'Automate a similar project'}</a>
      </div>
    `;

    document.getElementById('sheetCTABtn').addEventListener('click', () => {
      closePortfolioSheet();
    });

    portfolioSheet.classList.add('open');
    sheetOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closePortfolioSheet() {
    if (portfolioSheet && sheetOverlay) {
      portfolioSheet.classList.remove('open');
      sheetOverlay.classList.remove('show');
      document.body.style.overflow = '';
    }
  }

  if (workCards.length > 0) {
    workCards.forEach(card => {
      card.addEventListener('click', () => {
        const projectId = card.getAttribute('data-project');
        openPortfolioSheet(projectId);
      });
    });
    
    if (closeSheet) closeSheet.addEventListener('click', closePortfolioSheet);
    if (sheetOverlay) sheetOverlay.addEventListener('click', closePortfolioSheet);

    // Open project from URL hash if exists
    const hash = window.location.hash;
    if (hash) {
      const projectId = hash.substring(1); // e.g. p1, p2, p3
      if (portfolioData[projectId]) {
        setTimeout(() => {
          openPortfolioSheet(projectId);
        }, 150);
      }
    }
  }


  // --- 7. BRIEF CONFIGURATOR (CONTACT PAGE ONLY) ---
  const projectBriefForm = document.getElementById('projectBriefForm');
  const needButtons = document.querySelectorAll('#selectNeed .select-btn');
  const budgetButtons = document.querySelectorAll('#selectBudget .select-btn');
  const briefPreview = document.getElementById('briefPreview');
  const contactName = document.getElementById('contactName');
  const contactEmail = document.getElementById('contactEmail');
  const contactCompany = document.getElementById('contactCompany');
  const contactPhone = document.getElementById('contactPhone');
  const contactMessage = document.getElementById('contactMessage');

  let selectedNeed = 'automation';
  let selectedBudget = 'small';

  function updateBriefPreview() {
    if (!briefPreview) return;

    const name = contactName.value.trim() || 'ANONYMOUS';
    const email = contactEmail.value.trim() || 'pending@email.com';
    const company = contactCompany.value.trim() || 'NO_COMPANY';
    const phone = contactPhone.value.trim() || 'NO_PHONE';
    
    let rawMessage = contactMessage.value.trim();
    let message = rawMessage ? `"${rawMessage.substring(0, 70)}${rawMessage.length > 70 ? '...' : ''}"` : 'NONE';

    let recommendedStack = '';
    switch(selectedNeed) {
      case 'automation':
        recommendedStack = 'Make.com, n8n.io, REST APIs';
        break;
      case 'ai-agents':
        recommendedStack = 'OpenAI API, Claude, Flowise RAG';
        break;
      case 'crm':
        recommendedStack = 'All-in-one CRM, Twilio, SMS workflows';
        break;
      case 'data-web':
        recommendedStack = 'Supabase, PostgreSQL, Next.js, Looker Studio';
        break;
    }

    let budgetText = '';
    switch(selectedBudget) {
      case 'small':
        budgetText = currentLang === 'fr' ? 'Moins de 1M FCFA (<1500€)' : 'Under 1M FCFA (<1500€)';
        break;
      case 'medium':
        budgetText = currentLang === 'fr' ? '1M - 3M FCFA (1500€ - 4500€)' : '1M - 3M FCFA (1500€ - 4500€)';
        break;
      case 'large':
        budgetText = currentLang === 'fr' ? 'Plus de 3M FCFA (>4500€)' : 'Over 3M FCFA (>4500€)';
        break;
    }

    briefPreview.innerHTML = `
<span class="comment"># Generated dynamically via HK Studio brief compiler</span>
<span class="keyword">export</span> <span class="variable">HK_CLIENT_NAME</span>=<span class="string">"${name}"</span>
<span class="keyword">export</span> <span class="variable">HK_CLIENT_ORG</span>=<span class="string">"${company}"</span>
<span class="keyword">export</span> <span class="variable">HK_CONTACT_EMAIL</span>=<span class="string">"${email}"</span>
<span class="keyword">export</span> <span class="variable">HK_CONTACT_PHONE</span>=<span class="string">"${phone}"</span>

<span class="comment"># Project Requirements</span>
<span class="keyword">export</span> <span class="variable">HK_REQUIRED_STACK</span>=<span class="string">"${recommendedStack}"</span>
<span class="keyword">export</span> <span class="variable">HK_ESTIMATED_BUDGET</span>=<span class="string">"${budgetText}"</span>
<span class="keyword">export</span> <span class="variable">HK_BOTTLENECK</span>=<span class="string">${message}</span>

<span class="comment"># Studio Diagnosis status</span>
<span class="keyword">echo</span> <span class="string">"Compiling analysis brief..."</span>
<span class="keyword">echo</span> <span class="string">"Recommended approach: Integrations via ${selectedNeed.toUpperCase()} channel."</span>
<span class="variable">STATUS</span>=<span class="string">"READY_TO_DIAGNOSE"</span>
<span class="keyword">echo</span> <span class="string">"Status: $STATUS"</span>
`;
  }

  if (projectBriefForm) {
    // Bind Selector Grid buttons for Need
    needButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        needButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedNeed = btn.getAttribute('data-value');
        updateBriefPreview();
      });
    });

    // Bind Selector Grid buttons for Budget
    budgetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        budgetButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedBudget = btn.getAttribute('data-value');
        updateBriefPreview();
      });
    });

    // Bind inputs to compile brief on keystroke
    const formInputs = [contactName, contactEmail, contactCompany, contactPhone, contactMessage];
    formInputs.forEach(input => {
      if (input) {
        input.addEventListener('input', updateBriefPreview);
      }
    });

    // Submit Brief
    projectBriefForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = contactName.value.trim();
      const email = contactEmail.value.trim();

      const confirmMsg = currentLang === 'fr'
        ? `Merci ${name} ! Votre brief a bien été compilé. Notre équipe vous recontactera à l'adresse ${email} sous 24h avec un plan de route.`
        : `Thank you ${name}! Your project brief has been compiled. Our team will get back to you at ${email} within 24h with a custom roadmap.`;

      alert(confirmMsg);
      projectBriefForm.reset();
      selectedNeed = 'automation';
      selectedBudget = 'small';
      
      needButtons.forEach((b, idx) => b.classList.toggle('active', idx === 0));
      budgetButtons.forEach((b, idx) => b.classList.toggle('active', idx === 0));
      
      updateBriefPreview();
    });

    // Initial preview setup
    updateBriefPreview();
  }


  // --- 8. HEADER & SCROLL BEHAVIOR ---
  const hdr = document.getElementById('hdr');
  window.addEventListener('scroll', () => {
    if (hdr) {
      hdr.classList.toggle('scrolled', window.scrollY > 20);
    }
  });


  // --- 9. INTERSECTION OBSERVER FOR SCROLL REVEALS ---
  const revealElements = document.querySelectorAll('.reveal');
  
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          scrollObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -20px 0px'
    });

    revealElements.forEach(el => {
      scrollObserver.observe(el);
    });
  } else {
    revealElements.forEach(el => el.classList.add('in'));
  }


  // --- 10. INITIAL LANGUAGE RENDER ---
  // Runs last: every element referenced by setLang()'s refreshers now exists,
  // so translating the page and syncing the language buttons is safe.
  setLang(currentLang);

});
