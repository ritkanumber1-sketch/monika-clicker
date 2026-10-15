// ================= ГЛАВНАЯ ЛОГИКА ИГРЫ (script.js) =================

let currentLang = localStorage.getItem('tapmonika_lang') || 'ru';

function applyLanguage(lang) {
    if (!translations[lang]) lang = 'ru';
    currentLang = lang;
    localStorage.setItem('tapmonika_lang', lang);
    const dict = translations[lang] || translations.ru;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.innerText = dict[key];
    });

    const langSelect = document.getElementById('lang-select');
    if (langSelect) langSelect.value = lang;

    updateUI();
    updateInviteInput();
}

// Управление профилями
let currentAccountId = localStorage.getItem('tapmonika_active_account') || 'acc_1';
let accountsList = JSON.parse(localStorage.getItem('tapmonika_accounts_list') || '["acc_1"]');
let accountNames = JSON.parse(localStorage.getItem('tapmonika_account_names') || '{"acc_1": "Главный Котик"}');

function getDefaultState() {
    return {
        score: 0,
        tapPower: 1,
        passiveIncome: 0,
        energy: 1000,
        maxEnergy: 1000,
        tapCost: 20,
        autoCost: 100,
        energyCost: 250,
        satsiviCost: 500,
        character: 'monika',
        currentPhoto: 'images/monika.jpg',
        unlockedPhotos: ['images/monika.jpg', 'images/fortune.jpg'],
        cardLevels: {},
        lastChestTime: 0,
        lastDailyTime: 0,
        dailyStreak: 0,
        completedTasks: []
    };
}

let state = getDefaultState();
let activeCardCategory = 'pr';

function saveGame() {
    if (typeof computeSecureHash === 'function') {
        state.signature = computeSecureHash(state);
    }
    localStorage.setItem(`tapmonika_save_${currentAccountId}`, JSON.stringify(state));
    localStorage.setItem('tapmonika_active_account', currentAccountId);
    localStorage.setItem('tapmonika_accounts_list', JSON.stringify(accountsList));
    localStorage.setItem('tapmonika_account_names', JSON.stringify(accountNames));
}

function loadGame() {
    const saved = localStorage.getItem(`tapmonika_save_${currentAccountId}`);
    if (saved) {
        try {
            state = { ...getDefaultState(), ...JSON.parse(saved) };
            if (!state.unlockedPhotos) state.unlockedPhotos = ['images/monika.jpg', 'images/fortune.jpg'];
            if (!state.cardLevels) state.cardLevels = {};
        } catch (e) {
            state = getDefaultState();
        }
    } else {
        state = getDefaultState();
        saveGame();
    }
    recalculatePassiveIncome();
}

function recalculatePassiveIncome() {
    let totalCardIncome = 0;
    if (typeof allHamsterCatCards !== 'undefined') {
        allHamsterCatCards.forEach(card => {
            totalCardIncome += (state.cardLevels[card.id] || 0) * card.baseIncome;
        });
    }
    state.passiveIncome = (state.passiveIncomeFromUpgrades || 0) + totalCardIncome;
}

function renderAccountSelect() {
    const select = document.getElementById('account-select');
    if (!select) return;
    select.innerHTML = '';
    accountsList.forEach(id => {
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = accountNames[id] || id;
        if (id === currentAccountId) opt.selected = true;
        select.appendChild(opt);
    });
}

function switchAccount(newId) {
    saveGame();
    currentAccountId = newId;
    loadGame();
    const mainImg = document.getElementById('main-character-img');
    if (mainImg) mainImg.src = state.currentPhoto || 'images/monika.jpg';
    updateUI();
    renderGallery();
    renderBusinessCards();
    renderAccountSelect();
    updateInviteInput();
}

function createNewAccount() {
    const dict = translations[currentLang] || translations.ru;
    const name = prompt(dict.prompt_profile, `${dict.default_profile_name} ${accountsList.length + 1}`);
    if (!name || !name.trim()) return;
    const newId = 'acc_' + Date.now();
    accountsList.push(newId);
    accountNames[newId] = name.trim();
    currentAccountId = newId;
    state = getDefaultState();
    saveGame();
    renderAccountSelect();
    renderGallery();
    renderBusinessCards();
    const mainImg = document.getElementById('main-character-img');
    if (mainImg) mainImg.src = 'images/monika.jpg';
    updateUI();
    updateInviteInput();
}

