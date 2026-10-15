(function() {
    'use strict';
    window.computeSecureHash = function(obj) {
        if (typeof CORE_SALT === 'undefined') window.CORE_SALT = "Monika_Fortuna_Shield_v999_2026_Secure!";
        const raw = `${Math.floor(obj.score)}|${obj.tapPower}|${obj.passiveIncome}|${obj.maxEnergy}|${CORE_SALT}`;
        let hash = 5381;
        for (let i = 0; i < raw.length; i++) {
            hash = ((hash << 5) + hash) + raw.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    };

    let clickTimestamps = [];
    let lastTapTimestamp = 0;
    window.validateTapEvent = function(event) {
        if (event && !event.isTrusted) return false;
        const now = Date.now();
        if (now - lastTapTimestamp < 35) return false;
        lastTapTimestamp = now;
        clickTimestamps.push(now);
        clickTimestamps = clickTimestamps.filter(t => now - t <= 1000);
        if (clickTimestamps.length > 20) return false;
        return true;
    };

    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F12' || e.code === 'F12' || e.keyCode === 123) { e.preventDefault(); return false; }
        if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) { e.preventDefault(); return false; }
        if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) { e.preventDefault(); return false; }
    });
})();