// ================= ИГРОВОЙ СКРИПТ (script.js) TAPMONIKA STUDIO =================

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

let activeTabId = 'tab-game';
let activePhotoSrc = 'images/monika.jpg';
let spaceBoostUntil = 0;
let spaceBoostCooldownUntil = 0;
let lastPointerTapTime = 0;
let resetConfirmUntil = 0;
let toastTimer = null;

function createDefaultProfile(name = "Котёнок №1") {
    return {
        name,
        selectedCharacter: 'monika',
        activePhotoSrc: 'images/monika.jpg',
        activeTab: 'tab-game',
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
        activityLog: [`Профиль «${name}» готов к игре.`]
    };
}

let profiles = [createDefaultProfile("Котёнок №1")];
let currentProfileIndex = 0;
let selectedCharacter = 'monika';
let activeCardCategory = 'pr';

const characters = [
    { id: 'monika', name: 'Монечка 🌸', img: 'images/monika.jpg' },
    { id: 'fortune', name: 'Фортуночка 🍀', img: 'images/fortune.jpg' },
    { id: 'sarabi', name: 'Сараби 👑', img: 'images/sarabi.jpg' }
];

function showGameToast(text) {
    let toast = document.getElementById('game-toast');
    if (!toast) {
        const root = document.getElementById('app-root') || document.body;
        toast = document.createElement('div');
        toast.id = 'game-toast';
        toast.className = 'game-toast';
        root.appendChild(toast);
    }
    toast.textContent = text;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('visible');
    }, 2200);
}

function getCharacterDefaultPhoto(charId) {
    const found = characters.find(c => c.id === charId);
    return found ? found.img : 'images/monika.jpg';
}

function syncCharacterUI() {
    document.querySelectorAll('.char-avatar-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.getElementById(`char-${selectedCharacter}-btn`);
    if (activeBtn) activeBtn.classList.add('active');

    const mainImg = document.getElementById('main-character-img');
    const photoToShow = activePhotoSrc || getCharacterDefaultPhoto(selectedCharacter);
    if (mainImg && photoToShow) {
        mainImg.src = photoToShow;
    }
    updateCatAgeBanner();
}

function switchToTab(targetTabId) {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabSections = document.querySelectorAll('.tab-section');
    const targetSection = document.getElementById(targetTabId);
    if (!targetSection) return;

    activeTabId = targetTabId;
    navButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-tab') === targetTabId));
    tabSections.forEach(s => s.classList.toggle('active', s.id === targetTabId));
}

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
    const spaceMult = Date.now() < spaceBoostUntil ? 5 : 1;
    return (tapPower + charBonus) * rebirthMultiplier * nightMult * spaceMult;
}

function getLeagueName() {
    const lang = document.getElementById('lang-select')?.value || 'ru';
    if (window.score >= 50000) return lang === 'en' ? "Royal Cat 👑" : "Королевский Кот 👑";
    if (window.score >= 10000) return lang === 'en' ? "Golden Paw 🥇" : "Золотая Лапка 🥇";
    if (window.score >= 2000) return lang === 'en' ? "Purr Master 🥈" : "Мур-Мастер 🥈";
    return translations[lang]?.league_kitten || "Маленький Котёнок 🥉";
}

function playCatMeow() {
    if (window.TapMonikaAudio && typeof window.TapMonikaAudio.playMeow === 'function') {
        window.TapMonikaAudio.playMeow(selectedCharacter);
        return;
    }
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

    if (window.TapMonikaCombo && typeof window.TapMonikaCombo.registerTap === 'function') {
        window.TapMonikaCombo.registerTap();
    }

    playCatMeow();
    spawnFloatingGain(clientX, clientY, gain);
    updateDisplay();
}

function initClicker() {
    const tapButton = document.getElementById('tap-button');
    if (!tapButton) return;

    const handleTap = (clientX, clientY, event) => {
        const now = Date.now();
        if (now - lastPointerTapTime < 35) return;
        lastPointerTapTime = now;
        triggerTapAction(clientX, clientY, event);
    };

    tapButton.addEventListener('pointerdown', (event) => {
        if (event.button !== undefined && event.button !== 0) return;
        handleTap(event.clientX, event.clientY, event);
    });

    tapButton.addEventListener('click', (event) => {
        if (event.detail === 0) {
            handleTap(window.innerWidth / 2, window.innerHeight / 2, event);
        }
    });
}

