
import { SignJWT, jwtVerify } from "jose";

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