// Музыка
let isMusicPlaying = false;
const bgMusic = document.getElementById('bg-music');
const musicToggleBtn = document.getElementById('music-toggle-btn');
function toggleMusic() {
    if (!bgMusic) return;
    if (isMusicPlaying) {
        bgMusic.pause();
        isMusicPlaying = false;
        if (musicToggleBtn) { musicToggleBtn.classList.remove('active'); musicToggleBtn.innerText = '🔇 Выкл'; }
    } else {
        bgMusic.volume = 0.35;
        bgMusic.play().then(() => {
            isMusicPlaying = true;
            if (musicToggleBtn) { musicToggleBtn.classList.add('active'); musicToggleBtn.innerText = '🎵 Вкл'; }
        }).catch(() => {});
    }
}

// Рефералы
function getInviteLink() {
    return `https://t.me/TapMonikaBot?startapp=ref_${currentAccountId}`;
}
function updateInviteInput() {
    const input = document.getElementById('ref-link-input');
    if (input) input.value = getInviteLink();
}
function copyInviteLink() {
    const link = getInviteLink();
    const dict = translations[currentLang] || translations.ru;
    navigator.clipboard?.writeText(link).then(() => alert(dict.link_copied)).catch(() => {});
}

// Переключение персонажей (Моника / Фортуна)
function selectCharacter(name) {
    state.character = name;
    document.querySelectorAll('.char-avatar-btn').forEach(btn => btn.classList.remove('active'));

    const imgEl = document.getElementById('main-character-img');
    if (!imgEl) return;

    if (name === 'monika') {
        document.getElementById('char-monika-btn')?.classList.add('active');
        state.currentPhoto = 'images/monika.jpg';
        imgEl.src = 'images/monika.jpg';
    } else {
        document.getElementById('char-fortune-btn')?.classList.add('active');
        state.currentPhoto = 'images/fortune.jpg';
        imgEl.src = 'images/fortune.jpg';
    }
    saveGame();
}

// Галерея
function renderGallery() {
    const container = document.getElementById('gallery-container');
    if (!container || typeof galleryPhotos === 'undefined') return;
    container.innerHTML = '';
    galleryPhotos.forEach((photoObj, index) => {
        const isUnlocked = state.unlockedPhotos.includes(photoObj.src) || photoObj.cost === 0;
        const item = document.createElement('div');
        item.className = `gallery-item ${isUnlocked ? '' : 'locked'}`;
        item.innerHTML = isUnlocked ? `<img src="${photoObj.src}">` : `<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%; height:100%; background:#111827;"><span>🔒</span><span style="font-size:10px; color:#fbbf24;">${photoObj.cost} 🪙</span></div>`;
        item.addEventListener('click', () => openPhotoModal(photoObj, isUnlocked));
        container.appendChild(item);
    });
}

function openPhotoModal(photoObj, isUnlocked) {
    let modal = document.getElementById('photo-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'photo-modal';
        modal.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:1000; justify-content:center; align-items:center; flex-direction:column; padding:20px;';
        modal.innerHTML = `<div style="display:flex; flex-direction:column; align-items:center;"><img id="modal-img" style="max-width:100%; max-height:70vh; border-radius:14px; border:3px solid #f59e0b;"><div id="modal-info" style="margin-top:15px; color:#fbbf24; font-weight:bold;"></div><button id="modal-action-btn" class="action-btn" style="margin-top:15px;">Закрыть</button></div>`;
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
    }
    modal.querySelector('#modal-img').src = photoObj.src;
    modal.style.display = 'flex';
    const dict = translations[currentLang] || translations.ru;
    const btn = modal.querySelector('#modal-action-btn');
    if (isUnlocked) {
        modal.querySelector('#modal-info').innerText = "Милый котик! 😻";
        btn.innerText = "На главный экран 🐾";
        btn.onclick = () => { state.currentPhoto = photoObj.src; document.getElementById('main-character-img').src = photoObj.src; saveGame(); alert(dict.photo_set); modal.style.display = 'none'; };
    } else {
        modal.querySelector('#modal-info').innerText = `Заблокировано! Цена: ${photoObj.cost} 🪙`;
        btn.innerText = "Разблокировать 🔓";
        btn.onclick = () => {
            if (state.score >= photoObj.cost) {
                state.score -= photoObj.cost;
                state.unlockedPhotos.push(photoObj.src);
                saveGame(); renderGallery(); updateUI(); alert(dict.photo_unlocked); modal.style.display = 'none';
            } else { alert(dict.no_money); }
        };
    }
}

