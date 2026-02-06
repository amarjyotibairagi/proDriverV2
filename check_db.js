
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const deptCount = await prisma.department.count()
    const locCount = await prisma.location.count()
    console.log('Department Count:', deptCount)
    console.log('Location Count:', locCount)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
