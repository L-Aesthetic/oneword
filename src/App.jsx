'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as PIXI from 'pixi.js'
import { Link } from 'react-router-dom'
import SiteFooter from './components/SiteFooter.jsx'


/* =========================
   Config
   ========================= */
const GOLD_N = 0xFFD866
const BLACK_N = 0x000000
const MAX_NODES_GLOBAL = 220 // pick 150–250; 220 is a nice sweet spot
// Show up to this many at once (pick your target 150–250)
const MAX_VISIBLE = 150;
// rotate the visible window so everything gets screen time
const ROTATE_MS = 100000; // every 100s slide the window
const PADDING = 4
const SAFE_PAD = 2
const ORBIT_MIN = 4
const ORBIT_MAX = 16
const ANCHOR_STORE_KEY = 'oneword:anchors:v13'
const Y_BIAS_FRAC = -0.02
const GOLD_MS = 5000;       // 5s gold
const WANDER_MS = 30000;    // 30s free roam after gold
const SPOTLIGHT_MS = GOLD_MS + WANDER_MS; // 35s total spotlight before merge-on-contact
// New: dynamic collision padding ~8% of font size (min 2px)
const COLLISION_PAD_FRAC = 0.08;
const COLLISION_PAD_MIN  = 2;
// ===== merge timing =====
const ASSIMILATE_MS  = 900;    // ~0.9s fade/scale while drifting into concept
const padForSize = (size) => Math.max(COLLISION_PAD_MIN, Math.round(size * COLLISION_PAD_FRAC));
/* ---------- Text normalization & profanity ---------- */
const DELEET = Object.entries({
  '0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','8':'b','$':'s','@':'a','!':'i'
});
function normalizeForChecks(s) {
  if (!s) return '';
  let t = (s.normalize?.('NFKC') || s).toLowerCase(); // ← normalize confusables
  for (const [k,v] of DELEET) t = t.split(k).join(v);
  t = t.replace(/[^a-z0-9]+/g, '');
  t = t.replace(/(.)\1{2,}/g, '$1$1'); // collapse runs
  return t;
}

const PROFANE_STEMS = [
  'fuck','shit','bitch','asshole','dick','cunt','bastard','slag','slut','whore',
  'prick','wank','piss','pussy','twat','fag','nigg','chink','spic','kike'
];
function containsProfanity(raw) {
  const t = normalizeForChecks(raw);
  if (!t) return false;
  for (const stem of PROFANE_STEMS) if (t.includes(stem)) return true;
  return false;
}

function capsForZoom(zoom, isMobile) {
  const cap =
    zoom === 'local'   ? (isMobile ? 80  : 120) :
    zoom === 'region'  ? (isMobile ? 140 : 200) :
    zoom === 'country' ? (isMobile ? 180 : 220) :
                         (isMobile ? 200 : 220); // “global”
  return Math.min(cap, MAX_NODES_GLOBAL);
}

function scaleForZoom(zoom) {
  if (zoom === 'local')   return 2.25
  if (zoom === 'region')  return 2.00
  if (zoom === 'country') return 1.65
  return 1
}
/* =========================
   Seed helpers (ensure ~200 words)
   ========================= */
const SEED_COUNT = 200

const SEED_BANK = [
  { word:'love', translated:'love', lang:'en', sentiment:'love' },
  { word:'hope', translated:'hope', lang:'en', sentiment:'hope' },
  { word:'esperanza', translated:'hope', lang:'es', sentiment:'hope' },
  { word:'힘', translated:'strength', lang:'ko', sentiment:'strength' },
  { word:'قوة', translated:'strength', lang:'ar', sentiment:'strength' },
  { word:'light', translated:'light', lang:'en', sentiment:'other' },
  { word:'빛', translated:'light', lang:'ko', sentiment:'other' },
  { word:'归来', translated:'return', lang:'zh', sentiment:'other' },
  { word:'amanecer', translated:'dawn', lang:'es', sentiment:'other' },
  { word:'memoria', translated:'memory', lang:'it', sentiment:'other' },
  { word:'libre', translated:'free', lang:'fr', sentiment:'other' },
  { word:'calma', translated:'calm', lang:'pt', sentiment:'calm' },
  { word:'joy', translated:'joy', lang:'en', sentiment:'joy' },
  { word:'felicidad', translated:'happiness', lang:'es', sentiment:'joy' },
  { word:'happy', translated:'happy', lang:'en', sentiment:'joy' },
  { word:'tired', translated:'tired', lang:'en', sentiment:'sadness' },
  { word:'疲れ', translated:'tired', lang:'ja', sentiment:'sadness' },
  { word:'sad', translated:'sad', lang:'en', sentiment:'sadness' },
  { word:'espoir', translated:'hope', lang:'fr', sentiment:'hope' },
  { word:'paz', translated:'peace', lang:'es', sentiment:'calm' },
  { word:'amour', translated:'love', lang:'fr', sentiment:'love' },
  { word:'amor', translated:'love', lang:'es', sentiment:'love' },
  { word:'любовь', translated:'love', lang:'ru', sentiment:'love' },
  { word:'сила', translated:'strength', lang:'ru', sentiment:'strength' },
  { word:'luce', translated:'light', lang:'it', sentiment:'other' },
  { word:'svetlo', translated:'light', lang:'cs', sentiment:'other' },
  { word:'和平', translated:'peace', lang:'zh', sentiment:'calm' },
  { word:'tranquilo', translated:'calm', lang:'es', sentiment:'calm' },
  { word:'forza', translated:'strength', lang:'it', sentiment:'strength' },
  { word:'frei', translated:'free', lang:'de', sentiment:'other' },
  // (sampling is with replacement, so this list doesn’t need to be huge)
]

function durationForRange(range) {
  return range === 'today' ? 24*3600*1000
       : range === 'week'  ? 7*24*3600*1000
       :                     30*24*3600*1000
}

function seedIfSparse(list, durMs, sentiment) {
  const out = list.slice()
  const pool = SEED_BANK.filter(b => sentiment === 'all' || b.sentiment === sentiment)
  if (!pool.length) return out
  while (out.length < SEED_COUNT) {
    const b = pool[(Math.random() * pool.length) | 0]
    out.push({
      id: `seed-${out.length}-${Math.random().toString(36).slice(2,7)}`,
      word: b.word,
      translated: b.translated,
      lang: b.lang,
      ts: Date.now() - Math.floor(Math.random() * durMs),
      userRegion: 'SEED',
      country: 'UNK',
      gh3: null, gh4: null,
      sentiment: b.sentiment
    })
  }
  return out
}

/* =========================
   Pixi helpers
   ========================= */
function isPixiV8() { return PIXI.Application && PIXI.Application.prototype && 'init' in PIXI.Application.prototype }
function makeStyle(opts) { try { return new PIXI.TextStyle(opts) } catch { return opts } }
function makeText(text, styleObj) {
  try { return new PIXI.Text({ text, style: makeStyle(styleObj) }) }
  catch { return new PIXI.Text(text, makeStyle(styleObj)) }
}

/* =========================
   API base (dev + prod)
   ========================= */
const API_BASE =
  (typeof window !== 'undefined' && window.__API_BASE__) ||
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ||
  '';