function initSpacebarBoost() {
    document.addEventListener('keydown', (e) => {
        if ((e.code === 'Space' || e.key === ' ') && !e.repeat) {
            const tag = document.activeElement?.tagName?.toLowerCase();
            if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
            e.preventDefault();

            const now = Date.now();
            if (now >= spaceBoostCooldownUntil) {
                spaceBoostUntil = now + 8000;
                spaceBoostCooldownUntil = now + 20000;
                pushLog("Турбо-лапка x5 активирована на 8 сек!");
                showGameToast("⚡ Турбо-лапка x5 на 8 сек!");
            }
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
            showGameToast(isNightMode ? "🌙 Ночной обход: x2 тап" : "☀️ Дневной режим");
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
            showGameToast("Код сохранения скопирован! 📋");
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
                showGameToast("Сохранение загружено! ✨");
            } catch (e) {
                showGameToast("Некорректный код сохранения!");
            }
        });
    }

    const resetBtn = document.getElementById('reset-profile-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            const now = Date.now();
            if (now > resetConfirmUntil) {
                resetConfirmUntil = now + 3500;
                showGameToast("Нажми «Обнулить» ещё раз в течение 3 сек для подтверждения");
                return;
            }
            resetConfirmUntil = 0;
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
            activePhotoSrc = getCharacterDefaultPhoto(selectedCharacter);
            cardLevels = {};
            claimedSocials = {};
            lastChestTime = 0;
            syncCharacterUI();
            renderBusinessCards();
            renderGallery();
            updateDisplay();
            saveCurrentProfile();
            pushLog("Текущий профиль сброшен до стартовых значений.");
            showGameToast("Профиль обнулён");
        });
    }
}

