let tg = window.Telegram?.WebApp;
if (tg) {
    try {
        tg.expand();
        if (tg.setHeaderColor) tg.setHeaderColor('#121216');
    } catch (e) {
        console.log(e);
    }
}

let score = parseInt(localStorage.getItem('monika_score')) || 0;
let maxEnergy = 1000;
let energy = localStorage.getItem('monika_energy') !== null ? parseInt(localStorage.getItem('monika_energy')) : 1000;
let clickPower = parseInt(localStorage.getItem('monika_power')) || 1;
let upgradeCost = parseInt(localStorage.getItem('monika_cost')) || 50;

let passiveIncome = parseInt(localStorage.getItem('monika_passive')) || 0;
let autoCost = parseInt(localStorage.getItem('monika_autocost')) || 200;
let lastClaimDate = parseInt(localStorage.getItem('monika_daily')) || 0;
let currentSkin = localStorage.getItem('monika_skin') || 'cat';

let socialStatus = { tg: false, yt: false, tk: false, x: false, vk: false, ds: false };
try {
    let savedSocials = localStorage.getItem('monika_socials');
    if (savedSocials) {
        socialStatus = JSON.parse(savedSocials);
    }
} catch (e) {
    console.log(e);
}

const scoreElement = document.getElementById('score');
const energyElement = document.getElementById('energy');
const maxEnergyElement = document.getElementById('max-energy');
const energyBar = document.getElementById('energy-bar');
const tapButton = document.getElementById('tap-button');
const upgradeBtn = document.getElementById('upgrade-btn');
const autoBtn = document.getElementById('auto-btn');
const dailyBtn = document.getElementById('daily-btn');
const refBtn = document.getElementById('ref-btn');
const leagueName = document.getElementById('league-name');
const leagueIcon = document.getElementById('league-icon');
const monikaImg = document.getElementById('monika-img');

const navBtns = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');
const skinBtns = document.querySelectorAll('.skin-btn');
const socialBtns = document.querySelectorAll('.social-btn');

applySkinImage(currentSkin);
updateUI();

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        
        navBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(t => t.classList.remove('active'));

        btn.classList.add('active');
        const targetElement = document.getElementById(`tab-${targetTab}`);
        if (targetElement) {
            targetElement.classList.add('active');
        }
    });
});

// Надежный и быстрый обработчик кликов/тапов
if (tapButton) {
    tapButton.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        
        if (energy >= clickPower) {
            score += clickPower;
            energy -= clickPower;
            
            if (tg && tg.HapticFeedback) {
                try { tg.HapticFeedback.impactOccurred('light'); } catch(e){}
            }

            saveData();
            updateUI();
            showFloatingText(event, `+${clickPower}`);
        }
    });
}

if (upgradeBtn) {
    upgradeBtn.addEventListener('click', () => {
        if (score >= upgradeCost) {
            score -= upgradeCost;
            clickPower += 1;
            upgradeCost = Math.floor(upgradeCost * 1.8);

            if (tg && tg.HapticFeedback) {
                try { tg.HapticFeedback.notificationOccurred('success'); } catch(e){}
            }

            saveData();
            updateUI();
        }
    });
}

if (autoBtn) {
    autoBtn.addEventListener('click', () => {
        if (score >= autoCost) {
            score -= autoCost;
            passiveIncome += 1;
            autoCost = Math.floor(autoCost * 2);

            if (tg && tg.HapticFeedback) {
                try { tg.HapticFeedback.notificationOccurred('success'); } catch(e){}
            }

            saveData();
            updateUI();
        }
    });
}

skinBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        let skin = btn.dataset.skin;
        
        if (skin === 'cat') {
            currentSkin = 'cat';
        } else if (skin === 'crown') {
            if (currentSkin === 'crown' || score >= 500) {
                if (currentSkin !== 'crown') score -= 500;
                currentSkin = 'crown';
            } else {
                alert('Нужно 500 монет! 🪙');
                return;
            }
        } else if (skin === 'rocket') {
            if (currentSkin === 'rocket' || score >= 1000) {
                if (currentSkin !== 'rocket') score -= 1000;
                currentSkin = 'rocket';
            } else {
                alert('Нужно 1000 монет! 🪙');
                return;
            }
        }

        applySkinImage(currentSkin);
        saveData();
        updateUI();
    });
});

function applySkinImage(skin) {
    if (!monikaImg) return;
    if (skin === 'crown') {
        monikaImg.src = "https://api.iconify.design/lucide:crown.svg?color=%23ffffff";
    } else if (skin === 'rocket') {
        monikaImg.src = "https://api.iconify.design/lucide:rocket.svg?color=%23ffffff";
    } else {
        monikaImg.src = "https://api.iconify.design/lucide:cat.svg?color=%23ffffff";
    }
}

