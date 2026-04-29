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

const GOAL_LABELS: Record<string, Record<string, string>> = {
  daily: {
    en: 'everyday casual look',
    he: "לוק יומיומי קז'ואל",
  },
  work: {
    en: 'professional work look',
    he: 'לוק עבודה מקצועי',
  },
  date: {
    en: 'romantic date night look',
    he: 'לוק דייט רומנטי',
  },
  event: {
    en: 'special event or party look',
    he: 'לוק אירוע מיוחד',
  },
  photo: {
    en: 'photoshoot or camera-ready look',
    he: 'לוק צילומים',
  },
};

const STYLE_LABELS: Record<string, Record<string, string>> = {
  natural: {
    en: 'natural minimal',
    he: 'נטורל מינימלי',
  },
  clean: {
    en: 'clean and polished',
    he: 'נקי ומסודר',
  },
  softGlam: {
    en: 'soft glam',
    he: 'גלאם עדין',
  },
  fullGlam: {
    en: 'full glam',
    he: 'גלאם מלא',
  },
  dramatic: {
    en: 'dramatic',
    he: 'דרמטי',
  },
  bold: {
    en: 'bold statement',
    he: 'בולד',
  },
};

// Brand marker colors (cycled by recommendation index)
const MARKER_COLORS = ['#FF5BA7', '#FF8A3D', '#FFCB57', '#7ED957', '#26C6DA', '#AA63F2'];

// Goal-specific guidance for the prompt
const GOAL_GUIDANCE: Record<string, string> = {
  daily: 'Focus on longevity, naturalness, and ease. Avoid recommending heavy or complex techniques.',
  work: 'Focus on polished, professional finish. Avoid anything too bold, glittery, or distracting.',
  date: 'Focus on allure, glow, and romantic details. Soft shimmer, defined eyes, and flattering lip are relevant.',
  event: 'Higher intensity and drama are appropriate. Full coverage, defined features, and longevity matter.',
  photo: 'Camera-ready means avoiding flat coverage, adding dimension, and ensuring colors pop on camera. Contouring and highlight placement are key.',
};

const STYLE_GUIDANCE: Record<string, string> = {
  natural: 'Soft corrections only. No heavy products. Skincare-finish base, tinted brow, light mascara.',
  clean: 'Precise lines, even base, groomed brows. Avoid messiness or bleeding edges.',
  softGlam: 'Blended shadows, subtle highlight, defined lashes. Transition from day to evening.',
  fullGlam: 'Full coverage base, bold eye, defined contour and blush, strong lip.',
  dramatic: 'Intense color, sharp lines, heavy lashes. Bold choices are intentional — only flag real mistakes.',
  bold: 'Expressive, maximalist. Wild colors or textures are intentional — only flag unintentional errors.',
};

