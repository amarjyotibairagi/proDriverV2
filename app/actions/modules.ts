'use server'

import { prisma } from "@/lib/prisma"

export async function getModules() {
    try {
        const modules = await prisma.module.findMany({
            orderBy: { title: 'asc' },
            include: {
                _count: {
                    select: { assignments: true }
                }
            }
        })
        return { success: true, data: modules }
    } catch (error) {
        console.error("Get Modules Error:", error)
        return { success: false, error: "Failed to fetch modules" }
    }
}

export async function getModuleAnalytics(moduleId: any) {
    try {
        const id = typeof moduleId === 'number' ? moduleId : parseInt(moduleId)
        if (isNaN(id)) throw new Error("Invalid Module ID")

        // Fetch all assignments for this module with user relations
        const assignments = await prisma.trainingAssignment.findMany({
            where: { module_id: id },
            include: {
                user: {
                    include: {
                        department: true,
                        home_location: true,
                        assigned_location: true
                    }
                }
            }
        })

        // 1. Team Distribution
        const teamStats: Record<string, number> = {}
        // 2. Depot Distribution
        const depotStats: Record<string, number> = {}
        // 3. Assigned Location Distribution
        const locStats: Record<string, number> = {}

        assignments.forEach(a => {
            const team = a.user.department?.name || 'Unassigned'
            const depot = a.user.home_location?.name || 'No Depot'
            const loc = a.user.assigned_location?.name || 'No Location'

            teamStats[team] = (teamStats[team] || 0) + 1
            depotStats[depot] = (depotStats[depot] || 0) + 1
            locStats[loc] = (locStats[loc] || 0) + 1
        })

        const format = (stats: Record<string, number>) =>
            Object.entries(stats).map(([name, value]) => ({ name, value }))

        return {
            success: true,
            data: {
                teams: format(teamStats),
                depots: format(depotStats),
                locations: format(locStats),
                total: assignments.length
            }
        }
    } catch (error) {
        console.error("Module Analytics Error:", error)
        return { success: false, error: "Failed to fetch analytics" }
    }
}
