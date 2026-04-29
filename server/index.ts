import express from 'express';
import cors from 'cors';
import multer from 'multer';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MARKER_COLORS = ['#FF5BA7', '#FF8A3D', '#FFCB57', '#7ED957', '#26C6DA'];

const GOAL_LABELS: Record<string, Record<string, string>> = {
  daily: { en: "everyday casual look", he: "לוק יומיומי קז'ואל" },
  work:  { en: 'professional work look', he: 'לוק עבודה מקצועי' },
  date:  { en: 'romantic date night look', he: 'לוק דייט רומנטי' },
  event: { en: 'special event or party look', he: 'לוק אירוע מיוחד' },
  photo: { en: 'photoshoot or camera-ready look', he: 'לוק צילומים' },
};

const STYLE_LABELS: Record<string, Record<string, string>> = {
  natural:  { en: 'natural minimal', he: 'נטורל מינימלי' },
  clean:    { en: 'clean and polished', he: 'נקי ומסודר' },
  softGlam: { en: 'soft glam', he: 'גלאם עדין' },
  fullGlam: { en: 'full glam', he: 'גלאם מלא' },
  dramatic: { en: 'dramatic', he: 'דרמטי' },
  bold:     { en: 'bold statement', he: 'בולד' },
};

const GOAL_GUIDANCE_EN: Record<string, string> = {
  daily: 'Prioritize longevity, naturalness, and wearability. Avoid recommending heavy or complex techniques. Focus on skin prep and simple enhancements.',
  work:  'Prioritize polished, professional finish. Clean lines, even base, neutral palette. Avoid anything too bold, glittery, or distracting.',
  date:  'Focus on allure, glow, and romantic details. Soft shimmer, defined eyes, flattering lip color, and healthy-looking skin are most relevant.',
  event: 'Higher intensity and drama are appropriate. Full coverage, defined features, longevity, and photo-readiness all matter here.',
  photo: 'Camera-ready means added dimension (avoid flat coverage), colors that pop, defined features. Contouring, highlight placement, and precise eye makeup are key.',
};

const GOAL_GUIDANCE_HE: Record<string, string> = {
  daily: 'תעדפי עמידות, טבעיות ונוחות ללבישה. הימני מטכניקות כבדות. התמקדי בהכנת עור ושיפורים עדינים.',
  work:  'תעדפי מראה מסודר ומקצועי. קווים נקיים, בסיס אחיד, פלטה ניטרלית. הימני מכל מה שצועק, מנצנץ או מסיח דעת.',
  date:  'התמקדי בקסם, זוהר ופרטים רומנטיים. שימר עדין, עיניים מוגדרות, שפתון חמלאי ועור בריא ומזוהר.',
  event: 'עוצמה ודרמה לגיטימיים. כיסוי מלא, מאפיינים מוגדרים, עמידות לאורך זמן וכשירות לצילום.',
  photo: 'מוכנות לצילום = עומק ומימד (הימני מכיסוי שטוח), צבעים שיוצאים יפה, קווים מוגדרים. קונטור, הייליטר ועיניים מדויקות — קריטיים.',
};

const STYLE_GUIDANCE_EN: Record<string, string> = {
  natural:  'Soft corrections only. No heavy products. Think skincare-finish base, tinted brow gel, light mascara, sheer lip.',
  clean:    'Precise lines, perfectly even base, groomed brows. Any messiness, smudging, or bleeding edges should be noted.',
  softGlam: 'Beautifully blended shadows, subtle highlight, defined lashes, polished skin. Transition from day to evening.',
  fullGlam: 'Full coverage flawless base, bold dramatic eye, defined contour and blush, strong lip. All elements should be well-executed.',
  dramatic: 'Intense colors, sharp precise lines, heavy lashes are intentional. Only flag genuine execution mistakes, not bold choices.',
  bold:     'Expressive and maximalist. Wild colors or unconventional textures are intentional — only flag unintentional errors.',
};

