
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('--- Debugging User Data ---')

    const allUsers = await prisma.user.count()
    console.log(`Total Users: ${allUsers}`)

    const usersWithPassword = await prisma.user.count({
        where: { password_hash: { not: null } }
    })
    console.log(`Users with password_hash != null: ${usersWithPassword}`)

    const usersNullPassword = await prisma.user.count({
        where: { password_hash: null }
    })
    console.log(`Users with password_hash == null: ${usersNullPassword}`)

    // Check for empty string if that's the issue
    // Note: standard prisma filter might not support this easily depending on DB, but let's try raw or findMany
    const sampleUsers = await prisma.user.findMany({
        take: 5,
        select: { id: true, full_name: true, password_hash: true, employee_id: true }
    })

    console.log('\n--- Sample Users ---')
    console.log(JSON.stringify(sampleUsers, null, 2))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
