'use server'

import { prisma } from "@/lib/prisma"
import { LocationType } from "../../generated/prisma-client"

export async function getSignupOptions() {
    try {
        const designations = await prisma.designation.findMany({
            orderBy: { name: 'asc' }
        })

        const depots = await prisma.location.findMany({
            where: { type: LocationType.HOME },
            orderBy: { name: 'asc' }
        })

        const assignedLocations = await prisma.location.findMany({
            where: { type: LocationType.ASSIGNED },
            orderBy: { name: 'asc' }
        })

        return {
            success: true,
            designations,
            depots,
            assignedLocations
        }
    } catch (error) {
        console.error("Error fetching signup options:", error)
        return { success: false, designations: [], depots: [], assignedLocations: [] }
    }
}
