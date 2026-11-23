// ================= ПОЛНЫЙ ИГРОВОЙ СКРИПТ (script.js) v3.4 STUDIO EDITION =================

window.score = 0;
let tapPower = 1;
let passiveIncome = 0;
let energy = 1000;
let maxEnergy = 1000;
let energyRegenRate = 5;
let tapUpgradeCost = 20;
let autoUpgradeCost = 100;
let energyUpgradeCost = 250;
let regenUpgradeCost = 400;
let rebirthLevel = 0;
let rebirthMultiplier = 1;
let unlockedPhotos = [0, 1];
let cardLevels = {};
let claimedSocials = {};
let lastChestTime = 0;
let isNightMode = false;
let activityLog = ["Игра TapMonika запущена."];

let profiles = [{
    name: "Котёнок №1",
    score: 0,
    tapPower: 1,
    passiveIncome: 0,
    energy: 1000,
    maxEnergy: 1000,
    energyRegenRate: 5,
    tapUpgradeCost: 20,
    autoUpgradeCost: 100,
    energyUpgradeCost: 250,
    regenUpgradeCost: 400,
    rebirthLevel: 0,
    rebirthMultiplier: 1,
    unlockedPhotos: [0, 1],
    cardLevels: {},
    claimedSocials: {},
    lastChestTime: 0,
    isNightMode: false,
    activityLog: ["Игра TapMonika запущена."]
}];

let currentProfileIndex = 0;
let selectedCharacter = 'monika';
let activeCardCategory = 'pr';

const characters = [
    { id: 'monika', name: 'Монечка 🌸', img: 'images/monika.jpg' },
    { id: 'fortune', name: 'Фортуночка 🍀', img: 'images/fortune.jpg' },
    { id: 'sarabi', name: 'Сараби 👑', img: 'images/sarabi.jpg' }
];

document.addEventListener('DOMContentLoaded', () => {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
    }

    loadProfilesData();
    updateCatAgeBanner();
    applyThemeMode();
    renderActivityLog();
    initClicker();
    initSpacebarBoost();
    initTabs();
    initUpgrades();
    initCardCategories();
    renderBusinessCards();
    renderGallery();
    initReferralCopy();
    initSocialTasks();
    initChest();
    initProfilesAndCharacters();
    initMusicPlayer();
    initThemeAndBackup();
    initLanguageSelector();

    setInterval(() => {
        const charBonus = (typeof catAgeInfo !== 'undefined' && catAgeInfo[selectedCharacter])
            ? catAgeInfo[selectedCharacter].passiveBonus
            : 0;
        const totalPassive = passiveIncome + charBonus;
        window.score += totalPassive;
        energy = Math.min(maxEnergy, energy + energyRegenRate);
        updateDisplay();
        saveCurrentProfile();
    }, 1000);
});

function pushLog(message) {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    activityLog = [`[${timeStr}] ${message}`, ...activityLog].slice(0, 15);
    const ticker = document.getElementById('event-ticker');
    if (ticker) ticker.textContent = message;
    renderActivityLog();
}

function renderActivityLog() {
    const listEl = document.getElementById('activity-log');
    if (!listEl) return;
    listEl.innerHTML = activityLog.map(entry => `<li>${entry}</li>`).join('');
}

function getEffectiveTapPower() {
    const charBonus = (typeof catAgeInfo !== 'undefined' && catAgeInfo[selectedCharacter])
        ? catAgeInfo[selectedCharacter].tapBonus
        : 0;
    const nightMult = isNightMode ? 2 : 1;
    return (tapPower + charBonus) * rebirthMultiplier * nightMult;
}

