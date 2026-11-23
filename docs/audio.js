// ================= АУДИО-МОДУЛЬ TAPMONIKA (audio.js) v1.0 =================

window.TapMonikaAudio = {
    isMusicPlaying: false,

    toggleMusic(btnEl) {
        const bgMusic = document.getElementById("bg-music");
        if (!bgMusic) return;

        const lang = document.getElementById("lang-select")?.value || "ru";
        const t = (typeof translations !== "undefined" && translations[lang]) ? translations[lang] : (translations?.ru || {});

        if (!this.isMusicPlaying) {
            bgMusic.play().then(() => {
                this.isMusicPlaying = true;
                if (btnEl) {
                    btnEl.textContent = t.btn_music_off || "🎵 Выкл";
                    btnEl.classList.add("active");
                }
            }).catch(() => {});
        } else {
            bgMusic.pause();
            this.isMusicPlaying = false;
            if (btnEl) {
                btnEl.textContent = t.btn_music_on || "🎵 Вкл";
                btnEl.classList.remove("active");
            }
        }
    },

    playMeow(characterId) {
        const meowAudio = document.getElementById("meow-audio");
        if (!meowAudio) return;

        const src = (typeof catAudioMap !== "undefined" && catAudioMap[characterId])
            ? catAudioMap[characterId]
            : "audio/meow.mp3";

        if (meowAudio.getAttribute("src") !== src) {
            meowAudio.setAttribute("src", src);
        }
        meowAudio.currentTime = 0;
        meowAudio.play().catch(() => {});
    }
};