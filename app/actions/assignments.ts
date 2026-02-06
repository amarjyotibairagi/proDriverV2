'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { TrainingStatus, TestStatus } from "../../generated/prisma-client"
import { createNotification } from "./notifications"

export interface AssignmentFilters {
    search?: string
    statuses?: string[]
    moduleIds?: string[]
    departmentIds?: string[]
    depotIds?: string[]
    assignedLocationIds?: string[]
}

// --- FETCH MODULES (to be used in dropdowns) ---
export async function getModules() {
    try {
        const modules = await prisma.module.findMany({
            where: { is_active: true },
            orderBy: { title: 'asc' }
        })
        return { success: true, data: modules }
    } catch (error) {
        return { success: false, error: "Failed to fetch modules" }
    }
}

// --- FETCH ASSIGNMENTS (ASSIGNMENT-CENTRIC) ---
export async function getAssignments(page: number = 1, filters: AssignmentFilters = {}) {
    const PAGE_SIZE = 15
    const skip = (page - 1) * PAGE_SIZE

    try {
        const where: any = {}

        // Filter assignments based on Status or Module
        if (filters.statuses && filters.statuses.length > 0) {
            where.training_status = { in: filters.statuses as any }
        }
        if (filters.moduleIds && filters.moduleIds.length > 0) {
            where.module_id = { in: filters.moduleIds.map(id => parseInt(id)) }
        }

        // Filter by User criteria (Search, Department, Location)
        const userWhere: any = { is_test_account: false }
        if (filters.search) {
            userWhere.OR = [
                { full_name: { contains: filters.search, mode: 'insensitive' } },
                { employee_id: { contains: filters.search, mode: 'insensitive' } }
            ]
        }
        if (filters.departmentIds && filters.departmentIds.length > 0) {
            userWhere.department_id = { in: filters.departmentIds }
        }
        if (filters.depotIds && filters.depotIds.length > 0) {
            userWhere.home_location_id = { in: filters.depotIds }
        }
        if (filters.assignedLocationIds && filters.assignedLocationIds.length > 0) {
            userWhere.assigned_location_id = { in: filters.assignedLocationIds }
        }

        // If any user filters are present, add them to the main where clause
        if (Object.keys(userWhere).length > 0) {
            where.user = userWhere
        }

        const assignments = await prisma.trainingAssignment.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        full_name: true,
                        employee_id: true,
                        department: { select: { name: true } },
                        home_location: { select: { name: true } }
                    }
                },
                module: {
                    select: {
                        id: true,
                        title: true,
                        total_marks: true
                    }
                }
            },
            orderBy: { assigned_date: 'desc' },
            take: PAGE_SIZE,
            skip: skip
        })

        const totalCount = await prisma.trainingAssignment.count({ where })

        return {
            success: true,
            data: assignments,
            pagination: {
                page,
                pageSize: PAGE_SIZE,
                totalCount,
                totalPages: Math.ceil(totalCount / PAGE_SIZE)
            }
        }
    } catch (error) {
        console.error("Get Assignments Error:", error)
        return { success: false, error: "Failed to fetch assignments" }
    }
}

// --- FETCH USER ASSIGNMENT DETAILS (for popup) ---
export async function getUserAssignmentDetails(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                department: true,
                designation: true,
                home_location: true,
                assigned_location: true,
                assignments_received: {
                    include: {
                        module: true
                    },
                    orderBy: { assigned_date: 'desc' }
                }
            }
        })
        return { success: true, data: user }
    } catch (error) {
        return { success: false, error: "Failed to fetch user details" }
    }
}

