// ================= SERVICE WORKER TAPMONIKA (sw.js) v1.0 =================

const CACHE_NAME = "tapmonika-cache-v3-4";
const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./themes.css",
    "./config.js",
    "./security.js",
    "./data.js",
    "./audio.js",
    "./events.js",
    "./storage.js",
    "./minigames.js",
    "./achievements.js",
    "./daily_quests.js",
    "./stats_analytics.js",
    "./sidebar.js",
    "./quick_buy.js",
    "./script.js"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)).catch(() => {})
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
});