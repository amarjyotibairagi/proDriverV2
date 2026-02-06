
import { SignJWT, jwtVerify } from "jose";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// --- JWT LOGIC ---

const SECRET_KEY = process.env.SESSION_SECRET || "super-secret-key-change-me-in-prod";
const ENCODED_KEY = new TextEncoder().encode(SECRET_KEY);

export async function signSession(payload: any) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(ENCODED_KEY);
}

export async function verifySession(token: string) {
    try {
        const { payload } = await jwtVerify(token, ENCODED_KEY, {
            algorithms: ["HS256"],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

// --- AES ENCRYPTION LOGIC ---

// Ensure we have a consistent 32-byte key for AES-256
// In prod, this should definitely be in .env and NOT hardcoded fallback
const AES_SECRET = process.env.AES_SECRET || "12345678901234567890123456789012";
const ALGORITHM = "aes-256-cbc";

export function encryptData(text: string): string {
    if (!text) return text;
    const iv = randomBytes(16);
    const cipher = createCipheriv(ALGORITHM, Buffer.from(AES_SECRET), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    // Store as IV:EncryptedText
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptData(text: string): string {
    if (!text || !text.includes(":")) return text; // Return original if not encrypted format
    try {
        const [ivHex, encryptedHex] = text.split(":");
        const iv = Buffer.from(ivHex, "hex");
        const encryptedText = Buffer.from(encryptedHex, "hex");
        const decipher = createDecipheriv(ALGORITHM, Buffer.from(AES_SECRET), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) {
        console.error("Decryption failed:", e);
        return text; // Fallback? Or throw? Safest is to return what we have or null.
    }
}
