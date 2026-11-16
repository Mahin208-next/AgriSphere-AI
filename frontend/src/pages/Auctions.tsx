import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAuctions } from '../hooks/useAuctions';
import { usePrices } from '../hooks/usePrices';
import { LiveAuctionCard } from '../components/LiveAuctionCard';
import {
  Gavel,
  Plus,
  Filter,
  Search,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const Auctions: React.FC = () => {
  const { language, currentUser, activePersona } = useAuth();
  const { auctions, loading, placeBid, acceptBid, createAuction } = useAuctions();
  const { crops, districts } = usePrices();

  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [cropId, setCropId] = useState('crop_potato');
  const [quantityKg, setQuantityKg] = useState(2000);
  const [startingPrice, setStartingPrice] = useState(25);
  const [reservePrice, setReservePrice] = useState(27);
  const [minIncrement, setMinIncrement] = useState(1);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [districtId, setDistrictId] = useState('dist_bogura');
  const [upazila, setUpazila] = useState('Shibganj');
  const [qualityGrade, setQualityGrade] = useState('Grade A');
  const [creating, setCreating] = useState(false);

  const isFarmer = currentUser?.role === 'FARMER' || currentUser?.role === 'ADMIN';

  const filteredAuctions = auctions.filter((auc) => {
    if (selectedCrop && auc.cropId !== selectedCrop) return false;
    if (selectedDistrict && auc.districtId !== selectedDistrict) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const cropName = (auc.crop?.name || '').toLowerCase();
      const cropNameBn = (auc.crop?.nameBn || '').toLowerCase();
      return cropName.includes(q) || cropNameBn.includes(q);
    }
    return true;
  });

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

      await createAuction({
        sellerId: currentUser?.id || 'user_farmer_1',
        cropId,
        quantityKg,
        startingPricePerUnit: startingPrice,
        reservePricePerUnit: reservePrice,
        minBidIncrement: minIncrement,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        districtId,
        upazila,
        qualityGrade,
        status: 'ACTIVE'
      });

      setShowCreateModal(false);
    } catch (err: any) {
      alert(err?.message || 'Failed to create auction');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-agri-900 via-agri-800 to-earth-900 text-white p-6 rounded-2xl shadow-md border border-agri-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-agri-300 uppercase tracking-wider">
            <Gavel className="w-4 h-4 text-amber-400" />
            <span>System A: Live Competitive Bidding</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-1">
            {language === 'bn' ? 'কৃষক লাইভ নিলাম কেন্দ্র' : 'Farmer Live Auction Floor'}
          </h2>
          <p className="text-xs text-agri-200 mt-1 max-w-xl">
            {language === 'bn'
              ? 'কৃষকদের জন্য স্বচ্ছ বাজার মূল্য ও একাধিক প্রাতিষ্ঠানিক ক্রেতার রিয়েল-টাইম প্রতিযোগিতা।'
              : 'Empowering farmers with transparent pricing, anti-sniping bid extensions, and private reserve price protection.'}
          </p>
        </div>

        {isFarmer && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-earth-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? 'নতুন নিলাম শুরু করুন' : 'Start New Auction'}</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-earth-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-earth-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? 'শস্য খুঁজুন (যেমন: আলু)...' : 'Search crop...'}
              className="pl-9 pr-3 py-1.5 bg-earth-50 border border-earth-300 rounded-xl text-xs font-medium text-earth-800 focus:outline-none focus:ring-2 focus:ring-agri-500"
            />
          </div>

          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="px-3 py-1.5 bg-earth-50 border border-earth-300 rounded-xl text-xs font-semibold text-earth-800 focus:outline-none focus:ring-2 focus:ring-agri-500"
          >
            <option value="">{language === 'bn' ? 'সকল শস্য' : 'All Crops'}</option>
            {crops.map((c) => (
              <option key={c.id} value={c.id}>
                {language === 'bn' ? c.nameBn : c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-1.5 bg-earth-50 border border-earth-300 rounded-xl text-xs font-semibold text-earth-800 focus:outline-none focus:ring-2 focus:ring-agri-500"
          >
            <option value="">{language === 'bn' ? 'সকল জেলা' : 'All Districts'}</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {language === 'bn' ? d.nameBn : d.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-earth-500 font-medium">
          {language === 'bn' ? `মোট চলমান নিলাম: ${filteredAuctions.length} টি` : `${filteredAuctions.length} active auctions`}
        </span>
      </div>

      {/* Live Auctions Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-earth-400">
          Loading auctions...
        </div>
      ) : filteredAuctions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-earth-200 p-12 text-center text-earth-500 text-xs">
          {language === 'bn' ? 'কোনো চলমান নিলাম পাওয়া যায়নি।' : 'No active auctions match the filter.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAuctions.map((auc) => (
            <LiveAuctionCard
              key={auc.id}
              auction={auc}
              onBid={async (id, amt) => {
                await placeBid(id, activePersona.id, amt);
              }}
              onAccept={async (id, bidId) => {
                await acceptBid(id, bidId);
              }}
            />
          ))}
        </div>
      )}

      {/* Farmer Create Auction Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-earth-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-earth-900 mb-1">
              {language === 'bn' ? 'নতুন লাইভ নিলাম শুরু করুন' : 'Create Live Agricultural Auction'}
            </h3>
            <p className="text-xs text-earth-500 mb-4">
              {language === 'bn'
                ? 'আপনার ফসলের বিবরণ ও শুরুর দর দিয়ে নিলাম চালু করুন। ক্রেতাদের বিড সরাসরি আপডেট হবে।'
                : 'Set base price, private reserve, and anti-snipe duration for competitive live bidding.'}
            </p>

            <form onSubmit={handleCreateAuction} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-earth-700 mb-1">
                    {language === 'bn' ? 'ফসল নির্বাচন করুন' : 'Select Crop'}
                  </label>
                  <select
                    value={cropId}
                    onChange={(e) => setCropId(e.target.value)}
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl font-semibold focus:ring-2 focus:ring-agri-500 focus:outline-none"
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
                    {language === 'bn' ? 'পরিমাণ (কেজি)' : 'Total Quantity (Kg)'}
                  </label>
                  <input
                    type="number"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl font-semibold font-mono focus:ring-2 focus:ring-agri-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-earth-700 mb-1">
                    {language === 'bn' ? 'শুরুর দর (টাকা/কেজি)' : 'Starting Price (BDT/kg)'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl font-semibold font-mono focus:ring-2 focus:ring-agri-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-earth-700 mb-1">
                    {language === 'bn' ? 'গোপন রিজার্ভ দর (টাকা/কেজি)' : 'Private Reserve Price (BDT/kg)'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={reservePrice}
                    onChange={(e) => setReservePrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl font-semibold font-mono focus:ring-2 focus:ring-agri-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-earth-400">
                    {language === 'bn' ? 'ক্রেতাদের কাছে এই দর গোপন থাকবে।' : 'Hidden from buyers until met.'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-earth-700 mb-1">
                    {language === 'bn' ? 'নিলামের সময়কাল' : 'Auction Duration'}
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl font-semibold focus:ring-2 focus:ring-agri-500 focus:outline-none"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={60}>1 Hour</option>
                    <option value={120}>2 Hours</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-earth-700 mb-1">
                    {language === 'bn' ? 'ন্যূনতম বিড বৃদ্ধি' : 'Min Bid Increment'}
                  </label>
                  <input
                    type="number"
                    value={minIncrement}
                    onChange={(e) => setMinIncrement(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl font-semibold font-mono focus:ring-2 focus:ring-agri-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-earth-700 mb-1">
                    {language === 'bn' ? 'জেলা' : 'District'}
                  </label>
                  <select
                    value={districtId}
                    onChange={(e) => setDistrictId(e.target.value)}
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl font-semibold focus:ring-2 focus:ring-agri-500 focus:outline-none"
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
                    {language === 'bn' ? 'উপজেলা / মোকাম' : 'Upazila / Location'}
                  </label>
                  <input
                    type="text"
                    value={upazila}
                    onChange={(e) => setUpazila(e.target.value)}
                    className="w-full px-3 py-2 border border-earth-300 rounded-xl font-semibold focus:ring-2 focus:ring-agri-500 focus:outline-none"
                  />
                </div>
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
                  className="px-5 py-2 bg-agri-700 hover:bg-agri-800 text-white font-bold rounded-xl transition shadow-xs"
                >
                  {creating ? 'Creating...' : language === 'bn' ? 'নিলাম শুরু করুন' : 'Launch Auction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

