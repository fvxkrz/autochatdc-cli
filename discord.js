import fetch from "node-fetch";

const API = "https://discord.com/api/v9";

// base64 dari Discord web (AMAN, static)
const SUPER_PROPERTIES =
  "eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwi" +
  "c3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96" +
  "aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJL" +
  "aXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEyMC4wLjAgU2Fm" +
  "YXJpLzUzNy4zNiIsImJyb3dzZXJfdmVyc2lvbiI6IjEyMC4wLjAiLCJvc192ZXJz" +
  "aW9uIjoiMTAiLCJyZWZlcnJlciI6IiIsInJlZmVycmluZ19kb21haW4iOiIiLCJy" +
  "ZWxlYXNlX2NoYW5uZWwiOiJzdGFibGUiLCJjbGllbnRfYnVpbGRfbnVtYmVyIjoy" +
  "NTk1MDUsImNsaWVudF9ldmVudF9zb3VyY2UiOm51bGx9";

const BASE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120",
  "Accept": "*/*",
  "Content-Type": "application/json",
  "X-Super-Properties": SUPER_PROPERTIES
};

export async function discordFetch(url, opts = {}, retry = true) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      ...BASE_HEADERS,
      ...(opts.headers || {})
    }
  });

  if (res.status === 429 && retry) {
    const j = await res.json().catch(() => ({}));
    const wait = (j.retry_after || 1) * 1000;
    await new Promise(r => setTimeout(r, wait));
    return discordFetch(url, opts, false);
  }

  return res;
}

export async function getMe(token) {
  const r = await discordFetch(`${API}/users/@me`, {
    headers: { Authorization: token }
  });
  return r.json();
}

export async function getMessages(token, channel) {
  const r = await discordFetch(
    `${API}/channels/${channel}/messages?limit=20`,
    { headers: { Authorization: token } }
  );
  const data = await r.json().catch(() => null);
  return Array.isArray(data) ? data : null;
}

export async function sendMessage(token, channel, content, replyTo) {
  const r = await discordFetch(`${API}/channels/${channel}/messages`, {
    method: "POST",
    headers: { Authorization: token },
    body: JSON.stringify({
      content,
      message_reference: replyTo
        ? { message_id: replyTo }
        : undefined
    })
  });

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    console.error("SEND FAIL:", r.status, t);
  }
}