function getLeagueName() {
    const lang = document.getElementById('lang-select')?.value || 'ru';
    if (window.score >= 50000) return lang === 'en' ? "Royal Cat 👑" : "Королевский Кот 👑";
    if (window.score >= 10000) return lang === 'en' ? "Golden Paw 🥇" : "Золотая Лапка 🥇";
    if (window.score >= 2000) return lang === 'en' ? "Purr Master 🥈" : "Мур-Мастер 🥈";
    return translations[lang]?.league_kitten || "Маленький Котёнок 🥉";
}

function playCatMeow() {
    const meowAudio = document.getElementById('meow-audio');
    if (!meowAudio) return;
    const customSrc = (typeof catAudioMap !== 'undefined' && catAudioMap[selectedCharacter])
        ? catAudioMap[selectedCharacter]
        : 'audio/meow.mp3';
    if (meowAudio.getAttribute('src') !== customSrc) {
        meowAudio.setAttribute('src', customSrc);
    }
    meowAudio.currentTime = 0;
    meowAudio.play().catch(() => {});
}

function spawnFloatingGain(x, y, amount) {
    const el = document.createElement('div');
    el.className = 'floating-gain';
    el.textContent = `+${Math.floor(amount).toLocaleString()}`;
    el.style.left = `${x || window.innerWidth / 2}px`;
    el.style.top = `${y || window.innerHeight / 2}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
}

function triggerTapAction(clientX, clientY, event) {
    if (typeof window.validateTapEvent === 'function' && event && !window.validateTapEvent(event)) {
        return;
    }
    if (energy < 1) return;

    const tapButton = document.getElementById('tap-button');
    energy = Math.max(0, energy - 1);
    const gain = getEffectiveTapPower();
    window.score += gain;

    if (tapButton) {
        tapButton.classList.add('tapped');
        setTimeout(() => tapButton.classList.remove('tapped'), 140);
    }

    playCatMeow();
    spawnFloatingGain(clientX, clientY, gain);
    updateDisplay();
}

function initClicker() {
    const tapButton = document.getElementById('tap-button');
    if (!tapButton) return;

    tapButton.addEventListener('click', (event) => {
        triggerTapAction(event.clientX, event.clientY, event);
    });
}

let baseTapPowerBeforeSpace = 1;
function initSpacebarBoost() {
    document.addEventListener('keydown', (e) => {
        if ((e.code === 'Space' || e.key === ' ') && !e.repeat) {
            e.preventDefault();
            if (tapPower < 200000) {
                baseTapPowerBeforeSpace = tapPower;
                tapPower = baseTapPowerBeforeSpace * 200000;
            } else {
                tapPower *= 200000;
            }
            pushLog("Активирован супер-буст по Пробелу!");
            triggerTapAction(window.innerWidth / 2, window.innerHeight / 2, null);
        }
    });
}

function updateDisplay() {
    const scoreVal = document.getElementById('score-val');
    const tapPowerVal = document.getElementById('tap-power-val');
    const passiveIncomeVal = document.getElementById('passive-income-val');
    const energyVal = document.getElementById('energy-val');
    const maxEnergyVal = document.getElementById('max-energy-val');
    const regenRateVal = document.getElementById('regen-rate-val');
    const energyBar = document.getElementById('energy-bar');
    const leagueEl = document.getElementById('player-league');

    const tapCostEl = document.getElementById('tap-cost-val');
    const autoCostEl = document.getElementById('auto-cost-val');
    const energyCostEl = document.getElementById('energy-cost-val');
    const regenCostEl = document.getElementById('regen-cost-val');

    const charBonusPassive = (typeof catAgeInfo !== 'undefined' && catAgeInfo[selectedCharacter])
        ? catAgeInfo[selectedCharacter].passiveBonus
        : 0;

    if (scoreVal) scoreVal.innerText = Math.floor(window.score).toLocaleString();
    if (tapPowerVal) tapPowerVal.innerText = Math.floor(getEffectiveTapPower()).toLocaleString();
    if (passiveIncomeVal) passiveIncomeVal.innerText = Math.floor(passiveIncome + charBonusPassive).toLocaleString();
    if (energyVal) energyVal.innerText = Math.floor(energy);
    if (maxEnergyVal) maxEnergyVal.innerText = maxEnergy;
    if (regenRateVal) regenRateVal.innerText = energyRegenRate;
    if (energyBar) energyBar.style.width = `${Math.max(0, Math.min(100, (energy / maxEnergy) * 100))}%`;
    if (leagueEl) leagueEl.textContent = getLeagueName();

    if (tapCostEl) tapCostEl.textContent = tapUpgradeCost.toLocaleString();
    if (autoCostEl) autoCostEl.textContent = autoUpgradeCost.toLocaleString();
    if (energyCostEl) energyCostEl.textContent = energyUpgradeCost.toLocaleString();
    if (regenCostEl) regenCostEl.textContent = regenUpgradeCost.toLocaleString();

    updateRebirthUI();
    updateChestTimer();
}

function updateCatAgeBanner() {
    const realAgeEl = document.getElementById('cat-real-age');
    const humanAgeEl = document.getElementById('cat-human-age');
    const lang = document.getElementById('lang-select')?.value || 'ru';
    const info = (typeof catAgeInfo !== 'undefined' && catAgeInfo[selectedCharacter]) ? catAgeInfo[selectedCharacter] : null;
    if (!info || !realAgeEl || !humanAgeEl) return;

    if (lang === 'en') {
        realAgeEl.textContent = info.realAgeEn;
        humanAgeEl.textContent = info.humanAgeEn;
    } else {
        realAgeEl.textContent = info.realAgeRu;
        humanAgeEl.textContent = info.humanAgeRu;
    }
}

function applyThemeMode() {
    const root = document.getElementById('app-root');
    const btn = document.getElementById('theme-toggle-btn');
    const modeBadge = document.getElementById('mode-indicator');
    if (!root) return;

    root.classList.toggle('night-mode', isNightMode);
    if (btn) {
        btn.textContent = isNightMode ? "☀️ День / Дом" : "🌙 Ночь / Обход";
    }
    if (modeBadge) {
        modeBadge.textContent = isNightMode ? "🌙 Ночь (x2 тап)" : "☀️ День / Дом";
    }
}

function initThemeAndBackup() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            isNightMode = !isNightMode;
            applyThemeMode();
            pushLog(isNightMode ? "Включён ночной обход двора (бонус x2 к тапу)." : "Включён дневной домашний режим.");
            updateDisplay();
            saveCurrentProfile();
        });
    }

    const exportBtn = document.getElementById('export-save-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const payload = JSON.stringify({
                score: Math.floor(window.score),
                tapPower,
                passiveIncome,
                maxEnergy,
                energyRegenRate,
                rebirthLevel,
                rebirthMultiplier,
                unlockedPhotos,
                cardLevels
            });
            navigator.clipboard?.writeText(payload).catch(() => {});
            pushLog("Код сохранения скопирован в буфер обмена.");
            alert("Код сохранения скопирован! 📋");
        });
    }

    const importBtn = document.getElementById('import-save-btn');
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            const raw = prompt("Вставь сохранённый код профиля:");
            if (!raw) return;
            try {
                const parsed = JSON.parse(raw);
                if (typeof parsed.score === 'number') window.score = Math.max(0, parsed.score);
                if (typeof parsed.tapPower === 'number') tapPower = Math.max(1, parsed.tapPower);
                if (typeof parsed.passiveIncome === 'number') passiveIncome = Math.max(0, parsed.passiveIncome);
                if (typeof parsed.maxEnergy === 'number') maxEnergy = Math.max(1000, parsed.maxEnergy);
                if (typeof parsed.energyRegenRate === 'number') energyRegenRate = Math.max(5, parsed.energyRegenRate);
                if (typeof parsed.rebirthLevel === 'number') rebirthLevel = Math.max(0, parsed.rebirthLevel);
                if (typeof parsed.rebirthMultiplier === 'number') rebirthMultiplier = Math.max(1, parsed.rebirthMultiplier);
                if (Array.isArray(parsed.unlockedPhotos)) unlockedPhotos = parsed.unlockedPhotos;
                if (parsed.cardLevels && typeof parsed.cardLevels === 'object') cardLevels = parsed.cardLevels;
                energy = maxEnergy;
                renderBusinessCards();
                renderGallery();
                updateDisplay();
                saveCurrentProfile();
                pushLog("Прогресс успешно загружен из кода сохранения.");
                alert("Сохранение загружено! ✨");
            } catch (e) {
                alert("Некорректный код сохранения!");
            }
        });
    }

    const resetBtn = document.getElementById('reset-profile-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (!confirm("Обнулить прогресс текущего профиля?")) return;
            window.score = 0;
            tapPower = 1;
            passiveIncome = 0;
            energy = 1000;
            maxEnergy = 1000;
            energyRegenRate = 5;
            tapUpgradeCost = 20;
            autoUpgradeCost = 100;
            energyUpgradeCost = 250;
            regenUpgradeCost = 400;
            rebirthLevel = 0;
            rebirthMultiplier = 1;
            unlockedPhotos = [0, 1];
            cardLevels = {};
            claimedSocials = {};
            lastChestTime = 0;
            renderBusinessCards();
            renderGallery();
            updateDisplay();
            saveCurrentProfile();
            pushLog("Текущий профиль сброшен до стартовых значений.");
        });
    }
}

function initTabs() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabSections = document.querySelectorAll('.tab-section');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTabId = btn.getAttribute('data-tab');
            navButtons.forEach(b => b.classList.remove('active'));
            tabSections.forEach(s => s.classList.remove('active'));
            btn.classList.add('active');
            const targetSection = document.getElementById(targetTabId);
            if (targetSection) targetSection.classList.add('active');
        });
    });
}

function initUpgrades() {
    const buyTapBtn = document.getElementById('buy-tap-upgrade');
    if (buyTapBtn) {
        buyTapBtn.addEventListener('click', () => {
            if (window.score >= tapUpgradeCost) {
                window.score -= tapUpgradeCost;
                tapPower += 1;
                tapUpgradeCost = Math.floor(tapUpgradeCost * 1.45);
                pushLog("Куплена мягкая подушечка (+1 к силе лапки).");
                updateDisplay();
                saveCurrentProfile();
            } else {
                alert("Мяу! Не хватает рыбок! 😿");
            }
        });
    }

    const buyAutoBtn = document.getElementById('buy-auto-upgrade');
    if (buyAutoBtn) {
        buyAutoBtn.addEventListener('click', () => {
            if (window.score >= autoUpgradeCost) {
                window.score -= autoUpgradeCost;
                passiveIncome += 2;
                autoUpgradeCost = Math.floor(autoUpgradeCost * 1.5);
                pushLog("Куплена мисочка с паштетом (+2/с к мур-доходу).");
                updateDisplay();
                saveCurrentProfile();
            } else {
                alert("Мяу! Не хватает рыбок! 😿");
            }
        });
    }

    const buyEnergyBtn = document.getElementById('buy-energy-upgrade');
    if (buyEnergyBtn) {
        buyEnergyBtn.addEventListener('click', () => {
            if (window.score >= energyUpgradeCost) {
                window.score -= energyUpgradeCost;
                maxEnergy += 250;
                energy = maxEnergy;
                energyUpgradeCost = Math.floor(energyUpgradeCost * 1.55);
                pushLog("Куплен большой лежак (+250 к бодрости).");
                updateDisplay();
                saveCurrentProfile();
            } else {
                alert("Мяу! Не хватает рыбок на лежак! 😿");
            }
        });
    }

    const buyRegenBtn = document.getElementById('buy-regen-upgrade');
    if (buyRegenBtn) {
        buyRegenBtn.addEventListener('click', () => {
            if (window.score >= regenUpgradeCost) {
                window.score -= regenUpgradeCost;
                energyRegenRate += 3;
                regenUpgradeCost = Math.floor(regenUpgradeCost * 1.6);
                pushLog("Куплена мятная игрушка (+3 к регенерации бодрости).");
                updateDisplay();
                saveCurrentProfile();
            } else {
                alert("Мяу! Не хватает рыбок на игрушку! 😿");
            }
        });
    }
}

function getRebirthCost() {
    return 5000 * (rebirthLevel + 1);
}

function updateRebirthUI() {
    const lvlEl = document.getElementById('rebirthCountText');
    const multEl = document.getElementById('currentMultiplierText');
    const costEl = document.getElementById('rebirthCostText');
    if (lvlEl) lvlEl.textContent = rebirthLevel;
    if (multEl) multEl.textContent = `x${rebirthMultiplier}`;
    if (costEl) costEl.textContent = getRebirthCost().toLocaleString();
}

window.doRebirth = function() {
    const cost = getRebirthCost();
    if (window.score < cost) {
        alert(`Нужно хотя бы ${cost.toLocaleString()} 🪙 для перерождения!`);
        return;
    }
    rebirthLevel += 1;
    rebirthMultiplier = 1 + rebirthLevel;
    window.score = 0;
    tapPower = 1;
    passiveIncome = 0;
    tapUpgradeCost = 20;
    autoUpgradeCost = 100;
    energy = maxEnergy;
    updateDisplay();
    saveCurrentProfile();
    pushLog(`Выполнено перерождение #${rebirthLevel} (множитель x${rebirthMultiplier}).`);
    alert(`Перерождение #${rebirthLevel} готово! Множитель клика теперь x${rebirthMultiplier}! 🌀`);
};

