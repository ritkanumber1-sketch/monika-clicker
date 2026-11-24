// ================= ЕЖЕДНЕВНЫЕ ЗАДАНИЯ TAPMONIKA (daily_quests.js) v1.1 =================

window.TapMonikaQuests = {
    dayKey: new Date().toISOString().slice(0, 10),
    claimedIds: [],

    quests: [
        {
            id: "q_score_500",
            title: "Собери 500 рыбок за день",
            reward: 350,
            isDone: () => (window.score || 0) >= 500
        },
        {
            id: "q_one_card",
            title: "Купи или прокачай любую карточку",
            reward: 400,
            isDone: () => Object.keys(typeof cardLevels !== "undefined" ? cardLevels : {}).length >= 1
        },
        {
            id: "q_photo_3",
            title: "Открой минимум 3 фото в альбоме",
            reward: 450,
            isDone: () => Array.isArray(typeof unlockedPhotos !== "undefined" ? unlockedPhotos : []) && unlockedPhotos.length >= 3
        }
    ],

    load() {
        try {
            const raw = localStorage.getItem("tapMonika_daily_quests_v1");
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (parsed.dayKey === this.dayKey && Array.isArray(parsed.claimedIds)) {
                this.claimedIds = parsed.claimedIds;
            } else {
                this.claimedIds = [];
                this.save();
            }
        } catch (e) {}
    },

    save() {
        try {
            localStorage.setItem("tapMonika_daily_quests_v1", JSON.stringify({
                dayKey: this.dayKey,
                claimedIds: this.claimedIds
            }));
        } catch (e) {}
    },

    checkAndClaim() {
        let totalBonus = 0;
        this.quests.forEach(q => {
            if (this.claimedIds.includes(q.id)) return;
            if (q.isDone()) {
                this.claimedIds.push(q.id);
                totalBonus += q.reward;
                if (typeof pushLog === "function") {
                    pushLog(`🎯 Ежедневное задание «${q.title}» выполнено (+${q.reward} 🪙).`);
                }
                if (typeof showGameToast === "function") {
                    showGameToast(`🎯 Задание выполнено: +${q.reward} 🪙`);
                }
            }
        });

        if (totalBonus > 0) {
            if (typeof window.score === "number") {
                window.score += totalBonus;
            }
            this.save();
            if (typeof updateDisplay === "function") updateDisplay();
            if (typeof saveCurrentProfile === "function") saveCurrentProfile();
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    window.TapMonikaQuests.load();
    setInterval(() => window.TapMonikaQuests.checkAndClaim(), 4000);
});