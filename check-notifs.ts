import { PrismaClient } from './generated/prisma-client/index'

const prisma = new PrismaClient()

async function main() {
    try {
        const user = await prisma.user.findUnique({ where: { employee_id: 'DRV001' } })
        if (!user) {
            console.log("DRV001 not found!")
            return
        }
        console.log("User:", user.full_name, "(ID:", user.id, ")")

        console.log("\n--- Notifications for this User ID ---")
        const notifs = await prisma.notification.findMany({
            where: { userId: user.id }
        })
        console.log("Count:", notifs.length)
        notifs.forEach(n => {
            console.log(`[${n.createdAt.toISOString()}] ${n.title} - Type: ${n.type} - Read: ${n.isRead}`)
        })

        console.log("\n--- Role-based Notifications (BASIC) ---")
        const roleNotifs = await prisma.notification.findMany({
            where: { targetRole: 'BASIC' }
        })
        console.log("Count:", roleNotifs.length)
        roleNotifs.forEach(n => {
            console.log(`[${n.createdAt.toISOString()}] ${n.title} (User: ${n.userId})`)
        })

    } catch (err: any) {
        console.error("Error:", err.message)
    } finally {
        await prisma.$disconnect()
    }
}

main()
