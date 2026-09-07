export type AppLanguage = 'en' | 'ta' | 'hi' | 'te' | 'ml' | 'kn';

export interface Story {
  id: number;
  userId: number;
  title: string;
  content: string;
  pages: string[];
  language: AppLanguage | string;
  status: string;
  createdAt: string;
}

export interface Narration {
  id: number;
  storyId: number;
  pageNumber: number;
  text: string;
  language: AppLanguage | string;
  voiceProfile: string;
  audioUrl: string;
  status: string;
  createdAt: string;
}

export type RootStackParamList = {
  Home: undefined;
  AddStory: undefined;
  StoryReader: { storyId: number; language: AppLanguage };
  Settings: undefined;
};
