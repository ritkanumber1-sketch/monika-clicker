// ================= АНАЛИТИКА И СТАТИСТИКА TAPMONIKA (stats_analytics.js) v1.0 =================

window.TapMonikaAnalytics = {
    getTotalCardLevels() {
        if (typeof cardLevels !== "object" || !cardLevels) return 0;
        return Object.values(cardLevels).reduce((sum, lvl) => sum + (Number(lvl) || 0), 0);
    },

    getAlbumProgressPercent() {
        const total = (typeof galleryPhotos !== "undefined" && Array.isArray(galleryPhotos)) ? galleryPhotos.length : 24;
        const unlocked = (typeof unlockedPhotos !== "undefined" && Array.isArray(unlockedPhotos)) ? unlockedPhotos.length : 0;
        return Math.min(100, Math.round((unlocked / Math.max(1, total)) * 100));
    },

    getSummaryText() {
        const totalCards = this.getTotalCardLevels();
        const albumPct = this.getAlbumProgressPercent();
        const rebirth = typeof rebirthLevel === "number" ? rebirthLevel : 0;
        const mult = typeof rebirthMultiplier === "number" ? rebirthMultiplier : 1;
        return `Уровней карточек: ${totalCards} • Альбом: ${albumPct}% • Рестарт: ${rebirth} (x${mult})`;
    }
};