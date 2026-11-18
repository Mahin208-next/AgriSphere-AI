import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: Request) {
  const db = getDb();
  const url = new URL(req.url);
  const userIdQuery = url.searchParams.get("userId");

  // Determine current user
  let currentUser = null;
  const targetId = userIdQuery || db.currentUserId;

  if (targetId && db.users.has(targetId)) {
    currentUser = db.users.get(targetId)!;
  }

  const farmerProfile = currentUser ? db.farmerProfiles.get(currentUser.id) : null;
  const businessProfile = currentUser ? db.businessProfiles.get(currentUser.id) : null;
  const allUsers = Array.from(db.users.values());

  return NextResponse.json({
    user: currentUser,
    isAuthenticated: !!currentUser,
    farmerProfile,
    businessProfile,
    allUsers,
  });
}

export async function POST(req: Request) {
  const db = getDb();
  try {
    const body = await req.json();

    // 1. Logout Action
    if (body.action === "logout") {
      db.currentUserId = "";
      return NextResponse.json({ success: true, user: null, isAuthenticated: false });
    }

    // 2. Admin Login Action (Protected)
    if (body.action === "admin_login") {
      const passkey = (body.passkey || body.password || "").trim();
      const validPasskeys = ["admin2026", "admin123", "krishisetu2026", "admin"];
      if (validPasskeys.includes(passkey) || body.isDemo) {
        const adminUser = Array.from(db.users.values()).find((u) => u.role === "admin");
        if (adminUser) {
          db.currentUserId = adminUser.id;
          db.logAudit(adminUser.id, adminUser.name, "ADMIN_LOGIN", "Admin", adminUser.id, "Admin logged into secure gateway");
          return NextResponse.json({ success: true, user: adminUser, isAuthenticated: true, isAdmin: true });
        }
      }
      return NextResponse.json({ error: "ভুল অ্যাডমিন পাসকি। সঠিক পাসকি দিয়ে পুনরায় চেষ্টা করুন।" }, { status: 401 });
    }

    // 3. User Switch / Login by ID
    if (body.switchUserId && db.users.has(body.switchUserId)) {
      db.currentUserId = body.switchUserId;
      const user = db.users.get(body.switchUserId)!;
      db.logAudit(user.id, user.name, "USER_LOGIN", "User", user.id, `User logged in with role ${user.role} (${user.name})`);
      return NextResponse.json({ success: true, user, isAuthenticated: true });
    }

    // 4. Login by Role (Selects first profile for that role)
    if (body.action === "login_by_role" && body.role) {
      if (body.role === "admin") {
        return NextResponse.json({ error: "Admin login is only allowed through /admin" }, { status: 403 });
      }
      const roleUser = Array.from(db.users.values()).find((u) => u.role === body.role);
      if (roleUser) {
        db.currentUserId = roleUser.id;
        db.logAudit(roleUser.id, roleUser.name, "ROLE_LOGIN", "User", roleUser.id, `Logged in as ${roleUser.role}`);
        return NextResponse.json({ success: true, user: roleUser, isAuthenticated: true });
      }
      return NextResponse.json({ error: "Role profile not found" }, { status: 404 });
    }

    // 5. New User Registration
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
      return NextResponse.json({ success: true, user: newUser, isAuthenticated: true });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process auth request" }, { status: 500 });
  }
}
