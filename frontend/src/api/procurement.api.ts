import { apiClient } from "./client";
import { Order, ProcurementRequest, SupplierOffer } from "../@types";

export const procurementApi = {
  getRequests: (cropId?: string, district?: string) => {
    const params = new URLSearchParams();
    if (cropId) params.append("cropId", cropId);
    if (district) params.append("district", district);
    const query = params.toString();
    return apiClient<{ success: boolean; requests: ProcurementRequest[] }>(
      query ? `/procurement?${query}` : "/procurement"
    );
  },
  getRequestById: (id: string) =>
    apiClient<{
      success: boolean;
      request: ProcurementRequest;
      offers: SupplierOffer[];
      isOwner: boolean;
    }>(`/procurement/${id}`),
  createRequest: (payload: any) =>
    apiClient<{ success: boolean; request: ProcurementRequest }>("/procurement", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getOffers: (requestId: string) =>
    apiClient<{ success: boolean; offers: SupplierOffer[] }>(
      `/procurement/${requestId}/offers`
    ),
  submitOffer: (requestId: string, payload: any) =>
    apiClient<{ success: boolean; message: string; offer: SupplierOffer }>(
      `/procurement/${requestId}/offers`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),
  acceptOffer: (offerId: string, requestId: string) =>
    apiClient<{ success: boolean; message: string; order: Order }>(
      `/procurement/offers/${offerId}/accept`,
      {
        method: "POST",
        body: JSON.stringify({ requestId }),
      }
    ),
};

