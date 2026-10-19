/* ── AppNest · Cloudflare Pages fix (Oct 2026) ──
   Cloudflare redirects *.html to clean URLs (/index.html -> /). Chrome refuses a
   "redirected" response that a Service Worker hands to a page load (ERR_FAILED).
   This strips the redirect flag from every response the SW fetches or reads from cache. */
(function(){
var NB={101:1,204:1,205:1,304:1};
function clean(r){
if(!r||!r.redirected||NB[r.status])return r;
return r.blob().then(function(b){return new Response(b,{status:r.status,statusText:r.statusText,headers:r.headers});});
}
var _fetch=self.fetch.bind(self);
self.fetch=function(input,init){
if(input&&typeof input==='object'&&input.mode==='navigate')input=input.url;
return _fetch(input,init).then(clean);
};
var cm=Cache.prototype.match;
Cache.prototype.match=function(){return cm.apply(this,arguments).then(clean);};
var sm=CacheStorage.prototype.match;
CacheStorage.prototype.match=function(){return sm.apply(this,arguments).then(clean);};
})();

/* ── צדיק נולד · Service Worker ──
   כללי AppNest (חלקים י״ב, ט״ז, י״ח, ל״ג):
   - כל קובץ נשמר לחוד (allSettled) — לא addAll אטומי.
   - ניווט: רשת עם זמן קצוב ← מטמון ← דף אופליין ידידותי. אף פעם לא Response.error().
   - רק שורש האפליקציה נשמר כ-"./" (לא כל דף כ-index.html).
   - קבצי נתונים עם ?v= ואותה כתובת בדיוק ברשימת CORE (בלי ignoreSearch).
   - מעלים VERSION ו-DATA_V יחד, ביחד עם index.html. */
const VERSION = 'tznolad-v22';
const DATA_V = '22';           // חייב להיות זהה ל-DATA_V ב-index.html
const CORE = [
  './',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'art/guide-bentsch-01.svg',
  'art/guide-candles-01.svg',
  'art/guide-derech-01.svg',
  'art/guide-food-01.svg',
  'art/guide-kiddush-01.svg',
  'art/guide-mitzvot-01.svg',
  'art/guide-morning-01.svg',
  'art/guide-pray-01.svg',
  'art/guide-shema-01.svg',
  'art/guide-tefillin-01.svg',
  'art/guide-tzitzit-01.svg',
  'art/guide-welcome-01.svg',
  'data/mitzvot.json?v=' + DATA_V,
  'data/siddur-index.json?v=' + DATA_V,
  'data/siddur/ashkenaz/demo.json?v=' + DATA_V,
  'data/tehillim/tehillim.json?v=' + DATA_V,
  'data/siddur/ashkenaz/shacharit.json?v=' + DATA_V,
  'data/siddur/ashkenaz/minchah.json?v=' + DATA_V,
  'data/siddur/ashkenaz/maariv.json?v=' + DATA_V,
  'data/siddur/ashkenaz/berachot.json?v=' + DATA_V,
  'data/siddur/ashkenaz/shabbat.json?v=' + DATA_V,
  'data/siddur/ashkenaz/festivals.json?v=' + DATA_V,
  'data/siddur/ashkenaz/kaddish.json?v=' + DATA_V,
  'data/siddur/sefard/upon-arising.json?v=' + DATA_V,
  'data/siddur/sefard/shacharit.json?v=' + DATA_V,
  'data/siddur/sefard/mincha.json?v=' + DATA_V,
  'data/siddur/sefard/maariv.json?v=' + DATA_V,
  'data/siddur/sefard/berachot.json?v=' + DATA_V,
  'data/siddur/sefard/shabbat.json?v=' + DATA_V,
  'data/siddur/sefard/festivals.json?v=' + DATA_V,
  'data/siddur/edot/preparatory.json?v=' + DATA_V,
  'data/siddur/edot/shacharit.json?v=' + DATA_V,
  'data/siddur/edot/mincha.json?v=' + DATA_V,
  'data/siddur/edot/arvit.json?v=' + DATA_V,
  'data/siddur/edot/assorted.json?v=' + DATA_V,
  'data/siddur/edot/shabbat.json?v=' + DATA_V,
  'data/siddur/edot/festivals.json?v=' + DATA_V,
  'data/calendar.json?v=' + DATA_V,
  'data/path.json?v=' + DATA_V,
  'data/torah/index.json?v=' + DATA_V,
  'data/torah/bereshit.json?v=' + DATA_V,
  'data/torah/shemot.json?v=' + DATA_V,
  'data/torah/vayikra.json?v=' + DATA_V,
  'data/torah/bamidbar.json?v=' + DATA_V,
  'data/torah/devarim.json?v=' + DATA_V,
  'data/halacha/index.json?v=' + DATA_V,
  'data/halacha/k01.json?v=' + DATA_V,
  'data/halacha/k02.json?v=' + DATA_V,
  'data/halacha/k03.json?v=' + DATA_V,
  'data/halacha/k04.json?v=' + DATA_V,
  'data/halacha/k05.json?v=' + DATA_V,
  'data/halacha/k06.json?v=' + DATA_V,
  'data/halacha/k07.json?v=' + DATA_V,
  'data/halacha/k08.json?v=' + DATA_V,
  'data/halacha/k09.json?v=' + DATA_V,
  'data/halacha/k10.json?v=' + DATA_V,
  'data/halacha/k11.json?v=' + DATA_V,
  'data/siddur/ashkenaz/pirkei-avot.json?v=' + DATA_V,
  'data/siddur/ashkenaz/haggadah.json?v=' + DATA_V,
  'data/siddur/sefard/pirkei-avot.json?v=' + DATA_V,
  'data/siddur/sefard/haggadah.json?v=' + DATA_V,
  'data/siddur/edot/pirkei-avot.json?v=' + DATA_V,
  'data/siddur/edot/haggadah.json?v=' + DATA_V,
  'data/chinukh/he.json?v=' + DATA_V,
  'data/chinukh/en.json?v=' + DATA_V,
  'data/guides/index.json?v=' + DATA_V,
  'data/guides/morning.json?v=' + DATA_V,
  'data/guides/tefillin.json?v=' + DATA_V,
  'data/guides/tzitzit.json?v=' + DATA_V,
  'data/guides/shema.json?v=' + DATA_V,
  'data/guides/food.json?v=' + DATA_V,
  'data/guides/bentsch.json?v=' + DATA_V,
  'data/guides/mitzvot.json?v=' + DATA_V,
  'data/guides/derech.json?v=' + DATA_V,
  'data/guides/candles.json?v=' + DATA_V,
  'data/guides/pray.json?v=' + DATA_V,
  'data/guides/kiddush.json?v=' + DATA_V
];

