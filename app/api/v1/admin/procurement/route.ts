import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET /api/v1/admin/procurement - List all buyer requests and offers
export async function GET() {
  const db = getDb();
  const requests = Array.from(db.procurementRequests.values()).map((req) => {
    const offers = db.supplierOffers.get(req.id) || [];
    return {
      ...req,
      offersCount: offers.length,
      offers,
    };
  });
  return NextResponse.json({ requests });
}

// PUT /api/v1/admin/procurement - Update buyer request
export async function PUT(req: Request) {
  try {
    const db = getDb();
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Procurement ID is required" }, { status: 400 });
    }

    const procurement = db.procurementRequests.get(body.id);
    if (!procurement) {
      return NextResponse.json({ error: "Procurement request not found" }, { status: 404 });
    }

    if (body.status) procurement.status = body.status;
    if (body.requiredQuantity !== undefined) procurement.requiredQuantity = Number(body.requiredQuantity);
    if (body.maxBudgetPerUnit !== undefined) procurement.maxBudgetPerUnit = Number(body.maxBudgetPerUnit);

    db.procurementRequests.set(body.id, { ...procurement });

    db.logAudit(
      "usr_admin_01",
      "System Admin",
      "PROCUREMENT_ADMIN_UPDATED",
      "ProcurementRequest",
      body.id,
      `Admin updated procurement demand ${procurement.cropNameEn} for ${procurement.companyName} (Status: ${procurement.status})`
    );

    return NextResponse.json({ success: true, procurement });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update procurement request" }, { status: 500 });
  }
}

// DELETE /api/v1/admin/procurement
export async function DELETE(req: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Procurement ID is required" }, { status: 400 });
    }

    const procurement = db.procurementRequests.get(id);
    if (!procurement) {
      return NextResponse.json({ error: "Procurement request not found" }, { status: 404 });
    }

    db.procurementRequests.delete(id);
    db.supplierOffers.delete(id);

    db.logAudit(
      "usr_admin_01",
      "System Admin",
      "PROCUREMENT_ADMIN_DELETED",
      "ProcurementRequest",
      id,
      `Admin deleted procurement demand ${id} of ${procurement.companyName}`
    );

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete procurement request" }, { status: 500 });
  }
}
