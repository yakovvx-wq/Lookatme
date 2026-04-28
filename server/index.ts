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
  daily: 'Daily casual look',
  work: 'Professional work look',
  date: 'Romantic date look',
  event: 'Special event look',
  photo: 'Photoshoot look',
};

const STYLE_LABELS: Record<string, string> = {
  natural: 'Natural minimal',
  clean: 'Clean and polished',
  softGlam: 'Soft glam',
  fullGlam: 'Full glam',
  dramatic: 'Dramatic',
  bold: 'Bold',
};

function buildSystemPrompt(goal: string, style: string, lang: string): string {
  return `אתה מאפר מקצועי שעוזר למשתמשת לתקן את האיפור שלה במהירות לפני יציאה מהבית.

המטרה שלך:
לתת תיקונים פשוטים, ברורים ומהירים שאפשר לבצע תוך פחות מ־30 שניות.

הקשר:
המטרה של האיפור: ${goal}
הסגנון הרצוי: ${style}

חוקים חשובים:
- אל תדרג יופי או מראה כללי.
- אל תתייחס לפנים או למבנה הפנים.
- התייחס רק לאיפור.
- דבר בשפה פשוטה ולא מקצועית.
- אל תשתמש במונחים מסובכים.
- תן בדיוק 3 תיקונים בלבד.
- כל תיקון חייב להיות קצר (עד 10 מילים), ברור, פעולה שאפשר לבצע מיד, ספציפי.
- ענה בשפה: ${lang}.

בדיקת תמונה:
אם אין בתמונה פנים ברורות:
{"is_valid": false, "message": "..."}
אם יש פנים אך אין איפור ברור:
{"is_valid": false, "message": "..."}

אם התמונה תקינה, החזר JSON בלבד:
{
  "is_valid": true,
  "score": number,
  "summary": "משפט קצר ופשוט",
  "fixes": [
    {"text": "תיקון פשוט", "x": number, "y": number},
    {"text": "תיקון פשוט", "x": number, "y": number},
    {"text": "תיקון פשוט", "x": number, "y": number}
  ]
}

x,y = מיקום על הפנים באחוזים (0–100). x: שמאל→ימין, y: למעלה→למטה.
אל תוסיף טקסט מחוץ ל־JSON.`;
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
      max_tokens: 1000,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'נתח את תמונת האיפור.' },
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
    res.json(result);
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, '0.0.0.0', () => console.log(`Makeup analyzer server running on port ${PORT}`));
