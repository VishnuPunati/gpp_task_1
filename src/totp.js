import fs from "fs/promises";
import { authenticator } from "otplib";
import base32 from "hi-base32";
import { SEED_PATH } from "./crypto-utils.js";

/* =========================
   TOTP configuration
   ========================= */
authenticator.options = {
  step: 30,
  digits: 6,
  algorithm: "sha1",
  window: 1, // ±1 time step
};

/* =========================
   Read HEX seed
   ========================= */
async function readHexSeed() {
  try {
    const data = await fs.readFile(SEED_PATH, "utf8");
    const seed = data.trim();

    if (!/^[0-9a-f]{64}$/.test(seed)) {
      throw new Error("Invalid seed format");
    }

    return seed;
  } catch {
    throw new Error("seed_missing");
  }
}

/* =========================
   HEX → BASE32
   ========================= */
function hexToBase32(hexSeed) {
  const buffer = Buffer.from(hexSeed, "hex");
  return base32.encode(buffer).replace(/=+$/g, "").toUpperCase();
}

/* =========================
   Generate TOTP
   ========================= */
export async function generateOTP() {
  const hexSeed = await readHexSeed();
  const base32Seed = hexToBase32(hexSeed);

  const code = authenticator.generate(base32Seed);

  const epoch = Math.floor(Date.now() / 1000);
  const valid_for = 30 - (epoch % 30);

  return { code, valid_for };
}

/* =========================
   Verify TOTP
   ========================= */
export async function verifyOTP(code) {
  if (typeof code !== "string") {
    throw new Error("invalid_code");
  }

  const token = code.trim();
  if (!/^\d{6}$/.test(token)) {
    throw new Error("invalid_code");
  }

  const hexSeed = await readHexSeed();
  const base32Seed = hexToBase32(hexSeed);

  const valid = authenticator.check(token, base32Seed);
  return !!valid;
}