function initCardCategories() {
    document.querySelectorAll('.card-category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.card-category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCardCategory = btn.getAttribute('data-cat') || 'pr';
            renderBusinessCards();
        });
    });
}

function getCardPrice(card) {
    const lvl = cardLevels[card.id] || 0;
    return Math.floor(card.baseCost * Math.pow(card.costMult, lvl));
}

function renderBusinessCards() {
    const container = document.getElementById('business-cards-container');
    if (!container || typeof allHamsterCatCards === 'undefined') return;

    container.innerHTML = '';
    const cards = allHamsterCatCards.filter(c => c.cat === activeCardCategory);

    cards.forEach(card => {
        const lvl = cardLevels[card.id] || 0;
        const price = getCardPrice(card);
        const locked = card.reqCard && ((cardLevels[card.reqCard] || 0) < card.reqLvl);
        const fallbackEmoji = card.fallback || '🃏';

        const item = document.createElement('div');
        item.className = 'card-item';
        item.innerHTML = `
            <div class="card-left">
                ${card.img
                    ? `<img class="card-thumb" src="${card.img}" alt="${card.name}">`
                    : `<div class="card-fallback-icon">${fallbackEmoji}</div>`
                }
                <div class="card-info">
                    <span class="card-name">${card.name} (Ур. ${lvl})</span>
                    <span class="card-cost">+${card.baseIncome}/с • Цена: ${price.toLocaleString()} 🪙</span>
                    ${locked ? `<span style="font-size:10px;color:#f87171;">Нужен ур. ${card.reqLvl} карточки ${card.reqCard}</span>` : ''}
                </div>
            </div>
            <button class="action-btn" type="button" ${locked ? 'disabled' : ''}>Купить</button>
        `;

        const thumbImg = item.querySelector('img.card-thumb');
        if (thumbImg) {
            thumbImg.addEventListener('error', () => {
                const badge = document.createElement('div');
                badge.className = 'card-fallback-icon';
                badge.textContent = fallbackEmoji;
                thumbImg.replaceWith(badge);
            }, { once: true });
        }

        const btn = item.querySelector('button');
        btn.addEventListener('click', () => {
            if (locked) return;
            if (window.score >= price) {
                window.score -= price;
                cardLevels[card.id] = lvl + 1;
                passiveIncome += card.baseIncome;
                pushLog(`Прокачана карточка «${card.name}» до ур. ${lvl + 1}.`);
                updateDisplay();
                renderBusinessCards();
                saveCurrentProfile();
            } else {
                alert("Не хватает монеток на карточку! 😿");
            }
        });

        container.appendChild(item);
    });
}

