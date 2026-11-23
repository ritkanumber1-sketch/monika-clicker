// ================= ВХОД ЧЕРЕЗ GOOGLE — 5 АККАУНТОВ И 5 КЛЮЧЕЙ (google_auth.js) v2.4 =================

window.TapMonikaGoogleAuth = {
    GOOGLE_CLIENT_IDS: [
        {
            id: "web1",
            label: "Web 1",
            clientId: "588188450606-cad7ejlaufcsp8badi2hqfpqeanh28jn.apps.googleusercontent.com"
        },
        {
            id: "web2",
            label: "Web 2",
            clientId: "588188450606-0af3.apps.googleusercontent.com" // вставь полный ID из TapMonika Web 2
        },
        {
            id: "web3",
            label: "Web 3",
            clientId: "588188450606-ra0ehc0glr5l7d0qkqbfmsnshfrcakph.apps.googleusercontent.com"
        },
        {
            id: "web4",
            label: "Web 4",
            clientId: "588188450606-vv5ec6t3orn5c25j0j7m5iun48o5f1m6.apps.googleusercontent.com"
        },
        {
            id: "web5",
            label: "Web 5",
            clientId: "588188450606-ecta7kak52gsksuf38om28bh834k6ge0.apps.googleusercontent.com"
        }
    ],
    ACTIVE_CLIENT_KEY: "tapMonika_google_active_client_id_v1",
    ACCOUNTS_KEY: "tapMonika_google_accounts_v2",
    ACTIVE_KEY: "tapMonika_google_active_email_v2",
    FALLBACK_AVATAR: "images/monika.jpg",
    MAX_ACCOUNTS: 5,

    getActiveClientObj() {
        const savedId = localStorage.getItem(this.ACTIVE_CLIENT_KEY) || "web1";
        return this.GOOGLE_CLIENT_IDS.find((c) => c.id === savedId) || this.GOOGLE_CLIENT_IDS[0];
    },

    getActiveClientId() {
        return this.getActiveClientObj().clientId;
    },

    setActiveClient(clientId) {
        localStorage.setItem(this.ACTIVE_CLIENT_KEY, clientId);
        this.initGoogleButton();
        this.renderAuthBox();
        const activeObj = this.getActiveClientObj();
        if (typeof pushLog === "function") {
            pushLog(`🔑 Выбран клиент OAuth: ${activeObj.label}`);
        }
    },

    getAccounts() {
        try {
            const list = JSON.parse(localStorage.getItem(this.ACCOUNTS_KEY) || "[]");
            return Array.isArray(list) ? list.slice(0, this.MAX_ACCOUNTS) : [];
        } catch {
            return [];
        }
    },

    saveAccounts(list) {
        localStorage.setItem(this.ACCOUNTS_KEY, JSON.stringify(list.slice(0, this.MAX_ACCOUNTS)));
    },

    getUser() {
        const list = this.getAccounts();
        if (!list.length) return null;
        const activeEmail = localStorage.getItem(this.ACTIVE_KEY);
        return list.find((acc) => acc.email === activeEmail) || list[0];
    },

    setActiveAccount(email) {
        localStorage.setItem(this.ACTIVE_KEY, email);
        this.renderAuthBox();
        const current = this.getUser();
        if (current && typeof pushLog === "function") {
            pushLog(`🔄 Выбран Google-аккаунт: ${current.name} (${current.email})`);
        }
    },

    saveUser(user) {
        const cleanUser = {
            name: user.name || "Игрок Google",
            email: (user.email || "").trim().toLowerCase(),
            picture: user.picture || this.FALLBACK_AVATAR,
            sub: user.sub || ""
        };
        if (!cleanUser.email) return;

        const list = this.getAccounts();
        const idx = list.findIndex((acc) => acc.email === cleanUser.email);

        if (idx >= 0) {
            list[idx] = { ...list[idx], ...cleanUser };
        } else {
            if (list.length >= this.MAX_ACCOUNTS) {
                alert(`Можно добавить максимум ${this.MAX_ACCOUNTS} Google-аккаунтов! Сначала отключи один из них.`);
                return;
            }
            list.push(cleanUser);
        }

        this.saveAccounts(list);
        localStorage.setItem(this.ACTIVE_KEY, cleanUser.email);
        this.renderAuthBox();
    },

    logoutCurrent() {
        const current = this.getUser();
        if (!current) return;
        const nextList = this.getAccounts().filter((acc) => acc.email !== current.email);
        this.saveAccounts(nextList);

        if (nextList.length > 0) {
            localStorage.setItem(this.ACTIVE_KEY, nextList[0].email);
        } else {
            localStorage.removeItem(this.ACTIVE_KEY);
        }

        this.renderAuthBox();
        if (typeof pushLog === "function") {
            pushLog(`🚪 Аккаунт ${current.email} отключён.`);
        }
    },

    decodeJwtPayload(token) {
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
            );
            return JSON.parse(jsonPayload);
        } catch {
            return null;
        }
    },

    handleCredentialResponse(response) {
        const payload = this.decodeJwtPayload(response.credential);
        if (!payload) return;

        this.saveUser({
            name: payload.name || "Игрок Google",
            email: payload.email || "",
            picture: payload.picture || this.FALLBACK_AVATAR,
            sub: payload.sub || ""
        });

        if (typeof pushLog === "function") {
            pushLog(`✅ Добавлен Google-аккаунт: ${payload.name || payload.email}`);
        }
    },

    loadGoogleScript() {
        if (document.getElementById("google-gsi-script")) return;
        const script = document.createElement("script");
        script.id = "google-gsi-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => this.initGoogleButton();
        document.head.appendChild(script);
    },

    initGoogleButton() {
        const target = document.getElementById("google-signin-btn-slot");
        if (!target || !window.google || !window.google.accounts) return;

        target.innerHTML = "";
        window.google.accounts.id.initialize({
            client_id: this.getActiveClientId(),
            callback: (res) => this.handleCredentialResponse(res),
            auto_select: false
        });

        window.google.accounts.id.renderButton(target, {
            theme: "filled_black",
            size: "small",
            shape: "pill",
            text: "signin_with"
        });
    },

    openAccountPicker() {
        const currentList = this.getAccounts();
        if (currentList.length >= this.MAX_ACCOUNTS) {
            alert(`Уже добавлено максимум ${this.MAX_ACCOUNTS} Google-аккаунтов.`);
            return;
        }

        if (window.google && window.google.accounts) {
            window.google.accounts.id.disableAutoSelect();
            window.google.accounts.id.prompt();
        } else {
            const email = prompt(`Введи Google-аккаунт (${currentList.length + 1}/${this.MAX_ACCOUNTS}):`, "example@gmail.com");
            if (!email) return;
            this.saveUser({
                name: email.split("@")[0],
                email,
                picture: this.FALLBACK_AVATAR
            });
        }
    },

    renderAuthBox() {
        const header = document.querySelector(".header");
        if (!header) return;

        let bar = document.getElementById("google-auth-bar");
        if (!bar) {
            bar = document.createElement("div");
            bar.id = "google-auth-bar";
            bar.style.cssText = `
                display:flex;flex-direction:column;gap:6px;
                background:rgba(15,23,42,0.78);border:1px solid rgba(56,189,248,0.35);
                border-radius:14px;padding:8px 10px;margin-bottom:8px;
            `;
            header.prepend(bar);
        }

        const accounts = this.getAccounts();
        const user = this.getUser();
        const activeClient = this.getActiveClientObj();

        const clientSwitchHtml = `
            <div style="display:flex;flex-wrap:wrap;align-items:center;gap:3px;font-size:10px;color:#94a3b8;">
                <span>Ключи:</span>
                ${this.GOOGLE_CLIENT_IDS.map((item) => {
                    const isCurrent = item.id === activeClient.id;
                    return `<button type="button" class="google-client-btn account-action-btn" data-client-id="${item.id}" style="padding:2px 6px;opacity:${isCurrent ? "1" : "0.6"};">${item.label}</button>`;
                }).join("")}
            </div>
        `;

        if (user) {
            const switchChips = accounts
                .map((acc, idx) => {
                    const isActive = acc.email === user.email;
                    return `
                        <button type="button" class="google-switch-chip" data-email="${acc.email}" style="
                            border:1px solid ${isActive ? "#38bdf8" : "rgba(148,163,184,0.35)"};
                            background:${isActive ? "rgba(56,189,248,0.22)" : "rgba(30,41,59,0.7)"};
                            color:#f8fafc;border-radius:999px;padding:3px 8px;font-size:10px;cursor:pointer;
                        ">
                            ${isActive ? "🟢" : "⚪"} #${idx + 1} ${acc.name}
                        </button>
                    `;
                })
                .join("");

            const canAddMore = accounts.length < this.MAX_ACCOUNTS;

            bar.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                    <div style="display:flex;align-items:center;gap:8px;min-width:0;">
                        <img id="google-user-avatar" src="${user.picture}" alt="Avatar" style="width:28px;height:28px;border-radius:50%;object-fit:cover;">
                        <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                            <div style="font-size:12px;font-weight:700;color:#f8fafc;">${user.name} <span style="font-size:10px;color:#38bdf8;">(${accounts.length}/${this.MAX_ACCOUNTS} акк.)</span></div>
                            <div style="font-size:10px;color:#94a3b8;">${user.email}</div>
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;gap:4px;">
                        ${canAddMore ? `<button type="button" id="google-add-btn" class="account-action-btn">+ Google (${accounts.length}/${this.MAX_ACCOUNTS})</button>` : ""}
                        <button type="button" id="google-logout-btn" class="account-action-btn">Выйти</button>
                    </div>
                </div>
                <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px;">
                    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:5px;">
                        ${switchChips}
                        ${canAddMore ? `<div id="google-signin-btn-slot"></div>` : ""}
                    </div>
                    ${clientSwitchHtml}
                </div>
            `;

            const avatar = bar.querySelector("#google-user-avatar");
            if (avatar) {
                avatar.onerror = () => {
                    avatar.src = this.FALLBACK_AVATAR;
                };
            }

            bar.querySelectorAll(".google-switch-chip").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const email = btn.getAttribute("data-email");
                    if (email) this.setActiveAccount(email);
                });
            });

            bar.querySelector("#google-add-btn")?.addEventListener("click", () => this.openAccountPicker());
            bar.querySelector("#google-logout-btn")?.addEventListener("click", () => this.logoutCurrent());
        } else {
            bar.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                    <span style="font-size:11px;color:#cbd5e1;">🔐 Вход через Google (до ${this.MAX_ACCOUNTS} аккаунтов):</span>
                    <div style="display:flex;align-items:center;gap:6px;">
                        <div id="google-signin-btn-slot"></div>
                        <button type="button" id="google-quick-demo-btn" class="account-action-btn">Войти</button>
                    </div>
                </div>
                <div style="display:flex;justify-content:flex-end;">
                    ${clientSwitchHtml}
                </div>
            `;
            bar.querySelector("#google-quick-demo-btn")?.addEventListener("click", () => this.openAccountPicker());
        }

        bar.querySelectorAll(".google-client-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const cId = btn.getAttribute("data-client-id");
                if (cId) this.setActiveClient(cId);
            });
        });

        this.initGoogleButton();
    }
};

document.addEventListener("DOMContentLoaded", () => {
    window.TapMonikaGoogleAuth.renderAuthBox();
    window.TapMonikaGoogleAuth.loadGoogleScript();
});