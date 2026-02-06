
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const allUsers = await prisma.user.count()
    const mowasalatUsers = await prisma.user.count({ where: { company: 'Mowasalat' } })
    const otherUsers = allUsers - mowasalatUsers

    console.log('--- Seed Verification ---')
    console.log(`Total Users: ${allUsers}`)
    console.log(`Mowasalat Users: ${mowasalatUsers} (${((mowasalatUsers / allUsers) * 100).toFixed(1)}%)`)
    console.log(`Other Users: ${otherUsers}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
