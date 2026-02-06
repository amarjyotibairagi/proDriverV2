// prisma/seed.ts
import { PrismaClient, Role, LocationType, TrainingStatus, TestStatus } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// --- Realistic Data Pools ---
const FIRST_NAMES = [
  'Ahmed', 'Mohammed', 'Abdullah', 'Khalid', 'Fahad', 'Saud', 'Abdulrahman', 'Ali', 'Omar', 'Hamza',
  'Mustafa', 'Hassan', 'Ibrahim', 'Youssef', 'Mahmoud', 'Tarek', 'Ziad', 'Nasser', 'Sami', 'Faisal'
]

const LAST_NAMES = [
  'Al-Thani', 'Al-Marri', 'Al-Qahtani', 'Al-Dossari', 'Khan', 'Ahmed', 'Ali', 'Hussain', 'Rashid', 'Malik',
  'Al-Fadhli', 'Al-Rashed', 'Sharif', 'Mansour', 'Said', 'Bakr', 'Ghani', 'Aziz', 'Hamdan', 'Salem'
]

const MODULE_TOPICS = [
  { title: 'Defensive Driving Protocols', duration: 45, marks: 100 },
  { title: 'Emergency Fire Retrieval', duration: 30, marks: 50 },
  { title: 'Advanced First Aid', duration: 60, marks: 100 },
  { title: 'Eco-Friendly Fleet Operation', duration: 40, marks: 75 },
  { title: 'Local Traffic Regulations v2', duration: 25, marks: 50 },
  { title: 'Passenger Safety Standards', duration: 45, marks: 100 },
  { title: 'Night Operation Safety', duration: 35, marks: 75 },
  { title: 'Vehicle Maintenance Basics', duration: 20, marks: 50 },
  { title: 'Hazardous Material Handling', duration: 90, marks: 150 },
  { title: 'Cyber Security for Drivers', duration: 15, marks: 25 }
]

const DEPOT_LOCATIONS = [
  'Industrial Area Depot', 'Al Wakra Depot', 'Lusail North Hub', 'Al Rayyan Logistics Center', 'Umm Salal Base'
]

const ASSIGNED_SITES = [
  'Hamad International Airport', 'Doha Port Terminal', 'Education City Station', 'The Pearl Qatar', 'Souq Waqif Terminal', 'Msheireb Downtown'
]

// --- Helpers for Random Data ---
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const generateFullName = () => `${getRandomItem(FIRST_NAMES)} ${getRandomItem(LAST_NAMES)}`

