// ai.js
import fs from "fs";
import fetch from "node-fetch";

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync("./config.json", "utf8"));
  } catch {
    return null;
  }
}

function loadPrompt() {
  try {
    return fs.readFileSync("./prompt.txt", "utf8").trim();
  } catch {
    return "Balas singkat dan natural.";
  }
}

export async function aiReply(text) {
  const cfg = loadConfig();
  if (!cfg || !cfg.ai || cfg.ai.provider !== "groq") {
    console.error("[AI] config invalid");
    return null;
  }

  const prompt = loadPrompt();

  try {
    const res = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${cfg.ai.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: cfg.ai.model,
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: text }
          ],
          temperature: 0.9,
          max_tokens: 80
        })
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("[AI] Groq API ERROR:", res.status, err);
      return null;
    }

    const json = await res.json();
    const out = json?.choices?.[0]?.message?.content;
    return out?.trim() || null;
  } catch (e) {
    console.error("[AI] fetch failed:", e.message);
    return null;
  }
}