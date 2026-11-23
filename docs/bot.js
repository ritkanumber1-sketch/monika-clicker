const { Telegraf } = require("telegraf");

const BOT_TOKEN = "8907781144:AAHjCT6AGIMvzt0vaVcxNg9MbUAG5Q1NBQQ";
const GAME_URL = "https://ritkanumber1-sketch.github.io/monika-clicker/";

const bot = new Telegraf(BOT_TOKEN);

// Базовые команды
bot.start((ctx) => {
    ctx.reply(
        "🐾 Привет! Добро пожаловать в TapMonika!\n" +
        "Жми /play, чтобы открыть кликер про Монечку, Фортуночку и Сараби, или /help для списка команд."
    );
});

bot.command("play", (ctx) => {
    ctx.reply(`🎮 Открывай игру TapMonika: ${GAME_URL}`);
});

bot.command("help", (ctx) => {
    ctx.reply(
        "📋 Команды бота TapMonika:\n" +
        "/start — приветствие\n" +
        "/play — открыть кликер\n" +
        "/bonus — получить ежедневный бонус\n" +
        "/stats — статистика бота\n" +
        "/cats — досье кошек (Монечка, Фортуночка, Сараби)\n" +
        "/fish — мини-игра «Ловля рыбок»\n" +
        "/patrol — ночной обход двора\n" +
        "/rebirth — перерождения\n" +
        "/channels — каналы и соцсети Лёни\n" +
        "/promo — текст для приглашения друзей"
    );
});

bot.command("bonus", (ctx) => {
    ctx.reply("🎁 Твой ежедневный бонус: +500 🪙! Заходи в TapMonika и забирай награду в волшебной коробке.");
});

bot.command("stats", (ctx) => {
    ctx.reply("📊 Бот TapMonika в сети! Все 6 страниц (Лапки, Карточки, Альбом, Перерождения, Рыбалка, Обход) подключены.");
});

// Новые команды
bot.command("cats", (ctx) => {
    ctx.reply(
        "🐾 Досье пушистиков TapMonika:\n" +
        "• Монечка 🌸 — ~6 лет (~40 человеческих)\n" +
        "• Фортуночка / Фалтуна 🍀 — 1 год 1 мес. (~16–17 человеческих)\n" +
        "• Сараби 👑 — 11 мес. (~14 человеческих)"
    );
});

bot.command("fish", (ctx) => {
    ctx.reply(`🐟 Залетай ловить золотых рыбок (+25 🪙 за каждую): ${GAME_URL}fishing.html`);
});

bot.command("patrol", (ctx) => {
    ctx.reply(`🌙 Ночной обход двора (Симбочка, Серый, Бирючка старшая и младшая): ${GAME_URL}patrol.html`);
});

bot.command("rebirth", (ctx) => {
    ctx.reply(`🌀 Перерождения и множитель клика: ${GAME_URL}rebirth.html`);
});

bot.command("channels", (ctx) => {
    ctx.reply(
        "📡 Каналы и площадки:\n" +
        "• YouTube @RockyLenya: https://www.youtube.com/@RockyLenya\n" +
        "• YouTube @tapmonika_official: https://www.youtube.com/@tapmonika_official\n" +
        "• Чат Telegram: https://t.me/+t6l3qzQXZRY0MTRI\n" +
        "• Twitch: https://twitch.tv/tapmonika_live\n" +
        "• Discord: https://discord.gg/sAYWrFsh4\n" +
        "• DonationAlerts: https://www.donationalerts.com/r/zaqkfs"
    );
});

bot.command("promo", (ctx) => {
    ctx.reply(`🐾 Играй в TapMonika — кликер про Монечку, Фортуночку и Сараби: ${GAME_URL}`);
});

bot.catch((err) => {
    console.error("Ошибка Telegram-бота:", err);
});

process.on("uncaughtException", (err) => {
    console.error("Неперехваченная ошибка:", err);
});

bot.launch()
    .then(() => {
        console.log("✅ Бот TapMonika успешно запущен и ждёт команды!");
    })
    .catch((err) => {
        console.error("❌ Не удалось запустить бота:", err);
    });

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));