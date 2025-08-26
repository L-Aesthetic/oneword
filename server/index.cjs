require('dotenv').config();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

if (typeof fetch === 'undefined') { global.fetch = require('undici').fetch }
let LAST_LLM_ERROR = null;

// NEW: prod hardening
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');


/* ---------- AI Sentiment Tagger (optional; gated by AI_SENTIMENT + key) ---------- */
const ALLOWED_SENT = new Set(['joy','sadness','anger','fear','calm','strength','hope','love','other']);

function coerceLabel(s) {
  const t = String(s || '').toLowerCase().trim();
  if (!t) return 'other';
  if (t.startsWith('joy') || t.includes('happi')) return 'joy';
  if (t.includes('sad')   || t.includes('sorrow') || t.includes('grief')) return 'sadness';
  if (t.includes('anger') || t.includes('angry')  || t.includes('mad') || t.includes('furio')) return 'anger';
  if (t.includes('fear')  || t.includes('anx')    || t.includes('worr') || t.includes('nerv')) return 'fear';
  if (t.includes('calm')  || t.includes('peace')  || t.includes('seren') || t.includes('still')) return 'calm';
  if (t.includes('strong')|| t.includes('strength') || t.includes('brave') || t.includes('resilien')) return 'strength';
  if (t.includes('hope')) return 'hope';
  if (t.includes('love')  || t.includes('affection') || t.includes('compassion') || t.includes('tender')) return 'love';
  if (ALLOWED_SENT.has(t)) return t;
  return 'other';
}

// ===== OpenAI (optional) =====
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY || '';
const LLM_MODEL      = process.env.LLM_MODEL || 'gpt-4o-mini';
const LLM_BASE_URL   = process.env.LLM_BASE_URL || 'https://api.openai.com';
const AI_SENTIMENT   = String(process.env.AI_SENTIMENT || '0') === '1';
const AI_ON          = AI_SENTIMENT && !!OPENAI_API_KEY;
const OPENAI_ORG     = process.env.OPENAI_ORG || process.env.OPENAI_ORGANIZATION || '';
const OPENAI_PROJECT = process.env.OPENAI_PROJECT || '';

console.log(`[oneword] AI sentiment ${AI_ON ? `ON (${LLM_MODEL})` : 'OFF'}; base=${LLM_BASE_URL}`);

function buildOpenAIHeaders() {
  const h = {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  };
  if (OPENAI_ORG) h['OpenAI-Organization'] = OPENAI_ORG;
  if (OPENAI_PROJECT) h['OpenAI-Project'] = OPENAI_PROJECT;
  return h;
}

async function openai(path, payload) {
  if (!AI_ON) return null;
  try {
    const res = await fetch(`${LLM_BASE_URL}/v1/${path}`, {
      method: 'POST',
      headers: buildOpenAIHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.error(`[oneword] OpenAI ${path} ${res.status} ${txt}`);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error('OpenAI call failed', path, e);
    return null;
  }
}

// Chat-first, Responses-second
async function llmTagSentiment(word, translated) {
  if (!AI_ON) return null;
  const userWord = (translated || word || '').toString().slice(0,64);
  const sys  = 'Return exactly one of: joy, sadness, anger, fear, calm, strength, hope, love, other.';
  const user = `You are a strict one-word emotion tagger. Given ONE user word, return exactly one label from: [joy, sadness, anger, fear, calm, strength, hope, love, other]. No explanation. Just the label. Word: ${userWord}`;

  try {
    // Try chat/completions
    const chat = await openai('chat/completions', {
      model: LLM_MODEL,
      temperature: 0,
      messages: [
        { role: 'system', content: sys },
        { role: 'user',   content: user }
      ]
    });
    let raw = chat?.choices?.[0]?.message?.content;
    if (raw) {
      const label = coerceLabel(raw);
      return ALLOWED_SENT.has(label) ? label : 'other';
    }

    // Fallback: responses
    const res = await fetch(`${LLM_BASE_URL}/v1/responses`, {
      method: 'POST',
      headers: buildOpenAIHeaders(),
      body: JSON.stringify({
        model: LLM_MODEL,
        input: `${sys}\n${user}`,
        temperature: 0
      })
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.error(`[oneword] OpenAI responses ${res.status} ${txt}`);
      return null;
    }
    const data = await res.json();
    raw = data?.output_text
       || (Array.isArray(data?.content) && data.content.map(c => c?.text).filter(Boolean).join(' '))
       || '';
    const label = coerceLabel(raw);
    return ALLOWED_SENT.has(label) ? label : 'other';
  } catch (e) {
    console.warn('[oneword] LLM sentiment failed; using fallback:', e?.message || e);
    return null;
  }
}

/* OneWord API — Express + LokiJS (file-backed) */
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const Loki = require('lokijs');

/* ---------- Privacy & sampling knobs ---------- */
const K_MIN = parseInt(process.env.K_MIN || '20', 10);
const DESIRED_REPS = 600;
const LONG_TAIL_PCT = 0.12;
const GLOBAL_BIN_CAP_FRACTION = 0.15;
/* --------------------------------------------- */

const PORT = Number(process.env.PORT) || 8787;

const DB_FILE = (() => {
  const envPath = process.env.FILE_DB_PATH;
  if (envPath) {
    // resolve relative to this server file, so it works no matter where node is started
    const p = path.isAbsolute(envPath) ? envPath : path.resolve(__dirname, envPath);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    return p;
  }
  const dir = path.join(__dirname, 'data'); // ← also __dirname here
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, 'oneword.db.json');
})();

/* ---------- Profanity (simple exact-match list) ---------- */
const BAD_WORDS = new Set([
  'fuck','shit','bitch','cunt','asshole','dick','pussy','slut','bastard',
  'prick','whore','nigger','nigga'
]);
function isProfane(token) {
  const t = (token || '').trim().toLowerCase();
  return BAD_WORDS.has(t);
}

/* ---------- Sentiment (light lexicon) ---------- */
const LEX = {
  joy: ['joy','happy','glad','grateful','love','excited','thrill','delight','smile','bliss'],
  sadness: ['sad','tired','down','blue','lonely','cry','sorrow','grief','hurt'],
  anger: ['angry','mad','rage','furious','irritated','annoyed','resent','hate'],
  fear: ['fear','afraid','scared','anxious','worry','panic','nervous','terrified'],
  calm: ['calm','peace','quiet','still','rest','serene','chill','easy'],
  strength: ['strong','strength','brave','bold','power','grit','steady','坚强','قوة','힘'],
  hope: ['hope','hopeful','optimistic','bright','faith','trust','期待','esperanza'],
  love: ['love','caring','kind','compassion','tender','affection','fond']
};
/* ---------- Sentiment (server; exact word match) ---------- */
function normalizeToken(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z\u00C0-\u024f\u0400-\u04FF\u0600-\u06FF\u4E00-\u9FFF]+/gu, '');
}

