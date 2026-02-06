'use server'

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

// --- 1. Get User Details (With Real Relations) ---
export async function getUser(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { employee_id: userId },
      // FETCH THE RELATIONS
      include: {
        home_location: true,
        assigned_location: true,
        team: true,
      }
    })

    if (!user) return { success: false }

    return {
      success: true,
      user: {
        name: user.full_name,
        mobile: user.mobile_number || "",
        company: user.company || "N/A", // Add company

        // LOGIC: If assigned location exists (Site), use it. Else use Home location (Depot).
        location: user.assigned_location?.name || user.home_location?.name || "Unassigned",

        // LOGIC: Admins show Team, Drivers show Assigned Location
        assignedArea: user.role === 'ADMIN'
          ? user.team?.name || "General"
          : user.assigned_location?.name || "Floating Driver"
      }
    }
  } catch (error) {
    console.error("Error fetching user:", error)
    return { success: false }
  }
}

// --- 2. Update Profile Details ---
export async function updateProfile(userId: string, data: { name: string; mobile: string; location: string }) {
  try {
    await prisma.user.update({
      where: { employee_id: userId },
      data: {
        full_name: data.name,
        mobile_number: data.mobile,
        // Note: We aren't updating location ID here as that usually requires a dropdown selection,
        // but the name and mobile will update successfully.
      }
    })

    // REFRESH BOTH DASHBOARDS
    revalidatePath('/dashboard')
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { success: false, error: "Failed to update profile" }
  }
}

// --- 3. Change Password ---
export async function changePassword(userId: string, oldPass: string, newPass: string) {
  try {
    // A. Find User
    const user = await prisma.user.findUnique({
      where: { employee_id: userId }
    })

    if (!user) return { success: false, error: "User not found" }

    // B. Verify Old Password
    const isMatch = await bcrypt.compare(oldPass, user.password_hash || "")
    if (!isMatch) {
      return { success: false, error: "Incorrect old password" }
    }

    // C. Hash New Password
    const salt = await bcrypt.genSalt(10)
    const newHash = await bcrypt.hash(newPass, salt)

    // D. Update Database
    await prisma.user.update({
      where: { employee_id: userId },
      data: { password_hash: newHash }
    })

    return { success: true }
  } catch (error) {
    console.error("Error changing password:", error)
    return { success: false, error: "System error" }
  }
}

// --- 4. Get User for Signup Autofill ---
export async function getUserDetailsForSignup(employeeId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { employee_id: employeeId },
      select: {
        full_name: true,
        email: true,
        mobile_number: true,
        company: true,
        team_id: true,
        designation_id: true,
        home_location_id: true, // For 'Depot' dropdown
        assigned_location_id: true, // For 'Assigned Area' dropdown
        role: true,
        password_hash: true // Use to check if active
      }
    })

    if (!user) return { success: false }

    const isActive = !!user.password_hash // Active if password exists
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...safeUser } = user // Exclude hash

    return { success: true, user: safeUser, isActive }
  } catch (error) {
    console.error("Error fetching user for signup:", error)
    return { success: false }
  }
}