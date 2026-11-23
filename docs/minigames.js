// ================= МОДУЛЬ СОБЫТИЙ И РЕПЛИК (events.js) v1.0 =================

const tapMonikaEvents = [
    "Монечка устроила вечерний концерт и принесла бонусные рыбки!",
    "Фортуночка / Фалтуна проверила коробку и нашла блестящую монетку!",
    "Сараби гордо прошла по комнате как настоящая королева!",
    "На улице прошёл обход: Симбочка, Серый и Бирючки передают привет!",
    "Канал @RockyLenya набирает обороты — время качать карточки!"
];

function triggerRandomCatEvent() {
    if (!Array.isArray(tapMonikaEvents) || tapMonikaEvents.length === 0) return;
    const idx = Math.floor(Math.random() * tapMonikaEvents.length);
    const msg = tapMonikaEvents[idx];
    const bonus = 150;

    if (typeof window.score === "number") {
        window.score += bonus;
    }
    if (typeof pushLog === "function") {
        pushLog(`Событие: ${msg} (+${bonus} 🪙)`);
    }
    if (typeof updateDisplay === "function") {
        updateDisplay();
    }
    if (typeof saveCurrentProfile === "function") {
        saveCurrentProfile();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setInterval(() => {
        if (Math.random() < 0.35) {
            triggerRandomCatEvent();
        }
    }, 45000);
});