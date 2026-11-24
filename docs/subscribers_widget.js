// ================= СЧЁТЧИК ПОДПИСЧИКОВ С ПРИВЯЗКОЙ К GOOGLE (subscribers_widget.js) v1.2 =================

window.TapMonikaSubscribers = {
    STORAGE_KEY: "tapMonika_subs_v1",
    goal: 100000,

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
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
        } catch (e) {}
    },

    isGoogleAuthorized() {
        return Boolean(
            window.TapMonikaGoogleAuth &&
            typeof window.TapMonikaGoogleAuth.isSignedIn === "function" &&
            window.TapMonikaGoogleAuth.isSignedIn()
        );
    },

    render() {
        const targetParent = document.getElementById("tab-tasks") || document.querySelector(".main-content");
        if (!targetParent) return;

        let card = document.getElementById("subscribers-counter-card");
        if (!card) {
            card = document.createElement("div");
            card.id = "subscribers-counter-card";
            card.className = "settings-box";
            card.style.marginTop = "10px";
            targetParent.appendChild(card);
        }

        if (!this.isGoogleAuthorized()) {
            card.innerHTML = `
                <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                    <div>
                        <b style="font-size:13px;color:#f472b6;">📊 Счётчик подписчиков</b>
                        <div style="font-size:11px;color:#94a3b8;margin-top:2px;">
                            Войди в Google-аккаунт, чтобы видеть и обновлять количество подписчиков.
                        </div>
                    </div>
                    <button type="button" id="google-signin-subs-btn" class="action-btn">🔐 Войти в Google</button>
                </div>
            `;
            card.querySelector("#google-signin-subs-btn")?.addEventListener("click", () => {
                window.TapMonikaGoogleAuth?.promptSignIn?.();
            });
            return;
        }

        const user = window.TapMonikaGoogleAuth.getUser();
        const list = this.load();
        const totalSubs = list.reduce((sum, ch) => sum + (Number(ch.subs) || 0), 0);
        const pct = Math.min(100, Math.round((totalSubs / this.goal) * 100));

        card.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:6px;">
                <b style="font-size:13px;color:#f472b6;">📊 Счётчик подписчиков (Цель: ${this.goal.toLocaleString()})</b>
                <div style="display:flex;gap:6px;">
                    <button type="button" id="subs-edit-btn" class="account-action-btn">+ Обновить</button>
                    <button type="button" id="google-signout-subs-btn" class="account-action-btn" title="Выйти из Google">Выйти</button>
                </div>
            </div>
            <div style="font-size:11px;color:#38bdf8;margin-bottom:6px;">
                Аккаунт Google: <b>${user?.name || "Пользователь"}</b> (${user?.email || ""})
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
            if (typeof showGameToast === "function") {
                showGameToast("Подписчики обновлены! 📊");
            }
        });

        card.querySelector("#google-signout-subs-btn")?.addEventListener("click", () => {
            window.TapMonikaGoogleAuth?.signOut?.();
        });
    }
};

document.addEventListener("DOMContentLoaded", () => {
    window.TapMonikaSubscribers.render();
});