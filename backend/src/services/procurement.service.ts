import { dataStore, CROPS_CATALOG } from "../models/db";
import { Order, ProcurementRequest, SupplierOffer, User } from "../@types";

export class ProcurementService {
  public getAllRequests(cropId?: string, district?: string, currentUser?: User) {
    let requests = Array.from(dataStore.procurementRequests.values());

    if (cropId) requests = requests.filter((r) => r.cropId === cropId);
    if (district) requests = requests.filter((r) => r.deliveryDistrict.toLowerCase() === district.toLowerCase());

    requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Mask private budget if not owner or admin
    return requests.map((r) => {
      const isOwner = currentUser?.id === r.buyerId;
      const isAdmin = currentUser?.role === "admin";
      return {
        ...r,
        maxBudgetPerUnit: r.isBudgetPrivate && !isOwner && !isAdmin ? 0 : r.maxBudgetPerUnit,
      };
    });
  }

  public getRequestById(id: string, currentUser?: User) {
    const request = dataStore.procurementRequests.get(id);
    if (!request) throw new Error("Procurement request not found");

    const offers = dataStore.supplierOffers.get(request.id) || [];
    const isOwner = currentUser?.id === request.buyerId;
    const isAdmin = currentUser?.role === "admin";

    return {
      request: {
        ...request,
        maxBudgetPerUnit: request.isBudgetPrivate && !isOwner && !isAdmin ? 0 : request.maxBudgetPerUnit,
      },
      offers,
      isOwner,
    };
  }

  public createRequest(currentUser: User, body: any) {
    const crop = CROPS_CATALOG.find((c) => c.id === body.cropId) || CROPS_CATALOG[0];
    const reqId = `rfp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newRequest: ProcurementRequest = {
      id: reqId,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      buyerRole: currentUser.role,
      companyName: currentUser.companyName || body.companyName || currentUser.name,
      cropId: crop.id,
      cropNameEn: crop.nameEn,
      cropNameBn: crop.nameBn,
      requiredQuantity: Number(body.requiredQuantity) || 5000,
      unit: body.unit || "kg",
      qualityGrade: body.qualityGrade || "Grade A",
      maxBudgetPerUnit: Number(body.maxBudgetPerUnit) || 0,
      isBudgetPrivate: !!body.isBudgetPrivate,
      deliveryLocation: body.deliveryLocation || `${currentUser.district} Central Hub`,
      deliveryDistrict: body.deliveryDistrict || currentUser.district || "Dhaka",
      requiredDeliveryDate: body.requiredDeliveryDate || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      allowSplitFulfillment: body.allowSplitFulfillment !== undefined ? !!body.allowSplitFulfillment : true,
      fulfilledQuantity: 0,
      status: "open",
      notes: body.notes || "",
      isDemo: false,
      createdAt: new Date().toISOString(),
    };

    dataStore.procurementRequests.set(reqId, newRequest);

    dataStore.logAudit(
      currentUser.id,
      currentUser.name,
      "PROCUREMENT_REQUEST_CREATED",
      "ProcurementRequest",
      reqId,
      `Buyer created bulk demand for ${newRequest.requiredQuantity} ${newRequest.unit} ${crop.nameEn}`
    );

    return newRequest;
  }

  public submitSupplierOffer(currentUser: User, requestId: string, body: any) {
    const request = dataStore.procurementRequests.get(requestId);
    if (!request) throw new Error("Procurement request not found");

    if (request.status === "closed" || request.status === "fulfilled") {
      throw new Error("This procurement request is already fulfilled or closed.");
    }

    if (!request.allowSplitFulfillment && Number(body.offeredQuantity) < request.requiredQuantity) {
      throw new Error(`This buyer requires single-lot delivery of ${request.requiredQuantity} ${request.unit}.`);
    }

    const offer: SupplierOffer = {
      id: `ofr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      requestId: request.id,
      farmerId: currentUser.id,
      farmerName: currentUser.name,
      farmerPhone: currentUser.phone,
      farmerDistrict: currentUser.district,
      offeredQuantity: Number(body.offeredQuantity),
      unit: request.unit,
      pricePerUnit: Number(body.pricePerUnit),
      qualityGrade: body.qualityGrade || "Grade A",
      estimatedDeliveryDate: body.estimatedDeliveryDate || new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
      notes: body.notes,
      status: "pending",
      isDemo: true,
      createdAt: new Date().toISOString(),
    };

    const offers = dataStore.supplierOffers.get(request.id) || [];
    offers.unshift(offer);
    dataStore.supplierOffers.set(request.id, offers);

    dataStore.logAudit(
      currentUser.id,
      currentUser.name,
      "OFFER_SUBMITTED",
      "ProcurementRequest",
      request.id,
      `Farmer submitted offer of ${offer.offeredQuantity} ${request.unit} @ BDT ${offer.pricePerUnit}/kg for ${request.cropNameEn}`
    );

    dataStore.broadcast({
      type: "OFFER_SUBMITTED",
      data: { requestId: request.id, offer },
      timestamp: new Date().toISOString(),
    });

    return {
      message: `Your supply offer of ${offer.offeredQuantity} ${request.unit} @ BDT ${offer.pricePerUnit}/kg submitted.`,
      offer,
    };
  }

  public acceptSupplierOffer(currentUser: User, requestId: string, offerId: string) {
    const request = dataStore.procurementRequests.get(requestId);
    if (!request) throw new Error("Procurement request not found");

    if (request.buyerId !== currentUser.id && currentUser.role !== "admin") {
      throw new Error("Only the posting buyer can accept offers for this procurement.");
    }

    const offers = dataStore.supplierOffers.get(requestId) || [];
    const offer = offers.find((o) => o.id === offerId);
    if (!offer) throw new Error("Offer not found");

    offer.status = "accepted";
    request.fulfilledQuantity += offer.offeredQuantity;

    if (request.fulfilledQuantity >= request.requiredQuantity) {
      request.status = "fulfilled";
    } else {
      request.status = "partially_fulfilled";
    }

    const buyer = dataStore.users.get(request.buyerId);
    const farmer = dataStore.users.get(offer.farmerId);

    const order: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      referenceType: "procurement",
      referenceId: request.id,
      sellerId: offer.farmerId,
      sellerName: farmer?.name || offer.farmerName,
      sellerPhone: farmer?.phone || offer.farmerPhone,
      buyerId: request.buyerId,
      buyerName: buyer?.name || request.buyerName,
      buyerPhone: buyer?.phone,
      cropNameEn: request.cropNameEn,
      cropNameBn: request.cropNameBn,
      quantity: offer.offeredQuantity,
      unit: offer.unit,
      pricePerUnit: offer.pricePerUnit,
      totalAmount: offer.offeredQuantity * offer.pricePerUnit,
      deliveryDistrict: request.deliveryDistrict,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    dataStore.orders.set(order.id, order);

    dataStore.logAudit(
      currentUser.id,
      currentUser.name,
      "OFFER_ACCEPTED",
      "Order",
      order.id,
      `Buyer accepted supplier offer of ${offer.offeredQuantity} ${offer.unit} at BDT ${offer.pricePerUnit}/kg. Generated order #${order.id}.`
    );

    dataStore.broadcast({
      type: "OFFER_ACCEPTED",
      data: { requestId: request.id, offerId: offer.id, orderId: order.id },
      timestamp: new Date().toISOString(),
    });

    return {
      message: `Supplier offer accepted! Order #${order.id} generated for BDT ${order.totalAmount.toLocaleString()}.`,
      order,
    };
  }
}

export const procurementService = new ProcurementService();

