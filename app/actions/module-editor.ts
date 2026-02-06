"use server";

import { r2Client } from "@/lib/r2";
import { PutObjectCommand, CopyObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@/lib/prisma";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notifications";
import AdmZip from 'adm-zip';

// --- UTILITY: Rename Folder (Move Objects) ---
async function renameR2Folder(oldPrefix: string, newPrefix: string) {
    console.log(`[R2 Rename] Starting move from ${oldPrefix} to ${newPrefix}`);
    try {
        let continuationToken: string | undefined = undefined;
        do {
            const listCommand: any = new ListObjectsV2Command({
                Bucket: process.env.R2_BUCKET_NAME,
                Prefix: oldPrefix,
                ContinuationToken: continuationToken
            });
            const listRes: any = await r2Client.send(listCommand);

            if (listRes.Contents) {
                for (const object of listRes.Contents) {
                    if (!object.Key) continue;
                    const newKey = object.Key.replace(oldPrefix, newPrefix);

                    // Copy
                    await r2Client.send(new CopyObjectCommand({
                        Bucket: process.env.R2_BUCKET_NAME,
                        CopySource: `${process.env.R2_BUCKET_NAME}/${object.Key}`,
                        Key: newKey,
                        ContentType: "application/octet-stream" // Ideally preserve original, but Copy usually handles metadata
                    }));

                    // Delete Original
                    await r2Client.send(new DeleteObjectCommand({
                        Bucket: process.env.R2_BUCKET_NAME,
                        Key: object.Key
                    }));
                }
            }
            continuationToken = (listRes as any).NextContinuationToken;
        } while (continuationToken);

        console.log(`[R2 Rename] Successfully moved ${oldPrefix} to ${newPrefix}`);
        return true;
    } catch (e) {
        console.error("[R2 Rename] Failed:", e);
        return false;
    }
}

// --- ACTION A: Get Presigned URL ---
export async function getPresignedUrlAction(
    filename: string, // Client should pass: <slide_no>_<element_id>.<ext> ideally
    fileType: string,
    context?: { moduleId: string | number, mode: 'training' | 'test' | 'assessment', encryptionSpec?: string }
) {
    try {
        let key = "";

        if (context) {
            // New Structured Path: <moduleId>/<training|test>/image/<filename>
            // Ensure mode is 'training' or 'test' (map assessment->test)
            const modeFolder = (context.mode === 'assessment' || context.mode === 'test') ? 'test' : 'training';

            // Clean filename just in case
            const cleanFilename = filename.replace(/[^a-z0-9._-]/gi, '_');

            key = `${context.moduleId}/${modeFolder}/image/${cleanFilename}`;
        } else {
            // Fallback
            key = `modules/${Date.now()}-${filename}`;
        }

        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            ContentType: fileType,
        });

        const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 60 });

        return {
            success: true,
            uploadUrl: signedUrl,
            publicUrl: `${process.env.R2_PUBLIC_DOMAIN}/${key}`,
        };
    } catch (error) {
        console.error("Presigned URL Error:", error);
        return { success: false, error: "Failed to generate upload URL" };
    }
}

// --- ACTION K: Server-side Asset Upload (Bypasses CORS) ---
export async function uploadModuleAssetAction(
    formData: FormData,
    context?: { moduleId: string | number, mode: 'training' | 'test' | 'assessment' }
) {
    const file = formData.get('file') as File;
    if (!file) return { success: false, error: "No file provided" };

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        let key = "";

        if (context) {
            const modeFolder = (context.mode === 'assessment' || context.mode === 'test') ? 'test' : 'training';
            const cleanFilename = file.name.replace(/[^a-z0-9._-]/gi, '_');
            key = `${context.moduleId}/${modeFolder}/image/${cleanFilename}`;
        } else {
            key = `assets/${Date.now()}-${file.name.replace(/[^a-z0-9._-]/gi, '_')}`;
        }

        await r2Client.send(new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: file.type,
        }));

        return {
            success: true,
            publicUrl: `${process.env.R2_PUBLIC_DOMAIN}/${key}`,
        };
    } catch (error) {
        console.error("Server Upload Error:", error);
        return { success: false, error: "Failed to upload file to storage" };
    }
}

