import express from "express";
import apicache from "apicache";
import { promises as fs } from "fs";
import path from "path";
import { discordSelf, discordUser, discordIDToUsername, discordUsernameToID, pseudoLanyardImplementation } from "./api";
import 'dotenv/config';
import readyClient from "./bot";

const app = express();
const cache = apicache.middleware;

let fallbackUserId = "879917497959219250";
let fallbackUserName = "tsunibot";
readyClient.then((client) => {
  fallbackUserId = client.user.id;
  fallbackUserName = client.user.username;
});

// Built Astro entry HTML. Loaded once at startup; runtime config is substituted
// per-request into the `/*__CONFIG__*/.../*__CONFIG__*/` sentinel.
const INDEX_PATH = path.resolve("./public/index.html");
const CONFIG_RE = /\/\*__CONFIG__\*\/[\s\S]*?\/\*__CONFIG__\*\//;
let indexHtml: string | null = null;
fs.readFile(INDEX_PATH, "utf8")
  .then((html) => (indexHtml = html))
  .catch((err) => {
    console.warn(
      `[app] could not read ${INDEX_PATH} at startup — did you run \`pnpm build:frontend\`?`,
      err.message
    );
  });

app.get("/", async (_req, res) => {
  if (!indexHtml) {
    // Lazy re-read in case the build finished after server start (e.g. dev).
    try {
      indexHtml = await fs.readFile(INDEX_PATH, "utf8");
    } catch {
      return res
        .status(500)
        .type("text/plain")
        .send("Frontend not built. Run `pnpm build:frontend`.");
    }
  }
  const config = JSON.stringify({
    defaultUserName: process.env.DEFAULT_USER_NAME || fallbackUserName,
    defaultUserId: process.env.DEFAULT_USER_ID || fallbackUserId,
    inviteUrl: process.env.DISCORD_GUILD_INVITE || "https://discord.gg/W59fcbydeG",
  });
  // easiest to run this every time because 1) dev mode and 2) fallbackUserId isn't known at initial startup.
  // Caching this while waiting for the bot to log in first isn't worth the complexity.
  const html = indexHtml.replace(CONFIG_RE, `/*__CONFIG__*/${config}/*__CONFIG__*/`);
  res.type("html").send(html);
});

app.use(express.static("./public"));

app.get("/api/ping", discordSelf);
app.get("/api/user/:id", cache(process.env.NODE_ENV === 'development' ? '1 second' : '30 seconds'), discordUser);
app.get("/api/username/:id", cache(process.env.NODE_ENV === 'development' ? '1 second' : '30 seconds'), discordIDToUsername);
app.get("/api/lookup/:username", discordUsernameToID);
app.get("/api/lanyard/:id", cache(process.env.NODE_ENV === 'development' ? '1 second' : '30 seconds'), pseudoLanyardImplementation);

export default app;
