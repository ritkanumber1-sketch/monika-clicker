// ================= МОДУЛЬ ЗАЩИТЫ И ПРОВЕРКИ TAPMONIKA (security.js) v1.0 =================

window.validateTapEvent = function(event) {
    if (!event) return true;
    if (typeof event.isTrusted === "boolean" && !event.isTrusted) {
        return false;
    }
    return true;
};

setInterval(() => {
    if (typeof window.score !== "number" || Number.isNaN(window.score) || window.score < 0) {
        window.score = 0;
    }
}, 2000);