async function main() {
  console.log('🌱 Starting Realistic Seed (v2 - High Consistency)...')

  // 1. Cleanup: Delete Old Data (Order matters!)
  console.log('🧹 Clearing previous data...')
  await prisma.auditLog.deleteMany()
  await prisma.trainingAssignment.deleteMany()
  await prisma.user.deleteMany()
  await prisma.module.deleteMany()
  await prisma.location.deleteMany()
  await prisma.designation.deleteMany()
  await prisma.department.deleteMany()

  // --- 2. Create Master Data ---
  console.log('Creating Master Data...')

  const departments = []
  const deptNames = ['Operations', 'Safety', 'HR', 'Fleet Maintenance', 'Service Delivery']
  for (const name of deptNames) departments.push(await prisma.department.create({ data: { name } }))

  const designations = []
  const desigNames = ['Fleet Captain', 'Senior Operator', 'Safety Supervisor', 'Route Manager', 'Dispatch Officer']
  for (const name of desigNames) designations.push(await prisma.designation.create({ data: { name } }))

  const homeLocs = []
  for (const name of DEPOT_LOCATIONS) homeLocs.push(await prisma.location.create({ data: { name, type: LocationType.HOME } }))

  const assignedLocs = []
  for (const name of ASSIGNED_SITES) assignedLocs.push(await prisma.location.create({ data: { name, type: LocationType.ASSIGNED } }))

  // --- 3. Create Modules ---
  console.log('Creating Modules...')
  const modules = []
  for (const topic of MODULE_TOPICS) {
    modules.push(await prisma.module.create({
      data: {
        title: topic.title,
        slug: topic.title.toLowerCase().replace(/ /g, '-'),
        description: `Crucial training segment focusing on ${topic.title.toLowerCase()}.`,
        file_source: `/uploads/modules/${topic.title.toLowerCase().replace(/ /g, '-')}`,
        thumbnail_url: `https://placehold.co/600x400/0f172a/2dd4bf?text=${topic.title.replace(/ /g, '+')}`,
        total_marks: topic.marks,
        pass_marks: Math.floor(topic.marks * 0.8),
        duration_minutes: topic.duration,
        is_active: true,
      }
    }))
  }

  // --- 4. Create Users ---
  const passwordHash = await bcrypt.hash('password123', 10)

  // Create Mandatory Admin
  console.log('Initializing Admin Access...')
  const admin = await prisma.user.create({
    data: {
      employee_id: `ADMIN001`, // Requested ID
      full_name: `Administrator`,
      company: 'Mowasalat',
      email: `admin@safedoc.pro`,
      password_hash: passwordHash, // password123
      role: Role.ADMIN,
      department_id: departments[1].id, // Safety Dept
    }
  })

  // Create 50 Realistic Drivers
  console.log('Generating Personnel Data (50 Records)...')
  const basicUsers = []
  const companies = ['Mowasalat', 'Karwa', 'Doha Logistics', 'Qatar Transport Services']

  for (let i = 1; i <= 50; i++) {
    const fullName = generateFullName()
    const company = i <= 40 ? 'Mowasalat' : getRandomItem(companies.filter(c => c !== 'Mowasalat'))

    const user = await prisma.user.create({
      data: {
        employee_id: `DRV${i.toString().padStart(3, '0')}`,
        full_name: fullName,
        company: company,
        email: `${fullName.toLowerCase().replace(/ /g, '.')}@safedoc.qa`,
        mobile_number: `+974 ${getRandomInt(3000, 7999)}${getRandomInt(1000, 9999)}`,
        password_hash: (Math.random() > 0.1 ? passwordHash : null) as any, // 10% Inactive accounts
        role: Role.BASIC,
        department_id: getRandomItem(departments).id,
        designation_id: getRandomItem(designations).id,
        home_location_id: getRandomItem(homeLocs).id,
        assigned_location_id: getRandomItem(assignedLocs).id,
      }
    })
    basicUsers.push(user)
  }

  // --- 5. Create Realistic Assignments ---
  console.log('Mapping Instruction Streams (Assignments)...')

  for (const user of basicUsers) {
    // Assign 3-6 random modules to each user
    const userModules = [...modules].sort(() => 0.5 - Math.random()).slice(0, getRandomInt(3, 6))

    for (const module of userModules) {
      const diceRoll = Math.random()

      let trainingStatus: TrainingStatus = TrainingStatus.NOT_STARTED
      let testStatus: TestStatus = TestStatus.NOT_STARTED
      let marks = 0
      let currentSlide = 1
      let completionDate: Date | null = null
      let certId: string | null = null

      if (diceRoll > 0.4) {
        // Completed (60% of assigned)
        trainingStatus = TrainingStatus.COMPLETED
        currentSlide = 10
        completionDate = new Date(Date.now() - getRandomInt(1, 30) * 24 * 60 * 60 * 1000)

        const testRoll = Math.random()
        if (testRoll > 0.2) {
          testStatus = TestStatus.PASSED
          marks = getRandomInt(module.pass_marks, module.total_marks)
          certId = `CRT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
        } else {
          testStatus = TestStatus.FAILED
          marks = getRandomInt(10, module.pass_marks - 5)
        }
      } else if (diceRoll > 0.2) {
        // Ongoing (20%)
        trainingStatus = TrainingStatus.ONGOING
        testStatus = TestStatus.ONGOING
        currentSlide = getRandomInt(2, 9)
      }

      await prisma.trainingAssignment.create({
        data: {
          user_id: user.id,
          module_id: module.id,
          assigned_by_id: admin.id,
          training_status: trainingStatus,
          test_status: testStatus,
          marks_obtained: marks,
          current_slide: currentSlide,
          certificate_id: certId,
          completion_date: completionDate,
          assigned_date: new Date(Date.now() - getRandomInt(40, 60) * 24 * 60 * 60 * 1000)
        }
      })
    }
  }

  // --- 6. Create Audit Logs ---
  console.log('Generating Telemetry Logs...')
  const auditActions = ['USER_LOGIN', 'MODULE_VIEWED', 'TEST_ATTEMPT', 'CERTIFICATE_DOWNLOADED']

  for (let i = 1; i <= 80; i++) {
    const randomUser = getRandomItem(basicUsers)
    await prisma.auditLog.create({
      data: {
        action: getRandomItem(auditActions),
        actor_id: randomUser.id,
        metadata: { node: 'internal-system', terminal: 'mobile-app' },
        timestamp: new Date(Date.now() - getRandomInt(0, 15) * 24 * 60 * 60 * 1000)
      }
    })
  }

  console.log(`✅ Infrastructure Refresh Complete!`)
  console.log(`Personnel: 51 Records (1 Admin, 50 Drivers)`)
  console.log(`Modules: 10 Instruction Nodes`)
  console.log(`Telemetries: Verified`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
