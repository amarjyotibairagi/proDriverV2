'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// --- FETCH ALL ---
export async function getMasterData() {
    try {
        const teams = await prisma.team.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { users: true } } }
        })
        const designations = await prisma.designation.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { users: true } } }
        })
        const locations = await prisma.location.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: {
                        users_home: true,
                        users_assigned: true
                    }
                }
            }
        })

        return { teams, designations, locations }
    } catch (error) {
        console.error("Get Master Data Error:", error)
        return { teams: [], designations: [], locations: [] }
    }
}

// --- TEAMS ---

export async function manageTeam(data: { id?: string, name: string }) {
    try {
        if (data.id) {
            await prisma.team.update({
                where: { id: data.id },
                data: { name: data.name }
            })
        } else {
            const existing = await prisma.team.findUnique({ where: { name: data.name } })
            if (existing) return { success: false, error: "Team name already exists" }

            await prisma.team.create({ data: { name: data.name } })
        }
        revalidatePath('/admin/master-data')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to save team" }
    }
}

export async function deleteTeam(id: string) {
    try {
        await prisma.team.delete({ where: { id } })
        revalidatePath('/admin/master-data')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Cannot delete: Users are assigned to this team" }
    }
}

// --- DESIGNATIONS ---

export async function manageDesignation(data: { id?: string, name: string }) {
    try {
        if (data.id) {
            await prisma.designation.update({
                where: { id: data.id },
                data: { name: data.name }
            })
        } else {
            const existing = await prisma.designation.findUnique({ where: { name: data.name } })
            if (existing) return { success: false, error: "Designation name already exists" }

            await prisma.designation.create({ data: { name: data.name } })
        }
        revalidatePath('/admin/master-data')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to save designation" }
    }
}

export async function deleteDesignation(id: string) {
    try {
        await prisma.designation.delete({ where: { id } })
        revalidatePath('/admin/master-data')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Cannot delete: Users are assigned to this designation" }
    }
}

// --- LOCATIONS ---

export async function manageLocation(data: { id?: string, name: string, type: 'HOME' | 'ASSIGNED' }) {
    try {
        if (data.id) {
            await prisma.location.update({
                where: { id: data.id },
                data: { name: data.name, type: data.type }
            })
        } else {
            // Name + Type uniqueness isn't strict in schema, but Name often is. 
            // Logic: Check if exact name exists? 
            // Schema says: name String (not unique). 
            // But let's assume we want to allow duplicates if they are different concepts? 
            // For now, simple create.
            await prisma.location.create({
                data: { name: data.name, type: data.type }
            })
        }
        revalidatePath('/admin/master-data')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to save location" }
    }
}

export async function deleteLocation(id: string) {
    try {
        await prisma.location.delete({ where: { id } })
        revalidatePath('/admin/master-data')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Cannot delete: Users are linked to this location" }
    }
}
