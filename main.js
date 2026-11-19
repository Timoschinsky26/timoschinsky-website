(function () {
  var top = document.getElementById('top');
  function onScroll() { top.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.getElementById('yr').textContent = new Date().getFullYear();

  // Termine
  var out = document.getElementById('gig-out');
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var gigs = (window.GIGS || [])
    .map(function (g) { return Object.assign({}, g, { d: new Date(g.date + 'T00:00:00') }); })
    .filter(function (g) { return g.d >= today; })
    .sort(function (a, b) { return a.d - b.d; });

  function esc(s) { return String(s || '').replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  var wd = new Intl.DateTimeFormat('de-DE', { weekday: 'short' });
  var dm = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });

  if (!gigs.length) {
    out.innerHTML = '<div class="empty"><strong>Neue Termine folgen bald.</strong><p>Aktuelle Gigs und Sets gibt es zuerst auf Instagram.</p><a class="btn btn-ghost" href="https://www.instagram.com/timoschinsky" target="_blank" rel="noopener">@timoschinsky folgen</a></div>';
  } else {
    out.innerHTML = '<ul class="gig-list">' + gigs.map(function (g) {
      var link = g.url ? '<a href="' + esc(g.url) + '" target="_blank" rel="noopener">Details →</a>' : '<span></span>';
      return '<li class="gig"><time datetime="' + esc(g.date) + '">' + dm.format(g.d) + '<span>' + wd.format(g.d) + '</span></time>' +
        '<div class="where"><b>' + esc(g.venue) + '</b><span>' + esc(g.city) + (g.event ? ' · ' + esc(g.event) : '') + '</span></div>' + link + '</li>';
    }).join('') + '</ul>';
    var n = gigs[0];
    document.getElementById('next-gig').innerHTML = 'Nächster Gig: <b>' + wd.format(n.d) + ' ' + dm.format(n.d) + ', ' + esc(n.venue) + ', ' + esc(n.city) + '</b>';
  }

  // SoundCloud erst nach Klick laden (Datenschutz)
  document.querySelectorAll('.embed').forEach(function (el) {
    el.innerHTML = '<div><button class="btn btn-ghost" type="button">▶ Set laden</button><small>Beim Laden werden Daten an SoundCloud übertragen. Mehr dazu in der <a href="datenschutz.html">Datenschutzerklärung</a>.</small></div>';
    el.querySelector('button').addEventListener('click', function () {
      var src = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(el.dataset.src) + '&color=%23154da0&auto_play=true&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false';
      el.innerHTML = '<iframe title="SoundCloud-Player" allow="autoplay" src="' + src + '"></iframe>';
      el.classList.add('loaded');
    });
  });

  // Booking-Formular -> Forminit
  var FORM_ID = '84cjmk6urtd';
  var form = document.getElementById('booking-form');
  var err = document.getElementById('f-error');
  var ok = document.getElementById('f-ok');
  var btn = document.getElementById('f-submit');
  var sending = false;
  form.addEventListener('input', function () { err.textContent = ''; });
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (sending) return;
    var f = form.elements;
    var name = f['fi-sender-fullName'], mail = f['fi-sender-email'];
    name.value = name.value.replace(/[\u2018\u2019]/g, "'").replace(/[^\p{L}\p{N} .'_-]/gu, ' ').replace(/\s+/g, ' ').trim();
    if (!name.value || !mail.value.trim() || !f['fi-text-organization'].value.trim() || !f['fi-text-message'].value.trim()) {
      err.textContent = 'Bitte Name, E-Mail, Club und Nachricht ausfüllen.';
      return;
    }
    if (!mail.checkValidity()) { err.textContent = 'Bitte eine gültige E-Mail-Adresse eingeben.'; return; }
    sending = true; btn.disabled = true; btn.textContent = 'Wird gesendet …'; ok.textContent = ''; err.textContent = '';
    try {
      var forminit = new Forminit();
      var res = await forminit.submit(FORM_ID, new FormData(form));
      if (res && !res.error && res.data && typeof res.data.hashId === 'string') {
        form.reset();
        ok.textContent = 'Danke! Deine Anfrage ist angekommen. Ich melde mich so schnell wie möglich.';
      } else {
        err.textContent = 'Das hat leider nicht geklappt. Versuch es nochmal oder schreib direkt an booking@timoschinsky.de.';
      }
    } catch (x) {
      err.textContent = 'Das hat leider nicht geklappt. Versuch es nochmal oder schreib direkt an booking@timoschinsky.de.';
    }
    sending = false; btn.disabled = false; btn.textContent = 'Anfrage senden';
  });

  // Einblenden beim Scrollen
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal').forEach(function (s) { io.observe(s); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (s) { s.classList.add('in'); });
  }
})();
