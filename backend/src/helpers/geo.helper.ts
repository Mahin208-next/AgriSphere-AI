import { District, Market } from "../@types";

export const BANGLADESH_DISTRICTS: District[] = [
  // Dhaka Division
  { id: "dhaka", nameEn: "Dhaka", nameBn: "ঢাকা", division: "Dhaka", lat: 23.8103, lng: 90.4125 },
  { id: "gazipur", nameEn: "Gazipur", nameBn: "গাজীপুর", division: "Dhaka", lat: 23.9989, lng: 90.4203 },
  { id: "narayanganj", nameEn: "Narayanganj", nameBn: "নারায়ণগঞ্জ", division: "Dhaka", lat: 23.6238, lng: 90.5000 },
  { id: "narsingdi", nameEn: "Narsingdi", nameBn: "নরসিংদী", division: "Dhaka", lat: 23.9193, lng: 90.7176 },
  { id: "tangail", nameEn: "Tangail", nameBn: "টাঙ্গাইল", division: "Dhaka", lat: 24.2513, lng: 89.9167 },
  { id: "kishoreganj", nameEn: "Kishoreganj", nameBn: "কিশোরগঞ্জ", division: "Dhaka", lat: 24.4449, lng: 90.7766 },
  { id: "manikganj", nameEn: "Manikganj", nameBn: "মানিকগঞ্জ", division: "Dhaka", lat: 23.8617, lng: 90.0003 },
  { id: "munshiganj", nameEn: "Munshiganj", nameBn: "মুন্সীগঞ্জ", division: "Dhaka", lat: 23.5422, lng: 90.5305 },
  { id: "faridpur", nameEn: "Faridpur", nameBn: "ফরিদপুর", division: "Dhaka", lat: 23.6071, lng: 89.8429 },
  { id: "gopalganj", nameEn: "Gopalganj", nameBn: "গোপালগঞ্জ", division: "Dhaka", lat: 23.0051, lng: 89.8266 },
  { id: "madaripur", nameEn: "Madaripur", nameBn: "মাদারীপুর", division: "Dhaka", lat: 23.1641, lng: 90.1897 },
  { id: "rajbari", nameEn: "Rajbari", nameBn: "রাজবাড়ী", division: "Dhaka", lat: 23.7574, lng: 89.6445 },
  { id: "shariatpur", nameEn: "Shariatpur", nameBn: "শরীয়তপুর", division: "Dhaka", lat: 23.2423, lng: 90.4348 },

  // Rajshahi Division
  { id: "bogura", nameEn: "Bogura", nameBn: "বগুড়া", division: "Rajshahi", lat: 24.8465, lng: 89.3777 },
  { id: "rajshahi", nameEn: "Rajshahi", nameBn: "রাজশাহী", division: "Rajshahi", lat: 24.3745, lng: 88.6042 },
  { id: "naogaon", nameEn: "Naogaon", nameBn: "নওগাঁ", division: "Rajshahi", lat: 24.8109, lng: 88.9416 },
  { id: "natore", nameEn: "Natore", nameBn: "নাটোর", division: "Rajshahi", lat: 24.4206, lng: 88.9324 },
  { id: "chapainawabganj", nameEn: "Chapainawabganj", nameBn: "চাঁপাইনবাবগঞ্জ", division: "Rajshahi", lat: 24.5965, lng: 88.2775 },
  { id: "pabna", nameEn: "Pabna", nameBn: "পাবনা", division: "Rajshahi", lat: 24.0064, lng: 89.2372 },
  { id: "sirajganj", nameEn: "Sirajganj", nameBn: "সিরাজগঞ্জ", division: "Rajshahi", lat: 24.4534, lng: 89.7008 },
  { id: "joypurhat", nameEn: "Joypurhat", nameBn: "জয়পুরহাট", division: "Rajshahi", lat: 25.1015, lng: 89.0277 },

  // Rangpur Division
  { id: "rangpur", nameEn: "Rangpur", nameBn: "রংপুর", division: "Rangpur", lat: 25.7439, lng: 89.2752 },
  { id: "dinajpur", nameEn: "Dinajpur", nameBn: "দিনাজপুর", division: "Rangpur", lat: 25.6217, lng: 88.6355 },
  { id: "kurigram", nameEn: "Kurigram", nameBn: "কুড়িগ্রাম", division: "Rangpur", lat: 25.8054, lng: 89.6362 },
  { id: "gaibandha", nameEn: "Gaibandha", nameBn: "গাইবান্ধা", division: "Rangpur", lat: 25.3288, lng: 89.5407 },
  { id: "nilphamari", nameEn: "Nilphamari", nameBn: "নীলফামারী", division: "Rangpur", lat: 25.9318, lng: 88.8560 },
  { id: "panchagarh", nameEn: "Panchagarh", nameBn: "পঞ্চগড়", division: "Rangpur", lat: 26.3411, lng: 88.5542 },
  { id: "thakurgaon", nameEn: "Thakurgaon", nameBn: "ঠাকুরগাঁও", division: "Rangpur", lat: 26.0337, lng: 88.4617 },
  { id: "lalmonirhat", nameEn: "Lalmonirhat", nameBn: "লালমনিরহাট", division: "Rangpur", lat: 25.9923, lng: 89.2847 },

  // Chattogram Division
  { id: "chattogram", nameEn: "Chattogram", nameBn: "চট্টগ্রাম", division: "Chattogram", lat: 22.3569, lng: 91.7832 },
  { id: "coxs_bazar", nameEn: "Cox's Bazar", nameBn: "কক্সবাজার", division: "Chattogram", lat: 21.4272, lng: 92.0058 },
  { id: "cumilla", nameEn: "Cumilla", nameBn: "কুমিল্লা", division: "Chattogram", lat: 23.4682, lng: 91.1788 },
  { id: "feni", nameEn: "Feni", nameBn: "ফেনী", division: "Chattogram", lat: 23.0186, lng: 91.3966 },
  { id: "brahmanbaria", nameEn: "Brahmanbaria", nameBn: "ব্রাহ্মণবাড়িয়া", division: "Chattogram", lat: 23.9571, lng: 91.1119 },
  { id: "noakhali", nameEn: "Noakhali", nameBn: "নোয়াখালী", division: "Chattogram", lat: 22.8696, lng: 91.0998 },
  { id: "chandpur", nameEn: "Chandpur", nameBn: "চাঁদপুর", division: "Chattogram", lat: 23.2333, lng: 90.6667 },
  { id: "lakshmipur", nameEn: "Lakshmipur", nameBn: "লক্ষ্মীপুর", division: "Chattogram", lat: 22.9425, lng: 90.8412 },

  // Khulna Division
  { id: "khulna", nameEn: "Khulna", nameBn: "খুলনা", division: "Khulna", lat: 22.8456, lng: 89.5403 },
  { id: "jashore", nameEn: "Jashore", nameBn: "যশোর", division: "Khulna", lat: 23.1664, lng: 89.2115 },
  { id: "satkhira", nameEn: "Satkhira", nameBn: "সাতক্ষীরা", division: "Khulna", lat: 22.7185, lng: 89.0705 },
  { id: "kushtia", nameEn: "Kushtia", nameBn: "কুষ্টিয়া", division: "Khulna", lat: 23.9013, lng: 89.1205 },
  { id: "jhenaidah", nameEn: "Jhenaidah", nameBn: "ঝিনাইদহ", division: "Khulna", lat: 23.5448, lng: 89.1539 },
  { id: "chuadanga", nameEn: "Chuadanga", nameBn: "চুয়াডাঙ্গা", division: "Khulna", lat: 23.6402, lng: 88.8418 },
  { id: "bagerhat", nameEn: "Bagerhat", nameBn: "বাগেরহাট", division: "Khulna", lat: 22.6516, lng: 89.7859 },
  { id: "meherpur", nameEn: "Meherpur", nameBn: "মেহেরপুর", division: "Khulna", lat: 23.7749, lng: 88.6318 },
  { id: "magura", nameEn: "Magura", nameBn: "মাগুরা", division: "Khulna", lat: 23.4873, lng: 89.4198 },
  { id: "narail", nameEn: "Narail", nameBn: "নড়াইল", division: "Khulna", lat: 23.1725, lng: 89.5127 },

  // Mymensingh Division
  { id: "mymensingh", nameEn: "Mymensingh", nameBn: "ময়মনসিংহ", division: "Mymensingh", lat: 24.7471, lng: 90.4203 },
  { id: "jamalpur", nameEn: "Jamalpur", nameBn: "জামালপুর", division: "Mymensingh", lat: 24.9375, lng: 89.9378 },
  { id: "netrokona", nameEn: "Netrokona", nameBn: "নেত্রকোণা", division: "Mymensingh", lat: 24.8709, lng: 90.7279 },
  { id: "sherpur", nameEn: "Sherpur", nameBn: "শেরপুর", division: "Mymensingh", lat: 25.0205, lng: 90.0153 },

  // Sylhet Division
  { id: "sylhet", nameEn: "Sylhet", nameBn: "সিলেট", division: "Sylhet", lat: 24.8949, lng: 91.8687 },
  { id: "moulvibazar", nameEn: "Moulvibazar", nameBn: "মৌলভীবাজার", division: "Sylhet", lat: 24.4829, lng: 91.7774 },
  { id: "habiganj", nameEn: "Habiganj", nameBn: "হবিগঞ্জ", division: "Sylhet", lat: 24.3749, lng: 91.4155 },
  { id: "sunamganj", nameEn: "Sunamganj", nameBn: "সুনামগঞ্জ", division: "Sylhet", lat: 25.0658, lng: 91.3950 },

  // Barishal Division
  { id: "barishal", nameEn: "Barishal", nameBn: "বরিশাল", division: "Barishal", lat: 22.7010, lng: 90.3535 },
  { id: "patuakhali", nameEn: "Patuakhali", nameBn: "পটুয়াখালী", division: "Barishal", lat: 22.3596, lng: 90.3298 },
  { id: "bhola", nameEn: "Bhola", nameBn: "ভোলা", division: "Barishal", lat: 22.6859, lng: 90.6481 },
  { id: "pirojpur", nameEn: "Pirojpur", nameBn: "পিরোজপুর", division: "Barishal", lat: 22.5841, lng: 89.9720 },
  { id: "barguna", nameEn: "Barguna", nameBn: "বরগুনা", division: "Barishal", lat: 22.0953, lng: 90.1121 },
  { id: "jhalokathi", nameEn: "Jhalokathi", nameBn: "ঝালকাঠি", division: "Barishal", lat: 22.6406, lng: 90.1987 },
];

