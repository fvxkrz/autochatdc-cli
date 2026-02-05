import { getMessages, sendMessage, getMe } from "./discord.js";
import { aiReply } from "./ai.js";
import { loadBehaviour } from "./behaviour.js";

export async function startWorker({ token, channel }) {
  const me = await getMe(token);
  console.log(`🤖 Logged as ${me.username} on #${channel}`);

  let lastSeenId = null;
  let threadCount = 0;

  async function loop() {
    const bhv = loadBehaviour(); // reload tiap loop

    try {
      console.log(`[HB] checking ${channel}`);

      const msgs = await getMessages(token, channel);
      if (!Array.isArray(msgs)) return;

      const target = msgs.find(m =>
        m.author?.id &&
        m.author.id !== me.id &&
        m.content?.trim() &&
        m.id !== lastSeenId &&
        Math.random() <= bhv.reply_chance
      );

      if (!target) return;

      lastSeenId = target.id;

      const reply = await aiReply(target.content);
      if (!reply) return;

      const typingDelay =
        bhv.typing_min +
        Math.random() * (bhv.typing_max - bhv.typing_min);

      console.log(`[HB] typing ${typingDelay.toFixed(1)}s`);
      await new Promise(r => setTimeout(r, typingDelay * 1000));

      await sendMessage(token, channel, reply, target.id);
      console.log("💬 replied");

      console.log(`[HB] post cooldown ${bhv.post_cooldown}s`);
      await new Promise(r => setTimeout(r, bhv.post_cooldown * 1000));
    } catch (e) {
      console.error("Worker error:", e.message);
    }

    const wait =
      bhv.loop_min +
      Math.random() * (bhv.loop_max - bhv.loop_min);

    setTimeout(loop, wait * 1000);
  }

  loop();
}