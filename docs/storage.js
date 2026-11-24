// ================= МОДУЛЬ ХРАНИЛИЩА TAPMONIKA (storage.js) v1.0 =================

window.TapMonikaStorage = {
    memoryStore: {},
    keys: {
        profiles: "tapMonika_profiles_v3",
        activeProfileIndex: "tapMonika_activeProfileIndex_v3",
        lang: "tapMonika_lang",
        achievements: "tapMonika_achievements_v1",
        quests: "tapMonika_daily_quests_v1",
        subs: "tapMonika_subs_v1"
    },

    getItem(key) {
        try {
            if (window.localStorage) {
                const val = window.localStorage.getItem(key);
                if (val !== null) return val;
            }
        } catch (e) {}
        return Object.prototype.hasOwnProperty.call(this.memoryStore, key)
            ? this.memoryStore[key]
            : null;
    },

    setItem(key, value) {
        const strVal = String(value);
        this.memoryStore[key] = strVal;
        try {
            if (window.localStorage) {
                window.localStorage.setItem(key, strVal);
            }
        } catch (e) {}
    },

    removeItem(key) {
        delete this.memoryStore[key];
        try {
            if (window.localStorage) {
                window.localStorage.removeItem(key);
            }
        } catch (e) {}
    },

    getJSON(key, fallback = null) {
        const raw = this.getItem(key);
        if (!raw) return fallback;
        try {
            return JSON.parse(raw);
        } catch (e) {
            return fallback;
        }
    },

    setJSON(key, data) {
        try {
            this.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            return false;
        }
    },

    loadProfiles(defaultProfile) {
        const saved = this.getJSON(this.keys.profiles, null);
        if (Array.isArray(saved) && saved.length > 0) {
            return saved;
        }
        return [defaultProfile];
    },

    saveProfiles(profiles, activeIndex = 0) {
        if (!Array.isArray(profiles) || profiles.length === 0) return;
        const safeIdx = Math.max(0, Math.min(profiles.length - 1, Number(activeIndex) || 0));
        this.setJSON(this.keys.profiles, profiles);
        this.setItem(this.keys.activeProfileIndex, String(safeIdx));
    },

    getActiveProfileIndex(totalProfiles = 1) {
        const raw = parseInt(this.getItem(this.keys.activeProfileIndex) || "0", 10);
        if (Number.isNaN(raw) || raw < 0 || raw >= totalProfiles) return 0;
        return raw;
    }
};