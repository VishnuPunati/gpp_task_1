import fs from "fs/promises";
import crypto from "crypto";
import path from "path";

const DATA_DIR = process.cwd();
const PRIVATE_KEY_PATH = path.join(DATA_DIR, "student_private.pem");
const PUBLIC_KEY_PATH = path.join(DATA_DIR, "student_public.pem");

(async () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicExponent: 0x10001,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  await fs.writeFile(PRIVATE_KEY_PATH, privateKey, { mode: 0o600 });
  await fs.writeFile(PUBLIC_KEY_PATH, publicKey, { mode: 0o644 });

  console.log("✅ Fresh student RSA keys generated");
})();
