import axios from 'axios';
import { Platform } from 'react-native';
import { AppLanguage, Narration, Story } from '../types';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const storyApi = {
  list: async (userId = 1): Promise<Story[]> => {
    const { data } = await api.get<Story[]>('/api/stories', { params: { userId } });
    return data;
  },

  get: async (id: number): Promise<Story> => {
    const { data } = await api.get<Story>(`/api/stories/${id}`);
    return data;
  },

  create: async (payload: {
    title: string;
    content: string;
    language: AppLanguage;
    userId?: number;
  }): Promise<Story> => {
    const { data } = await api.post<Story>('/api/stories', {
      userId: payload.userId ?? 1,
      title: payload.title,
      content: payload.content,
      language: payload.language,
    });
    return data;
  },

  uploadDocument: async (payload: {
    uri: string;
    name: string;
    mimeType?: string;
    file?: File;
    title?: string;
    language: AppLanguage;
    userId?: number;
  }): Promise<Story> => {
    const formData = new FormData();

    if (Platform.OS === 'web') {
      if (payload.file) {
        formData.append('file', payload.file, payload.name);
      } else {
        const response = await fetch(payload.uri);
        const blob = await response.blob();
        formData.append('file', blob, payload.name);
      }
    } else {
      formData.append('file', {
        uri: payload.uri,
        name: payload.name,
        type: payload.mimeType ?? 'application/octet-stream',
      } as unknown as Blob);
    }

    if (payload.title?.trim()) {
      formData.append('title', payload.title.trim());
    }
    formData.append('language', payload.language);
    formData.append('userId', String(payload.userId ?? 1));

    const { data } = await axios.post<Story>(`${API_BASE_URL}/api/stories/upload`, formData, {
      timeout: 120000,
    });
    return data;
  },
};

export const narrationApi = {
  generate: async (payload: {
    storyId: number;
    pages: string[];
    language: AppLanguage;
    sourceLanguage: AppLanguage;
  }): Promise<Narration[]> => {
    const { data } = await api.post<Narration[]>('/api/narrations/generate', payload);
    return data;
  },

  translate: async (payload: {
    text: string;
    sourceLanguage: AppLanguage;
    targetLanguage: AppLanguage;
  }): Promise<{ translatedText: string }> => {
    const { data } = await api.post<{ translatedText: string }>('/api/narrations/translate', payload);
    return data;
  },

  getByStory: async (storyId: number, language?: AppLanguage): Promise<Narration[]> => {
    const { data } = await api.get<Narration[]>(`/api/narrations/story/${storyId}`, {
      params: language ? { language } : undefined,
    });
    return data;
  },
};

export const userApi = {
  updateLanguage: async (userId: number, language: AppLanguage) => {
    const { data } = await api.put(`/api/users/${userId}/language`, { language });
    return data;
  },
};

export default api;
