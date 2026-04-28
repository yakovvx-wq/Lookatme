import { AnalysisResult } from '../types';

export const MOCK_RESULT_EN: AnalysisResult = {
  score: 7.8,
  summary:
    'This look works really well for the occasion. There are 3 small fixes that will make it even more precise and polished.',
  fixes: [
    {
      area: 'eyes',
      title: 'Soften the eyeshadow edge',
      simple_instruction: 'Blend the top edge for 5 seconds with a clean brush.',
      marker_position: { x: 30, y: 35 },
    },
    {
      area: 'eyeliner',
      title: 'Balance the right wing',
      simple_instruction: 'Clean a tiny bit under the right wing so it matches the left.',
      marker_position: { x: 65, y: 38 },
    },
    {
      area: 'lips',
      title: 'Clean the lip edge',
      simple_instruction: 'Use a small brush with concealer around the lip corner.',
      marker_position: { x: 50, y: 68 },
    },
  ],
};

export const MOCK_RESULT_HE: AnalysisResult = {
  score: 7.8,
  summary:
    'הלוק עובד ממש טוב למאורע. יש 3 תיקונים קטנים שיהפכו אותו למדויק ומלוטש יותר.',
  fixes: [
    {
      area: 'eyes',
      title: 'רככי את קצה הצללית',
      simple_instruction: 'טשטשי את הקצה העליון עם מברשת נקייה — 5 שניות מספיקות.',
      marker_position: { x: 30, y: 35 },
    },
    {
      area: 'eyeliner',
      title: 'איזני את הכנף הימנית',
      simple_instruction: 'נקי טיפה מתחת לכנף הימנית כדי שתתאים לשמאלית.',
      marker_position: { x: 65, y: 38 },
    },
    {
      area: 'lips',
      title: 'נקי את קצה השפתון',
      simple_instruction: 'עברי עם מברשת קטנה וקונסילר מסביב לפינת השפתיים.',
      marker_position: { x: 50, y: 68 },
    },
  ],
};

export const MOCK_RESCAN_EN: AnalysisResult = {
  score: 8.9,
  summary:
    'Great improvement! The eyeshadow is now beautifully blended and the lip line looks clean and precise.',
  fixes: [
    {
      area: 'eyeliner',
      title: 'Almost perfect wing',
      simple_instruction: 'Just the tiniest bit more blending on the right wing and it will be flawless.',
      marker_position: { x: 65, y: 38 },
    },
  ],
};

export const MOCK_RESCAN_HE: AnalysisResult = {
  score: 8.9,
  summary: 'שיפור נהדר! הצללית ממוזגת יפה עכשיו וקו השפתיים נראה נקי ומדויק.',
  fixes: [
    {
      area: 'eyeliner',
      title: 'כמעט כנף מושלמת',
      simple_instruction: 'עוד טיפה טשטוש בכנף הימנית וזה יהיה מושלם לגמרי.',
      marker_position: { x: 65, y: 38 },
    },
  ],
};
