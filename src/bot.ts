import { Client, Events, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import { responseCache } from './helpers/responseCache';

const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildPresences,
] });

let readyClient: Promise<Client<true>>;

client.login(process.env.DISCORD_TOKEN);

readyClient = new Promise((resolve) => {
  client.once(Events.ClientReady, readyClient => {
    console.log(`Discord logged in as ${readyClient.user.tag}`);
    resolve(readyClient);
  });
});

const watchedGuildId = process.env.DISCORD_GUILD_ID;

client.on(Events.PresenceUpdate, (_oldPresence, newPresence) => {
  if (watchedGuildId && newPresence.guild?.id !== watchedGuildId) return;
  if (newPresence.userId) responseCache.invalidateUser(newPresence.userId);
});

client.on(Events.GuildMemberUpdate, (_oldMember, newMember) => {
  if (watchedGuildId && newMember.guild.id !== watchedGuildId) return;
  responseCache.invalidateUser(newMember.id);
});

client.on(Events.UserUpdate, (_oldUser, newUser) => {
  responseCache.invalidateUser(newUser.id);
});

export default readyClient;