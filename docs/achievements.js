// ================= СИСТЕМА ДОСТИЖЕНИЙ TAPMONIKA (achievements.js) v1.1 =================

window.TapMonikaAchievements = {
    unlockedIds: [],

    list: [
        { id: "ach_first_100", title: "Первые 100 рыбок", reward: 150, check: () => (window.score || 0) >= 100 },
        { id: "ach_5000", title: "Кошачий магнат (5 000 🪙)", reward: 750, check: () => (window.score || 0) >= 5000 },
        { id: "ach_cards_3", title: "Коллекционер карточек (3 шт.)", reward: 500, check: () => Object.keys(typeof cardLevels !== "undefined" ? cardLevels : {}).length >= 3 },
        { id: "ach_photos_5", title: "Фотограф пушистиков (5 фото)", reward: 600, check: () => Array.isArray(typeof unlockedPhotos !== "undefined" ? unlockedPhotos : []) && unlockedPhotos.length >= 5 },
        { id: "ach_rebirth_1", title: "Первое перерождение", reward: 1500, check: () => (typeof rebirthLevel !== "undefined" ? rebirthLevel : 0) >= 1 }
    ],

    load() {
        try {
            const raw = localStorage.getItem("tapMonika_achievements_v1");
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) this.unlockedIds = parsed;
            }
        } catch (e) {}
    },

    save() {
        try {
            localStorage.setItem("tapMonika_achievements_v1", JSON.stringify(this.unlockedIds));
        } catch (e) {}
    },

    evaluate() {
        let changed = false;
        this.list.forEach(item => {
            if (this.unlockedIds.includes(item.id)) return;
            if (item.check()) {
                this.unlockedIds.push(item.id);
                if (typeof window.score === "number") {
                    window.score += item.reward;
                }
                changed = true;
                if (typeof pushLog === "function") {
                    pushLog(`🏆 Достижение «${item.title}»! Награда: +${item.reward} 🪙`);
                }
                if (typeof showGameToast === "function") {
                    showGameToast(`🏆 ${item.title}: +${item.reward} 🪙`);
                }
            }
        });
        if (changed) {
            this.save();
            if (typeof updateDisplay === "function") updateDisplay();
            if (typeof saveCurrentProfile === "function") saveCurrentProfile();
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    window.TapMonikaAchievements.load();
    setInterval(() => window.TapMonikaAchievements.evaluate(), 3000);
});