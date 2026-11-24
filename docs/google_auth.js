// ================= МОДУЛЬ GOOGLE-АККАУНТА TAPMONIKA (google_auth.js) v1.0 =================

window.TapMonikaGoogleAuth = {
    STORAGE_KEY: "tapMonika_google_user_v1",

    getUser() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            return parsed && parsed.email ? parsed : null;
        } catch (e) {
            return null;
        }
    },

    isSignedIn() {
        return Boolean(this.getUser());
    },

    signIn(emailInput, nameInput) {
        const email = (emailInput || "").trim();
        if (!email || !email.includes("@")) {
            if (typeof showGameToast === "function") {
                showGameToast("Введи корректный адрес Google-аккаунта (@gmail.com)");
            }
            return false;
        }
        const cleanName = (nameInput || email.split("@")[0] || "Google Пользователь").trim();
        const userObj = {
            email,
            name: cleanName,
            signedInAt: Date.now()
        };
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userObj));
        } catch (e) {}

        this.notifyChange();
        if (typeof pushLog === "function") {
            pushLog(`Выполнен вход в Google-аккаунт: ${cleanName} (${email}).`);
        }
        if (typeof showGameToast === "function") {
            showGameToast(`Вход выполнен: ${cleanName} ✅`);
        }
        return true;
    },

    promptSignIn() {
        const email = prompt("Введи почту Google-аккаунта (например, masha@gmail.com):", "");
        if (!email) return;
        const name = prompt("Имя профиля в Google:", email.split("@")[0]);
        this.signIn(email, name);
    },

    signOut() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
        } catch (e) {}
        this.notifyChange();
        if (typeof pushLog === "function") {
            pushLog("Выполнен выход из Google-аккаунта.");
        }
        if (typeof showGameToast === "function") {
            showGameToast("Выход из Google-аккаунта выполнен");
        }
    },

    notifyChange() {
        if (window.TapMonikaSubscribers && typeof window.TapMonikaSubscribers.render === "function") {
            window.TapMonikaSubscribers.render();
        }
    }
};