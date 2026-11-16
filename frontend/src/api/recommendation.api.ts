import { apiClient } from './client';
import type { NetReturnAnalysis, CropPriceRecommendation } from '../@types';

export const recommendationApi = {
  getNetReturnComparison: async (params: {
    cropId: string;
    quantityKg: number;
    sourceDistrictId: string;
    destinationDistrictIds?: string[];
  }): Promise<{ success: boolean; data: NetReturnAnalysis }> => {
    return apiClient.post('/recommendations/net-return', params);
  },

  getCropSellingAdvice: async (cropId: string, districtId?: string): Promise<{ success: boolean; data: CropPriceRecommendation }> => {
    const query = districtId ? `?districtId=${districtId}` : '';
    return apiClient.get(`/recommendations/crop/${cropId}${query}`);
  },

  getOversupplyAlerts: async (): Promise<{ success: boolean; data: any[] }> => {
    return apiClient.get('/recommendations/oversupply-alerts');
  }
};

