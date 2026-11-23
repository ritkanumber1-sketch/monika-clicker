// ================= МЕНЮ TAPMONIKA STUDIO — КАЖДАЯ КНОПКА СВОЯ ССЫЛКА (sidebar.js) v3.2 =================

window.TapMonikaSidebar = {
    isOpen: false,
    telegramChatUrl: "https://t.me/+t6l3qzQXZRY0MTRI",

    pageRoutes: {
        "tab-game": { href: "paws.html", label: "🐾 Лапки (Кликер)" },
        "tab-cards": { href: "cards.html", label: "🃏 Легендарные Карточки" },
        "tab-gallery": { href: "album.html", label: "📸 Альбом (24 фото)" },
        "tab-rebirth": { href: "rebirth.html", label: "🌀 Перерождения" },
        "fish": { href: "fishing.html", label: "🐟 Мини-игра: Ловля рыбок" },
        "patrol": { href: "patrol.html", label: "🌙 Ночной обход двора" }
    },

    findDrawer() {
        return (
            document.getElementById("tapmonika-sidebar") ||
            document.querySelector("[data-tapmonika-sidebar]") ||
            document.querySelector("aside.sidebar, aside.drawer, .studio-sidebar")
        );
    },

    createDrawer() {
        const drawer = document.createElement("aside");
        drawer.id = "tapmonika-sidebar";
        drawer.setAttribute("data-tapmonika-sidebar", "true");
        drawer.style.cssText = `
            position: fixed; top: 0; left: -285px; width: 275px; height: 100%;
            background: rgba(15, 23, 42, 0.97); backdrop-filter: blur(16px);
            border-right: 1px solid rgba(244, 114, 182, 0.35);
            z-index: 200; padding: 14px; display: flex; flex-direction: column;
            gap: 8px; overflow-y: auto; transition: left 0.25s ease;
        `;

        drawer.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <b style="color:#f472b6;font-size:15px;">🐾 TapMonika Studio</b>
                <button id="sidebar-close-btn" type="button" class="account-action-btn">✕</button>
            </div>
            <div style="font-size:11px;color:#94a3b8;margin-top:4px;">Быстрый переход по страницам:</div>
            <button type="button" class="social-btn" data-jump="tab-game">🐾 Лапки (Кликер)</button>
            <button type="button" class="social-btn" data-jump="tab-cards">🃏 Легендарные Карточки</button>
            <button type="button" class="social-btn" data-jump="tab-gallery">📸 Альбом (24 фото)</button>
            <button type="button" class="social-btn" data-jump="tab-rebirth">🌀 Перерождения</button>
            <button type="button" class="social-btn" id="sidebar-fish-btn">🐟 Мини-игра: Ловля рыбок</button>
            <button type="button" class="social-btn" id="sidebar-patrol-btn">🌙 Ночной обход двора</button>
            <div style="margin-top:auto;font-size:11px;color:#cbd5e1;" id="sidebar-analytics-box"></div>
        `;

        document.body.appendChild(drawer);
        return drawer;
    },

    makeDirectPageLink(route) {
        const link = document.createElement("a");
        link.href = route.href;
        link.className = "social-btn tapmonika-direct-page-link";
        link.style.cssText = "display:block;text-decoration:none;";
        link.textContent = route.label;

        link.addEventListener("click", (e) => {
            e.stopPropagation();
            if (typeof saveCurrentProfile === "function") {
                saveCurrentProfile();
            }
            window.location.assign(route.href);
            e.preventDefault();
        });

        return link;
    },

    ensureTelegramChatButton(drawer) {
        if (!drawer || drawer.querySelector("#sidebar-telegram-chat-link")) return;

        const tgBtn = document.createElement("a");
        tgBtn.id = "sidebar-telegram-chat-link";
        tgBtn.href = this.telegramChatUrl;
        tgBtn.target = "_blank";
        tgBtn.rel = "noopener noreferrer";
        tgBtn.className = "social-btn";
        tgBtn.style.cssText = "display:block;text-decoration:none;border-color:rgba(56,189,248,0.45);";
        tgBtn.textContent = "💬 Чат Telegram";

        tgBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (typeof saveCurrentProfile === "function") {
                saveCurrentProfile();
            }
            if (
                window.Telegram &&
                window.Telegram.WebApp &&
                typeof window.Telegram.WebApp.openTelegramLink === "function"
            ) {
                e.preventDefault();
                window.Telegram.WebApp.openTelegramLink(this.telegramChatUrl);
            }
        });

        const analyticsBox = drawer.querySelector("#sidebar-analytics-box");
        if (analyticsBox) {
            drawer.insertBefore(tgBtn, analyticsBox);
        } else {
            drawer.appendChild(tgBtn);
        }
    },

    bindAllMenuButtons(drawer) {
        if (!drawer) return;

        drawer.querySelectorAll("[data-jump]").forEach((el) => {
            const key = el.getAttribute("data-jump");
            const route = this.pageRoutes[key];
            if (!route) return;
            el.replaceWith(this.makeDirectPageLink(route));
        });

        const fishEl = drawer.querySelector("#sidebar-fish-btn");
        if (fishEl) {
            fishEl.replaceWith(this.makeDirectPageLink(this.pageRoutes.fish));
        }

        const patrolEl = drawer.querySelector("#sidebar-patrol-btn");
        if (patrolEl) {
            patrolEl.replaceWith(this.makeDirectPageLink(this.pageRoutes.patrol));
        }

        this.ensureTelegramChatButton(drawer);
    },

    init() {
        let drawer = this.findDrawer();
        if (!drawer) {
            drawer = this.createDrawer();
        }

        if (!document.getElementById("sidebar-toggle-btn")) {
            const toggleBtn = document.createElement("button");
            toggleBtn.id = "sidebar-toggle-btn";
            toggleBtn.type = "button";
            toggleBtn.className = "account-action-btn";
            toggleBtn.textContent = "☰ Меню";

            const headerActions = document.querySelector(".header-action-buttons");
            if (headerActions) {
                headerActions.prepend(toggleBtn);
            }

            const setOpen = (open) => {
                this.isOpen = open;
                drawer.style.left = open ? "0px" : "-285px";
                const box = document.getElementById("sidebar-analytics-box");
                if (box && window.TapMonikaAnalytics) {
                    box.textContent = window.TapMonikaAnalytics.getSummaryText();
                }
            };

            toggleBtn.addEventListener("click", () => setOpen(!this.isOpen));
            drawer.querySelector("#sidebar-close-btn")?.addEventListener("click", () => setOpen(false));
        }

        this.bindAllMenuButtons(drawer);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    window.TapMonikaSidebar.init();
    setTimeout(() => {
        const d = window.TapMonikaSidebar.findDrawer();
        window.TapMonikaSidebar.bindAllMenuButtons(d);
    }, 200);
});