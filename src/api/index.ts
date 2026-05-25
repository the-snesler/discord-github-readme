import readyClient from "../bot";
import { makeCard, makeCompactCard, makeBadgeCard } from "../helpers/card";
import { validateId, fetchUserInfo } from "../helpers/discord";
import type { RequestHandler } from "express";
import { URItoBase64 } from "../helpers/utils";
import { ParamsSchema } from "../schema";
import type { CardOptions } from "../schema";
import { discordMemberToLanyard } from "../helpers/lanyard";

const lookupGuildMemberByUsername = (
  client: Awaited<typeof readyClient>,
  rawUsername: string
) => {
  const guildID = process.env.DISCORD_GUILD_ID as string;
  const guild = client.guilds.cache.get(guildID);
  if (!guild) return null;
  const searchTerm = rawUsername.replace(/^@/, "").toLowerCase();
  return (
    guild.members.cache.find(
      (m) =>
        m.user.username.toLowerCase() === searchTerm ||
        m.user.displayName.toLowerCase() === searchTerm ||
        m.nickname?.toLowerCase() === searchTerm
    ) || null
  );
};

export const resolveUsernameToId = async (username: string): Promise<string | null> => {
  if (!username || username.length < 2) return null;
  const client = await readyClient;
  return lookupGuildMemberByUsername(client, username)?.id ?? null;
};

export const discordSelf: RequestHandler = async (req, res, next) => {
  const client = await readyClient;
  res.status(200).send(`Discord logged in as ${client.user.username}`);
}

export const discordDebug: RequestHandler = async (req, res, next) => {
  const client = await readyClient;
  const id = req.params.id || process.env.TEST_USER_ID || "214167454291722241";
  
  try {
    // Fetch the user first
    let user = await fetchUserInfo(client, id);
    if (!user) {
      res.status(404).send("User not found");
      return;
    }
    
    // Force add the About Me for testing
    const options = {
      animate: false,
      width: 500,
      aboutMe: "This is a test about me section",
      theme: "nitroDark",
      primaryColor: "#7289DA", // Discord blue
      accentColor: "#99AAB5", // Discord grey
      hideDecoration: false,
      hideSpotify: false,
    } as CardOptions;
    
    const card = await makeCard(user, options);
    res.set('Content-Type', 'image/svg+xml')
      .status(200)
      .send(card);
  } catch (error) {
    next(error);
  }
}

const errorSvg = (
  errorMessage: string
) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="200" viewBox="0 0 512 200">
    <rect width="512" height="200" rx="15" fill="#ff4444"/>
    <text x="20" y="30" font-family="Arial, sans-serif" font-size="16" fill="white" font-weight="bold">Error:</text>
    <text x="20" y="50" font-family="Arial, sans-serif" font-size="12" fill="white">${errorMessage}</text>
  </svg>`;

export const discordUser: RequestHandler = async (req, res, next) => {
  const client = await readyClient;
  const id = req.params.id;
  const { success, data: options, error } = ParamsSchema.safeParse(req.query);
  if (!success) {
    const errorMessage = error.issues
      .map((e) => `<tspan x="20" dy="1.2em">${e.message}</tspan>`)
      .join("");
    res.set("Content-Type", "image/svg+xml").status(400).send(errorSvg(errorMessage));
    return;
  }
  if (!validateId(id)) {
    res.status(400).send("Invalid ID");
    return;
  }
  try {
    const fetchWidth = options.layout === 'badge' ? 50 : options.width;
    const user = await fetchUserInfo(client, id, options.animate, fetchWidth);
    if (!user) {
      res.status(404).send("User not found");
      return;
    }
    if (options.banner) {
      user.bannerURL = URItoBase64(options.banner);
    }
    let card: string;
    if (options.layout === 'compact') {
      card = await makeCompactCard(user, options);
    } else if (options.layout === 'badge') {
      card = await makeBadgeCard(user, options);
    } else {
      card = await makeCard(user, options);
    }
    res.set("Content-Type", "image/svg+xml").status(200).send(card);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error";
    res
      .set("Content-Type", "image/svg+xml")
      .status(400)
      .send(errorSvg(`<tspan x="20" dy="1.2em">${errorMessage}</tspan>`));
    next(error);
  }
};

export const discordIDToUsername: RequestHandler = async (req, res, next) => {
  const client = await readyClient;
  const id = req.params.id;

  if (!validateId(id)) {
    res.status(400).send("Invalid ID");
    return;
  }

  try {
    const user = await fetchUserInfo(client, id, false, 0);
    if (!user) {
      res.status(404).send("User not found");
      return;
    }

    res.status(200).json({ username: user.username });
  } catch (error) {
    next(error);
  }
}

export const discordUsernameToID: RequestHandler = async (req, res, next) => {
  const client = await readyClient;
  const username = req.params.username;

  if (!username || username.length < 2) {
    res.status(400).json({ error: "Username must be at least 2 characters" });
    return;
  }

  try {
    const guildID = process.env.DISCORD_GUILD_ID as string;
    if (!client.guilds.cache.get(guildID)) {
      res.status(500).json({ error: "Guild not found" });
      return;
    }

    const member = lookupGuildMemberByUsername(client, username);

    if (!member) {
      res.status(404).json({ error: "User not found in server" });
      return;
    }

    res.status(200).json({
      id: member.id,
      username: member.user.username,
      displayName: member.nickname || member.user.displayName
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Responds with the user's status in a format semi-compatible with https://lanyard.rest/ clients
 * It's missing things like Spotify, some fields, and the timestamps are strings instead of numbers (!!).
 */
export const pseudoLanyardImplementation: RequestHandler = async (req, res, next) => {
  const client = await readyClient;
  const id = req.params.id;
  const guildID = process.env.DISCORD_GUILD_ID as string;
  
  if (!validateId(id)) {
    res.status(404).send({ success: false, error: { code: "user_not_monitored", message: "User not found"} });
    return;
  }

  try {
    const member = await client.guilds.cache.get(guildID)?.members.fetch({ user: id, force: true });
    if (!member) {
      return null;
    }
    const fullUser = await member.user.fetch();
    if (!fullUser) {
      res.status(404).send({ success: false, error: { code: "user_not_monitored", message: "User not found"} });
      return;
    }
    const response = discordMemberToLanyard(member);
    res.status(200).json(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error";
    res.status(400).send({ success: false, error: { code: "error", message: errorMessage } });
    next(error);
  }
};
