// ================= РЕЕСТР КАНАЛОВ И ССЫЛОК TAPMONIKA (channels_registry.js) v1.0 =================

window.TapMonikaChannelsRegistry = {
    version: "3.5.0",
    author: "Rocky Lenya",
    channels: [
        { id: "rockyYt", title: "🎮 Канал @RockyLenya", url: "https://www.youtube.com/@RockyLenya", reward: 300 },
        { id: "yt", title: "📺 TapMonika YouTube", url: "https://www.youtube.com/@tapmonika_official", reward: 300 },
        { id: "tg", title: "📢 Telegram-канал", url: "https://t.me/+t6l3qzQXZRY0MTRI", reward: 300 },
        { id: "twitch", title: "🟣 Twitch TapMonika", url: "https://twitch.tv/tapmonika_live", reward: 300 },
        { id: "ds", title: "💬 Discord-сервер", url: "https://discord.gg/sAYWrFsh4", reward: 300 },
        { id: "donate", title: "💖 DonationAlerts", url: "https://www.donationalerts.com/r/zaqkfs", reward: 0 }
    ],

    getById(id) {
        return this.channels.find(ch => ch.id === id) || null;
    }
};