/* ============================================================
   HK Studio — script partagé (multi-pages, défensif)
   Gère : i18n FR/EN, menu mobile, FAQ, formulaire diagnostic,
   liens WhatsApp, apparition au défilement.
   ============================================================ */
(function () {
  // ---- CONFIG ----
  var WA_NUMBER = '2250747558219'; // Numéro WhatsApp HK Studio (format international, sans +)
  var WA_MSG = {
    fr: "Bonjour HK Studio, je souhaite un diagnostic gratuit pour mon entreprise.",
    en: "Hello HK Studio, I would like a free diagnostic for my business."
  };

  var docEl = document.documentElement;
  var lang = localStorage.getItem('hk_lang') || 'fr';

  function waLink() {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(WA_MSG[lang] || WA_MSG.fr);
  }

  function refreshWa() {
    var l = waLink();
    // anciens id (page d'accueil) + attribut générique data-wa
    ['waFloat', 'heroWa', 'footWa', 'socialWa', 'successWa', 'formWa'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.setAttribute('href', l);
    });
    document.querySelectorAll('[data-wa]').forEach(function (el) { el.setAttribute('href', l); });
  }

  function applyLang(l) {
    lang = l;
    localStorage.setItem('hk_lang', l);
    docEl.setAttribute('lang', l);
    document.querySelectorAll('[data-fr]').forEach(function (el) {
      var v = el.getAttribute('data-' + l);
      if (v !== null) el.innerHTML = v;
    });
    document.querySelectorAll('[data-fr-placeholder]').forEach(function (el) {
      var v = el.getAttribute('data-' + l + '-placeholder');
      if (v !== null) el.setAttribute('placeholder', v);
    });
    document.querySelectorAll('#lang button, .js-lang').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-lang') === l);
    });
    refreshWa();
  }

  // Sélecteur de langue (en-tête + tiroir)
  document.querySelectorAll('#lang button, .js-lang').forEach(function (b) {
    b.addEventListener('click', function () { applyLang(b.getAttribute('data-lang')); });
  });

  // Menu mobile (tiroir)
  var drawer = document.getElementById('drawer'),
      overlay = document.getElementById('overlay'),
      burger = document.getElementById('burger'),
      dclose = document.getElementById('drawerClose');
  function openD() { if (drawer) drawer.classList.add('open'); if (overlay) overlay.classList.add('show'); }
  function closeD() { if (drawer) drawer.classList.remove('open'); if (overlay) overlay.classList.remove('show'); }
  if (burger) burger.addEventListener('click', openD);
  if (dclose) dclose.addEventListener('click', closeD);
  if (overlay) overlay.addEventListener('click', closeD);
  document.querySelectorAll('.drawer a').forEach(function (a) { a.addEventListener('click', closeD); });

  // FAQ (accordéon)
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q'), a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function (o) {
        o.classList.remove('open');
        var oa = o.querySelector('.faq-a');
        if (oa) oa.style.maxHeight = null;
      });
      if (!isOpen) { item.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
    });
  });

  // Formulaire diagnostic : #diagForm (accueil) ou tout form[data-diag]
  document.querySelectorAll('#diagForm, form[data-diag]').forEach(function (form) {
    var success = document.querySelector(form.getAttribute('data-success') || '#diagSuccess');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var req = form.querySelectorAll('[required]'), ok = true;
      req.forEach(function (f) {
        if (!f.value.trim()) { f.style.borderColor = '#e05252'; ok = false; }
        else { f.style.borderColor = ''; }
      });
      if (!ok) return;
      // NOTE : brancher ici l'envoi réel (email / CRM / webhook). Confirmation visuelle pour l'instant.
      form.style.display = 'none';
      if (success) success.classList.add('show');
      refreshWa();
    });
  });

  // Apparition au défilement
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  // Année
  document.querySelectorAll('#year, [data-year]').forEach(function (y) { y.textContent = '2026'; });

  applyLang(lang);
})();
