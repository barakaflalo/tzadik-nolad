/* בדיקת עשן אוטומטית ל"צדיק נולד".
   הרצה (בתיקיית הפרויקט):  npm i playwright   ואז   node tests/smoke.js
   אם הדפדפן כבר מותקן במקום אחר:  CHROMIUM=/path/to/chromium node tests/smoke.js
   הבדיקה מפעילה שרת מקומי זמני, פותחת את האפליקציה בגודל טלפון ובודקת את המסכים והתהליכים העיקריים. */
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.css': 'text/css' };
const srv = http.createServer(function (q, r) {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p); if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; }
  r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});
let pass = 0, fail = 0; const failures = [];
function ok(c, name) { if (c) pass++; else { fail++; failures.push(name); console.log('  ✗ ' + name); } }

(async () => {
  await new Promise(function (res) { srv.listen(0, res); });
  const base = 'http://localhost:' + srv.address().port + '/index.html?nosw';
  const opts = { args: ['--no-sandbox'] }; if (process.env.CHROMIUM) opts.executablePath = process.env.CHROMIUM; else if (fs.existsSync('/opt/pw-browsers/chromium')) opts.executablePath = '/opt/pw-browsers/chromium';
  const b = await chromium.launch(opts);
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  await c.addInitScript(function () { if (!localStorage.getItem('tznolad_state')) localStorage.setItem('tznolad_state', JSON.stringify({ onboarded: true, user: 'בדיקה' })); });
  const p = await c.newPage(); const errs = []; p.on('pageerror', function (e) { errs.push(e.message); });
  const wait = function (ms) { return p.waitForTimeout(ms); };
  await p.goto(base); await wait(1200);

  console.log('דף הבית');
  ok(await p.evaluate(function () { return document.querySelectorAll('#view .item').length >= 6; }), 'שורות בדף הבית');
  ok(await p.evaluate(function () { return !!document.querySelector('.ring'); }), 'כרטיס התקדמות');
  ok(await p.evaluate(function () { return /^\d+\.\d+\.\d+$/.test(VERSION); }), 'גרסה תקינה');

  console.log('הסידור: כל החלקים בכל הנוסחים');
  const secs = await p.evaluate(function () { const o = []; (D.sid || []).forEach(function (n) { n.sections.forEach(function (s) { o.push([n.id, s.id, !!s.ready]); }); }); return o; });
  ok(secs.length > 20, 'רשימת חלקים נטענה');
  for (const s of secs) {
    if (!s[2]) { ok(false, 'חלק לא מוכן: ' + s[0] + '/' + s[1]); continue; }
    await p.evaluate(function (a) { openSection(a[0], a[1]); }, s); await wait(500);
    const r = await p.evaluate(function () { return { parts: document.querySelectorAll('.pt').length, segs: document.querySelectorAll('.seg').length, prep: document.body.innerText.indexOf('בהכנה') >= 0 }; });
    ok(r.parts > 0 && r.segs > 0, 'מציג תוכן: ' + s[0] + '/' + s[1]);
    ok(!r.prep, 'בלי "בהכנה": ' + s[0] + '/' + s[1]);
  }

  console.log('מצוות');
  await p.evaluate(function () { go('mitzvot'); }); await wait(400);
  ok(await p.evaluate(function () { return document.querySelectorAll('.mc').length === 613; }), '613 מצוות');
  await p.evaluate(function () { openMitzvah('a1'); }); await wait(500);
  await p.click('[data-act=mL]'); await wait(200);
  ok(await p.evaluate(function () { return !!(S.marks.a1 && S.marks.a1.l); }), 'סימון "למדתי"');
  await p.keyboard.press('Escape'); await wait(200);

  console.log('התוכנית שלי');
  await p.evaluate(function () { S.plan = null; save(); go('home'); }); await wait(400);
  await p.click('[data-act=planManage]'); await wait(500);
  await p.click('[data-act=planSug][data-i="0"]'); await p.click('[data-act=planSug][data-i="1"]'); await wait(200);
  await p.click('[data-act=planClose]'); await wait(400);
  ok(await p.evaluate(function () { return S.plan.items.length === 2; }), 'שני פריטים בתוכנית');
  await p.click('[data-act=planTick][data-i="1"]'); await wait(300);
  ok(await p.evaluate(function () { return document.querySelector('.ring .num').textContent === '1/2'; }), 'העיגול מראה 1/2');
  await p.evaluate(function () { tehReader(23, 23); }); await wait(600); await p.click('[data-act=planAddRd]');
  await p.evaluate(function () { halOpen(1); }); await wait(700); await p.click('[data-act=planAddRd]');
  ok(await p.evaluate(function () { return S.plan.items.some(function (x) { return x.k === 'tp'; }) && S.plan.items.some(function (x) { return x.k === 'hal'; }); }), 'פרק תהילים וסימן בתוכנית');
  ok(await p.evaluate(function () { const c = cleanState(JSON.parse(localStorage.getItem('tznolad_state'))); return c.plan && c.plan.items.length === 4; }), 'התוכנית שורדת ניקוי וגיבוי');

  console.log('סמניות');
  await p.evaluate(function () { openSection('ashkenaz', 'minchah'); }); await wait(700);
  await p.click('.bmk'); await wait(200);
  ok(await p.evaluate(function () { return Object.keys(S.bm).length >= 1; }), 'סימנייה נוספה');

  console.log('חיפוש בסידור');
  await p.evaluate(function () { go('search'); }); await wait(400);
  await p.fill('#sxQ', 'ברוך אתה'); await wait(5000);
  ok(await p.evaluate(function () { return document.querySelectorAll('#sxRes .item').length > 5; }), 'תוצאות בעברית');
  await p.fill('#sxQ', 'blessed are you'); await wait(500);
  ok(await p.evaluate(function () { return document.querySelectorAll('#sxRes .item').length > 0; }), 'תוצאות באנגלית');
  await p.fill('#sxQ', 'שִׁוִּיתִי ה לנגדי'); await wait(500);
  ok(await p.evaluate(function () { return !!document.querySelector('#sxRes [data-k=teh]'); }), 'חיפוש מוצא פרק תהילים');
  await p.fill('#sxQ', 'השכמת הבקר'); await wait(500);
  ok(await p.evaluate(function () { return !!document.querySelector('#sxRes [data-k=hal]'); }), 'חיפוש מוצא סימן בקיצור שולחן ערוך');
  await p.click('#sxRes [data-k=hal]'); await wait(800);
  ok(await p.evaluate(function () { return R.screen === 'reader'; }), 'פתיחת סימן מהחיפוש');
  await p.evaluate(function () { go('search'); }); await wait(500);
  await p.fill('#sxQ', 'blessed are you'); await wait(500);
  await p.click('#sxRes .item'); await wait(800);
  ok(await p.evaluate(function () { return R.screen === 'reader'; }), 'לחיצה על תוצאה פותחת את החלק');

  console.log('תזכורות');
  await p.evaluate(function () { go('home'); remOpen(); }); await wait(700);   /* המודאל מתעלם מלחיצות ב-450ms הראשונות */
  const dl = await Promise.all([p.waitForEvent('download', { timeout: 8000 }).catch(function () { return null; }), p.click('[data-act=remMake]')]);
  if (!dl[0]) ok(false, 'קובץ יומן לא ירד');
  else {
    const ics = fs.readFileSync(await dl[0].path(), 'utf8');
    ok(ics.indexOf('BEGIN:VCALENDAR') === 0 && ics.indexOf('BEGIN:VALARM') > 0 && ics.indexOf('RRULE:FREQ=DAILY') > 0, 'קובץ יומן תקין');
  }
  await p.keyboard.press('Escape');

  console.log('שפות');
  for (const lang of ['en', 'es', 'he']) {
    await p.evaluate(function (l) { S.lang = l; save(); apply(); go('home'); }, lang); await wait(300);
    const dir = await p.evaluate(function () { return document.documentElement.dir; });
    ok(dir === (lang === 'he' ? 'rtl' : 'ltr'), 'כיוון המסך ל-' + lang);
    await p.evaluate(function () { go('calendar'); }); await wait(500);
    ok(await p.evaluate(function () { return document.querySelectorAll('#view .card').length > 0; }), 'לוח זמנים ב-' + lang);
  }
  const keysOk = await p.evaluate(function () { const he = Object.keys(LANG.he), bad = []; ['en', 'es'].forEach(function (l) { he.forEach(function (k) { if (!(k in LANG[l])) bad.push(l + ':' + k); }); }); return bad; });
  ok(keysOk.length === 0, 'כל המחרוזות קיימות בכל השפות ' + keysOk.slice(0, 5).join(','));

  console.log('ספרדית בנתונים');
  await p.evaluate(function () { S.lang = 'es'; save(); apply(); go('mitzvot'); }); await wait(500);
  await p.fill('#mSearch', 'saber que existe'); await wait(600);
  ok(await p.evaluate(function () { return document.querySelector('#mRes').textContent.indexOf('Saber que existe un Dios') >= 0; }), 'כותרות מצוות בספרדית (חיפוש)');
  await p.evaluate(function () { go('guides'); }); await wait(400);
  ok(await p.evaluate(function () { return document.body.innerText.indexOf('Cómo ponerse los tefilín') >= 0; }), 'מדריכים בספרדית');
  await p.evaluate(function () { go('halacha'); }); await wait(500);
  ok(await p.evaluate(function () { return document.body.innerText.indexOf('Leyes al despertarse') >= 0; }), 'קיצור שולחן ערוך בספרדית');
  await p.evaluate(function () { S.lang = 'he'; save(); apply(); }); await wait(200);

  console.log('מסכים נוספים');
  for (const scr of ['tehillim', 'guides', 'more', 'settings', 'sources', 'about', 'bookmarks', 'halacha', 'parsha', 'assistant', 'path']) {
    const e0 = errs.length; await p.evaluate(function (s) { go(s); }, scr); await wait(400);
    ok(errs.length === e0, 'מסך ' + scr + ' בלי שגיאות');
  }

  ok(errs.length === 0, 'אין שגיאות JavaScript (' + errs.slice(0, 3).join(' | ') + ')');
  await b.close(); srv.close();
  console.log('\nעברו ' + pass + ', נכשלו ' + fail);
  if (fail) { console.log('נכשלו:\n - ' + failures.join('\n - ')); process.exit(1); }
})().catch(function (e) { console.error(e); srv.close(); process.exit(2); });
