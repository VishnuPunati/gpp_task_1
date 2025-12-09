
import crypto from "crypto";
import base32 from "hi-base32";


export function generateHex64Seed() {
  return crypto.randomBytes(32).toString("hex"); 
}

export function generateBase32Seed(noPadding = true) {
  const buf = crypto.randomBytes(20); 
  let s = base32.encode(buf);
  if (noPadding) s = s.replace(/=+$/g, "");
  return s.toUpperCase();
}
