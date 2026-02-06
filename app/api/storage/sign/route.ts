import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client } from "@/lib/r2";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { filename, fileType, folder } = body;

        // Create a unique file path: module_1/audio/ar/slide1.mp3
        // Ensure folder doesn't have leading/trailing slashes if verified, but here we just use it
        const key = folder ? `${folder}/${filename}` : filename;

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            ContentType: fileType,
        });

        // Generate a secure URL valid for 60 seconds
        const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 60 });

        return NextResponse.json({
            uploadUrl: signedUrl,
            publicUrl: `${process.env.R2_PUBLIC_DOMAIN}/${key}`
        });
    } catch (error) {
        console.error("Error signing URL:", error);
        return NextResponse.json({ error: "Failed to sign URL" }, { status: 500 });
    }
}
