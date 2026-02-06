
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// Ensure we have a consistent 32-byte key for AES-256
const AES_SECRET = process.env.AES_SECRET || "12345678901234567890123456789012";
const ALGORITHM = "aes-256-cbc";

export function encryptData(text: string): string {
    if (!text) return text;
    const iv = randomBytes(16);
    const cipher = createCipheriv(ALGORITHM, Buffer.from(AES_SECRET), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptData(text: string): string {
    if (!text || !text.includes(":")) return text;
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
        return text;
    }
}
