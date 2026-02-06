'use server'

import { prisma } from "@/lib/prisma"
import { Role } from "../../generated/prisma-client"

export async function getReportStats(
    dateRange?: { from?: Date | string, to?: Date | string },
    filters?: { depotId?: string, departmentId?: string }
) {
    try {
        const fromDate = dateRange?.from ? new Date(dateRange.from) : undefined
        const toDate = dateRange?.to ? new Date(dateRange.to) : undefined

        // Common filter for completed activities
        const completionDateFilter = (fromDate || toDate) ? {
            completion_date: {
                gte: fromDate,
                lte: toDate
            }
        } : {}

        // Common filter for any activity (updates)
        const activityDateFilter = (fromDate || toDate) ? {
            updatedAt: {
                gte: fromDate,
                lte: toDate
            }
        } : {}

        // User Scope Filter
        const userScope: any = {
            is_test_account: false
        }
        if (filters?.depotId && filters.depotId !== 'all') userScope.home_location_id = filters.depotId
        if (filters?.departmentId && filters.departmentId !== 'all') userScope.department_id = filters.departmentId

        // Run independent queries in parallel
        const [trainingStats, testMestats, moduleScores, depots, teams] = await Promise.all([
            // 1. Training Completion Status
            prisma.trainingAssignment.groupBy({
                by: ['training_status'],
                _count: { id: true },
                where: { ...activityDateFilter, user: userScope }
            }),
            // 2. Test Results
            prisma.trainingAssignment.groupBy({
                by: ['test_status'],
                _count: { id: true },
                where: { test_status: { not: 'NOT_STARTED' }, ...completionDateFilter, user: userScope }
            }),
            // 3. Module Scores
            prisma.module.findMany({
                where: { is_active: true },
                select: {
                    title: true,
                    total_marks: true,
                    assignments: {
                        select: { marks_obtained: true },
                        where: {
                            test_status: { in: ['PASSED', 'FAILED'] },
                            ...completionDateFilter,
                            user: userScope
                        }
                    }
                },
                take: 20
            }),
            // 4. Depot Stats
            prisma.location.findMany({
                where: {
                    type: 'HOME',
                    id: filters?.depotId && filters.depotId !== 'all' ? filters.depotId : undefined
                },
                select: {
                    name: true,
                    users_home: {
                        where: userScope,
                        select: {
                            assignments_received: {
                                select: { training_status: true },
                                where: activityDateFilter
                            }
                        }
                    }
                }
            }),
            // 5. Team Stats
            prisma.department.findMany({
                where: {
                    id: filters?.departmentId && filters.departmentId !== 'all' ? filters.departmentId : undefined
                },
                select: {
                    name: true,
                    users: {
                        where: userScope,
                        select: {
                            assignments_received: {
                                select: { training_status: true },
                                where: activityDateFilter
                            }
                        }
                    }
                }
            })
        ])

        // Calculate averages
        const modulePerformance = moduleScores.map(m => {
            const sumOfMarks = m.assignments.reduce((sum, a) => sum + a.marks_obtained, 0)
            const count = m.assignments.length
            const totalPossible = count * (m.total_marks || 100)
            return {
                name: m.title,
                averageScore: totalPossible > 0 ? Math.round((sumOfMarks / totalPossible) * 100) : 0,
                attempts: count
            }
        })

        const depotStats = depots.map(d => {
            let completed = 0
            let total = 0
            d.users_home.forEach(u => {
                u.assignments_received.forEach(a => {
                    total++
                    if (a.training_status === 'COMPLETED') completed++
                })
            })
            return {
                name: d.name,
                completed,
                total,
                percentage: total > 0 ? Math.round((completed / total) * 100) : 0
            }
        }).filter(d => d.total > 0).sort((a, b) => b.percentage - a.percentage)

        const teamStats = teams.map(t => {
            let completed = 0
            let total = 0
            t.users.forEach(u => {
                u.assignments_received.forEach(a => {
                    total++
                    if (a.training_status === 'COMPLETED') completed++
                })
            })
            return {
                name: t.name,
                completed,
                total,
                percentage: total > 0 ? Math.round((completed / total) * 100) : 0
            }
        }).filter(t => t.total > 0).sort((a, b) => b.percentage - a.percentage)

        // 6. Summary Stats (KPI Cards)
        const totalUsers = await prisma.user.count({ where: { role: Role.BASIC, ...userScope } })
        const activeUsers = await prisma.user.count({
            where: {
                role: Role.BASIC,
                password_hash: { not: null },
                ...userScope
            }
        })

        // Calculate global average score (Filtered)
        const allCompletedAssignments = await prisma.trainingAssignment.findMany({
            where: {
                test_status: { in: ['PASSED', 'FAILED'] },
                ...completionDateFilter,
                user: userScope
            },
            select: { marks_obtained: true, module: { select: { total_marks: true } } }
        })

        let totalPercentageSum = 0
        allCompletedAssignments.forEach(a => {
            const max = a.module.total_marks || 100
            if (max > 0) {
                totalPercentageSum += (a.marks_obtained / max) * 100
            }
        })
        const averageScore = allCompletedAssignments.length > 0
            ? Math.round(totalPercentageSum / allCompletedAssignments.length)
            : 0

        // Calculate Global Pass Rate (Filtered)
        const totalTests = allCompletedAssignments.length

        // Count actually passed in DB with filter
        const actuallyPassed = await prisma.trainingAssignment.count({
            where: {
                test_status: 'PASSED',
                ...completionDateFilter,
                user: userScope
            }
        })
        const globalPassRate = totalTests > 0 ? Math.round((actuallyPassed / totalTests) * 100) : 0

        return {
            summary: {
                totalWorkforce: totalUsers,
                activeComponents: activeUsers,
                averageScore,
                globalPassRate
            },
            trainingStats: trainingStats.map(s => ({ status: String(s.training_status), count: s._count.id })),
            testStats: testMestats.map(s => ({ status: String(s.test_status), count: s._count.id })),
            modulePerformance,
            depotStats,
            teamStats
        }

    } catch (error) {
        console.error("Get Report Stats Error:", error)
        return {
            summary: { totalWorkforce: 0, activeComponents: 0, averageScore: 0, globalPassRate: 0 },
            trainingStats: [],
            testStats: [],
            modulePerformance: [],
            depotStats: [],
            teamStats: []
        }
    }
}

