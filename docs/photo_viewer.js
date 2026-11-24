// ================= ПРОСМОТРЩИК ФОТО ИЗ АЛЬБОМА (photo_viewer.js) v1.1 =================

window.TapMonikaPhotoViewer = {
    open(photo) {
        if (!photo || !photo.src) return;
        this.close();

        const overlay = document.createElement("div");
        overlay.id = "tapmonika-photo-modal";
        overlay.style.cssText = `
            position: fixed; inset: 0; background: rgba(5, 8, 20, 0.88);
            backdrop-filter: blur(10px); z-index: 200;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            padding: 18px; gap: 12px;
        `;

        overlay.innerHTML = `
            <div style="max-width:360px;width:100%;background:#1e293b;border:1px solid rgba(244,114,182,0.45);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:10px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <b style="color:#f8fafc;font-size:14px;">${photo.title || "Фоточка пушистика"}</b>
                    <button id="photo-modal-close" type="button" class="account-action-btn">✕</button>
                </div>
                <img src="${photo.src}" alt="${photo.title || "Cat"}" style="width:100%;max-height:280px;object-fit:cover;border-radius:12px;">
                <div style="display:flex;gap:8px;">
                    <button id="photo-modal-set-main" type="button" class="action-btn-large">Поставить на главный тап 🐾</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.querySelector("#photo-modal-close")?.addEventListener("click", () => this.close());
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) this.close();
        });

        overlay.querySelector("#photo-modal-set-main")?.addEventListener("click", () => {
            const mainImg = document.getElementById("main-character-img");
            if (mainImg) mainImg.src = photo.src;
            if (typeof activePhotoSrc !== "undefined") {
                activePhotoSrc = photo.src;
            }
            if (typeof saveCurrentProfile === "function") {
                saveCurrentProfile();
            }
            if (typeof pushLog === "function") {
                pushLog(`Установлено главное фото: ${photo.title || photo.src}.`);
            }
            if (typeof showGameToast === "function") {
                showGameToast(`Главное фото: ${photo.title || "Фоточка"} 🐾`);
            }
            this.close();
        });
    },

    close() {
        document.getElementById("tapmonika-photo-modal")?.remove();
    }
};

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        window.TapMonikaPhotoViewer?.close();
    }
});