// --- ACTION B: Generate Audio Assets ---
// ... (VOICE_MAP remains) ...
const VOICE_MAP: Record<string, string> = {
    en: "en-US-AvaNeural",          // English (Female - US)
    ar: "ar-SA-ZariyahNeural",      // Arabic (Female - Saudi Arabia)
    hi: "hi-IN-SwaraNeural",        // Hindi (Female)
    ur: "ur-PK-UzmaNeural",         // Urdu (Female)
    ml: "ml-IN-SobhanaNeural",      // Malayalam (Female)
    ta: "ta-IN-PallaviNeural",      // Tamil (Female)
    te: "te-IN-ShrutiNeural",       // Telugu (Female)
    kn: "kn-IN-SapnaNeural",        // Kannada (Female)
    bn: "bn-BD-NabanitaNeural",     // Bengali (Female)
    ps: "ps-AF-LatifaNeural",       // Pashto (Female)
    si: "si-LK-ThiliniNeural",      // Sinhala (Female)
    or: "or-IN-SubhasiniNeural",    // Odia (Female)
    ne: "ne-NP-HemkalaNeural",      // Nepali (Female)
    tl: "fil-PH-BlessicaNeural",    // Tagalog (Female)
    ro: "ro-RO-AlinaNeural",        // Romanian (Female)
    zh: "zh-CN-XiaoxiaoNeural",     // Chinese (Female - Mandarin)
    sw: "sw-KE-ZuriNeural",         // Swahili (Female - Kenya)
};

export async function generateAudioAssets(
    text: string,
    languageCode: string = "en",
    context?: { moduleSlug?: string, moduleId?: string | number, mode?: 'training' | 'test' | 'assessment', slideIndex: string | number }
) {
    if (!process.env.AZURE_SPEECH_KEY || !process.env.AZURE_SPEECH_REGION) {
        return { success: false, error: "Azure Speech credentials missing" };
    }

    const speechConfig = sdk.SpeechConfig.fromSubscription(
        process.env.AZURE_SPEECH_KEY,
        process.env.AZURE_SPEECH_REGION
    );

    const targetVoice = VOICE_MAP[languageCode] || "en-US-AvaNeural";
    speechConfig.speechSynthesisVoiceName = targetVoice;

    return new Promise<{ success: boolean; url?: string; error?: string }>((resolve) => {
        const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

        synthesizer.speakTextAsync(
            text,
            async (result) => {
                if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                    const audioBuffer = Buffer.from(result.audioData);

                    // Determine Key
                    let key = "";
                    if (context?.moduleId && context?.mode && context?.slideIndex) {
                        // New Structured Path: <moduleId>/<mode>/audio/<slide_no>_<lang>.mp3
                        const modeFolder = (context.mode === 'assessment' || context.mode === 'test') ? 'test' : 'training';
                        // Clean slide index (remove 's' or anything non-numeric just in case, or trust caller)
                        key = `${context.moduleId}/${modeFolder}/audio/${context.slideIndex}_${languageCode.toUpperCase()}.mp3`;
                    } else if (context?.moduleSlug) {
                        // Fallback / legacy path
                        const safeSlug = context.moduleSlug.replace(/[^a-z0-9-]/gi, '_').toLowerCase();
                        key = `${safeSlug}/audio/s${context.slideIndex}/s${context.slideIndex}_${languageCode}.mp3`;
                    } else {
                        key = `audio/${languageCode}/${Date.now()}.mp3`;
                    }

                    try {
                        await r2Client.send(new PutObjectCommand({
                            Bucket: process.env.R2_BUCKET_NAME,
                            Key: key,
                            Body: audioBuffer,
                            ContentType: "audio/mpeg"
                        }));

                        const publicUrl = `${process.env.R2_PUBLIC_DOMAIN}/${key}`;
                        synthesizer.close();
                        resolve({ success: true, url: publicUrl });

                    } catch (uploadError) {
                        console.error("R2 Upload Error:", uploadError);
                        synthesizer.close();
                        resolve({ success: false, error: "Failed to upload audio to storage" });
                    }

                } else {
                    console.error("Speech Synthesis Failed:", result.errorDetails);
                    synthesizer.close();
                    resolve({ success: false, error: "Speech synthesis failed: " + result.errorDetails });
                }
            },
            (error) => {
                console.error("Synthesizer Error:", error);
                synthesizer.close();
                resolve({ success: false, error: "Synthesizer error" });
            }
        );
    });
}

