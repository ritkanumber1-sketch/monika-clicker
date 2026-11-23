// --- TAPMONIKA 3.0: СИСТЕМА БЕСКОНЕЧНЫХ ПЕРЕРОЖДЕНИЙ ---

let rebirthData = {
    count: 0,
    cost: 1000000
};

// Функция совершения перерождения
function doRebirth() {
    // Берем текущие монеты из основного скрипта игры (score)
    let currentCoins = window.score || 0;
    
    if (currentCoins >= rebirthData.cost) {
        // Уменьшаем счетчик монеток в игре
        window.score -= rebirthData.cost;
        rebirthData.count++;
        
        // Каждое следующее перерождение дорожает в 50 раз
        rebirthData.cost *= 50;
        
        alert(`🎉 Поздравление! Перерождение №${rebirthData.count} успешно!\nТвой множитель клика теперь: x${Math.pow(10, rebirthData.count).toLocaleString()}`);
        
        updateRebirthUI();
        if (typeof updateDisplay === 'function') {
            updateDisplay();
        }
    } else {
        let needed = rebirthData.cost - currentCoins;
        alert(`❌ Недостаточно монет! До перерождения не хватает: ${needed.toLocaleString()} 🪙`);
    }
}

// Получить множитель для силы клика (х10 за каждое перерождение)
function getRebirthMultiplier() {
    return Math.pow(10, rebirthData.count);
}

// Обновление текста на вкладке перерождений в HTML
function updateRebirthUI() {
    if (document.getElementById('rebirthCountText')) {
        document.getElementById('rebirthCountText').innerText = rebirthData.count;
    }
    if (document.getElementById('currentMultiplierText')) {
        document.getElementById('currentMultiplierText').innerText = 'x' + Math.pow(10, rebirthData.count).toLocaleString();
    }
    if (document.getElementById('rebirthCostText')) {
        document.getElementById('rebirthCostText').innerText = rebirthData.cost.toLocaleString();
    }
}

// Запускаем обновление интерфейса вкладки каждые 0.5 секунды
setInterval(updateRebirthUI, 500);