import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { format } from "date-fns";
import { r2Client } from "../lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";

// --- CONFIG ---
const DATABASE_URL = process.env.DATABASE_URL;
const BUCKET_NAME = process.env.R2_BUCKET_NAME;

if (!DATABASE_URL) {
    console.error("❌ ERROR: DATABASE_URL is not defined.");
    process.exit(1);
}

if (!BUCKET_NAME) {
    console.error("❌ ERROR: R2_BUCKET_NAME is not defined.");
    process.exit(1);
}

async function runBackup() {
    const dateStr = format(new Date(), "yyyy-MM-dd");
    const fileName = `${dateStr}.sql.gz`;
    const localPath = path.join(process.cwd(), fileName);
    const r2Key = `DB_Backup/${fileName}`;

    console.log(`🚀 Starting backup for ${dateStr}...`);

    try {
        // 1. Run pg_dump
        // We use the DATABASE_URL directly if pg_dump supports it, 
        // or parse it if we need specific flags.
        console.log("📦 Dumping database...");
        execSync(`pg_dump "${DATABASE_URL}" | gzip > "${localPath}"`, { stdio: 'inherit' });

        // 2. Upload to R2
        console.log("☁️ Uploading to R2...");
        const fileBuffer = fs.readFileSync(localPath);

        await r2Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: r2Key,
            Body: fileBuffer,
            ContentType: "application/gzip",
        }));

        console.log(`✅ Backup successful: ${r2Key}`);

        // 3. Cleanup
        fs.unlinkSync(localPath);
        console.log("🧹 Local file cleaned up.");

    } catch (error) {
        console.error("❌ Backup failed:", error);
        if (fs.existsSync(localPath)) {
            fs.unlinkSync(localPath);
        }
        process.exit(1);
    }
}

runBackup();
