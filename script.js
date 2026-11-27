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
  q('.abdul_porto').forEach(function (p) {
    p.addEventListener('click', function () {
      var isi = $('abdul_lb_isi');
      isi.style.backgroundImage = getComputedStyle(p).backgroundImage;
      $('abdul_lb_judul').textContent = p.textContent;
      $('abdul_lb_info').textContent = p.getAttribute('data-abdul-info');
      lb.hidden = false; $('abdul_lb_tutup').focus();
    });
  });
  function tutup() { lb.hidden = true; }
  $('abdul_lb_tutup').addEventListener('click', tutup);
  lb.addEventListener('click', function (e) { if (e.target === lb) tutup(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') tutup(); });

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
  cekVideo(vp, function () { $('abdul_video_wrap').hidden = true; });
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
