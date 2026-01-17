import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export const DATA_DIR = path.resolve(process.env.DATA_DIR || "/data");

export const PRIVATE_KEY_PATH = path.resolve("student_private.pem");
export const PUBLIC_KEY_PATH = path.resolve("student_public.pem");
export const SEED_PATH = path.join(DATA_DIR, "seed.txt");

/* =========================
   Keys must EXIST (no regen)
   ========================= */
export async function ensureKeys() {
  await fs.access(PRIVATE_KEY_PATH);
  await fs.access(PUBLIC_KEY_PATH);
}

/* =========================
   Decrypt seed (RSA-OAEP)
   Store HEX (64 chars)
   ========================= */
export async function decryptSeedAndStore(base64Encrypted) {
  const privateKeyPem = await fs.readFile(PRIVATE_KEY_PATH, "utf8");
  const encryptedBuffer = Buffer.from(base64Encrypted, "base64");

  let decrypted;
  try {
    decrypted = crypto.privateDecrypt(
      {
        key: privateKeyPem,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      encryptedBuffer,
    );
  } catch (err) {
    throw new Error("Decryption failed");
  }

  const hexSeed = decrypted.toString("utf8").trim();

  // STRICT validation
  if (!/^[0-9a-f]{64}$/.test(hexSeed)) {
    throw new Error("Invalid seed format");
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SEED_PATH, hexSeed, { mode: 0o600 });

  return hexSeed;
}

/* =========================
   Sign commit hash (RSA-PSS)
   ASCII bytes ONLY
   ========================= */
export async function signCommitHash(commitHash) {
  if (!/^[0-9a-f]{40}$/.test(commitHash)) {
    throw new Error("Invalid commit hash");
  }

  const privateKeyPem = await fs.readFile(PRIVATE_KEY_PATH, "utf8");

  // CRITICAL: ASCII, NOT hex
  const messageBuffer = Buffer.from(commitHash, "utf8");

  return crypto.sign("sha256", messageBuffer, {
    key: privateKeyPem,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    saltLength: crypto.constants.RSA_PSS_SALTLEN_MAX,
  });
}

/* =========================
   Encrypt with public key
   (RSA-OAEP SHA-256)
   ========================= */
export function encryptWithPubPem(publicKeyPem, buffer) {
  return crypto.publicEncrypt(
    {
      key: publicKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    buffer,
  );
}

/* =========================
   Read public key
   ========================= */
export async function readPublicKey() {
  return fs.readFile(PUBLIC_KEY_PATH, "utf8");
}
