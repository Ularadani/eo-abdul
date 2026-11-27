/* ===== PENGATURAN MEDIA =====
   Video profil dari Google Drive: tempel link share video di antara tanda kutip.
   Contoh: 'https://drive.google.com/file/d/1AbCdEf.../view?usp=sharing'
   Kosongkan ('') untuk memakai file lokal assets/video/profil.mp4.
   Syarat: akses file di Drive harus "Siapa saja yang memiliki link". */
var ABDUL_DRIVE_PROFIL = '';

(function () {
  var $ = function (id) { return document.getElementById(id); };
  var q = function (s) { return document.querySelectorAll(s); };

  /* Menu mobile */
  var burger = $('abdul_burger'), nav = $('abdul_nav');
  burger.addEventListener('click', function () {
    burger.setAttribute('aria-expanded', nav.classList.toggle('abdul_buka'));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { nav.classList.remove('abdul_buka'); burger.setAttribute('aria-expanded', false); }
  });

  /* Menu aktif saat scroll */
  var links = q('.abdul_link'), secs = q('main section');
  window.addEventListener('scroll', function () {
    var pos = window.scrollY + 130, cur = '';
    secs.forEach(function (s) { if (s.offsetTop <= pos) cur = s.id; });
    links.forEach(function (l) { l.classList.toggle('abdul_aktif', l.getAttribute('href') === '#' + cur); });
  });

  /* Angka naik satu kali saat terlihat */
  function hitung(el) {
    var t = +el.getAttribute('data-abdul-target'), n = 0, step = Math.max(1, Math.ceil(t / 50));
    var iv = setInterval(function () { n = Math.min(t, n + step); el.textContent = n; if (n >= t) clearInterval(iv); }, 30);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { hitung(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.5 });
    q('[data-abdul-target]').forEach(function (el) { io.observe(el); });
  } else { q('[data-abdul-target]').forEach(function (el) { el.textContent = el.getAttribute('data-abdul-target'); }); }

  /* Filter portofolio */
  q('.abdul_filter_btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-abdul-filter');
      q('.abdul_filter_btn').forEach(function (x) { x.classList.toggle('abdul_aktif', x === b); });
      q('.abdul_porto').forEach(function (p) { p.hidden = f !== 'semua' && p.getAttribute('data-abdul-kat') !== f; });
    });
  });

  /* Lightbox portofolio */
  var lb = $('abdul_lightbox');
  document.querySelector('.abdul_porto_grid').addEventListener('click', function (e) {
    var p = e.target.closest('.abdul_porto');
    if (!p) return;
    $('abdul_lb_isi').style.backgroundImage = getComputedStyle(p).backgroundImage;
    $('abdul_lb_isi').style.backgroundSize = 'cover';
    $('abdul_lb_isi').style.backgroundPosition = 'center';
    $('abdul_lb_judul').textContent = p.textContent;
    $('abdul_lb_info').textContent = p.getAttribute('data-abdul-info');
    lb.hidden = false; $('abdul_lb_tutup').focus();
  });
  function tutup() { lb.hidden = true; }
  $('abdul_lb_tutup').addEventListener('click', tutup);
  lb.addEventListener('click', function (e) { if (e.target === lb) tutup(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') tutup(); });

  /* Portofolio otomatis: baca isi folder assets/images/portofolio lewat GitHub API.
     Kalau folder kosong atau GitHub tidak bisa dihubungi, kartu bawaan tetap tampil. */
  var REPO = 'Ularadani/eo-abdul', FOLDER = 'assets/images/portofolio';
  var KATEGORI = { pernikahan: 'Pernikahan', korporat: 'Korporat', konser: 'Konser', wisuda: 'Wisuda' };
  function bangun(list) {
    var grid = document.querySelector('.abdul_porto_grid');
    grid.textContent = '';
    list.forEach(function (f) {
      var nama = f.name.replace(/\.[^.]+$/, ''), i = nama.indexOf('_'), kat = 'lainnya', judul = nama;
      if (i > 0) { kat = nama.slice(0, i).toLowerCase(); judul = nama.slice(i + 1); }
      judul = judul.replace(/[-_]+/g, ' ');
      var b = document.createElement('button'), sp = document.createElement('span');
      b.className = 'abdul_porto';
      b.setAttribute('data-abdul-kat', kat);
      b.setAttribute('data-abdul-info', KATEGORI[kat] || 'Acara lainnya');
      b.style.backgroundColor = '#1a1d8f';
      b.style.backgroundImage = 'url("' + FOLDER + '/' + encodeURIComponent(f.name) + '")';
      b.style.backgroundSize = 'cover'; b.style.backgroundPosition = 'center';
      sp.textContent = judul; b.appendChild(sp); grid.appendChild(b);
    });
  }
  function terapkan(files) {
    var list = files.filter(function (f) { return f.type === 'file' && /\.(jpe?g|png|webp)$/i.test(f.name); });
    if (list.length) bangun(list);
  }
  function muatPorto() {
    try {
      var c = JSON.parse(sessionStorage.getItem('abdul_porto') || 'null');
      if (c && Date.now() - c.t < 600000) { terapkan(c.d); return; }
    } catch (e) {}
    fetch('https://api.github.com/repos/' + REPO + '/contents/' + FOLDER)
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (arr) {
        if (!Array.isArray(arr)) return;
        try { sessionStorage.setItem('abdul_porto', JSON.stringify({ t: Date.now(), d: arr })); } catch (e) {}
        terapkan(arr);
      })
      .catch(function () {});
  }
  muatPorto();

  /* Slider testimoni */
  var slides = q('.abdul_slide'), idx = 0, auto;
  function tampil(n) {
    idx = (n + slides.length) % slides.length;
    slides.forEach(function (s, i) { s.classList.toggle('abdul_tampil', i === idx); });
  }
  function mulai() { clearInterval(auto); auto = setInterval(function () { tampil(idx + 1); }, 6000); }
  $('abdul_sebelum').addEventListener('click', function () { tampil(idx - 1); mulai(); });
  $('abdul_sesudah').addEventListener('click', function () { tampil(idx + 1); mulai(); });
  mulai();

  /* Video: sembunyikan kalau file belum ada, hentikan video latar jika pengguna kurangi animasi */
  var vh = $('abdul_video_hero'), vp = $('abdul_video_profil');
  function cekVideo(v, hapus) {
    var src = v.querySelector('source');
    function hilang() { hapus(); }
    src.addEventListener('error', hilang);
    window.addEventListener('load', function () { if (v.networkState === 3) hilang(); });
  }
  cekVideo(vh, function () { vh.remove(); });
  function idDrive(u) { var m = /\/d\/([\w-]+)/.exec(u) || /[?&]id=([\w-]+)/.exec(u); return m ? m[1] : ''; }
  var did = idDrive(ABDUL_DRIVE_PROFIL);
  if (did) {
    var fr = document.createElement('iframe');
    fr.src = 'https://drive.google.com/file/d/' + did + '/preview';
    fr.title = 'Video profil';
    fr.allow = 'autoplay; fullscreen';
    fr.setAttribute('allowfullscreen', '');
    fr.loading = 'lazy';
    fr.style.cssText = 'width:100%;aspect-ratio:16/9;border:0;border-radius:8px;background:#12132b';
    vp.replaceWith(fr);
  } else {
    cekVideo(vp, function () { $('abdul_video_wrap').hidden = true; });
  }
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) { vh.pause(); vh.removeAttribute('autoplay'); }

  /* Pilih paket mengisi form kontak */
  q('[data-abdul-paket]').forEach(function (b) {
    b.addEventListener('click', function () {
      $('abdul_k_pesan').value = 'Halo, saya tertarik dengan paket ' + b.getAttribute('data-abdul-paket') + '.';
      $('abdul_kontak').scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* Form kontak */
  function pesan(t, ok) { var o = $('abdul_k_status'); o.textContent = t; o.className = 'abdul_pesan ' + (ok ? 'abdul_benar' : 'abdul_salah'); }
  $('abdul_form_kontak').addEventListener('submit', function (e) {
    e.preventDefault();
    var nama = $('abdul_k_nama').value.trim(), mail = $('abdul_k_email').value.trim(),
        jenis = $('abdul_k_jenis').value, isi = $('abdul_k_pesan').value.trim();
    if (!nama) return pesan('Isi nama Anda dulu.', false);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) return pesan('Format email belum benar, contoh: nama@email.com.', false);
    if (!jenis) return pesan('Pilih jenis acara yang Anda rencanakan.', false);
    if (isi.length < 10) return pesan('Pesan terlalu pendek, tulis minimal 10 karakter.', false);
    pesan('Pesan terkirim. Kami membalas dalam satu hari kerja.', true);
    this.reset();
  });
})();