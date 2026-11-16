import { apiClient } from './client';
import type { ChatMessage } from '../@types';

export const assistantApi = {
  sendMessage: async (message: string, context?: { role?: string; district?: string; crop?: string }): Promise<{
    success: boolean;
    data: {
      reply: string;
      suggestions?: string[];
      relatedCropPrices?: any[];
    };
  }> => {
    return apiClient.post('/assistant/chat', { message, context });
  },

  getSamplePrompts: async (): Promise<{ success: boolean; data: string[] }> => {
    return apiClient.get('/assistant/sample-prompts');
  }
};