function initTabs() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTabId = btn.getAttribute('data-tab');
            if (targetTabId) {
                switchToTab(targetTabId);
                saveCurrentProfile();
            }
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
                window.TapMonikaSfx?.buySound?.();
                pushLog("Куплена мягкая подушечка (+1 к силе лапки).");
                updateDisplay();
                saveCurrentProfile();
            } else {
                showGameToast("Мяу! Не хватает рыбок! 😿");
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
                window.TapMonikaSfx?.buySound?.();
                pushLog("Куплена мисочка с паштетом (+2/с к мур-доходу).");
                updateDisplay();
                saveCurrentProfile();
            } else {
                showGameToast("Мяу! Не хватает рыбок! 😿");
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
                window.TapMonikaSfx?.buySound?.();
                pushLog("Куплен большой лежак (+250 к бодрости).");
                updateDisplay();
                saveCurrentProfile();
            } else {
                showGameToast("Мяу! Не хватает рыбок на лежак! 😿");
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
                window.TapMonikaSfx?.buySound?.();
                pushLog("Куплена мятная игрушка (+3 к регенерации бодрости).");
                updateDisplay();
                saveCurrentProfile();
            } else {
                showGameToast("Мяу! Не хватает рыбок на игрушку! 😿");
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
        showGameToast(`Нужно ${cost.toLocaleString()} 🪙 для перерождения!`);
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
    window.TapMonikaSfx?.rebirthSound?.();
    updateDisplay();
    saveCurrentProfile();
    pushLog(`Выполнено перерождение #${rebirthLevel} (множитель x${rebirthMultiplier}).`);
    showGameToast(`Перерождение #${rebirthLevel}! Множитель x${rebirthMultiplier} 🌀`);
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
                    ${locked ? `<span class="card-req-note">Нужен ур. ${card.reqLvl} карточки ${card.reqCard}</span>` : ''}
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
                window.TapMonikaSfx?.buySound?.();
                pushLog(`Прокачана карточка «${card.name}» до ур. ${lvl + 1}.`);
                updateDisplay();
                renderBusinessCards();
                saveCurrentProfile();
            } else {
                showGameToast("Не хватает монеток на карточку! 😿");
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
                if (window.TapMonikaPhotoViewer && typeof window.TapMonikaPhotoViewer.open === 'function') {
                    window.TapMonikaPhotoViewer.open(photo);
                } else {
                    const mainImg = document.getElementById('main-character-img');
                    if (mainImg && photo.src) {
                        mainImg.src = photo.src;
                        activePhotoSrc = photo.src;
                        saveCurrentProfile();
                    }
                }
                pushLog(`Выбрано фото из альбома: ${photo.title || `#${index + 1}`}.`);
                return;
            }
            if (window.score >= photo.cost) {
                window.score -= photo.cost;
                unlockedPhotos.push(index);
                window.TapMonikaSfx?.buySound?.();
                pushLog(`Открыто фото в альбоме: ${photo.title || `#${index + 1}`}.`);
                updateDisplay();
                renderGallery();
                saveCurrentProfile();
            } else {
                showGameToast("Нужно больше рыбок, чтобы открыть фоточку! 😿");
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
        window.TapMonikaSfx?.buySound?.();
        pushLog("Скопирована реферальная ссылка (+1000 🪙).");
        updateDisplay();
        saveCurrentProfile();
        showGameToast("Ссылка скопирована! +1000 🪙 🐾");
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
            if (typeof window.openExternalLink === 'function') {
                window.openExternalLink(url);
            } else {
                window.open(url, '_blank', 'noopener,noreferrer');
            }

            if (key !== 'donate' && !claimedSocials[key]) {
                claimedSocials[key] = true;
                btn.classList.add('completed');
                setTimeout(() => {
                    window.score += 300;
                    window.TapMonikaSfx?.buySound?.();
                    pushLog(`Выполнено задание канала «${key}» (+300 🪙).`);
                    updateDisplay();
                    saveCurrentProfile();
                    showGameToast("Муррр! +300 рыбок за подписку! 🐾💖");
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
            showGameToast("Коробочка ещё закрыта! Загляни позже 🐾");
            return;
        }
        lastChestTime = now;
        const reward = 500 + (rebirthLevel * 250);
        window.score += reward;
        window.TapMonikaSfx?.rebirthSound?.();
        pushLog(`Открыта волшебная коробочка (+${reward} 🪙).`);
        updateDisplay();
        saveCurrentProfile();
        showGameToast(`Найдено +${reward} 🪙 в коробке! 🎁`);
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
            saveCurrentProfile();
            const newName = prompt("🐾 Введи имя нового кото-профиля:", `Котёнок №${profiles.length + 1}`);
            if (newName && newName.trim() !== "") {
                profiles.push(createDefaultProfile(newName.trim()));
                currentProfileIndex = profiles.length - 1;
                saveProfilesData();
                updateAccountDropdown();
                loadProfileData();
                pushLog(`Создан и открыт профиль «${newName.trim()}».`);
                showGameToast(`Создан профиль «${newName.trim()}» 🐾`);
            }
        });
    }

    const renameAccBtn = document.getElementById('rename-account-btn');
    if (renameAccBtn) {
        renameAccBtn.addEventListener('click', () => {
            const current = profiles[currentProfileIndex];
            if (!current) return;
            const nextName = prompt("✏️ Новое имя кото-профиля:", current.name);
            if (nextName && nextName.trim() !== "") {
                current.name = nextName.trim();
                saveProfilesData();
                updateAccountDropdown();
                pushLog(`Профиль переименован в «${current.name}».`);
                showGameToast(`Имя профиля: ${current.name} ✏️`);
            }
        });
    }

    const deleteAccBtn = document.getElementById('delete-account-btn');
    if (deleteAccBtn) {
        deleteAccBtn.addEventListener('click', () => {
            if (profiles.length <= 1) {
                showGameToast("Нельзя удалить единственный профиль 🐾");
                return;
            }
            profiles.splice(currentProfileIndex, 1);
            currentProfileIndex = Math.max(0, currentProfileIndex - 1);
            saveProfilesData();
            updateAccountDropdown();
            loadProfileData();
            pushLog(`Профиль удалён. Активен: «${profiles[currentProfileIndex].name}».`);
            showGameToast(`Активен профиль «${profiles[currentProfileIndex].name}»`);
        });
    }

    const accountSelect = document.getElementById('account-select');
    if (accountSelect) {
        accountSelect.addEventListener('change', (e) => {
            saveCurrentProfile();
            currentProfileIndex = parseInt(e.target.value, 10) || 0;
            saveProfilesData();
            loadProfileData();
            const activeName = profiles[currentProfileIndex]?.name || 'Котёнок';
            pushLog(`Переключён профиль: «${activeName}».`);
            showGameToast(`Профиль: ${activeName} 🐾`);
        });
    }

    document.querySelectorAll('.char-avatar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.id === 'char-monika-btn') selectedCharacter = 'monika';
            if (btn.id === 'char-fortune-btn') selectedCharacter = 'fortune';
            if (btn.id === 'char-sarabi-btn') selectedCharacter = 'sarabi';

            activePhotoSrc = getCharacterDefaultPhoto(selectedCharacter);
            const targetChar = characters.find(c => c.id === selectedCharacter);
            syncCharacterUI();
            playCatMeow();
            updateDisplay();
            saveCurrentProfile();
            pushLog(`Выбран персонаж: ${targetChar ? targetChar.name : selectedCharacter}.`);
        });
    });

    window.addEventListener('beforeunload', () => saveCurrentProfile());
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            saveCurrentProfile();
        }
    });
}

