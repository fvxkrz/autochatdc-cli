import fs from "fs";
import { startWorker } from "./worker.js";

const cfg = JSON.parse(fs.readFileSync("./config.json", "utf8"));

console.log("AutoDC starting...");

for (const channel of cfg.channels) {
  startWorker({
    token: cfg.discordToken,
    channel,
    cfg
  });
}

// 🔒 PAKSA PROCESS HIDUP
setInterval(() => {
  // heartbeat kosong
}, 60 * 1000);