function joinApi(path) {
  if (!API_BASE) return path; // dev/proxy mode: same origin
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

/* =========================
   API helpers
   ========================= */
async function fetchJSON(path, opts = {}) {
  const url = joinApi(path);
  const res = await fetch(url, { ...opts, cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
async function apiSubmitWord(word, geo, cid) {
  const body = { word, cid };
  if (geo?.lat && geo?.lng) { body.lat = geo.lat; body.lng = geo.lng; }
  const res = await fetch(joinApi('/api/submitWord'), {
    method:'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error || `HTTP ${res.status}`);
    err.status = res.status;
    if (data?.retryAt) err.retryAt = data.retryAt;
    throw err;
  }
  return data;
}

async function apiFetchWindow({ zoom='global', range='week', sentiment='all', geo } = {}) {
  const p = new URLSearchParams({ zoom, range, sentiment });
  if (geo?.lat && geo?.lng) { p.set('lat', String(geo.lat)); p.set('lng', String(geo.lng)); }
  return fetchJSON(`/api/window?${p.toString()}`);
}

/* =========================
   Concept + sizing
   ========================= */
const STOP_SUFFIX = ['ful','ing','ed','s','ly','ness','ment','tion','ity']
function normalizeConcept(word, translated) {
  const base = (translated || word || '').toLowerCase()
  if (/^[a-z]+$/.test(base)) {
    for (const suf of STOP_SUFFIX) {
      if (base.endsWith(suf) && base.length - suf.length >= 3) return base.slice(0, -suf.length)
    }
  }
  return base
}
function recencyWeight(ts) {
  const ageH = (Date.now() - ts) / 3_600_000
  if (ageH <= 0.5) return 1.0
  if (ageH <= 6) return 0.75
  if (ageH <= 24) return 0.45
  return 0.25
}
function logSize(score, isMobile) {
  const base = isMobile ? 14 : 18
  const scale = isMobile ? 12 : 18
  const val = base + scale * Math.log10((score || 0) + 1)
  return Math.max(isMobile ? 12 : 14, Math.min(isMobile ? 46 : 72, Math.round(val)))
}

/* =========================
   Text measure (LRU-capped)
   ========================= */
const measureCache = new Map();
const MEASURE_MAX = 5000;
function memoSet(k, v) {
  measureCache.set(k, v);
  if (measureCache.size > MEASURE_MAX) {
    const drop = Math.floor(MEASURE_MAX * 0.1);
    const it = measureCache.keys();
    for (let i = 0; i < drop; i++) {
      const { value, done } = it.next();
      if (done) break;
      measureCache.delete(value);
    }
  }
}
const canvasCtx = (typeof document !== 'undefined') ? document.createElement('canvas').getContext('2d') : null;

function measureText(text, size) {
  const key = `${text}|${size}`;
  const cached = measureCache.get(key); if (cached) return cached;
  const fontFamily = 'Inter, Noto Sans, ui-sans-serif, system-ui, Arial, sans-serif';
  try {
    if (PIXI?.TextMetrics?.measureText) {
      const m = PIXI.TextMetrics.measureText(text, makeStyle({ fontFamily, fontSize: size }));
      const out = { w: Math.ceil(m?.width || 0), h: Math.ceil(m?.height || 0) };
      if (out.w && out.h) { memoSet(key, out); return out; }
    }
  } catch {}
  try {
    if (canvasCtx) {
      canvasCtx.font = `${size}px ${fontFamily}`;
      const out = { w: Math.ceil(canvasCtx.measureText(text).width || 0), h: Math.ceil(size * 1.35) };
      if (out.w) { memoSet(key, out); return out; }
    }
  } catch {}
  const out = { w: Math.max(24, Math.ceil(size * 0.58 * (text?.length || 1))), h: Math.ceil(size * 1.35) };
  memoSet(key, out); return out;
}


/* =========================
   Collision Helpers
   ========================= */
function rectsOverlap(a, b) {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
}

// size-aware circle radius (no undefined 'pad')
function radiusFromBox(w, h, size) {
  return 0.5 * Math.max(w, h) + padForSize(size);
}


// ---- spatial hash collision (fast, non-sticky) ----
function collideGrid(nodes, W, H, passes = 2) {
  const CELL = 96; // ~avg diameter; tweak for density
  const key = (ix, iy) => ix + '|' + iy;

  for (let pass = 0; pass < passes; pass++) {
    // build grid
    const grid = new Map();
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]; if (!n || n.destroyed || n._ignoreCollision) continue;
      const r = n._r;
      const minx = Math.floor((n.x - r) / CELL);
      const maxx = Math.floor((n.x + r) / CELL);
      const miny = Math.floor((n.y - r) / CELL);
      const maxy = Math.floor((n.y + r) / CELL);
      for (let ix = minx; ix <= maxx; ix++) {
        for (let iy = miny; iy <= maxy; iy++) {
          const k = key(ix, iy);
          (grid.get(k) || grid.set(k, []).get(k)).push(i);
        }
      }
    }

    // collide neighbors only
    const seen = new Set();
    const pairKey = (a,b) => a < b ? `${a}|${b}` : `${b}|${a}`;
    for (const idxs of grid.values()) {
      for (let a = 0; a < idxs.length; a++) {
        for (let b = a + 1; b < idxs.length; b++) {
          const ia = idxs[a], ib = idxs[b];
          const tag = pairKey(ia, ib);
          if (seen.has(tag)) continue; seen.add(tag);

          const A = nodes[ia], B = nodes[ib];
          if (!A || !B || A.destroyed || B.destroyed || A._ignoreCollision || B._ignoreCollision) continue;

          const dx = B.x - A.x, dy = B.y - A.y;
          const rMin = A._r + B._r;
          const d2 = dx*dx + dy*dy;
          if (d2 <= 0 || d2 >= rMin*rMin) continue;

          const d = Math.sqrt(d2) || 1;
          const nx = dx / d, ny = dy / d;
          const overlap = (rMin - d);
          const push = overlap * 0.5;

          // positional split
          A.x -= nx * push; A.y -= ny * push;
          B.x += nx * push; B.y += ny * push;

          // velocity separation (tiny bounce)
          const rvx = B._vx - A._vx;
          const rvy = B._vy - A._vy;
          const rel = rvx*nx + rvy*ny;
          if (rel < 0) {
            const e = 0.2;              // small restitution
            const j = -(1 + e) * rel * 0.5;
            A._vx -= j * nx; A._vy -= j * ny;
            B._vx += j * nx; B._vy += j * ny;
          }

          /* tiny tangential kick so pairs don't re-stick
          const tx = -ny, ty = nx;
          const kick = 0.02;
          A._vx -= tx * kick; A._vy -= ty * kick;
          B._vx += tx * kick; B._vy += ty * kick; */
        }
      }
    }

    // keep inside stage
    for (const n of nodes) {
      if (!n || n.destroyed) continue; // ok to keep bounds on merging nodes
      if (n.x < n._borderX) { n.x = n._borderX; n._vx = Math.abs(n._vx) * 0.95; }
      if (n.x > W - n._borderX) { n.x = W - n._borderX; n._vx = -Math.abs(n._vx) * 0.95; }
      if (n.y < n._borderY) { n.y = n._borderY; n._vy = Math.abs(n._vy) * 0.95; }
      if (n.y > H - n._borderY) { n.y = H - n._borderY; n._vy = -Math.abs(n._vy) * 0.95; }
    }
  }
}

// --- Nudge overlapping anchors apart (few passes, axis-aligned) ---
function resolveCollisions(items, W, H, passes = 18) {
  for (let p = 0; p < passes; p++) {
    let moved = false;
    for (let i = 0; i < items.length; i++) {
      const A = items[i];
      const padA = (A.pad ?? (PADDING + (A.amp || 0) + SAFE_PAD));
      const Aw = A.w + padA * 2;
      const Ah = A.h + padA * 2;

      for (let j = i + 1; j < items.length; j++) {
        const B = items[j];
        const padB = (B.pad ?? (PADDING + (B.amp || 0) + SAFE_PAD));
        const Bw = B.w + padB * 2;
        const Bh = B.h + padB * 2;

        const dx = B.ax - A.ax;
        const dy = B.ay - A.ay;

        const overlapX = (Aw + Bw) / 2 - Math.abs(dx);
        const overlapY = (Ah + Bh) / 2 - Math.abs(dy);

        if (overlapX > 0 && overlapY > 0) {
          if (overlapX < overlapY) {
            const push = overlapX / 2 + 0.5;
            const dir = Math.sign(dx) || (Math.random() < 0.5 ? 1 : -1);
            A.ax -= dir * push;  B.ax += dir * push;
          } else {
            const push = overlapY / 2 + 0.5;
            const dir = Math.sign(dy) || (Math.random() < 0.5 ? 1 : -1);
            A.ay -= dir * push;  B.ay += dir * push;
          }
          const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
          A.ax = clamp(A.ax, A.borderX, W - A.borderX);
          A.ay = clamp(A.ay, A.borderY, H - A.borderY);
          B.ax = clamp(B.ax, B.borderX, W - B.borderX);
          B.ay = clamp(B.ay, B.borderY, H - B.borderY);
          moved = true;
        }
      }
    }
    if (!moved) break;
  }
  return items;
}

/* =========================
   Emotion (client fallback) — exact word match (no substrings)
   ========================= */
function normalizeToken(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')                   // split accents
    .replace(/\p{Diacritic}/gu, '')     // strip accents
    .replace(/[^a-z\u00C0-\u024f\u0400-\u04FF\u0600-\u06FF\u4E00-\u9FFF]+/gu, ''); // keep letters across scripts
}

// High-confidence direct mappings (variations grouped)
const SENT_MAP = new Map([
  // love
  ['love','love'], ['loved','love'], ['loving','love'], ['lovely','love'], ['beloved','love'],
  ['adore','love'], ['adoration','love'], ['affection','love'], ['caring','love'], ['compassion','love'],

  // hope
  ['hope','hope'], ['hopeful','hope'], ['hoping','hope'], ['optimistic','hope'], ['optimism','hope'],
  ['faith','hope'], ['trust','hope'], ['esperanza','hope'], ['期待','hope'],

  // joy
  ['joy','joy'], ['joyful','joy'], ['happy','joy'], ['happiness','joy'], ['glad','joy'],
  ['delight','joy'], ['smile','joy'], ['bliss','joy'], ['grateful','joy'], ['gratitude','joy'],

  // sadness
  ['sad','sadness'], ['sadness','sadness'], ['down','sadness'], ['unhappy','sadness'],
  ['lonely','sadness'], ['blue','sadness'], ['cry','sadness'], ['sorrow','sadness'], ['grief','sadness'], ['tired','sadness'],

  // anger
  ['anger','anger'], ['angry','anger'], ['mad','anger'], ['furious','anger'],
  ['irritated','anger'], ['annoyed','anger'], ['resentment','anger'], ['hate','anger'], ['rage','anger'],

  // fear
  ['fear','fear'], ['afraid','fear'], ['scared','fear'], ['anxious','fear'], ['anxiety','fear'],
  ['worry','fear'], ['panic','fear'], ['nervous','fear'], ['terrified','fear'],

  // calm
  ['calm','calm'], ['peace','calm'], ['peaceful','calm'], ['serene','calm'],
  ['quiet','calm'], ['still','calm'], ['rest','calm'], ['chill','calm'], ['easy','calm'], ['ok','calm'], ['okay','calm'],

  // strength
  ['strength','strength'], ['strong','strength'], ['brave','strength'], ['bold','strength'],
  ['power','strength'], ['grit','strength'], ['steady','strength'], ['resilient','strength'],
  ['قوة','strength'], ['힘','strength'],

  // neutral-ish multi-lingual examples we’ve seen
  ['빛','other'], ['归来','other'], ['memoria','other'], ['amanecer','other'],
]);

// Add common non-EN words AFTER creation
[
  // love
  ['amor','love'], ['amour','love'], ['amare','love'], ['amo','love'],
  // joy
  ['alegria','joy'], ['feliz','joy'], ['felicidad','joy'], ['heureux','joy'],
  // sadness
  ['triste','sadness'], ['tristeza','sadness'], ['tristesse','sadness'],
  // calm / peace
  ['paz','calm'], ['calma','calm'], ['tranquilo','calm'], ['tranquille','calm'],
  // strength
  ['forza','strength'], ['força','strength'], ['fuerza','strength'],
].forEach(([k, v]) => SENT_MAP.set(k, v));


// Lower-confidence whole-word sets (exact match only; no substring includes)
const FALLBACK_SETS = {
  joy: new Set(['joy','joyful','happiness','grateful','gratitude','delight','smile','bliss','cheerful']),
  sadness: new Set(['sad','sadness','lonely','blue','cry','sorrow','grief','hurt','downcast','down']),
  anger: new Set(['anger','angry','mad','furious','irritated','annoyed','resentment','hate','wrath','rage']),
  fear: new Set(['fear','afraid','scared','anxious','anxiety','worry','panic','nervous','terrified']),
  calm: new Set(['calm','peace','peaceful','quiet','still','rest','serene','chill','easy','ok','okay']),
  strength: new Set(['strong','strength','brave','bold','power','grit','steady','resilient']),
  hope: new Set(['hope','hopeful','hoping','optimistic','optimism','faith','trust','esperanza','期待']),
  love: new Set(['love','loving','loved','lovely','beloved','adore','adoration','caring','compassion','tender','affection','fond']),
};
// very small English stemmer (for our use): strip common suffixes, normalize plurals
function englishStem(t) {
  if (!t) return t;
  // plurals like "parties" -> "party"
  if (t.endsWith('ies') && t.length > 4) t = t.slice(0, -3) + 'y';
  // common endings
  const SUF = ['fulness','fulness','fulness', 'fulness', 'fulness']; // guard; no-op
  const ENDINGS = ['fulness','fulness','ments','ments','ations','ation','ness','ment','tion','sion','ingly','ingly','ingly','edly','edly','edly','less','able','ible','ious','iest','iest','iest','iest','iest','iest','iest','iest','iest','iest','iest','iest','iest','iest','iest','iest','iest']; // we only need a few below; rest harmless
  // just the ones we actually rely on:
  const KEEP = ['ingly','edly','ful','ing','ed','ly','s','ness','ment','tion','ity'];
  for (const suf of KEEP) {
    if (t.endsWith(suf) && t.length - suf.length >= 3) { t = t.slice(0, -suf.length); break; }
  }
  return t;
}

// stems/prefixes that signal a bucket
const STEM_PREFIX = {
  joy:       ['joy','happi','delight','smil','cheer','glad','bliss','gratif','gratef','excit','proud'],
  sadness:   ['sad','sorrow','cry','tear','lonel','weary','down','blue','grief','hurt','disappoint','depress'],
  anger:     ['angr','mad','fury','irritat','annoy','resent','wrath','rage','hate','frustrat'],
  fear:      ['fear','worr','anx','scare','terrifi','nerv','stress','stres','panic'],
  calm:      ['calm','peace','seren','still','rest','quiet','tranquil','relax','chill','easy','ok','okay'],
  strength:  ['strong','streng','brav','bold','grit','power','resilien','steady','courage','confid','determin'],
  hope:      ['hope','optim','faith','trust','esperanza'],
  love:      ['love','ador','affect','caring','compass','belov','fond','tender','heart'],
};

function fallbackSentiment(word) {
  const t = normalizeToken(word);
  if (!t) return 'other';

  // exact, high-confidence
  if (SENT_MAP.has(t)) return SENT_MAP.get(t);

  // exact set membership
  for (const [label, set] of Object.entries(FALLBACK_SETS)) {
    if (set.has(t)) return label;
  }

  // stem/prefix heuristics (English)
  const stem = englishStem(t);
  for (const [label, prefixes] of Object.entries(STEM_PREFIX)) {
    for (const pre of prefixes) {
      if (stem.startsWith(pre)) return label;
    }
  }

  return 'other';
}

/* =========================
   Minimal UI
   ========================= */
function Segmented({ value, onChange, options }) {
  return (
    <div className="segmented" role="tablist" aria-label="Zoom">
      {options.map(opt => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={value === opt.value}
          className={`segmented__btn ${value === opt.value ? 'is-active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
function Pills({ value, onChange, options, ariaLabel, className }) {
  return (
    <div className={`pills ${className||''}`.trim()} role="toolbar" aria-label={ariaLabel}>
      {options.map(opt => (
        <button
          key={opt.value}
          className={`pill ${value === opt.value ? 'is-active' : ''}`}
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
          title={opt.title || opt.label}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
function LiveIndicator({ sseDown }) {
  return (
    <div className="live" aria-live="polite">
      <span className={`live__dot ${sseDown ? 'is-down' : 'is-up'}`} aria-hidden="true" />
      <span className="live__label">{sseDown ? 'Live: reconnecting' : 'Live SSE'}</span>
    </div>
  );
}
function GeoButton({ geo, onRequest, onClear }) {
  return (
    <div className="geo">
      {geo ? (
        <button type="button" className="geo__btn" onClick={onClear} title="Stop using your location">
          <span aria-hidden="true">📍</span> Using location • Clear
        </button>
      ) : (
        <button type="button" className="geo__btn" onClick={onRequest} title="Use my location for Local/Region/Country">
          <span aria-hidden="true">📍</span> Use my location
        </button>
      )}
    </div>
  );
}

/* =========================
   Client geohash
   ========================= */
const GH_BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz'
function geohashEncode(lat, lon, precision=4) {
  let idx = 0, bit = 0, even = true, hash = ''
  let latMin=-90, latMax=90, lonMin=-180, lonMax=180
  while (hash.length < precision) {
    if (even) {
      const lonMid = (lonMin + lonMax)/2
      if (lon > lonMid) { idx = idx*2+1; lonMin = lonMid }
      else { idx = idx*2; lonMax = lonMid }
    } else {
      const latMid = (latMin + latMax)/2
      if (lat > latMid) { idx = idx*2+1; latMin = latMid }
      else { idx = idx*2; latMax = latMid }
    }
    even = !even
    if (++bit === 5) { hash += GH_BASE32.charAt(idx); bit = 0; idx = 0 }
  }
  return hash
}

/* =========================
   App
   ========================= */
export default function App() {
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
const [submitted, setSubmitted] = useState(null)
const [goldUntil, setGoldUntil] = useState(0)

// one-a-day cooldown
const [nextAllowedAt, setNextAllowedAt] = useState(() => {
  const n = Number(localStorage.getItem('oneword:nextAllowedAt') || 0)
  return Number.isFinite(n) ? n : 0
})
// tick so the countdown updates
const [, forceTick] = useState(0)
useEffect(() => {
  const id = setInterval(() => forceTick(t => t + 1), 1000)
  return () => clearInterval(id)
}, [])
const now = Date.now()
const cooldownActive = now < nextAllowedAt
const msLeft = Math.max(0, nextAllowedAt - now)

  const [rawWords, setRawWords] = useState([])
  const [myWords, setMyWords] = useState([])
  const [loading, setLoading] = useState(false)

  const [zoom, setZoom] = useState('global')
  const [range, setRange] = useState('week')
  const [sentiment, setSentiment] = useState('all')
  const [scatterPulse, setScatterPulse] = useState(0);

// Kick a tiny pre-scatter whenever the emotion filter changes
useEffect(() => { setScatterPulse(p => p + 1); }, [sentiment]);

  const [sseDown, setSseDown] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [geo, setGeo] = useState(null)
  const [myGH4, setMyGH4] = useState(null)
  const [myGH3, setMyGH3] = useState(null)
    // per-tab client id + short-term memory of your own submits (to ignore SSE echoes)
  const clientIdRef = useRef(
    (crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) + '-' + Date.now()
  );
  const recentMineRef = useRef([]);  // ← THIS fixes “recentMineRef is not defined”

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        const g = { lat: latitude, lng: longitude }
        setGeo(g)
        setMyGH4(geohashEncode(latitude, longitude, 4))
        setMyGH3(geohashEncode(latitude, longitude, 3))
      },
      () => {},
      { maximumAge: 60_000, timeout: 8_000, enableHighAccuracy: false }
    )
  }, [])

  const isMobile = typeof window !== 'undefined'
    ? window.matchMedia('(max-width: 640px)').matches
    : false
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('oneword:mine') || '[]')
      if (Array.isArray(saved)) setMyWords(saved)
    } catch {}
  }, [])

  /* ===== Initial fetch + SSE ===== */
  useEffect(() => {
    let alive = true
    const seen = new Set()

    async function loadOnce() {
      setLoading(true)
      try {
        const rows = await apiFetchWindow({ zoom, range, sentiment, geo })
        if (!alive) return
        setRawWords(rows.map(r => ({ ...r, sentiment: r.sentiment || fallbackSentiment(r.translated || r.word) })))
        rows.forEach(r => seen.add(r.id))
      } catch (e) {
        setErrorMsg(e?.message || 'Could not load latest words.')
        setTimeout(() => setErrorMsg(''), 3000)
      } finally {
        if (alive) setLoading(false)
      }
    }
    loadOnce()

    let es;
    try { es = new EventSource(joinApi('/api/stream')); } catch {}
    let downTimer = null
    const armDown = () => { if (!downTimer) downTimer = setTimeout(() => setSseDown(true), 12000) }
    const disarmDown = () => { if (downTimer) { clearTimeout(downTimer); downTimer = null } setSseDown(false) }

    const allowByZoomBin = (msg) => {
      if (!msg?.payload) return false
      if (zoom === 'global') return true
      if (zoom === 'country') return true
      if (zoom === 'region') {
        if (!myGH3 || !msg.payload.gh3) return false
        return msg.payload.gh3 === myGH3
      }
      if (zoom === 'local') {
        if (!myGH4 || !msg.payload.gh4) return false
        return msg.payload.gh4 === myGH4
      }
      return true
    }

    if (es) {
      es.onopen = () => disarmDown()
      es.onmessage = (e) => {
        disarmDown()
        if (!alive) return
        try {
          const msg = JSON.parse(e.data)
          if (msg?.type !== 'word') return

// 1) Prefer cid (if backend echoes it)
if (msg?.cid && msg.cid === clientIdRef.current) return

// 2) Fallback: ignore if it matches my very recent submit (same word, ~2m, same local bin if available)
const r = msg.payload
const tWord = (r?.translated || r?.word || '').toLowerCase()
const isEcho = recentMineRef.current.some(m => {
  const closeInTime = Math.abs((r?.ts || 0) - m.ts) < 120000
  const sameWord = m.word === tWord
  const sameBin = (!!m.gh4 && !!r?.gh4 && m.gh4 === r.gh4) || (!!m.gh3 && !!r?.gh3 && m.gh3 === r.gh3)
  return closeInTime && sameWord && sameBin
})
if (isEcho) return

if (!allowByZoomBin(msg)) return

          r.sentiment = r.sentiment || fallbackSentiment(r.translated || r.word)
          r._arrival = Date.now(); // ← give everyone a 60s spotlight for this word
          if (sentiment !== 'all' && r.sentiment !== sentiment) return
          const dur =
            range === 'today' ? 24*60*60*1000 :
            range === 'week'  ? 7*24*60*60*1000 : // ✅ one week in ms
                                30*24*60*60*1000
          if ((Date.now() - (r.ts || 0)) > dur) return
          if (seen.has(r.id)) return
          seen.add(r.id)
          setRawWords(prev => [r, ...prev].slice(0, 3000))
        } catch {}
      }
      es.addEventListener?.('ping', () => disarmDown())
      es.onerror = () => armDown()
    } else {
      const poll = setInterval(loadOnce, 15000)
      downTimer = setTimeout(() => setSseDown(true), 1)
      return () => { clearInterval(poll) }
    }

    const hb = setInterval(async () => {
  try { await fetchJSON('/api/ping'); disarmDown(); } catch { armDown(); }
}, 10000);

    return () => { alive = false; es?.close?.(); disarmDown(); clearInterval(hb) }
  }, [zoom, range, sentiment, geo, myGH3, myGH4])

  const filteredByRange = useMemo(() => {
  const now = Date.now()
  const dur =
    range === 'today' ? 24*60*60*1000 :
    range === 'week'  ? 7*24*60*60*1000 :
                        30*24*60*60*1000
  const since = now - dur
  return rawWords.filter(r => (r.ts || 0) >= since)
}, [rawWords, range])

const filtered = useMemo(() => {
  if (sentiment === 'all') return filteredByRange
  return filteredByRange.filter(r => (r.sentiment || fallbackSentiment(r.translated || r.word)) === sentiment)
}, [filteredByRange, sentiment])

// NEW: fill up to ~200 items using seeds
const rangeDurMs = useMemo(() => durationForRange(range), [range])
const filled = useMemo(
  () => seedIfSparse(filtered, rangeDurMs, sentiment),
  [filtered, rangeDurMs, sentiment]
)

// filter *your* words by the current range + emotion
const myFiltered = useMemo(() => {
  const since = Date.now() - durationForRange(range)
  return myWords
    .filter(r => (r.ts || 0) >= since)
    .filter(r =>
      sentiment === 'all'
        ? true
        : (r.sentiment || fallbackSentiment(r.translated || r.word)) === sentiment
    )
}, [myWords, range, sentiment])

// now merge the filtered personal words with the server/seed list
const allWords = useMemo(() => [...myFiltered, ...filled], [myFiltered, filled])


const concepts = useMemo(() => {
  // 1) Build the base concept map (merged across languages)
  const map = new Map();
  for (const r of allWords) {
    const k = normalizeConcept(r.word, r.translated);
    const prev = map.get(k) || { key: k, count: 0, score: 0, examples: [], freshest: 0 };
    prev.count += 1;
    prev.score = prev.count;
    prev.freshest = Math.max(prev.freshest, r.ts || 0);
    if (prev.examples.length < 6) prev.examples.push(r);
    map.set(k, prev);
  }
  const base = [...map.values()].sort((a, b) => (b.count - a.count) || (b.freshest - a.freshest));

  // 2) Spotlight: show each newly-arrived submission as its own entry for 60s
  const now = Date.now();
  const fresh = [];
  for (const r of allWords) {
    if (r._arrival && (now - r._arrival) < SPOTLIGHT_MS) {
      const k = normalizeConcept(r.word, r.translated);
      const conceptCount = map.get(k)?.count || 1;
      const baseKey = normalizeConcept(r.word, r.translated);
fresh.push({
  key: `spotlight:${r.id}`,       // unique id for the spotlight bubble
  baseKey,                        // ← the *real* concept key
  count: conceptCount,
  score: conceptCount,
  freshest: r.ts || 0,
  examples: [r],
  spotlight: true,
});

    }
  }
  fresh.sort((a, b) => (b.freshest - a.freshest));

  // 3) Spotlight first, then the merged concepts
  return [...fresh, ...base];
}, [allWords, sentiment]);


const labels = useMemo(() => {
  const MAX = capsForZoom(zoom, isMobile);

// Build spotlight entries (real submission ids) and concept label entries (synthetic ids)
   let list = concepts.map(c => {
     if (c.spotlight) {
       const r = (c.examples.sort((a,b) => (b.ts || 0) - (a.ts || 0))[0]);
       // spotlight: keep the submission id so it's distinct from the concept label
       return { concept: c, show: r };
     }
     // concept label: synthetic stable id so it can co-exist with the spotlight
    return { concept: c, show: { id: `concept:${c.key}`, word: c.key, translated: c.key, ts: c.freshest } };
    });

  // Keep only the newest of your words per concept (avoid many old dupes)
  const latestMineByKey = new Map();
  for (const m of myFiltered) {
    const k = normalizeConcept(m.word, m.translated);
    const prev = latestMineByKey.get(k);
    if (!prev || (m.ts || 0) > (prev.ts || 0)) latestMineByKey.set(k, m);
  }
  const forced = [...latestMineByKey.values()]
    .slice(0, 40)
    .map(m => ({ concept: { key: normalizeConcept(m.word, m.translated), score: 1, count: 1, examples:[m], freshest: m.ts }, show: m }));

  // Only de-dupe by show.id so spotlight + concept both render
    const seenIds = new Set();
    const merged = [...forced, ...list].filter(x => {
    const id = x.show?.id;
    if (!id) return true;
    if (seenIds.has(id)) return false;
    seenIds.add(id);
    return true;
    });


  // keep only what the zoom can show; the rotating window (patch #2) handles fairness
  let out = merged.slice(0, MAX);

  // If a concept label is present, drop non-spotlight dupes for that key
  const presentConcepts = new Set(
    out.filter(x => String(x.show?.id).startsWith('concept:')).map(x => x.concept.key)
  );
  out = out.filter(x =>
    x.concept?.spotlight ||                      // keep spotlights
    String(x.show?.id).startsWith('concept:') || // keep the concept label
    !presentConcepts.has(x.concept.key)          // drop other duplicates
  );

  // keep the "gold" treatment if it isn't already visible
  if (submitted && Date.now() < goldUntil + 5000) {
    const exists = out.some(x => x.show?.id === submitted.id);
    if (!exists) {
      const conceptKey = normalizeConcept(submitted.word, submitted.translated);
      out = [
        { concept: { key: conceptKey, score: 1, count: 1, examples:[submitted], freshest: submitted.ts }, show: submitted },
        ...out
      ].slice(0, MAX);
    }
  }
// Guarantee: for every visible spotlight, include its *concept* label (not "spotlight:…")
const spotlights = out.filter(x => x.concept?.spotlight);
for (const s of spotlights) {
  const ex = (s.concept.examples && s.concept.examples[0]) || {};
  const baseKey = s.concept.baseKey || normalizeConcept(ex.word, ex.translated);
  const conceptId = `concept:${baseKey}`;

  if (!out.some(x => x.show?.id === conceptId)) {
    const base = concepts.find(c => !c.spotlight && c.key === baseKey)
               || { key: baseKey, freshest: ex.ts || Date.now(), count: 1, examples: [] };
    out.unshift({
      concept: base,
      show: { id: conceptId, word: baseKey, translated: baseKey, ts: base.freshest }
    });
    if (out.length > MAX) out.pop();
  }
}

  return out;
}, [concepts, submitted, goldUntil, zoom, isMobile, myFiltered]);


  useEffect(() => {
  // remove after verifying
  console.log('counts', {
    raw: rawWords.length,
    filled: filled.length,
    concepts: concepts.length,
    toDraw: labels.length
  })
}, [rawWords, filled, concepts, labels])

  const [breathTick, setBreathTick] = useState(0)
  useEffect(() => { const id = setInterval(() => setBreathTick(t => t + 1), 10000); return () => clearInterval(id) }, [])

async function onSubmit(e) {
  e.preventDefault();
  const w = (input || '').trim();

  // guard: single word, not submitting, not on cooldown
  if (!w || /\s/.test(w) || submitting || cooldownActive) return;

  // hard stop on submit
  if (containsProfanity(w)) {
    setErrorMsg('Please choose a gentler word ✨');
    setTimeout(() => setErrorMsg(''), 3000);
    return;
  }

  setSubmitting(true);

  // ✅ instant local lock so UI shows "tomorrow" immediately
  const localNext = Date.now() + 24 * 60 * 60 * 1000;
  setNextAllowedAt(localNext);
  try { localStorage.setItem('oneword:nextAllowedAt', String(localNext)); } catch {}

  // optimistic local item
  const temp = {
    id: `local-${Date.now()}`,
    word: w,
    translated: w,
    ts: Date.now(),
    sentiment: fallbackSentiment(w),
    gh3: myGH3, gh4: myGH4,
    _arrival: Date.now(),
  };
  // remember my submit for ~2 minutes to filter echo SSE if server lacks cid
  recentMineRef.current.push({ word: (w || '').toLowerCase(), ts: temp.ts, gh3: myGH3, gh4: myGH4 });
  recentMineRef.current = recentMineRef.current.filter(m => Date.now() - m.ts < 120000);

  setSubmitted(temp);
  setGoldUntil(Date.now() + GOLD_MS);
  setRawWords(prev => [temp, ...prev]);
  setMyWords(prev => {
    const next = [temp, ...prev].slice(0, 500);
    try { localStorage.setItem('oneword:mine', JSON.stringify(next)) } catch {}
    return next;
  });
  setInput('');

  try {
    const res = await apiSubmitWord(w, geo, clientIdRef.current);

    // server is authoritative about cooldown
    if (res?.nextAllowedAt) {
      setNextAllowedAt(res.nextAllowedAt);
      try { localStorage.setItem('oneword:nextAllowedAt', String(res.nextAllowedAt)) } catch {}
    }

    res.sentiment = res?.sentiment || fallbackSentiment(res.translated || res.word);

    // keep the same client id so the anchor & gold state persist (no jump/reload)
    res.id = temp.id;

    // swap optimistic with real (preserve spotlight timing)
    res._arrival = temp._arrival || Date.now();
    setRawWords(prev => [res, ...prev.filter(r => r.id !== temp.id)]);
    setMyWords(prev => {
      const next = [res, ...prev.filter(r => r.id !== temp.id)].slice(0, 500);
      try { localStorage.setItem('oneword:mine', JSON.stringify(next)) } catch {}
      return next;
    });
    setSubmitted(res);

  } catch (err) {
    // roll back optimistic on failure
    setRawWords(prev => prev.filter(r => r.id !== temp.id));
    setMyWords(prev => prev.filter(r => r.id !== temp.id));

    if (err?.status === 429) {
      setErrorMsg('One word a day ✨ Try again tomorrow.');
      const retry = Number(err?.retryAt || 0);
      if (retry > Date.now()) {
        setNextAllowedAt(retry);
        try { localStorage.setItem('oneword:nextAllowedAt', String(retry)) } catch {}
      }
    } else if (err?.status === 400) {
      // invalid input — remove local lock
      setNextAllowedAt(0);
      try { localStorage.removeItem('oneword:nextAllowedAt'); } catch {}
      setErrorMsg(err?.message || 'Please enter a single, gentle word ✨');
    } else {
      // server/network error — remove local lock
      setNextAllowedAt(0);
      try { localStorage.removeItem('oneword:nextAllowedAt'); } catch {}
      setErrorMsg('Could not submit right now. Please try again.');
    }
    setTimeout(() => setErrorMsg(''), 4000);
  } finally {
    setSubmitting(false);
  }
}


  const requestGeo = React.useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const g = { lat: latitude, lng: longitude };
        setGeo(g);
        setMyGH4(geohashEncode(latitude, longitude, 4));
        setMyGH3(geohashEncode(latitude, longitude, 3));
      },
      () => {},
      { maximumAge: 60000, timeout: 8000, enableHighAccuracy: false }
    );
  }, []);
  const clearGeo = React.useCallback(() => {
    setGeo(null); setMyGH4(null); setMyGH3(null);
  }, []);

  return (
    <div>
      <div className="header">
        <div className="row hdr-right-wrap" style={{ gap: 12 }}>
          <div className="brand"><Link to="/">OneWord</Link></div>
          <div className="hdr-right">
            <LiveIndicator sseDown={sseDown} />
            <GeoButton geo={geo} onRequest={requestGeo} onClear={clearGeo} />
          </div>
        </div>
      </div>

      <div className="container">
       <form onSubmit={onSubmit} className="row stack-s" style={{ gap: 12, marginBottom: 12 }}>
  <input
    className="input"
    placeholder={cooldownActive ? "You’ve shared today ✨" : "What’s your word today?"}
    value={input}
    disabled={submitting || cooldownActive}
    onChange={e => {
      const v = e.target.value;
      setInput(v);
      if (containsProfanity(v)) setErrorMsg('Let’s keep it gentle ✨');
      else if (errorMsg === 'Let’s keep it gentle ✨') setErrorMsg('');
    }}
  />
  <button className="button" disabled={submitting || cooldownActive}>
    {submitting ? 'Sending…' : (cooldownActive ? 'Tomorrow' : 'Submit')}
  </button>
</form>

{cooldownActive && (
  <div className="muted" style={{ fontSize: 13, marginTop: -8, marginBottom: 8 }}>
    Next word in {Math.floor(msLeft/3600000)}h {Math.ceil((msLeft%3600000)/60000)}m
  </div>
)}


        <div className="controlbar">
          <Segmented
            value={zoom}
            onChange={setZoom}
            options={[
              { value:'global',  label:'Global' },
              { value:'country', label:'Country' },
              { value:'region',  label:'Region' },
              { value:'local',   label:'Local' },
            ]}
          />
          <div className="controlbar__right">
            <Pills
              className="group-range"
              ariaLabel="Range"
              value={range}
              onChange={setRange}
              options={[
                { value:'today', label:'Today' },
                { value:'week',  label:'Week'  },
                { value:'month', label:'Month' },
              ]}
            />
            <Pills
              ariaLabel="Emotion"
              value={sentiment}
              onChange={setSentiment}
              options={[
                { value:'all',      label:'All' },
                { value:'joy',      label:'Joy' },
                { value:'sadness',  label:'Sad' },
                { value:'hope',     label:'Hope' },
                { value:'calm',     label:'Calm' },
                { value:'anger',    label:'Anger' },
                { value:'fear',     label:'Fear' },
                { value:'love',     label:'Love' },
                { value:'strength', label:'Strong' },
                { value:'other',    label:'Other' },
              ]}
            />
          </div>
        </div>

        {loading && <div className="muted" style={{ paddingTop: 6 }}>Loading…</div>}
        {sseDown && <div className="banner">Reconnecting to live stream…</div>}
        {errorMsg && <div className="banner error">{errorMsg}</div>}
        <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>
          {`Showing ${labels.length} of ${filteredByRange.length.toLocaleString()} words ${
          range === 'today' ? 'today' : range === 'week' ? '(last 7 days)' : '(last 30 days)'
            }`}
        </div>
      </div>

      <div className="container">
        <div className="canvasWrap">
          <SpiralStageStable
            items={labels}
            goldId={submitted?.id}
            goldUntil={goldUntil}
            isMobile={isMobile}
            breathTick={breathTick}
            zoom={zoom}
            prefersReducedMotion={prefersReducedMotion}
            scatterPulse={scatterPulse}   // ← NEW
          />
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}

/* =========================
   SpiralStageStable — centers, clamps, smooth zoom
   ========================= */
function SpiralStageStable({ items, goldId, goldUntil, isMobile, breathTick, zoom, prefersReducedMotion, scatterPulse }) {
  const wrapRef = useRef(null)
  const appRef = useRef(null)
  const worldRef = useRef(null)
  const nodesRef = useRef([])
  const anchorsRef = useRef(new Map())
  const rafRef = useRef(0)
  const targetScaleRef = useRef(1)
  const scaleVelRef = useRef(0)
  const tRef = useRef(0)
  const lastWHRef = useRef({ W: 0, H: 0 })
  const rotateRef = useRef(0)
  const rotateTimerRef = useRef(0)
  const cameraLockRef = useRef(false);
  const labelDragRef = useRef(false);
  const assimilatedRef = useRef(new Set()); // ids that already merged (so we don't redraw them)
  const primaryNodeRef = useRef(new Map()); // conceptKey -> PIXI.Text (the primary label to merge into)
  const densityRef = useRef(null);   // Container for the point cloud
  const densityWrapRef = useRef(null); // NEW: wrapper to hold density & receive filters
  const dotTexRef = useRef(null);    // Cached 32px blurred dot texture
  const blurRef = useRef(null);
  const densityPoolRef = useRef([]); // pooled PIXI.Sprite dots
  const bgRef = useRef(null);      // persistent white background
  // (you already have densityRef for the point cloud)
// per-tab client id + short-term memory of my own submits
  const clientIdRef = useRef((crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) + '-' + Date.now());
  const recentMineRef = useRef([]); // [{word, ts, gh3, gh4}]
  const ANCHOR_TTL = 1000 * 60 * 60 * 24 * 14; // 14 days
  function gcAnchors(activeIdSet) {
  const now = Date.now();
  anchorsRef.current.forEach((a, id) => {
    if (id.startsWith('seed-')) { anchorsRef.current.delete(id); return; }
    const last = a?.seenAt || 0;
    if (!activeIdSet?.has(id) && (now - last) > ANCHOR_TTL) {
      anchorsRef.current.delete(id);
    }
  });
}

// blur filter class for PIXI v6/v7/v8
const BlurFilterCls =
  (PIXI.filters && PIXI.filters.BlurFilter) ||
  PIXI.BlurFilter || null;

function makeBlur(strength) {
  if (!BlurFilterCls) return null;
  try { return new BlurFilterCls({ strength }); }  // v8
  catch { return new BlurFilterCls(strength); }    // v6/7
}

// --- motion / collision tunables ---
const DAMP = prefersReducedMotion ? 0.90 : 0.995;   // stronger global damping
const VEL_MAX = prefersReducedMotion ? 0 : 0.16; // slightly lower cap
const RESTITUTION = 0.2;                         // no bounce
const FRICTION = 0.4;                            // strong stickiness
const COLL_SLOP = 3.0;                           // ignore tiny overlaps
const COLL_SEP = 1.0;                           // add a little separation
const COOLDOWN_FRAMES = 24;                      // keep pairs apart briefly
// === free-float wander (no gravity) ===
const MERGE_ENABLED = true;                   // we'll re-enable later
const WANDER_FREQ   = 0.0006;                  // lower = slower curves
const WANDER_PUSH   = prefersReducedMotion ? 0 : 0.015;

// ADD: multi-iteration solver + sticky contacts + island sleep
const SOLVER_ITER = 3;          // run the collision solver a few times per frame (like d3.forceCollide.iterations)
const SLEEP_AFTER_COLL = 6;     // you already have this — keep or raise if needed
const CONTACT_TTL = 48;         // remember axis for a bit longer
const AXIS_HYST = 3.0;          // already defined — keep
const FREEZE_EPS2 = 0.0002;    // speed^2 below this = basically still
const FREEZE_FRAMES = 12;        // touching & still for N frames -> hard sleep


// ADD: axis hysteresis + brief sleep after collisions
const contactsRef = useRef(new Map()); // tag -> { axis:'x'|'y', ttl:number }

// cooldown for pairs to avoid rapid re-solving (jitter)
const contactCooldownRef = useRef(new Map());

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(ANCHOR_STORE_KEY) || '[]')
      if (Array.isArray(saved)) anchorsRef.current = new Map(saved)
    } catch {}
  }, [])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    let app, disposed = false
    async function boot() {
      const rect = el.getBoundingClientRect()
      const w = Math.max(1, Math.round(rect.width) || 800)
      const h = Math.max(460, Math.round(w * 0.6))
      const opts = {
        backgroundAlpha: 1, background: 0xFFFFFF, antialias: false,
        resolution: Math.min(window.devicePixelRatio || 1, 1.5),
        width: w, height: h, preference: 'webgl', powerPreference: 'high-performance',
      }
      if (isPixiV8()) { app = new PIXI.Application(); await app.init(opts); el.appendChild(app.canvas) }
      else { app = new PIXI.Application(opts); el.appendChild(app.view) }
      if (disposed) { app.destroy(true, { children: true }); return }
      appRef.current = app
      const world = new PIXI.Container()
      world.sortableChildren = true;
      app.stage.addChild(world)
      worldRef.current = world
      targetScaleRef.current = scaleForZoom(zoom)
      world.scale.set(targetScaleRef.current)
      drawScene()
    }
    boot()
    return () => {
      disposed = true
      cancelAnimationFrame(rafRef.current)
      if (appRef.current) appRef.current.destroy(true, { children: true })
      appRef.current = null
      worldRef.current = null
      nodesRef.current = []
    }
  }, [])

  useEffect(() => {
    const save = () => {
      try {
        const entries = Array.from(anchorsRef.current.entries())
        localStorage.setItem(ANCHOR_STORE_KEY, JSON.stringify(entries))
      } catch {}
    }
    const id = setInterval(save, 5000)
    const onUnload = () => save()
    window.addEventListener('beforeunload', onUnload)
    return () => { clearInterval(id); window.removeEventListener('beforeunload', onUnload) }
  }, [])


useEffect(() => {
   clearInterval(rotateTimerRef.current)
   rotateRef.current = 0
   if (!items?.length) return
   rotateTimerRef.current = setInterval(() => {
     // step by a chunk so the layout feels fresh without popping everything
     rotateRef.current = (rotateRef.current + Math.ceil(MAX_VISIBLE * 0.5)) % Math.max(items.length, 1)
     drawScene()
     }, ROTATE_MS)
     return () => clearInterval(rotateTimerRef.current)
    }, [items])
    // PRE-SCATTER: run when sentiment changes (via scatterPulse) to avoid "clump then spread"

useEffect(() => {
  if (!scatterPulse) return;
  const app = appRef.current;
  if (!app) return;

  const W = app.renderer.width, H = app.renderer.height;
  const jitter = 12; // pixels of gentle nudge
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  anchorsRef.current.forEach((a) => {
    if (!a) return;
    const amp = a.amp || 0;
    const w   = Math.ceil(a.wGuess || (a.size ? a.size * 2.6 : 40));
    const h   = Math.ceil(a.hGuess || (a.size ? a.size * 1.4 : 22));
    const pad = padForSize(a.size || 24);
    const borderX = Math.ceil(w/2 + amp + pad);
    const borderY = Math.ceil(h/2 + amp + pad);

    a.ax = clamp((a.ax ?? W/2) + (Math.random() - 0.5) * jitter, borderX, W - borderX);
    a.ay = clamp((a.ay ?? H/2) + (Math.random() - 0.5) * jitter, borderY, H - borderY);
  });

  // Re-draw with nudged anchors for a clean first frame
  drawScene();
}, [scatterPulse]);

function makeRadialDotTex(app) {
  if (dotTexRef.current) return dotTexRef.current;
  const r = 16;
const g = new PIXI.Graphics();
if ("circle" in g && "fill" in g) {
  // Pixi v8 path
  g.circle(r, r, r).fill(0x000000);
} else {
  // v6/7 fallback
  g.beginFill(0x000000);
  g.drawCircle(r, r, r);
  g.endFill();
}
const blur2 = makeBlur(2);
if (blur2) g.filters = [blur2];

const tex = app.renderer.generateTexture(g, { resolution: 1 }); // no scaleMode needed in v8
g.destroy(true);
dotTexRef.current = tex;
  return tex;
}

  function clampAnchorsToBounds(W, H) {
    anchorsRef.current.forEach((a) => {
      const amp = a.amp || 0
      const pad = padForSize(a.size || 24)
      const borderX = Math.ceil((a.wGuess || 40)/2 + amp + pad)
      const borderY = Math.ceil((a.hGuess || 22)/2 + amp + pad)
      a.ax = Math.max(borderX, Math.min(W - borderX, a.ax))
      a.ay = Math.max(borderY, Math.min(H - borderY, a.ay))
    })
  }

  function relayoutAnchorsForResize(W, H) {
    const temp = []
    anchorsRef.current.forEach((a, id) => {
      const amp = 0
      const w = Math.ceil(a.wGuess || (a.size ? a.size * 2.6 : 40))
      const h = Math.ceil(a.hGuess || (a.size ? a.size * 1.4 : 22))
      const pad = padForSize(a.size || 24)
      const borderX = Math.ceil(w/2 + amp + pad);
      const borderY = Math.ceil(h/2 + amp + pad);


      const ax = Math.max(borderX, Math.min(W - borderX, (a.ax ?? W/2)))
      const ay = Math.max(borderY, Math.min(H - borderY, (a.ay ?? H/2)))
      temp.push({ id, w, h, ax, ay, borderX, borderY })
    })
    resolveCollisions(temp, W, H, 12)
    for (const p of temp) {
      const ref = anchorsRef.current.get(p.id)
      if (ref) { ref.ax = p.ax; ref.ay = p.ay }
    }
  }

  function computeCloudCenter() {
    if (!nodesRef.current.length || !appRef.current) return null
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const n of nodesRef.current) {
      if (!n || n.destroyed) continue
      const x = n._ax, y = n._ay
      if (x < minX) minX = x; if (x > maxX) maxX = x
      if (y < minY) minY = y; if (y > maxY) maxY = y
    }
    if (!isFinite(minX)) return null
    return { cx: (minX + maxX)/2, cy: (minY + maxY)/2 }
  }

  function centerWorldToCloud() {
  const app = appRef.current, world = worldRef.current;
  if (!app || !world || cameraLockRef.current) return; // ← don't recentre while user is panning/dragging
  const W = app.renderer.width, H = app.renderer.height;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of nodesRef.current) {
    if (!n || n.destroyed) continue;
    const x = n._ax, y = n._ay;
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  const pivotX = isFinite(minX) ? (minX + maxX) / 2 : W/2;
  const pivotY = isFinite(minY) ? (minY + maxY) / 2 : H/2;

  world.pivot.set(pivotX, pivotY);
  world.position.set(W/2, H/2 + H * Y_BIAS_FRAC);
}


  function animateScale() {
    const world = worldRef.current
    if (!world) return
    const target = targetScaleRef.current
    const current = world.scale.x
    const dt = 1/60
    const stiffness = 10, damping = 12
    const accel = stiffness * (target - current) - damping * scaleVelRef.current
    scaleVelRef.current += accel * dt
    const next = current + scaleVelRef.current * dt
    world.scale.set(next)
    centerWorldToCloud()
    if (Math.abs(target - next) > 0.001 || Math.abs(scaleVelRef.current) > 0.001) requestAnimationFrame(animateScale)
    else { world.scale.set(target); scaleVelRef.current = 0; centerWorldToCloud() }
  }

  function capsForCurrent() {
    const mobile = window.matchMedia('(max-width: 640px)').matches
    return capsForZoom(zoom, mobile)
  }
  function applyVisibilityCap() {
  // Always show everything you drew; the MAX_NODES_GLOBAL already caps.
  for (const node of nodesRef.current) {
    if (node && !node.destroyed) node.visible = true
  }
}


  useEffect(() => {
    const el = wrapRef.current
    const app = appRef.current
    if (!el || !app) return

    const onResize = () => {
      const rect = el.getBoundingClientRect()
      const W = Math.max(1, Math.round(rect.width) || 800)
      const H = Math.max(460, Math.round(W * 0.6))
      app.renderer.resize(W, H)

      const { W: pW, H: pH } = lastWHRef.current
      const arChanged = pW && pH ? Math.abs((W/H) - (pW/pH)) > 0.25 : false
      lastWHRef.current = { W, H }
      if (arChanged) anchorsRef.current = new Map()

        const EXTRA = Math.max(W, H) * 2;
        const SW = W + EXTRA;
        const SH = H + EXTRA;

      clampAnchorsToBounds(W, H)
      relayoutAnchorsForResize(W, H)
      drawScene()
      
    }

    const ro = new ResizeObserver(onResize)
    ro.observe(el)
    window.addEventListener('orientationchange', onResize)
    return () => { ro.disconnect(); window.removeEventListener('orientationchange', onResize) }
  }, [])

  useEffect(() => { drawScene() }, [items, isMobile, goldId, goldUntil])

  useEffect(() => {
    const world = worldRef.current
    if (!world) return
    targetScaleRef.current = scaleForZoom(zoom)
    scaleVelRef.current = 0
    animateScale()
    applyVisibilityCap()
  }, [zoom])

  useEffect(() => {
    const pool = nodesRef.current.slice();
    if (!pool.length) return;
    const count = Math.max(1, Math.floor(pool.length * 0.12));
    const start = Math.floor(Math.random() * pool.length);
    for (let i = 0; i < count; i++) {
      const n = pool[(start + i) % pool.length];
      if (!n || n.destroyed || n._hover || !n._variants || n._variants.length < 2) continue;
      n._variantIdx = ((n._variantIdx | 0) + 1) % n._variants.length;
      n.text = n._variants[n._variantIdx];
    }
  }, [breathTick]);

useEffect(() => {
  const app = appRef.current, world = worldRef.current;
  if (!app || !world) return;
  const dom = isPixiV8() ? app.canvas : app.view;

  let unlockTimerWheel = null;
  const onWheel = (e) => {
    // Treat wheel as canvas-zoom ONLY when the user is pinch-zooming
    // (ctrlKey on Chrome/Edge; meta/alt as fallbacks). Otherwise, let
    // the event bubble so the page can scroll to the footer/links.
    const isPinchZoom = e.ctrlKey || e.metaKey || e.altKey;
    if (!isPinchZoom) return;

    const rect = dom.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const local = world.toLocal(new PIXI.Point(px, py));
    world.pivot.copyFrom(local);
    world.position.set(px, py);

    const next = Math.max(0.6, Math.min(3.0, world.scale.x * Math.exp(-e.deltaY * 0.001)));
    targetScaleRef.current = next;
    world.scale.set(next);

    cameraLockRef.current = true;
    clearTimeout(unlockTimerWheel);
    unlockTimerWheel = setTimeout(() => { cameraLockRef.current = false; }, 800);

    e.preventDefault(); // only block default when we’re zooming
  };

  dom.addEventListener('wheel', onWheel, { passive: false });
  return () => { dom.removeEventListener('wheel', onWheel); };
}, []);



function stepDynamicCollisions(nodes, W, H) {
  const cell = 64;
  const grid = new Map();
  const key = (ix, iy) => ix + '|' + iy;

  const cooldown = contactCooldownRef.current;
  for (const [k, v] of cooldown) { if (v <= 1) cooldown.delete(k); else cooldown.set(k, v - 1); }

  // decay axis memory
  {
    const mem = contactsRef.current;
    for (const [k, c] of mem) { c.ttl -= 1; if (c.ttl <= 0) mem.delete(k); }
  }

  // clear per-node contact counters for this step
  for (const n of nodes) { if (!n || n.destroyed) continue; n._contacts = 0; }

  // spatial hash
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i]; if (!n || n.destroyed) continue;
    const w = (n._w || 0), h = (n._h || 0), p = (n._pad || 0);
    const minx = Math.floor((n.x - w/2 - p) / cell);
    const maxx = Math.floor((n.x + w/2 + p) / cell);
    const miny = Math.floor((n.y - h/2 - p) / cell);
    const maxy = Math.floor((n.y + h/2 + p) / cell);
    for (let ix = minx; ix <= maxx; ix++) {
      for (let iy = miny; iy <= maxy; iy++) {
        const k = key(ix, iy);
        (grid.get(k) || grid.set(k, []).get(k)).push(i);
      }
    }
  }

  const seen = new Set();
  const pairKey = (a,b) => a < b ? `${a}-${b}` : `${b}-${a}`;

  for (const idxs of grid.values()) {
    for (let a = 0; a < idxs.length; a++) {
      for (let b = a + 1; b < idxs.length; b++) {
        const ia = idxs[a], ib = idxs[b];
        const tag = pairKey(ia, ib);
        if (seen.has(tag)) continue; seen.add(tag);
        if (cooldown.has(tag)) continue;

        const A = nodes[ia], B = nodes[ib];
        if (!A || !B || A.destroyed || B.destroyed) continue;

        const aw = A._w, ah = A._h, ap = A._pad;
        const bw = B._w, bh = B._h, bp = B._pad;

        const ax1 = A.x - aw/2 - ap, ax2 = A.x + aw/2 + ap;
        const ay1 = A.y - ah/2 - ap, ay2 = A.y + ah/2 + ap;
        const bx1 = B.x - bw/2 - bp, bx2 = B.x + bw/2 + bp;
        const by1 = B.y - bh/2 - bp, by2 = B.y + bh/2 + bp;

        if (ax1 >= bx2 || bx1 >= ax2 || ay1 >= by2 || by1 >= ay2) continue;

        // penetration with slop
        const overlapX = Math.min(ax2, bx2) - Math.max(ax1, bx1);
        const overlapY = Math.min(ay2, by2) - Math.max(ay1, by1);
        const penX = overlapX - COLL_SLOP;
        const penY = overlapY - COLL_SLOP;
        if (penX <= 0 || penY <= 0) continue;

        // choose MTV axis (with hysteresis)
        let nx = 0, ny = 0, pen = 0;
        if (penX < penY) { nx = (A.x <= B.x) ? -1 : 1; pen = penX + COLL_SEP; }
        else             { ny = (A.y <= B.y) ? -1 : 1; pen = penY + COLL_SEP; }

        {
          let axisChosen = Math.abs(nx) === 1 ? 'x' : 'y';
          const mem = contactsRef.current;
          const prev = mem.get(tag);
          if (prev && Math.abs(penX - penY) < AXIS_HYST && axisChosen !== prev.axis) {
            if (prev.axis === 'x') { nx = (A.x <= B.x) ? -1 : 1; ny = 0; pen = penX + COLL_SEP; }
            else                   { ny = (A.y <= B.y) ? -1 : 1; nx = 0; pen = penY + COLL_SEP; }
            axisChosen = prev.axis;
          }
          mem.set(tag, { axis: axisChosen, ttl: CONTACT_TTL });
        }

        // heavier labels move less
        const areaA = Math.max(80, aw * ah);
        const areaB = Math.max(80, bw * bh);
        const invA = 1 / areaA, invB = 1 / areaB, invSum = invA + invB || 1;

        // count contacts (for sleeping)
        A._contacts = (A._contacts | 0) + 1;
        B._contacts = (B._contacts | 0) + 1;

        // positional correction
        const mAx = -nx * pen * (invA / invSum);
        const mAy = -ny * pen * (invA / invSum);
        const mBx =  nx * pen * (invB / invSum);
        const mBy =  ny * pen * (invB / invSum);
        A.x += mAx; A.y += mAy;
        B.x += mBx; B.y += mBy;

        // clamp inside bounds
        A.x = Math.max(A._borderX, Math.min(W - A._borderX, A.x));
        A.y = Math.max(A._borderY, Math.min(H - A._borderY, A.y));
        B.x = Math.max(B._borderX, Math.min(W - B._borderX, B.x));
        B.y = Math.max(B._borderY, Math.min(H - B._borderY, B.y));

        // kill approach along normal
        const rvx = A._vx - B._vx;
        const rvy = A._vy - B._vy;
        const vn  = rvx * nx + rvy * ny;
        if (vn < 0) {
          const dvx = vn * nx, dvy = vn * ny;
          A._vx -= dvx * (invA / invSum); A._vy -= dvy * (invA / invSum);
          B._vx += dvx * (invB / invSum); B._vy += dvy * (invB / invSum);
        }

        // friction along tangent
        const tx = ny, ty = -nx;
        const vt = rvx * tx + rvy * ty;
        const tScale = Math.abs(vt) < 0.02 ? 0.5 : 0.25;
        const dv = vt * tScale;
        A._vx -= dv * tx * (invA / invSum); A._vy -= dv * ty * (invA / invSum);
        B._vx += dv * tx * (invB / invSum); B._vy += dv * ty * (invB / invSum);

        // no sleep injection; rely on damping & friction only

// cooldown
cooldown.set(tag, COOLDOWN_FRAMES);

      }
    }
  }

  // update center calc
  for (const n of nodes) { if (!n || n.destroyed) continue; n._ax = n.x; n._ay = n.y; }
}


  function drawScene() {
  console.log('[drawScene] items=', items?.length);
  const app = appRef.current, world = worldRef.current
  if (!app || !world) return
  cancelAnimationFrame(rafRef.current)

  // Remove/destroy only prior label nodes (texts)
  for (const n of nodesRef.current) { try { n.destroy(); } catch {} }
  nodesRef.current = []
  // IMPORTANT: do NOT call world.removeChildren() anymore


   const W = app.renderer.width, H = app.renderer.height

   function addToParticleContainer(pc, sprite) {
  if (pc.addParticle) pc.addParticle(sprite);   // v8
  else pc.addChild?.(sprite);                   // v7/v6
}


    // pick the visible slice first
    const total = items?.length || 0;
    const off = rotateRef.current || 0;
    let src = [];
    if (total <= MAX_VISIBLE) {
      src = items || [];
    } else {
      const a = items.slice(off, off + MAX_VISIBLE);
      const b = (off + MAX_VISIBLE > total) ? items.slice(0, (off + MAX_VISIBLE) % total) : [];
      src = a.concat(b);
    }
    // Skip items already merged
    src = src.filter(({ show }) => !assimilatedRef.current.has(show.id));

    // Dynamic playfield: when sparse, keep it tight (no huge canvas to wander)
    const N = src.length;
// keep everything inside the visible viewport
const SW = W, SH = H;


let bg = bgRef.current;
if (!bg) {
  bg = new PIXI.Graphics();
  bgRef.current = bg;
  bg.zIndex = -10; // put white background at the very back

  // pointer setup once
  bg.eventMode = 'static';
  bg.hitArea = new PIXI.Rectangle(0, 0, W, H);
  bg.cursor = 'grab';

  let isPanning = false;
  let panX = 0, panY = 0;
  let unlockTimer = null;

  const endPan = () => {
    isPanning = false;
    bg.cursor = 'grab';
    clearTimeout(unlockTimer);
    unlockTimer = setTimeout(() => { cameraLockRef.current = false; }, 500);
  };

  bg.on('pointerdown', (e) => {
    cameraLockRef.current = true;
    isPanning = true;
    bg.cursor = 'grabbing';
    panX = e.global.x; panY = e.global.y;
  });
  bg.on('pointermove', (e) => {
    if (!isPanning) return;
    const dx = e.global.x - panX;
    const dy = e.global.y - panY;
    world.position.x += dx;
    world.position.y += dy;
    panX = e.global.x; panY = e.global.y;
  });
  bg.on('pointerup', endPan);
  bg.on('pointerupoutside', endPan);

  world.addChild(bg); // add once
}

// redraw to current size every draw
bg.clear?.();
if ('rect' in bg && 'fill' in bg) {
  bg.rect(0,0,W,H).fill(0xFFFFFF);
} else {
  bg.beginFill(0xFFFFFF); bg.drawRect(0,0,W,H); bg.endFill();
}
bg.hitArea.width = W; bg.hitArea.height = H;



// weights by concept key (prefer true concept nodes)
const weightByKey = new Map();
for (const it of items || []) {
  const k = it.concept?.key; if (!k) continue;
  const c = Math.max(1, it.concept.count || it.concept.score || 1);
  const w = Math.log2(c + 1);
  if (!weightByKey.has(k) || !it.concept.spotlight) weightByKey.set(k, w);
}
let weightSum = 0;
for (const w of weightByKey.values()) weightSum += w;

// helper: gaussian jitter around a center
function jitter(sigma) {
  const u = Math.random() || 1e-6, v = Math.random() || 1e-6;
  const mag = Math.sqrt(-2 * Math.log(u)) * sigma;
  const ang = 2 * Math.PI * v;
  return { dx: Math.cos(ang) * mag, dy: Math.sin(ang) * mag };
}


       // --- Ensure: if a spotlight is visible, its concept label is also in-frame ---
{
  const idsInSrc = new Set(src.map(x => x.show.id));
  let changed = false;

  for (const x of src.slice()) {
    if (!x.concept?.spotlight) continue;

    // ✅ use the real concept key
    const ex = (x.concept.examples && x.concept.examples[0]) || {};
    const baseKey =
      x.concept.baseKey ||
      normalizeConcept(ex.word, ex.translated) ||
      normalizeConcept(x.show?.word, x.show?.translated);

    const conceptId = `concept:${baseKey}`;
    if (!idsInSrc.has(conceptId)) {
      const conceptEntry =
        (items || []).find(y => !y.concept?.spotlight && y.concept?.key === baseKey) ||
        {
          concept: {
            key: baseKey,
            freshest: x.concept.freshest,
            count: x.concept.count || 1,
            examples: []
          },
          show: {
            id: conceptId,
            word: baseKey,            // ✅ human word (e.g., "love")
            translated: baseKey,
            ts: x.concept.freshest
          }
        };

      src.unshift(conceptEntry);
      idsInSrc.add(conceptId);
      changed = true;
    }
  }

  // trim if we overfilled; prefer keeping the spotlight bubbles
  if (changed && src.length > MAX_VISIBLE) {
    for (let i = src.length - 1; i >= 0 && src.length > MAX_VISIBLE; i--) {
      if (src[i].concept?.spotlight) continue;
      src.splice(i, 1);
    }
    if (src.length > MAX_VISIBLE) src.length = MAX_VISIBLE;
  }
}

    const taken = []
const activeIds = new Set(src.map(({ show }) => show.id))
gcAnchors(activeIds); // only what we're drawing this frame
anchorsRef.current.forEach((a, id) => {
  if (!activeIds.has(id)) return; // ← ignore old/hidden anchors
  const amp = Math.max(ORBIT_MIN, Math.min(ORBIT_MAX, (a.amp || 6)))
  const w0  = a.wGuess || (a.size ? a.size * 2.6 : 40)
  const h0  = a.hGuess || (a.size ? a.size * 1.4 : 22)
  const w   = Math.ceil(w0 * 1.18)
  const h   = Math.ceil(h0 * 1.12)
  const pad = padForSize(a.size || 24) + amp
  taken.push({
    x: (a.ax || W/2) - w/2 - pad,
    y: (a.ay || H/2) - h/2 - pad,

    w: w + pad*2,
    h: h + pad*2,
  })
})

// ----- size mapping (8pt–30pt, Google Docs) -----
const PT_TO_PX = 96 / 72;
const MIN_PX = Math.round(8 * PT_TO_PX);   // ≈ 11px
const MAX_PX = Math.round(30 * PT_TO_PX);  // ≈ 40px

const counts = src.map(({concept}) => Math.max(1, concept.count || concept.score || 1));
const cMin = Math.min(...counts);
const cMax = Math.max(...counts);
const aMin = Math.log10(Math.max(1, cMin));
const aMax = Math.log10(Math.max(1, cMax));

const sizeFromCount = (c) => {
  const a = Math.log10(Math.max(1, c));
  const t = aMax > aMin ? (a - aMin) / (aMax - aMin) : 0.5;
  return Math.round(MIN_PX + t * (MAX_PX - MIN_PX));
};

    const placed = []
    for (const { concept, show } of src) {
      const id = show.id
      const size = sizeFromCount(concept.count || concept.score || 1);
      const alt  = show.translated || show.word
      const mw   = measureText(show.word, size)
      const ma   = measureText(alt, size)
      const m = { w: Math.max(mw.w, ma.w), h: Math.max(mw.h, ma.h) } // use bigger box
      const pad = padForSize(size);
      const ckey = normalizeConcept(show.word, show.translated);
      const ts = show.ts || 0;
      const kind = concept.spotlight ? 'spotlight' : 'concept';
      const arr  = show._arrival || 0;
       const variants =
    kind === 'concept'
      ? Array.from(new Set(
          (concept?.examples || [])
            .map(e => e?.word)
            .filter(Boolean)
        )).slice(0, 8)
      : null;
      let a = anchorsRef.current.get(id)

     if (!a) {
   a = { amp: 0, phi: 0 };

   const padSelf = pad;
   let placedOK = false;

   // 1) Center-biased candidate (radius grows with N; spotlights even closer)
   {
     const cx = W / 2, cy = SH / 2;
     const fillFrac = Math.min(1, N / 120); // grow outward as list grows
     const baseR = Math.min(W, H) * (0.30 + 0.55 * fillFrac);
     const localR = (concept.spotlight ? 0.5 : 1.0) * baseR; // spotlights near the middle
     for (let tries = 0; tries < 120; tries++) {
       const ang = Math.random() * Math.PI * 2;
       const r   = (0.15 * localR) + Math.random() * (localR - 0.15 * localR);
       const rx  = cx + Math.cos(ang) * r;
       const ry  = cy + Math.sin(ang) * r;
       const box = { x: rx - m.w/2 - padSelf, y: ry - m.h/2 - padSelf, w: m.w + padSelf*2, h: m.h + padSelf*2 };
       if (taken.every(tb => !rectsOverlap(tb, box))) { a.ax = rx; a.ay = ry; placedOK = true; break; }
     }
   }

   // 2) Fallback: random anywhere on stage
  for (let tries = 0; tries < 500; tries++) {
    const bx = Math.ceil(m.w / 2 + padSelf);
    const by = Math.ceil(m.h / 2 + padSelf);
    const rx = bx + Math.random() * (W - bx * 2);
    const ry = by + Math.random() * (H - by * 2);
    const box = { x: rx - m.w/2 - padSelf, y: ry - m.h/2 - padSelf, w: m.w + padSelf*2, h: m.h + padSelf*2 };
    if (taken.every(tb => !rectsOverlap(tb, box))) { a.ax = rx; a.ay = ry; placedOK = true; break; }
  }

  // Fallback: short spiral only if random fails
  // 3) Last resort: short spiral
  if (!placedOK) {
    let angle = Math.random() * Math.PI * 2, radius = 24;
    a.ax = W/2; a.ay = H/2;
    for (let tries = 0; tries < 900; tries++) {
      const box = { x: a.ax - m.w/2 - padSelf, y: a.ay - m.h/2 - padSelf, w: m.w + padSelf*2, h: m.h + padSelf*2 };
      if (taken.every(tb => !rectsOverlap(tb, box))) break;
      angle += 0.35; radius += 6;
      a.ax = W/2 + Math.cos(angle) * radius;
      a.ay = H/2 + Math.sin(angle) * radius;
    }
  }
} else {
  a.amp = 0; // kill old orbit amplitude
}


      const borderX = Math.ceil(m.w/2 + a.amp + PADDING + SAFE_PAD)
      const borderY = Math.ceil(m.h/2 + a.amp + PADDING + SAFE_PAD)
      a.ax = Math.max(borderX, Math.min(W - borderX, a.ax))
      a.ay = Math.max(borderY, Math.min(H - borderY, a.ay))

      placed.push({
        id,
        kind,
        arr,
        ckey,
        ts,
        word: show.word,
        alt,
        variants,
        size,
        w: m.w,
        h: m.h,
        ax: a.ax,
        ay: a.ay,
        amp: a.amp,
        phi: a.phi || Math.random() * Math.PI * 2,
        borderX,
        borderY,
        pad
      })

      const padSelf = pad + a.amp
      taken.push({ x: a.ax - m.w/2 - padSelf, y: a.ay - m.h/2 - padSelf, w: m.w + padSelf*2, h: m.h + padSelf*2 })
    }
    
    resolveCollisions(placed, SW, SH, 18)

    // Ensure an anchor exists for each visible spotlight's concept,
// so merge can lock on even if the concept label isn't in this slice.
for (const p of placed) {
  if (p.kind !== 'spotlight') continue;
  const cid = `concept:${p.ckey}`;
 if (!anchorsRef.current.has(cid)) {
  anchorsRef.current.set(cid, {
    ax: p.ax, ay: p.ay, amp: p.amp, phi: p.phi,
    wGuess: p.w, hGuess: p.h, size: p.size,
    seenAt: Date.now()
  });
}
}

// ---- Density backdrop (pooled sprites + cached blur, v8-safe) ----
const isTiny = isMobile;
// keep it lighter; we’ll still look rich after blur
const MAX_POINTS = isTiny ? 8000 : 16000;


// 1) Wrapper sits between bg and labels
let densWrap = densityWrapRef.current;
if (!densWrap) {
  densWrap = new PIXI.Container();
  densWrap.sortableChildren = false;   // we use zIndex at the parent level only
  densityWrapRef.current = densWrap;
  densWrap.zIndex = -5;                // bg: -10, density: -5, labels: 1
  world.addChild(densWrap);
} else {
  densWrap.zIndex = -5;
}
densWrap.alpha = 1;

// 2) Particle container with v8/v7 compatibility
let dens = densityRef.current;
if (!dens) {
  const PC = PIXI.ParticleContainer;
  dens = PC
    ? new PC(MAX_POINTS, { position:true, scale:true, alpha:true, tint:true })
    : new PIXI.Container(); // fallback if PC not available
  densityRef.current = dens;
  densWrap.addChild(dens);
}

// 3) Build/extend the sprite pool
const dotTex = makeRadialDotTex(app);
while (densityPoolRef.current.length < MAX_POINTS) {
  const spr = new PIXI.Sprite(dotTex);
  spr.visible = false;
  if (dens.addParticle) dens.addParticle(spr);    // v8
  else dens.addChild?.(spr);                      // v7/v6
  densityPoolRef.current.push(spr);
}
let poolIdx = 0;
const useSpr = () => {
  const spr = densityPoolRef.current[poolIdx++];
  spr.visible = true;
  return spr;
};

// 4) Populate (much stronger alpha so it’s obvious)
const DOTS_BASE = Math.max(8000, Math.floor((placed.length || 1) * 700));
const DOTS = Math.min(MAX_POINTS, DOTS_BASE);
const clusterFrac = 0.35;
const clusterCount = Math.floor(DOTS * clusterFrac);
const globalCount  = DOTS - clusterCount;

// global radial fill
for (let i = 0; i < globalCount; i++) {
  const u = Math.random(), a = Math.random() * Math.PI * 2;
  const R = 0.48 * Math.min(W, H);
  const r = Math.sqrt(u) * R;
  const spr = useSpr();
  spr.x = W/2 + Math.cos(a) * r;
  spr.y = H/2 + Math.sin(a) * r * 0.9;
  spr.scale.set(0.8 + Math.random() * 1.4);
  spr.alpha = 0.28 + Math.random() * 0.12; // ↑ stronger
  spr.tint = 0x000000;
}

// clusters near labels
const gauss = () => {
  let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};
const perLabel = Math.max(3, Math.floor(clusterCount / Math.max(1, placed.length)));
for (const p of placed) {
  const sigma = Math.max(18, Math.min(90, Math.max(p.w, p.h) * 0.45));
  for (let i = 0; i < perLabel; i++) {
    const spr = useSpr();
    spr.x = p.ax + gauss() * sigma;
    spr.y = p.ay + gauss() * sigma * 0.75;
    spr.scale.set(0.7 + Math.random() * 1.1);
    spr.alpha = 0.24 + Math.random() * 0.14; // ↑ stronger
    spr.tint = 0x000000;
  }
}

// hide unused sprites
for (let i = poolIdx; i < densityPoolRef.current.length; i++) {
  densityPoolRef.current[i].visible = false;
}

// 5) Soften with blur (parent wrapper; ParticleContainer can’t take filters directly)
if (!blurRef.current) blurRef.current = makeBlur(6);
densWrap.filters = blurRef.current ? [blurRef.current] : null;

// Ensure draw order is applied (some Pixi builds need an explicit sort)
world.sortChildren?.();


    // Choose one "primary" label per concept key (largest size wins)
    const primaryByKey = new Map();
    for (const p of placed) {
    const best = primaryByKey.get(p.ckey);
    if (!best || p.size > best.size) primaryByKey.set(p.ckey, p);
    }


    for (const p of placed) {
      anchorsRef.current.set(p.id, { ax: p.ax, ay: p.ay, amp: p.amp, phi: p.phi, wGuess: p.w, hGuess: p.h, size: p.size })
      const wantGold = (p.id === goldId) && (Date.now() < goldUntil)
      const color = wantGold ? GOLD_N : BLACK_N
      const txt = makeText(p.word, {
        fontFamily: 'Inter, Noto Sans, ui-sans-serif, system-ui, Arial, sans-serif',
        fontSize: p.size,
        fill: color
      })
        // If this is a spotlight and it matches the concept label text exactly,
  // show the original language as-is, but nudge the concept label to the next variant.
  if (!txt._isConcept) {
    const primary = primaryNodeRef.current.get(p.ckey);
    if (primary && !primary.destroyed && primary.text.toLowerCase() === (p.word || '').toLowerCase()) {
      if (primary._variants && primary._variants.length > 1) {
        primary._variantIdx = ((primary._variantIdx | 0) + 1) % primary._variants.length;
        primary.text = primary._variants[primary._variantIdx];
      }
    }
  }
      txt.anchor?.set?.(0.5)
      txt.x = p.ax; txt.y = p.ay
      txt._ax = p.ax; txt._ay = p.ay;
       // rotating language variants (concept labels only)
      if (p.kind === 'concept') {
      const uniq = Array.from(new Set([p.word, p.alt, ...(p.variants || [])])).filter(Boolean);
      txt._variants = uniq.length ? uniq : [p.word];
      txt._variantIdx = 0;
      } else {
      txt._variants = null;
      }

       // merge/spotlight metadata
      txt._id = p.id;
      txt._ckey = p.ckey;
      txt._isConcept = (p.kind === 'concept');
      txt._isPrimary = txt._isConcept;        // concept label is the merge target
      txt._spotlightUntil = (p.arr || 0) + SPOTLIGHT_MS; // spotlight based on arrival
      txt._ignoreCollision = false; // set true while assimilating to avoid jitter
      txt._assimilating = null;     // {t:0..1}

// bbox used for dynamic collisions
txt._w  = p.w;
txt._h  = p.h;
txt._r  = radiusFromBox(p.w, p.h, p.size); // ✅ safe & size-aware
txt._seed = Math.random() * 1000;


const init = prefersReducedMotion ? 0 : 0.35;
txt._vx = (Math.random() - 0.5) * init;
txt._vy = (Math.random() - 0.5) * init;

txt._borderX = p.borderX;
txt._borderY = p.borderY;

      txt._originalText = p.word; txt._altText = p.alt
      try { txt.eventMode = 'static'; txt.cursor = 'pointer' } catch {}
      txt.interactive = true
      txt.on?.('pointerover', () => { if (!txt.destroyed) { txt._hover = true; txt.text = txt._altText } })
      txt.on?.('pointerout',  () => { if (!txt.destroyed) { txt._hover = false; txt.text = txt._originalText } })
      txt.on?.('pointertap',  () => { if (txt.destroyed) return
        txt.text = (txt.text === txt._originalText) ? txt._altText : txt._originalText
        setTimeout(() => { if (!txt.destroyed && !txt._hover) txt.text = txt._originalText }, 2000)
      })

// DRAG label to reposition (persisted in anchors)
const thisId = p.id;
let dragData = null, dragging = false, offX = 0, offY = 0;

const endDrag = () => {
  dragging = false;
  dragData = null;
  txt.alpha = 1;
  labelDragRef.current = false; // ← let background know label drag ended
};

txt.on?.('pointerdown', (e) => {
  cameraLockRef.current = true;        // stop auto-center while user interacts
  labelDragRef.current = true;         // ← mark that a label drag is active
  dragging = true;
  dragData = e.data;
  const world = worldRef.current;
  const pos = dragData.getLocalPosition(world);
  offX = txt.x - pos.x; offY = txt.y - pos.y;
  txt.alpha = 0.9;
  txt._vx = 0; txt._vy = 0;            // stop inertial drift while grabbing
});

txt.on?.('pointermove', () => {
  if (!dragging || !dragData) return;
  const world = worldRef.current;
  const pos = dragData.getLocalPosition(world);
  const nx = pos.x + offX, ny = pos.y + offY;
  txt.x = nx; txt.y = ny;
  txt._ax = nx; txt._ay = ny;
  const a = anchorsRef.current.get(thisId);
  if (a) { a.ax = nx; a.ay = ny; a.seenAt = Date.now(); }
});

txt.on?.('pointerup', endDrag);
txt.on?.('pointerupoutside', endDrag);
txt.zIndex = 1; // above the density cloud

      world.addChild(txt); nodesRef.current.push(txt)
    }

    applyVisibilityCap()
    centerWorldToCloud()

    // Auto-fit when sparse (keeps all visible without manual zoom/drag)
    if (!cameraLockRef.current && N > 0 && N <= 40) {
      let minx =  Infinity, miny =  Infinity, maxx = -Infinity, maxy = -Infinity;
      for (const p of placed) {
        const pad = p.pad + (p.amp || 0);
        const x1 = p.ax - p.w / 2 - pad, x2 = p.ax + p.w / 2 + pad;
        const y1 = p.ay - p.h / 2 - pad, y2 = p.ay + p.h / 2 + pad;
        if (x1 < minx) minx = x1; if (x2 > maxx) maxx = x2;
        if (y1 < miny) miny = y1; if (y2 > maxy) maxy = y2;
      }
      if (Number.isFinite(minx)) {
        const bw = Math.max(1, maxx - minx), bh = Math.max(1, maxy - miny);
        const margin = 40;
        const scaleX = (W - margin) / bw;
        const scaleY = (H - margin) / bh;
        const desired = Math.max(0.8, Math.min(2.2, 0.92 * Math.min(scaleX, scaleY)));
        const cx = (minx + maxx) / 2, cy = (miny + maxy) / 2;
        world.pivot.set(cx, cy);
        world.position.set(W/2, H/2 + H * Y_BIAS_FRAC);
        world.scale.set(desired);
        targetScaleRef.current = desired;
      }
    }

world.sortChildren?.();

const loop = () => {
  const app = appRef.current; if (!app) return;
  const W = app.renderer.width, H = app.renderer.height;

  for (const n of nodesRef.current) {
  if (!n || n.destroyed) continue;

  // integrate + mild drag
  n.x += n._vx;
  n.y += n._vy;
  n._vx *= 0.985;
  n._vy *= 0.985;

  // ✅ wander: one kick per node per frame
  if (!prefersReducedMotion && !n._assimilating) {
    const t = performance.now() * 0.001 + (n._seed || 0); // seconds scale is nicer
    n._vx += Math.sin(t * 1.7) * WANDER_PUSH;
    n._vy += Math.cos(t * 1.3) * WANDER_PUSH;
  }


     // speed clamp (prevents tunneling)
    const vmax = prefersReducedMotion ? 0.0 : 0.45;
  
 
    if (n._vx >  vmax) n._vx =  vmax; else if (n._vx < -vmax) n._vx = -vmax;
    if (n._vy >  vmax) n._vy =  vmax; else if (n._vy < -vmax) n._vy = -vmax;

    // keep centering calc happy
    n._ax = n.x; n._ay = n.y;
  }


const now = Date.now();

for (const n of nodesRef.current) {
  if (!n || n.destroyed) continue;

// After 35s (5s gold + 30s roam), immediately start assimilation into the concept
if (MERGE_ENABLED && !n._isPrimary && !n._assimilating && now >= (n._spotlightUntil || 0)) {
  const target = primaryNodeRef.current.get(n._ckey);
  const anchor = anchorsRef.current.get(`concept:${n._ckey}`);
  const tx = (target && !target.destroyed) ? target.x : (anchor ? anchor.ax : n.x);
  const ty = (target && !target.destroyed) ? target.y : (anchor ? anchor.ay : n.y);

  // Begin merge NOW: fade/scale while drifting toward the concept (no collisions)
  n._assimilating = { t: 0, targetPoint: { x: tx, y: ty } };
  n._ignoreCollision = true;
  n._vx = 0; n._vy = 0;
}

  // If currently assimilating, drift+fade+scale toward the concept
    if (MERGE_ENABLED && n._assimilating) {
    const target = primaryNodeRef.current.get(n._ckey);
    const tp = (!target || target.destroyed) ? n._assimilating.targetPoint : null;
    const tx = target && !target.destroyed ? target.x : (tp ? tp.x : n.x);
    const ty = target && !target.destroyed ? target.y : (tp ? tp.y : n.y);

    // smooth attraction (critically damped-ish)
    n.x += (tx - n.x) * 0.20;
    n.y += (ty - n.y) * 0.20;

    // time-normalized fade/scale
    const step = 1 / (ASSIMILATE_MS / 30); // ~frames @60fps
    n._assimilating.t = Math.min(1, n._assimilating.t + step);
    const p = n._assimilating.t;

    try { n.scale.set(Math.max(0.2, 1 - 0.5 * p)); } catch {}
    n.alpha = 1 - p;

    // finish: mark as merged, destroy node, never draw again
    const closeEnough = Math.hypot(tx - n.x, ty - n.y) < 2;
    if (p >= 1 || closeEnough) {
      assimilatedRef.current.add(n._id);
      anchorsRef.current.delete(n._id); // GC old spotlight anchor
      n.destroy();
      continue; // skip post-integration work for this node
    }
  }

  // (existing integration, damping & clamps continue below)
}

  // fast, non-sticky separation
  collideGrid(nodesRef.current, W, H, 2);

  rafRef.current = requestAnimationFrame(loop);
};

// Build map conceptKey -> primary node (the one we drift into)
      const primMap = new Map();
        for (const n of nodesRef.current) {
  if (!n || n.destroyed) continue;
  if (n._isPrimary) primMap.set(n._ckey, n); // concept label is the merge target
}

primaryNodeRef.current = primMap;

  // kick off the animation loop and recentre once
  rafRef.current = requestAnimationFrame(loop);
  setTimeout(centerWorldToCloud, 50);
} // <— this closes drawScene()


  useEffect(() => {
    if (!goldId || !goldUntil) return
    const id = setInterval(() => {
      if (Date.now() >= goldUntil) {
        for (const n of nodesRef.current) { if (n?.style) { try { n.style.fill = BLACK_N } catch {} } }
        clearInterval(id)
      }
    }, 250)
    return () => clearInterval(id)
  }, [goldId, goldUntil])

  return <div ref={wrapRef} style={{ width: '100%', height: '100%' }} />
} 