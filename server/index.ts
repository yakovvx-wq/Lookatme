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

const GOAL_LABELS: Record<string, string> = {
  daily: 'לוק יומיומי קז\'ואל',
  work: 'לוק עבודה מקצועי',
  date: 'לוק דייט רומנטי',
  event: 'לוק אירוע מיוחד',
  photo: 'לוק צילומים',
};

const STYLE_LABELS: Record<string, string> = {
  natural: 'נטורל מינימלי',
  clean: 'נקי ומסודר',
  softGlam: 'גלאם עדין',
  fullGlam: 'גלאם מלא',
  dramatic: 'דרמטי',
  bold: 'בולד',
};

// Default marker positions per area for a typical portrait selfie
const AREA_DEFAULTS: Record<string, { x: number; y: number }> = {
  eyes:       { x: 35, y: 38 },
  eyeliner:   { x: 35, y: 40 },
  brows:      { x: 35, y: 30 },
  lips:       { x: 50, y: 70 },
  blush:      { x: 22, y: 55 },
  base:       { x: 50, y: 55 },
  foundation: { x: 50, y: 55 },
};

// Allowed coordinate ranges per area
const AREA_RANGES: Record<string, { xMin: number; xMax: number; yMin: number; yMax: number }> = {
  eyes:       { xMin: 15, xMax: 85, yMin: 28, yMax: 50 },
  eyeliner:   { xMin: 15, xMax: 85, yMin: 28, yMax: 50 },
  brows:      { xMin: 15, xMax: 85, yMin: 18, yMax: 40 },
  lips:       { xMin: 25, xMax: 75, yMin: 58, yMax: 82 },
  blush:      { xMin: 5,  xMax: 95, yMin: 42, yMax: 68 },
  base:       { xMin: 15, xMax: 85, yMin: 28, yMax: 82 },
  foundation: { xMin: 15, xMax: 85, yMin: 28, yMax: 82 },
};

function fixMarkerPosition(area: string, x: number, y: number): { x: number; y: number } {
  const range = AREA_RANGES[area];
  const def = AREA_DEFAULTS[area] ?? { x: 50, y: 50 };
  if (!range) return def;
  const inRange = x >= range.xMin && x <= range.xMax && y >= range.yMin && y <= range.yMax;
  if (!inRange) return def;
  return { x, y };
}

function buildSystemPrompt(goal: string, style: string, lang: string): string {
  return `את מאפרת מקצועית ונחמדה שמסתכלת על תמונת האיפור ועוזרת לשפר אותו.

הקשר:
מטרת האיפור: ${goal}
סגנון רצוי: ${style}
שפה: ${lang}

---

הטון שלך הוא כמו חברה טובה שמבינה באיפור — נחמדה, ישירה, עממית.
את מחמיאה כשיש על מה, אבל גם אומרת בדיוק מה צריך לתקן ואיך.

דוגמה לתיקון טוב:
compliment: "האייליינר נראה ממש יפה ומרים את העין."
recommendation: "הייתי מרככת טיפה את הקצה החיצוני — בצד שקרוב לאוזן — כדי שהמעבר ייראה חלק יותר. אפשר לטשטש עם מברשת קטנה תוך 10 שניות."

דוגמה נוספת:
compliment: "השפתון יושב יפה ומתאים ללוק."
recommendation: "רק בקצה הימני של השפה כדאי לנקות טיפה עם מקלון, כדי שהקו ייראה חד וסימטרי."

---

חוקים חשובים:
- אל תדברי על מבנה הפנים, רק על האיפור
- בדיוק 3 תיקונים
- כל recommendation חייב להיות לפחות 2 משפטים — לא ביטוי קצר של 5 מילים
- לא להשתמש במילים: גרוע, בעייתי, לא טוב, מכוער
- כן להשתמש: הייתי מרככת, הייתי מנקה, כדאי לחדד, אפשר לאזן, זה כבר יפה רק ללטש

---

בדיקת תמונה:
אם אין פנים ברורות → {"is_valid": false, "message": "לא זוהו פנים ברורות בתמונה."}
אם אין איפור נראה לעין → {"is_valid": false, "message": "לא זוהה איפור ברור בתמונה."}

---

אם התמונה תקינה, החזר JSON בלבד — בלי שום טקסט מחוץ ל־JSON:

{
  "is_valid": true,
  "score": number,
  "summary": "משפט אחד נחמד וקצר על המצב הכללי של האיפור",
  "fixes": [
    {
      "area": "eyes או lips או brows או base או blush",
      "title": "כותרת קצרה של התיקון",
      "compliment": "מחמאה קצרה וספציפית על האזור הזה",
      "recommendation": "לפחות שני משפטים — מה לתקן, איפה בדיוק, ואיך לעשות את זה",
      "location_explanation": "תיאור קצר של מיקום הנקודה",
      "marker_position": {"x": number, "y": number}
    }
  ]
}

כללי marker_position — חובה לציית:
x ו-y הם אחוזים (0–100): x = שמאל לימין, y = למעלה למטה.
- עיניים/אייליינר: y בין 28–50
- גבות: y בין 18–40
- שפתיים: y בין 58–82, x בין 25–75
- סומק: y בין 42–68
- בסיס: y בין 28–82
אין לשים נקודות על שיער, בגדים, רקע, או אוויר מחוץ לפנים.`;
}

app.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image provided' });
      return;
    }

    const { goal = 'daily', style = 'natural', language = 'en' } = req.body;
    const base64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';
    const lang = language === 'he' ? 'עברית' : 'English';

    const systemPrompt = buildSystemPrompt(
      GOAL_LABELS[goal] ?? goal,
      STYLE_LABELS[style] ?? style,
      lang
    );

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      max_tokens: 1500,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'נתחי את האיפור בתמונה.' },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
                detail: 'high',
              },
            },
          ],
        },
      ],
    });

    const raw = response.choices[0].message.content ?? '{}';
    const result = JSON.parse(raw);

    // Fix marker positions that are outside expected face regions
    if (result.is_valid && Array.isArray(result.fixes)) {
      result.fixes = result.fixes.map((fix: any) => ({
        ...fix,
        marker_position: fixMarkerPosition(
          fix.area,
          fix.marker_position?.x ?? 50,
          fix.marker_position?.y ?? 50
        ),
      }));
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
