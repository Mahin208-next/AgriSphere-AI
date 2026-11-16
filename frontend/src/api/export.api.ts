import { apiClient } from './client';
import type { ExportRfq, ExportQuotation } from '../@types';

export const exportApi = {
  getAllRfqs: async (params?: { cropId?: string; destinationCountry?: string }): Promise<{ success: boolean; data: ExportRfq[] }> => {
    const query = new URLSearchParams(params as any).toString();
    return apiClient.get(`/export/rfqs${query ? `?${query}` : ''}`);
  },

  getRfqById: async (id: string): Promise<{ success: boolean; data: ExportRfq }> => {
    return apiClient.get(`/export/rfqs/${id}`);
  },

  createRfq: async (data: Partial<ExportRfq>): Promise<{ success: boolean; data: ExportRfq }> => {
    return apiClient.post('/export/rfqs', data);
  },

  submitQuotation: async (rfqId: string, data: {
    exporterId: string;
    offeredPricePerUnitUsd: number;
    incoterm: string;
    packagingDetails: string;
    certificationsOffered: string[];
    validUntil: string;
    notes?: string;
  }): Promise<{ success: boolean; data: ExportQuotation }> => {
    return apiClient.post(`/export/rfqs/${rfqId}/quotations`, data);
  },

  getComplianceGuidelines: async (cropId?: string): Promise<{ success: boolean; data: any }> => {
    return apiClient.get(`/export/guidelines${cropId ? `?cropId=${cropId}` : ''}`);
  }
};