const STYLE_GUIDANCE_HE: Record<string, string> = {
  natural:  'תיקונים עדינים בלבד. אל תמליצי על מוצרים כבדים. בסיס עם פיניש עורי, ג\'ל גבות בגוון, מסקרה קלה, שפתון שקוף.',
  clean:    'קווים מדויקים, בסיס אחיד לגמרי, גבות מסודרות. חוסר סדר, מריחה או דליפת צבע — אלה הדברים לציין.',
  softGlam: 'צלליות ממוזגות יפה, הייליטר עדין, ריסים מוגדרים, עור מלוטש. הנקודה בין לוק יום ולוק ערב.',
  fullGlam: 'בסיס מלא ומושלם, עין דרמטית, קונטור וסומק מוגדרים, שפתון חזק. כל האלמנטים מכוונים ומבוצעים היטב.',
  dramatic: 'צבעים עזים, קווים חדים, ריסים כבדים — מכוונים. ציירי רק שגיאות אמיתיות בביצוע, לא בחירות נועזות.',
  bold:     'אקספרסיבי ומקסימליסטי. צבעים ייחודיים מכוונים — ציירי רק שגיאות לא מכוונות בביצוע.',
};

function buildInitialPrompt(goal: string, style: string, lang: string): string {
  const gl = lang === 'he' ? (GOAL_LABELS[goal]?.he ?? goal) : (GOAL_LABELS[goal]?.en ?? goal);
  const sl = lang === 'he' ? (STYLE_LABELS[style]?.he ?? style) : (STYLE_LABELS[style]?.en ?? style);
  const gg = lang === 'he' ? (GOAL_GUIDANCE_HE[goal] ?? '') : (GOAL_GUIDANCE_EN[goal] ?? '');
  const sg = lang === 'he' ? (STYLE_GUIDANCE_HE[style] ?? '') : (STYLE_GUIDANCE_EN[style] ?? '');

  if (lang === 'he') {
    return `את מאפרת מקצועית ומנוסה שמנתחת תמונות איפור ומייעצת בצורה אישית וחמה.

מטרת הלוק: ${gl}
סגנון רצוי: ${sl}
הנחיות למטרה: ${gg}
הנחיות לסגנון: ${sg}

שלב ראשון — בדיקת תמונה:
אם אין פנים ברורות / התמונה מטושטשת מאוד / זו תמונה של אובייקט:
החזירי: {"is_valid":false,"error_type":"no_face","message":"לא הצלחתי לזהות פנים בתמונה. נסי לצלם שוב באור טוב ועם הפנים במרכז הפריים."}

אם יש פנים אבל האיפור מסונן מאוד (פילטר כבד):
החזירי: {"is_valid":false,"error_type":"filtered","message":"נראה שהתמונה מעובדת עם פילטר. לתוצאות מדויקות, נסי עם תמונה ללא פילטרים."}

שלב שני — ניתוח עמוק של 10 אזורי איפור:
1. בסיס ופריימר (coverage, finish, undertone match)
2. קונסילר (עיגולים, כתמים, כיסוי)
3. צללית עיניים (מיזוג, transitions, בחירת צבע)
4. אייליינר (דיוק, כנפיים, סימטריה)
5. ריסים ומסקרה (אורך, נפח, curl, clumping)
6. גבות (צורה, מילוי, סימטריה, קשת)
7. סומק (מיקום, מיזוג, עוצמה)
8. ברונזר וקונטור (מיקום, מיזוג, מימד)
9. שפתיים (צבע, דיוק, לינר, מלאות)
10. הרמוניה ואיזון כללי (קוהרנטיות, פרופורציות)

טון הדיבור: חברה שמבינה באיפור — נחמדה, ישירה, מעשית.
שפה: "בואי נוסיף קצת...", "נסי...", "יהיה יפה אם..."
אסור: להזכיר מבנה פנים, תכונות פיזיות; להשתמש במילים: גרוע, בעייתי, שגיאה, לא טוב, מכוער
כל recommendation: לפחות 2 משפטים, ספציפיים, עם הוראות מעשיות ברורות
quick_action: 3-5 מילים בלבד — פעולה ספציפית (למשל: "טשטשי את הקרייס", "נקי כנף ימין")
marker_position: x,y כאחוזים (0-100) — מקמי בדיוק על הבעיה הספציפית בפנים
  דוגמאות: עין שמאל ≈ x:30,y:37 | עין ימין ≈ x:70,y:37 | שפתיים ≈ x:50,y:70 | גבה שמאל ≈ x:28,y:27 | גבה ימין ≈ x:72,y:27 | סומק שמאל ≈ x:18,y:52 | סומק ימין ≈ x:82,y:52

כמות recommendations לפי ציון:
- ציון = 10: recommendations = [] בדיוק — אל תכתבי כלום
- ציון 9.0–9.9: 1–2 המלצות
- ציון 8.0–8.9: 2–3 המלצות
- ציון 7.0–7.9: 3–4 המלצות
- ציון מתחת ל-7: 4–5 המלצות

ציון 10 = מושלם לגמרי, ממש ללא פגם. ציון 9.5+ = מעולה עם פרט קטן אחד.
photo_quality: "good" (תמונה ברורה), "medium" (קצת מטושטשת/תאורה בינונית), "poor" (קשה לנתח)

החזירי JSON בלבד — ללא שום טקסט נוסף:
{
  "is_valid": true,
  "score": number,
  "summary": "משפט קצר וחם על הלוק",
  "photo_quality": "good|medium|poor",
  "photo_quality_note": "הערה רק אם poor — אחרת השמיטי שדה זה",
  "full_analysis": {
    "base":      {"score": number, "note": "הערה קצרה"},
    "concealer": {"score": number, "note": "הערה קצרה"},
    "eyeshadow": {"score": number, "note": "הערה קצרה"},
    "eyeliner":  {"score": number, "note": "הערה קצרה"},
    "lashes":    {"score": number, "note": "הערה קצרה"},
    "brows":     {"score": number, "note": "הערה קצרה"},
    "blush":     {"score": number, "note": "הערה קצרה"},
    "contour":   {"score": number, "note": "הערה קצרה"},
    "lips":      {"score": number, "note": "הערה קצרה"},
    "harmony":   {"score": number, "note": "הערה קצרה"}
  },
  "recommendations": [
    {
      "area": "שם האזור",
      "title": "כותרת קצרה",
      "recommendation": "לפחות 2 משפטים — מה, איפה, ואיך",
      "quick_action": "3-5 מילים",
      "marker_color": "#FF5BA7",
      "marker_position": {"x": 50, "y": 38}
    }
  ]
}`;
  }

  return `You are a professional, experienced makeup artist analyzing photos and giving personal, warm advice.

Makeup goal: ${gl}
Desired style: ${sl}
Goal guidance: ${gg}
Style guidance: ${sg}

Step 1 — Photo check:
If no clear face / very blurry image / photo of an object:
Return: {"is_valid":false,"error_type":"no_face","message":"Couldn't detect a clear face. Please retake in good lighting with your face centered."}

If there is a face but with heavy filter/processing:
Return: {"is_valid":false,"error_type":"filtered","message":"The photo appears to have a heavy filter applied. For accurate results, try without filters."}

Step 2 — Deep analysis of 10 makeup zones:
1. Base & Foundation (coverage, finish, undertone match)
2. Concealer (dark circles, spots, coverage)
3. Eyeshadow (blending, transitions, color choices)
4. Eyeliner (precision, wings, symmetry)
5. Lashes & Mascara (length, volume, curl, clumping)
6. Brows (shape, fill, symmetry, arch)
7. Blush (placement, blending, intensity)
8. Bronzer & Contour (placement, blending, dimension)
9. Lips (color, precision, liner, fullness)
10. Color Harmony & Overall Balance (cohesion, proportions)

Tone: Like a knowledgeable friend — warm, direct, practical.
Language: "let's add a bit of...", "try...", "it would look beautiful if..."
Forbidden: mention facial structure or physical features; words like: terrible, bad, wrong, ugly, mistake
Each recommendation: minimum 2 sentences, specific, with clear practical instructions
quick_action: 3-5 words only — specific action (e.g., "Blend crease edges", "Clean right wing")
marker_position: x,y as percentages (0-100) — place exactly on the specific issue area
  Examples: left eye ≈ x:30,y:37 | right eye ≈ x:70,y:37 | lips ≈ x:50,y:70 | left brow ≈ x:28,y:27 | right brow ≈ x:72,y:27 | left blush ≈ x:18,y:52 | right blush ≈ x:82,y:52

Number of recommendations by score:
- score = 10: recommendations = [] exactly — write nothing
- score 9.0–9.9: 1–2 recommendations
- score 8.0–8.9: 2–3 recommendations
- score 7.0–7.9: 3–4 recommendations
- score below 7: 4–5 recommendations

Score 10 = absolutely flawless, truly nothing to improve. Score 9.5+ = excellent with one tiny detail.
photo_quality: "good" (clear photo), "medium" (slightly blurry/medium lighting), "poor" (hard to analyze)

Return ONLY JSON — no other text:
{
  "is_valid": true,
  "score": number,
  "summary": "Short warm sentence about the look",
  "photo_quality": "good|medium|poor",
  "photo_quality_note": "Note only if poor — omit this field otherwise",
  "full_analysis": {
    "base":      {"score": number, "note": "brief note"},
    "concealer": {"score": number, "note": "brief note"},
    "eyeshadow": {"score": number, "note": "brief note"},
    "eyeliner":  {"score": number, "note": "brief note"},
    "lashes":    {"score": number, "note": "brief note"},
    "brows":     {"score": number, "note": "brief note"},
    "blush":     {"score": number, "note": "brief note"},
    "contour":   {"score": number, "note": "brief note"},
    "lips":      {"score": number, "note": "brief note"},
    "harmony":   {"score": number, "note": "brief note"}
  },
  "recommendations": [
    {
      "area": "area name",
      "title": "Short title",
      "recommendation": "At least 2 sentences — what, where, and how",
      "quick_action": "3-5 words",
      "marker_color": "#FF5BA7",
      "marker_position": {"x": 50, "y": 38}
    }
  ]
}`;
}