// --- ACTION I: Upload Translation JSON ---
export async function uploadTranslationFile(
    moduleId: number,
    moduleName: string,
    mode: 'training' | 'test' | 'assessment',
    type: 'source' | 'languages',
    content: string
) {
    try {
        // Filename: <module ID>_<module name>_<training/test>_<Suffix>
        // Suffix: Tmp_EN.js (source) OR Languages.js (import)

        const modeFolder = (mode === 'assessment' || mode === 'test') ? 'test' : 'training';
        const safeName = moduleName.replace(/[^a-z0-9]/gi, '_');
        const suffix = type === 'source' ? 'Tmp_EN.js' : 'Languages.js';

        // Structure requirement: <id>_<title>_<training/test>_<suffix>
        const filename = `${moduleId}_${safeName}_${modeFolder}_${suffix}`;

        // Path: <module ID>/<filename>
        const key = `${moduleId}/${filename}`;

        await r2Client.send(new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: key,
            Body: Buffer.from(content),
            ContentType: "application/javascript"
        }));

        return {
            success: true,
            url: `${process.env.R2_PUBLIC_DOMAIN}/${key}`
        };
    } catch (error) {
        console.error("Upload Translation Error:", error);
        return { success: false, error: "Failed to upload translation file" };
    }
}

// --- ACTION G: Get Available Modules (For Linking) ---
export async function getAvailableModules() {
    try {
        const modules = await prisma.module.findMany({
            select: {
                id: true,
                title: true,
                type: true
            } as any,
            orderBy: {
                title: 'asc'
            }
        });
        return { success: true, data: modules };
    } catch (error) {
        console.error("Get Available Modules Error:", error);
        return { success: false, error: "Failed to fetch modules" };
    }
}

// --- ACTION C: Save Module ---
export async function saveModule(id: number | null, data: any, action: 'save' | 'publish' = 'save') {
    try {
        const { title, slug, content, type, linked_module_id, pass_marks, total_marks } = data;
        let isPublished = data.isPublished !== undefined ? data.isPublished : (data.is_published || false);

        let moduleId = id;

        // Handle ID Collision / New Module
        // The client might be uploading assets to a 'predicted' ID (e.g. maxId + 1)
        // If we insert and get a different ID, we must move those assets.
        // NOTE: This checks if we are CREATING a new module
        let pendingRenameFromId: number | null = null;

        if (!moduleId) {
            // New Module Insertion
            const newModule = await prisma.module.create({
                data: {
                    title,
                    slug: slug || `module-${Date.now()}`,
                    content: { ...content, training: content?.training || { slides: [] }, assessment: content?.assessment || { slides: [] } }, // Ensure structure
                    type: type || 'TRAINING',
                    linked_module_id: linked_module_id ? parseInt(linked_module_id) : null,
                    is_published: action === 'publish',
                    file_source: "generated",
                    total_marks: total_marks || 0,
                    pass_marks: pass_marks || 0,
                    duration_minutes: 0,
                    is_active: true
                } as any
            });
            moduleId = newModule.id;

            // If the client provided a 'predictedId' (via some hidden field or implicit logic), we'd check it.
            // Assumption: client was uploading to 'nextId'. 
            // We need to know what ID the client WAS using.
            // For now, let's assume the UI sends the 'tempId' if it was working on a draft.
            // However, the current UI logic asks for 'getNextModuleId' on mount.
            // If that ID was used for uploads, and 'moduleId' (database) is different, we rename.

            if (data.tempId && parseInt(data.tempId) !== moduleId) {
                pendingRenameFromId = parseInt(data.tempId);
            }
        } else {
            await prisma.module.update({
                where: { id: moduleId },
                data: {
                    title,
                    slug,
                    content,
                    type,
                    linked_module_id: linked_module_id ? parseInt(linked_module_id) : null,
                    is_published: action === 'publish',
                    pass_marks: pass_marks || 0,
                    total_marks: total_marks || 0,
                } as any
            });
        }

        if (pendingRenameFromId) {
            await renameR2Folder(`${pendingRenameFromId}/`, `${moduleId}/`);
        }

        // Always save content.json to R2 for modularity
        if (moduleId) {
            try {
                // Create comprehensive content.json with metadata
                const contentPackage = {
                    version: 1,
                    moduleId,
                    title,
                    slug,
                    type,
                    pass_marks: pass_marks || 0,
                    total_marks: total_marks || 0,
                    training: content?.training || { slides: [] },
                    assessment: content?.assessment || { slides: [] },
                    translations: content?.translations || {},
                    updatedAt: new Date().toISOString()
                };

                const jsonBuffer = Buffer.from(JSON.stringify(contentPackage, null, 2));
                const key = `${moduleId}/content.json`;

                await r2Client.send(new PutObjectCommand({
                    Bucket: process.env.R2_BUCKET_NAME,
                    Key: key,
                    Body: jsonBuffer,
                    ContentType: "application/json"
                }));

                // Update file_source to canonical location if not already
                const fileSource = `${process.env.R2_PUBLIC_DOMAIN}/${key}`;
                await prisma.module.update({
                    where: { id: moduleId },
                    data: { file_source: fileSource } as any
                });

                console.log(`[Modular Save] Uploaded content.json to ${key}`);
            } catch (uploadError) {
                console.warn("Failed to upload content.json to R2:", uploadError);
            }
        }

        revalidatePath("/admin/modules/provision");
        revalidatePath("/dashboard");
        if (moduleId) revalidatePath(`/play/${moduleId}`);

        // Notification Trigger
        if (action === 'publish' && moduleId) {
            await createNotification({
                type: 'INFO',
                title: 'New Training Module',
                message: `New module "${title}" is now available.`,
                targetRole: 'BASIC', // Notify all basic users
                link: `/play/${moduleId}`
            });
        }

        return { success: true, data: { id: moduleId, ...data, is_published: action === 'publish' } };
    } catch (error) {
        console.error("Save Module Error:", error);
        return { success: false, error: "Failed to save module" };
    }
}

