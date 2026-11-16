import { dataStore } from "../models/db";
import { ExportQuotation, ExportRFQ, User } from "../@types";

export class ExportService {
  public getAllRfqs() {
    const rfqs = Array.from(dataStore.exportRfqs.values());
    rfqs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return rfqs.map((rfq) => {
      const quotes = dataStore.exportQuotations.get(rfq.id) || [];
      return {
        ...rfq,
        quotationCount: quotes.length,
      };
    });
  }

  public createRfq(currentUser: User, body: any): ExportRFQ {
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

    dataStore.exportRfqs.set(rfqId, newRfq);

    dataStore.logAudit(
      currentUser.id,
      currentUser.name,
      "EXPORT_RFQ_POSTED",
      "ExportRFQ",
      rfqId,
      `International importer posted RFQ for ${newRfq.targetQuantityTonnes}t ${newRfq.cropNameEn} to ${newRfq.destinationPort}`
    );

    return newRfq;
  }

  public getQuotationsByRfq(rfqId: string): ExportQuotation[] {
    return dataStore.exportQuotations.get(rfqId) || [];
  }

  public submitQuotation(currentUser: User, rfqId: string, body: any): ExportQuotation {
    const rfq = dataStore.exportRfqs.get(rfqId);
    if (!rfq) throw new Error("RFQ not found");

    const quotId = `quot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const quotation: ExportQuotation = {
      id: quotId,
      rfqId: rfq.id,
      exporterId: currentUser.id,
      exporterName: currentUser.name,
      companyName: currentUser.companyName || body.companyName || currentUser.name,
      fobPriceUsd: Number(body.fobPriceUsd) || 1.75,
      leadTimeDays: Number(body.leadTimeDays) || 5,
      packagingOffered: body.packagingOffered || "4.5 kg Corrugated ventilated export cartons",
      certificationsProvided: body.certificationsProvided || [
        "Phytosanitary Certificate (DAE)",
        "Packhouse GAP Certificate",
      ],
      status: "submitted",
      notes: body.notes || "",
      createdAt: new Date().toISOString(),
    };

    const existing = dataStore.exportQuotations.get(rfq.id) || [];
    existing.unshift(quotation);
    dataStore.exportQuotations.set(rfq.id, existing);

    dataStore.logAudit(
      currentUser.id,
      currentUser.name,
      "EXPORT_QUOTATION_SUBMITTED",
      "ExportQuotation",
      quotId,
      `Exporter submitted quote of $${quotation.fobPriceUsd}/kg FOB for ${rfq.cropNameEn}`
    );

    return quotation;
  }
}

export const exportService = new ExportService();

