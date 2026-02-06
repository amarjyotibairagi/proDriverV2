'use server'

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { signSession, verifySession } from "@/lib/jwt"
import { encryptData } from "@/lib/encryption"
import { revalidatePath } from "next/cache"

export async function loginUser(employeeId: string, passwordRaw: string) {
  console.log("🔹 Attempting Login for:", employeeId)

  try {
    if (!prisma) {
      throw new Error("Prisma Client is not initialized")
    }

    // 1. Find User
    const user = await prisma.user.findUnique({
      where: { employee_id: employeeId }
    })

    if (!user) {
      return { success: false, error: "User ID not found" }
    }

    // 2. Verify Password
    const isMatch = await bcrypt.compare(passwordRaw, user.password_hash || "")

    if (!isMatch) {
      return { success: false, error: "Incorrect Password" }
    }

    // 3. Set Signed Session Cookie (JWT)
    const token = await signSession({
      userId: user.employee_id,
      role: user.role,
      mongoId: user.id
    });

    (await cookies()).set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: 'lax'
    });

    return {
      success: true,
      role: user.role,
      userId: user.id
    }

  } catch (error: any) {
    console.error("Login Error:", error)
    return { success: false, error: `System Error: ${error.message}` }
  }
}

export async function logoutUser() {
  (await cookies()).delete("session_token")
  return { success: true }
}

export async function getSession() {
  const token = (await cookies()).get("session_token")?.value
  if (!token) return null;

  const payload = await verifySession(token);
  return payload ? {
    userId: payload.userId as string,
    role: payload.role as string,
    dbId: payload.mongoId as string,
    originalAdminId: payload.originalAdminId as string | undefined,
    originalAdminRole: payload.originalAdminRole as string | undefined
  } : null;
}

export async function verifyCurrentPassword(password: string) {
  try {
    const session = await getSession();
    if (!session?.userId) return { success: false, error: "Not authenticated" };

    const user = await prisma.user.findUnique({
      where: { employee_id: session.userId }
    });

    if (!user) return { success: false, error: "User not found" };

    const isMatch = await bcrypt.compare(password, user.password_hash || "");
    return { success: isMatch, error: isMatch ? undefined : "Incorrect password" };
  } catch (error) {
    console.error("Password Verification Error:", error);
    return { success: false, error: "Verification failed" };
  }
}

export interface RegisterData {
  id: string
  name: string
  company: string
  designation: string // ID
  depot: string      // ID
  assignedArea: string // ID
  email: string
  mobile: string
  pass: string
}

export async function registerUser(data: RegisterData) {
  try {
    if (!prisma) throw new Error("Prisma not initialized")

    // 1. Check if User Exists
    const existing = await prisma.user.findUnique({
      where: { employee_id: data.id }
    })

    if (existing) {
      return { success: false, error: "User ID already exists" }
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(data.pass, salt)

    // 3. Encrypt Sensitive Data (AES)
    const encryptedMobile = encryptData(data.mobile);
    const encryptedEmail = encryptData(data.email);

    // 4. Create User
    const newUser = await prisma.user.create({
      data: {
        employee_id: data.id,
        full_name: data.name,
        company: data.company,
        email: encryptedEmail,       // Stored Encrypted
        mobile_number: encryptedMobile, // Stored Encrypted
        password_hash: hashedPassword,
        designation_id: data.designation,
        home_location_id: data.depot,
        assigned_location_id: data.assignedArea,
        role: 'BASIC'
      }
    });

    // 5. Auto Login (Sign Token)
    const token = await signSession({
      userId: newUser.employee_id,
      role: newUser.role,
      mongoId: newUser.id
    });

    (await cookies()).set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: 'lax'
    })

    return { success: true }

  } catch (error: any) {
    console.error("Registration Error:", error)
    return { success: false, error: error.message || "Registration failed" }
  }
}

export async function setLanguageCookie(lang: string) {
  (await cookies()).set("NEXT_LOCALE", lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
  return { success: true };
}

export async function impersonateShadowAccount(shadowUserId: string) {
  try {
    const adminSession = await getSession();
    if (!adminSession || adminSession.role !== 'ADMIN') {
      return { success: false, error: "Unauthorized" };
    }

    // Find the shadow user and verify it belongs to this admin
    const shadowUser = await prisma.user.findFirst({
      where: {
        id: shadowUserId,
        linked_parent_id: adminSession.dbId,
        role: 'BASIC'
      }
    });

    if (!shadowUser) {
      return { success: false, error: "Shadow account not found or not linked to your profile" };
    }

    // Create new JWT with shadow identity but retaining original admin ID
    const token = await signSession({
      userId: shadowUser.employee_id,
      role: shadowUser.role,
      mongoId: shadowUser.id,
      originalAdminId: adminSession.userId, // employee_id
      originalAdminRole: 'ADMIN'
    });

    (await cookies()).set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60, // 1 hour for impersonation
      path: "/",
      sameSite: 'lax'
    });

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error("Impersonation Error:", error);
    return { success: false, error: "Failed to switch account" };
  }
}

export async function exitImpersonation() {
  try {
    const session = await getSession();
    if (!session?.originalAdminId) {
      return { success: false, error: "No active impersonation found" };
    }

    // Restore original admin account
    const adminUser = await prisma.user.findUnique({
      where: { employee_id: session.originalAdminId }
    });

    if (!adminUser) {
      return { success: false, error: "Original admin account not found" };
    }

    const token = await signSession({
      userId: adminUser.employee_id,
      role: adminUser.role,
      mongoId: adminUser.id
    });

    (await cookies()).set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: 'lax'
    });

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error("Exit Impersonation Error:", error);
    return { success: false, error: "Failed to restore admin session" };
  }
}

