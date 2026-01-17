import fs from "fs/promises";
import path from "path";
import { generateOTP } from "./totp.js";

/* =========================
   Cron output directory
   ========================= */
const CRON_DIR = process.env.CRON_DIR || "/cron";
const LAST_CODE_PATH = path.join(CRON_DIR, "last_code.txt");

/* =========================
   Format UTC timestamp
   YYYY-MM-DD HH:MM:SS
   ========================= */
function getUtcTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");

  return (
    now.getUTCFullYear() +
    "-" +
    pad(now.getUTCMonth() + 1) +
    "-" +
    pad(now.getUTCDate()) +
    " " +
    pad(now.getUTCHours()) +
    ":" +
    pad(now.getUTCMinutes()) +
    ":" +
    pad(now.getUTCSeconds())
  );
}

/* =========================
   Run cron task
   ========================= */
(async () => {
  try {
    const { code } = await generateOTP();

    const timestamp = getUtcTimestamp();
    const line = `${timestamp} - 2FA Code: ${code}\n`;

    await fs.appendFile(LAST_CODE_PATH, line, {
      encoding: "utf8",
      mode: 0o600,
    });

    process.exit(0);
  } catch (err) {
    console.error("cron_runner error:", err && err.message ? err.message : err);
    process.exit(1);
  }
})();
