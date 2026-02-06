'use server'

import { prisma } from "@/lib/prisma"
import { createNotification } from "./notifications"
import { r2Client } from "@/lib/r2"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { revalidatePath } from "next/cache"

/**
 * Generates a presigned URL for uploading a CSV to R2.
 */
export async function getImportPresignedUrl(fileName: string, contentType: string) {
    try {
        const key = `imports/users/${Date.now()}-${fileName}`;
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            ContentType: contentType,
        });

        const url = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
        return { success: true, url, key };
    } catch (error) {
        console.error("Presigned URL Error:", error);
        return { success: false, error: "Failed to generate upload URL" };
    }
}

/**
 * Processes the mapped CSV data and creates users.
 */
export async function processUserImport(data: any[]) {
    try {
        // Fetch existing master data to map names to IDs
        const [departments, locations, designations] = await Promise.all([
            prisma.department.findMany(),
            prisma.location.findMany(),
            prisma.designation.findMany(),
        ]);

        const createdUsers = [];
        const errors = [];

        for (const item of data) {
            try {
                // Simple validation
                if (!item.employee_id) {
                    errors.push(`Row missing required fields: ${JSON.stringify(item)}`);
                    continue;
                }

                // Helper to clean empty variations from CSV
                const clean = (val: any) => (val && val.toString().trim() !== '' ? val.toString().trim() : undefined);

                // Map master data names to IDs if provided
                const dept = departments.find(d => d.name.toLowerCase() === item.department?.toLowerCase());
                const loc = locations.find(l => l.name.toLowerCase() === item.location?.toLowerCase());
                const hLoc = locations.find(l => l.name.toLowerCase() === item.home_location?.toLowerCase());

                await prisma.user.create({
                    data: {
                        employee_id: item.employee_id.toString(),
                        full_name: item.full_name || item.employee_id.toString(), // Fallback to ID if name is missing
                        email: clean(item.email),
                        mobile_number: clean(item.mobile_number),
                        company: clean(item.company) || "Mowasalat", // Default matches previous logic, but cleaned
                        role: (item.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'BASIC'),
                        password_hash: null as any,

                        department_id: dept?.id || undefined,
                        assigned_location_id: loc?.id || undefined,
                        home_location_id: hLoc?.id || undefined,
                    }
                });
                createdUsers.push(item.employee_id);
            } catch (e: any) {
                // Check for unique constraint violation manually if needed, or just let it fall here
                if (e.code === 'P2002') {
                    errors.push(`User ${item.employee_id} already exists.`);
                } else {
                    errors.push(`Error creating user ${item.employee_id}: ${e.message}`);
                }
            }
        }

        const results = { createdCount: createdUsers.length, errors };

        if (errors.length > 0) {
            await createNotification({
                type: 'CRITICAL',
                title: 'User Import Issues',
                message: `Import completed with ${errors.length} errors. ${results.createdCount} users created successfully.`,
                targetRole: 'ADMIN',
                link: '/admin/users'
            });
        }

        revalidatePath('/admin/users');
        return { success: true, ...results };
    } catch (error: any) {
        console.error("Import Processing Error:", error);
        return { success: false, error: error.message };
    }
}
