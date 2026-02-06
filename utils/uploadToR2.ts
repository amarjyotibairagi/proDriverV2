export async function uploadToR2(file: File, folderPath: string): Promise<string> {
    // 1. Request the secure URL from your Next.js API
    const res = await fetch("/api/storage/sign", {
        method: "POST",
        body: JSON.stringify({
            filename: file.name,
            fileType: file.type,
            folder: folderPath,
        }),
    });

    if (!res.ok) {
        throw new Error("Failed to get signed URL");
    }

    const { uploadUrl, publicUrl } = await res.json();

    // 2. Upload directly to Cloudflare R2 (Bypassing Vercel limits)
    const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
            "Content-Type": file.type,
        },
    });

    if (!uploadRes.ok) {
        throw new Error("Failed to upload file to R2");
    }

    return publicUrl;
}
