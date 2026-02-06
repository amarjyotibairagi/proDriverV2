'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getNotifications(userId?: string, role?: 'ADMIN' | 'BASIC') {
    try {
        // Robust ID Resolution
        let effectiveUserId = userId
        if (userId && (userId.length < 20 || !userId.startsWith('c'))) {
            const user = await prisma.user.findUnique({
                where: { employee_id: userId },
                select: { id: true }
            })
            if (user) {
                effectiveUserId = user.id
            }
        }

        const whereClause: any = {
            OR: [
                { userId: effectiveUserId },             // Direct user notification
                { targetRole: role },           // Role-based notification
                { targetRole: null, userId: null } // System-wide broadcast (if implicit)
            ]
        }

        const notifications = await prisma.notification.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            take: 20
        })

        const unreadCount = await prisma.notification.count({
            where: { ...whereClause, isRead: false }
        })

        return { notifications, unreadCount }

    } catch (error: any) {
        console.error("❌ getNotifications Error:", error)
        // Hard fallback to ensure UI never "breaks" completely
        return { notifications: [], unreadCount: 0 }
    }
}

export async function markAsRead(notificationId: string) {
    try {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true }
        })
        revalidatePath('/dashboard')
        revalidatePath('/admin')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to mark as read" }
    }
}

export async function createNotification(data: {
    type: 'CRITICAL' | 'OPERATIONAL' | 'INFO',
    title: string,
    message: string,
    userId?: string,
    targetRole?: 'ADMIN' | 'BASIC',
    link?: string,
    metadata?: any
}) {
    try {
        const result = await prisma.notification.create({
            data: {
                ...data,
                isRead: false
            }
        })

        revalidatePath('/dashboard')
        revalidatePath('/admin')

        return { success: true, id: result.id }
    } catch (error: any) {
        console.error("❌ createNotification Error:", error)
        return { success: false, error: `Prisma error: ${error.message || "Unknown"}` }
    }
}
