'use server'

import { prisma } from "@/lib/prisma"
import { getSession } from "@/app/actions/auth"
import { revalidatePath } from "next/cache"
import { TrainingStatus, TestStatus } from "../../generated/prisma-client"
import { createNotification } from "./notifications"

/**
 * Mark a training module as completed for the current driver.
 */
export async function completeTrainingAction(moduleId: number) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return { success: false, error: "Not authenticated" };
        }

        // session.userId is the EMPLOYEE_ID string from the JWT
        const user = await prisma.user.findUnique({
            where: { employee_id: session.userId },
            select: { id: true }
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        await prisma.trainingAssignment.update({
            where: {
                user_id_module_id: {
                    user_id: user.id,
                    module_id: moduleId
                }
            },
            data: {
                training_status: TrainingStatus.COMPLETED,
                completion_date: new Date()
            }
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error completing training:", error);
        return { success: false, error: "Database update failed" };
    }
}

/**
 * Mark a test/assessment as completed with a specific score.
 */
export async function completeTestAction(moduleId: number, score: number) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return { success: false, error: "Not authenticated" };
        }

        const user = await prisma.user.findUnique({
            where: { employee_id: session.userId },
            select: { id: true }
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        // Fetch the module to check pass marks
        const moduleDoc = await prisma.module.findUnique({
            where: { id: moduleId },
            select: { pass_marks: true }
        });

        if (!moduleDoc) {
            return { success: false, error: "Module not found" };
        }

        const isPassed = score >= moduleDoc.pass_marks;

        await prisma.trainingAssignment.update({
            where: {
                user_id_module_id: {
                    user_id: user.id,
                    module_id: moduleId
                }
            },
            data: {
                test_status: isPassed ? TestStatus.PASSED : TestStatus.FAILED,
                training_status: isPassed ? TrainingStatus.COMPLETED : TrainingStatus.NOT_STARTED,
                marks_obtained: score,
                completion_date: isPassed ? new Date() : null
            }
        });

        // Failure Rate Analysis Trigger
        if (!isPassed) {
            const [total, failed] = await Promise.all([
                prisma.trainingAssignment.count({ where: { module_id: moduleId } }),
                prisma.trainingAssignment.count({ where: { module_id: moduleId, test_status: 'FAILED' } })
            ]);

            const rate = total > 0 ? failed / total : 0;
            // Threshold: >30% failure rate and at least 5 students have taken it
            if (total >= 5 && rate > 0.3) {
                await createNotification({
                    type: 'CRITICAL',
                    title: 'High Failure Rate Detected',
                    message: `Module (ID: ${moduleId}) has a failure rate of ${(rate * 100).toFixed(1)}%. Check content difficulty.`,
                    targetRole: 'ADMIN',
                    link: `/admin/reports`
                });
            }
        }

        revalidatePath('/dashboard');
        return { success: true, isPassed, passMarks: moduleDoc.pass_marks };
    } catch (error) {
        console.error("Error completing test:", error);
        return { success: false, error: "Database update failed" };
    }
}
