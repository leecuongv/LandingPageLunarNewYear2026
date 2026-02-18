export enum WishStyle {
  TRADITIONAL = 'Trang trọng, truyền thống',
  FUNNY = 'Hài hước, vui vẻ',
  POETIC = 'Thơ lục bát hoặc thơ ca',
  GENZ = 'Gen Z, trẻ trung, slang',
  TECH = 'Công nghệ, AI, Code',
}

export interface GeneratedCardData {
  wishText: string;
  imageUrl: string;
  audioBuffer: AudioBuffer | null;
  qrCodeUrl: string | null;
  senderName: string;
  recipientName: string;
}

export interface TravelSuggestion {
  name: string;
  description: string;
  url?: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        snippet: string;
      }[];
    }[];
  };
}