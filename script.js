const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Получение данных пользователя из Телеграма (если доступны) или дефолтные
const tgUser = tg.initDataUnsafe?.user;

let player = JSON.parse(localStorage.getItem('lw_master_player')) || {
    name: tgUser ? `${tgUser.first_name}` : 'Логист #777',
    avatar: tgUser?.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    money: 35000,
    fuelStock: 400,
    fuelPrice: 12,
    syndicate: null,
    garageLevel: 1,
    lastBonusTime: 0,
    totalProfit: 0,
    activeTrip: null, // { title, reward, endTime, fuelReq, truckId }
    trucks: [
        { id: 1, name: 'LW-CyberTruck Alpha', capacity: 5000, fuelUse: 45, engineWear: 100, tiresWear: 100 }
    ]
};

let contracts = [
    { id: 1, title: 'Обычный: Доставка микросхем', reward: 5200, fuelCostReq: 70, duration: 15 },
    { id: 2, title: 'Срочный: Квантовые батареи', reward: 11500, fuelCostReq: 140, duration: 30 },
    { id: 3, title: 'Нелегальный: Нейромодули', reward: 24000, fuelCostReq: 260, duration: 60 }
];

let p2pMarket = JSON.parse(localStorage.getItem('lw_p2p_market')) || [
    { id: 1, item: 'Усиленный карданный вал', seller: 'GhostRider', price: 6500 },
    { id: 2, item: 'Б/У Тягач "Titan-X"', seller: 'NeoLogistics', price: 42000 }
];

let leaderboard = JSON.parse(localStorage.getItem('lw_leaderboard')) || [
    { name: 'CyberKing', profit: 480000 },
    { name: 'RoadLord', profit: 390000 },
    { name: 'ShadowLog', profit: 310000 }
];

// Автоматическое изменение цены топлива каждые 30 секунд (Живая биржа)
setInterval(() => {
    let fluctuation = Math.floor(Math.random() * 7) - 3; // от -3 до +3
    player.fuelPrice = Math.max(8, Math.min(25, player.fuelPrice + fluctuation));
    saveState();
}, 30000);

function saveState() {
    localStorage.setItem('lw_master_player', JSON.stringify(player));
    localStorage.setItem('lw_p2p_market', JSON.stringify(p2pMarket));
    
    // Обновляем лидерборд игрока
    let existingIndex = leaderboard.findIndex(l => l.name === player.name);
    if(existingIndex >= 0) {
        leaderboard[existingIndex].profit = player.totalProfit;
    } else {
        leaderboard.push({ name: player.name, profit: player.totalProfit });
    }
    leaderboard.sort((a, b) => b.profit - a.profit);
    localStorage.setItem('lw_leaderboard', JSON.stringify(leaderboard));
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`tab-${tabId}`).classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if(btn.getAttribute('onclick')?.includes(tabId)) btn.classList.add('active');
    });
    renderAll();
}

function renderAll() {
    document.getElementById('username').innerText = player.name;
    document.getElementById('header-avatar').src = player.avatar;
    document.getElementById('user-money').innerText = `🪙 ${player.money.toLocaleString()}`;
    document.getElementById('user-fuel-stock').innerText = `⛽ ${player.fuelStock}л`;
    document.getElementById('fuel-price').innerText = `🪙 ${player.fuelPrice}`;
    document.getElementById('syndicate-info').innerText = player.syndicate || 'Одиночка';

    document.getElementById('garage-lvl').innerText = player.garageLevel;
    document.getElementById('garage-cost').innerText = (player.garageLevel * 10000).toLocaleString();

    // Профиль инпуты
    document.getElementById('input-username').value = player.name;
    document.getElementById('input-avatar').value = player.avatar;
    document.getElementById('syndicate-desc').innerText = player.syndicate ? `Вы состоите в синдикате: ${player.syndicate}` : 'Вы свободный логист.';

    // Рендер гаража
    document.getElementById('fleet-list').innerHTML = player.trucks.map(t => `
        <div class="card">
            <div class="card-title"><span>${t.name}</span></div>
            <div class="specs-grid">
                <div>Грузоподъемность: ${t.capacity}кг</div>
                <div>Расход: ${t.fuelUse}л</div>
                <div>Двигатель: <span style="color:${t.engineWear < 30 ? 'var(--danger-color)' : 'inherit'}">${t.engineWear}%</span></div>
                <div>Шины: <span style="color:${t.tiresWear < 30 ? 'var(--danger-color)' : 'inherit'}">${t.tiresWear}%</span></div>
            </div>
            <button class="btn" onclick="repairTruck(${t.id})">Ремонт узлов (🪙 2,000)</button>
        </div>
    `).join('');

    // Рендер активного рейса с таймером
    let tripPanel = document.getElementById('active-trip-panel');
    if (player.activeTrip) {
        let timeLeft = Math.floor((player.activeTrip.endTime - Date.now()) / 1000);
        if (timeLeft > 0) {
            tripPanel.innerHTML = `
                <div class="card" style="border-color:var(--accent-pink);">
                    <div class="card-title"><span>🚚 Транспорт в рейсе...</span><span>⏳ ${timeLeft} сек</span></div>
                    <p style="font-size:12px; color:var(--hint-color);">${player.activeTrip.title}</p>
                </div>
            `;
        } else {
            finishTrip();
        }
    } else {
        tripPanel.innerHTML = '';
    }

    // Контракты
    document.getElementById('contracts-list').innerHTML = contracts.map(c => `
        <div class="card">
            <div class="card-title"><span>${c.title}</span><span style="color:var(--accent-pink);">+${c.reward} 🪙</span></div>
            <div class="specs-grid">
                <div>Время: ${c.duration} сек</div>
                <div>Топливо: ${c.fuelCostReq}л</div>
            </div>
            <button class="btn" ${player.activeTrip ? 'disabled style="opacity:0.4;"' : ''} onclick="startTrip(${c.reward}, ${c.fuelCostReq}, ${c.duration}, '${c.title}')">Начать рейс</button>
        </div>
    `).join('');

    // P2P Биржа
    document.getElementById('p2p-list').innerHTML = p2pMarket.map((m, index) => `
        <div class="card">
            <div class="card-title"><span>${m.item}</span><span>🪙 ${m.price.toLocaleString()}</span></div>
            <div style="font-size:11px; color:var(--hint-color);">Продавец: ${m.seller}</div>
            <button class="btn" onclick="buyP2PLot(${index})">Купить лот</button>
        </div>
    `).join('');

    // Лидерборд
    document.getElementById('leaderboard-list').innerHTML = leaderboard.map((l, index) => `
        <div class="leaderboard-row">
            <span><b>#${index + 1}</b> ${l.name} ${l.name === player.name ? '(Вы)' : ''}</span>
            <span style="color:var(--accent-pink);">🪙 ${l.profit.toLocaleString()}</span>
        </div>
    `).join('');

    saveState();
}

