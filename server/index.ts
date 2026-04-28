import express from 'express';
import cors from 'cors';
import multer from 'multer';
import OpenAI from 'openai';
import sharp from 'sharp';
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
  daily: "לוק יומיומי קז'ואל",
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

// Zone definitions on a cropped face image (percentages 0-100)
const ZONES: Record<string, { x: number; y: number; w: number; h: number; label: string; number: number }> = {
  brows: { x: 5,  y: 8,  w: 90, h: 18, label: 'גבות',    number: 1 },
  eyes:  { x: 5,  y: 25, w: 90, h: 22, label: 'עיניים',  number: 2 },
  blush: { x: 2,  y: 45, w: 96, h: 18, label: 'סומק',    number: 3 },
  base:  { x: 15, y: 35, w: 70, h: 32, label: 'בסיס',    number: 4 },
  lips:  { x: 18, y: 65, w: 64, h: 20, label: 'שפתיים',  number: 5 },
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
  left_eye:    { x: 33, y: 38 },
  right_eye:   { x: 67, y: 38 },
  left_brow:   { x: 33, y: 28 },
  right_brow:  { x: 67, y: 28 },
  lips:        { x: 50, y: 68 },
  left_cheek:  { x: 22, y: 55 },
  right_cheek: { x: 78, y: 55 },
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
          content: `Detect facial landmarks in the image. Return x,y as percentages (0-100), where x=left→right, y=top→bottom.
Return ONLY this JSON (no extra text):
{"left_eye":{"x":n,"y":n},"right_eye":{"x":n,"y":n},"left_brow":{"x":n,"y":n},"right_brow":{"x":n,"y":n},"lips":{"x":n,"y":n},"left_cheek":{"x":n,"y":n},"right_cheek":{"x":n,"y":n},"nose":{"x":n,"y":n}}
If no face is detected, return {"no_face":true}.`,
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Detect facial landmarks.' },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}`, detail: 'low' } },
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

async function cropFace(buffer: Buffer, landmarks: Landmarks): Promise<string> {
  try {
    const meta = await sharp(buffer).metadata();
    const W = meta.width ?? 1000;
    const H = meta.height ?? 1000;

    const pts = [
      landmarks.left_brow, landmarks.right_brow,
      landmarks.left_eye, landmarks.right_eye,
      landmarks.nose, landmarks.lips,
      landmarks.left_cheek, landmarks.right_cheek,
    ];

    const xs = pts.map(p => p.x);
    const ys = pts.map(p => p.y);

    const pad = 15; // % padding
    const left   = Math.max(0, Math.min(...xs) - pad) / 100;
    const top    = Math.max(0, Math.min(...ys) - pad) / 100;
    const right  = Math.min(100, Math.max(...xs) + pad) / 100;
    const bottom = Math.min(100, Math.max(...ys) + pad) / 100;

    const cropLeft   = Math.round(left * W);
    const cropTop    = Math.round(top * H);
    const cropWidth  = Math.round((right - left) * W);
    const cropHeight = Math.round((bottom - top) * H);

    const cropped = await sharp(buffer)
      .extract({ left: cropLeft, top: cropTop, width: cropWidth, height: cropHeight })
      .resize({ width: 600, withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toBuffer();

    return `data:image/jpeg;base64,${cropped.toString('base64')}`;
  } catch {
    return '';
  }
}

function buildSystemPrompt(goal: string, style: string, lang: string): string {
  return `את מאפרת מקצועית ונחמדה שמסתכלת על תמונת האיפור ועוזרת לשפר אותו.

הקשר: מטרת האיפור: ${goal} | סגנון: ${style} | שפה: ${lang}

הטון שלך כמו חברה שמבינה באיפור — נחמדה, ישירה, עממית. מחמיאה כשיש על מה, אבל גם מסבירה מה לתקן ואיך.

דוגמה לתיקון טוב:
compliment: "האייליינר נראה ממש יפה ומרים את העין."
recommendation: "הייתי מרככת טיפה את הקצה החיצוני — בצד שקרוב לאוזן — כדי שהמעבר ייראה חלק יותר. אפשר לטשטש עם מברשת קטנה תוך 10 שניות."

חוקים:
- אל תדברי על מבנה הפנים, רק על האיפור
- בדיוק 3 תיקונים
- כל recommendation: לפחות 2 משפטים, ספציפי ועממי
- אל תשתמשי במילים: גרוע, בעייתי, לא טוב, מכוער

אזורי הפנים הזמינים לתיקון:
- "eyes" — עיניים וצללית
- "brows" — גבות
- "lips" — שפתיים
- "blush" — סומק ולחיים
- "base" — בסיס ועור

בדיקת תמונה:
אם אין פנים ברורות → {"is_valid": false, "message": "לא זוהו פנים ברורות."}
אם אין איפור → {"is_valid": false, "message": "לא זוהה איפור ברור."}

אם תקינה, החזר JSON בלבד:
{
  "is_valid": true,
  "score": number,
  "summary": "משפט קצר ונחמד",
  "fixes": [
    {
      "area": "eyes/brows/lips/blush/base",
      "title": "כותרת קצרה",
      "compliment": "מחמאה ספציפית",
      "recommendation": "לפחות 2 משפטים — מה לתקן, איפה, ואיך",
      "location_explanation": "תיאור המיקום"
    }
  ]
}
אל תוסיפי שום דבר מחוץ ל-JSON.`;
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

    // Detect landmarks and analyze in parallel
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
              { type: 'text', text: 'נתחי את האיפור.' },
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}`, detail: 'high' } },
            ],
          },
        ],
      }),
    ]);

    // Crop face image
    const face_image = await cropFace(req.file.buffer, landmarks);

    const raw = analysisResponse.choices[0].message.content ?? '{}';
    const result = JSON.parse(raw);

    // Add zone info to each fix
    if (result.is_valid && Array.isArray(result.fixes)) {
      result.fixes = result.fixes.map((fix: any) => ({
        ...fix,
        zone: ZONES[fix.area] ?? ZONES.base,
      }));
    }

    res.json({ ...result, face_image });
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, '0.0.0.0', () => console.log(`Makeup analyzer server running on port ${PORT}`));
