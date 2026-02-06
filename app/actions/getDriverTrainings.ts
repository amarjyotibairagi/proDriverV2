'use server'

import { prisma } from "@/lib/prisma"

export async function getDriverTrainings(userId: string) {
    try {
        if (!userId) {
            return { success: false, data: [] };
        }

        const assignments = await prisma.trainingAssignment.findMany({
            where: {
                user_id: userId,
            },
            include: {
                module: true
            },
            orderBy: { assigned_date: 'desc' }
        })

        return { success: true, data: assignments }
    } catch (error) {
        console.error("Failed to fetch driver trainings:", error)
        return { success: false, data: [] }
    }
}