// Карточки
function renderBusinessCards() {
    const container = document.getElementById('business-cards-container');
    if (!container || typeof allHamsterCatCards === 'undefined') return;
    container.innerHTML = '';
    const dict = translations[currentLang] || translations.ru;
    allHamsterCatCards.filter(c => c.cat === activeCardCategory).forEach(card => {
        const lvl = state.cardLevels[card.id] || 0;
        const cost = Math.floor(card.baseCost * Math.pow(card.costMult, lvl));
        const income = lvl * card.baseIncome;
        let unlocked = true, reqName = '';
        if (card.reqCard) {
            const reqObj = allHamsterCatCards.find(c => c.id === card.reqCard);
            if (reqObj && (state.cardLevels[card.reqCard] || 0) < card.reqLvl) { unlocked = false; reqName = reqObj.name; }
        }
        const el = document.createElement('div');
        el.className = 'card-item';
        el.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:#111827; border:1px solid #334155; border-radius:12px; padding:12px 16px; margin-bottom:8px; width:100%;';
        if (unlocked) {
            el.innerHTML = `<div style="display:flex; flex-direction:column; gap:4px;"><span style="font-weight:700; color:#f8fafc; font-size:14px;">${card.name}</span><span style="font-size:11px; color:#94a3b8;">Ур. <b>${lvl}</b> | Доход: +<b>${income}</b>/с</span><span style="font-size:11px; color:#fbbf24;">Цена: <b>${cost}</b> 🪙</span></div><button class="action-btn" style="padding:6px 12px; font-size:12px;">${dict.btn_upgrade_card}</button>`;
            el.querySelector('button').addEventListener('click', () => {
                if (state.score >= cost) {
                    state.score -= cost;
                    state.cardLevels[card.id] = lvl + 1;
                    recalculatePassiveIncome();
                    saveGame(); updateUI(); renderBusinessCards();
                } else { alert(dict.no_money); }
            });
        } else {
            el.style.opacity = '0.6';
            el.innerHTML = `<div style="display:flex; flex-direction:column; gap:4px;"><span style="font-weight:700; color:#94a3b8; font-size:14px;">🔒 ${card.name}</span><span style="font-size:11px; color:#ef4444;">Требуется: ${reqName} (Ур. ${card.reqLvl})</span></div><span style="font-size:11px; color:#64748b;">Закрыто</span>`;
        }
        container.appendChild(el);
    });
}

function getLeague(score) {
    const t = translations[currentLang] || translations.ru;
    if (score >= 500000) return t.league_legend;
    if (score >= 100000) return t.league_diamond;
    if (score >= 25000) return t.league_plat;
    if (score >= 5000) return t.league_gold;
    if (score >= 1000) return t.league_silver;
    return t.league_bronze;
}

function updateUI() {
    document.getElementById('score-val').innerText = Math.floor(state.score);
    document.getElementById('tap-power-val').innerText = state.tapPower;
    document.getElementById('passive-income-val').innerText = state.passiveIncome;
    document.getElementById('energy-val').innerText = Math.floor(state.energy);
    document.getElementById('max-energy-val').innerText = state.maxEnergy;
    document.getElementById('player-league').innerText = getLeague(state.score);
    document.getElementById('energy-bar').style.width = `${Math.max(0, Math.min(100, (state.energy / state.maxEnergy) * 100))}%`;
    document.getElementById('tap-cost-val').innerText = state.tapCost;
    document.getElementById('auto-cost-val').innerText = state.autoCost;
    document.getElementById('energy-cost-val').innerText = state.energyCost;
    document.getElementById('satsivi-cost-val').innerText = state.satsiviCost;
}

function playMeowVoice() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance('мяу');
        u.lang = 'ru-RU'; u.pitch = 1.8; u.rate = 1.3;
        window.speechSynthesis.speak(u);
    }
}

