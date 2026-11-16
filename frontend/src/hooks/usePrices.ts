import { useState, useEffect, useCallback } from 'react';
import type { MarketPrice, Crop } from '../@types';
import { priceApi } from '../api/price.api';

export const usePrices = (selectedCropId?: string, selectedDistrictId?: string) => {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [pricesRes, cropsRes, districtsRes] = await Promise.all([
        priceApi.getAll({
          cropId: selectedCropId,
          districtId: selectedDistrictId
        }),
        priceApi.getCrops(),
        priceApi.getDistricts()
      ]);

      if (pricesRes?.data) setPrices(pricesRes.data);
      if (cropsRes?.data) setCrops(cropsRes.data);
      if (districtsRes?.data) setDistricts(districtsRes.data);

      if (selectedCropId) {
        const trendRes = await priceApi.getTrends(selectedCropId, 7);
        if (trendRes?.data) setTrends(trendRes.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load market prices');
    } finally {
      setLoading(false);
    }
  }, [selectedCropId, selectedDistrictId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    prices,
    crops,
    districts,
    trends,
    loading,
    error,
    refresh: fetchData
  };
};

