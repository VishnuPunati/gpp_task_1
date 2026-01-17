import fs from "fs";
import fetch from "node-fetch";

const STUDENT_ID = "22MH1A4259";
const REPO_URL = "https://github.com/VishnuPunati/gpp_task_1";
const API_URL =
  "https://eajeyq4r3zljoq4rpovy2nthda0vtjqf.lambda-url.ap-south-1.on.aws/";

const publicKey = fs.readFileSync("student_public.pem", "utf8");

async function requestSeed() {
  const payload = {
    student_id: STUDENT_ID,
    github_repo_url: REPO_URL,
    public_key: publicKey, // ✅ DO NOT escape newlines
  };

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(t);
  }

  const data = await res.json();

  fs.writeFileSync("encrypted_seed.txt", data.encrypted_seed);
  console.log("encrypted_seed.txt created successfully");
}

requestSeed().catch(console.error);
