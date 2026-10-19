# פורמט הנתונים — צדיק נולד

כל התוכן נטען מקבצי JSON בתיקיית `data/` ולא כתוב בתוך `index.html`. כשמעלים/משנים קובץ נתונים — מעלים **גם** `DATA_V` ב-`index.html` וב-`sw.js` (אותו מספר), כדי שהמטמון יתעדכן.

## `data/siddur-index.json`
תוכן עניינים לכל נוסח (אשכנז / ספרד / עדות המזרח): רשימת קטעים `{id, he, en, core?}`.
`core: true` = נכנס לגרסה הראשונה.

## `data/siddur/<nusach>/<section-id>.json`
```json
{
  "title": { "he": "...", "en": "..." },
  "nusach": "ashkenaz",
  "status": "verified | demo | pending",
  "versions": [ { "lang": "he", "title": "שם הגרסה בספריא", "license": "CC-BY" } ],
  "segments": [ { "he": "טקסט", "en": "תרגום (לא חובה)", "note": "הערת הלכה/מנהג (לא חובה)" } ]
}
```
- `versions` — שם הגרסה והרישיון של כל מקור, מוצג במסך "מקורות ורישיונות".
- קטע ללא קובץ → הקורא מציג הודעת "הנוסח עוד לא נטען".

## `data/mitzvot.json`
`items: [{ id, he, en?, status, src?, applies?, level? }]`
- `id`: `a1…a248` (עשה) או `l1…l365` (לא תעשה), לפי ספר המצוות לרמב״ם.
- `status`: `verified` רק עם מקור מאומת. `demo`/`pending` מוצגים עם תגית.
- `applies`: `"today" | "land" | "temple" | "priests" | ...` — לסינון "נוהגת בזמן הזה".
- `level`: `"beginner" | "regular"` — לסדר לימוד למתחילים.

## מה עוד לא קיים (מקום שמור)
- `data/tehillim/` — נוסח תהילים (150 פרקים) מספריא.
- `data/guides/<id>.json` — מדריכים (תפילין, ברכות וכו׳), כל אחד עם מקור וסטטוס אימות.
