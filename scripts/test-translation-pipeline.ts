const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

import { r2Client } from "../lib/r2";
import { openai, OPENAI_MODEL } from "../lib/openai";
import { PutObjectCommand } from "@aws-sdk/client-s3";

async function testPipeline() {
    console.log("Starting Test Pipeline...");

    // 1. Test Credentials
    if (!process.env.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");
    if (!process.env.R2_ACCESS_KEY_ID) throw new Error("Missing R2_ACCESS_KEY_ID");

    const TEST_ID = 99999;
    const exportData = {
        metadata: {
            title: "Test Module",
            slug: "test-module",
            exported_at: new Date().toISOString(),
            instructions: "Translate to French only for test",
            supported_languages: [{ code: 'fr', name: 'French', direction: 'ltr' }]
        },
        slides: [
            { id: "1", content: "Hello world" }
        ]
    };

    try {
        // 2. Test R2 Upload
        console.log("Testing R2 Upload...");
        const key = `test/${TEST_ID}_source.json`;
        await r2Client.send(new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            Body: JSON.stringify(exportData),
            ContentType: "application/json"
        }));
        console.log("R2 Upload Success:", key);

        // 3. Test OpenAI
        console.log("Testing OpenAI...");
        const completion = await openai.chat.completions.create({
            model: OPENAI_MODEL,
            messages: [
                { role: "system", content: "You are a translator. Return JSON." },
                { role: "user", content: "Translate 'Hello' to French. JSON format: { translations: { fr: { slides: { '1': { content: 'Bonjour' } } } } }" }
            ],
            response_format: { type: "json_object" }
        });
        console.log("OpenAI Response:", completion.choices[0].message.content);

    } catch (e) {
        console.error("Pipeline Failed:", e);
    }
}

testPipeline();
