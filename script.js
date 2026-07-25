// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Игровое состояние (State)
let player = {
    money: 25000,
    fuelStock: 300,
    fuelPrice: 12,
    syndicate: null,
    garageLevel: 1,
    trucks: [
        { id: 1, name: 'LW-CyberTruck Alpha', capacity: 5000, fuelUse: 50, engineWear: 100, tiresWear: 100, tankWear: 100 }
    ]
};

// Контракты
let contracts = [
    { id: 1, title: 'Обычный: Доставка микросхем', reward: 4500, fuelCostReq: 120, risk: 'Обычный' },
    { id: 2, title: 'Срочный: Квантовые батареи', reward: 9200, fuelCostReq: 250, risk: 'Срочный' },
    { id: 3, title: 'Нелегальный: Нейромодули', reward: 18000, fuelCostReq: 400, risk: 'Нелегальный' }
];

// P2P рынок запчастей
let p2pMarket = [
    { id: 1, item: 'Усиленный карданный вал', seller: 'GhostRider', price: 6500 },
    { id: 2, item: 'Б/У Тягач "Titan-X"', seller: 'NeoLogistics', price: 42000 }
];

// Переключение вкладок
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`tab-${tabId}`).classList.add('active');
    event.currentTarget.classList.add('active');
    renderAll();
}

// Рендер интерфейса
function renderAll() {
    document.getElementById('user-money').innerText = `🪙 ${player.money.toLocaleString()}`;
    document.getElementById('user-fuel-stock').innerText = `⛽ ${player.fuelStock}л`;
    document.getElementById('fuel-price').innerText = `🪙 ${player.fuelPrice}`;
    document.getElementById('syndicate-info').innerText = player.syndicate ? `Синдикат: ${player.syndicate}` : 'Синдикат: Одиночка';

    // Рендер гаража
    const fleetContainer = document.getElementById('fleet-list');
    fleetContainer.innerHTML = player.trucks.map(truck => `
        <div class="card">
            <div class="card-title"><span>${truck.name}</span></div>
            <div class="specs-grid">
                <div>Грузоподъемность: ${truck.capacity} кг</div>
                <div>Расход топлива: ${truck.fuelUse}л</div>
                <div>Двигатель: ${truck.engineWear}%</div>
                <div>Шины: ${truck.tiresWear}%</div>
            </div>
            <button class="btn" onclick="repairTruck(${truck.id})">Обслужить узел (🪙 1,500)</button>
        </div>
    `).join('');

    // Рендер контрактов
    const contractContainer = document.getElementById('contracts-list');
    contractContainer.innerHTML = contracts.map(c => `
        <div class="card">
            <div class="card-title"><span>${c.title}</span><span style="color:var(--accent-pink);">+${c.reward} 🪙</span></div>
            <div class="specs-grid">
                <div>Риск: ${c.risk}</div>
                <div>Топливо на рейс: ${c.fuelCostReq}л</div>
            </div>
            <button class="btn" onclick="startContract(${c.reward}, ${c.fuelCostReq})">Выполнить рейс</button>
        </div>
    `).join('');

    // Рендер P2P рынка
    const p2pContainer = document.getElementById('p2p-list');
    p2pContainer.innerHTML = p2pMarket.map(m => `
        <div class="card">
            <div class="card-title"><span>${m.item}</span><span>🪙 ${m.price}</span></div>
            <div style="font-size:12px; color:var(--hint-color);">Продавец: ${m.seller}</div>
            <button class="btn" onclick="buyP2PItem(${m.price})">Купить лот</button>
        </div>
    `).join('');
}

// Логика рейса и расчет чистой прибыли
function startContract(reward, fuelReq) {
    let syndTax = player.syndicate ? reward * 0.05 : 0; // 5% налог синдикату
    let fuelExpense = fuelReq * (player.fuelPrice * (player.garageLevel > 1 ? 0.9 : 1));
    let wearExpense = 400; // Износ деталей за рейс

    let netProfit = reward - fuelExpense - wearExpense - syndTax;

    if (player.fuelStock < fuelReq) {
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
        alert('Недостаточно топлива в запасах! Купите топливо на бирже.');
        return;
    }

    player.fuelStock -= fuelReq;
    player.money += Math.round(netProfit);

    // Ухудшаем состояние грузовика при рейсе
    player.trucks[0].engineWear = Math.max(0, player.trucks[0].engineWear - 5);
    player.trucks[0].tiresWear = Math.max(0, player.trucks[0].tiresWear - 8);

    if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    alert(`Рейс успешно завершен!\nЧистая прибыль: +${Math.round(netProfit)} 🪙`);
    renderAll();
}

// Покупка топлива на живой бирже
function buyFuel(amount) {
    let totalCost = amount * player.fuelPrice;
    if (player.money < totalCost) {
        alert('Недостаточно средств!');
        return;
    }
    player.money -= totalCost;
    player.fuelStock += amount;
    renderAll();
}

// Улучшение гаража
function upgradeGarage() {
    let cost = 10000;
    if (player.money < cost) {
        alert('Недостаточно средств для улучшения гаража!');
        return;
    }
    player.money -= cost;
    player.garageLevel += 1;
    alert(`Гараж успешно модернизирован до уровня ${player.garageLevel}! Снижены косты на логистику.`);
    renderAll();
}

// Обслуживание грузовика (ремонт)
function repairTruck(truckId) {
    let cost = 1500;
    if (player.money < cost) {
        alert('Недостаточно средств для ремонта!');
        return;
    }
    player.money -= cost;
    let truck = player.trucks.find(t => t.id === truckId);
    truck.engineWear = 100;
    truck.tiresWear = 100;
    alert('Транспорт успешно обслужен в ремонтном боксе!');
    renderAll();
}

// Покупка на P2P рынке
function buyP2PItem(price) {
    if (player.money < price) {
        alert('Недостаточно средств на P2P счете!');
        return;
    }
    player.money -= price;
    alert('Покупка на бирже прошла успешно! Лот добавлен в инвентарь.');
    renderAll();
}

// Вступление в синдикат
function joinSyndicate(name) {
    player.syndicate = name;
    alert(`Вы успешно вступили в синдикат ${name}!`);
    renderAll();
}

// Первичный запуск отрисовки
renderAll();

