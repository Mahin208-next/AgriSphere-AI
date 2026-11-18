"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { CROPS_DATA } from "@/lib/data/crops";
import { 
  Camera, 
  Video, 
  Radio, 
  UploadCloud, 
  Gavel, 
  X, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  TrendingUp, 
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Eye,
  Mic,
  Maximize2
} from "lucide-react";

interface FarmerAuctionCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FarmerAuctionCreatorModal({
  isOpen,
  onClose,
  onSuccess,
}: FarmerAuctionCreatorModalProps) {
  const { currentUser, language, t } = useApp();

  // Mode: "photo" | "video" | "live"
  const [mediaMode, setMediaMode] = useState<"photo" | "video" | "live">("photo");

  // Form states
  const [cropId, setCropId] = useState("green_chilli");
  const [isCustomCrop, setIsCustomCrop] = useState(false);
  const [customCropNameBn, setCustomCropNameBn] = useState("");
  const [customCropNameEn, setCustomCropNameEn] = useState("");
  const [variety, setVariety] = useState("বিন্দু জাতের ফ্রেশ কাঁচা মরিচ");
  const [quantity, setQuantity] = useState(1500);
  const [unit, setUnit] = useState<"kg" | "mon" | "tonne">("kg");
  const [grade, setGrade] = useState("Grade A (Export/Premium)");
  const [startingPrice, setStartingPrice] = useState(130);
  const [expectedPrice, setExpectedPrice] = useState(150);
  const [reservePrice, setReservePrice] = useState(138);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [minIncrement, setMinIncrement] = useState(2);
  const [antiSnipe, setAntiSnipe] = useState(true);

  // Media states
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const selectedCrop = CROPS_DATA.find((c) => c.id === cropId) || CROPS_DATA[0];

  // Set default crop image initially if no images uploaded
  useEffect(() => {
    if (uploadedImages.length === 0 && selectedCrop?.image) {
      setUploadedImages([selectedCrop.image]);
    }
  }, [cropId, selectedCrop]);

  // Clean up camera stream on unmount or mode switch
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this environment");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn("Camera access fallback to simulated broadcast:", err);
      setCameraError(
        language === "bn"
          ? "লাইভ ওয়েবক্যামে সরাসরি সংযোগ নেওয়া যায়নি। সিস্টেমে হাই-ডেফিনিশন ফিল্ড ব্রডকাস্ট মোড সক্রিয় থাকবে।"
          : "Webcam access unavailable. Simulated High-Definition field broadcast mode is enabled."
      );
      setIsCameraActive(true);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const loadPresetImages = () => {
    setUploadedImages([
      selectedCrop.image,
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const isLive = mediaMode === "live";
      const payload = {
        cropId: isCustomCrop ? "custom" : cropId,
        customCropNameBn: isCustomCrop ? (customCropNameBn.trim() || "কৃষকের নিজস্ব ফসল") : undefined,
        customCropNameEn: isCustomCrop ? (customCropNameEn.trim() || "Custom Crop") : undefined,
        variety,
        quantity,
        unit,
        grade,
        startingPrice,
        expectedPrice,
        privateReservePrice: reservePrice,
        isAuction: true,
        auctionDurationMinutes: durationMinutes,
        minIncrement,
        images: uploadedImages.length > 0 ? uploadedImages : [selectedCrop?.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"],
        videoUrl: mediaMode === "video" ? videoUrl : undefined,
        isLiveStream: isLive,
      };

      const res = await fetch("/api/v1/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccessMessage(
          language === "bn"
            ? "আপনার ফসল সফলভাবে লাইভ নিলামে যুক্ত করা হয়েছে! ক্রেতারা এখন সরাসরি বিড করতে পারবেন।"
            : "Your crop has been launched into the live auction! Buyers can now place bids."
        );
        setTimeout(() => {
          stopCamera();
          onSuccess();
          onClose();
        }, 1200);
      } else {
        const d = await res.json();
        alert(d.error || "Failed to launch auction");
      }
    } catch (err: any) {
      console.error("Auction launch error:", err);
      alert("Error submitting auction");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 md:p-7 shadow-2xl border border-earth-200 max-h-[92vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-earth-400 hover:text-earth-700 hover:bg-earth-100 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3 sm:gap-3.5 mb-5 pr-8 sm:pr-10">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-agri-800 to-agri-600 flex items-center justify-center text-white shadow-md shadow-agri-950/20 shrink-0">
            <Gavel className="w-5 h-5 sm:w-6 sm:h-6 text-harvest-300" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-agri-100 text-agri-800 border border-agri-200">
                {language === "bn" ? "কৃষকের নিজস্ব নিলাম প্যানেল" : "Farmer Direct Auction Launch"}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 animate-pulse flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                System A
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-earth-900 mt-1 leading-normal">
              {language === "bn" ? "ফসল সরাসরি লাইভ নিলামে তুলুন" : "Put Crop Up for Live Auction"}
            </h2>
            <p className="text-xs text-earth-500 mt-0.5 leading-relaxed">
              {language === "bn"
                ? "নিজের পণ্য নিজেই ছবি, ভিডিও বা লাইভে এসে নিলামে ডাক তুলুন। মধ্যস্বত্বভোগী ছাড়া সর্বোচ্চ দর পান।"
                : "Upload real crop photos, field video, or go live to invite competitive bids from verified buyers."}
            </p>
          </div>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="mb-4 p-4 rounded-2xl bg-green-50 border border-green-200 flex items-center gap-3 text-green-900 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          {/* SECTION 1: MEDIA UPLOAD / LIVE SHOWCASE */}
          <div className="bg-earth-50/70 p-4 rounded-2xl border border-earth-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-earth-900 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-agri-700" />
                <span>{language === "bn" ? "১. পণ্যের ছবি / ভিডিও / সরাসরি লাইভ প্রদর্শন:" : "1. Crop Media / Live Video Showcase:"}</span>
              </label>
              <span className="text-[11px] text-earth-500">
                {language === "bn" ? "ক্রেতারা দেখে দর বাড়াবে" : "Visual transparency boosts bids"}
              </span>
            </div>

            {/* Media Mode Tabs */}
            <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-2 mb-3.5">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setMediaMode("photo");
                }}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition text-xs ${
                  mediaMode === "photo"
                    ? "bg-agri-800 text-white shadow-xs"
                    : "bg-white text-earth-700 border border-earth-200 hover:bg-earth-100"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{language === "bn" ? "ছবি আপলোড" : "Upload Photos"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setMediaMode("video");
                }}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition text-xs ${
                  mediaMode === "video"
                    ? "bg-agri-800 text-white shadow-xs"
                    : "bg-white text-earth-700 border border-earth-200 hover:bg-earth-100"
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>{language === "bn" ? "ভিডিও আপলোড" : "Upload Video"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMediaMode("live");
                  startCamera();
                }}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition text-xs ${
                  mediaMode === "live"
                    ? "bg-red-600 text-white shadow-md shadow-red-600/30 ring-2 ring-red-400"
                    : "bg-white text-red-700 border border-red-200 hover:bg-red-50"
                }`}
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>{language === "bn" ? "🔴 সরাসরি লাইভে আসুন" : "🔴 Go Live"}</span>
              </button>
            </div>

            {/* Mode 1: Photo Upload */}
            {mediaMode === "photo" && (
              <div className="space-y-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-earth-300 hover:border-agri-600 bg-white p-4 rounded-xl text-center cursor-pointer transition hover:bg-agri-50/40"
                >
                  <UploadCloud className="w-7 h-7 mx-auto text-agri-600 mb-1" />
                  <p className="font-bold text-earth-800">
                    {language === "bn" ? "জমির বা ফসলের ছবি আপলোড করতে এখানে ক্লিক করুন" : "Click to upload photos of harvested crop"}
                  </p>
                  <p className="text-[11px] text-earth-400 mt-0.5">
                    {language === "bn" ? "JPG, PNG ফরম্যাট সমর্থিত (একাধিক ছবি নির্বাচন করতে পারেন)" : "JPG, PNG formats supported (Multiple photos allowed)"}
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Uploaded Photos Grid */}
                {uploadedImages.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-earth-300 bg-earth-100">
                        <img src={img} alt="Crop preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition shadow"
                          title="Delete photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={loadPresetImages}
                      className="px-3 py-2 rounded-xl bg-earth-200 hover:bg-earth-300 text-earth-800 text-[11px] font-bold transition flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-agri-700" />
                      <span>{language === "bn" ? "নমুনা ফ্রেশ ছবি আনুন" : "Use HD Crop Presets"}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mode 2: Video Upload */}
            {mediaMode === "video" && (
              <div className="space-y-3">
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="border-2 border-dashed border-earth-300 hover:border-agri-600 bg-white p-4 rounded-xl text-center cursor-pointer transition hover:bg-agri-50/40"
                >
                  <Video className="w-7 h-7 mx-auto text-agri-600 mb-1" />
                  <p className="font-bold text-earth-800">
                    {language === "bn" ? "ফসলের ছোট ভিডিও আপলোড করুন (১০-৬০ সেকেন্ড)" : "Upload Short Field Video (10-60s)"}
                  </p>
                  <p className="text-[11px] text-earth-400 mt-0.5">
                    {language === "bn" ? "ফসল তোলার তাজা অবস্থা দেখতে ক্রেতারা ভিডিওতে বেশি আস্থা পায়" : "Video verification provides buyers 100% confidence"}
                  </p>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </div>

                {videoUrl ? (
                  <div className="rounded-xl overflow-hidden border border-earth-300 bg-black aspect-video max-h-48 relative">
                    <video src={videoUrl} controls className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setVideoUrl(null)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg text-xs font-bold"
                    >
                      {language === "bn" ? "ভিডিও মুছুন" : "Remove"}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setVideoUrl("https://assets.mixkit.co/videos/preview/mixkit-farmer-hands-holding-freshly-harvested-tomatoes-42866-large.mp4")}
                    className="w-full py-2 bg-agri-50 hover:bg-agri-100 border border-agri-200 text-agri-900 rounded-xl font-bold flex items-center justify-center gap-1.5 transition text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-agri-700" />
                    <span>{language === "bn" ? "নমুনা খামার ভিডিও লোড করুন (ডেমো)" : "Load Sample Verified Harvest Video"}</span>
                  </button>
                )}
              </div>
            )}

            {/* Mode 3: Go Live Stream */}
            {mediaMode === "live" && (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-56 border-2 border-red-500 shadow-lg">
                  {/* Video Screen */}
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Fallback Graphic if no webcam */}
                  {!mediaStreamRef.current && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-black/80 via-black/40 to-black/80 text-white p-4 text-center">
                      <div className="w-12 h-12 rounded-full bg-red-600/30 border border-red-500 flex items-center justify-center mb-2 animate-pulse">
                        <Radio className="w-6 h-6 text-red-400" />
                      </div>
                      <span className="font-bold text-sm">
                        {language === "bn" ? "হাই-ডেফিনিশন ফিল্ড ব্রডকাস্ট প্রস্তুত" : "HD Field Live Broadcast Ready"}
                      </span>
                      <p className="text-[11px] text-earth-300 max-w-xs mt-1">
                        {language === "bn"
                          ? "নিলাম চলাকালীন ক্রেতারা সরাসরি কৃষকের লাইভ ক্যামেরা ও ভিডিও স্ট্রিম দেখতে পাবেন।"
                          : "Buyers will see your live farm broadcast in real-time while competitive bidding is active."}
                      </p>
                    </div>
                  )}

                  {/* Live Overlay Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-red-600 text-white flex items-center gap-1.5 shadow-md animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white" />
                      LIVE ON-AIR
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-white backdrop-blur-xs flex items-center gap-1">
                      <Eye className="w-3 h-3 text-red-400" />
                      <span>{language === "bn" ? "১৮ জন ক্রেতা দেখছেন" : "18 Buyers Watching"}</span>
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-black/70 text-green-400 flex items-center gap-1 backdrop-blur-xs">
                      <Mic className="w-3 h-3 text-green-400" />
                      <span>MIC ON</span>
                    </span>
                    <button
                      type="button"
                      onClick={isCameraActive ? stopCamera : startCamera}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white text-earth-900 hover:bg-earth-100 transition shadow"
                    >
                      {isCameraActive ? (language === "bn" ? "ক্যামেরা বন্ধ" : "Pause") : (language === "bn" ? "ক্যামেরা চালু" : "Start")}
                    </button>
                  </div>
                </div>

                {cameraError && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    ℹ️ {cameraError}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* SECTION 2: CROP SPECS & DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-earth-700 font-bold mb-1">
                {language === "bn" ? "ফসল নির্বাচন করুন:" : "Crop Commodity:"}
              </label>
              <select
                value={cropId}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "custom") {
                    setIsCustomCrop(true);
                    setCropId("custom");
                    setVariety("");
                  } else {
                    setIsCustomCrop(false);
                    setCropId(val);
                    const c = CROPS_DATA.find((item) => item.id === val);
                    if (c) {
                      setVariety(`${c.nameBn} - বাছাইকৃত প্রথম মান`);
                    }
                  }
                }}
                className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl font-bold text-earth-900 focus:ring-2 focus:ring-agri-600 focus:outline-none"
              >
                <optgroup label={language === "bn" ? "জনপ্রিয় ফসল ও ফলসমূহ" : "Popular Produce"}>
                  {CROPS_DATA.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameEn} ({c.nameBn})
                    </option>
                  ))}
                </optgroup>
                <optgroup label={language === "bn" ? "কাস্টম ফসল" : "Custom Produce"}>
                  <option value="custom">
                    {language === "bn" ? "➕ অন্য ফসল বা ফল (নিজের মতো লিখুন)" : "➕ Add Custom Crop / Fruit"}
                  </option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-earth-700 font-bold mb-1">
                {language === "bn" ? "জাত / ভ্যারাইটি বিবরণ:" : "Variety / Cultivar:"}
              </label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl text-earth-900 focus:ring-2 focus:ring-agri-600 focus:outline-none font-medium"
                placeholder="যেমন: বিন্দু কাঁচা মরিচ, ডায়মন্ড আলু"
                required
              />
            </div>
          </div>

          {/* Custom Crop Name Box */}
          {(isCustomCrop || cropId === "custom") && (
            <div className="p-3 bg-amber-50/80 border border-amber-300 rounded-xl space-y-2 animate-in fade-in duration-200">
              <label className="block text-amber-950 font-bold text-xs">
                {language === "bn" ? "নতুন ফসলের বাংলা নাম লিখুন *" : "Custom Crop Name (Bangla) *"}
              </label>
              <input
                type="text"
                required
                value={customCropNameBn}
                onChange={(e) => setCustomCropNameBn(e.target.value)}
                placeholder="যেমন: লিচু, আম, ড্রাগন ফল, পেয়ারা, তরমুজ..."
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-earth-900 font-bold text-xs"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-earth-700 font-bold mb-1">
                {language === "bn" ? "পরিমাণ:" : "Quantity:"}
              </label>
              <input
                type="number"
                min={20}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl font-bold text-earth-900"
                required
              />
            </div>

            <div>
              <label className="block text-earth-700 font-bold mb-1">
                {language === "bn" ? "একক (Unit):" : "Unit:"}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl font-bold text-earth-900"
              >
                <option value="kg">কেজি (kg)</option>
                <option value="mon">মণ (Mon - 40 kg)</option>
                <option value="tonne">টন (Tonne)</option>
              </select>
            </div>

            <div>
              <label className="block text-earth-700 font-bold mb-1">
                {language === "bn" ? "গুণগত মান (Grade):" : "Grade / Quality:"}
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 bg-earth-50 border border-earth-300 rounded-xl font-bold text-earth-900"
              >
                <option value="Grade A (Export/Premium)">Grade A (রপ্তানি/সুপারশপ মান)</option>
                <option value="Grade B (Standard Wholesale)">Grade B (সাধারণ পাইকারি মান)</option>
                <option value="Grade C (Processing/Mill)">Grade C (মিল/প্রসেসিং উপযোগী)</option>
              </select>
            </div>
          </div>

          {/* SECTION 3: PRICING & BID RULES */}
          <div className="bg-agri-50/70 p-4 rounded-2xl border border-agri-200 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-agri-950 flex items-center gap-1.5 text-xs">
                <TrendingUp className="w-4 h-4 text-agri-700" />
                <span>{language === "bn" ? "২. নিলামের দর ও শর্তাবলী (Bidding Rules):" : "2. Auction Pricing & Bidding Rules:"}</span>
              </span>
              <span className="text-[11px] font-semibold text-agri-800 bg-white px-2 py-0.5 rounded-lg border border-agri-200">
                মোট মূল্য: ৳{(quantity * startingPrice).toLocaleString()} BDT
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-agri-950 font-bold mb-1 text-[11px]">
                  {language === "bn" ? "শুরুর দর (টাকা/একক):" : "Starting Price (BDT/unit):"}
                </label>
                <input
                  type="number"
                  min={1}
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-agri-300 rounded-xl font-black text-agri-900"
                  required
                />
              </div>

              <div>
                <label className="block text-agri-950 font-bold mb-1 text-[11px]">
                  {language === "bn" ? "ন্যূনতম ধাপ (টাকা):" : "Min Increment (BDT):"}
                </label>
                <input
                  type="number"
                  min={1}
                  value={minIncrement}
                  onChange={(e) => setMinIncrement(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-agri-300 rounded-xl font-black text-agri-900"
                  required
                />
              </div>

              <div>
                <label className="block text-agri-950 font-bold mb-1 text-[11px]">
                  {language === "bn" ? "গোপন রিজার্ভ দর (টাকা):" : "Private Reserve (BDT):"}
                </label>
                <input
                  type="number"
                  min={1}
                  value={reservePrice}
                  onChange={(e) => setReservePrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-agri-300 rounded-xl font-black text-agri-900"
                  title="Hidden from buyers. Protects against selling below cost."
                  required
                />
                <span className="text-[10px] text-earth-500 mt-0.5 block">
                  {language === "bn" ? "*ক্রেতাদের দেখানো হবে না" : "*Hidden from bidders"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-agri-950 font-bold mb-1 text-[11px]">
                  {language === "bn" ? "নিলামের সময়কাল:" : "Auction Duration:"}
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-agri-300 rounded-xl font-bold text-agri-900"
                >
                  <option value={15}>১৫ মিনিট (Flash Auction)</option>
                  <option value={30}>৩০ মিনিট (Standard Live Auction)</option>
                  <option value={60}>১ ঘণ্টা (Extended Arena)</option>
                  <option value={120}>২ ঘণ্টা</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="antiSnipe"
                  checked={antiSnipe}
                  onChange={(e) => setAntiSnipe(e.target.checked)}
                  className="w-4 h-4 rounded text-agri-600 focus:ring-agri-500"
                />
                <label htmlFor="antiSnipe" className="text-[11px] font-bold text-agri-900 cursor-pointer">
                  {language === "bn" ? "অ্যান্টি-স্নাইপিং সুরক্ষা (+২ মিনিট স্বয়ংক্রিয় বৃদ্ধি)" : "Anti-Snipe Protection (+2m auto-extend)"}
                </label>
              </div>
            </div>
          </div>

          {/* AI Net-Return Benchmark */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-[11px] text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">
                {language === "bn" ? "কৃষিসেতু এআই পরামর্শ:" : "KrishiSetu AI Market Insight:"}
              </span>
              <p className="mt-0.5 leading-relaxed text-amber-800">
                {language === "bn"
                  ? `বগুড়া ও ঢাকার পাইকারি মোকামে চলতি গড় দর ৳১৪৫-১৫০/কেজি। শুরুর দর ৳${startingPrice}/কেজি এবং ধাপ ৳${minIncrement} নির্ধারণ করায় একাধিক ক্রেতা দর বাড়ানোর সুযোগ পাবেন।`
                  : `Current benchmark price is BDT 145-150/kg. Your starting bid of BDT ${startingPrice}/kg provides great competitive traction.`}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl border border-earth-300 text-earth-700 font-bold hover:bg-earth-100 transition"
            >
              {t.common.cancel}
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-agri-700 hover:from-red-700 hover:to-agri-800 text-white font-black shadow-lg shadow-agri-950/20 transition flex items-center gap-2"
            >
              <Gavel className="w-4 h-4 text-harvest-300" />
              <span>
                {submitting
                  ? t.common.loading
                  : (language === "bn" ? "🔴 সরাসরি লাইভ নিলাম শুরু করুন" : "🔴 Launch Live Auction Now")}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