function renderGallery() {
    const container = document.getElementById('gallery-container');
    if (!container || typeof galleryPhotos === 'undefined') return;

    container.innerHTML = '';
    galleryPhotos.forEach((photo, index) => {
        const isUnlocked = unlockedPhotos.includes(index);
        const box = document.createElement('div');
        box.className = 'gallery-item';

        if (isUnlocked) {
            box.innerHTML = `<img src="${photo.src}" alt="${photo.title || 'Cat'}">`;
            const imgEl = box.querySelector('img');
            imgEl?.addEventListener('error', () => {
                box.innerHTML = `<div class="gallery-slot-placeholder"><span>🐾</span><b>${photo.title || `Фото #${index + 1}`}</b></div>`;
            }, { once: true });
        } else {
            box.innerHTML = `<div class="gallery-slot-placeholder"><span>🔒 ${photo.cost} 🪙</span><small>${photo.title || `#${index + 1}`}</small></div>`;
        }

        box.addEventListener('click', () => {
            if (isUnlocked) {
                const mainImg = document.getElementById('main-character-img');
                if (mainImg && photo.src) mainImg.src = photo.src;
                pushLog(`Выбрано фото из альбома: ${photo.title || `#${index + 1}`}.`);
                return;
            }
            if (window.score >= photo.cost) {
                window.score -= photo.cost;
                unlockedPhotos.push(index);
                pushLog(`Открыто фото в альбоме: ${photo.title || `#${index + 1}`}.`);
                updateDisplay();
                renderGallery();
                saveCurrentProfile();
            } else {
                alert("Нужно больше рыбок, чтобы открыть фоточку! 😿");
            }
        });

        container.appendChild(box);
    });
}

function initReferralCopy() {
    const copyBtn = document.getElementById('copy-ref-btn');
    const refInput = document.getElementById('ref-link-input');
    if (!copyBtn || !refInput) return;

    copyBtn.addEventListener('click', () => {
        navigator.clipboard?.writeText(refInput.value).catch(() => {});
        window.score += 1000;
        pushLog("Скопирована реферальная ссылка (+1000 🪙).");
        updateDisplay();
        saveCurrentProfile();
        alert("Ссылка скопирована! Начислено +1000 🪙! 🐾");
    });
}

function initSocialTasks() {
    document.querySelectorAll('.social-btn').forEach(btn => {
        const key = btn.getAttribute('data-social');
        if (claimedSocials[key]) btn.classList.add('completed');

        btn.addEventListener('click', () => {
            const url = (typeof socialLinks !== 'undefined' && socialLinks[key])
                ? socialLinks[key]
                : 'https://t.me/+t6l3qzQXZRY0MTRI';
            window.open(url, '_blank');

            if (key !== 'donate' && !claimedSocials[key]) {
                claimedSocials[key] = true;
                btn.classList.add('completed');
                setTimeout(() => {
                    window.score += 300;
                    pushLog(`Выполнено задание канала «${key}» (+300 🪙).`);
                    updateDisplay();
                    saveCurrentProfile();
                    alert("Муррр! +300 рыбок за подписку! 🐾💖");
                }, 1500);
            }
        });
    });
}

function initChest() {
    const openBtn = document.getElementById('open-chest-btn');
    if (!openBtn) return;

    openBtn.addEventListener('click', () => {
        const now = Date.now();
        const cooldown = 12 * 60 * 60 * 1000;
        if (now - lastChestTime < cooldown) {
            alert("Коробочка ещё закрыта! Загляни позже 🐾");
            return;
        }
        lastChestTime = now;
        const reward = 500 + (rebirthLevel * 250);
        window.score += reward;
        pushLog(`Открыта волшебная коробочка (+${reward} 🪙).`);
        updateDisplay();
        saveCurrentProfile();
        alert(`Ты прыгнул в коробку и нашёл +${reward} 🪙! 🎁`);
    });
}

function updateChestTimer() {
    const timerEl = document.getElementById('chest-timer');
    if (!timerEl) return;
    const cooldown = 12 * 60 * 60 * 1000;
    const left = cooldown - (Date.now() - lastChestTime);
    if (left <= 0 || !lastChestTime) {
        timerEl.textContent = "Коробочка открыта! Можно забирать подарок ✨";
    } else {
        const hours = Math.floor(left / (1000 * 60 * 60));
        const mins = Math.floor((left % (1000 * 60 * 60)) / (1000 * 60));
        timerEl.textContent = `Следующая коробка через: ${hours}ч ${mins}м`;
    }
}

function initProfilesAndCharacters() {
    const addAccBtn = document.getElementById('add-account-btn');
    if (addAccBtn) {
        addAccBtn.addEventListener('click', () => {
            const newName = prompt("🐾 Введи имя нового кото-профиля:", `Котёнок №${profiles.length + 1}`);
            if (newName && newName.trim() !== "") {
                profiles.push({
                    name: newName.trim(),
                    score: 0,
                    tapPower: 1,
                    passiveIncome: 0,
                    energy: 1000,
                    maxEnergy: 1000,
                    energyRegenRate: 5,
                    tapUpgradeCost: 20,
                    autoUpgradeCost: 100,
                    energyUpgradeCost: 250,
                    regenUpgradeCost: 400,
                    rebirthLevel: 0,
                    rebirthMultiplier: 1,
                    unlockedPhotos: [0, 1],
                    cardLevels: {},
                    claimedSocials: {},
                    lastChestTime: 0,
                    isNightMode: false,
                    activityLog: [`Создан профиль «${newName.trim()}».`]
                });
                currentProfileIndex = profiles.length - 1;
                saveProfilesData();
                updateAccountDropdown();
                loadProfileData();
            }
        });
    }

    const accountSelect = document.getElementById('account-select');
    if (accountSelect) {
        accountSelect.addEventListener('change', (e) => {
            currentProfileIndex = parseInt(e.target.value, 10) || 0;
            loadProfileData();
        });
    }

    document.querySelectorAll('.char-avatar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.char-avatar-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (btn.id === 'char-monika-btn') selectedCharacter = 'monika';
            if (btn.id === 'char-fortune-btn') selectedCharacter = 'fortune';
            if (btn.id === 'char-sarabi-btn') selectedCharacter = 'sarabi';

            const mainImg = document.getElementById('main-character-img');
            const targetChar = characters.find(c => c.id === selectedCharacter);
            if (mainImg && targetChar) {
                mainImg.src = targetChar.img;
            }
            playCatMeow();
            updateCatAgeBanner();
            updateDisplay();
            pushLog(`Выбран персонаж: ${targetChar ? targetChar.name : selectedCharacter}.`);
        });
    });
}

