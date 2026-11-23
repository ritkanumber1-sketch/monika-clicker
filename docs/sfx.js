// ================= ЗВУКОВЫЕ ЭФФЕКТЫ ИНТЕРФЕЙСА (sfx.js) v1.0 =================

window.TapMonikaSfx = {
    ctx: null,

    getContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume().catch(() => {});
        }
        return this.ctx;
    },

    playTone(freq = 520, duration = 0.08, type = "sine") {
        const ctx = this.getContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    },

    buySound() {
        this.playTone(660, 0.09, "triangle");
        setTimeout(() => this.playTone(880, 0.1, "triangle"), 70);
    },

    rebirthSound() {
        this.playTone(440, 0.12, "sine");
        setTimeout(() => this.playTone(587, 0.12, "sine"), 100);
        setTimeout(() => this.playTone(784, 0.18, "sine"), 200);
    }
};