// --- ACTION H: Create Linked Module ---
export async function createLinkedModule(sourceModuleId: number, targetType: 'TRAINING' | 'TEST') {
    try {
        const sourceModule = await prisma.module.findUnique({ where: { id: sourceModuleId } });
        if (!sourceModule) return { success: false, error: "Source module not found" };

        const newTitle = targetType === 'TEST'
            ? `Test: ${sourceModule.title}`
            : `Training: ${sourceModule.title}`;

        const newSlug = `${sourceModule.slug}-${targetType.toLowerCase()}-${Date.now()}`;

        // Create the new module
        const newModule = await prisma.module.create({
            data: {
                title: newTitle,
                slug: newSlug,
                type: targetType,
                linked_module_id: sourceModuleId, // Link to source
                content: { slides: [{ id: "1", title: "Introduction", content: "New Linked Module", type: "text" }] },
                is_published: false,
                file_source: "generated",
                pass_marks: 0,
                total_marks: 0,
                duration_minutes: 0,
                is_active: true
            } as any
        });

        // Update the source module to link to the new one
        await prisma.module.update({
            where: { id: sourceModuleId },
            data: { linked_module_id: newModule.id } as any
        });

        revalidatePath("/admin/modules/provision");
        return { success: true, data: newModule };
    } catch (error) {
        console.error("Create Linked Module Error:", error);
        return { success: false, error: "Failed to create linked module" };
    }
}

// --- ACTION D: Get Module ---
export async function getModule(id: number) {
    try {
        const module = await prisma.module.findUnique({
            where: { id },
        });

        // RECOVERY: If database content is missing/empty, try to fetch from R2
        if (module && (!module.content || (typeof module.content === 'object' && Object.keys(module.content as any).length === 0))) {
            const r2Domain = process.env.R2_PUBLIC_DOMAIN;

            // Try new canonical location first: <moduleId>/content.json
            if (r2Domain) {
                try {
                    const contentUrl = `${r2Domain}/${id}/content.json`;
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000);

                    const res = await fetch(contentUrl, {
                        signal: controller.signal,
                        cache: 'no-store'
                    });

                    clearTimeout(timeoutId);

                    if (res.ok) {
                        const fetchedContent = await res.json();
                        if (fetchedContent) {
                            // content.json has full structure, extract the content part
                            module.content = {
                                training: fetchedContent.training || { slides: [] },
                                assessment: fetchedContent.assessment || { slides: [] },
                                translations: fetchedContent.translations || {}
                            };
                            // Also restore metadata if available
                            if (fetchedContent.pass_marks) module.pass_marks = fetchedContent.pass_marks;
                            if (fetchedContent.total_marks) module.total_marks = fetchedContent.total_marks;
                            console.log(`[Recovery] Module ${id} content restored from ${contentUrl}`);
                        }
                    }
                } catch (recoveryError) {
                    console.warn(`[Recovery] Failed to fetch content.json for module ${id}:`, recoveryError);
                }
            }

            // Fallback: Try legacy file_source if content still empty
            if ((!module.content || Object.keys(module.content as any).length === 0) && module.file_source?.startsWith('http')) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 5000);

                    const res = await fetch(module.file_source, {
                        signal: controller.signal,
                        cache: 'no-store'
                    });

                    clearTimeout(timeoutId);

                    if (res.ok) {
                        const fetchedContent = await res.json();
                        if (fetchedContent) {
                            module.content = fetchedContent;
                            console.log(`[Recovery] Module ${id} content restored from legacy: ${module.file_source}`);
                        }
                    }
                } catch (recoveryError) {
                    console.warn(`[Recovery] Failed to fetch from legacy file_source for module ${id}:`, recoveryError);
                }
            }
        }

        return { success: true, data: module };
    } catch (error) {
        console.error("Get Module Error:", error);
        return { success: false, error: "Failed to fetch module" };
    }
}
// --- ACTION E: Get Audio Config ---
export async function getAudioConfig() {
    return {
        success: true,
        r2Domain: process.env.R2_PUBLIC_DOMAIN
    };
}

