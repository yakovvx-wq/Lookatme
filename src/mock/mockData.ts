import { AnalysisResult } from '../types';

export const MOCK_RESULT_EN: AnalysisResult = {
  score: 7.8,
  summary: 'This look works really well for the occasion. A few small tweaks will make it even more polished.',
  recommendations: [
    {
      area: 'eyes',
      title: 'Soften the eyeshadow edge',
      compliment: 'Your eye color really pops with this shadow!',
      recommendation: 'Blend the top edge for 5 seconds with a clean fluffy brush. Work in small circular motions at the crease to soften any harsh lines.',
      quick_action: 'Blend crease 5 sec',
      marker_color: '#FF5BA7',
      marker_position: { x: 30, y: 35 },
    },
    {
      area: 'eyeliner',
      title: 'Balance the right wing',
      compliment: 'The left wing is really sharp and clean!',
      recommendation: 'Use a cotton swab to clean a tiny bit under the right wing so it mirrors the left. Dip it in micellar water for precise removal.',
      quick_action: 'Clean right wing',
      marker_color: '#FF8A3D',
      marker_position: { x: 65, y: 38 },
    },
    {
      area: 'lips',
      title: 'Refine the lip edge',
      compliment: 'The lip color is gorgeous and suits you perfectly!',
      recommendation: 'Use a small concealer brush around the lip corners to crisp up the edges. This takes 10 seconds and makes a huge difference in photos.',
      quick_action: 'Conceal lip edges',
      marker_color: '#FFCB57',
      marker_position: { x: 50, y: 68 },
    },
  ],
};

export const MOCK_RESULT_HE: AnalysisResult = {
  score: 7.8,
  summary: 'הלוק עובד ממש טוב למאורע. כמה תיקונים קטנים יהפכו אותו למלוטש עוד יותר.',
  recommendations: [
    {
      area: 'eyes',
      title: 'רככי את קצה הצללית',
      compliment: 'צבע הצללית ממש מחמיא לך!',
      recommendation: 'טשטשי את הקצה העליון עם מברשת נקייה ואוורירית — 5 שניות בתנועות עיגוליות בקרייס. זה ירכך את כל הקצוות החדים.',
      quick_action: 'טשטשי את הקרייס',
      marker_color: '#FF5BA7',
      marker_position: { x: 30, y: 35 },
    },
    {
      area: 'eyeliner',
      title: 'איזני את הכנף הימנית',
      compliment: 'הכנף השמאלית חדה ומושלמת!',
      recommendation: 'עברי עם מקל צמר גפן ספוג מי מיצלר מתחת לכנף הימנית כדי שתתאים לשמאלית. זה לוקח 10 שניות בסך הכל.',
      quick_action: 'נקי את הכנף',
      marker_color: '#FF8A3D',
      marker_position: { x: 65, y: 38 },
    },
    {
      area: 'lips',
      title: 'חדדי את קצה השפתיים',
      compliment: 'צבע השפתון ממש יפה ומחמיא!',
      recommendation: 'עברי עם מברשת קטנה וקונסילר מסביב לפינות השפתיים לחידוד הקצוות. זה ישפר את הלוק בצילומים משמעותית.',
      quick_action: 'קונסילר סביב השפתיים',
      marker_color: '#FFCB57',
      marker_position: { x: 50, y: 68 },
    },
  ],
};

export const MOCK_RESCAN_EN: AnalysisResult = {
  score: 8.9,
  summary: 'Great improvement! The eyeshadow is now beautifully blended and the lip line looks clean and precise.',
  recommendations: [
    {
      area: 'eyeliner',
      title: 'Almost perfect wing',
      compliment: 'The blending on that eyeshadow is stunning now!',
      recommendation: 'Just a tiny bit more blending on the right wing tip and it will be completely flawless. Use the very tip of a small brush.',
      quick_action: 'Blend wing tip',
      marker_color: '#FF5BA7',
      marker_position: { x: 65, y: 38 },
    },
  ],
};

export const MOCK_RESCAN_HE: AnalysisResult = {
  score: 8.9,
  summary: 'שיפור נהדר! הצללית ממוזגת יפה עכשיו וקו השפתיים נראה נקי ומדויק.',
  recommendations: [
    {
      area: 'eyeliner',
      title: 'כמעט כנף מושלמת',
      compliment: 'הצללית נראית עכשיו ממש מרשימה!',
      recommendation: 'עוד טיפה טשטוש בקצה הכנף הימנית וזה יהיה מושלם לגמרי. עבדי עם קצה דק של מברשת קטנה.',
      quick_action: 'טשטשי קצה הכנף',
      marker_color: '#FF5BA7',
      marker_position: { x: 65, y: 38 },
    },
  ],
};
