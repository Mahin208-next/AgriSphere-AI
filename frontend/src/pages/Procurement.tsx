import React, { useState, useEffect } from 'react';
import type { ProcurementRequest } from '../@types';
import { procurementApi } from '../api/procurement.api';
import { priceApi } from '../api/price.api';
import { useAuth } from '../hooks/useAuth';
import { ProcurementCard } from '../components/ProcurementCard';
import {
  ShoppingBag,
  Plus,
  Filter,
  Search,
  Layers,
  Building2,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const Procurement: React.FC = () => {
  const { language, currentUser } = useAuth();
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states for Buyer
  const [title, setTitle] = useState('');
  const [cropId, setCropId] = useState('crop_potato');
  const [targetQuantityKg, setTargetQuantityKg] = useState(15000);
  const [minOfferQuantityKg, setMinOfferQuantityKg] = useState(1000);
  const [maxBudgetPerUnit, setMaxBudgetPerUnit] = useState(32);
  const [districtId, setDistrictId] = useState('dist_dhaka');
  const [deliveryLocation, setDeliveryLocation] = useState('Tejgaon Industrial Area, Dhaka');
  const [deliveryDeadline, setDeliveryDeadline] = useState('');
  const [qualityGrade, setQualityGrade] = useState('Grade A');
  const [isSplitAllowed, setIsSplitAllowed] = useState(true);
  const [creating, setCreating] = useState(false);

  const isBuyerOrFactory = currentUser?.role && ['BUYER', 'FACTORY', 'RETAILER', 'EXPORTER', 'ADMIN'].includes(currentUser.role);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [reqRes, cropsRes, distRes] = await Promise.all([
        procurementApi.getAll(),
        priceApi.getCrops(),
        priceApi.getDistricts()
      ]);
      if (reqRes?.data) setRequests(reqRes.data);
      if (cropsRes?.data) setCrops(cropsRes.data);
      if (distRes?.data) setDistricts(distRes.data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      await procurementApi.create({
        buyerId: currentUser?.id || 'user_factory_1',
        title: title || `${crops.find((c) => c.id === cropId)?.name || 'Crop'} Bulk Requirement`,
        cropId,
        targetQuantityKg,
        minOfferQuantityKg,
        maxBudgetPerUnit,
        districtId,
        deliveryLocation,
        deliveryDeadline: deliveryDeadline ? new Date(deliveryDeadline).toISOString() : new Date(Date.now() + 7 * 86400000).toISOString(),
        qualityGrade,
        isSplitAllowed
      });
      setShowCreateModal(false);
      await fetchRequests();
    } catch (err: any) {
      alert(err?.message || 'Failed to post procurement request');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-earth-900 text-white p-6 rounded-2xl shadow-md border border-blue-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-300 uppercase tracking-wider">
            <ShoppingBag className="w-4 h-4 text-blue-400" />
            <span>System B: Buyer Reverse Procurement</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-1">
            {language === 'bn' ? 'বায়ার প্রকিউরমেন্ট ও সরবরাহ চাহিদা' : 'Buyer Procurement & Reverse RFQs'}
          </h2>
          <p className="text-xs text-blue-200 mt-1 max-w-xl">
            {language === 'bn'
              ? 'খাদ্য কারখানা ও মিল মালিকদের বাল্ক ক্রয়ের চাহিদা। কৃষকরা সরাসরি সরবরাহ প্রস্তাব বা স্প্লিট লট অফার দিতে পারেন।'
              : 'Enterprise mills and institutional buyers post volume demand. Farmers provide direct reverse bids with split lot fulfillment.'}
          </p>
        </div>

        {isBuyerOrFactory && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? 'চাহিদা প্রকাশ করুন' : 'Post Requirement'}</span>
          </button>
        )}
      </div>

      {/* Procurement Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-earth-400">Loading requests...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {requests.map((req) => (
            <ProcurementCard
              key={req.id}
              request={req}
              onSubmitOffer={async (reqId, offer) => {
                await procurementApi.submitOffer(reqId, {
                  farmerId: currentUser?.id || 'user_farmer_1',
                  ...offer
                });
                await fetchRequests();
              }}
              onAcceptOffer={async (reqId, offerId) => {
                await procurementApi.acceptOffer(reqId, offerId);
                await fetchRequests();
              }}
            />
          ))}
        </div>
      )}

      {/* Buyer Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-earth-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-earth-900 mb-1">
              {language === 'bn' ? 'নতুন প্রকিউরমেন্ট রিকয়ারমেন্ট পোস্ট করুন' : 'Post New Procurement Requirement'}
            </h3>
            <p className="text-xs text-earth-500 mb-4">
              {language === 'bn'
                ? 'আপনার কারখানা বা মোকামের জন্য ফসলের প্রয়োজনীয় পরিমাণ, বাজেট এবং ডেলিভারি শর্তাবলী উল্লেখ করুন।'
                : 'Publish demand specifications for agricultural suppliers and regional farmers.'}
            </p>

            <form onSubmit={handleCreateRequest} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-earth-700 mb-1">
                  {language === 'bn' ? 'চাহিদার শিরোনাম' : 'Requirement Title'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 20,000 kg Diamond Potato for Starch Factory"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-earth-300 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-earth-700 mb-1">
                    {language === 'bn' ? 'ফসল নির্বাচন করুন' : 'Select Crop'}
                  </label>
                  <select
                    value={cropId}
                    onChange={(e) => setCropId(e.target.value)}
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {crops.map((c) => (
                      <option key={c.id} value={c.id}>
                        {language === 'bn' ? c.nameBn : c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-earth-700 mb-1">
                    {language === 'bn' ? 'মোট প্রয়োজন (কেজি)' : 'Target Volume (Kg)'}
                  </label>
                  <input
                    type="number"
                    value={targetQuantityKg}
                    onChange={(e) => setTargetQuantityKg(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl font-mono font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-earth-700 mb-1">
                    {language === 'bn' ? 'সর্বোচ্চ বাজেট (টাকা/কেজি)' : 'Max Budget (BDT/kg)'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={maxBudgetPerUnit}
                    onChange={(e) => setMaxBudgetPerUnit(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl font-mono font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-earth-700 mb-1">
                    {language === 'bn' ? 'ন্যূনতম একক অফার (কেজি)' : 'Min Single Offer (Kg)'}
                  </label>
                  <input
                    type="number"
                    value={minOfferQuantityKg}
                    onChange={(e) => setMinOfferQuantityKg(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl font-mono font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-earth-700 mb-1">
                    {language === 'bn' ? 'ডেলিভারি জেলা' : 'Destination District'}
                  </label>
                  <select
                    value={districtId}
                    onChange={(e) => setDistrictId(e.target.value)}
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {language === 'bn' ? d.nameBn : d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-earth-700 mb-1">
                    {language === 'bn' ? 'ডেলিভারি ঠিকানা' : 'Delivery Address'}
                  </label>
                  <input
                    type="text"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="split"
                  checked={isSplitAllowed}
                  onChange={(e) => setIsSplitAllowed(e.target.checked)}
                  className="rounded border-earth-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="split" className="font-semibold text-earth-800">
                  {language === 'bn' ? 'একাধিক কৃষকের থেকে আংশিক লট গ্রহণ করুন (Split Lots)' : 'Allow split multi-farmer fulfillment'}
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-earth-300 text-earth-700 font-bold rounded-xl hover:bg-earth-50 transition"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-xs"
                >
                  {creating ? 'Posting...' : language === 'bn' ? 'চাহিদা প্রকাশ করুন' : 'Post Requirement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