function buildRescanPrompt(goal: string, style: string, lang: string, previousScore: number, previousRecs: any[]): string {
  const gl = lang === 'he' ? (GOAL_LABELS[goal]?.he ?? goal) : (GOAL_LABELS[goal]?.en ?? goal);
  const sl = lang === 'he' ? (STYLE_LABELS[style]?.he ?? style) : (STYLE_LABELS[style]?.en ?? style);
  const prevRecsText = previousRecs.map((r: any, i: number) => `${i + 1}. ${r.title}: ${r.recommendation}`).join('\n');

  if (lang === 'he') {
    return `את מאפרת מקצועית המשווה בין שתי תמונות של אותה אישה — לפני ואחרי תיקון איפור.

מטרת הלוק: ${gl}
סגנון: ${sl}

ניתוח קודם: ציון ${previousScore}/10
ההמלצות שניתנו:
${prevRecsText}

עכשיו נתחי את התמונה החדשה (אחרי התיקונים).

אם אין פנים בתמונה:
החזירי: {"is_valid":false,"error_type":"no_face","message":"לא זיהיתי פנים — נסי לצלם שוב"}

אחרת, השווי בין הצילום הקודם לחדש והחזירי JSON בלבד:
{
  "is_valid": true,
  "is_rescan": true,
  "previous_score": ${previousScore},
  "new_score": number,
  "change_detected": boolean,
  "improvement_level": "none|small|medium|strong",
  "summary": "משפט חם על השיפור (או חוסרו)",
  "recommendation_results": [
    {
      "previous_title": "כותרת ההמלצה הקודמת בדיוק",
      "was_improved": boolean,
      "result_text": "מה השתנה ספציפית / מה עדיין לא השתנה"
    }
  ],
  "still_needs_work": boolean,
  "next_recommendations": [
    {
      "area": "שם האזור",
      "title": "כותרת",
      "recommendation": "לפחות 2 משפטים",
      "quick_action": "3-5 מילים",
      "marker_color": "#FF5BA7",
      "marker_position": {"x": 50, "y": 38}
    }
  ],
  "next_action": "save_result|continue_improving"
}

חוקים:
- improvement_level: none = ללא שינוי, small = שיפור קטן, medium = שיפור ניכר, strong = שיפור גדול
- next_action = "save_result" אם new_score >= 9.5 או האיפור כמעט מושלם
- next_action = "continue_improving" אחרת
- next_recommendations = [] אם next_action = "save_result"
- כמות next_recommendations: 1–3 לפי מה שנשאר לשפר`;
  }

  return `You are a professional makeup artist comparing two photos of the same person — before and after makeup corrections.

Makeup goal: ${gl}
Style: ${sl}

Previous analysis: score ${previousScore}/10
Recommendations given:
${prevRecsText}

Now analyze the new photo (after corrections).

If no face in the photo:
Return: {"is_valid":false,"error_type":"no_face","message":"No face detected — please try again"}

Otherwise compare the previous to the new photo and return ONLY JSON:
{
  "is_valid": true,
  "is_rescan": true,
  "previous_score": ${previousScore},
  "new_score": number,
  "change_detected": boolean,
  "improvement_level": "none|small|medium|strong",
  "summary": "Warm sentence about the improvement (or lack thereof)",
  "recommendation_results": [
    {
      "previous_title": "exact previous recommendation title",
      "was_improved": boolean,
      "result_text": "what specifically changed / what still hasn't changed"
    }
  ],
  "still_needs_work": boolean,
  "next_recommendations": [
    {
      "area": "area name",
      "title": "title",
      "recommendation": "at least 2 sentences",
      "quick_action": "3-5 words",
      "marker_color": "#FF5BA7",
      "marker_position": {"x": 50, "y": 38}
    }
  ],
  "next_action": "save_result|continue_improving"
}

Rules:
- improvement_level: none = no change, small = minor improvement, medium = noticeable improvement, strong = major improvement
- next_action = "save_result" if new_score >= 9.5 or makeup is near-flawless
- next_action = "continue_improving" otherwise
- next_recommendations = [] if next_action = "save_result"
- next_recommendations count: 1–3 based on what still needs work`;
}

