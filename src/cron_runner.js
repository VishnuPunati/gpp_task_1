import fs from "fs/promises";
import path from "path";
import { generateOTP } from "./totp.js";

const CRON_DIR = process.env.CRON_DIR || path.resolve("./cron");
const LAST_CODE_PATH = path.join(CRON_DIR, "last_code.txt");

(async () => {
  try {
    const { code } = await generateOTP();
    const now = new Date().toISOString();
    const line = `${now} - ${code}\n`;
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