function initMusicPlayer() {
    const musicBtn = document.getElementById('music-toggle-btn');
    const bgMusic = document.getElementById('bg-music');

    if (musicBtn && bgMusic) {
        let isMusicPlaying = false;
        musicBtn.addEventListener('click', () => {
            const currentLang = document.getElementById('lang-select')?.value || 'ru';
            const t = (typeof translations !== 'undefined' && translations[currentLang]) ? translations[currentLang] : translations.ru;

            if (!isMusicPlaying) {
                bgMusic.play().then(() => {
                    isMusicPlaying = true;
                    musicBtn.textContent = t.btn_music_off || "🎵 Выкл";
                    musicBtn.classList.add('active');
                }).catch(() => {});
            } else {
                bgMusic.pause();
                isMusicPlaying = false;
                musicBtn.textContent = t.btn_music_on || "🎵 Вкл";
                musicBtn.classList.remove('active');
            }
        });
    }
}

function initLanguageSelector() {
    const langSelect = document.getElementById('lang-select');
    if (!langSelect) return;

    const savedLang = localStorage.getItem('tapMonika_lang') || 'ru';
    langSelect.value = savedLang;
    applyGlobalLanguage(savedLang);

    langSelect.addEventListener('change', (e) => {
        const chosenLang = e.target.value;
        localStorage.setItem('tapMonika_lang', chosenLang);
        applyGlobalLanguage(chosenLang);
        updateCatAgeBanner();
        updateDisplay();
    });
}

