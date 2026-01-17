import fs from "fs";
import crypto from "crypto";

// 🔴 PASTE YOUR COMMIT HASH HERE
const COMMIT_HASH = "PASTE_COMMIT_HASH_HERE";

// Load keys
const studentPrivateKey = fs.readFileSync("student_private.pem", "utf8");
const instructorPublicKey = fs.readFileSync("instructor_public.pem", "utf8");

// 1️⃣ SIGN COMMIT HASH (ASCII, RSA-PSS-SHA256)
const signature = crypto.sign("sha256", Buffer.from(COMMIT_HASH, "utf8"), {
  key: studentPrivateKey,
  padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
  saltLength: crypto.constants.RSA_PSS_SALTLEN_MAX,
});

// 2️⃣ ENCRYPT SIGNATURE (RSA-OAEP-SHA256)
const encryptedSignature = crypto.publicEncrypt(
  {
    key: instructorPublicKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: "sha256",
  },
  signature,
);

// 3️⃣ BASE64 (SINGLE LINE)
fs.writeFileSync("commit_sign.txt", encryptedSignature.toString("base64"));

console.log("✅ commit_sign.txt generated successfully");
