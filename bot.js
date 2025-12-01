import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import pino from "pino";

// Set today's daf (you can automate this later)
const TODAY_DAF = "Bava Kama 45";

// List of 20 Maggidei Shiurim
const speakers = [
  { id: 1,  name: "Rabbi Eli Stefansky (MDY)", url: "https://example.com/mdy" },
  { id: 2,  name: "R’ Shalom Rosner", url: "https://example.com/rosner" },
  { id: 3,  name: "Rabbi Aryeh Lebowitz", url: "https://example.com/lebowitz" },
  { id: 4,  name: "Rabbi Moshe Elefant (OU)", url: "https://example.com/elefant" },
  { id: 5,  name: "Rabbi Zev Cohen", url: "https://example.com/zevcohen" },

  { id: 6,  name: "Chavrusa-Style Daf", url: "https://example.com/chavrusa" },
  { id: 7,  name: "Fast Daf Review", url: "https://example.com/fastdaf" },
  { id: 8,  name: "Beginner Daf", url: "https://example.com/beginner" },
  { id: 9,  name: "Chabad Daf", url: "https://example.com/chabad" },
  { id: 10, name: "Sephardic Daf", url: "https://example.com/sephardi" },

  { id: 11, name: "5-Min Daf Summary", url: "https://example.com/summary" },
  { id: 12, name: "Rabbi Daniel Glatstein", url: "https://example.com/glatstein" },
  { id: 13, name: "Rabbi Aharon Lopiansky", url: "https://example.com/lopiansky" },
  { id: 14, name: "Rabbi Dovid Kaplan", url: "https://example.com/kaplan" },
  { id: 15, name: "Rabbi Shlomo Cynamon", url: "https://example.com/cynamon" },

  { id: 16, name: "Rabbi Shmuel Birnbaum Style", url: "https://example.com/birnbaum" },
  { id: 17, name: "Rabbi Aryeh Zev Ginzburg", url: "https://example.com/ginzburg" },
  { id: 18, name: "Rabbi Fischel Schachter", url: "https://example.com/fischel" },
  { id: 19, name: "Rabbi Yossi Bensoussan", url: "https://example.com/bensoussan" },
  { id: 20, name: "Clear Daf", url: "https://example.com/cleardaf" }
];

// Build menu text
function buildMenu() {
  let txt = `📖 Daf Yomi – ${TODAY_DAF}\n\nChoose your Maggid Shiur:\n\n`;
  speakers.forEach(s => {
    txt += `${s.id}. ${s.name}\n`;
  });
  txt += `\nReply with a number (1–20).`;
  return txt;
}

// Find speaker by number
function getSpeaker(n) {
  return speakers.find(x => x.id === Number(n));
}

// Start WhatsApp bot
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");
  
  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    auth: state
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const from = msg.key.remoteJid;

    const body =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      "";

    const text = body.trim().toLowerCase();

    // User says "daf"
    if (["daf", "daf yomi", "דף יומי"].includes(text)) {
      await sock.sendMessage(from, { text: buildMenu() });
      return;
    }

    // User selects a number
    if (/^\d+$/.test(text)) {
      const pick = getSpeaker(text);

      if (!pick) {
        await sock.sendMessage(from, { text: "Please choose a number from 1–20." });
        return;
      }

      const reply =
        `📖 Daf Yomi – ${TODAY_DAF}\n` +
        `🗣️ ${pick.name}\n\n` +
        `🎧 Listen: ${pick.url}`;

      await sock.sendMessage(from, { text: reply });
    }
  });

  console.log("✅ Bot is running...");
}

startBot();