function buildSystemPrompt(goal: string, style: string, lang: string, isRescan: boolean): string {
  const goalLabel = lang === 'he' ? (GOAL_LABELS[goal]?.he ?? goal) : (GOAL_LABELS[goal]?.en ?? goal);
  const styleLabel = lang === 'he' ? (STYLE_LABELS[style]?.he ?? style) : (STYLE_LABELS[style]?.en ?? style);
  const goalGuide = GOAL_GUIDANCE[goal] ?? '';
  const styleGuide = STYLE_GUIDANCE[style] ?? '';

  if (lang === 'he') {
    return `את מומחית איפור מקצועית שמנתחת תמונות איפור ונותנת המלצות מדויקות.

מטרת הלוק: ${goalLabel}
סגנון רצוי: ${styleLabel}

הנחיות לניתוח עבור המטרה: ${goalGuide}
הנחיות לניתוח עבור הסגנון: ${styleGuide}

אזורי הפנים שאת מנתחת (10 אזורים):
1. בסיס ופריימר (coverage, finish, undertone)
2. קונסילר (עיגולים, כתמים, covering)
3. צללית עיניים (blend, transitions, colors)
4. אייליינר (precision, wings, symmetry)
5. ריסים ומסקרה (length, volume, curl, clumping)
6. גבות (shape, fill, symmetry, arch)
7. סומק (placement, blending, intensity)
8. ברונזר וקונטור (placement, blending, dimension)
9. שפתיים (color, precision, liner, fullness)
10. הרמוניה ואיזון כללי (color harmony, proportions)

${isRescan ? 'זוהי תמונה שניה לאחר שהמשתמשת ביצעה תיקונים. השווי לניתוח הקודם וציין שיפורים.' : ''}

הטון: חברה שמבינה באיפור — נחמדה, ישירה, עממית. מחמיאה כשיש על מה.

חוקים:
- אל תדברי על מבנה פנים או תכונות גופניות — רק על האיפור
- אל תשתמשי במילים: גרוע, בעייתי, לא טוב, מכוער, שגיאה
- כל recommendation: לפחות 2 משפטים, ספציפי, עם הוראות מעשיות
- quick_action: 3-5 מילים בלבד (לדוגמה: "טשטשי את הקרייס", "נקי כנף ימין")
- marker_position: x,y כאחוזים של התמונה (0-100). מקמי בדיוק על האזור הספציפי
- marker_color: בחרי מהרשימה לפי סדר: ${MARKER_COLORS.join(', ')}

כמות המלצות: 0-5 לפי הצורך האמיתי. אם האיפור מושלם — החזירי 0. אל תמציאי תיקונים.
הציון: 1-10 (7-8 = טוב, 8.5-9.5 = מעולה, 10 = מושלם).

החזר JSON בלבד (ללא שום טקסט אחר):
{
  "score": number,
  "summary": "משפט קצר ונחמד על הלוק הכללי",
  "recommendations": [
    {
      "area": "שם האזור",
      "title": "כותרת קצרה",
      "compliment": "מחמאה ספציפית לאזור (אופציונלי)",
      "recommendation": "לפחות 2 משפטים — מה לתקן, איפה, ואיך",
      "quick_action": "3-5 מילים",
      "marker_color": "#FF5BA7",
      "marker_position": { "x": 50, "y": 38 }
    }
  ]
}`;
  }

  return `You are a professional makeup expert analyzing makeup photos and giving precise recommendations.

Makeup goal: ${goalLabel}
Desired style: ${styleLabel}

Goal-specific guidance: ${goalGuide}
Style-specific guidance: ${styleGuide}

The 10 makeup zones you analyze:
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

${isRescan ? 'This is a second photo after the user made corrections. Compare to the previous analysis and highlight improvements.' : ''}

Tone: Like a knowledgeable friend — warm, direct, practical. Compliment what's working.

Rules:
- Never comment on facial structure or physical features — only makeup
- Never use words: terrible, bad, wrong, ugly, mistake
- Each recommendation: minimum 2 sentences, specific, with practical instructions
- quick_action: 3-5 words only (e.g., "Blend crease edges", "Clean right wing")
- marker_position: x,y as percentage of image (0-100). Place precisely on the specific area
- marker_color: choose from this list in order: ${MARKER_COLORS.join(', ')}

Number of recommendations: 0-5 based on genuine need. If makeup is perfect — return 0. Don't invent fixes.
Score: 1-10 (7-8 = good, 8.5-9.5 = excellent, 10 = flawless).

Return ONLY valid JSON (no other text):
{
  "score": number,
  "summary": "Short warm sentence about the overall look",
  "recommendations": [
    {
      "area": "area name",
      "title": "Short title",
      "compliment": "Specific compliment for this area (optional)",
      "recommendation": "At least 2 sentences — what to fix, where, and how",
      "quick_action": "3-5 words",
      "marker_color": "#FF5BA7",
      "marker_position": { "x": 50, "y": 38 }
    }
  ]
}`;
}

app.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image provided' });
      return;
    }

    const { goal = 'daily', style = 'natural', language = 'en' } = req.body;
    const previousScore = req.body.previous_score ? Number(req.body.previous_score) : null;
    const previousRecs = req.body.previous_recommendations
      ? (() => { try { return JSON.parse(req.body.previous_recommendations); } catch { return null; } })()
      : null;

    const isRescan = previousScore !== null && previousRecs !== null;
    const base64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';

    const systemPrompt = buildSystemPrompt(goal, style, language, isRescan);

    let userContent: any[] = [
      { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}`, detail: 'high' } },
    ];

    if (isRescan && previousScore !== null && previousRecs !== null) {
      const prevSummary = language === 'he'
        ? `ניתוח קודם: ציון ${previousScore}. תיקונים שהומלצו: ${previousRecs.map((r: any) => r.title).join(', ')}.`
        : `Previous analysis: score ${previousScore}. Recommendations were: ${previousRecs.map((r: any) => r.title).join(', ')}.`;
      userContent = [
        { type: 'text', text: prevSummary },
        ...userContent,
      ];
    } else {
      const promptText = language === 'he' ? 'נתחי את האיפור בתמונה.' : 'Analyze the makeup in this photo.';
      userContent = [{ type: 'text', text: promptText }, ...userContent];
    }

    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      max_tokens: 2000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
    });

    const raw = analysisResponse.choices[0].message.content ?? '{}';
    const result = JSON.parse(raw);

    // Ensure recommendations array exists
    if (!Array.isArray(result.recommendations)) {
      result.recommendations = [];
    }

    // Enforce marker colors in order (override AI if it deviated)
    result.recommendations = result.recommendations.slice(0, 5).map((rec: any, i: number) => ({
      ...rec,
      marker_color: MARKER_COLORS[i % MARKER_COLORS.length],
      marker_position: {
        x: Math.max(5, Math.min(95, Number(rec.marker_position?.x ?? 50))),
        y: Math.max(5, Math.min(95, Number(rec.marker_position?.y ?? 50))),
      },
    }));

    res.json(result);
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, '0.0.0.0', () => console.log(`Makeup analyzer server running on port ${PORT}`));
