
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const prisma = new PrismaClient()

async function main() {
    const output = []
    output.push('--- Debugging User Data ---')

    const allUsers = await prisma.user.count()
    output.push(`Total Users: ${allUsers}`)

    const usersWithPassword = await prisma.user.count({
        where: { password_hash: { not: null } }
    })
    output.push(`Users with password_hash != null: ${usersWithPassword}`)

    const usersNullPassword = await prisma.user.count({
        where: { password_hash: null }
    })
    output.push(`Users with password_hash == null: ${usersNullPassword}`)

    const pendingUsers = await prisma.user.findMany({
        where: { password_hash: null },
        take: 5
    })
    output.push(`Pending Users Sample: ${JSON.stringify(pendingUsers, null, 2)}`)

    fs.writeFileSync('debug-output.txt', output.join('\n'))
    console.log('Debug info written to debug-output.txt')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
