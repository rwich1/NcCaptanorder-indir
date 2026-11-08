'use strict';
(function () {
  const VERSION = '2.3';

  // ---------- kayıt (telefon hafızası) ----------
  const K = { orders: 'nc.orders', drafts: 'nc.drafts', seq: 'nc.seq', notes: 'nc.notes', ic: 'nc.ic', ui: 'nc.ui', use: 'nc.use', pin: 'nc.pin', oos: 'nc.oos', stok: 'nc.stok' };
  function load(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function store(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch (e) { toast('⚠ Kayıt yazılamadı! Telefon hafızası dolu olabilir.', 'err', 5000); return false; }
  }
  let orders = load(K.orders, []);
  // Sipariş, masa kapatılana kadar açık kalır (closedAt = null). Eski sürümden kalan kayıtlar kapalı sayılır.
  orders.forEach(o => { if (!('closedAt' in o)) o.closedAt = o.at; });
  let drafts = load(K.drafts, {});
  let seq = load(K.seq, 0);
  const notes = Object.assign({ food: [], drink: [] }, load(K.notes, {}));
  const icOv = load(K.ic, {});   // telefonda düzenlenen içindekiler: { ürünAnahtarı: { t, kc } }
  const use = load(K.use, {});   // hızlı butonlar için satış sayacı: { "anahtar|seçim": { k, s, n } }
  let pins = load(K.pin, []);    // hızlı butonlara sabitlenenler: [{ k, s }]
  // "Bugün yok" işaretleri: { ürünAnahtarı: işaretlenme zamanı }. Gün sonunda ya da 20 saat sonra kendiliğinden kalkar.
  const OOS_TTL = 20 * 3600e3;
  const oos = load(K.oos, {});
  for (const k in oos) if (Date.now() - oos[k] > OOS_TTL) delete oos[k];
  // "Stokta yok" işaretleri: ürün gelene kadar kalır, gün sonunda silinmez.
  const stok = load(K.stok, {});
  const oosType = k => stok[k] ? 'stok' : oos[k] ? 'gun' : '';
  const isOos = k => !!oosType(k);
  const oosLabel = k => oosType(k) === 'stok' ? 'stokta yok' : 'bugün yok';
  const saveOos = () => { store(K.oos, oos); store(K.stok, stok); };
  function setAvail(k, ty) {   // ty: '' (var) | 'gun' | 'stok'
    delete oos[k]; delete stok[k];
    if (ty === 'gun') oos[k] = Date.now();
    if (ty === 'stok') stok[k] = Date.now();
  }
  const ui = load(K.ui, {});
  const saveOrders = () => store(K.orders, orders) && store(K.seq, seq);
  function saveDrafts() {
    const out = {};
    for (const k in drafts) if (drafts[k] && drafts[k].lines.length) out[k] = drafts[k];
    store(K.drafts, out);
  }
  const saveUi = () => store(K.ui, { cat: ui.cat, gc: ui.gc, theme: ui.theme, posta: ui.posta, hv: ui.hv });
  function applyTheme() {
    const dark = ui.theme === 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const m = document.querySelector('meta[name="color-scheme"]'); if (m) m.content = dark ? 'dark' : 'light';
  }
  applyTheme();

  // ---------- arşiv (gün sonunda kaldırılan kayıtlar, 30 gün) ----------
  // Telefonun IndexedDB deposunda tutulur; localStorage'ı doldurmaz.
  const ARC_DAYS = 30;
  const ARC = (function () {
    let dbp = null;
    const db = () => dbp || (dbp = new Promise((res, rej) => {
      const r = indexedDB.open('nc-arsiv', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('gun', { keyPath: 'id' });
      r.onsuccess = () => res(r.result);
      r.onerror = () => { dbp = null; rej(r.error); };
    }));
    const run = (mode, fn) => db().then(d => new Promise((res, rej) => {
      const t = d.transaction('gun', mode), req = fn(t.objectStore('gun'));
      t.oncomplete = () => res(req ? req.result : undefined);
      t.onerror = t.onabort = () => rej(t.error);
    }));
    return {
      put: b => run('readwrite', s => s.put(b)),
      all: () => run('readonly', s => s.getAll()),
      del: id => run('readwrite', s => s.delete(id)),
    };
  })();
  let arcCache = null;
  const loadArc = () => ARC.all().then(l => (arcCache = l.sort((a, b) => b.at - a.at)));
  ARC.all().then(l => l.filter(b => b.at < Date.now() - ARC_DAYS * 864e5).forEach(b => ARC.del(b.id))).catch(() => { });

  // ---------- yardımcılar ----------
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const p2 = n => (n < 10 ? '0' : '') + n;
  const hms = t => { const d = new Date(t); return p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds()); };
  const hm = t => { const d = new Date(t); return p2(d.getHours()) + ':' + p2(d.getMinutes()); };
  const dmy = t => { const d = new Date(t); return p2(d.getDate()) + '.' + p2(d.getMonth() + 1) + '.' + d.getFullYear(); };
  const stamp = t => dmy(t) === dmy(Date.now()) ? hms(t) : dmy(t) + ' ' + hms(t);
  const full = t => dmy(t) + ' · ' + hms(t);
  const ago = ms => { const m = Math.round(ms / 60000); return m < 60 ? m + ' dk' : Math.floor(m / 60) + ' sa ' + (m % 60) + ' dk'; };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const norm = s => String(s || '').toLocaleLowerCase('tr').replace(/ı/g, 'i').normalize('NFD')
    .replace(/[̀-ͯ]/g, '').replace(/['’`]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const qtySum = ls => ls.reduce((a, l) => a + l.q, 0);
  function buzz(ms) {
    try {
      if (window.Android && Android.vibrate) Android.vibrate(ms || 12);
      else if (navigator.vibrate) navigator.vibrate(ms || 12);
    } catch (e) { }
  }

  const svg = (p, w) => `<svg width="${w || 24}" height="${w || 24}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const I = {
    back: svg('<path d="M15 18l-6-6 6-6"/>', 26),
    x: svg('<path d="M18 6L6 18M6 6l12 12"/>'),
    more: svg('<circle cx="12" cy="5" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="19" r="1.6" fill="currentColor"/>'),
    list: svg('<path d="M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01"/>'),
    pen: svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>', 20),
    share: svg('<path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v13"/>', 22),
    check: svg('<path d="M20 6L9 17l-5-5"/>', 20),
    lock: svg('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>', 15),
    plus: svg('<path d="M12 5v14M5 12h14"/>', 22),
    search: svg('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>', 20),
    trash: svg('<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>', 20),
    chev: svg('<path d="M6 9l6 6 6-6"/>', 18),
    info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5"/><circle cx="12" cy="16.5" r="1" fill="currentColor"/>', 16),
    move: svg('<path d="M5 12h14M13 6l6 6-6 6"/>', 20),
    moon: svg('<path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/>', 22),
    box: svg('<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9M10 13h4"/>', 22),
    clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', 15),
  };

  // ---------- masalar ----------
  const AREAS = [{ k: 'M', n: 'Masa', c: 9 }, { k: 'K', n: 'Koltuk', c: 4 }, { k: 'T', n: 'Teras', c: 13 }, { k: 'B', n: 'Bahçe', c: 20 }];
  const tName = code => { const a = AREAS.find(a => a.k === code[0]); return a ? a.n + ' ' + code.slice(1) : code; };

  // ---------- hazır notlar ----------
  // Hazır notları kullanıcı kendisi ekler (yemek ve içecek için ayrı listeler). Gün sonu silmede silinmez.
  const NOTE_KINDS = [{ k: 'food', n: 'Yemek' }, { k: 'drink', n: 'İçecek' }];
  const noteKind = k => k === 'food' ? 'food' : 'drink';
  const CANCEL_REASONS =['Müşteri vazgeçti', 'Müşteri değiştirdi', 'Yanlış girildi', 'Ürün kalmadı', 'Geç kaldı', 'Diğer'];

  // ---------- menü dizini ----------
  const ITEMS = {}, CATS = [];
  let ORD = 0;   // ürünün menüdeki sırası (ROP gruplarının içinde sıralamak için)
  (window.MENU || []).forEach(g => g.cats.forEach(c => {
    c.group = g; c.list = []; CATS.push(c);
    c.items.forEach(it => {
      // Aynı isimli yemek birden fazla kategoride olabilir (örn. Fish and Chips) -> tek ürün sayılır.
      // İçkilerde kategori önemlidir (Jameson kadeh / shot / şişe farklıdır).
      const key = (g.kind === 'food' ? 'yemek' : c.id) + ':' + norm(it.n).replace(/ /g, '-');
      const icDef = (window.ICERIK || {})[it.n] || null;
      if (ITEMS[key]) { c.list.push(ITEMS[key]); if (!ITEMS[key].icDef) ITEMS[key].icDef = icDef; return; }
      const og = (c.o || []).concat(it.o || []);
      const o = { key, n: it.n, s: it.s || '', fx: it.fx || c.fx || [], og, tag: it.tag || c.tag || '', k: it.k || c.k || g.kind, cat: c, icDef, ord: ++ORD };
      o.hint = o.fx.concat(og.map(x => x.h || (x.c.length <= 3 ? x.c.join(' / ') : x.t.toLocaleLowerCase('tr') + ' seçimi')))
        .concat(o.s ? [o.s] : []).join(' · ');
      o.req = og.some(x => x.r);
      o.idx = norm([it.n, c.name, o.tag, o.s].concat(o.fx, ...og.map(x => x.c)).join(' '));
      c.list.push(o); ITEMS[key] = o;
    });
  }));
  const getIc = key => {
    const v = icOv[key] || (ITEMS[key] && ITEMS[key].icDef);
    return v && (v.t || v.kc) ? v : null;
  };
  // ---------- ROP (kasa programı) sırası ----------
  // Teyitli siparişte satırlar ROP'taki sırayla gruplanır: önce kısayol paneli, sonra ROP kategorileri.
  const ROPQ = (window.ROP_SIRA && window.ROP_SIRA.kisayol) || [];
  const ROPG = (window.ROP_SIRA && window.ROP_SIRA.gruplar) || [];
  const ropCat = {};
  ROPG.forEach((g, i) => g.c.forEach(c => { ropCat[c] = i; }));
  function ropPlace(l) {
    const it = ITEMS[l.key];
    if (!it) return { g: ROPG.length + 2, label: 'Menü dışı', o: 0 };
    const qi = ROPQ.findIndex(q => q.n === it.n && (!q.o || (l.o || []).indexOf(q.o) >= 0));
    if (qi >= 0) return { g: 0, label: 'ROP kısayol paneli', o: qi };
    const gi = ropCat[it.cat.id];
    return gi == null ? { g: ROPG.length + 1, label: 'Diğer', o: it.ord } : { g: gi + 1, label: ROPG[gi].n, o: it.ord };
  }
  const ropSorted = lines => lines.map((l, i) => ({ l, p: ropPlace(l), i }))
    .sort((a, b) => a.p.g - b.p.g || a.p.o - b.p.o || a.i - b.i);

  // Tek zorunlu seçim grubu olan ürünlerde seçenekler satırda buton olur (örn. 5 cl / 8 cl, Fıçı / Şişe).
  function inlineGroup(it) {
    const req = it.og.map((g, i) => g.r ? i : -1).filter(i => i >= 0);
    return req.length === 1 && it.og[req[0]].c.length <= 8 ? req[0] : -1;
  }

  // ---------- hızlı butonlar ----------
  const QUICK_MAX = 12;
  const comboSig = (k, s) => k + '|' + (s || []).join(',');
  const comboOk = (it, s) => Array.isArray(s) && s.length === it.og.length;
  const QUICK_DEF = [
    ['su', 'Su'], ['cay', 'Demleme Çay (Cam Bardak)'], ['kahve', 'Türk Kahvesi'], ['mesrubat', 'Coca-Cola'],
    ['su', 'Premium Soda', '250 ml'], ['mesrubat', 'Ayran'], ['biralar', 'Tuborg Gold', 'Fıçı 50 cl'],
    ['biralar', 'Carlsberg', 'Fıçı 50 cl'], ['biralar', 'Tuborg Gold', 'Şişe 33 cl'], ['patates', 'Parmak Patates'],
    ['arasicak', 'Sıcak Sepeti'], ['aperatif', 'Yeni Rakı', '8 cl'],
  ].map(([c, n, ch]) => {
    const cat = CATS.find(x => x.id === c), it = cat && cat.list.find(i => i.n === n);
    return it ? { k: it.key, s: it.og.map(g => ch ? g.c.indexOf(ch) : -1) } : null;
  }).filter(Boolean);
  // Sıra: sabitlenenler → en çok satılanlar → varsayılanlar
  function quickList() {
    const out = [], seen = {};
    const push = c => {
      const it = ITEMS[c.k], sg = comboSig(c.k, c.s);
      if (!it || !comboOk(it, c.s) || seen[sg] || out.length >= QUICK_MAX) return;
      seen[sg] = 1; out.push({ it, s: c.s.slice() });
    };
    pins.forEach(push);
    Object.keys(use).map(k => use[k]).sort((a, b) => b.n - a.n).forEach(push);
    QUICK_DEF.filter(c => !out.some(e => e.it.key === c.k)).forEach(push);   // öğrenilmiş ürünün varsayılanını tekrar gösterme
    return out;
  }
  function recordUse(lines) {
    lines.forEach(l => {
      const it = ITEMS[l.key]; if (!it || !comboOk(it, l.sel)) return;
      const sg = comboSig(l.key, l.sel), u = use[sg] || (use[sg] = { k: l.key, s: l.sel.slice(), n: 0 });
      u.n += l.q;
    });
    store(K.use, use);
  }
  const CAT_EMOJI = {
    corba: '🍲', baslangiclar: '🧀', salata: '🥗', arasicak: '🍗', patates: '🍟', ortaya: '🍗', nachos: '🌮', taco: '🌮',
    quesadilla: '🌯', cerez: '🥜', sos: '🥫', burger: '🍔', pizza: '🍕', makarna: '🍝', et: '🥩', tavuk: '🍗', deniz: '🐟',
    uzakdogu: '🥡', durum: '🌯', krep: '🥞', sokak: '🥖', kase: '🥗', diyet: '🥗', tatli: '🍰',
    cay: '🍵', kahve: '☕', mesrubat: '🥤', su: '🫧', biralar: '🍺', kadeh: '🍷', kirmizi: '🍷', beyaz: '🍷', roze: '🍷',
    kopuklu: '🥂', aperatif: '🥂', sise: '🍾', sangria: '🍷',
  };
  function emojiOf(it, o) {
    if (it.n === 'Su') return '💧';
    if (it.cat.id === 'biralar' && /^Şişe|^Kutu/.test((o || []).concat(it.fx).join(' '))) return '🍾';
    return CAT_EMOJI[it.cat.id] || (it.cat.group.id === 'kokteyl' ? '🍸' : it.cat.group.id === 'alkol' ? '🥃' : '🍽');
  }

  const curCat = () => (ui.cat && CATS.some(c => c.id === ui.cat)) ? ui.cat : (CATS[0] && CATS[0].id);
  const curGroup = () => CATS.find(c => c.id === curCat()).group;
  const catChips = () => curGroup().cats.map(c => `<button class="chip ${c.id === curCat() ? 'on' : ''}" data-act="cat" data-c="${c.id}">${esc(c.name)}</button>`).join('');

  // ---------- sipariş satırları ----------
  function mkLine(it, sel, nt, tx, q) {
    const o = it.fx.slice();
    it.og.forEach((g, i) => { if (sel[i] >= 0) o.push(g.c[sel[i]]); });
    return { u: uid(), key: it.key, n: it.n, tag: it.tag, k: it.k, o, sel: sel.slice(), nt, tx: tx || '', q };
  }
  const sig = l => [l.key, l.o.join('|'), l.nt.slice().sort().join('|'), norm(l.tx)].join('#');
  function addLine(d, l) {
    const s = sig(l), ex = d.lines.find(x => sig(x) === s);
    if (ex) { ex.q += l.q; return ex; }
    d.lines.push(l); return l;
  }
  const lineDetail = l => [l.tag].concat(l.o).filter(Boolean).join(' · ');
  const lineNotes = l => l.nt.concat(l.tx ? ['“' + l.tx + '”'] : []).join(' · ');
  // Kayıtlı satırın toplam adedi: ilk adet + sonradan "bir tane daha" ile eklenenler (l.ad).
  const totalQ = l => l.q + (l.ad || []).reduce((a, x) => a + x.q, 0);
  const activeQ = l => totalQ(l) - (l.cx || []).reduce((a, c) => a + c.q, 0);
  const ordersOf = t => orders.filter(o => o.t === t).sort((a, b) => b.at - a.at);
  const findOrder = id => orders.find(o => o.id === id);
  const isConfirmed = o => o.lines.every(l => activeQ(l) <= 0 || l.cf);
  function cfText(o) {
    const t = o.lines.filter(l => activeQ(l) > 0 && l.cf).map(l => l.cf);
    if (!t.length) return '✓';
    const a = Math.min(...t), b = Math.max(...t);
    return '✓ ' + stamp(a) + (b - a > 1000 ? ' · son ' + stamp(b) : '');
  }
  const openOrderOf = t => orders.filter(o => o.t === t && !o.closedAt).sort((a, b) => b.at - a.at)[0];
  const lastAct = o => Math.max(o.at, ...o.lines.map(l => l.at || 0));
  function getDraft(k) { return drafts[k] || (drafts[k] = { lines: [] }); }
  const hasDraft = k => !!(drafts[k] && drafts[k].lines.length);

  // ---------- gezinme ----------
  const app = $('#app'), sheetRoot = $('#sheet'), modalRoot = $('#modal');
  let nav = [{ v: 'home' }];
  const top = () => nav[nav.length - 1];
  function go(v) { nav.push(v); render(); }
  function back() {
    if (closeModal(false)) return true;
    if (closeSheet()) return true;
    if (nav.length > 1) { nav.pop(); render(); return true; }
    return false;
  }
  let exitArm = 0;
  window.appBack = function () {
    if (back()) return true;
    const now = Date.now();
    if (now - exitArm < 2000) return false;
    exitArm = now; toast('Çıkmak için tekrar geri basın');
    return true;
  };

  function render(keep) {
    const sc = $('.scroll', app), st = keep && sc ? sc.scrollTop : 0;
    const v = top();
    app.innerHTML = VIEWS[v.v](v);
    const sc2 = $('.scroll', app);
    if (sc2) sc2.scrollTop = st;
    if (v.v === 'menu') {
      renderItems(); renderBar();
      scrollChip();
    }
    if (v.v === 'records') renderRecords();
    if (v.v === 'icList') renderIcList();
    if (v.v === 'arcDay') renderArcDay();
    if (v.v === 'oos') renderOos();
  }
  function refresh(flashKey) {
    if (top().v === 'menu') { renderItems(flashKey); renderBar(); } else render(true);
  }

  // ---------- ekranlar ----------
  const VIEWS = {};
  const backBtn = `<button class="ic" data-act="back" aria-label="Geri">${I.back}</button>`;

  // ---------- masa düğmeleri ve posta ----------
  const ALL_TABLES = AREAS.reduce((a, x) => a.concat(Array.from({ length: x.c }, (_, i) => x.k + (i + 1))), []);
  const areaGrid = btn => AREAS.map(a => `<section class="area"><h3>${a.n}</h3><div class="tgrid">${
    Array.from({ length: a.c }, (_, i) => btn(a.k + (i + 1))).join('')}</div></section>`).join('');
  function openMap() { const m = {}; orders.forEach(o => { if (!o.closedAt) m[o.t] = o; }); return m; }
  function tableBtn(code, openT, big) {
    const dr = hasDraft(code) || hasDraft('add:' + (openT[code] || {}).id);
    return `<button class="tb ${big ? 'big' : ''} ${openT[code] ? 'open' : ''} ${dr ? 'dr' : ''}" data-act="table" data-t="${code}" aria-label="${tName(code)}"><b>${code}</b>${big ? `<small>${tName(code)}</small>` : ''}</button>`;
  }
  const myPosta = () => (ui.posta || []).filter(t => ALL_TABLES.indexOf(t) >= 0);

  VIEWS.home = function () {
    const open = orders.filter(o => !o.closedAt).sort((a, b) => lastAct(b) - lastAct(a));
    const openT = {}; open.forEach(o => { openT[o.t] = o; });
    const posta = myPosta(), hv = posta.length && ui.hv !== 'all' ? 'posta' : 'all';
    const draftT = Object.keys(drafts).filter(k => hasDraft(k) && k.indexOf('add:') !== 0 && !openT[k]);
    const quick = open.map(o => `<button class="qchip" data-act="table" data-t="${o.t}"><b>${o.t}</b><small>${hm(lastAct(o))}</small></button>`)
      .concat(draftT.map(t => `<button class="qchip dr" data-act="table" data-t="${t}"><b>${t}</b><small>taslak</small></button>`)).join('');
    return `
    <header class="top home">
      <img class="logo" src="logo.jpg" alt="Newcastle">
      <div class="tt grow"><b>Newcastle</b><span>Sipariş Kayıt</span></div>
      <div class="clock" id="clock">${hm(Date.now())}</div>
      <button class="ic" data-act="records" aria-label="Tüm kayıtlar">${I.list}</button>
      <button class="ic" data-act="settings" aria-label="Menü">${I.more}</button>
    </header>
    <main class="scroll">
      ${quick ? `<section class="area"><h3>Açık masalar <small>${open.length} açık · son işlem saati</small></h3><div class="qrow">${quick}</div></section>`
        : `<div class="sum">${orders.length ? `<b>${orders.length}</b> sipariş kayıtlı · açık masa yok` : 'Henüz sipariş yok — masaya dokunup başlayın'}</div>`}
      <div class="hvbar">
        ${posta.length ? `<button class="hvt ${hv === 'posta' ? 'on' : ''}" data-act="hv" data-v="posta">⭐ Postam · ${posta.length}</button>` : ''}
        <button class="hvt ${hv === 'all' ? 'on' : ''}" data-act="hv" data-v="all">Tüm masalar</button>
        <button class="hvt edit" data-act="postaSec">${posta.length ? '✎ Posta' : '＋ Posta seç'}</button>
      </div>
      ${hv === 'posta'
        ? `<div class="pgrid">${posta.map(t => tableBtn(t, openT, true)).join('')}</div>
           <button class="otherbtn" data-act="otherTable">${I.plus} Başka masa <small>· seni çağıran masa</small></button>`
        : areaGrid(t => tableBtn(t, openT))}
      <div class="legend"><span><i class="o"></i>Açık sipariş</span><span><i class="d"></i>Kaydedilmemiş taslak</span></div>
    </main>`;
  };

  // Posta seçimi: galerideki çoklu seçim gibi; masalar dokunulan sırayla dizilir.
  VIEWS.postaSec = function () {
    const sel = ui.pd || [];
    return `
    <header class="top">${backBtn}<div class="tt grow"><b>Posta seç</b><span>Masalarına dokun · dokunduğun sırayla dizilir</span></div></header>
    <main class="scroll">${areaGrid(t => {
      const i = sel.indexOf(t);
      return `<button class="tb ${i >= 0 ? 'sel' : ''}" data-act="pToggle" data-t="${t}"><b>${t}</b>${i >= 0 ? `<span class="badge">${i + 1}</span>` : ''}</button>`;
    })}</main>
    <footer class="bar"><button class="btn ghost" data-act="pClear">Temizle</button><button class="btn primary grow" data-act="pOk">${I.check} Tamam · ${sel.length} masa</button></footer>`;
  };

  VIEWS.table = function (v) {
    const list = ordersOf(v.t), dr = hasDraft(v.t), op = openOrderOf(v.t);
    return `
    <header class="top">${backBtn}<div class="tt grow"><b>${v.t}</b><span>${tName(v.t)} · ${list.length} sipariş</span></div></header>
    <main class="scroll">
      <button class="btn primary big" data-act="table" data-t="${v.t}">${I.plus} ${op ? `#${op.no} açık siparişe ürün ekle` : dr ? `Taslağa devam et (${qtySum(drafts[v.t].lines)} ürün)` : 'Yeni sipariş'}</button>
      <div class="hint">En yeni sipariş en üstte. Ayrıntı ve kanıt için siparişe dokunun.</div>
      ${list.map(o => cardHTML(o, false)).join('') || '<div class="empty">Bu masada kayıt yok.</div>'}
    </main>`;
  };

  function cardHTML(o, showTable, arcId) {
    const act = ropSorted(o.lines.filter(l => activeQ(l) > 0)).map(x => x.l), show = act.slice(0, 4);
    return `<div class="card" role="button" tabindex="0" data-act="${arcId ? 'arcOrder' : 'order'}" data-id="${o.id}"${arcId ? ` data-b="${arcId}"` : ''}>
      <div class="ch">${showTable ? `<span class="ctab">${o.t}</span>` : ''}<span class="no">#${o.no}</span><span class="tm">${I.clock}${stamp(o.at)}</span><span class="grow"></span>${o.closedAt || arcId ? '' : '<span class="bdg open">Açık</span>'}${badge(o)}</div>
      ${show.map(l => `<div class="cl"><b>${activeQ(l)}×</b> ${esc(l.n)}${lineDetail(l) ? ` <small>${esc(lineDetail(l))}</small>` : ''}</div>`).join('')}
      ${act.length > 4 ? `<div class="more">+${act.length - 4} kalem daha</div>` : ''}
      ${!act.length ? '<div class="more">Tüm ürünler iptal edildi</div>' : ''}
      ${o.ev.length > 1 ? `<div class="chg">Değişiklik var (${o.ev.length - 1})</div>` : ''}
    </div>`;
  }
  const badge = o => isConfirmed(o) ? `<span class="bdg ok">${I.check}Teyitli</span>` : `<span class="bdg warn">Teyitsiz</span>`;

  VIEWS.menu = function (v) {
    const o = v.oid ? findOrder(v.oid) : null;
    const has = !o && ordersOf(v.t).length;
    return `
    <header class="top">${backBtn}
      <div class="tt grow"><b>${v.t}</b><span>${o ? `#${o.no} açık sipariş · açılış ${hm(o.at)}` : tName(v.t) + ' · yeni sipariş'}</span></div>
      ${o ? `<button class="btn ghost sm" data-act="showOrder" data-id="${o.id}">Sipariş #${o.no}</button>`
        : has ? `<button class="btn ghost sm" data-act="tableHist" data-t="${v.t}">Geçmiş</button>` : ''}
    </header>
    <div class="searchbar"><span class="sic">${I.search}</span><input id="q" type="search" placeholder="Ürün ara: sezar, absolut, burger…" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="search"><button class="clr" data-act="clearQ" aria-label="Aramayı temizle">${I.x}</button></div>
    <nav class="cats ${ui.mode === 'hizli' ? 'hz' : ''}">
      <div class="grps"><button class="grp star ${ui.mode === 'hizli' ? 'on' : ''}" data-act="hizli" aria-label="Hızlı butonlar">⭐</button>${
        (window.MENU || []).map(g => `<button class="grp ${ui.mode !== 'hizli' && g.id === curGroup().id ? 'on' : ''}" data-act="grp" data-g="${g.id}">${esc(g.name)}</button>`).join('')}</div>
      <div class="catrow" id="catrow">${catChips()}</div>
    </nav>
    <main class="scroll" id="items"></main>
    <footer class="bar" id="bar"></footer>`;
  };

  let QL = [];   // ekrandaki hızlı butonlar
  function renderItems(flashKey) {
    const box = $('#items'); if (!box) return;
    const d = getDraft(top().d), qv = ($('#q') || {}).value || '', q = norm(qv);
    const cnt = {}, cntSel = {};
    d.lines.forEach(l => {
      cnt[l.key] = (cnt[l.key] || 0) + l.q;
      const sg = comboSig(l.key, l.sel); cntSel[sg] = (cntSel[sg] || 0) + l.q;
    });
    $('.searchbar').classList.toggle('on', !!qv);
    // Masadaki açık sipariş 1 saatten eskiyse uyar: masayı kapatmayı unutmuş olabilirsin
    const oo = top().oid ? findOrder(top().oid) : null, idle = oo ? Date.now() - lastAct(oo) : 0;
    const strip = oo && idle > 60 * 60e3 ? `<div class="ncstrip">⏰ <span class="grow">#${oo.no} · son işlem ${ago(idle)} önce. Yeni müşteri mi geldi?</span><button class="btn sm primary" data-act="newCustomer">Yeni müşteri</button></div>` : '';
    if (!q && ui.mode === 'hizli') {
      QL = quickList();
      box.innerHTML = strip + `<div class="lh">Hızlı <span>· en çok sattıkların · ✎ penceresinden ⭐ ile sabitle</span></div>
        <div class="qgrid">${QL.map((e, i) => {
          const o = e.it.og.map((g, gi) => e.s[gi] >= 0 ? g.c[e.s[gi]] : null).filter(Boolean).concat(e.it.fx);
          const need = e.it.og.find((g, gi) => g.r && e.s[gi] < 0), out = isOos(e.it.key);
          const c = need ? (cnt[e.it.key] || 0) : (cntSel[comboSig(e.it.key, e.s)] || 0);
          const s = out ? oosLabel(e.it.key) : o.join(' · ') || (need ? need.t.toLocaleLowerCase('tr') + ' sorar' : '');
          return `<button class="qt ${c ? 'on' : ''} ${out ? 'oos' : ''}" data-act="qadd" data-i="${i}">${c ? `<span class="badge">${c}</span>` : ''}<span class="e">${emojiOf(e.it, o)}</span><span class="n">${esc(e.it.n)}</span><span class="s">${esc(s)}</span></button>`;
        }).join('')}</div>`;
      return;
    }
    let list, head;
    if (q) {
      const ws = q.split(' ');
      list = Object.keys(ITEMS).map(k => ITEMS[k]).filter(it => ws.every(w => it.idx.indexOf(w) >= 0));
      head = `<div class="lh">Arama <span>· ${list.length} sonuç</span></div>`;
    } else {
      const c = CATS.find(c => c.id === curCat());
      list = c ? c.list : [];
      head = c ? `<div class="lh">${esc(c.name)}${c.tag ? ` <span>· ${esc(c.tag)}</span>` : ''}</div>` : '';
    }
    box.innerHTML = strip + head + list.map(it => rowHTML(it, cnt, cntSel, q, flashKey)).join('') +
      (q && !list.length ? `<div class="empty">“${esc(qv)}” menüde bulunamadı.</div>` : '') +
      `<button class="freebtn" data-act="freeItem">${I.plus} Menüde olmayan ürün ekle</button>`;
  }
  function rowHTML(it, cnt, cntSel, q, flashKey) {
    const n = cnt[it.key] || 0, gi = inlineGroup(it), out = isOos(it.key);
    const cls = `item ${n ? 'has' : ''} ${it.key === flashKey ? 'pop' : ''} ${out ? 'oos' : ''}`;
    const nm = `<div class="nm">${esc(it.n)}${out ? ` <i class="oost">· ${oosLabel(it.key)}</i>` : ''}</div>`;
    const right = `${n ? `<button class="rb" data-act="minus" data-k="${it.key}" aria-label="Bir azalt">−</button><span class="cnt">${n}</span>` : ''}
      <button class="rb" data-act="note" data-k="${it.key}" aria-label="Notlu ekle">${I.pen}</button>`;
    if (gi < 0) {
      const sub = (q ? it.cat.name + (it.hint ? ' · ' : '') : '') + it.hint;
      return `<div class="${cls}" data-act="tap" data-k="${it.key}"><div class="in">${nm}${sub || it.req ? `<div class="sub">${esc(sub)}${it.req ? ' <i class="rq-t">· seçmeli</i>' : ''}</div>` : ''}</div>${right}</div>`;
    }
    // Seçenekler satırda buton: dokun = 1 adet. "Fıçı 50 cl" gibi seçenekler FIÇI / ŞİŞE sıralarına ayrılır.
    const g = it.og[gi], rows = [];
    g.c.forEach((c, ci) => {
      const sp = g.sub ? c.indexOf(' ') : -1, label = sp > 0 ? c.slice(0, sp) : '', txt = sp > 0 ? c.slice(sp + 1) : c;
      let r = rows.find(x => x.label === label); if (!r) rows.push(r = { label, b: [] });
      const k = cntSel[comboSig(it.key, it.og.map((x, i) => i === gi ? ci : -1))] || 0;
      r.b.push(`<button class="sb ${k ? 'on' : ''}" data-act="sz" data-k="${it.key}" data-c="${ci}">${esc(txt)}${k ? `<span class="badge">${k}</span>` : ''}</button>`);
    });
    const sub = [q ? it.cat.name : '', it.fx.join(' · '), it.s].filter(Boolean).join(' · ');
    return `<div class="${cls} inl"><div class="ihd"><div class="in" data-act="note" data-k="${it.key}">${nm}${sub ? `<div class="sub">${esc(sub)}</div>` : ''}</div>${right}</div>
      <div class="szs">${rows.map(r => `<div class="szr">${r.label ? `<span class="szl">${esc(r.label)}</span>` : ''}${r.b.join('')}</div>`).join('')}</div></div>`;
  }

  function renderBar() {
    const bar = $('#bar'); if (!bar) return;
    const n = qtySum(getDraft(top().d).lines);
    bar.innerHTML = n
      ? `<button class="btn primary big" data-act="review"><span class="bc">${n}</span> Siparişi gözden geçir ›</button>`
      : top().oid
        // Açık siparişli masa: başparmağın yetiştiği yerde "Yeni müşteri" (eskiyi kapat, yeni aç)
        ? `<button class="btn ghost" data-act="showOrder" data-id="${top().oid}">Sipariş #${(findOrder(top().oid) || {}).no}</button>
           <button class="btn primary grow" data-act="newCustomer">${I.plus} Yeni müşteri</button>`
        : `<div class="barhint">Ürüne dokun = 1 adet ekle · ✎ = notlu / seçenekli ekle</div>`;
  }

  VIEWS.review = function (v) {
    const d = getDraft(v.d), o = v.oid ? findOrder(v.oid) : null, n = qtySum(d.lines);
    return `
    <header class="top">${backBtn}<div class="tt grow"><b>${v.t}</b><span>${o ? '#' + o.no + ' · eklenecekler' : 'Sipariş özeti'} · ${n} ürün</span></div></header>
    <main class="scroll">
      ${d.lines.length ? `<div class="readhint">Siparişi müşteriye <b>tek tek okuyun</b>. Onaylarsa yeşil butona basın.</div>` : ''}
      <div class="rlist">${d.lines.map(l => `
        <div class="rl">
          <div class="rq">${l.q}×</div>
          <div class="grow" data-act="editLine" data-u="${l.u}">
            <div class="rn">${esc(l.n)}</div>
            ${lineDetail(l) ? `<div class="rd">${esc(lineDetail(l))}</div>` : ''}
            ${lineNotes(l) ? `<div class="rnote">${esc(lineNotes(l))}</div>` : ''}
          </div>
          <button class="rb" data-act="editLine" data-u="${l.u}" aria-label="Düzenle">${I.pen}</button>
        </div>`).join('') || '<div class="empty">Sepet boş.</div>'}
      </div>
      <button class="btn ghost big" data-act="back">${I.plus} Ürün ekle</button>
      ${d.lines.length && o ? `<button class="btn link" data-act="newCustomer">Bunlar yeni müşterinin mi? Eski siparişi kapat, yeni sipariş yap</button>` : ''}
      ${d.lines.length ? `<button class="btn link" data-act="discard">Bu taslağı sil</button>` : ''}
    </main>
    ${d.lines.length ? `<footer class="bar col">
      <button class="btn okb big" data-act="save" data-cf="1">${I.check} Müşteri onayladı · Kaydet</button>
      <button class="btn link" data-act="save" data-cf="0">Teyit almadan kaydet</button>
    </footer>` : ''}`;
  };

  const arcOrder = (b, id) => { const x = (arcCache || []).find(a => a.id === b); return x && x.orders.find(o => o.id === id); };
  VIEWS.order = function (v) {
    const ro = !!v.arc, o = ro ? arcOrder(v.arc, v.id) : findOrder(v.id);
    if (!o) return `<header class="top">${backBtn}<div class="tt grow"><b>Kayıt yok</b></div></header><main class="scroll"><div class="empty">Bu kayıt bulunamadı.</div></main>`;
    const ok = isConfirmed(o);
    const into = o.mergedInto && (findOrder(o.mergedInto) || (ro && arcOrder(v.arc, o.mergedInto)));
    const state = !o.closedAt ? (ro ? 'Gün sonunda açıktı (masa kapatılmamıştı)' : 'Açık — masa kapatılana kadar ürün eklenebilir')
      : into ? `#${into.no} (${into.t}) ile birleştirildi · ${stamp(o.closedAt)}` : 'Masa kapatıldı · ' + stamp(o.closedAt);
    return `
    <header class="top">${backBtn}<div class="tt grow"><b>#${o.no} · ${o.t}</b><span>${tName(o.t)}${ro ? ' · arşiv' : ''}</span></div>
      <button class="ic" data-act="shareOrder" data-id="${o.id}"${ro ? ` data-b="${v.arc}"` : ''} aria-label="Paylaş">${I.share}</button></header>
    <main class="scroll">
      ${ro ? `<div class="arcban">${I.box} Arşiv kaydı — sadece görüntülenir.</div>` : ''}
      <section class="proof">
        <div class="pt"><div class="ptab">${o.t}</div><div class="grow"><div class="pn">${tName(o.t)}</div><div class="pno">Sipariş #${o.no}</div></div>${badge(o)}</div>
        <div class="kv"><span>Kayıt zamanı</span><b>${full(o.at)}</b></div>
        <div class="kv"><span>Müşteri teyidi</span><b class="${ok ? 'okc' : 'warnc'}">${ok ? cfText(o) : 'Teyit alınmamış ürün var'}</b></div>
        <div class="kv"><span>Durum</span><b class="${o.closedAt ? '' : 'openc'}">${state}</b></div>
        <div class="lockn">${I.lock} Kayıt kilitli: silinemez, her değişiklik saatiyle aşağıya yazılır.</div>
      </section>
      ${ro || o.closedAt ? '' : '<div class="hint">Aynı üründen bir tane daha için ürünün üstüne dokun.</div>'}
      <div>${(() => {   // ROP sırası: kısayol paneli → ROP kategorileri; her grubun başında ROP'taki adı
        let prev = null;
        return ropSorted(o.lines).map(x => {
          const h = x.p.label !== prev ? `<div class="dgh">${esc(x.p.label)}</div>` : '';
          prev = x.p.label;
          return h + lineHTML(o, x.l, ro);
        }).join('');
      })()}</div>
      ${ro ? '' : `<div class="acts">
        ${o.closedAt ? '' : `<button class="btn primary" data-act="appendOrder" data-id="${o.id}">${I.plus} Ürün ekle</button>`}
        ${!ok ? `<button class="btn okb" data-act="confirmOrder" data-id="${o.id}">${I.check} Şimdi teyit al</button>` : ''}
      </div>
      ${o.closedAt ? '' : `<button class="btn ghost big" data-act="moveStart" data-id="${o.id}">${I.move} Masa taşı / birleştir</button>
      <button class="btn ghost big gap" data-act="closeOrder" data-id="${o.id}">Masayı kapat (hesap alındı / müşteri kalktı)</button>`}`}
      <h4 class="evh">Kayıt geçmişi</h4>
      <ol class="ev">${o.ev.map(e => `<li><time>${stamp(e.t)}</time><span>${esc(e.x)}</span></li>`).join('')}</ol>
    </main>`;
  };

  function lineHTML(o, l, ro) {
    const aq = activeQ(l), tap = !ro && !o.closedAt;
    return `<div class="dl ${aq <= 0 ? 'gone' : ''}">
      <div class="rq">${aq > 0 ? aq : totalQ(l)}×</div>
      <div class="grow${tap ? ' tapadd' : ''}"${tap ? ` data-act="again" data-id="${o.id}" data-u="${l.u}"` : ''}>
        <div class="rn">${esc(l.n)}</div>
        ${lineDetail(l) ? `<div class="rd">${esc(lineDetail(l))}</div>` : ''}
        ${lineNotes(l) ? `<div class="rnote">${esc(lineNotes(l))}</div>` : ''}
        ${l.from ? `<div class="meta from">↪ ${esc(l.from)} siparişinden taşındı</div>` : ''}
        ${l.at !== o.at ? `<div class="meta add">+ ${stamp(l.at)} sonradan eklendi</div>` : ''}
        ${(l.ad || []).length ? `<div class="meta add">Bir tane daha: ${l.ad.map(a => '+' + a.q + ' ' + hm(a.t)).join(', ')}</div>` : ''}
        ${(l.cx || []).map(c => `<div class="meta cx">− ${c.q} adet iptal · ${stamp(c.t)} · ${esc(c.r)}</div>`).join('')}
        ${aq > 0 && !l.cf ? '<div class="meta wr">Müşteri teyidi alınmadı</div>' : ''}
        ${aq > 0 && l.cf && l.cf !== l.at ? `<div class="meta okm">✓ ${stamp(l.cf)} teyit edildi</div>` : ''}
      </div>
      ${!ro && aq > 0 ? `<button class="btn sm danger" data-act="cancelLine" data-id="${o.id}" data-u="${l.u}">İptal</button>` : ''}
    </div>`;
  }

  VIEWS.notes = function () {
    return `
    <header class="top">${backBtn}<div class="tt grow"><b>Hazır notlar</b><span>Sipariş girerken tek dokunuşla seçilir</span></div></header>
    <main class="scroll">
      ${NOTE_KINDS.map(x => `<section class="area"><h3>${x.n} <small>${notes[x.k].length} not</small></h3>
        <div class="addrow"><input class="tx nadd" id="nn-${x.k}" data-k="${x.k}" placeholder="${x.k === 'food' ? 'Örn. soğansız' : 'Örn. buzsuz'}" autocomplete="off" enterkeyhint="done"><button class="btn primary sm" data-act="noteAdd" data-k="${x.k}">${I.plus}Ekle</button></div>
        ${notes[x.k].map((n, i) => `<div class="nrow"><span class="grow">${esc(n)}</span><button class="ic" data-act="noteDel" data-k="${x.k}" data-i="${i}" aria-label="Sil">${I.trash}</button></div>`).join('')
          || '<div class="nhint">Henüz not yok.</div>'}
      </section>`).join('')}
      <div class="nhint">Not yazarken <b>⭐ Kaydet</b>'e basarak da buraya not ekleyebilirsin. Gün sonu silme işlemi hazır notları silmez.</div>
    </main>`;
  };

  VIEWS.icList = function () {
    return `
    <header class="top">${backBtn}<div class="tt grow"><b>İçindekiler</b><span>Düzenlemek için ürüne dokun</span></div></header>
    <div class="searchbar ${ui.icq ? 'on' : ''}"><span class="sic">${I.search}</span><input id="icq" type="search" placeholder="Ürün ara: sezar, negroni…" value="${esc(ui.icq || '')}" autocomplete="off" spellcheck="false"><button class="clr" data-act="clearIcq" aria-label="Aramayı temizle">${I.x}</button></div>
    <main class="scroll" id="iclist"></main>`;
  };
  function renderIcList() {
    const box = $('#iclist'); if (!box) return;
    const q = norm(ui.icq), ws = q ? q.split(' ') : [], seen = {};
    let html = '';
    CATS.forEach(c => {
      const rows = c.list.filter(it => !seen[it.key] && (!ws.length || ws.every(w => it.idx.indexOf(w) >= 0)));
      if (!rows.length) return;
      html += `<div class="lh">${esc(c.group.name)} <span>· ${esc(c.name)}</span></div>` + rows.map(it => {
        seen[it.key] = 1;
        const ic = getIc(it.key);
        return `<div class="item" data-act="icOpen" data-k="${it.key}"><div class="in"><div class="nm">${esc(it.n)}${icOv[it.key] ? ' <i class="rq-t">· düzenlendi</i>' : ''}</div>
          <div class="sub icsub">${ic ? esc([ic.t, ic.kc ? ic.kc + ' kcal' : ''].filter(Boolean).join(' · ')) : '—'}</div></div></div>`;
      }).join('');
    });
    box.innerHTML = html || '<div class="empty">Ürün bulunamadı.</div>';
  }

  VIEWS.oos = function () {
    return `
    <header class="top">${backBtn}<div class="tt grow"><b>Olmayan ürünler</b><span>İşaretli ürünler soluk görünür, eklenemez</span></div></header>
    <div class="searchbar ${ui.oq ? 'on' : ''}"><span class="sic">${I.search}</span><input id="oq" type="search" placeholder="İşaretlemek için ara: frederik, somon…" value="${esc(ui.oq || '')}" autocomplete="off" spellcheck="false"><button class="clr" data-act="clearOq" aria-label="Aramayı temizle">${I.x}</button></div>
    <main class="scroll" id="ooslist"></main>`;
  };
  function renderOos() {
    const box = $('#ooslist'); if (!box) return;
    const q = norm(ui.oq), ws = q ? q.split(' ') : [];
    // Her satırda iki düğme: Bugün yok / Stokta yok. Seçili olana tekrar dokunmak = tekrar var.
    const row = it => {
      const ty = oosType(it.key);
      return `<div class="item ${ty ? 'oos' : ''}"><div class="in"><div class="nm">${esc(it.n)}</div><div class="sub">${esc(it.cat.name)}</div></div>
        <div class="avb"><button class="avt ${ty === 'gun' ? 'on' : ''}" data-act="oosSet" data-k="${it.key}" data-ty="gun">Bugün yok</button><button class="avt ${ty === 'stok' ? 'on' : ''}" data-act="oosSet" data-k="${it.key}" data-ty="stok">Stokta yok</button></div></div>`;
    };
    const list = map => Object.keys(map).filter(k => ITEMS[k]).map(k => ITEMS[k]);
    const sec = (title, note, items, ty) => items.length ? `<div class="lh">${title} <span>· ${items.length} ürün · ${note}</span></div>${items.map(row).join('')}
      <div class="pad12"><button class="btn ghost big" data-act="oosClear" data-ty="${ty}">${title}: hepsini tekrar var yap</button></div>` : '';
    let html = sec('📦 Stokta yok', 'gelene kadar kalır', list(stok), 'stok') + sec('🚫 Bugün yok', 'gün sonunda kalkar', list(oos), 'gun');
    if (!html) html = '<div class="nhint pad12">Şu an işaretli ürün yok. Biten ürünü yukarıdan arayıp işaretle:<br><b>Bugün yok</b> gün sonunda kendiliğinden kalkar, <b>Stokta yok</b> sen tekrar var diyene kadar kalır.</div>';
    if (ws.length) {
      const res = Object.keys(ITEMS).map(k => ITEMS[k]).filter(it => ws.every(w => it.idx.indexOf(w) >= 0));
      const free = res.filter(it => !isOos(it.key)).length;
      html += `<div class="lh">Arama <span>· ${res.length} sonuç</span></div>` +
        (free > 1 ? `<div class="pad12 two"><button class="btn ghost" data-act="oosAll" data-ty="gun">🚫 Hepsi bugün yok (${free})</button><button class="btn ghost" data-act="oosAll" data-ty="stok">📦 Hepsi stokta yok (${free})</button></div>` : '') +
        (res.map(row).join('') || '<div class="empty">Ürün bulunamadı.</div>');
    }
    box.innerHTML = html;
  }

  VIEWS.archive = function () {
    const head = `<header class="top">${backBtn}<div class="tt grow"><b>Arşiv</b><span>Son ${ARC_DAYS} gün · eskiler kendiliğinden silinir</span></div></header>`;
    if (!arcCache) {
      loadArc().then(() => { if (top().v === 'archive') render(); })
        .catch(() => { arcCache = []; toast('Arşiv okunamadı', 'err'); if (top().v === 'archive') render(); });
      return head + '<main class="scroll"><div class="empty">Yükleniyor…</div></main>';
    }
    return head + `<main class="scroll">${arcCache.map(b => `
      <div class="card" role="button" tabindex="0" data-act="arcDay" data-b="${b.id}">
        <div class="ch"><span class="no">${dmy(b.from)}</span><span class="tm">${I.clock}${hm(b.from)} – ${dmy(b.to) === dmy(b.from) ? hm(b.to) : dmy(b.to) + ' ' + hm(b.to)}</span><span class="grow"></span><span class="bdg open">${b.orders.length} sipariş</span></div>
        <div class="more">Arşive kaldırıldı: ${dmy(b.at)} ${hm(b.at)} · ${Math.max(0, ARC_DAYS - Math.floor((Date.now() - b.at) / 864e5))} gün sonra silinecek</div>
      </div>`).join('') || '<div class="empty">Arşiv boş. Gün sonunda kaldırılan kayıtlar burada 30 gün durur.</div>'}</main>`;
  };
  VIEWS.arcDay = function (v) {
    const b = (arcCache || []).find(x => x.id === v.b);
    return `<header class="top">${backBtn}<div class="tt grow"><b>Arşiv · ${b ? dmy(b.from) : ''}</b><span>${b ? b.orders.length + ' sipariş' : ''}</span></div></header>
    <div class="searchbar ${ui.aq ? 'on' : ''}"><span class="sic">${I.search}</span><input id="aq" type="search" placeholder="Masa veya ürün: T5, burger…" value="${esc(ui.aq || '')}" autocomplete="off" spellcheck="false"><button class="clr" data-act="clearAq" aria-label="Aramayı temizle">${I.x}</button></div>
    <main class="scroll" id="arcl"></main>`;
  };
  function renderArcDay() {
    const box = $('#arcl'); if (!box) return;
    const v = top(), b = (arcCache || []).find(x => x.id === v.b);
    if (!b) { box.innerHTML = '<div class="empty">Bu arşiv bulunamadı.</div>'; return; }
    const q = norm(ui.aq), ws = q ? q.split(' ') : [];
    const list = b.orders.filter(o => ws.every(w => /^[mktb]\d{1,2}$/.test(w) ? o.t.toLowerCase() === w : orderIdx(o).indexOf(w) >= 0))
      .sort((x, y) => y.at - x.at);
    box.innerHTML = list.map(o => cardHTML(o, true, b.id)).join('') || '<div class="empty">Kayıt bulunamadı.</div>';
  }

  VIEWS.records = function () {
    return `
    <header class="top">${backBtn}<div class="tt grow"><b>Tüm kayıtlar</b><span>${orders.length} sipariş · en yeni üstte</span></div></header>
    <div class="searchbar ${ui.rq ? 'on' : ''}"><span class="sic">${I.search}</span><input id="rq" type="search" placeholder="Masa veya ürün: T5, burger, absolut…" value="${esc(ui.rq || '')}" autocomplete="off" spellcheck="false"><button class="clr" data-act="clearRq" aria-label="Aramayı temizle">${I.x}</button></div>
    <div class="catrow pad">${[{ k: '', n: 'Tümü' }].concat(AREAS).map(a => `<button class="chip ${(ui.ra || '') === a.k ? 'on' : ''}" data-act="ra" data-a="${a.k}">${a.n}</button>`).join('')}</div>
    <main class="scroll" id="recs"></main>`;
  };
  const orderIdx = o => norm([o.t, tName(o.t), o.no].concat(...o.lines.map(l => [l.n, l.tag, l.tx].concat(l.o, l.nt))).join(' '));
  function renderRecords() {
    const box = $('#recs'); if (!box) return;
    const q = norm(ui.rq), ws = q ? q.split(' ') : [];
    const list = orders.filter(o => (!ui.ra || o.t[0] === ui.ra) && ws.every(w =>
      /^[mktb]\d{1,2}$/.test(w) ? o.t.toLowerCase() === w : orderIdx(o).indexOf(w) >= 0
    )).sort((a, b) => b.at - a.at);
    box.innerHTML = list.map(o => cardHTML(o, true)).join('') || '<div class="empty">Kayıt bulunamadı.</div>';
  }

  // ---------- alt sayfalar ----------
  let SH = null;
  const SHEETS = {};
  function drawSheet(first) {
    if (!SH) { sheetRoot.innerHTML = ''; return; }
    const b = $('.sh-b', sheetRoot), st = b && !first ? b.scrollTop : 0;
    sheetRoot.innerHTML = `<div class="backdrop" data-act="closeSheet"></div><div class="sheet ${first ? 'anim' : ''}" role="dialog" aria-modal="true">${SHEETS[SH.type]()}</div>`;
    const b2 = $('.sh-b', sheetRoot); if (b2) b2.scrollTop = st;
  }
  function closeSheet() { if (!SH) return false; SH = null; sheetRoot.innerHTML = ''; return true; }
  const shHead = (t, s) => `<div class="sh-h"><div class="grow"><div class="sh-t">${esc(t)}</div>${s ? `<div class="sh-s">${esc(s)}</div>` : ''}</div><button class="ic" data-act="closeSheet" aria-label="Kapat">${I.x}</button></div>`;

  function openItem(key, u, presel) {
    const d = getDraft(top().d), line = u ? d.lines.find(l => l.u === u) : null;
    const it = ITEMS[line ? line.key : key];
    if (!it) {
      SH = { type: 'item', custom: true, u, name: line ? line.n : '', kind: line ? line.k : 'food',
        q: line ? line.q : 1, nt: line ? line.nt.slice() : [], tx: line ? line.tx : '', miss: -1 };
    } else {
      SH = { type: 'item', key: it.key, u, q: line ? line.q : 1,
        sel: line && line.sel ? line.sel.slice() : presel && comboOk(it, presel) ? presel.slice() : it.og.map(() => -1),
        nt: line ? line.nt.slice() : [], tx: line ? line.tx : '', miss: -1 };
    }
    drawSheet(true);
  }

  SHEETS.item = function () {
    const it = SH.custom ? null : ITEMS[SH.key];
    const kind = it ? it.k : SH.kind, og = it ? it.og : [];
    const nk = noteKind(kind), list = notes[nk].concat(SH.nt.filter(n => notes[nk].indexOf(n) < 0));
    const chip = n => `<button class="nchip ${SH.nt.indexOf(n) >= 0 ? 'on' : ''}" data-act="nchip" data-n="${esc(n)}">${esc(n)}</button>`;
    const ic = it && getIc(it.key);
    const pinned = it && pins.some(p => comboSig(p.k, p.s) === comboSig(it.key, SH.sel));
    return shHead(it ? it.n : 'Menüde olmayan ürün', it ? [it.cat.name, it.tag].concat(it.fx).filter(Boolean).join(' · ') : 'Ürün adını kendin yaz') + `
    <div class="sh-b">
      ${it && isOos(it.key) ? `<div class="warnbox">${oosType(it.key) === 'stok' ? '📦' : '🚫'} Bu ürün <b>${oosLabel(it.key)}</b> olarak işaretli. Eklemek için aşağıdan tekrar "var" yap.</div>` : ''}
      ${ic ? `<div class="icbox ${SH.icOpen ? 'open' : ''}"><button class="ich" data-act="icToggle" aria-expanded="${SH.icOpen ? 'true' : 'false'}">${I.info}İçindekiler<span class="chev">${I.chev}</span></button>${
        SH.icOpen ? `${ic.t ? `<div class="ict">${esc(ic.t)}</div>` : ''}${ic.kc ? `<div class="kc">${esc(ic.kc)} kcal</div>` : ''}` : ''}</div>` : ''}
      ${SH.custom ? `
      <div class="og ${SH.miss === 'name' ? 'miss' : ''}"><div class="ogt">Ürün adı <em>* zorunlu</em></div><input class="tx" id="shname" data-bind="name" value="${esc(SH.name)}" placeholder="Örn. Mojito, Efes 50 cl" autocomplete="off"></div>
      <div class="og"><div class="ogt">Tür</div><div class="seg"><button class="opt ${kind === 'food' ? 'on' : ''}" data-act="kind" data-k="food">Yemek</button><button class="opt ${kind === 'drink' ? 'on' : ''}" data-act="kind" data-k="drink">İçecek</button></div></div>` : ''}
      ${og.map((g, gi) => `<div class="og ${SH.miss === gi ? 'miss' : ''}" data-g="${gi}"><div class="ogt">${esc(g.t)} ${g.r ? '<em>* zorunlu</em>' : '<span>· isteğe bağlı</span>'}</div><div class="seg">${
        g.c.map((c, ci) => `<button class="opt ${SH.sel[gi] === ci ? 'on' : ''}" data-act="opt" data-g="${gi}" data-c="${ci}">${esc(c)}</button>`).join('')}</div></div>`).join('')}
      <div class="og"><div class="ogt">Adet</div><div class="qty"><button class="qb" data-act="sq" data-d="-1" aria-label="Azalt">−</button><b>${SH.q}</b><button class="qb" data-act="sq" data-d="1" aria-label="Arttır">+</button></div></div>
      <div class="og"><div class="ogt">Not</div><div class="addrow"><input class="tx" data-bind="tx" value="${esc(SH.tx)}" placeholder="Not yaz…" autocomplete="off" enterkeyhint="done"><button class="btn ghost sm" data-act="saveNote">⭐ Kaydet</button></div></div>
      <div class="og"><div class="ogt">Hazır notlarım <span>· ${nk === 'food' ? 'yemek' : 'içecek'}</span></div>${
        list.length ? `<div class="seg">${list.map(chip).join('')}</div>`
          : `<div class="nhint">Henüz hazır not yok. Notu yazıp <b>⭐ Kaydet</b>'e bas; sonraki siparişlerde tek dokunuşla seçersin.</div>`}</div>
      ${it ? `<div class="shlinks">
        <button class="shlink" data-act="pinToggle">${pinned ? '★ Hızlı butonlarda sabit · kaldır' : '☆ Bu seçimi hızlı butonlara sabitle'}</button>
        ${isOos(it.key) ? `<button class="shlink" data-act="avail" data-ty="">✓ Tekrar var olarak işaretle</button>`
          : `<button class="shlink" data-act="avail" data-ty="gun">🚫 Bugün yok olarak işaretle <small>· gün sonunda kalkar</small></button>
             <button class="shlink" data-act="avail" data-ty="stok">📦 Stokta yok olarak işaretle <small>· gelene kadar</small></button>`}
      </div>` : ''}
    </div>
    <div class="sh-f">${SH.u ? `<button class="btn danger" data-act="sheetDel">${I.trash}Sil</button>` : ''}<button class="btn primary big grow" data-act="sheetOk">${SH.u ? 'Güncelle' : 'Ekle'} · ${SH.q} adet</button></div>`;
  };

  SHEETS.cancel = function () {
    const o = findOrder(SH.oid), l = o.lines.find(x => x.u === SH.u);
    return shHead('İptal: ' + l.n, [lineDetail(l), 'şu an ' + SH.max + ' adet'].filter(Boolean).join(' · ')) + `
    <div class="sh-b">
      ${SH.max > 1 ? `<div class="og"><div class="ogt">Kaç adet iptal?</div><div class="qty"><button class="qb" data-act="cq" data-d="-1" aria-label="Azalt">−</button><b>${SH.q}</b><button class="qb" data-act="cq" data-d="1" aria-label="Arttır">+</button></div></div>` : ''}
      <div class="og ${SH.miss ? 'miss' : ''}"><div class="ogt">Sebep <em>* zorunlu</em></div><div class="seg">${
        CANCEL_REASONS.map(r => `<button class="opt ${SH.r === r ? 'on' : ''}" data-act="cr" data-r="${r}">${r}</button>`).join('')}</div></div>
      <div class="og"><div class="ogt">Açıklama</div><input class="tx" data-bind="tx" value="${esc(SH.tx)}" placeholder="İsteğe bağlı" autocomplete="off"></div>
      <div class="warnbox">İptal kaydı silinmez; saatiyle birlikte siparişin geçmişine yazılır.</div>
    </div>
    <div class="sh-f"><button class="btn primary big grow" data-act="cancelOk">${SH.q} adet iptal et</button></div>`;
  };

  SHEETS.icEdit = function () {
    const it = ITEMS[SH.key];
    return shHead(it.n, 'İçindekiler · ' + it.cat.name) + `
    <div class="sh-b">
      <div class="og"><div class="ogt">İçindekiler</div><textarea class="tx ta" data-bind="t" rows="6" placeholder="Örn. Malfy Gin 4 cl, Aperol 2 cl, Reyhan, Lime">${esc(SH.t)}</textarea></div>
      <div class="og"><div class="ogt">Kalori <span>· isteğe bağlı</span></div><input class="tx" data-bind="kc" value="${esc(SH.kc)}" placeholder="Örn. 800" inputmode="numeric" autocomplete="off"></div>
      ${it.icDef ? `<div class="nhint">Menüdeki asıl bilgi: ${esc([it.icDef.t, it.icDef.kc ? it.icDef.kc + ' kcal' : ''].filter(Boolean).join(' · ')) || '—'}</div>` : ''}
    </div>
    <div class="sh-f">${icOv[SH.key] ? `<button class="btn danger" data-act="icReset">Menüdekine dön</button>` : ''}<button class="btn primary big grow" data-act="icSave">Kaydet</button></div>`;
  };

  SHEETS.tables = () => shHead('Başka masa', 'Seni çağıran masaya dokun') +
    `<div class="sh-b">${areaGrid(t => tableBtn(t, openMap()))}</div>`;

  SHEETS.move = function () {
    const o = findOrder(SH.oid), openT = {};
    orders.forEach(x => { if (!x.closedAt && x.id !== o.id) openT[x.t] = x; });
    return shHead('Masa taşı / birleştir', `#${o.no} · şu an ${tName(o.t)}`) + `
    <div class="sh-b">
      <div class="nhint">Yeni masayı seç. Altı çizili masalarda açık sipariş var; onlardan birini seçersen iki sipariş birleştirilir.</div>
      ${AREAS.map(a => `<section class="area"><h3>${a.n}</h3><div class="tgrid">${Array.from({ length: a.c }, (_, i) => {
        const c = a.k + (i + 1), cur = c === o.t;
        return `<button class="tb ${openT[c] ? 'open' : ''} ${cur ? 'cur' : ''}" ${cur ? 'disabled' : ''} data-act="moveTo" data-t="${c}"><b>${c}</b></button>`;
      }).join('')}</div></section>`).join('')}
    </div>`;
  };

  SHEETS.settings = () => shHead('Menü', 'Newcastle Sipariş Kayıt · sürüm ' + VERSION) + `
    <div class="sh-b">
      <button class="mrow" data-act="notesPage">${I.pen}<div><b>Hazır notlar</b><small>Yemek ${notes.food.length} · İçecek ${notes.drink.length} — ekle / sil</small></div></button>
      <button class="mrow" data-act="oosPage"><span class="mi">🚫</span><div><b>Olmayan ürünler</b><small>${Object.keys(oos).length || Object.keys(stok).length
        ? `${Object.keys(oos).length} bugün yok · ${Object.keys(stok).length} stokta yok` : 'Biten ürünü bugün için ya da gelene kadar işaretle'}</small></div></button>
      <button class="mrow" data-act="icPage">${I.info}<div><b>İçindekiler</b><small>Ürün içeriklerini, cl ve kalori bilgisini düzenle</small></div></button>
      <button class="mrow" data-act="theme">${I.moon}<div class="grow"><b>Koyu tema</b><small>Karanlık ortamda gözü yormaz</small></div><span class="state">${ui.theme === 'dark' ? 'Açık' : 'Kapalı'}</span></button>
      <button class="mrow" data-act="archive">${I.box}<div><b>Arşiv</b><small>Gün sonunda kaldırılan kayıtlar · son ${ARC_DAYS} gün</small></div></button>
      <button class="mrow" data-act="shareAll">${I.share}<div><b>Tüm kayıtları paylaş</b><small>WhatsApp, e-posta vb. ile yedek gönder</small></div></button>
      <button class="mrow dangerrow" data-act="wipeStart">${I.trash}<div><b>Gün sonu: kayıtları arşive kaldır</b><small>${orders.length} sipariş ana ekrandan kalkar, ${ARC_DAYS} gün arşivde durur</small></div></button>
    </div>`;

  // ---------- onay penceresi ----------
  let MOD = null;
  function ask(o) {
    return new Promise(res => {
      MOD = res;
      modalRoot.innerHTML = `<div class="backdrop" data-act="modalNo"></div><div class="modal" role="alertdialog">
        <div class="mt">${esc(o.title)}</div><div class="mx">${esc(o.text)}</div>
        <div class="mb"><button class="btn ghost" data-act="modalNo">${esc(o.cancel || 'Vazgeç')}</button><button class="btn ${o.danger ? 'primary' : 'okb'}" data-act="modalYes">${esc(o.ok || 'Tamam')}</button></div></div>`;
    });
  }
  function closeModal(v) { if (!MOD) return false; const r = MOD; MOD = null; modalRoot.innerHTML = ''; r(v); return true; }

  // ---------- bildirim ----------
  let tT, SNACK = null;
  function toast(msg, kind, ms) {
    const t = $('#toast'); t.textContent = msg; t.className = 'show ' + (kind || ''); SNACK = null;
    clearTimeout(tT); tT = setTimeout(() => { t.className = ''; }, ms || 2200);
  }
  // Geri alınabilir bildirim (örn. yanlışlıkla "bir tane daha")
  function snack(msg, label, fn) {
    const t = $('#toast');
    t.innerHTML = `<span>${esc(msg)}</span><button class="snackbtn" data-act="snackDo">${esc(label)}</button>`;
    t.className = 'show snack'; SNACK = fn;
    clearTimeout(tT); tT = setTimeout(() => { t.className = ''; SNACK = null; }, 5000);
  }

  // ---------- paylaşım ----------
  function orderText(o) {
    const L = ['NEWCASTLE · SİPARİŞ KAYDI', `#${o.no} · ${o.t} (${tName(o.t)})`, 'Kayıt: ' + full(o.at),
      'Teyit: ' + (isConfirmed(o) ? 'Müşteri onayladı ✓' : 'Teyit alınmamış ürün var'),
      'Durum: ' + (o.closedAt ? 'Masa kapatıldı ' + stamp(o.closedAt) : 'Açık'), '—————————————'];
    let prev = null;
    ropSorted(o.lines).forEach(({ l, p }) => {
      if (p.label !== prev) { L.push('[' + p.label + ']'); prev = p.label; }
      const aq = activeQ(l);
      L.push(`${aq > 0 ? aq : totalQ(l)}× ${l.n}${lineDetail(l) ? ' [' + lineDetail(l) + ']' : ''}${aq <= 0 ? ' (İPTAL)' : ''}`);
      if (lineNotes(l)) L.push('   Not: ' + lineNotes(l));
      if (l.from) L.push('   ' + l.from + ' siparişinden taşındı');
      if ((l.ad || []).length) L.push('   Bir tane daha: ' + l.ad.map(a => '+' + a.q + ' ' + hms(a.t)).join(', '));
    });
    if (o.ev.length > 1) { L.push('—————————————', 'Geçmiş:'); o.ev.forEach(e => L.push(stamp(e.t) + '  ' + e.x)); }
    return L.join('\n');
  }
  function shareText(t) {
    try { if (window.Android && Android.share) { Android.share(t); return; } } catch (e) { }
    if (navigator.share) { navigator.share({ text: t }).catch(() => { }); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(() => toast('Panoya kopyalandı'), () => { });
  }

  // ---------- eylemler ----------
  const ACT = {};
  ACT.back = () => back();
  // Masaya dokununca doğrudan ürün girişine gidilir: açık sipariş varsa ona eklenir, yoksa yeni sipariş açılır.
  ACT.table = el => {
    closeSheet();   // "Başka masa" penceresinden gelindiyse
    const t = el.dataset.t, o = openOrderOf(t);
    ui.mode = 'hizli';   // masaya girince önce hızlı butonlar
    if (o) go({ v: 'menu', t, d: 'add:' + o.id, oid: o.id }); else go({ v: 'menu', t, d: t });
  };
  // --- posta
  ACT.hv = el => { ui.hv = el.dataset.v; saveUi(); render(); };
  ACT.otherTable = () => { SH = { type: 'tables' }; drawSheet(true); };
  ACT.postaSec = () => { ui.pd = myPosta().slice(); go({ v: 'postaSec' }); };
  ACT.pToggle = el => {
    const t = el.dataset.t, i = ui.pd.indexOf(t);
    if (i >= 0) ui.pd.splice(i, 1); else ui.pd.push(t);
    buzz(8); render(true);
  };
  ACT.pClear = () => { ui.pd = []; render(true); };
  ACT.pOk = () => {
    ui.posta = ui.pd.slice(); ui.hv = ui.posta.length ? 'posta' : 'all'; saveUi();
    nav = [{ v: 'home' }]; render();
    toast(ui.posta.length ? 'Postan: ' + ui.posta.join(', ') : 'Posta kaldırıldı', 'ok');
  };

  // --- yeni müşteri: kapatılmamış eski siparişi kapat, aynı masaya yeni sipariş aç (taslak yeni siparişe taşınır)
  ACT.newCustomer = async () => {
    const o = findOrder(top().oid); if (!o) return;
    if (!(await ask({ title: 'Yeni müşteri mi?', text: `${o.t} masasındaki #${o.no} siparişi kapatılacak ve yeni sipariş açılacak. Eski kayıt silinmez.`, ok: 'Kapat ve yeni aç' }))) return;
    const now = Date.now(), dk = 'add:' + o.id;
    o.closedAt = now;
    o.ev.push({ t: now, x: 'Masa kapatıldı (yeni müşteri geldi)' });
    if (hasDraft(dk)) getDraft(o.t).lines.push(...drafts[dk].lines);
    delete drafts[dk];
    saveOrders(); saveDrafts();
    nav = nav.filter(x => !(x.v === 'order' && x.id === o.id)).map(x => {
      if (x.oid !== o.id) return x;
      const y = Object.assign({}, x, { d: o.t }); delete y.oid; return y;
    });
    ui.mode = 'hizli';
    render(); toast(`#${o.no} kapatıldı · ${o.t} yeni sipariş`, 'ok');
  };

  ACT.tableHist = el => {
    const prev = nav[nav.length - 2];
    if (prev && prev.v === 'table' && prev.t === el.dataset.t) back(); else go({ v: 'table', t: el.dataset.t });
  };
  ACT.records = () => go({ v: 'records' });
  ACT.order = el => go({ v: 'order', id: el.dataset.id });
  ACT.settings = () => { SH = { type: 'settings' }; drawSheet(true); };

  function showCat(id) {
    ui.cat = id; ui.mode = 'menu';
    ui.gc = ui.gc || {}; ui.gc[curGroup().id] = id; saveUi();
    const q = $('#q'); if (q) q.value = '';
    syncTabs();
    $('#catrow').innerHTML = catChips(); scrollChip();
    renderItems(); $('#items').scrollTop = 0;
  }
  function syncTabs() {
    const hz = ui.mode === 'hizli';
    document.querySelectorAll('.grps .grp').forEach(b => b.classList.toggle('on', hz ? b.dataset.act === 'hizli' : b.dataset.g === curGroup().id));
    const nv = $('.cats'); if (nv) nv.classList.toggle('hz', hz);
  }
  ACT.hizli = () => {
    ui.mode = 'hizli';
    const q = $('#q'); if (q) q.value = '';
    syncTabs(); renderItems(); $('#items').scrollTop = 0;
  };
  function blockOos(it) {
    if (!it || !isOos(it.key)) return false;
    toast(it.n + ' ' + oosLabel(it.key), 'err'); buzz(40); return true;
  }
  ACT.sz = el => {
    const it = ITEMS[el.dataset.k]; if (!it || blockOos(it)) return;
    const gi = inlineGroup(it), s = it.og.map((x, i) => i === gi ? +el.dataset.c : -1);
    addLine(getDraft(top().d), mkLine(it, s, [], '', 1));
    saveDrafts(); buzz(); renderItems(it.key); renderBar();
  };
  ACT.qadd = el => {
    const e = QL[+el.dataset.i]; if (!e || blockOos(e.it)) return;
    if (e.it.og.some((g, i) => g.r && e.s[i] < 0)) { openItem(e.it.key, null, e.s); return; }
    addLine(getDraft(top().d), mkLine(e.it, e.s, [], '', 1));
    saveDrafts(); buzz(); renderItems(); renderBar();
  };
  function scrollChip() {
    const on = $('#catrow .chip.on');
    if (on) on.parentNode.scrollLeft = on.offsetLeft - 60;
  }
  ACT.cat = el => showCat(el.dataset.c);
  ACT.grp = el => {
    const g = (window.MENU || []).find(x => x.id === el.dataset.g);
    const keep = ui.gc && ui.gc[g.id];
    showCat(g.cats.some(c => c.id === keep) ? keep : g.cats[0].id);
  };
  ACT.clearQ = () => { const q = $('#q'); q.value = ''; renderItems(); };
  ACT.tap = el => {
    const it = ITEMS[el.dataset.k]; if (!it || blockOos(it)) return;
    if (it.req) { openItem(it.key); return; }
    addLine(getDraft(top().d), mkLine(it, it.og.map(() => -1), [], '', 1));
    saveDrafts(); buzz(); renderItems(it.key); renderBar();
  };
  ACT.minus = el => {
    const d = getDraft(top().d), k = el.dataset.k;
    let idx = -1;
    for (let i = d.lines.length - 1; i >= 0; i--) {
      const l = d.lines[i];
      if (l.key === k && !l.nt.length && !l.tx && !(l.sel || []).some(s => s >= 0)) { idx = i; break; }
    }
    if (idx < 0) for (let i = d.lines.length - 1; i >= 0; i--) if (d.lines[i].key === k) { idx = i; break; }
    if (idx < 0) return;
    if (--d.lines[idx].q <= 0) d.lines.splice(idx, 1);
    saveDrafts(); buzz(8); renderItems(); renderBar();
  };
  ACT.note = el => openItem(el.dataset.k);
  ACT.freeItem = () => openItem('custom');
  ACT.review = () => { const v = top(); go({ v: 'review', t: v.t, d: v.d, oid: v.oid }); };
  ACT.editLine = el => openItem(null, el.dataset.u);

  ACT.closeSheet = () => closeSheet();
  ACT.opt = el => {
    const it = ITEMS[SH.key], g = +el.dataset.g, c = +el.dataset.c;
    SH.sel[g] = (SH.sel[g] === c && !it.og[g].r) ? -1 : c;
    SH.miss = -1; buzz(6); drawSheet();
  };
  ACT.kind = el => { SH.kind = el.dataset.k; drawSheet(); };
  ACT.sq = el => { SH.q = Math.max(1, Math.min(99, SH.q + (+el.dataset.d))); drawSheet(); };
  ACT.nchip = el => {
    const n = el.dataset.n, i = SH.nt.indexOf(n);
    if (i >= 0) SH.nt.splice(i, 1); else SH.nt.push(n);
    buzz(6); drawSheet();
  };
  ACT.saveNote = () => {
    const t = (SH.tx || '').trim();
    if (!t) { toast('Önce notu yazın'); return; }
    const nk = noteKind(SH.custom ? SH.kind : ITEMS[SH.key].k);
    if (notes[nk].indexOf(t) < 0) { notes[nk].push(t); store(K.notes, notes); }
    if (SH.nt.indexOf(t) < 0) SH.nt.push(t);
    SH.tx = ''; buzz(); drawSheet(); toast('⭐ Hazır notlara eklendi');
  };
  ACT.pinToggle = () => {
    const sg = comboSig(SH.key, SH.sel), i = pins.findIndex(p => comboSig(p.k, p.s) === sg);
    if (i >= 0) pins.splice(i, 1); else pins.unshift({ k: SH.key, s: SH.sel.slice() });
    store(K.pin, pins); drawSheet();
    toast(i >= 0 ? 'Hızlı butonlardan kaldırıldı' : '⭐ Hızlı butonlara sabitlendi');
    if (top().v === 'menu') renderItems();
  };
  ACT.avail = el => {
    const it = ITEMS[SH.key];
    setAvail(it.key, el.dataset.ty); saveOos(); drawSheet();
    toast(isOos(it.key) ? it.n + ' · ' + oosLabel(it.key) : it.n + ' tekrar var');
    if (top().v === 'menu') renderItems();
  };
  ACT.oosPage = () => { closeSheet(); go({ v: 'oos' }); };
  ACT.oosSet = el => {
    const k = el.dataset.k, ty = el.dataset.ty;
    setAvail(k, oosType(k) === ty ? '' : ty);
    saveOos(); buzz(); renderOos();
  };
  ACT.oosAll = el => {
    const ws = norm(ui.oq).split(' ');
    Object.keys(ITEMS).forEach(k => { if (!isOos(k) && ws.every(w => ITEMS[k].idx.indexOf(w) >= 0)) setAvail(k, el.dataset.ty); });
    saveOos(); buzz(); renderOos();
  };
  ACT.oosClear = async el => {
    const ty = el.dataset.ty, map = ty === 'stok' ? stok : oos;
    if (!(await ask({ title: 'Hepsi tekrar var olsun mu?', text: (ty === 'stok' ? 'Stokta yok' : 'Bugün yok') + ' işaretlerinin hepsi kaldırılacak.', ok: 'Hepsi var' }))) return;
    for (const k in map) delete map[k];
    saveOos(); renderOos();
  };
  ACT.clearOq = () => { ui.oq = ''; $('#oq').value = ''; $('.searchbar').classList.remove('on'); renderOos(); };
  ACT.icToggle = () => { SH.icOpen = !SH.icOpen; drawSheet(); };
  ACT.icPage = () => { closeSheet(); go({ v: 'icList' }); };
  ACT.icOpen = el => {
    const k = el.dataset.k, ic = icOv[k] || ITEMS[k].icDef || {};
    SH = { type: 'icEdit', key: k, t: ic.t || '', kc: ic.kc || '' };
    drawSheet(true);
  };
  ACT.icSave = () => {
    icOv[SH.key] = { t: (SH.t || '').trim(), kc: (SH.kc || '').trim() };
    store(K.ic, icOv); closeSheet(); renderIcList(); toast('İçindekiler kaydedildi', 'ok');
  };
  ACT.icReset = () => {
    delete icOv[SH.key]; store(K.ic, icOv); closeSheet(); renderIcList(); toast('Menüdeki bilgiye dönüldü');
  };
  ACT.clearIcq = () => { ui.icq = ''; $('#icq').value = ''; $('.searchbar').classList.remove('on'); renderIcList(); };
  ACT.notesPage = () => { closeSheet(); go({ v: 'notes' }); };
  ACT.noteAdd = el => {
    const k = el.dataset.k, inp = $('#nn-' + k), t = inp.value.trim();
    if (!t) { inp.focus(); return; }
    if (notes[k].indexOf(t) < 0) { notes[k].push(t); store(K.notes, notes); }
    render(true); buzz();
    const again = $('#nn-' + k); if (again) again.focus();
  };
  ACT.noteDel = el => {
    const k = el.dataset.k, i = +el.dataset.i;
    notes[k].splice(i, 1); store(K.notes, notes); render(true);
  };
  ACT.sheetDel = () => {
    const d = getDraft(top().d);
    d.lines = d.lines.filter(l => l.u !== SH.u);
    saveDrafts(); closeSheet(); refresh();
  };
  ACT.sheetOk = () => {
    const d = getDraft(top().d), tx = (SH.tx || '').trim();
    let line;
    if (SH.custom) {
      const name = (SH.name || '').trim();
      if (!name) { SH.miss = 'name'; drawSheet(); toast('Ürün adını yazın'); buzz(40); return; }
      line = { u: uid(), key: 'custom:' + norm(name), n: name, tag: 'Menü dışı', k: SH.kind, o: [], sel: [], nt: SH.nt.slice(), tx, q: SH.q };
    } else {
      const it = ITEMS[SH.key], miss = it.og.findIndex((g, i) => g.r && SH.sel[i] < 0);
      if (blockOos(it)) return;
      if (miss >= 0) {
        SH.miss = miss; drawSheet(); buzz(40);
        const el = $(`.og[data-g="${miss}"]`, sheetRoot); if (el) el.scrollIntoView({ block: 'center' });
        toast(it.og[miss].t + ' seçin'); return;
      }
      line = mkLine(it, SH.sel, SH.nt.slice(), tx, SH.q);
    }
    if (SH.u) {
      const i = d.lines.findIndex(l => l.u === SH.u); line.u = SH.u;
      if (i >= 0) d.lines[i] = line; else d.lines.push(line);
    } else addLine(d, line);
    saveDrafts(); closeSheet(); buzz(); refresh(line.key);
  };

  ACT.discard = async () => {
    const v = top();
    if (!(await ask({ title: 'Taslak silinsin mi?', text: 'Bu siparişe eklenen ürünler silinecek. Kayıtlı siparişler etkilenmez.', ok: 'Taslağı sil', danger: true }))) return;
    getDraft(v.d).lines = []; saveDrafts();
    nav = v.oid ? nav.slice(0, -2) : [{ v: 'home' }];
    render(); toast('Taslak silindi');
  };

  ACT.save = el => {
    const cf = el.dataset.cf === '1', v = top(), d = getDraft(v.d);
    if (!d.lines.length) return;
    const now = Date.now();
    const lines = d.lines.map(l => Object.assign({}, l, { at: now, cf: cf ? now : null, cx: [] }));
    const desc = lines.map(l => l.q + '× ' + l.n).join(', ');
    let o, isNew = !v.oid;
    if (isNew) {
      seq++;
      o = { id: uid(), no: seq, t: v.t, at: now, closedAt: null, lines, ev: [{ t: now, x: 'Sipariş kaydedildi: ' + qtySum(lines) + ' ürün' + (cf ? ' — müşteri onayladı' : ' — teyit alınmadı') }] };
      orders.push(o);
    } else {
      o = findOrder(v.oid);
      o.lines = o.lines.concat(lines);
      o.ev.push({ t: now, x: 'Sonradan eklendi: ' + desc + (cf ? ' — müşteri onayladı' : ' — teyit alınmadı') });
    }
    if (!saveOrders()) {
      if (isNew) { orders.pop(); seq--; } else { o.lines.splice(-lines.length); o.ev.pop(); }
      return;
    }
    recordUse(lines);
    d.lines = []; saveDrafts(); buzz(30);
    toast(`✓ ${v.t} · #${o.no} kaydedildi · ${hms(now)}`, 'ok', 3200);
    // Sipariş kapanmaz: kayıttan sonra siparişin ekranı açık kalır, oradan ürün eklenmeye devam edilir.
    const base = nav.slice(0, -2), last = base[base.length - 1];
    if (!(last && last.v === 'order' && last.id === o.id)) base.push({ v: 'order', id: o.id });
    nav = base;
    render();
  };

  ACT.showOrder = el => {
    const prev = nav[nav.length - 2];
    if (prev && prev.v === 'order' && prev.id === el.dataset.id) back(); else go({ v: 'order', id: el.dataset.id });
  };
  ACT.closeOrder = async el => {
    const o = findOrder(el.dataset.id), dk = 'add:' + o.id;
    const pending = hasDraft(dk) ? ` Kaydedilmemiş ${qtySum(drafts[dk].lines)} ürünlük taslak da silinecek.` : '';
    if (!(await ask({ title: o.t + ' masası kapatılsın mı?', text: 'Hesap alındı / müşteri kalktı. Kayıt silinmez; masaya bir sonraki dokunuşta yeni sipariş açılır.' + pending, ok: 'Masayı kapat', danger: true }))) return;
    const now = Date.now();
    o.closedAt = now;
    o.ev.push({ t: now, x: 'Masa kapatıldı' });
    delete drafts[dk];
    saveOrders(); saveDrafts();
    nav = [{ v: 'home' }]; render(); toast(o.t + ' kapatıldı');
  };

  // Teyitli siparişte ürüne dokun = aynı üründen 1 adet daha (aynı seçenek ve notlarla), saatiyle kaydedilir.
  ACT.again = el => {
    const o = findOrder(el.dataset.id); if (!o || o.closedAt) return;
    const l = o.lines.find(x => x.u === el.dataset.u), now = Date.now();
    const ev = { t: now, x: `Bir tane daha: 1× ${l.n}${lineDetail(l) ? ' (' + lineDetail(l) + ')' : ''}` };
    l.ad = (l.ad || []).concat({ q: 1, t: now });
    o.ev.push(ev);
    saveOrders(); recordUse([{ key: l.key, sel: l.sel, q: 1 }]); buzz(20); render(true);
    snack(`+1 ${l.n} · ${hm(now)}`, 'Geri al', () => {
      l.ad = l.ad.filter(a => a.t !== now);
      o.ev = o.ev.filter(x => x !== ev);
      saveOrders(); if (top().v === 'order') render(true);
      toast('Geri alındı');
    });
  };
  ACT.snackDo = () => { const f = SNACK; SNACK = null; $('#toast').className = ''; if (f) f(); };
  ACT.appendOrder = el => { const o = findOrder(el.dataset.id); ui.mode = 'hizli'; go({ v: 'menu', t: o.t, d: 'add:' + o.id, oid: o.id }); };
  ACT.confirmOrder = async el => {
    const o = findOrder(el.dataset.id);
    if (!(await ask({ title: 'Müşteri teyidi', text: 'Siparişi müşteriye okudunuz ve onayladı mı?', ok: 'Evet, onayladı' }))) return;
    const now = Date.now(); let n = 0;
    o.lines.forEach(l => { if (!l.cf && activeQ(l) > 0) { l.cf = now; n++; } });
    o.ev.push({ t: now, x: 'Müşteri teyidi alındı (' + n + ' kalem)' });
    saveOrders(); render(true); toast('✓ Teyit kaydedildi', 'ok');
  };
  ACT.cancelLine = el => {
    const o = findOrder(el.dataset.id), l = o.lines.find(x => x.u === el.dataset.u), aq = activeQ(l);
    SH = { type: 'cancel', oid: o.id, u: l.u, q: aq, max: aq, r: '', tx: '', miss: false };
    drawSheet(true);
  };
  ACT.cq = el => { SH.q = Math.max(1, Math.min(SH.max, SH.q + (+el.dataset.d))); drawSheet(); };
  ACT.cr = el => { SH.r = el.dataset.r; SH.miss = false; drawSheet(); };
  ACT.cancelOk = () => {
    if (!SH.r) { SH.miss = true; drawSheet(); toast('İptal sebebini seçin'); buzz(40); return; }
    const o = findOrder(SH.oid), l = o.lines.find(x => x.u === SH.u), now = Date.now();
    const r = SH.r + ((SH.tx || '').trim() ? ': ' + SH.tx.trim() : '');
    l.cx = (l.cx || []).concat({ q: SH.q, t: now, r });
    o.ev.push({ t: now, x: `İptal: ${SH.q}× ${l.n}${lineDetail(l) ? ' (' + lineDetail(l) + ')' : ''} — ${r}` });
    saveOrders(); closeSheet(); render(true); toast('İptal kaydedildi');
  };
  ACT.shareOrder = el => {
    const o = el.dataset.b ? arcOrder(el.dataset.b, el.dataset.id) : findOrder(el.dataset.id);
    if (o) shareText(orderText(o));
  };

  // --- masa taşı / birleştir
  ACT.moveStart = el => { SH = { type: 'move', oid: el.dataset.id }; drawSheet(true); };
  ACT.moveTo = async el => {
    const o = findOrder(SH.oid), to = el.dataset.t, p = openOrderOf(to), from = o.t, now = Date.now();
    closeSheet();
    if (!p) {
      if (!(await ask({ title: `${from} → ${to}`, text: `#${o.no} siparişi ${tName(to)} masasına taşınsın mı?`, ok: 'Taşı' }))) return;
      o.t = to;
      o.ev.push({ t: now, x: `Masa taşındı: ${from} → ${to}` });
      saveOrders();
      nav = [{ v: 'home' }, { v: 'order', id: o.id }]; render(); toast(`${from} → ${to} taşındı`, 'ok');
      return;
    }
    if (!(await ask({ title: 'Siparişler birleştirilsin mi?', text: `${to} masasında açık sipariş #${p.no} var. ${from} masasındaki #${o.no} siparişinin ürünleri #${p.no} siparişine eklenecek ve ${from} kapatılacak. Kayıtlar silinmez.`, ok: 'Birleştir' }))) return;
    const moved = o.lines.filter(l => activeQ(l) > 0).map(l => Object.assign(JSON.parse(JSON.stringify(l)), { u: uid(), from: `#${o.no} · ${from}` }));
    p.lines = p.lines.concat(moved);
    p.ev.push({ t: now, x: `Birleştirildi: ${from} masasındaki #${o.no} siparişinden ${moved.length} kalem eklendi` });
    o.closedAt = now; o.mergedInto = p.id;
    o.ev.push({ t: now, x: `${to} masasındaki #${p.no} siparişiyle birleştirildi; ${from} kapatıldı` });
    const dk = 'add:' + o.id;
    if (hasDraft(dk)) getDraft('add:' + p.id).lines.push(...drafts[dk].lines);
    delete drafts[dk];
    saveOrders(); saveDrafts();
    nav = [{ v: 'home' }, { v: 'order', id: p.id }]; render(); toast(`#${o.no} → #${p.no} birleştirildi`, 'ok');
  };

  // --- tema ve arşiv
  ACT.theme = () => { ui.theme = ui.theme === 'dark' ? 'light' : 'dark'; saveUi(); applyTheme(); drawSheet(); };
  ACT.archive = () => { closeSheet(); arcCache = null; go({ v: 'archive' }); };
  ACT.arcDay = el => { ui.aq = ''; go({ v: 'arcDay', b: el.dataset.b }); };
  ACT.arcOrder = el => go({ v: 'order', id: el.dataset.id, arc: el.dataset.b });
  ACT.clearAq = () => { ui.aq = ''; $('#aq').value = ''; $('.searchbar').classList.remove('on'); renderArcDay(); };
  ACT.shareAll = () => {
    if (!orders.length) { toast('Paylaşılacak kayıt yok'); return; }
    shareText(orders.slice().sort((a, b) => a.at - b.at).map(orderText).join('\n\n'));
  };
  // Gün sonu: kayıtlar silinmez, arşive kaldırılır (30 gün). Arşive yazılamazsa hiçbir şey silinmez.
  ACT.wipeStart = async () => {
    closeSheet();
    const n = orders.length;
    if (!(await ask({ title: 'Gün sonu', text: n ? `${n} sipariş arşive kaldırılacak ve ana ekran temizlenecek. Kayıtlar ${ARC_DAYS} gün boyunca ⋮ → Arşiv'de durur. Sipariş numaraları #1'den başlar.` : 'Kayıtlı sipariş yok. Taslaklar temizlenecek ve sipariş numaraları #1\'den başlayacak.', ok: n ? 'Arşive kaldır' : 'Temizle', danger: true }))) return;
    if (n) {
      const ats = orders.map(o => o.at);
      try { await ARC.put({ id: uid(), at: Date.now(), from: Math.min(...ats), to: Math.max(...ats), orders: JSON.parse(JSON.stringify(orders)) }); }
      catch (e) { toast('⚠ Arşive yazılamadı; kayıtlar silinmedi.', 'err', 5000); return; }
    }
    orders = []; drafts = {}; seq = 0; arcCache = null;
    for (const k in oos) delete oos[k];   // "bugün yok" yeni güne taşınmaz; "stokta yok" kalır
    saveOrders(); saveDrafts(); saveOos();
    nav = [{ v: 'home' }]; render(); toast(n ? `${n} sipariş arşive kaldırıldı` : 'Temizlendi', 'ok');
  };
  ACT.ra = el => {
    ui.ra = el.dataset.a;
    document.querySelectorAll('.catrow.pad .chip').forEach(c => c.classList.toggle('on', c.dataset.a === ui.ra));
    renderRecords();
  };
  ACT.clearRq = () => { ui.rq = ''; $('#rq').value = ''; $('.searchbar').classList.remove('on'); renderRecords(); };
  ACT.modalYes = () => closeModal(true);
  ACT.modalNo = () => closeModal(false);

  // ---------- olay dinleyiciler ----------
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const fn = ACT[el.dataset.act];
    if (fn) { e.preventDefault(); fn(el, e); }
  });
  document.addEventListener('input', e => {
    const t = e.target;
    if (t.dataset.bind && SH) SH[t.dataset.bind] = t.value;
    else if (t.id === 'q') renderItems();
    else if (t.id === 'rq') { ui.rq = t.value; $('.searchbar').classList.toggle('on', !!t.value); renderRecords(); }
    else if (t.id === 'oq') { ui.oq = t.value; $('.searchbar').classList.toggle('on', !!t.value); renderOos(); }
    else if (t.id === 'aq') { ui.aq = t.value; $('.searchbar').classList.toggle('on', !!t.value); renderArcDay(); }
    else if (t.id === 'icq') { ui.icq = t.value; $('.searchbar').classList.toggle('on', !!t.value); renderIcList(); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.classList.contains('nadd')) { e.preventDefault(); ACT.noteAdd(e.target); return; }
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') e.target.blur();
    if (e.key === 'Escape') back();
  });
  setInterval(() => { const c = $('#clock'); if (c) c.textContent = hm(Date.now()); }, 5000);

  // iPhone / web: internetsiz çalışma (Android APK'da gerekmez) ve kayıtların tarayıcı tarafından silinmemesi
  if ('serviceWorker' in navigator && location.hostname !== 'appassets.androidplatform.net') {
    navigator.serviceWorker.register('sw.js').catch(() => { });
  }
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { }

  render();
})();
