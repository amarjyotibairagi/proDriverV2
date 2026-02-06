'use server'

import { prisma } from "@/lib/prisma"

// Helper to get short month name (e.g., "Jan", "Feb")
const getMonthName = (date: Date) => date.toLocaleString('default', { month: 'short' })

export async function getAdminStats(companyFilter: 'MOWASALAT' | 'CONTRACTORS' | 'ALL' = 'MOWASALAT') {
  const now = new Date()
  const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  // --- FILTER LOGIC ---
  let userWhere: any = {
    role: 'BASIC',
    is_test_account: false
  }
  // Only apply company filter if NOT 'ALL'
  if (companyFilter === 'MOWASALAT') {
    userWhere.company = { equals: 'Mowasalat', mode: 'insensitive' }
  } else if (companyFilter === 'CONTRACTORS') {
    userWhere.NOT = { company: { equals: 'Mowasalat', mode: 'insensitive' } }
  }

  // 1. User Counts & Trend
  const totalUsers = await prisma.user.count({ where: userWhere })

  const usersLastMonth = await prisma.user.count({
    where: {
      ...userWhere,
      createdAt: {
        gte: firstDayLastMonth,
        lt: firstDayCurrentMonth
      }
    }
  })

  // Calculate Growth
  let userGrowth = 0
  if (usersLastMonth === 0) {
    userGrowth = totalUsers > 0 ? 100 : 0
  } else {
    userGrowth = Math.round(((totalUsers - usersLastMonth) / usersLastMonth) * 100)
  }

  // 2. Module Counts (Modules are global, not company specific usually, but assignments are)
  const totalModules = await prisma.module.count()
  const activeModules = await prisma.module.count({ where: { is_active: true } })

  // 3. Training Stats - Filter by User's Company
  // We need to fetch assignments where the user matches the company filter
  const assignments = await prisma.trainingAssignment.findMany({
    where: {
      user: userWhere // Uses the relation filter
    },
    select: {
      training_status: true,
      test_status: true,
      marks_obtained: true,
      completion_date: true,
    }
  })

  const totalAssignments = assignments.length

  // KPI: "Pending Tests"
  const pendingTests = assignments.filter(a =>
    a.training_status === 'COMPLETED' && a.test_status === 'NOT_STARTED'
  ).length

  // KPI: Completion Rate
  const completedCount = assignments.filter(a => a.training_status === 'COMPLETED').length
  const completionRate = totalAssignments > 0
    ? Math.round((completedCount / totalAssignments) * 100)
    : 0

  // KPI: Test Stats
  const passedTests = assignments.filter(a => a.test_status === 'PASSED').length
  const failedTests = assignments.filter(a => a.test_status === 'FAILED').length

  const assignmentsWithMarks = assignments.filter(a => a.marks_obtained > 0)
  const averageScore = assignmentsWithMarks.length > 0
    ? Math.round(assignmentsWithMarks.reduce((acc, curr) => acc + curr.marks_obtained, 0) / assignmentsWithMarks.length)
    : 0

  // --- 4. CALCULATE MONTHLY TRENDS ---
  // (Logic remains same, operates on filtered 'assignments')
  const monthsMap = new Map()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = getMonthName(d)
    monthsMap.set(key, {
      completedCount: 0,
      totalMarks: 0,
      countWithMarks: 0,
      passedCount: 0,
      totalTests: 0
    })
  }

  assignments.forEach(a => {
    if (a.completion_date) {
      const key = getMonthName(a.completion_date)
      if (monthsMap.has(key)) {
        const bucket = monthsMap.get(key)
        bucket.completedCount++
        if (a.marks_obtained > 0) {
          bucket.totalMarks += a.marks_obtained
          bucket.countWithMarks++
        }
        if (a.test_status === 'PASSED' || a.test_status === 'FAILED') {
          bucket.totalTests++
          if (a.test_status === 'PASSED') {
            bucket.passedCount++
          }
        }
      }
    }
  })

  const trendData = {
    activity: [] as any[],
    performance: [] as any[],
    compliance: [] as any[]
  }

  monthsMap.forEach((val, key) => {
    trendData.activity.push({ name: key, value: val.completedCount })
    const avgScore = val.countWithMarks > 0
      ? Math.round(val.totalMarks / val.countWithMarks)
      : 0
    trendData.performance.push({ name: key, value: avgScore })
    const passRate = val.totalTests > 0
      ? Math.round((val.passedCount / val.totalTests) * 100)
      : 0
    trendData.compliance.push({ name: key, value: passRate })
  })

  // 5. Recent Activity - Filter by Actor's Company
  // --- 5. Mock Recent Activity (Per User Request) ---
  const recentActivity = [
    {
      id: 'mock-1',
      action: 'LOGIN_SUCCESS',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
      actor: { full_name: "Ahmed Al-Sayed", employee_id: "5000001" }
    },
    {
      id: 'mock-2',
      action: 'MODULE_COMPLETED',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
      actor: { full_name: "John Doe", employee_id: "5000002" }
    },
    {
      id: 'mock-3',
      action: 'TEST_PASSED', // "PASSED" triggers green style
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      actor: { full_name: "Rahul Sharma", employee_id: "5000003" }
    },
    {
      id: 'mock-4',
      action: 'PROFILE_UPDATE',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      actor: { full_name: "Michael Chen", employee_id: "5000004" }
    },
    {
      id: 'mock-5',
      action: 'TEST_FAILED', // "FAILED" triggers red style
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      actor: { full_name: "Sarah Jones", employee_id: "5000005" }
    }
  ] as any

  // --- 6. CALCULATE RISK RADAR METRICS ---
  // Using 'assignments' which is already filtered by company

  // 1. Knowledge Gap (Low Scores)
  // Avg score < 70 considered gap. Reverse: If avg is 80, gap is 20. If avg 50, gap is 50.
  // We'll normalize: 100 - Avg Score (min 0)
  const knowledgeGap = Math.max(0, 100 - averageScore)

  // 2. Compliance (Completion Rate Gap)
  // If completion is 100%, risk is 0. If 40%, risk is 60.
  const complianceRisk = Math.max(0, 100 - completionRate)

  // 3. Test Failures (Fail Rate)
  // If 50% failed, risk is 50.
  const totalTestsTaken = passedTests + failedTests
  const failureRisk = totalTestsTaken > 0
    ? Math.round((failedTests / totalTestsTaken) * 100)
    : 0

  // 4. Backlog (Not Started)
  // % of assignments Not Started
  const backlogRisk = totalAssignments > 0
    ? Math.round((assignments.filter(a => a.training_status === 'NOT_STARTED').length / totalAssignments) * 100)
    : 0

  // 5. Recency (Simplified: % completed > 30 days ago)
  // For now, let's look at "Ongoing" as a risk factor for delays
  // or sticking to a safe static-ish dynamic value if date logic is complex
  // Let's use "Ongoing" percentage as "Stagnation Risk"
  const stagnationRisk = totalAssignments > 0
    ? Math.round((assignments.filter(a => a.training_status === 'ONGOING').length / totalAssignments) * 100)
    : 0

  return {
    kpi: {
      totalUsers,
      userGrowth,
      totalModules,
      activeModules,
      totalAssignments,
      pendingTests,
      completionRate,
      averageScore,
      passedTests,
      failedTests
    },
    charts: {
      // Existing Simple Arrays
      trainingStatus: [
        completedCount,
        assignments.filter(a => a.training_status === 'ONGOING').length,
        assignments.filter(a => a.training_status === 'NOT_STARTED').length
      ],
      testResults: [passedTests, failedTests],
      monthlyTrends: trendData,
      // NEW: Risk Radar Data
      riskRadar: [
        { subject: "Knowledge Gap", value: knowledgeGap, fullMark: 100 },
        { subject: "Compliance Risk", value: complianceRisk, fullMark: 100 },
        { subject: "Test Failures", value: failureRisk, fullMark: 100 },
        { subject: "Backlog", value: backlogRisk, fullMark: 100 },
        { subject: "Stagnation", value: stagnationRisk, fullMark: 100 },
      ]
    },
    activity: recentActivity
  }
}