function startTrip(reward, fuelReq, duration, title) {
    if (player.fuelStock < fuelReq) {
        alert('Недостаточно топлива на складе!');
        return;
    }
    let truck = player.trucks[0];
    if (truck.engineWear <= 10 || truck.tiresWear <= 10) {
        alert('Транспорт критически изношен! Срочно сделайте ремонт в гараже.');
        return;
    }

    player.fuelStock -= fuelReq;
    player.activeTrip = {
        title,
        reward,
        fuelReq,
        endTime: Date.now() + (duration * 1000)
    };
    
    if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    renderAll();
}

function finishTrip() {
    let trip = player.activeTrip;
    let syndicateTax = player.syndicate ? trip.reward * 0.05 : 0;
    let netProfit = Math.round(trip.reward - syndicateTax);

    player.money += netProfit;
    player.totalProfit += netProfit;

    // Износ авто от рейса
    let truck = player.trucks[0];
    truck.engineWear = Math.max(0, truck.engineWear - Math.floor(Math.random() * 10 + 5));
    truck.tiresWear = Math.max(0, truck.tiresWear - Math.floor(Math.random() * 15 + 8));

    player.activeTrip = null;
    alert(`Рейс успешно завершен!\nЧистая прибыль: +${netProfit.toLocaleString()} 🪙`);
    renderAll();
}

function buyFuel(amount) {
    let cost = amount * player.fuelPrice;
    if (player.money < cost) { alert('Недостаточно монет!'); return; }
    player.money -= cost;
    player.fuelStock += amount;
    renderAll();
}

function repairTruck(id) {
    let cost = 2000;
    if (player.money < cost) { alert('Недостаточно средств для ремонта!'); return; }
    player.money -= cost;
    let truck = player.trucks.find(t => t.id === id);
    truck.engineWear = 100;
    truck.tiresWear = 100;
    alert('Узлы транспорта полностью восстановлены!');
    renderAll();
}

function upgradeGarage() {
    let cost = player.garageLevel * 10000;
    if (player.money < cost) { alert('Недостаточно средств!'); return; }
    player.money -= cost;
    player.garageLevel++;
    alert('Гараж успешно модернизирован!');
    renderAll();
}

function createP2PLot() {
    let name = document.getElementById('p2p-item-name').value.trim();
    let price = parseInt(document.getElementById('p2p-item-price').value);
    if (!name || !price || price <= 0) { alert('Заполните корректные данные лота!'); return; }

    p2pMarket.unshift({ id: Date.now(), item: name, seller: player.name, price: price });
    document.getElementById('p2p-item-name').value = '';
    document.getElementById('p2p-item-price').value = '';
    alert('Лот успешно выставлен на черный рынок!');
    renderAll();
}

function buyP2PLot(index) {
    let lot = p2pMarket[index];
    if (player.money < lot.price) { alert('Недостаточно средств!'); return; }
    player.money -= lot.price;
    p2pMarket.splice(index, 1);
    alert('Вы успешно приобрели лот!');
    renderAll();
}

function claimDailyBonus() {
    let now = Date.now();
    if (now - player.lastBonusTime < 86400000) {
        let hours = Math.ceil((86400000 - (now - player.lastBonusTime)) / 3600000);
        alert(`Бонус уже получен. Следующий доступен через ${hours} ч.`);
        return;
    }
    player.lastBonusTime = now;
    player.money += 15000;
    player.fuelStock += 200;
    alert('🎁 Вы забрали ежедневный бонус: +15,000 🪙 и +200л топлива!');
    renderAll();
}

function saveProfile() {
    let name = document.getElementById('input-username').value.trim();
    let avatar = document.getElementById('input-avatar').value.trim();
    if (name) player.name = name;
    if (avatar) player.avatar = avatar;
    alert('Профиль успешно обновлен!');
    renderAll();
}

function joinSyndicate(name) {
    player.syndicate = name;
    alert(`Вы вступили в синдикат ${name}! Налог снижен до 5%.`);
    renderAll();
}

// Постоянный апдейт таймера рейсов
setInterval(() => {
    if (player.activeTrip) renderAll();
}, 1000);

renderAll();
