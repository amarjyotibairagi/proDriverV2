const fs = require('fs');
const path = require('path');
const { S3Client, PutBucketCorsCommand } = require('@aws-sdk/client-s3');

// Load .env manually to avoid extra dependencies
const envPath = path.resolve(__dirname, '../.env');
try {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        // Simple parsing
        if (!line || line.startsWith('#')) return;
        const eqIdx = line.indexOf('=');
        if (eqIdx > 0) {
            const key = line.slice(0, eqIdx).trim();
            const value = line.slice(eqIdx + 1).trim().replace(/^"|"$/g, '');
            process.env[key] = value;
        }
    });
} catch (e) {
    console.error("Could not read .env file", e);
    process.exit(1);
}

if (!process.env.R2_ACCOUNT_ID) {
    console.error("Missing R2_ACCOUNT_ID in .env");
    process.exit(1);
}

const client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const run = async () => {
    try {
        console.log("Setting CORS configuration for bucket:", process.env.R2_BUCKET_NAME);
        const command = new PutBucketCorsCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            CORSConfiguration: {
                CORSRules: [
                    {
                        AllowedHeaders: ["*"],
                        AllowedMethods: ["PUT", "GET", "HEAD", "POST", "DELETE"],
                        AllowedOrigins: ["*"],
                        ExposeHeaders: ["ETag"],
                        MaxAgeSeconds: 3000
                    }
                ]
            }
        });
        await client.send(command);
        console.log("Successfully updated CORS configuration.");
    } catch (err) {
        console.error("Error setting CORS:", err);
    }
};

run();
