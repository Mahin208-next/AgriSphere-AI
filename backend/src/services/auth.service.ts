import { dataStore } from "../models/db";
import { User, UserRole } from "../@types";

export class AuthService {
  public getCurrentUser(): { user: User; allUsers: User[] } {
    const user = dataStore.users.get(dataStore.currentUserId) || Array.from(dataStore.users.values())[0];
    const allUsers = Array.from(dataStore.users.values());
    return { user, allUsers };
  }

  public switchUser(targetUserId: string): User {
    const user = dataStore.users.get(targetUserId);
    if (!user) {
      throw new Error("Target user profile not found");
    }
    dataStore.currentUserId = user.id;
    dataStore.logAudit(
      user.id,
      user.name,
      "USER_SWITCH",
      "User",
      user.id,
      `Switched active session to role ${user.role} (${user.name})`
    );
    return user;
  }

  public register(payload: {
    name: string;
    nameBn?: string;
    email: string;
    phone: string;
    role: UserRole;
    district: string;
    upazila?: string;
    companyName?: string;
  }): User {
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: payload.name,
      nameBn: payload.nameBn || payload.name,
      email: payload.email,
      phone: payload.phone,
      role: payload.role,
      district: payload.district,
      upazila: payload.upazila || "Sadar",
      verified: true,
      companyName: payload.companyName,
      createdAt: new Date().toISOString(),
    };

    dataStore.users.set(newUser.id, newUser);
    dataStore.currentUserId = newUser.id;

    dataStore.logAudit(
      newUser.id,
      newUser.name,
      "USER_REGISTER",
      "User",
      newUser.id,
      `New user registered with role ${newUser.role}`
    );

    return newUser;
  }
}

export const authService = new AuthService();

