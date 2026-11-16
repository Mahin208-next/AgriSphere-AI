import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ExportQuotation } from "@/types";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const db = getDb();
  const quotations = db.exportQuotations.get(params.id) || [];
  return NextResponse.json({ quotations });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const db = getDb();
  try {
    const body = await req.json();
    const currentUser = db.users.get(db.currentUserId);
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rfq = db.exportRfqs.get(params.id);
    if (!rfq) return NextResponse.json({ error: "RFQ not found" }, { status: 404 });

    const quotId = `quot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const quotation: ExportQuotation = {
      id: quotId,
      rfqId: rfq.id,
      exporterId: currentUser.id,
      exporterName: currentUser.name,
      companyName: currentUser.companyName || body.companyName || currentUser.name,
      fobPriceUsd: Number(body.fobPriceUsd) || 1.75,
      leadTimeDays: Number(body.leadTimeDays) || 5,
      packagingOffered: body.packagingOffered || "4.5 kg Corrugated ventilated export cartons with temperature data logger",
      certificationsProvided: body.certificationsProvided || [
        "Phytosanitary Certificate (DAE)",
        "Packhouse GAP Certificate"
      ],
      status: "submitted",
      notes: body.notes || "",
      createdAt: new Date().toISOString(),
    };

    const existing = db.exportQuotations.get(rfq.id) || [];
    existing.unshift(quotation);
    db.exportQuotations.set(rfq.id, existing);

    db.logAudit(
      currentUser.id,
      currentUser.name,
      "EXPORT_QUOTATION_SUBMITTED",
      "ExportQuotation",
      quotId,
      `Exporter submitted quote of $${quotation.fobPriceUsd}/kg FOB for ${rfq.cropNameEn} to ${rfq.importerName}`
    );

    return NextResponse.json({ success: true, quotation });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to submit quotation" }, { status: 500 });
  }
}

