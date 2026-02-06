'use server'

import { prisma } from "@/lib/prisma"
import { format } from "date-fns"

// --- HELPERS ---
const clean = (text: string | null | undefined) => {
    if (!text) return ""
    // Escape quotes and handle commas
    return `"${text.replace(/"/g, '""')}"`
}

const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Pending"
    return format(date, "dd-MMM-yyyy")
}

// --- 1. EXPORT USERS ---
export async function exportUsersCSV(type: 'active' | 'pending' | 'all') {
    try {
        const whereClause: any = { is_test_account: false }
        if (type === 'active') whereClause.password_hash = { not: null }
        else if (type === 'pending') whereClause.password_hash = null

        const users = await prisma.user.findMany({
            where: whereClause,
            include: {
                department: true,
                designation: true,
                home_location: true,
                assigned_location: true
            },
            orderBy: { employee_id: 'asc' }
        })

        const headers = ['Employee ID', 'Full Name', 'Role', 'Email', 'Mobile', 'Department', 'Designation', 'Home Depot', 'Assigned Site', 'Status']

        const rows = users.map(u => [
            clean(u.employee_id),
            clean(u.full_name),
            clean(u.role),
            clean(u.email),
            clean(u.mobile_number),
            clean(u.department?.name),
            clean(u.designation?.name),
            clean(u.home_location?.name),
            clean(u.assigned_location?.name),
            u.password_hash ? "Active" : "Pending"
        ].join(','))

        return { success: true, csv: [headers.join(','), ...rows].join('\n'), filename: `users_${type}_${format(new Date(), 'ddMMMyy')}.csv` }
    } catch (error) {
        console.error("Export Users CSV Error:", error)
        return { success: false, error: "Failed to generate CSV" }
    }
}

// --- 2. EXPORT MODULES (Month-wise attendance) ---
export async function exportModulesCSV() {
    try {
        const modules = await prisma.module.findMany({
            orderBy: { title: 'asc' },
            include: {
                assignments: {
                    where: { user: { is_test_account: false } },
                    select: { completion_date: true }
                }
            }
        })

        // Identify all unique months present in data (e.g., "Jan24", "Feb24")
        const monthSet = new Set<string>()
        modules.forEach(m => {
            m.assignments.forEach(a => {
                if (a.completion_date) {
                    monthSet.add(format(a.completion_date, "MMMyy"))
                }
            })
        })
        const months = Array.from(monthSet).sort((a, b) => {
            // Simple sort override or custom logic needed if spanning years, 
            // but strictly string sort might fail for "Jan25" vs "Dec24". 
            // For now, let's keep it simple or sort by date value if re-parsing.
            return 0
        })

        const headers = ['Module ID', 'Module Name', ...months]

        const rows = modules.map(m => {
            const counts: Record<string, number> = {}
            m.assignments.forEach(a => {
                if (a.completion_date) {
                    const key = format(a.completion_date, "MMMyy")
                    counts[key] = (counts[key] || 0) + 1
                }
            })

            const monthCols = months.map(mon => counts[mon] || 0)

            return [
                m.id,
                clean(m.title),
                ...monthCols
            ].join(',')
        })

        return { success: true, csv: [headers.join(','), ...rows].join('\n'), filename: `modules_analytics_${format(new Date(), 'ddMMMyy')}.csv` }

    } catch (error) {
        console.error("Export Modules CSV Error:", error)
        return { success: false, error: "Failed to generate CSV" }
    }
}

// --- 3. EXPORT ASSIGNMENTS ---
export async function exportAssignmentsCSV() {
    try {
        const assignments = await prisma.trainingAssignment.findMany({
            where: { user: { is_test_account: false } },
            include: {
                user: true,
                module: true
            },
            orderBy: { assigned_date: 'desc' }
        })

        const headers = ['SL.No', 'User Name', 'Employee ID', 'Module ID', 'Module Name', 'Assigned Date', 'Training Finished', 'Test Finished', 'Marks', 'Result']

        const rows = assignments.map((a, idx) => [
            idx + 1,
            clean(a.user.full_name),
            clean(a.user.employee_id),
            a.module_id,
            clean(a.module.title),
            formatDate(a.assigned_date),
            a.training_status === 'COMPLETED' ? formatDate(a.completion_date) : "Pending",
            a.test_status === 'PASSED' || a.test_status === 'FAILED' ? formatDate(a.completion_date) : "Pending", // Assuming completion date is same for list
            a.test_status === 'PASSED' || a.test_status === 'FAILED' ? a.marks_obtained : "Pending",
            a.test_status === 'PASSED' ? "Pass" : a.test_status === 'FAILED' ? "Fail" : "Pending"
        ].join(','))

        return { success: true, csv: [headers.join(','), ...rows].join('\n'), filename: `assignments_report_${format(new Date(), 'ddMMMyy')}.csv` }

    } catch (error) {
        console.error("Export Assignments CSV Error:", error)
        return { success: false, error: "Failed to generate CSV" }
    }
}

// --- 4. EXPORT AUDIT LOGS ---
export async function exportAuditLogsCSV() {
    try {
        const logs = await prisma.auditLog.findMany({
            include: {
                actor: { select: { full_name: true, role: true } }
            },
            orderBy: { timestamp: 'desc' }
        })

        const headers = ['Timestamp', 'Actor', 'Role', 'Action', 'Target ID', 'Details']

        const rows = logs.map(log => [
            format(log.timestamp, "dd-MMM-yyyy HH:mm:ss"),
            clean(log.actor.full_name),
            clean(log.actor.role),
            clean(log.action),
            clean(log.target_id || "N/A"),
            clean(JSON.stringify(log.metadata || {}))
        ].join(','))

        return { success: true, csv: [headers.join(','), ...rows].join('\n'), filename: `audit_logs_${format(new Date(), 'ddMMMyy')}.csv` }

    } catch (error) {
        console.error("Export Audit Logs CSV Error:", error)
        return { success: false, error: "Failed to generate CSV" }
    }
}
