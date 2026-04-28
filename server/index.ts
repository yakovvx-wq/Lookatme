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

interface Landmarks {
  left_eye: { x: number; y: number };
  right_eye: { x: number; y: number };
  left_brow: { x: number; y: number };
  right_brow: { x: number; y: number };
  lips: { x: number; y: number };
  left_cheek: { x: number; y: number };
  right_cheek: { x: number; y: number };
  nose: { x: number; y: number };
}

const DEFAULT_LANDMARKS: Landmarks = {
  left_eye:    { x: 35, y: 38 },
  right_eye:   { x: 65, y: 38 },
  left_brow:   { x: 35, y: 30 },
  right_brow:  { x: 65, y: 30 },
  lips:        { x: 50, y: 70 },
  left_cheek:  { x: 25, y: 55 },
  right_cheek: { x: 75, y: 55 },
  nose:        { x: 50, y: 52 },
};

async function detectLandmarks(base64: string, mimeType: string): Promise<Landmarks> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      max_tokens: 300,
      messages: [
        {
          role: 'system',
          content: `You are a face landmark detector. Look at the image and return the x,y positions (as percentages 0-100, where x=left→right, y=top→bottom) of these facial points. Return ONLY valid JSON, no extra text:
{
  "left_eye": {"x": number, "y": number},
  "right_eye": {"x": number, "y": number},
  "left_brow": {"x": number, "y": number},
  "right_brow": {"x": number, "y": number},
  "lips": {"x": number, "y": number},
  "left_cheek": {"x": number, "y": number},
  "right_cheek": {"x": number, "y": number},
  "nose": {"x": number, "y": number}
}
If no face is detected, return {"no_face": true}.`,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Detect facial landmarks.' },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}`, detail: 'high' } },
          ],
        },
      ],
    });

    const raw = JSON.parse(response.choices[0].message.content ?? '{}');
    if (raw.no_face) return DEFAULT_LANDMARKS;
    return { ...DEFAULT_LANDMARKS, ...raw };
  } catch {
    return DEFAULT_LANDMARKS;
  }
}

function getMarkerForArea(area: string, landmarks: Landmarks): { x: number; y: number } {
  switch (area) {
    case 'eyes':
    case 'eyeliner':
      return { x: (landmarks.left_eye.x + landmarks.right_eye.x) / 2, y: landmarks.left_eye.y };
    case 'brows':
      return { x: (landmarks.left_brow.x + landmarks.right_brow.x) / 2, y: landmarks.left_brow.y };
    case 'lips':
      return landmarks.lips;
    case 'blush':
      return landmarks.left_cheek;
    case 'base':
    case 'foundation':
      return landmarks.nose;
    default:
      return { x: 50, y: 50 };
  }
}

function buildSystemPrompt(goal: string, style: string, lang: string): string {
  return `את מאפרת מקצועית ונחמדה שמסתכלת על תמונת האיפור ועוזרת לשפר אותו.

הקשר:
מטרת האיפור: ${goal}
סגנון רצוי: ${style}
שפה: ${lang}

הטון שלך הוא כמו חברה טובה שמבינה באיפור — נחמדה, ישירה, עממית.
את מחמיאה כשיש על מה, אבל גם אומרת בדיוק מה צריך לתקן ואיך.

דוגמה לתיקון טוב:
compliment: "האייליינר נראה ממש יפה ומרים את העין."
recommendation: "הייתי מרככת טיפה את הקצה החיצוני — בצד שקרוב לאוזן — כדי שהמעבר ייראה חלק יותר. אפשר לטשטש עם מברשת קטנה תוך 10 שניות."

דוגמה נוספת:
compliment: "השפתון יושב יפה ומתאים ללוק."
recommendation: "רק בקצה הימני של השפה כדאי לנקות טיפה עם מקלון, כדי שהקו ייראה חד וסימטרי. זה לוקח שניות ומשנה את כל המראה."

חוקים:
- אל תדברי על מבנה הפנים, רק על האיפור
- בדיוק 3 תיקונים
- כל recommendation חייב להיות לפחות 2 משפטים
- לא להשתמש במילים: גרוע, בעייתי, לא טוב, מכוער
- כן להשתמש: הייתי מרככת, הייתי מנקה, כדאי לחדד, אפשר לאזן

בדיקת תמונה:
אם אין פנים ברורות → {"is_valid": false, "message": "לא זוהו פנים ברורות בתמונה."}
אם אין איפור נראה לעין → {"is_valid": false, "message": "לא זוהה איפור ברור בתמונה."}

אם התמונה תקינה, החזר JSON בלבד:
{
  "is_valid": true,
  "score": number,
  "summary": "משפט אחד נחמד על המצב הכללי",
  "fixes": [
    {
      "area": "eyes או lips או brows או base או blush",
      "title": "כותרת קצרה",
      "compliment": "מחמאה קצרה וספציפית",
      "recommendation": "לפחות שני משפטים — מה לתקן, איפה, ואיך",
      "location_explanation": "תיאור קצר של המיקום"
    }
  ]
}

אל תוסיפי marker_position — זה יטופל בנפרד.
אל תוסיפי שום טקסט מחוץ ל־JSON.`;
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

    // Run landmark detection and makeup analysis in parallel
    const [landmarks, analysisResponse] = await Promise.all([
      detectLandmarks(base64, mimeType),
      openai.chat.completions.create({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        max_tokens: 1500,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'נתחי את האיפור בתמונה.' },
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}`, detail: 'high' } },
            ],
          },
        ],
      }),
    ]);

    const raw = analysisResponse.choices[0].message.content ?? '{}';
    const result = JSON.parse(raw);

    // Inject accurate marker positions from landmark detection
    if (result.is_valid && Array.isArray(result.fixes)) {
      result.fixes = result.fixes.map((fix: any) => ({
        ...fix,
        marker_position: getMarkerForArea(fix.area, landmarks),
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