export const BANGLADESH_MARKETS: Market[] = [
  {
    id: "mkt_karwan_bazar",
    nameEn: "Karwan Bazar Wholesale Arat",
    nameBn: "কারওয়ান বাজার পাইকারি আড়ত",
    district: "Dhaka",
    division: "Dhaka",
    marketType: "terminal",
    lat: 23.7509,
    lng: 90.3934,
  },
  {
    id: "mkt_shyambazar",
    nameEn: "Shyambazar Riverfront Wholesale Mokam",
    nameBn: "শ্যামবাজার নৌ-ঘাট পাইকারি মোকাম",
    district: "Dhaka",
    division: "Dhaka",
    marketType: "wholesale",
    lat: 23.7046,
    lng: 90.4136,
  },
  {
    id: "mkt_jatrabari",
    nameEn: "Jatrabari Krishi Wholesale Market",
    nameBn: "যাত্রাবাড়ী কৃষি পাইকারি বাজার",
    district: "Dhaka",
    division: "Dhaka",
    marketType: "wholesale",
    lat: 23.7099,
    lng: 90.4358,
  },
  {
    id: "mkt_mahasthangarh",
    nameEn: "Mahasthangarh Agri Hub",
    nameBn: "মহাস্থানগড় সবজি ও মরিচ মোকাম",
    district: "Bogura",
    division: "Rajshahi",
    marketType: "assembly",
    lat: 24.9622,
    lng: 89.3456,
  },
  {
    id: "mkt_dhunat",
    nameEn: "Dhunat Krishi Hat",
    nameBn: "ধুনট কৃষি হাট",
    district: "Bogura",
    division: "Rajshahi",
    marketType: "assembly",
    lat: 24.6781,
    lng: 89.5392,
  },
  {
    id: "mkt_board_bazar",
    nameEn: "Gazipur Board Bazar & Agro Mill Zone",
    nameBn: "গাজীপুর বোর্ড বাজার ও এগ্রো প্রসেসিং হাব",
    district: "Gazipur",
    division: "Dhaka",
    marketType: "wholesale",
    lat: 23.9482,
    lng: 90.3842,
  },
  {
    id: "mkt_baneswar",
    nameEn: "Baneswar Hat Agricultural Terminal",
    nameBn: "বানেশ্বর হাট কৃষি টার্মিনাল",
    district: "Rajshahi",
    division: "Rajshahi",
    marketType: "wholesale",
    lat: 24.3892,
    lng: 88.7758,
  },
  {
    id: "mkt_rangpur_city",
    nameEn: "Rangpur City Central Wholesale Market",
    nameBn: "রংপুর সিটি সেন্ট্রাল পাইকারি বাজার",
    district: "Rangpur",
    division: "Rangpur",
    marketType: "wholesale",
    lat: 25.7516,
    lng: 89.2483,
  },
  {
    id: "mkt_reazuddin",
    nameEn: "Reazuddin Bazar Wholesale",
    nameBn: "রিয়াজউদ্দিন বাজার পাইকারি মোকাম",
    district: "Chattogram",
    division: "Chattogram",
    marketType: "terminal",
    lat: 22.3385,
    lng: 91.8315,
  },
  {
    id: "mkt_barobazar",
    nameEn: "Barobazar Agricultural Mokam",
    nameBn: "বারোবাজার কৃষি পাইকারি মোকাম",
    district: "Jashore",
    division: "Khulna",
    marketType: "assembly",
    lat: 23.2842,
    lng: 89.1528,
  },
  {
    id: "mkt_bahadur_bazar",
    nameEn: "Bahadur Bazar Wholesale",
    nameBn: "বাহাদুর বাজার পাইকারি আড়ত",
    district: "Dinajpur",
    division: "Rangpur",
    marketType: "wholesale",
    lat: 25.6264,
    lng: 88.6432,
  },
  {
    id: "mkt_nimtoli",
    nameEn: "Nimtoli Central Wholesale Market",
    nameBn: "নিমতলী পাইকারি বাজার",
    district: "Cumilla",
    division: "Chattogram",
    marketType: "wholesale",
    lat: 23.4619,
    lng: 91.1821,
  },
];

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

