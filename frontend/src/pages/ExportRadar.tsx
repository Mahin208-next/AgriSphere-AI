import React, { useState, useEffect } from 'react';
import type { ExportRfq } from '../@types';
import { exportApi } from '../api/export.api';
import { ExportRadarView } from '../components/ExportRadarView';

export const ExportRadar: React.FC = () => {
  const [rfqs, setRfqs] = useState<ExportRfq[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRfqs = async () => {
    try {
      setLoading(true);
      const res = await exportApi.getAllRfqs();
      if (res?.data) {
        setRfqs(res.data);
      }
    } catch {
      // Mock fallback
      setRfqs([
        {
          id: 'rfq_1',
          buyerId: 'user_importer_1',
          buyer: {
            id: 'user_importer_1',
            name: 'Al-Karam Gulf Trading LLC',
            phone: '+971501234567',
            role: 'IMPORTER',
            isVerified: true,
            businessProfile: {
              companyName: 'Al-Karam Gulf Trading LLC',
              businessType: 'International Importer',
              tradeLicenseNumber: 'DXB-TR-9941',
              isVerified: true
            }
          },
          cropId: 'crop_potato',
          crop: {
            id: 'crop_potato',
            name: 'Diamond Potato',
            nameBn: 'ডায়মন্ড আলু',
            category: 'Vegetables'
          },
          quantityRequiredKg: 50000,
          targetPriceUsdPerUnit: 0.42,
          destinationCountry: 'United Arab Emirates',
          destinationPort: 'Jebel Ali, Dubai',
          qualityGrade: 'Grade A Export',
          packagingRequirements: '10kg corrugated pre-cooled export boxes',
          deliveryDeadline: new Date(Date.now() + 20 * 86400000).toISOString(),
          status: 'OPEN',
          incoterms: 'FOB Chattogram',
          quotations: []
        },
        {
          id: 'rfq_2',
          buyerId: 'user_importer_2',
          buyer: {
            id: 'user_importer_2',
            name: 'Gulf Fresh Produce Riyadh',
            phone: '+966501234567',
            role: 'IMPORTER',
            isVerified: true,
            businessProfile: {
              companyName: 'Gulf Fresh Produce Riyadh',
              businessType: 'Produce Aggregator',
              tradeLicenseNumber: 'SA-99014',
              isVerified: true
            }
          },
          cropId: 'crop_chilli',
          crop: {
            id: 'crop_chilli',
            name: 'Green Chilli (Bullet)',
            nameBn: 'কাঁচা মরিচ',
            category: 'Spices'
          },
          quantityRequiredKg: 10000,
          targetPriceUsdPerUnit: 1.85,
          destinationCountry: 'Saudi Arabia',
          destinationPort: 'King Abdulaziz Port, Dammam',
          qualityGrade: 'Grade A Fresh',
          packagingRequirements: '5kg ventilated plastic crates (Air Freight)',
          deliveryDeadline: new Date(Date.now() + 12 * 86400000).toISOString(),
          status: 'OPEN',
          incoterms: 'FOB Dhaka Airport',
          quotations: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRfqs();
  }, []);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="py-12 text-center text-xs text-earth-400">Loading export radar...</div>
      ) : (
        <ExportRadarView rfqs={rfqs} onRefresh={fetchRfqs} />
      )}
    </div>
  );
};