const SENT_MAP = new Map([
  ['love','love'], ['loved','love'], ['loving','love'], ['lovely','love'], ['beloved','love'],
  ['adore','love'], ['adoration','love'], ['affection','love'], ['caring','love'], ['compassion','love'],
  ['hope','hope'], ['hopeful','hope'], ['hoping','hope'], ['optimistic','hope'], ['optimism','hope'],
  ['faith','hope'], ['trust','hope'], ['esperanza','hope'], ['期待','hope'],
  ['joy','joy'], ['joyful','joy'], ['happy','joy'], ['happiness','joy'], ['glad','joy'],
  ['delight','joy'], ['smile','joy'], ['bliss','joy'], ['grateful','joy'], ['gratitude','joy'],
  ['sad','sadness'], ['sadness','sadness'], ['down','sadness'], ['unhappy','sadness'],
  ['lonely','sadness'], ['blue','sadness'], ['cry','sadness'], ['sorrow','sadness'], ['grief','sadness'], ['tired','sadness'],
  ['anger','anger'], ['angry','anger'], ['mad','anger'], ['furious','anger'],
  ['irritated','anger'], ['annoyed','anger'], ['resentment','anger'], ['hate','anger'],
  ['rage','anger'], // added
  ['fear','fear'], ['afraid','fear'], ['scared','fear'], ['anxious','fear'], ['anxiety','fear'],
  ['worry','fear'], ['panic','fear'], ['nervous','fear'], ['terrified','fear'],
  ['calm','calm'], ['peace','calm'], ['peaceful','calm'], ['serene','calm'],
  ['quiet','calm'], ['still','calm'], ['rest','calm'], ['chill','calm'], ['easy','calm'], ['ok','calm'], ['okay','calm'],
  ['strength','strength'], ['strong','strength'], ['brave','strength'], ['bold','strength'],
  ['power','strength'], ['grit','strength'], ['steady','strength'], ['resilient','strength'],
  ['قوة','strength'], ['힘','strength'],
  ['빛','other'], ['归来','other'], ['memoria','other'], ['amanecer','other'],
]);

const FALLBACK_SETS = {
  joy: new Set(['joy','joyful','happiness','grateful','gratitude','delight','smile','bliss','cheerful']),
  sadness: new Set(['sad','sadness','lonely','blue','cry','sorrow','grief','hurt','downcast','down']),
  anger: new Set(['anger','angry','mad','furious','irritated','annoyed','resentment','hate','wrath','rage']), // added
  fear: new Set(['fear','afraid','scared','anxious','anxiety','worry','panic','nervous','terrified']),
  calm: new Set(['calm','peace','peaceful','quiet','still','rest','serene','chill','easy','ok','okay']),
  strength: new Set(['strong','strength','brave','bold','power','grit','steady','resilient']),
  hope: new Set(['hope','hopeful','hoping','optimistic','optimism','faith','trust','esperanza','期待']),
  love: new Set(['love','loving','loved','lovely','beloved','adore','adoration','caring','compassion','tender','affection','fond']),
};