function initMusicPlayer() {
    const musicBtn = document.getElementById('music-toggle-btn');
    if (!musicBtn) return;

    musicBtn.addEventListener('click', () => {
        if (window.TapMonikaAudio && typeof window.TapMonikaAudio.toggleMusic === 'function') {
            window.TapMonikaAudio.toggleMusic(musicBtn);
            return;
        }
        const bgMusic = document.getElementById('bg-music');
        if (!bgMusic) return;
        if (bgMusic.paused) {
            bgMusic.play().then(() => {
                musicBtn.textContent = "🎵 Выкл";
                musicBtn.classList.add('active');
            }).catch(() => {});
        } else {
            bgMusic.pause();
            musicBtn.textContent = "🎵 Вкл";
            musicBtn.classList.remove('active');
        }
    });
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
    const savedIdx = parseInt(localStorage.getItem('tapMonika_activeProfileIndex_v3') || '0', 10);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                profiles = parsed;
            }
        } catch (e) {}
    }
    currentProfileIndex = (savedIdx >= 0 && savedIdx < profiles.length) ? savedIdx : 0;
    loadProfileData();
    updateAccountDropdown();
}

function loadProfileData() {
    const p = profiles[currentProfileIndex] || createDefaultProfile();
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
    selectedCharacter = p.selectedCharacter || 'monika';
    activePhotoSrc = p.activePhotoSrc || getCharacterDefaultPhoto(selectedCharacter);
    activeTabId = p.activeTab || 'tab-game';
    activityLog = Array.isArray(p.activityLog) && p.activityLog.length > 0 ? p.activityLog : ["Профиль загружен."];

    syncCharacterUI();
    switchToTab(activeTabId);
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
        selectedCharacter,
        activePhotoSrc,
        activeTab: activeTabId,
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
    try {
        localStorage.setItem('tapMonika_profiles_v3', JSON.stringify(profiles));
        localStorage.setItem('tapMonika_activeProfileIndex_v3', String(currentProfileIndex));
    } catch (e) {}
}

function updateAccountDropdown() {
    const select = document.getElementById('account-select');
    if (!select) return;
    select.innerHTML = '';
    profiles.forEach((p, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        const catIcon = p.selectedCharacter === 'fortune' ? '🍀' : (p.selectedCharacter === 'sarabi' ? '👑' : '🌸');
        opt.textContent = `${catIcon} ${p.name}`;
        if (idx === currentProfileIndex) opt.selected = true;
        select.appendChild(opt);
    });
}