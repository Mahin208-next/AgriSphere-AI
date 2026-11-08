import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = getDb();
  const currentUser = db.users.get(db.currentUserId) || Array.from(db.users.values())[0];
  const farmerProfile = db.farmerProfiles.get(currentUser.id);
  const businessProfile = db.businessProfiles.get(currentUser.id);
  const allUsers = Array.from(db.users.values());

  return NextResponse.json({
    user: currentUser,
    farmerProfile,
    businessProfile,
    allUsers, // Convenient for role-switching demo
  });
}

export async function POST(req: Request) {
  const db = getDb();
  try {
    const body = await req.json();
    if (body.switchUserId && db.users.has(body.switchUserId)) {
      db.currentUserId = body.switchUserId;
      const user = db.users.get(body.switchUserId)!;
      db.logAudit(user.id, user.name, "USER_SWITCH", "User", user.id, `Switched active role session to ${user.role} (${user.name})`);
      return NextResponse.json({ success: true, user });
    }

    if (body.action === "register") {
      const newUser = {
        id: `usr_${Date.now()}`,
        name: body.name,
        nameBn: body.nameBn || body.name,
        email: body.email,
        phone: body.phone,
        role: body.role || "farmer",
        district: body.district || "Bogura",
        upazila: body.upazila || "Sadar",
        verified: true,
        companyName: body.companyName,
        createdAt: new Date().toISOString(),
      };
      db.users.set(newUser.id, newUser);
      db.currentUserId = newUser.id;
      db.logAudit(newUser.id, newUser.name, "USER_REGISTER", "User", newUser.id, `New user registered with role ${newUser.role}`);
      return NextResponse.json({ success: true, user: newUser });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process auth request" }, { status: 500 });
  }
}
