import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { User, UserRole } from "@/types";

// GET /api/v1/admin/users - List all users
export async function GET() {
  const db = getDb();
  const users = Array.from(db.users.values());
  return NextResponse.json({ users });
}

// POST /api/v1/admin/users - Create new user
export async function POST(req: Request) {
  try {
    const db = getDb();
    const body = await req.json();

    if (!body.name || !body.role || !body.phone) {
      return NextResponse.json({ error: "Name, phone, and role are required." }, { status: 400 });
    }

    const newId = `usr_${body.role}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const newUser: User = {
      id: newId,
      name: body.name.trim(),
      nameBn: body.nameBn?.trim() || body.name.trim(),
      role: body.role as UserRole,
      phone: body.phone.trim(),
      email: body.email?.trim() || `${newId}@krishisetu.ai`,
      district: body.district?.trim() || "Dhaka",
      upazila: body.upazila?.trim() || "Sadar",
      verified: Boolean(body.verified),
      companyName: body.companyName?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    db.users.set(newId, newUser);
    db.logAudit(
      "usr_admin_01",
      "System Admin",
      "USER_CREATED",
      "User",
      newId,
      `Admin created new user profile for ${newUser.name} with role ${newUser.role}`
    );

    return NextResponse.json({ success: true, user: newUser });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create user" }, { status: 500 });
  }
}

// PUT /api/v1/admin/users - Edit / Fix User details ("fixed all the user")
export async function PUT(req: Request) {
  try {
    const db = getDb();
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    const existing = db.users.get(body.id);
    if (!existing) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const updatedUser: User = {
      ...existing,
      name: body.name !== undefined ? body.name.trim() : existing.name,
      nameBn: body.nameBn !== undefined ? body.nameBn.trim() : existing.nameBn,
      role: body.role !== undefined ? (body.role as UserRole) : existing.role,
      phone: body.phone !== undefined ? body.phone.trim() : existing.phone,
      email: body.email !== undefined ? body.email.trim() : existing.email,
      district: body.district !== undefined ? body.district.trim() : existing.district,
      upazila: body.upazila !== undefined ? body.upazila.trim() : existing.upazila,
      verified: body.verified !== undefined ? Boolean(body.verified) : existing.verified,
      companyName: body.companyName !== undefined ? body.companyName.trim() : existing.companyName,
    };

    db.users.set(body.id, updatedUser);

    db.logAudit(
      "usr_admin_01",
      "System Admin",
      "USER_UPDATED",
      "User",
      body.id,
      `Admin updated/fixed user account ${updatedUser.name} (${updatedUser.phone}, ${updatedUser.role}, Verified: ${updatedUser.verified})`
    );

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update user" }, { status: 500 });
  }
}

// DELETE /api/v1/admin/users - Delete or Deactivate user
export async function DELETE(req: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    const existing = db.users.get(id);
    if (!existing) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (existing.role === "admin" && id === "usr_admin_01") {
      return NextResponse.json({ error: "Cannot delete the primary root Administrator account." }, { status: 403 });
    }

    db.users.delete(id);

    db.logAudit(
      "usr_admin_01",
      "System Admin",
      "USER_DELETED",
      "User",
      id,
      `Admin deleted/removed user account: ${existing.name} (${existing.role})`
    );

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete user" }, { status: 500 });
  }
}
