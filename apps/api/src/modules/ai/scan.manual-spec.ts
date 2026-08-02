/**
 * Manual Integration Test Script — Gemini API Real Call
 * 
 * Thao tác chạy thủ công:
 *   GEMINI_API_KEY=your_key_here npx ts-node src/modules/ai/scan.manual-spec.ts
 */

import { GoogleGenAI } from '@google/genai';
import { VISUAL_OBSERVATION_SYSTEM_INSTRUCTION } from './prompts/visual-observation.prompt';

async function runManualTest() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ Vui lòng cung cấp GEMINI_API_KEY để chạy manual integration test.');
    process.exit(1);
  }

  console.log('🚀 Đang chạy Manual Integration Test với Gemini API thật...');
  const ai = new GoogleGenAI({ apiKey });

  // Dummy 1x1 pixel JPEG
  const sampleJpegBase64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: 'Trích xuất đặc điểm thị giác quan sát được từ tấm ảnh này theo đúng định dạng JSON.' },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: sampleJpegBase64,
              },
            },
          ],
        },
      ],
      config: {
        systemInstruction: VISUAL_OBSERVATION_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    console.log('✅ Gemini API Response:');
    console.log(response.text);
  } catch (err: any) {
    console.error('❌ Manual Test Error:', err.message);
  }
}

if (require.main === module) {
  runManualTest();
}