const OFFLINE_HTML = '<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1"><title>צדיק נולד</title>' +
  '<body style="margin:0;background:#0b0b0b;color:#e8d9a8;font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;text-align:center;padding:24px">' +
  '<div><h1 style="font-size:22px">אין חיבור כרגע</h1><p style="opacity:.8">האפליקציה עוד לא נשמרה במכשיר. התחבר/י פעם אחת לאינטרנט ונסה/י שוב.</p>' +
  '<button onclick="location.reload()" style="font-size:18px;padding:12px 28px;border-radius:12px;border:1px solid #d4af37;background:none;color:#d4af37">נסה שוב</button></div></body></html>';

self.addEventListener('install', function (e) {
  e.waitUntil((async function () {
    const c = await caches.open(VERSION);
    const rs = await Promise.allSettled(CORE.map(function (u) {
      return c.add(new Request(u, { cache: 'reload' }));
    }));
    // אם חלק מהקבצים לא ירדו — ההתקנה נכשלת, הגרסה הקודמת (והמטמון שלה) נשארת, והדפדפן ינסה שוב מאוחר יותר
    const failed = rs.filter(function (r) { return r.status === 'rejected'; }).length;
    if (failed) { await caches.delete(VERSION); throw new Error('incomplete install: ' + failed); }
    await self.skipWaiting();
  })());
});

// דוח מצב אופליין לבקשת האפליקציה
self.addEventListener('message', function (e) {
  if (!e.data || e.data.type !== 'status' || !e.ports || !e.ports[0]) return;
  (async function () {
    const c = await caches.open(VERSION), keys = await c.keys(), have = {};
    keys.forEach(function (k) { have[new URL(k.url).pathname + new URL(k.url).search] = 1; });
    const missing = CORE.filter(function (u) { const a = new URL(u, self.registration.scope); return !have[a.pathname + a.search]; });
    e.ports[0].postMessage({ version: VERSION, total: CORE.length, cached: CORE.length - missing.length, missing: missing.slice(0, 10) });
  })().catch(function () { e.ports[0].postMessage({ error: 1 }); });
});

self.addEventListener('activate', function (e) {
  e.waitUntil((async function () {
    const keys = await caches.keys();
    await Promise.all(keys.filter(function (k) { return k.indexOf('tznolad-') === 0 && k !== VERSION; })
      .map(function (k) { return caches.delete(k); }));
    await self.clients.claim();
  })());
});

function withTimeout(p, ms) {
  return new Promise(function (res, rej) {
    const t = setTimeout(function () { rej(new Error('timeout')); }, ms);
    p.then(function (v) { clearTimeout(t); res(v); }, function (e) { clearTimeout(t); rej(e); });
  });
}

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;          // לעולם לא נוגעים בבקשות חיצוניות

  // ניווט (דף ראשי וכל דף אחר)
  if (req.mode === 'navigate') {
    e.respondWith((async function () {
      const scopePath = new URL(self.registration.scope).pathname;
      const isRoot = url.pathname.replace(/index\.html$/, '') === scopePath;
      try {
        const res = await withTimeout(fetch(req.url), 4000);
        if (res && res.ok && isRoot) {
          const c = await caches.open(VERSION);
          c.put('./', res.clone());
        }
        return res;
      } catch (err) {
        const c = await caches.open(VERSION);
        const hit = isRoot ? await c.match('./') : null;
        if (hit) return hit;
        const anyRoot = await c.match('./');
        if (anyRoot && isRoot) return anyRoot;
        return new Response(OFFLINE_HTML, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
    })());
    return;
  }

  // קבצים סטטיים: מהמטמון קודם (הכתובת המדויקת, כולל ?v=), אחרת רשת ושמירה
  e.respondWith((async function () {
    const c = await caches.open(VERSION);
    const hit = await c.match(req);
    if (hit) return hit;
    try {
      const res = await fetch(req.url);
      if (res && res.ok && (url.pathname.indexOf('/data/') !== -1 || /\.(png|json|webmanifest)$/.test(url.pathname))) {
        c.put(req, res.clone());
      }
      return res;
    } catch (err) {
      return new Response('', { status: 504, statusText: 'offline' });
    }
  })());
});