export async function getDrillDownData(params: {
    category: 'training_status' | 'test_status' | 'module_performance' | 'depot_stats' | 'team_stats' | 'inactive_users'
    value: string
    moduleId?: string
    dateRange?: { from?: Date | string, to?: Date | string }
}) {
    try {
        const fromDate = params.dateRange?.from ? new Date(params.dateRange.from) : undefined
        const toDate = params.dateRange?.to ? new Date(params.dateRange.to) : undefined

        const dateFilter = (fromDate || toDate) ? {
            completion_date: { gte: fromDate, lte: toDate }
        } : {}
        const activityFilter = (fromDate || toDate) ? {
            updatedAt: { gte: fromDate, lte: toDate }
        } : {}

        let users: any[] = []

        if (params.category === 'training_status') {
            const result = await prisma.trainingAssignment.findMany({
                where: {
                    training_status: params.value as any,
                    user: { is_test_account: false },
                    ...activityFilter
                },
                include: { user: true, module: true }
            })
            users = result.map(r => ({
                id: r.user.id,
                employeeId: r.user.employee_id,
                name: r.user.full_name,
                module: r.module.title,
                status: r.training_status,
                date: r.updatedAt
            }))
        }
        else if (params.category === 'test_status') {
            const result = await prisma.trainingAssignment.findMany({
                where: {
                    test_status: params.value as any,
                    user: { is_test_account: false },
                    ...dateFilter
                },
                include: { user: true, module: true }
            })
            users = result.map(r => ({
                id: r.user.id,
                employeeId: r.user.employee_id,
                name: r.user.full_name,
                module: r.module.title,
                status: r.test_status,
                score: r.marks_obtained,
                date: r.completion_date
            }))
        }
        else if (params.category === 'inactive_users') {
            const result = await prisma.user.findMany({
                where: {
                    role: Role.BASIC,
                    password_hash: null,
                    is_test_account: false
                }
            })
            users = result.map(u => ({
                id: u.id,
                employeeId: u.employee_id,
                name: u.full_name,
                status: 'PENDING',
                date: u.createdAt
            }))
        }

        return { success: true, data: users }

    } catch (error) {
        console.error("Drill Down Error:", error)
        return { success: false, error: "Failed to fetch drill-down data" }
    }
}

export async function getFilterOptions() {
    try {
        const [depots, departments] = await Promise.all([
            prisma.location.findMany({
                where: { type: 'HOME' },
                select: { id: true, name: true },
                orderBy: { name: 'asc' }
            }),
            prisma.department.findMany({
                select: { id: true, name: true },
                orderBy: { name: 'asc' }
            })
        ])

        return { depots, departments }
    } catch (error) {
        console.error("Failed to fetch filter options", error)
        return { depots: [], departments: [] }
    }
}
