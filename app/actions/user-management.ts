'use server'

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { getSession } from "./auth"

// 1. Fetch Options for Dropdowns
export async function getUserFormOptions() {
    try {
        const departments = await prisma.department.findMany({ select: { id: true, name: true } })
        const locations = await prisma.location.findMany({ select: { id: true, name: true } })
        const designations = await prisma.designation.findMany({ select: { id: true, name: true } })

        return { departments, locations, designations }
    } catch (error) {
        return { departments: [], locations: [], designations: [] }
    }
}

// 2. Create New User
export async function createUser(formData: any) {
    try {
        // Check if ID already exists
        const existing = await prisma.user.findUnique({
            where: { employee_id: formData.employeeId }
        })

        if (existing) {
            return { success: false, error: "Employee ID already exists" }
        }

        // Hash Default Password
        const hashedPassword = await bcrypt.hash("Welcome@123", 10)

        // Create User
        await prisma.user.create({
            data: {
                employee_id: formData.employeeId,
                full_name: formData.name,
                email: formData.email,
                mobile_number: formData.mobile,
                company: formData.company, // Add company field
                role: formData.role, // 'BASIC' or 'ADMIN'
                password_hash: hashedPassword,

                // Relations (Connect if ID is provided)
                department: formData.departmentId ? { connect: { id: formData.departmentId } } : undefined,
                assigned_location: formData.locationId ? { connect: { id: formData.locationId } } : undefined,
                home_location: formData.homeLocationId ? { connect: { id: formData.homeLocationId } } : undefined,
            }
        })

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        console.error("Create User Error:", error)
        return { success: false, error: "Failed to create user" }
    }
}

// 3. Reset Password
export async function resetUserPassword(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { full_name: true }
        })

        if (!user) return { success: false, error: "User not found" }

        // Generate Password: first 3 chars of name + 123
        let newPasswordRaw = "pass1234"
        if (user.full_name && user.full_name.length >= 3) {
            newPasswordRaw = user.full_name.substring(0, 3).toLowerCase() + "123"
        }

        const hashedPassword = await bcrypt.hash(newPasswordRaw, 10)

        await prisma.user.update({
            where: { id: userId },
            data: { password_hash: hashedPassword }
        })

        return { success: true, newPassword: newPasswordRaw }
    } catch (error) {
        console.error("Reset Password Error:", error)
        return { success: false, error: "Failed to reset password" }
    }
}

// 4. Shadow Account Management
export async function getShadowAccounts() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return { success: false, error: "Unauthorized" }
        }

        // We use dbId to find children linked by linked_parent_id
        const shadows = await prisma.user.findMany({
            where: { linked_parent_id: session.dbId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                employee_id: true,
                full_name: true,
                is_test_account: true,
                createdAt: true
            }
        })

        return { success: true, shadows }
    } catch (error) {
        console.error("Get Shadows Error:", error)
        return { success: false, error: "Failed to fetch shadow accounts" }
    }
}

export async function createShadowAccount() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') {
            return { success: false, error: "Unauthorized" }
        }

        const admin = await prisma.user.findUnique({
            where: { id: session.dbId },
            select: { full_name: true, id: true }
        })

        if (!admin) return { success: false, error: "Admin not found" }

        const count = await prisma.user.count({ where: { linked_parent_id: admin.id } })
        const shadowId = `TST-${session.userId}-${(count + 1).toString().padStart(2, '0')}`

        const hashedPassword = await bcrypt.hash("Welcome@123", 10)

        const shadow = await prisma.user.create({
            data: {
                employee_id: shadowId,
                full_name: `${admin.full_name} (Shadow ${count + 1})`,
                role: 'BASIC',
                is_test_account: true,
                linked_parent_id: admin.id,
                password_hash: hashedPassword,
                company: "Mowasalat", // Default
                preferred_language: "en"
            }
        })

        revalidatePath('/admin')
        return { success: true, shadow }
    } catch (error: any) {
        console.error("Create Shadow Error:", error)
        return { success: false, error: error.message || "Failed to create shadow account" }
    }
}
