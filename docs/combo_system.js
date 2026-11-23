// ================= КОМБО-СИСТЕМА БЫСТРЫХ ТАПОВ (combo_system.js) v1.0 =================

window.TapMonikaCombo = {
    streak: 0,
    lastTapAt: 0,

    registerTap() {
        const now = Date.now();
        if (now - this.lastTapAt <= 1200) {
            this.streak += 1;
        } else {
            this.streak = 1;
        }
        this.lastTapAt = now;

        if (this.streak > 0 && this.streak % 25 === 0) {
            const bonus = 100 * (typeof rebirthMultiplier === "number" ? rebirthMultiplier : 1);
            if (typeof window.score === "number") {
                window.score += bonus;
            }
            if (typeof pushLog === "function") {
                pushLog(`🔥 Комбо ${this.streak} тапов подряд! Бонус: +${bonus} 🪙`);
            }
            if (typeof updateDisplay === "function") {
                updateDisplay();
            }
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const tapBtn = document.getElementById("tap-button");
    if (tapBtn) {
        tapBtn.addEventListener("click", () => {
            window.TapMonikaCombo.registerTap();
        });
    }
});