// ================= ВХОД ЧЕРЕЗ GOOGLE-АККАУНТ (google_auth.js) v1.2 =================

window.TapMonikaGoogleAuth = {
    GOOGLE_CLIENT_ID: "588188450606-cad7ejlaufcsp8badi2hqfpqeanh28jn.apps.googleusercontent.com",
    AUTH_STORAGE_KEY: "tapMonika_google_user_v1",
    FALLBACK_AVATAR: "images/monika.jpg",

    getUser() {
        try {
            return JSON.parse(localStorage.getItem(this.AUTH_STORAGE_KEY) || "null");
        } catch {
            return null;
        }
    },

    saveUser(user) {
        const cleanUser = {
            name: user.name || "Игрок Google",
            email: user.email || "",
            picture: user.picture || this.FALLBACK_AVATAR,
            sub: user.sub || ""
        };
        localStorage.setItem(this.AUTH_STORAGE_KEY, JSON.stringify(cleanUser));
        this.renderAuthBox();
    },

    logout() {
        localStorage.removeItem(this.AUTH_STORAGE_KEY);
        this.renderAuthBox();
        if (typeof pushLog === "function") {
            pushLog("🚪 Выход из Google-аккаунта выполнен.");
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
            pushLog(`✅ Вход через Google выполнен: ${payload.name || payload.email}`);
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
        if (!this.GOOGLE_CLIENT_ID || this.GOOGLE_CLIENT_ID.startsWith("ВСТАВЬ_")) return;

        window.google.accounts.id.initialize({
            client_id: this.GOOGLE_CLIENT_ID,
            callback: (res) => this.handleCredentialResponse(res)
        });

        window.google.accounts.id.renderButton(target, {
            theme: "filled_black",
            size: "medium",
            shape: "pill",
            text: "signin_with"
        });
    },

    renderAuthBox() {
        const header = document.querySelector(".header");
        if (!header) return;

        let bar = document.getElementById("google-auth-bar");
        if (!bar) {
            bar = document.createElement("div");
            bar.id = "google-auth-bar";
            bar.style.cssText = `
                display:flex;align-items:center;justify-content:space-between;gap:8px;
                background:rgba(15,23,42,0.75);border:1px solid rgba(56,189,248,0.35);
                border-radius:14px;padding:8px 10px;margin-bottom:8px;
            `;
            header.prepend(bar);
        }

        const user = this.getUser();
        if (user) {
            bar.innerHTML = `
                <div style="display:flex;align-items:center;gap:8px;min-width:0;">
                    <img id="google-user-avatar" src="${user.picture}" alt="Avatar" style="width:28px;height:28px;border-radius:50%;object-fit:cover;">
                    <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                        <div style="font-size:12px;font-weight:700;color:#f8fafc;">${user.name}</div>
                        <div style="font-size:10px;color:#94a3b8;">${user.email}</div>
                    </div>
                </div>
                <button type="button" id="google-logout-btn" class="account-action-btn">Выйти</button>
            `;
            const avatar = bar.querySelector("#google-user-avatar");
            if (avatar) {
                avatar.onerror = () => {
                    avatar.src = this.FALLBACK_AVATAR;
                };
            }
            bar.querySelector("#google-logout-btn")?.addEventListener("click", () => this.logout());
        } else {
            bar.innerHTML = `
                <span style="font-size:11px;color:#cbd5e1;">🔐 Вход в профиль через Google:</span>
                <div style="display:flex;align-items:center;gap:6px;">
                    <div id="google-signin-btn-slot"></div>
                    <button type="button" id="google-quick-demo-btn" class="account-action-btn">Google Вход</button>
                </div>
            `;

            bar.querySelector("#google-quick-demo-btn")?.addEventListener("click", () => {
                if (window.google && window.google.accounts) {
                    window.google.accounts.id.prompt();
                } else {
                    const email = prompt("Введи свой Google-аккаунт:", "rockylenya@gmail.com");
                    if (!email) return;
                    this.saveUser({
                        name: email.split("@")[0],
                        email: email.trim(),
                        picture: this.FALLBACK_AVATAR
                    });
                }
            });

            this.initGoogleButton();
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    window.TapMonikaGoogleAuth.renderAuthBox();
    window.TapMonikaGoogleAuth.loadGoogleScript();
});