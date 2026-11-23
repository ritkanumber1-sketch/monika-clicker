// ================= СЧЁТЧИК ПОДПИСЧИКОВ (subscribers_widget.js) v1.0 =================

window.TapMonikaSubscribers = {
    STORAGE_KEY: "tapMonika_subs_v1",
    goal: 1000,

    defaultChannels: [
        { id: "rockylenya", title: "Rocky Lenya (@RockyLenya)", subs: 128 },
        { id: "tapmonika", title: "TapMonika (@tapmonika_official)", subs: 100 }
    ],

    load() {
        try {
            const saved = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || "null");
            return Array.isArray(saved) && saved.length ? saved : this.defaultChannels;
        } catch {
            return this.defaultChannels;
        }
    },

    save(list) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    },

    render() {
        const mainContent = document.querySelector(".main-content");
        if (!mainContent) return;

        let card = document.getElementById("subscribers-counter-card");
        if (!card) {
            card = document.createElement("div");
            card.id = "subscribers-counter-card";
            card.className = "settings-box";
            card.style.marginTop = "10px";
            mainContent.appendChild(card);
        }

        const list = this.load();
        const totalSubs = list.reduce((sum, ch) => sum + (Number(ch.subs) || 0), 0);
        const pct = Math.min(100, Math.round((totalSubs / this.goal) * 100));

        card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <b style="font-size:13px;color:#f472b6;">📊 Счётчик подписчиков (Цель: ${this.goal})</b>
                <button type="button" id="subs-edit-btn" class="account-action-btn">+ Обновить</button>
            </div>
            <div style="font-size:12px;color:#e2e8f0;margin-bottom:6px;">
                Всего по каналам: <b>${totalSubs.toLocaleString()}</b> / ${this.goal.toLocaleString()} (${pct}%)
            </div>
            <div class="energy-bar-bg" style="margin-bottom:8px;">
                <div class="energy-bar-fill" style="width:${pct}%;"></div>
            </div>
            <div style="display:flex;flex-direction:column;gap:4px;font-size:11px;color:#cbd5e1;">
                ${list.map(ch => `<div>• <b>${ch.title}</b>: ${Number(ch.subs).toLocaleString()} подп.</div>`).join("")}
            </div>
        `;

        card.querySelector("#subs-edit-btn")?.addEventListener("click", () => {
            const currentList = this.load();
            const rockyVal = prompt("Сколько сейчас подписчиков на @RockyLenya?", currentList[0].subs);
            if (rockyVal !== null && !Number.isNaN(Number(rockyVal))) {
                currentList[0].subs = Math.max(0, Math.floor(Number(rockyVal)));
            }
            const monikaVal = prompt("Сколько сейчас подписчиков на @tapmonika_official?", currentList[1].subs);
            if (monikaVal !== null && !Number.isNaN(Number(monikaVal))) {
                currentList[1].subs = Math.max(0, Math.floor(Number(monikaVal)));
            }
            this.save(currentList);
            this.render();
        });
    }
};

document.addEventListener("DOMContentLoaded", () => {
    window.TapMonikaSubscribers.render();
});