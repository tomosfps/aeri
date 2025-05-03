export const BOT_INVITE_URL = `https://discord.com/api/oauth2/authorize?client_id=${import.meta.env["VITE_DISCORD_APPLICATION_ID"]}&permissions=${import.meta.env["VITE_DISCORD_INVITE_PERMISSIONS"]}&scope=bot%20applications.commands`;
export const SUPPORT_SERVER_URL = `https://discord.gg/${import.meta.env["VITE_DISCORD_SUPPORT_INVITE"]}`;
export const API_URL = import.meta.env["VITE_API_URL"];