function classifySentiment(word, translated) {
  const toks = [normalizeToken(translated), normalizeToken(word)].filter(Boolean);
  // exact map first (prefer translated)
  for (const t of toks) {
    if (SENT_MAP.has(t)) return SENT_MAP.get(t);
  }
  // fallback sets next
  for (const t of toks) {
    for (const [label, set] of Object.entries(FALLBACK_SETS)) {
      if (set.has(t)) return label;
    }
  }
  return 'other';
}

/* ---- helpers ---- */
const crypto = require('crypto');
function randomUUID() {
  return crypto.randomUUID ? crypto.randomUUID() :
    ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.randomBytes(1)[0] & 15 >> c / 4).toString(16)
    );
}
const STOP_SUFFIX = ['ful','ing','ed','s','ly','ness','ment','tion','ity'];
function normalizeConcept(word, translated) {
  const base = (translated || word || '').toLowerCase();
  if (/^[a-z]+$/.test(base)) {
    for (const suf of STOP_SUFFIX) {
      if (base.endsWith(suf) && base.length - suf.length >= 3) return base.slice(0, -suf.length);
    }
  }
  return base;
}
function guessLang(t) {
  if (/^[A-Za-z\-']+$/.test(t)) return 'en';
  if (/[\u4e00-\u9fff]/.test(t)) return 'zh';
  if (/[\u3040-\u30ff]/.test(t)) return 'ja';
  if (/[\u0600-\u06FF]/.test(t)) return 'ar';
  if (/[\u0400-\u04FF]/.test(t)) return 'ru';
  return 'und';
}
function randRegion() {
  const regions = ['NYC','LA','CHI','MIA','TX','CA-BC','UK-LON','FR-PAR','NG-LAG','JP-TYO','BR-SP','HT-PAP'];
  return regions[Math.floor(Math.random()*regions.length)];
}
function baseSample() {
  return [
    { word: 'hope', lang: 'en' }, { word: 'hopeful', lang: 'en' },
    { word: 'esperanza', lang: 'es', translated: 'hope' },
    { word: '힘', lang: 'ko', translated: 'strength' }, { word: 'strength', lang: 'en' },
    { word: 'free', lang: 'en' }, { word: 'libre', lang: 'fr', translated: 'free' },
    { word: '归来', lang: 'zh', translated: 'return' }, { word: 'return', lang: 'en' },
    { word: 'calma', lang: 'pt', translated: 'calm' }, { word: 'calm', lang: 'en' },
    { word: 'tired', lang: 'en' }, { word: '疲れ', lang: 'ja', translated: 'tired' },
    { word: '빛', lang: 'ko', translated: 'light' }, { word: 'light', lang: 'en' },
    { word: 'remember', lang: 'en' }, { word: 'memoria', lang: 'it', translated: 'memory' },
    { word: 'amanecer', lang: 'es', translated: 'dawn' }, { word: 'قوة', lang: 'ar', translated: 'strength' },
  ];
}
// === Multilingual seed bank grouped by emotion ===
const SEED_BANK = {
  joy: [
    ['joy','en','joy'], ['alegría','es','joy'], ['felicidad','es','happiness'],
    ['joie','fr','joy'], ['felicità','it','happiness'], ['felicidade','pt','happiness'],
    ['喜び','ja','joy'], ['快乐','zh','happiness'], ['радость','ru','joy'],
  ],
  sadness: [
    ['sadness','en','sadness'], ['tristeza','es','sadness'], ['tristesse','fr','sadness'],
    ['tristezza','it','sadness'], ['tristeza','pt','sadness'], ['悲しみ','ja','sadness'],
    ['忧伤','zh','sadness'], ['печаль','ru','sadness'],
  ],
  anger: [
    ['anger','en','anger'], ['ira','es','anger'], ['colère','fr','anger'],
    ['rabbia','it','anger'], ['raiva','pt','anger'], ['怒り','ja','anger'],
    ['愤怒','zh','anger'], ['злость','ru','anger'], ['rage','en','anger'], ['furia','es','anger'],
    ['غضب','ar','anger'],
  ],
  fear: [
    ['fear','en','fear'], ['miedo','es','fear'], ['peur','fr','fear'],
    ['paura','it','fear'], ['medo','pt','fear'], ['恐れ','ja','fear'],
    ['恐惧','zh','fear'], ['страх','ru','fear'], ['خوف','ar','fear'],
  ],
  calm: [
    ['calm','en','calm'], ['paz','es','peace'], ['paix','fr','peace'],
    ['serenità','it','serenity'], ['serenidade','pt','serenity'], ['静けさ','ja','calm'],
    ['宁静','zh','serenity'], ['heiwa','ja','peace'], ['tranquilo','es','calm'],
  ],
  strength: [
    ['strength','en','strength'], ['fuerza','es','strength'], ['força','pt','strength'],
    ['forza','it','strength'], ['сила','ru','strength'], ['힘','ko','strength'],
    ['力','ja','strength'], ['力','zh','strength'], ['قوة','ar','strength'],
  ],
  hope: [
    ['hope','en','hope'], ['esperanza','es','hope'], ['espoir','fr','hope'],
    ['speranza','it','hope'], ['esperança','pt','hope'], ['希望','zh','hope'],
    ['希望','ja','hope'], ['надежда','ru','hope'], ['امید','fa','hope'],
  ],
  love: [
    ['love','en','love'], ['amor','es','love'], ['amour','fr','love'],
    ['amore','it','love'], ['amor','pt','love'], ['爱','zh','love'],
    ['愛','ja','love'], ['любовь','ru','love'], ['حب','ar','love'],
  ],
  other: [
    ['libertad','es','freedom'], ['自由','zh','freedom'], ['自由','ja','freedom'],
    ['free','en','free'], ['libre','fr','free'], ['amanecer','es','dawn'],
    ['빛','ko','light'], ['归来','zh','return'], ['memoria','it','memory'],
  ],
};

// Pick N items at random across labels with a balanced mix
function seedRandom(n = 200) {
  const labels = Object.keys(SEED_BANK);
  const out = [];
  // aim for ~80% labeled emotions, ~20% other
  const targetOther = Math.floor(n * 0.2);
  let otherCount = 0;

  while (out.length < n) {
    const pickLabel = (otherCount < targetOther)
      ? (Math.random() < 0.2 ? 'other' : labels[Math.floor(Math.random()* (labels.length - 1))]) // bias away from 'other'
      : labels[Math.floor(Math.random()* (labels.length - 1))];

    const bank = SEED_BANK[pickLabel];
    const tuple = bank[Math.floor(Math.random()*bank.length)];
    const [word, lang, translated] = tuple;

    out.push({
      id: randomUUID(),
      word,
      translated,
      lang,
      concept_key: normalizeConcept(word, translated),
      userRegion: randRegion(),
      country: 'UNK',
      gh3: null, gh4: null,
      ts: Date.now() - Math.floor(Math.random() * 86_400_000), // within last 24h
      sentiment: (pickLabel === 'other') ? 'other' : pickLabel, // lock label for demo sanity
    });
    if (pickLabel === 'other') otherCount++;
  }
  return out;
}

async function aiModerateWord(word) {
  if (!OPENAI_API_KEY || !AI_ON) return null;
  const data = await openai('moderations', {
    model: 'omni-moderation-latest',
    input: String(word || '')
  });
  const flagged = !!data?.results?.[0]?.flagged;
  return { flagged, raw: data };
}
async function aiTranslateWord(word) {
  if (!OPENAI_API_KEY || !AI_ON) return null;
  const data = await openai('chat/completions', {
    model: 'gpt-4o-mini',
    temperature: 0,
    messages: [
      { role: 'system', content: "Translate the SINGLE word to English as a plain word, no punctuation. If it's already English, echo it." },
      { role: 'user',   content: String(word || '') }
    ]
  });
  const out = (data?.choices?.[0]?.message?.content || '').trim();
  return out || null;
}

/* Tiny demo “translator” */
const tinyDict = new Map([
  ['esperanza','hope'], ['libre','free'], ['calma','calm'], ['归来','return'],
  ['疲れ','tired'], ['빛','light'], ['amanecer','dawn'], ['قوة','strength'],
]);
function translateStub(word) { return tinyDict.get((word||'').toLowerCase()) || word; }

/* ---------- Geohash (simple) ---------- */
const GH_BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
function geohashEncode(lat, lon, precision=4) {
  let idx = 0, bit = 0, even = true, hash = '';
  let latMin=-90, latMax=90, lonMin=-180, lonMax=180;
  while (hash.length < precision) {
    if (even) {
      const lonMid = (lonMin + lonMax)/2;
      if (lon > lonMid) { idx = idx*2+1; lonMin = lonMid; } else { idx = idx*2; lonMax = lonMid; }
    } else {
      const latMid = (latMin + latMax)/2;
      if (lat > latMid) { idx = idx*2+1; latMin = latMid; } else { idx = idx*2; latMax = latMid; }
    }
    even = !even;
    if (++bit === 5) { hash += GH_BASE32.charAt(idx); bit = 0; idx = 0; }
  }
  return hash;
}

/* ---------- Bin mapping for K-anonymity ---------- */
const REGION_TO_COUNTRY = new Map([
  ['NYC','US'], ['LA','US'], ['CHI','US'], ['MIA','US'], ['TX','US'],
  ['CA-BC','CA'], ['UK-LON','UK'], ['FR-PAR','FR'], ['NG-LAG','NG'],
  ['JP-TYO','JP'], ['BR-SP','BR'], ['HT-PAP','HT'],
]);
function countryOf(region) {
  if (!region) return 'UNK';
  if (REGION_TO_COUNTRY.has(region)) return REGION_TO_COUNTRY.get(region);
  const dash = region.indexOf('-');
  if (dash > 0) return region.slice(0, dash).toUpperCase();
  if (region.length === 2) return region.toUpperCase();
  const usHints = ['NYC','LA','SF','CHI','MIA','DAL','HOU','SEA','BOS','ATX','PHX','TX','FL','CA','WA','MA','IL','NY','NJ','PA'];
  if (usHints.includes(region.toUpperCase())) return 'US';
  return 'UNK';
}
function computeSafeBins(rows) {
  const fineCounts = new Map();
  const countryCounts = new Map();
  for (const r of rows) {
    const fine = r.userRegion || 'UNK';
    const c = r.country || countryOf(fine);
    fineCounts.set(fine, (fineCounts.get(fine) || 0) + 1);
    countryCounts.set(c, (countryCounts.get(c) || 0) + 1);
  }
  const pickBin = (fine, ctry) => {
    const c = ctry || countryOf(fine);
    if ((fineCounts.get(fine) || 0) >= K_MIN) return fine;
    if ((countryCounts.get(c) || 0) >= K_MIN) return c;
    return 'GLOBAL';
  };
  return rows.map(r => ({ row: r, safeBin: pickBin(r.userRegion || 'UNK', r.country) }));
}

/* ---------- Scoring ---------- */
function recencyWeight(ts) {
  const ageH = (Date.now() - ts) / 3_600_000;
  if (ageH <= 0.5) return 1.0;
  if (ageH <= 6) return 0.75;
  if (ageH <= 24) return 0.45;
  return 0.25;
}

/* ---------- DB ---------- */
let db;
let words;

/* ---------- SSE clients ---------- */
const clients = new Set();
const SSE_PING_MS = Math.max(5000, parseInt(process.env.SSE_PING_MS || '20000', 10));
function sseWrite(res, obj) { res.write(`data: ${JSON.stringify(obj)}\n\n`); }
setInterval(() => {
  for (const res of clients) { try { res.write('event: ping\ndata: {}\n\n'); } catch {} }
}, SSE_PING_MS);

/* ---------- Fair sampler (global) ---------- */
function sampleGlobalFair(withBins) {
  const concepts = new Map();
  for (const { row, safeBin } of withBins) {
    const key = row.concept_key || normalizeConcept(row.word, row.translated || row.word);
    let c = concepts.get(key);
    if (!c) { c = { key, score: 0, rowsByBin: new Map(), bestByBin: new Map() }; concepts.set(key, c); }
    const w = recencyWeight(row.ts);
    c.score += w;
    const list = c.rowsByBin.get(safeBin) || [];
    list.push(row);
    c.rowsByBin.set(safeBin, list);
    const best = c.bestByBin.get(safeBin);
    if (!best || row.ts > best.ts) c.bestByBin.set(safeBin, row);
  }
  const conceptArr = Array.from(concepts.values()).sort((a, b) => b.score - a.score);

  const bins = new Set();
  for (const { safeBin } of withBins) if (safeBin !== 'GLOBAL') bins.add(safeBin);
  const binsCount = Math.max(1, bins.size);
  const perBinCap = Math.max(5, Math.min(40, Math.ceil((DESIRED_REPS / binsCount) * 2)));
  const globalCap = Math.max(10, Math.floor(DESIRED_REPS * GLOBAL_BIN_CAP_FRACTION));
  const counts = new Map();
  const usedConcept = new Set();
  const repRows = [];

  for (const c of conceptArr) {
    if (repRows.length >= DESIRED_REPS) break;
    let pickBin = null, pickRow = null, pickCount = -1;
    for (const [bin, rows] of c.rowsByBin.entries()) {
      if (bin === 'GLOBAL') continue;
      if (rows.length > pickCount) { pickCount = rows.length; pickBin = bin; pickRow = c.bestByBin.get(bin); }
    }
    if (!pickRow) { pickBin = 'GLOBAL'; pickRow = c.bestByBin.get('GLOBAL') || (Array.from(c.bestByBin.values())[0]); }
    const cap = (pickBin === 'GLOBAL') ? globalCap : perBinCap;
    const used = counts.get(pickBin) || 0;
    if (used >= cap) continue;
    if (pickRow && !usedConcept.has(c.key)) {
      repRows.push({ row: pickRow, safeBin: pickBin });
      counts.set(pickBin, used + 1);
      usedConcept.add(c.key);
    }
  }

  const tailStart = Math.floor(conceptArr.length * 0.4);
  const tailPool = conceptArr.slice(tailStart);
  const wantTail = Math.max(0, Math.floor(DESIRED_REPS * LONG_TAIL_PCT));
  const tailRows = [];
  for (let i = 0, tries = 0; i < wantTail && tries < tailPool.length * 2; tries++) {
    const c = tailPool[Math.floor(Math.random() * tailPool.length)];
    if (!c || usedConcept.has(c.key)) continue;
    let r = null;
    for (const [bin, row] of c.bestByBin.entries()) { if (bin !== 'GLOBAL') { r = row; break; } }
    if (!r) r = c.bestByBin.get('GLOBAL') || Array.from(c.bestByBin.values())[0];
    if (r) { tailRows.push({ row: r, safeBin: r.country || 'GLOBAL' }); usedConcept.add(c.key); i++; }
  }

  const seenIds = new Set(repRows.map(x => x.row.id));
  for (const t of tailRows) seenIds.add(t.row.id);
  const freshRows = withBins
    .slice()
    .sort((a, b) => b.row.ts - a.row.ts)
    .filter(x => !seenIds.has(x.row.id));

  return [...repRows, ...tailRows, ...freshRows];
}

/* ---------- Server ---------- */
function startServer() {
  const app = express();
  app.disable('x-powered-by');                     // ← hide Express fingerprint
  const allowOrigin = process.env.CORS_ORIGIN || '*';
  console.log('[oneword] CORS allow origin =', allowOrigin);


  // trust proxy for correct IPs behind render/fly/nginx, etc.
  if (String(process.env.TRUST_PROXY || '1') === '1') app.set('trust proxy', true);

  // security + logs
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(morgan('combined'));

  // CORS + JSON
  app.use(cors({ origin: allowOrigin, methods: ['GET','POST'], credentials: false }));
  app.use(express.json({ limit: '128kb' }));

  // light rate limits (protects read spam + write abuse)
  const readLimiter  = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ error: 'Too many requests' }),
});
const writeLimiter = rateLimit({
  windowMs: 60_000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ error: 'Too many requests' }),
});

  app.use('/api/window', readLimiter);
  app.use('/api/submitWord', writeLimiter);


  app.get('/api/debug-ai', (_req, res) => {
    res.json({
      AI_SENTIMENT: String(process.env.AI_SENTIMENT || ''),
      hasKey: !!(process.env.OPENAI_API_KEY || process.env.LLM_API_KEY),
      model: process.env.LLM_MODEL || 'gpt-4o-mini',
      on: AI_ON
    });
  });

  app.get('/api/ping', (_req, res) => res.json({ ok: true, time: Date.now(), K_MIN }));

  /* ---- SSE ---- */
 app.get('/api/stream', (req, res) => {
  const allowOrigin = process.env.CORS_ORIGIN || '*';
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': allowOrigin,
    'Vary': 'Origin',
  });
  res.flushHeaders?.();
  res.write('\n');
  clients.add(res);
  const remove = () => clients.delete(res);
  req.on('close', remove);
  req.on('error', remove);              // ← also clean up on error
});


  // Submit a single word
  app.post('/api/submitWord', async (req, res) => {
    try {
      const rawInput = req.body?.word;
      
if (typeof rawInput !== 'string') return res.status(400).json({ error: 'Provide a single word' });

const raw = rawInput.trim();
if (!raw || /\s/.test(raw)) return res.status(400).json({ error: 'Provide a single word' });
if (raw.length > 64) return res.status(400).json({ error: 'Word too long (max 64 chars)' });


      if (isProfane(raw)) return res.status(400).json({ error: 'That word is blocked.' });

      const mod = await aiModerateWord(raw);
      if (mod?.flagged) return res.status(400).json({ error: 'That word is blocked.' });

// Cooldown is ON by default. Only bypass if you *explicitly* allow it.
const DEV_BYPASS =
  process.env.DEV_ALLOW_MULTI === '1' ||
  req.get('x-dev-allow') === '1';


      if (!DEV_BYPASS) {
  const now = Date.now();
  const cutoff = now - 24 * 60 * 60 * 1000;
  const ip = String(req.ip || req.headers['x-forwarded-for'] || '0.0.0.0');
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
  const recent = words
    .chain()
    .find({ ipHash, ts: { $gt: cutoff } })
    .simplesort('ts', true)
    .limit(1)
    .data();

  if (recent.length) {
    const lastTs = recent[0].ts || now;
    const retryAt = lastTs + 24 * 60 * 60 * 1000;
    const secs = Math.max(1, Math.ceil((retryAt - now) / 1000));
    return res
      .status(429)
      .set('Retry-After', String(secs))
      .json({ error: 'Only one word a day; try again in 24 hours.', retryAt });
  }
}

      const lang = guessLang(raw);
      let translated = translateStub(raw);
      if (OPENAI_API_KEY && AI_ON) {
        const aiT = await aiTranslateWord(raw);
        if (aiT && typeof aiT === 'string') translated = aiT;
      }

      // geo (optional)
      const lat = typeof req.body?.lat === 'number' ? req.body.lat : undefined;
      const lng = typeof req.body?.lng === 'number' ? req.body.lng : undefined;
      const gh4 = (lat != null && lng != null) ? geohashEncode(lat, lng, 4) : null;
      const gh3 = (lat != null && lng != null) ? geohashEncode(lat, lng, 3) : null;

      const userRegion = req.body?.region?.toString() || (gh4 ? `GH4:${gh4}` : randRegion());
      const country = gh3 ? `GH3:${gh3}` : countryOf(userRegion);

      const ipStr = String(req.ip || req.headers['x-forwarded-for'] || '0.0.0.0');
      const ipHash = DEV_BYPASS ? undefined : crypto.createHash('sha256').update(ipStr).digest('hex').slice(0, 16);

      // AI first; fallback heuristic
      let usedAI = false;
      let sent = await llmTagSentiment(raw, translated);
      if (sent) usedAI = true;
      else sent = classifySentiment(raw, translated);

      const item = {
        id: randomUUID(),
        word: raw,
        translated,
        lang,
        concept_key: normalizeConcept(raw, translated),
        userRegion,
        country,
        gh3, gh4,
        sentiment: sent,
        sent_by: usedAI ? 'ai' : 'heuristic',
        ts: Date.now(),
        ...(DEV_BYPASS ? {} : { ipHash }),
      };

      words.insert(item);
      db.saveDatabase();

      // pass through client-supplied correlation id (used by FE to drop SSE echoes)
const cid = (typeof req.body?.cid === 'string' && req.body.cid.length <= 128) ? req.body.cid : undefined;

const payload = {
  id: item.id,
  word: item.word,
  translated: item.translated || item.word,
  lang: item.lang || 'en',
  ts: item.ts,
  userRegion,
  country: item.country || 'UNK',
  gh3: item.gh3,
  gh4: item.gh4,
  sentiment: item.sentiment,
  cid,
};

for (const resClient of clients) {
  try {
    // echo cid at the top level of the SSE event for instant client-side filtering
    sseWrite(resClient, cid ? { type: 'word', cid, payload } : { type: 'word', payload });
  } catch {}
}

if (process.env.NODE_ENV !== 'production') payload.sent_by = item.sent_by || (AI_ON ? 'ai' : 'heuristic');
// include nextAllowedAt so the FE can start the local countdown immediately (24h window)
const nextAllowedAt = Date.now() + 24 * 60 * 60 * 1000;
// also include cid back in the HTTP response (handy but optional for FE)
return res.json(
  cid ? { ...payload, cid, nextAllowedAt } : { ...payload, nextAllowedAt }
);


    } catch (e) {
      console.error('submitWord error', e);
      if (process.env.NODE_ENV !== 'production') {
        return res.status(500).json({ error: `Server error: ${e?.message || e}` });
      }
      return res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/api/window', (req, res) => {
  res.set('Cache-Control', 'no-store'); // ← list should never be cached
  try {
    const zoom = String(req.query.zoom || 'global');
    const range = String(req.query.range || 'week');
    const wantSent = String(req.query.sentiment || 'all');

    // NEW: derive user bins from query lat/lng (sent by the client if user granted location)
    const lat = req.query.lat != null ? parseFloat(req.query.lat) : undefined;
    const lng = req.query.lng != null ? parseFloat(req.query.lng) : undefined;
    const myGH4 = Number.isFinite(lat) && Number.isFinite(lng) ? geohashEncode(lat, lng, 4) : null;
    const myGH3 = Number.isFinite(lat) && Number.isFinite(lng) ? geohashEncode(lat, lng, 3) : null;
    const myCountry = myGH3 ? `GH3:${myGH3}` : null;

    const now = Date.now();
    const lookbackMs =
      range === 'today' ? 24*60*60*1000 :
      range === 'week'  ? 7*24*60*60*1000 :
                          30*24*60*60*1000;

    const since = now - lookbackMs;

    const recent = words.chain()
      .find({ ts: { $gt: since } })
      .simplesort('ts', true)
      .limit(3000)
      .data();

    let base = recent;

    // Top-up for sparse windows
    if (base.length < 600) {
      const topup = words.chain().simplesort('ts', true).limit(2000).data();
      const seen = new Set(base.map(r => r.id));
      for (const r of topup) if (!seen.has(r.id)) base.push(r);
    }

    // Emotion filter
    if (wantSent !== 'all') {
      base = base.filter(r =>
        (r.sentiment || classifySentiment(r.word, r.translated)) === wantSent
      );
    }

    // NEW: apply geo zoom filters (server side) if we have bins
    if (zoom === 'local'   && myGH4)     base = base.filter(r => r.gh4 === myGH4);
    if (zoom === 'region'  && myGH3)     base = base.filter(r => r.gh3 === myGH3);
    if (zoom === 'country' && myCountry) base = base.filter(r => r.country === myCountry);

    // Bin and sample
    const withBins = computeSafeBins(base);
    let sampled;
    if (zoom === 'global') {
      sampled = sampleGlobalFair(withBins);
    } else {
      sampled = withBins.sort((a, b) => b.row.ts - a.row.ts);
    }

    const payload = sampled.map(({ row, safeBin }) => ({
      id: row.id,
      word: row.word,
      translated: row.translated || row.word,
      lang: row.lang || 'en',
      ts: row.ts,
      userRegion: safeBin,
      country: row.country || 'UNK',
      gh3: row.gh3 || null,
      gh4: row.gh4 || null,
      sentiment: row.sentiment || classifySentiment(row.word, row.translated),
    }));

    res.json(payload);
  } catch (e) {
    console.error('/api/window error', e);
    res.status(500).json({ error: 'Server error' });
  }
});

  // --- DEV: bulk re-tag
  if (process.env.NODE_ENV !== 'production') {
    app.post('/api/dev/retag', async (req, res) => {
      if (!AI_ON) return res.status(400).json({ error: 'AI is OFF (gate or missing API key)' });

      const limit = Math.max(1, Math.min(20000, parseInt(req.query.limit || '5000', 10)));
      const dry   = req.query.dry === '1';

      const rows = words.chain().simplesort('ts', false).limit(limit).data();

      let scanned = 0, changed = 0;
      for (const r of rows) {
        scanned++;
        const fresh = await llmTagSentiment(r.word, r.translated || r.word);
        if (fresh && fresh !== r.sentiment) {
          if (!dry) { r.sentiment = fresh; r.sent_by = 'ai'; words.update(r); }
          changed++;
        }
      }
      if (!dry) db.saveDatabase();
      res.json({ ok: true, scanned, changed, dry, limit });
    });
  }
// --- DEV: clear DB and reseed N random words (default 200)
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/dev/clear-and-seed', (req, res) => {
    try {
      const n = Math.max(1, Math.min(5000, parseInt(req.query.n || '200', 10)));
      // Clear existing rows but keep collection & indexes
      words.clear();

      const batch = seedRandom(n); // from SEED_BANK above
      for (const row of batch) {
        // ensure concept_key and sentiment are present even if you edit SEED_BANK later
        row.concept_key = row.concept_key || normalizeConcept(row.word, row.translated || row.word);
        row.sentiment   = row.sentiment || classifySentiment(row.word);
        words.insert(row);
      }
      db.saveDatabase();

      // Let connected clients see fresh stream activity (optional ping)
      for (const resClient of clients) {
        try { sseWrite(resClient, { type: 'ping', payload: { reset: true } }); } catch {}
      }

      res.json({ ok: true, seeded: batch.length });
    } catch (e) {
      console.error('clear-and-seed error', e);
      res.status(500).json({ ok: false, error: e?.message || 'error' });
    }
  });
}
  // Unconditional probe route (gated by header in production)
  app.get('/api/dev/test-tag', async (req, res) => {
    if (process.env.NODE_ENV === 'production' && req.get('x-dev-allow') !== '1') {
      return res.status(404).end();
    }
    const w = String(req.query.word || 'rage');
    const out = await llmTagSentiment(w, w); // null on failure
    res.json({ ai_on: AI_ON, word: w, llm_label: out });
  });

    // --- serve Vite build from Express (single-process deploy) ---
  const distDir = path.join(__dirname, '..', 'dist');
  app.use(express.static(distDir));
  app.get('*', (_req, res) => {
  res.set('Cache-Control', 'no-store'); // ← prevent stale HTML shell
  res.sendFile(path.join(distDir, 'index.html'));
});


  app.listen(PORT, () => {
  console.log(`[oneword] API listening on :${PORT}  (K_MIN=${K_MIN})`);
});
}


/* ---- Boot ---- */
function onLoad() {
  words = db.getCollection('words');
  if (!words) {
    words = db.addCollection('words', { indices: ['concept_key', 'ts', 'userRegion', 'country', 'gh3', 'gh4', 'ipHash'] });
  }
  if (words.count() === 0) {
    const seed = baseSample();
    const now = Date.now();
    for (let i = 0; i < 400; i++) {
      const s = seed[i % seed.length];
      const translated = s.translated || translateStub(s.word);
      words.insert({
        id: randomUUID(),
        word: s.word,
        translated,
        lang: s.lang || guessLang(s.word),
        concept_key: normalizeConcept(s.word, translated),
        userRegion: randRegion(),
        country: 'UNK',
        gh3: null, gh4: null,
        ts: now - Math.floor(Math.random() * 86_400_000),
        sentiment: classifySentiment(s.word),
      });
    }
    db.saveDatabase();
  }
  startServer();
}

function bootDB() {
  console.log('[oneword] DB file at', DB_FILE);
  db = new Loki(DB_FILE, {
    autoload: true,
    autoloadCallback: onLoad,
    autosave: true,
    autosaveInterval: 2000,
  });
}
bootDB();