// ================= БЫСТРАЯ ПОКУПКА В ОДИН ТАП (quick_buy.js) v1.1 =================

window.TapMonikaQuickBuy = {
    buyMaxAvailable() {
        let boughtCount = 0;

        if (typeof allHamsterCatCards !== "undefined" && Array.isArray(allHamsterCatCards)) {
            allHamsterCatCards.forEach(card => {
                const lvl = (typeof cardLevels === "object" && cardLevels[card.id]) ? cardLevels[card.id] : 0;
                const locked = card.reqCard && (((cardLevels && cardLevels[card.reqCard]) || 0) < card.reqLvl);
                if (locked) return;

                const price = Math.floor(card.baseCost * Math.pow(card.costMult, lvl));
                if (typeof window.score === "number" && window.score >= price) {
                    window.score -= price;
                    cardLevels[card.id] = lvl + 1;
                    if (typeof passiveIncome === "number") {
                        passiveIncome += card.baseIncome;
                    }
                    boughtCount += 1;
                }
            });
        }

        if (boughtCount > 0) {
            window.TapMonikaSfx?.buySound?.();
            if (typeof renderBusinessCards === "function") renderBusinessCards();
            if (typeof updateDisplay === "function") updateDisplay();
            if (typeof saveCurrentProfile === "function") saveCurrentProfile();
            if (typeof pushLog === "function") {
                pushLog(`⚡ Авто-прокачка: куплено карточек — ${boughtCount} шт.`);
            }
            if (typeof showGameToast === "function") {
                showGameToast(`⚡ Куплено карточек: ${boughtCount} шт.`);
            }
        } else if (typeof showGameToast === "function") {
            showGameToast("Пока не хватает монеток на доступные карточки 😿");
        }
    }
};