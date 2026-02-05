import fs from "fs";

export function loadBehaviour() {
  const defaults = {
    typing_min: 3,
    typing_max: 10,
    post_cooldown: 20,
    loop_min: 5,
    loop_max: 10,
    scan: 30,
    reply_chance: 1,
    thread_chance: 0.3,
    followup_chance: 0.6,
    max_thread_replies: 3,
    emoji_enabled: false,
    emoji_percent: 0.2
  };

  try {
    const raw = fs.readFileSync("./behaviour.txt", "utf8");
    const lines = raw.split("\n");

    for (const line of lines) {
      const l = line.trim();
      if (!l || l.startsWith("#")) continue;

      const [key, val] = l.split("=").map(v => v.trim());
      if (!(key in defaults)) continue;

      if (val === "true" || val === "false") {
        defaults[key] = val === "true";
      } else {
        const num = Number(val);
        defaults[key] = isNaN(num) ? val : num;
      }
    }
  } catch {
    // pakai default
  }

  return defaults;
}