function clampRecs(recs: any[]): any[] {
  return recs.slice(0, 5).map((rec: any, i: number) => ({
    ...rec,
    marker_color: MARKER_COLORS[i % MARKER_COLORS.length],
    marker_position: {
      x: Math.max(5, Math.min(95, Number(rec.marker_position?.x ?? 50))),
      y: Math.max(5, Math.min(95, Number(rec.marker_position?.y ?? 50))),
    },
  }));
}

app.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image provided' });
      return;
    }

    const { goal = 'daily', style = 'natural', language = 'en' } = req.body;
    const previousScore = req.body.previous_score ? Number(req.body.previous_score) : null;
    const previousRecs: any[] | null = req.body.previous_recommendations
      ? (() => { try { return JSON.parse(req.body.previous_recommendations); } catch { return null; } })()
      : null;

    const isRescan = previousScore !== null && Array.isArray(previousRecs) && previousRecs.length > 0;
    const base64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';

    const systemPrompt = isRescan
      ? buildRescanPrompt(goal, style, language, previousScore!, previousRecs!)
      : buildInitialPrompt(goal, style, language);

    const userText = language === 'he' ? 'נתחי את האיפור בתמונה.' : 'Analyze the makeup in this photo.';

    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      max_tokens: 2500,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: userText },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}`, detail: 'high' } },
          ],
        },
      ],
    });

    const raw = analysisResponse.choices[0].message.content ?? '{}';
    let result: any;
    try {
      result = JSON.parse(raw);
    } catch {
      res.status(500).json({ error: 'Failed to parse AI response' });
      return;
    }

    // Invalid photo — return as-is
    if (result.is_valid === false) {
      res.json(result);
      return;
    }

    // Rescan result
    if (result.is_rescan === true) {
      if (!Array.isArray(result.next_recommendations)) result.next_recommendations = [];
      result.next_recommendations = clampRecs(result.next_recommendations);
      if (!Array.isArray(result.recommendation_results)) result.recommendation_results = [];
      res.json(result);
      return;
    }

    // Initial analysis — enforce constraints
    result.is_valid = true;
    if (!Array.isArray(result.recommendations)) result.recommendations = [];

    const score = Number(result.score ?? 0);

    if (score >= 10) {
      // Perfect score — no recommendations
      result.score = 10;
      result.recommendations = [];
    } else {
      result.recommendations = clampRecs(result.recommendations);

      // Safety net: AI must give at least 1 rec for score < 10
      if (result.recommendations.length === 0) {
        const followUp = await openai.chat.completions.create({
          model: 'gpt-4o',
          response_format: { type: 'json_object' },
          max_tokens: 500,
          messages: [
            {
              role: 'system',
              content: language === 'he'
                ? `מאפרת מקצועית. האיפור נראה טוב (ציון ${score}/10) אבל תמיד יש משהו קטן לשפר. תני המלצה אחת קטנה ומועילה. JSON בלבד:\n{"area":"שם","title":"כותרת","recommendation":"2+ משפטים","quick_action":"3-5 מילים","marker_color":"#FF5BA7","marker_position":{"x":50,"y":50}}`
                : `Makeup expert. Makeup looks good (score ${score}/10) but there's always one small thing to elevate. Give one small helpful tip. JSON only:\n{"area":"area","title":"title","recommendation":"2+ sentences","quick_action":"3-5 words","marker_color":"#FF5BA7","marker_position":{"x":50,"y":50}}`,
            },
          ],
        });
        try {
          const extra = JSON.parse(followUp.choices[0].message.content ?? '{}');
          if (extra.title) {
            result.recommendations = clampRecs([extra]);
          }
        } catch { /* ignore */ }
      }
    }

    res.json(result);
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, '0.0.0.0', () => console.log(`Makeup analyzer server running on port ${PORT}`));