// --- ACTION F: Get Next ID ---
export async function getNextModuleId() {
    try {
        const result = await prisma.module.aggregate({
            _max: { id: true }
        });
        const nextId = (result._max.id || 0) + 1;
        return { success: true, data: nextId };
    } catch (error) {
        console.error("Get Next ID Error:", error);
        return { success: true, data: 1 };
    }
}

// --- ACTION G: Import Module ---
export async function importModule(formData: FormData) {
    const file = formData.get('file') as File;
    if (!file) {
        return { success: false, error: 'No file provided' };
    }

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const zip = new AdmZip(buffer);
        const zipEntries = zip.getEntries();

        // Look for the module json file (e.g. module-*.json)
        const jsonEntry = zipEntries.find(entry => entry.entryName.endsWith('.json') && entry.entryName.includes('module-'));

        if (!jsonEntry) {
            return { success: false, error: 'Invalid module archive: module-*.json not found' };
        }

        const jsonContent = jsonEntry.getData().toString('utf8');
        const moduleData = JSON.parse(jsonContent);

        // Sanitize data before creation to avoid conflicts or invalid fields
        // Remove ID to create a new one
        const { id, created_at, updated_at, ...creationData } = moduleData;

        // Ensure unique slug if possible (append timestamp)
        const newSlug = `${creationData.slug || 'imported-module'}-${Date.now()}`;

        const newModule = await prisma.module.create({
            data: {
                ...creationData,
                slug: newSlug,
                title: `${creationData.title || 'Imported Module'} (Copy)`,
                is_published: false // Reset publish status
            }
        });

    } catch (error) {
        console.error("Import Module Error:", error);
        return { success: false, error: "Failed to process module import" };
    }
}

// --- ACTION J: Generate AI Translations ---
import { openai, OPENAI_MODEL } from "@/lib/openai";
import { OPENAI_SYSTEM_PROMPT } from "@/lib/OpenAI_Prompt";

export async function generateModuleTranslations(
    moduleId: number,
    moduleTitle: string,
    mode: 'training' | 'assessment',
    exportData: any
) {
    try {
        // 1. Save Source File to R2 (Automated Export)
        const sourceJson = JSON.stringify(exportData, null, 2);
        const modeFolder = mode === 'assessment' ? 'test' : 'training';
        const safeName = moduleTitle.replace(/[^a-z0-9]/gi, '_');

        // Filename: <id>_<name>_<mode>_Tmp_EN.js
        const sourceKey = `${moduleId}/${moduleId}_${safeName}_${modeFolder}_Tmp_EN.js`;

        await r2Client.send(new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: sourceKey,
            Body: Buffer.from(sourceJson),
            ContentType: "application/javascript" // Keeping .js extension as per legacy pattern
        }));

        console.log(`[AI Translation] Saved source to ${sourceKey}`);

        // 2. Prepare OpenAI Prompt (Imported from lib/OpenAI_Prompt.ts)
        const systemPrompt = OPENAI_SYSTEM_PROMPT;

        // User message is strictly the JSON content
        const userContext = sourceJson;

        // 3. Call OpenAI
        const completion = await openai.chat.completions.create({
            model: OPENAI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContext }
            ],
            response_format: { type: "json_object" }
        });

        const translationResult = completion.choices[0].message.content;
        if (!translationResult) throw new Error("No response from OpenAI");

        // 4. Save Translation File to R2 (Automated Import)
        // Filename: <id>_<name>_<mode>_Languages.js
        const langKey = `${moduleId}/${moduleId}_${safeName}_${modeFolder}_Languages.js`;

        await r2Client.send(new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: langKey,
            Body: Buffer.from(translationResult),
            ContentType: "application/javascript"
        }));

        console.log(`[AI Translation] Saved translations to ${langKey}`);

        return {
            success: true,
            data: JSON.parse(translationResult)
        };

    } catch (error) {
        console.error("AI Translation Error:", error);
        return { success: false, error: "Failed to generate translations" };
    }
}