// Клик с анимацией увеличения на 1.25
function handleTap(event) {
    if (typeof validateTapEvent === 'function' && !validateTapEvent(event)) return;
    if (state.energy < state.tapPower) return;

    state.energy -= state.tapPower;
    state.score += state.tapPower;

    const mainImg = document.getElementById('main-character-img');
    if (mainImg) {
        mainImg.style.transform = 'scale(1.25)';
        setTimeout(() => {
            mainImg.style.transform = 'scale(1)';
        }, 90);
    }

    playMeowVoice();
    updateUI();
    saveGame();
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadGame();
    renderAccountSelect();
    renderGallery();
    renderBusinessCards();

    const mainImg = document.getElementById('main-character-img');
    if (mainImg) mainImg.src = state.currentPhoto || 'images/monika.jpg';

    applyLanguage(currentLang);
    updateInviteInput();

    musicToggleBtn?.addEventListener('click', (e) => { e.stopPropagation(); toggleMusic(); });
    document.getElementById('lang-select')?.addEventListener('change', (e) => applyLanguage(e.target.value));
    document.getElementById('account-select')?.addEventListener('change', (e) => switchAccount(e.target.value));
    document.getElementById('add-account-btn')?.addEventListener('click', createNewAccount);
    document.getElementById('copy-ref-btn')?.addEventListener('click', copyInviteLink);
    
    document.getElementById('tap-button')?.addEventListener('pointerdown', handleTap);

    // Кнопки переключения персонажей
    document.getElementById('char-monika-btn')?.addEventListener('click', () => selectCharacter('monika'));
    document.getElementById('char-fortune-btn')?.addEventListener('click', () => selectCharacter('fortune'));

    document.getElementById('buy-tap-upgrade')?.addEventListener('click', () => {
        const dict = translations[currentLang] || translations.ru;
        if (state.score >= state.tapCost) {
            state.score -= state.tapCost;
            state.tapPower += 1;
            state.tapCost = Math.floor(state.tapCost * 1.8);
            updateUI(); saveGame();
        } else alert(dict.no_money);
    });

    document.getElementById('buy-auto-upgrade')?.addEventListener('click', () => {
        const dict = translations[currentLang] || translations.ru;
        if (state.score >= state.autoCost) {
            state.score -= state.autoCost;
            state.passiveIncomeFromUpgrades = (state.passiveIncomeFromUpgrades || 0) + 2;
            recalculatePassiveIncome();
            state.autoCost = Math.floor(state.autoCost * 2);
            updateUI(); saveGame();
        } else alert(dict.no_money);
    });

    document.getElementById('buy-energy-upgrade')?.addEventListener('click', () => {
        const dict = translations[currentLang] || translations.ru;
        if (state.score >= state.energyCost) {
            state.score -= state.energyCost;
            state.maxEnergy += 500;
            state.energy += 500;
            state.energyCost = Math.floor(state.energyCost * 2.2);
            updateUI(); saveGame();
        } else alert(dict.no_money);
    });

    document.getElementById('buy-satsivi-upgrade')?.addEventListener('click', () => {
        const dict = translations[currentLang] || translations.ru;
        if (state.score >= state.satsiviCost) {
            state.score -= state.satsiviCost;
            state.tapPower += 5;
            state.passiveIncomeFromUpgrades = (state.passiveIncomeFromUpgrades || 0) + 10;
            recalculatePassiveIncome();
            state.satsiviCost = Math.floor(state.satsiviCost * 2.5);
            updateUI(); saveGame();
            alert(dict.satsivi_buy);
        } else alert(dict.no_money);
    });

    document.querySelectorAll('.card-category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.card-category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeCardCategory = btn.getAttribute('data-cat');
            renderBusinessCards();
        });
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-section').forEach(tab => tab.classList.remove('active'));
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            document.getElementById(targetId)?.classList.add('active');
            if (targetId === 'tab-cards') renderBusinessCards();
        });
    });

    setInterval(() => {
        if (state.passiveIncome > 0) state.score += state.passiveIncome;
        if (state.energy < state.maxEnergy) state.energy = Math.min(state.maxEnergy, state.energy + 3);
        updateUI();
        saveGame();
    }, 1000);
});