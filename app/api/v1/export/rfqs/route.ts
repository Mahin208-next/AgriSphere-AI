import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ExportRFQ } from "@/types";

export async function GET() {
  const db = getDb();
  const rfqs = Array.from(db.exportRfqs.values());
  rfqs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Also include count of quotations for each
  const enriched = rfqs.map((rfq) => {
    const quotations = db.exportQuotations.get(rfq.id) || [];
    return {
      ...rfq,
      quotationCount: quotations.length,
    };
  });

  return NextResponse.json({
    rfqs: enriched,
    complianceDisclaimer: "International trade contracts are subject to destination import regulations, official plant quarantine certification (Phytosanitary Inspection), customs clearings, and letter of credit (LC) terms.",
  });
}

export async function POST(req: Request) {
  const db = getDb();
  try {
    const body = await req.json();
    const currentUser = db.users.get(db.currentUserId);
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rfqId = `rfq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newRfq: ExportRFQ = {
      id: rfqId,
      importerId: currentUser.id,
      importerName: currentUser.name,
      companyName: currentUser.companyName || body.companyName || "International Buyer LLC",
      country: body.country || "United Arab Emirates",
      cropNameEn: body.cropNameEn || "Green Chilli",
      cropNameBn: body.cropNameBn || "কাঁচা মরিচ",
      targetQuantityTonnes: Number(body.targetQuantityTonnes) || 10,
      requiredGrade: body.requiredGrade || "GlobalGAP Export Grade A",
      packagingType: body.packagingType || "Ventilated 5kg Cartons",
      destinationPort: body.destinationPort || "Dubai International Airport (Air Cargo)",
      targetDeliveryMonth: body.targetDeliveryMonth || "December 2026",
      certificationsRequired: body.certificationsRequired || ["Phytosanitary Certificate", "GlobalGAP"],
      maxTargetFobPriceUsd: Number(body.maxTargetFobPriceUsd) || 1.80,
      status: "open",
      notes: body.notes || "",
      isDemo: false,
      createdAt: new Date().toISOString(),
    };

    db.exportRfqs.set(rfqId, newRfq);

    db.logAudit(
      currentUser.id,
      currentUser.name,
      "EXPORT_RFQ_POSTED",
      "ExportRFQ",
      rfqId,
      `International importer posted RFQ for ${newRfq.targetQuantityTonnes} Tonnes of ${newRfq.cropNameEn} to ${newRfq.destinationPort}`
    );

    return NextResponse.json({ success: true, rfq: newRfq });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create RFQ" }, { status: 500 });
  }
}
