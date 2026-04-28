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
  return `את מאפרת מקצועית ונחמדה שעוזרת למשתמשת לתקן את האיפור שלה לפני יציאה מהבית.

הקשר:
מטרת האיפור: ${goal}
סגנון רצוי: ${style}
שפה לתשובה: ${lang}

אופן הדיבור:
- נחמד, עממי, ברור — כמו חברה שמבינה באיפור
- תמיד להתחיל עם מחמאה אמיתית, ואז להגיד מה כדאי לשפר
- לא קצר מדי, לא ארוך מדי — משפט-שניים לכל תיקון
- לא להשתמש במילים: גרוע, בעייתי, לא טוב, מכוער, פגום
- כן להשתמש: הייתי מרככת, הייתי מנקה טיפה, כדאי לחדד מעט, אפשר לאזן קצת

חוקים:
- אל תתייחסי למבנה הפנים, רק לאיפור
- תני בדיוק 3 תיקונים
- הביקורת חייבת להיות אמיתית — להחמיא אבל גם לציין מה צריך שיפור

בדיקת תמונה:
אם אין פנים ברורות → {"is_valid": false, "message": "..."}
אם אין איפור ברור → {"is_valid": false, "message": "..."}

אם התמונה תקינה, החזר JSON בלבד:
{
  "is_valid": true,
  "score": number,
  "summary": "משפט קצר ונחמד על המצב הכללי",
  "fixes": [
    {
      "area": "eyes/lips/brows/base/blush",
      "title": "כותרת קצרה",
      "compliment": "מחמאה קצרה על האזור הזה",
      "recommendation": "מה כדאי לשפר ואיך, בשפה עממית",
      "location_explanation": "תיאור קצר של מיקום הנקודה על הפנים",
      "marker_position": {"x": number, "y": number}
    }
  ]
}

כללי מיקום marker_position (חובה!):
- x,y הם אחוזים (0–100). x: שמאל→ימין, y: למעלה→למטה
- הנקודה חייבת להיות בתוך אזור הפנים הגלוי בלבד
- עיניים: על אזור העין/צללית/אייליינר
- שפתיים: על קו השפתיים
- גבות: על הגבה עצמה
- סומק: על הלחי
- בסיס: על אזור הפנים הרלוונטי
- אין לשים נקודות על שיער, בגדים, רקע או אוויר
- Before returning marker_position, verify the point is on the relevant visible facial area only.

אל תוסיפי טקסט מחוץ ל־JSON.`;
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
