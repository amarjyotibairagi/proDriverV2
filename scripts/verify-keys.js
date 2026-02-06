
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const OpenAI = require("openai");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function verify() {
    console.log("--- Verifying Credentials ---");

    // 1. OpenAI
    if (!process.env.OPENAI_API_KEY) {
        console.error("❌ OPENAI_API_KEY missing");
    } else {
        try {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: "ping" }],
                max_tokens: 5
            });
            console.log("✅ OpenAI Connection Success:", completion.choices[0].message.content);
        } catch (e) {
            console.error("❌ OpenAI Connection Failed:", e.message);
        }
    }

    // 2. R2
    if (!process.env.R2_ACCESS_KEY_ID) {
        console.error("❌ R2 Credentials missing");
    } else {
        try {
            const r2 = new S3Client({
                region: "auto",
                endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
                credentials: {
                    accessKeyId: process.env.R2_ACCESS_KEY_ID,
                    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
                },
            });
            // Try to list buckets or put a test object
            await r2.send(new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: "connectivity-check.txt",
                Body: "OK"
            }));
            console.log("✅ R2 Connection Success (Write)");
        } catch (e) {
            console.error("❌ R2 Connection Failed:", e.message);
        }
    }
}

verify();
