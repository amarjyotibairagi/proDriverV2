'use server'

import { prisma } from "@/lib/prisma"

export interface AuditFilters {
    search?: string // Searches User Name or Action
    startDate?: Date
    endDate?: Date
}

export async function getAuditLogs(page: number = 1, filters: AuditFilters = {}) {
    const PAGE_SIZE = 20
    const skip = (page - 1) * PAGE_SIZE

    try {
        const where: any = {}

        if (filters.search) {
            where.OR = [
                { action: { contains: filters.search, mode: 'insensitive' } },
                { actor: { full_name: { contains: filters.search, mode: 'insensitive' } } },
                { target_id: { contains: filters.search, mode: 'insensitive' } }
            ]
        }

        if (filters.startDate || filters.endDate) {
            where.timestamp = {}
            if (filters.startDate) where.timestamp.gte = filters.startDate
            if (filters.endDate) where.timestamp.lte = filters.endDate
        }

        // Get Data
        const logs = await prisma.auditLog.findMany({
            where,
            include: {
                actor: {
                    select: { full_name: true, email: true, role: true }
                }
            },
            orderBy: { timestamp: 'desc' },
            take: PAGE_SIZE,
            skip: skip
        })

        // Get Total Count for Pagination
        const totalCount = await prisma.auditLog.count({ where })

        return {
            success: true,
            data: logs,
            pagination: {
                page,
                pageSize: PAGE_SIZE,
                totalCount,
                totalPages: Math.ceil(totalCount / PAGE_SIZE)
            }
        }

    } catch (error) {
        console.error("Get Audit Logs Error:", error)
        return { success: false, error: "Failed to fetch audit logs" }
    }
}
