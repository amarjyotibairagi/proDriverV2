'use server'

import { prisma } from "@/lib/prisma"

export async function getUsers(filter: 'all' | 'active' | 'pending' = 'all') {
    try {
        const whereClause: any = {
            is_test_account: false
        }

        if (filter === 'active') {
            whereClause.password_hash = { not: null }
        } else if (filter === 'pending') {
            whereClause.password_hash = null
        }

        const users = await prisma.user.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' }, // Newest users at the top
            include: {
                team: true,
                designation: true,
                home_location: true,
                assigned_location: true,
                assignments_received: {
                    select: {
                        training_status: true
                    }
                }
            }
        })

        // Transform data to include stats
        const enrichedUsers = users.map((user: any) => {
            const total = user.assignments_received.length;
            const completed = user.assignments_received.filter((a: any) => a.training_status === 'COMPLETED').length;
            const ongoing = user.assignments_received.filter((a: any) => a.training_status === 'ONGOING').length;
            const pending = user.assignments_received.filter((a: any) => a.training_status === 'NOT_STARTED').length;

            return {
                ...user,
                training_stats: {
                    total,
                    completed,
                    ongoing,
                    pending
                },
                has_password: !!user.password_hash
            }
        })

        return { success: true, data: enrichedUsers }
    } catch (error) {
        console.error("Failed to fetch users:", error)
        return { success: false, error: "Failed to load users" }
    }
}