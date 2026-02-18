import { GoogleGenAI, Modality } from "@google/genai";
import { WishStyle, GroundingChunk } from "../types";

const getAIClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- Text Generation ---
export const generateNewYearWish = async (
  recipient: string,
  style: WishStyle,
  sender: string
): Promise<string> => {
  const ai = getAIClient();
  
  const prompt = `
    Hãy viết một lời chúc Tết 2026 (Năm Bính Ngọ - Con Ngựa) thật hay, ấm áp và ý nghĩa.
    Người nhận: ${recipient}.
    Người gửi: ${sender}.
    Phong cách: ${style}.
    
    Yêu cầu:
    - Nhắc đến hình ảnh con ngựa (ngựa phi, mã đáo thành công) nhưng dùng từ ngữ nhẹ nhàng, trang nhã.
    - Nhắc đến sự bình an, hạnh phúc, sum vầy.
    - Độ dài: Khoảng 3-4 câu hoặc 1 khổ thơ ngắn.
    - Chỉ trả về nội dung lời chúc, không thêm dẫn dắt.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "Bạn là một nhà văn hóa am hiểu Tết Việt, giọng văn ấm áp, chân thành, giàu cảm xúc.",
        temperature: 0.8,
      },
    });
    return response.text || "Chúc mừng năm mới 2026, Mã Đáo Thành Công!";
  } catch (error) {
    console.error("Error generating wish:", error);
    return `Chúc ${recipient} năm mới Bính Ngọ 2026 Mã Đáo Thành Công, Vạn Sự Như Ý!`;
  }
};

// --- Oracle (Bói Quẻ) ---
export const generateOraclePrediction = async (luckyNumber: number): Promise<string> => {
  const ai = getAIClient();
  const prompt = `
    Người dùng chọn con số may mắn là ${luckyNumber} cho năm 2026 (Bính Ngọ).
    Hãy đóng vai 'Ông Đồ Già' đưa ra một lời khuyên hoặc quẻ bói nhẹ nhàng, tích cực.
    Gắn liền với hình tượng con ngựa (bền bỉ, trung thành, nhanh nhẹn).
    Ngắn gọn, sâu sắc, mang tính triết lý vui vẻ.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Tâm an vạn sự an. Năm mới vững bước như ngựa phi đường dài.";
  } catch (error) {
    return "Năm mới vạn sự tùy duyên, tâm sáng ắt thành công.";
  }
};

// --- Image Generation ---
export const generateCardBackground = async (description: string): Promise<string> => {
  const ai = getAIClient();
  const fullPrompt = `
    Tranh vẽ minh họa (Illustration) cho thiệp chúc Tết 2026 năm Bính Ngọ (Con Ngựa).
    Phong cách: ${description} (ví dụ: Màu nước Watercolor, Tranh dân gian Đông Hồ cách điệu, hoặc Minimalist Pastel).
    Màu sắc: Tươi sáng, ấm áp (Đỏ, Vàng, Hồng đào, Kem).
    Không khí: Hạnh phúc, bình yên, mùa xuân.
    Không có chữ (text) trong ảnh.
    Chất lượng cao, nghệ thuật.
  `;

  try {
    // Using gemini-2.5-flash-image as recommended for general image tasks
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found");
  } catch (error) {
    console.error("Error generating image:", error);
    // Fallback placeholder
    return `https://picsum.photos/seed/${Math.random()}/800/800`;
  }
};

// --- Text to Speech ---
// Helper to decode audio
const decodeAudioData = async (
  base64String: string,
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return await audioContext.decodeAudioData(bytes.buffer);
};

export const generateVoiceWish = async (text: string): Promise<AudioBuffer | null> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore is usually a good distinct voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      return await decodeAudioData(base64Audio, audioContext);
    }
    return null;
  } catch (error) {
    console.error("Error generating voice:", error);
    return null;
  }
};

// --- Spring Travel (Maps Grounding) ---
export interface TravelResult {
  text: string;
  chunks: GroundingChunk[];
}

export const getTravelSuggestions = async (interest: string, location?: { lat: number, lng: number }): Promise<TravelResult> => {
  const ai = getAIClient();
  
  const prompt = `
    Gợi ý 3 địa điểm du xuân thanh bình, đẹp nhẹ nhàng cho năm 2026 dựa trên sở thích: "${interest}".
    Tập trung vào các địa điểm tại Việt Nam hoặc Châu Á mang đậm bản sắc văn hóa.
  `;

  try {
    const config: any = {
      tools: [{ googleMaps: {} }],
    };

    if (location) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: location.lat,
            longitude: location.lng
          }
        }
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Maps grounding requires 2.5 series
      contents: prompt,
      config: config
    });

    const text = response.text || "Không tìm thấy địa điểm phù hợp.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];

    return { text, chunks };

  } catch (error) {
    console.error("Travel suggestion error:", error);
    return { text: "Rất tiếc, AI đang bận du xuân, vui lòng thử lại sau!", chunks: [] };
  }
};