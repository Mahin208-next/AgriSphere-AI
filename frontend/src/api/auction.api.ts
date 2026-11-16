import { apiClient } from "./client";
import { Auction, Bid, Order, ProductListing } from "../@types";

export const auctionApi = {
  getAuctions: (status?: string) =>
    apiClient<{ success: boolean; auctions: Auction[] }>(
      status ? `/auctions?status=${status}` : "/auctions"
    ),
  getAuctionById: (id: string) =>
    apiClient<{
      success: boolean;
      auction: Auction;
      bids: Bid[];
      listing?: ProductListing;
      serverTime: string;
      isOwner: boolean;
    }>(`/auctions/${id}`),
  createListing: (payload: any) =>
    apiClient<{ success: boolean; listing: ProductListing; auctionId?: string }>(
      "/auctions/listings",
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),
  getBids: (auctionId: string) =>
    apiClient<{ success: boolean; bids: Bid[] }>(`/auctions/${auctionId}/bids`),
  submitBid: (auctionId: string, payload: { amount: number; isAnonymous?: boolean; bidderId?: string }) =>
    apiClient<{ success: boolean; message: string; bid: Bid; auction: Auction }>(
      `/auctions/${auctionId}/bids`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    ),
  acceptOffer: (auctionId: string, bidId?: string) =>
    apiClient<{ success: boolean; message: string; order: Order }>(
      `/auctions/${auctionId}/accept-offer`,
      {
        method: "POST",
        body: JSON.stringify({ bidId }),
      }
    ),
};

