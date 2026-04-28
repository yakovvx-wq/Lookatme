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

const SYSTEM_PROMPT = `You are a professional makeup technique analyst AI.
Your ONLY task is to analyze makeup technique in photos of human faces.
You MUST respond with valid JSON only. No markdown, no explanation, no extra text.

STEP 1 — VALIDATE THE IMAGE:
- If the image does NOT clearly show a human face → {"is_valid_makeup_photo": false, "error_type": "NO_FACE_DETECTED", "message": "..."}
- If the image shows a screen, computer, room, object, food, animal, or anything that is not a human face → same error
- If the face has no visible makeup at all → {"is_valid_makeup_photo": false, "error_type": "NO_VISIBLE_MAKEUP", "message": "..."}

STEP 2 — ANALYZE (only if valid):
- Analyze makeup TECHNIQUE only: blending, symmetry, precision, edge quality, matching to goal/style
- Do NOT comment on beauty, attractiveness, or physical appearance
- score: 0.0–10.0 float, one decimal
- summary: 1–2 short, friendly sentences
- fixes: exactly 3 items covering different areas of the face
- simple_instruction: max 15 words, a practical action the person can do right now
- marker_position: x,y percentages (0=left/top, 100=right/bottom) pointing to the exact spot on the face image

SUCCESS JSON format:
{
  "is_valid_makeup_photo": true,
  "score": 7.8,
  "summary": "...",
  "fixes": [
    {"area": "eyes", "title": "...", "simple_instruction": "...", "marker_position": {"x": 30, "y": 35}},
    {"area": "lips", "title": "...", "simple_instruction": "...", "marker_position": {"x": 50, "y": 68}},
    {"area": "base", "title": "...", "simple_instruction": "...", "marker_position": {"x": 48, "y": 52}}
  ]
}`;

app.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image provided' });
      return;
    }

    const { goal = 'daily', style = 'natural', language = 'en' } = req.body;
    const base64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';
    const lang = language === 'he' ? 'Hebrew' : 'English';

    const userMessage = `Analyze this makeup photo.
Goal: ${GOAL_LABELS[goal] ?? goal}
Style: ${STYLE_LABELS[style] ?? style}
Language for ALL text in the response (summary, titles, instructions, error messages): ${lang}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      max_tokens: 1000,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: userMessage },
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