// --- CREATE ASSIGNMENTS (Single or List) ---
export async function createAssignments(data: { userIds: string[], moduleIds: string[], dueDate?: Date }) {
    try {
        const assignments = []
        for (const userId of data.userIds) {
            for (const moduleId of data.moduleIds) {
                assignments.push({
                    user_id: userId,
                    module_id: parseInt(moduleId),
                    due_date: data.dueDate,
                    assigned_date: new Date(),
                    training_status: 'NOT_STARTED' as any,
                    test_status: 'NOT_STARTED' as any
                })
            }
        }

        await prisma.trainingAssignment.createMany({
            data: assignments,
            skipDuplicates: true
        })

        revalidatePath('/admin/assignments')
        revalidatePath('/admin/reports')

        // Fetch module titles for professional notifications
        const modules = await prisma.module.findMany({
            where: { id: { in: data.moduleIds.map(id => parseInt(id)) } },
            select: { id: true, title: true }
        })

        // Trigger notifications for each user
        for (const userId of data.userIds) {
            const moduleTitles = modules.map(m => m.title).join(", ")
            console.log(`🔹 Attempting notification for userId: ${userId}`)
            const notifRes = await createNotification({
                type: 'OPERATIONAL',
                title: 'New Training Assigned',
                message: `You have been assigned new training modules: ${moduleTitles}. Please check your dashboard.`,
                userId: userId,
                targetRole: 'BASIC',
                link: '/dashboard'
            })

            if (!notifRes.success) {
                console.error("Critical: Notification failed to trigger:", notifRes.error)
                return { success: false, error: `Assignment OK, but NOTIF FAILED for ${userId}: ${notifRes.error}` }
            }
        }

        return { success: true }
    } catch (error) {
        console.error("Create Assignments Error:", error)
        return { success: false, error: "Failed to create assignments" }
    }
}

// --- BULK ASSIGN BY CRITERIA ---
export async function bulkAssign({
    departmentId,
    locationId,
    moduleIds,
    dueDate
}: {
    departmentId?: string,
    locationId?: string,
    moduleIds: string[],
    dueDate?: Date
}) {
    try {
        const where: any = {
            role: 'BASIC', // Only assign to drivers
            is_test_account: false
        }
        if (departmentId && departmentId !== 'ALL') where.department_id = departmentId
        if (locationId && locationId !== 'ALL') where.home_location_id = locationId

        const users = await prisma.user.findMany({
            where,
            select: { id: true }
        })

        if (users.length === 0) return { success: false, error: "No users found matching these criteria" }

        return await createAssignments({
            userIds: users.map(u => u.id),
            moduleIds,
            dueDate
        })
    } catch (error) {
        return { success: false, error: "Bulk assignment failed" }
    }
}

// --- FETCH USERS FOR ASSIGNMENT ---
export interface UserFilters {
    search?: string
    departmentIds?: string[]
    depotIds?: string[]
    assignedLocationIds?: string[]
}

export async function getUsersForAssignment(filters: UserFilters = {}) {
    try {
        const where: any = {
            role: 'BASIC', // Only drivers
            is_test_account: false
        }

        if (filters.search) {
            where.OR = [
                { full_name: { contains: filters.search, mode: 'insensitive' } },
                { employee_id: { contains: filters.search, mode: 'insensitive' } }
            ]
        }

        if (filters.departmentIds && filters.departmentIds.length > 0) {
            where.department_id = { in: filters.departmentIds }
        }

        if (filters.depotIds && filters.depotIds.length > 0) {
            where.home_location_id = { in: filters.depotIds }
        }

        if (filters.assignedLocationIds && filters.assignedLocationIds.length > 0) {
            where.assigned_location_id = { in: filters.assignedLocationIds }
        }

        const users = await prisma.user.findMany({
            where,
            include: {
                department: true,
                home_location: true,
                assigned_location: true,
                designation: true,
                assignments_received: {
                    select: { id: true, module_id: true }
                }
            },
            orderBy: { full_name: 'asc' }
        })

        return { success: true, data: users }
    } catch (error) {
        console.error("Get Users For Assignment Error:", error)
        return { success: false, error: "Failed to fetch users" }
    }
}

// --- DELETE ASSIGNMENT ---
export async function deleteAssignment(id: string) {
    try {
        await prisma.trainingAssignment.delete({ where: { id } })
        revalidatePath('/admin/assignments')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to delete assignment" }
    }
}
