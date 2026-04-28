import { Goal, Style, Language, AnalysisResponse } from '../types';
import { SERVER_URL } from '../config';

export async function analyzeMakeup(
  imageUri: string,
  goal: Goal,
  style: Style,
  language: Language
): Promise<AnalysisResponse> {
  const formData = new FormData();

  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  } as unknown as Blob);

  formData.append('goal', goal);
  formData.append('style', style);
  formData.append('language', language);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  let response: Response;
  try {
    response = await fetch(`${SERVER_URL}/analyze`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  return response.json() as Promise<AnalysisResponse>;
}