function applyGlobalLanguage(langCode) {
    if (typeof translations === 'undefined') return;
    const t = translations[langCode] || translations.ru;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t && t[key]) {
            el.textContent = t[key];
        }
    });
}

function loadProfilesData() {
    const saved = localStorage.getItem('tapMonika_profiles_v3');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                profiles = parsed;
            }
        } catch (e) {}
    }
    loadProfileData();
    updateAccountDropdown();
}

function loadProfileData() {
    const p = profiles[currentProfileIndex] || profiles[0];
    window.score = p.score || 0;
    tapPower = p.tapPower || 1;
    passiveIncome = p.passiveIncome || 0;
    energy = p.energy ?? 1000;
    maxEnergy = p.maxEnergy ?? 1000;
    energyRegenRate = p.energyRegenRate ?? 5;
    tapUpgradeCost = p.tapUpgradeCost ?? 20;
    autoUpgradeCost = p.autoUpgradeCost ?? 100;
    energyUpgradeCost = p.energyUpgradeCost ?? 250;
    regenUpgradeCost = p.regenUpgradeCost ?? 400;
    rebirthLevel = p.rebirthLevel || 0;
    rebirthMultiplier = p.rebirthMultiplier || 1;
    unlockedPhotos = Array.isArray(p.unlockedPhotos) ? p.unlockedPhotos : [0, 1];
    cardLevels = p.cardLevels || {};
    claimedSocials = p.claimedSocials || {};
    lastChestTime = p.lastChestTime || 0;
    isNightMode = Boolean(p.isNightMode);
    activityLog = Array.isArray(p.activityLog) && p.activityLog.length > 0 ? p.activityLog : ["Профиль загружен."];

    applyThemeMode();
    renderActivityLog();
    renderBusinessCards();
    renderGallery();
    updateDisplay();
}

function saveCurrentProfile() {
    if (!profiles[currentProfileIndex]) return;
    profiles[currentProfileIndex] = {
        ...profiles[currentProfileIndex],
        score: window.score,
        tapPower,
        passiveIncome,
        energy,
        maxEnergy,
        energyRegenRate,
        tapUpgradeCost,
        autoUpgradeCost,
        energyUpgradeCost,
        regenUpgradeCost,
        rebirthLevel,
        rebirthMultiplier,
        unlockedPhotos,
        cardLevels,
        claimedSocials,
        lastChestTime,
        isNightMode,
        activityLog
    };
    saveProfilesData();
}

function saveProfilesData() {
    localStorage.setItem('tapMonika_profiles_v3', JSON.stringify(profiles));
}

function updateAccountDropdown() {
    const select = document.getElementById('account-select');
    if (!select) return;
    select.innerHTML = '';
    profiles.forEach((p, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = p.name;
        if (idx === currentProfileIndex) opt.selected = true;
        select.appendChild(opt);
    });
}