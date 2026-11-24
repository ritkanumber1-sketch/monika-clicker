// ================= МОДУЛЬ ЗАЩИТЫ И ПРОВЕРКИ TAPMONIKA (security.js) v1.1 =================

window.TapMonikaSecurity = {
    salt: typeof CORE_SALT !== "undefined" ? CORE_SALT : "Monika_Fortuna_Sarabi_Shield_v999_2026_Secure!",
    maxTapIntervalMs: 25,
    lastValidTapAt: 0,

    isValidNumber(val) {
        return typeof val === "number" && Number.isFinite(val) && !Number.isNaN(val);
    },

    sanitizePositive(val, fallback = 0) {
        if (!this.isValidNumber(val) || val < 0) return fallback;
        return val;
    },

    validateTap(event) {
        if (!event) return true;
        if (typeof event.isTrusted === "boolean" && !event.isTrusted) {
            return false;
        }
        const now = Date.now();
        if (now - this.lastValidTapAt < this.maxTapIntervalMs) {
            return false;
        }
        this.lastValidTapAt = now;
        return true;
    },

    sanitizeSavePayload(raw) {
        if (!raw || typeof raw !== "object") return null;
        return {
            score: this.sanitizePositive(raw.score, 0),
            tapPower: Math.max(1, Math.floor(this.sanitizePositive(raw.tapPower, 1))),
            passiveIncome: Math.floor(this.sanitizePositive(raw.passiveIncome, 0)),
            maxEnergy: Math.max(100, Math.floor(this.sanitizePositive(raw.maxEnergy, 1000))),
            energyRegenRate: Math.max(1, Math.floor(this.sanitizePositive(raw.energyRegenRate, 5))),
            rebirthLevel: Math.floor(this.sanitizePositive(raw.rebirthLevel, 0)),
            rebirthMultiplier: Math.max(1, this.sanitizePositive(raw.rebirthMultiplier, 1)),
            unlockedPhotos: Array.isArray(raw.unlockedPhotos)
                ? raw.unlockedPhotos.filter(n => Number.isInteger(n) && n >= 0 && n < 24)
                : [0, 1],
            cardLevels: (raw.cardLevels && typeof raw.cardLevels === "object" && !Array.isArray(raw.cardLevels))
                ? raw.cardLevels
                : {}
        };
    },

    enforceGameStateIntegrity() {
        window.score = this.sanitizePositive(window.score, 0);

        if (typeof tapPower !== "undefined" && (!this.isValidNumber(tapPower) || tapPower < 1)) {
            tapPower = 1;
        }
        if (typeof passiveIncome !== "undefined" && (!this.isValidNumber(passiveIncome) || passiveIncome < 0)) {
            passiveIncome = 0;
        }
        if (typeof maxEnergy !== "undefined" && (!this.isValidNumber(maxEnergy) || maxEnergy < 100)) {
            maxEnergy = 1000;
        }
        if (typeof energy !== "undefined" && (!this.isValidNumber(energy) || energy < 0)) {
            energy = 0;
        }
        if (typeof energy !== "undefined" && typeof maxEnergy !== "undefined" && energy > maxEnergy) {
            energy = maxEnergy;
        }
        if (typeof rebirthMultiplier !== "undefined" && (!this.isValidNumber(rebirthMultiplier) || rebirthMultiplier < 1)) {
            rebirthMultiplier = 1;
        }
    }
};

window.validateTapEvent = function(event) {
    return window.TapMonikaSecurity.validateTap(event);
};

setInterval(() => {
    window.TapMonikaSecurity.enforceGameStateIntegrity();
}, 2000);