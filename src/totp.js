import fs from "fs/promises";
import path from "path";
import { authenticator } from "otplib";
import { SEED_PATH } from "./crypto-utils.js";

authenticator.options = {
  step: 30,
  digits: 6,
  algorithm: "sha1",
  window: 1,
};

export async function readSeed() {
  try {
    const s = await fs.readFile(SEED_PATH, "utf8");
    const seed = s.trim();
    if (!seed) throw new Error("Seed_Empty");
    return seed;
  } catch (error) {
    throw new Error("seed_missing");
  }
}
 
export async function generateOTP() {
  const seed = await readSeed();
  const token = authenticator.generate(seed);
  const epoch = Math.floor(Date.now() / 1000);
  const valid_for = 30 - (epoch % 30);
  return { code: token, valid_for };
}
 
export async function verifyOTP(code) {
  if (typeof code !== "string" && typeof code !== "number")
    throw new Error("invalid_code");

  const token = String(code).trim();
  if (token.length === 0) throw new Error("invalid_code");

  const seed = await readSeed();
  if (!seed) throw new Error("seed_missing");

  try {
    const valid = authenticator.check(token, seed);
    return !!valid;
  } catch (err) {
    console.error("authenticator.check error:", err?.message || err);
    throw new Error("invalid_code");
  }
}
