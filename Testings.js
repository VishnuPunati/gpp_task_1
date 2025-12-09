import {
  DATA_DIR,
  PUBLIC_KEY_PATH,
  PRIVATE_KEY_PATH,
  SEED_PATH,
} from "./src/crypto-utils.js";
import fs from "fs/promises";
console.log(
  DATA_DIR + "\n ",
  PUBLIC_KEY_PATH + "\n ",
  PRIVATE_KEY_PATH + "\n ",
  SEED_PATH
);

async function writeFiler() {
  try {
    let pub = await fs.writeFile(PUBLIC_KEY_PATH, "Hello world");
    pub = (await fs.readFile(PUBLIC_KEY_PATH)).toString();
    console.log(pub);
  } catch (error) {
    console.log(error);
  }
}
writeFiler();