socialBtns.forEach(btn => {
    let network = btn.dataset.social;
    
    if (socialStatus[network]) {
        btn.textContent = "✅ Выполнено (+300🪙)";
        btn.disabled = true;
    }

    btn.addEventListener('click', () => {
        if (socialStatus[network]) return;

        let links = {
            tg: "https://t.me/troy_login",
            yt: "https://www.youtube.com/@RockyLenya",
            tk: "https://tiktok.com/@troy_login",
            x: "https://x.com/troy_login",
            vk: "https://vk.com/troy_login",
            ds: "https://discord.gg/troy_kod"
        };

        if (tg && tg.openLink) {
            tg.openLink(links[network]);
        } else {
            window.open(links[network], '_blank');
        }

        setTimeout(() => {
            score += 300;
            socialStatus[network] = true;
            btn.textContent = "✅ Выполнено (+300🪙)";
            btn.disabled = true;

            if (tg && tg.HapticFeedback) {
                try { tg.HapticFeedback.notificationOccurred('success'); } catch(e){}
            }

            saveData();
            updateUI();
        }, 3000);
    });
});

if (refBtn) {
    refBtn.addEventListener('click', () => {
        let botUsername = "TapMonika_bot";
        let shareUrl = `https://t.me/share/url?url=https://t.me/${botUsername}&text=Тапай%20вместе%20со%20мной!%20🐾`;
        
        if (tg && tg.openTelegramLink) {
            tg.openTelegramLink(shareUrl);
        } else {
            window.open(shareUrl, '_blank');
        }
        
        score += 400;
        if (tg && tg.HapticFeedback) {
            try { tg.HapticFeedback.notificationOccurred('success'); } catch(e){}
        }
        saveData();
        updateUI();
    });
}

if (dailyBtn) {
    dailyBtn.addEventListener('click', () => {
        let now = Date.now();
        let oneDay = 24 * 60 * 60 * 1000;

        if (now - lastClaimDate >= oneDay) {
            score += 500;
            lastClaimDate = now;

            if (tg && tg.HapticFeedback) {
                try { tg.HapticFeedback.notificationOccurred('success'); } catch(e){}
            }

            saveData();
            updateUI();
            alert('Бонус получен: +500 монет! 🎁');
        } else {
            alert('Бонус доступен только раз в сутки!');
        }
    });
}

function updateLeague() {
    if (!leagueName) return;
    if (score < 1000) {
        leagueName.textContent = "Бронза";
        if (leagueIcon) leagueIcon.textContent = "🥉";
    } else if (score < 5000) {
        leagueName.textContent = "Серебро";
        if (leagueIcon) leagueIcon.textContent = "🥈";
    } else if (score < 15000) {
        leagueName.textContent = "Золото";
        if (leagueIcon) leagueIcon.textContent = "🥇";
    } else {
        leagueName.textContent = "Алмаз";
        if (leagueIcon) leagueIcon.textContent = "💎";
    }
}

function updateUI() {
    if (scoreElement) scoreElement.textContent = score;
    if (energyElement) energyElement.textContent = energy;
    if (maxEnergyElement) maxEnergyElement.textContent = maxEnergy;
    
    if (energyBar) {
        let energyPercent = (energy / maxEnergy) * 100;
        energyBar.style.width = energyPercent + '%';
    }

    updateLeague();

    if (upgradeBtn) {
        let titleEl = upgradeBtn.querySelector('.card-title');
        let priceEl = upgradeBtn.querySelector('.card-price');
        if (titleEl) titleEl.textContent = `Сила клика (+${clickPower})`;
        if (priceEl) priceEl.textContent = `🪙 ${upgradeCost}`;
        upgradeBtn.disabled = score < upgradeCost;
    }

    if (autoBtn) {
        let titleEl = autoBtn.querySelector('.card-title');
        let priceEl = autoBtn.querySelector('.card-price');
        if (titleEl) titleEl.textContent = `Авто-фарм (+${passiveIncome}/сек)`;
        if (priceEl) priceEl.textContent = `🪙 ${autoCost}`;
        autoBtn.disabled = score < autoCost;
    }
}

function saveData() {
    try {
        localStorage.setItem('monika_score', score);
        localStorage.setItem('monika_energy', energy);
        localStorage.setItem('monika_power', clickPower);
        localStorage.setItem('monika_cost', upgradeCost);
        localStorage.setItem('monika_passive', passiveIncome);
        localStorage.setItem('monika_autocost', autoCost);
        localStorage.setItem('monika_daily', lastClaimDate);
        localStorage.setItem('monika_skin', currentSkin);
        localStorage.setItem('monika_socials', JSON.stringify(socialStatus));
    } catch (e) {
        console.log(e);
    }
}

function showFloatingText(event, text) {
    if (!tapButton) return;
    const rect = tapButton.getBoundingClientRect();
    const x = event.clientX || (rect.left + rect.width / 2);
    const y = event.clientY || (rect.top + rect.height / 2);

    const el = document.createElement('div');
    el.className = 'floating-number';
    el.textContent = text;
    el.style.left = `${x - 20}px`;
    el.style.top = `${y - 40}px`;

    document.body.appendChild(el);

    setTimeout(() => {
        el.remove();
    }, 700);
}

setInterval(() => {
    if (passiveIncome > 0) {
        score += passiveIncome;
    }

    if (energy < maxEnergy) {
        energy += 10;
        if (energy > maxEnergy) {
            energy = maxEnergy;
        }
    }

    saveData();
    updateUI();
}, 1000);