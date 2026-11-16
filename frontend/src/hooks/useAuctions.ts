import { useState, useEffect, useCallback } from 'react';
import type { Auction, Bid } from '../@types';
import { auctionApi } from '../api/auction.api';
import { useRealtime } from './useRealtime';

export const useAuctions = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { lastEvent } = useRealtime();

  const fetchAuctions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await auctionApi.getAll();
      if (res && res.data) {
        setAuctions(res.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch auctions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  // Handle live incoming events from SSE
  useEffect(() => {
    if (!lastEvent) return;

    if (lastEvent.type === 'BID_PLACED') {
      const { auctionId, bid, currentHighestBid, totalBids } = lastEvent.data;
      setAuctions((prev) =>
        prev.map((auc) => {
          if (auc.id === auctionId) {
            return {
              ...auc,
              currentHighestBid,
              totalBids,
              bids: [bid, ...(auc.bids || [])]
            };
          }
          return auc;
        })
      );
    } else if (lastEvent.type === 'AUCTION_EXTENDED') {
      const { auctionId, newEndTime, extensionSeconds } = lastEvent.data;
      setAuctions((prev) =>
        prev.map((auc) => {
          if (auc.id === auctionId) {
            return {
              ...auc,
              endTime: newEndTime,
              antiSnipeExtensions: (auc.antiSnipeExtensions || 0) + 1
            };
          }
          return auc;
        })
      );
    } else if (lastEvent.type === 'AUCTION_CLOSED') {
      const { auctionId } = lastEvent.data;
      setAuctions((prev) =>
        prev.map((auc) => {
          if (auc.id === auctionId) {
            return {
              ...auc,
              status: 'CLOSED'
            };
          }
          return auc;
        })
      );
    }
  }, [lastEvent]);

  const placeBid = async (auctionId: string, bidderId: string, amountPerUnit: number) => {
    const res = await auctionApi.placeBid(auctionId, { bidderId, amountPerUnit });
    return res;
  };

  const createAuction = async (data: Partial<Auction>) => {
    const res = await auctionApi.create(data);
    await fetchAuctions();
    return res;
  };

  const acceptBid = async (auctionId: string, bidId: string) => {
    const res = await auctionApi.acceptBid(auctionId, bidId);
    await fetchAuctions();
    return res;
  };

  return {
    auctions,
    loading,
    error,
    refresh: fetchAuctions,
    placeBid,
    createAuction,
    acceptBid
  };
};

