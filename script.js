const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// НАСТРОЙКИ ПОДКЛЮЧЕНИЯ К SUPABASE (ЗАМЕНИТЕ НА СВОИ КЛЮЧИ)
const SUPABASE_URL = https://iqnwxtfievadrqaglqqs.supabase.co/rest/v1/;
const SUPABASE_ANON_KEY = sb_publishable_tk5ZZxQvR68QF0sWI8_y-Q_M3jy4A_-;

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const tgUser = tg.initDataUnsafe?.user;
const telegramId = tgUser ? tgUser.id : 123456789; // Тестовый ID, если запуск не из Telegram

let player = {
    id: null,
    name: tgUser ? `${tgUser.first_name}` : 'Логист #777',
    avatar: tgUser?.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    money: 35000,
    fuelStock: 400,
    fuelPrice: 12,
    syndicate: null,
    garageLevel: 1,
    totalProfit: 0,
    lastBonusTime: 0
};

let trucks = [];
let activeTrip = null;
let p2pMarket = [];
let leaderboard = [];

let contracts = [
    { id: 1, title: 'Обычный: Доставка микросхем', reward: 5200, fuelCostReq: 70, duration: 15 },
    { id: 2, title: 'Срочный: Квантовые батареи', reward: 11500, fuelCostReq: 140, duration: 30 },
    { id: 3, title: 'Нелегальный: Нейромодули', reward: 24000, fuelCostReq: 260, duration: 60 }
];

// Инициализация игрока в базе данных при входе
async function initGameData() {
    let { data: existingPlayer, error } = await supabaseClient
        .from('players')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

    if (!existingPlayer) {
        // Создаем нового игрока в базе, если его еще нет
        let { data: newP, error: errNew } = await supabaseClient
            .from('players')
            .insert([{
                telegram_id: telegramId,
                name: player.name,
                avatar: player.avatar,
                money: player.money,
                fuel_stock: player.fuelStock,
                garage_level: player.garageLevel
            }])
            .select()
            .single();

        if (newP) {
            player = newP;
            // Выдаем стартовый грузовик
            await supabaseClient.from('trucks').insert([{
                player_id: player.id,
                name: 'LW-CyberTruck Alpha',
                capacity: 5000,
                fuel_use: 45,
                engine_wear: 100,
                tires_wear: 100
            }]);
        }
    } else {
        player = existingPlayer;
    }

    await loadUserDataFromDB();
    renderAll();
}

async function loadUserDataFromDB() {
    // Загружаем грузовики
    let { data: tData } = await supabaseClient.from('trucks').select('*').eq('player_id', player.id);
    trucks = tData || [];

    // Загружаем активный рейс
    let { data: tripData } = await supabaseClient.from('active_trips').select('*').eq('player_id', player.id).single();
    activeTrip = tripData || null;

    // Загружаем P2P биржу
    let { data: marketData } = await supabaseClient.from('p2p_market').select('*').order('id', { ascending: false });
    p2pMarket = marketData || [];

    // Загружаем рейтинг
    let { data: leadData } = await supabaseClient.from('players').select('name, total_profit').order('total_profit', { ascending: false }).limit(10);
    leaderboard = leadData || [];
}

async function syncPlayerToDB() {
    await supabaseClient.from('players').update({
        name: player.name,
        avatar: player.avatar,
        money: player.money,
        fuel_stock: player.fuel_stock,
        fuel_price: player.fuel_price,
        syndicate: player.syndicate,
        garage_level: player.garage_level,
        total_profit: player.total_profit,
        last_bonus_time: player.last_bonus_time
    }).eq('id', player.id);
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
    document.getElementById('header-avatar').src = player.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100';
    document.getElementById('user-money').innerText = `🪙 ${player.money.toLocaleString()}`;
    document.getElementById('user-fuel-stock').innerText = `⛽ ${player.fuel_stock}л`;
    document.getElementById('fuel-price').innerText = `🪙 ${player.fuel_price}`;
    document.getElementById('syndicate-info').innerText = player.syndicate || 'Одиночка';

    document.getElementById('garage-lvl').innerText = player.garage_level;
    document.getElementById('garage-cost').innerText = (player.garage_level * 10000).toLocaleString();

    document.getElementById('input-username').value = player.name;
    document.getElementById('input-avatar').value = player.avatar || '';
    document.getElementById('syndicate-desc').innerText = player.syndicate ? `Вы в синдикате: ${player.syndicate}` : 'Вы свободный логист.';

    // Гараж
    document.getElementById('fleet-list').innerHTML = trucks.map(t => `
        <div class="card">
            <div class="card-title"><span>${t.name}</span></div>
            <div class="specs-grid">
                <div>Грузоподъемность: ${t.capacity}кг</div>
                <div>Расход: ${t.fuel_use}л</div>
                <div>Двигатель: ${t.engine_wear}%</div>
                <div>Шины: ${t.tires_wear}%</div>
            </div>
            <button class="btn" onclick="repairTruck(${t.id})">Ремонт узлов (🪙 2,000)</button>
        </div>
    `).join('');

    // Рейсы с таймером из БД
    let tripPanel = document.getElementById('active-trip-panel');
    if (activeTrip) {
        let timeLeft = Math.floor((activeTrip.end_time - Date.now()) / 1000);
        if (timeLeft > 0) {
            tripPanel.innerHTML = `
                <div class="card" style="border-color:var(--accent-pink);">
                    <div class="card-title"><span>🚚 Транспорт в рейсе...</span><span>⏳ ${timeLeft} сек</span></div>
                    <p style="font-size:12px; color:var(--hint-color);">${activeTrip.title}</p>
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
                <div>Топливо: ${c.fuel_cost_req || c.fuelCostReq}л</div>
            </div>
            <button class="btn" ${activeTrip ? 'disabled style="opacity:0.4;"' : ''} onclick="startTrip(${c.reward}, ${c.fuelCostReq || c.fuelCostReq}, ${c.duration}, '${c.title}')">Начать рейс</button>
        </div>
    `).join('');

    // Биржа
    document.getElementById('p2p-list').innerHTML = p2pMarket.map((m, index) => `
        <div class="card">
            <div class="card-title"><span>${m.item_name}</span><span>🪙 ${m.price.toLocaleString()}</span></div>
            <div style="font-size:11px; color:var(--hint-color);">Продавец: ${m.seller_name}</div>
            <button class="btn" onclick="buyP2PLot(${m.id}, ${m.price})">Купить лот</button>
        </div>
    `).join('');

    // Лидерборд
    document.getElementById('leaderboard-list').innerHTML = leaderboard.map((l, index) => `
        <div class="leaderboard-row">
            <span><b>#${index + 1}</b> ${l.name}</span>
            <span style="color:var(--accent-pink);">🪙 ${l.total_profit.toLocaleString()}</span>
        </div>
    `).join('');
}

async function startTrip(reward, fuelReq, duration, title) {
    if (player.fuel_stock < fuelReq) {
        alert('Недостаточно топлива на складе!');
        return;
    }

    let endTime = Date.now() + (duration * 1000);

    player.fuel_stock -= fuelReq;
    
    // Записываем активный рейс в базу данных
    let { data, error } = await supabaseClient.from('active_trips').insert([{
        player_id: player.id,
        title: title,
        reward: reward,
        fuel_req: fuelReq,
        end_time: endTime
    }]).select().single();

    if (data) {
        activeTrip = data;
    }
    await syncPlayerToDB();
    if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    renderAll();
}

async function finishTrip() {
    if (!activeTrip) return;
    
    let syndicateTax = player.syndicate ? activeTrip.reward * 0.05 : 0;
    let netProfit = Math.round(activeTrip.reward - syndicateTax);

    player.money += netProfit;
    player.total_profit += netProfit;

    // Удаляем рейс из базы
    await supabaseClient.from('active_trips').delete().eq('player_id', player.id);
    activeTrip = null;

    await syncPlayerToDB();
    alert(`Рейс успешно завершен!\nЧистая прибыль: +${netProfit.toLocaleString()} 🪙`);
    await loadUserDataFromDB();
    renderAll();
}

async function buyFuel(amount) {
    let cost = amount * player.fuel_price;
    if (player.money < cost) { alert('Недостаточно монет!'); return; }
    player.money -= cost;
    player.fuel_stock += amount;
    await syncPlayerToDB();
    renderAll();
}

async function repairTruck(id) {
    let cost = 2000;
    if (player.money < cost) { alert('Недостаточно средств для ремонта!'); return; }
    player.money -= cost;
    
    await supabaseClient.from('trucks').update({ engine_wear: 100, tires_wear: 100 }).eq('id', id);
    await syncPlayerToDB();
    await loadUserDataFromDB();
    alert('Узлы транспорта полностью восстановлены!');
    renderAll();
}

async function upgradeGarage() {
    let cost = player.garage_level * 10000;
    if (player.money < cost) { alert('Недостаточно средств!'); return; }
    player.money -= cost;
    player.garage_level++;
    await syncPlayerToDB();
    alert('Гараж успешно модернизирован!');
    renderAll();
}

async function createP2PLot() {
    let name = document.getElementById('p2p-item-name').value.trim();
    let price = parseInt(document.getElementById('p2p-item-price').value);
    if (!name || !price || price <= 0) { alert('Заполните корректные данные лота!'); return; }

    await supabaseClient.from('p2p_market').insert([{
        seller_name: player.name,
        item_name: name,
        price: price
    }]);

    document.getElementById('p2p-item-name').value = '';
    document.getElementById('p2p-item-price').value = '';
    alert('Лот успешно выставлен на черный рынок!');
    await loadUserDataFromDB();
    renderAll();
}

async function buyP2PLot(lotId, price) {
    if (player.money < price) { alert('Недостаточно средств!'); return; }
    player.money -= price;

    await supabaseClient.from('p2p_market').delete().eq('id', lotId);
    await syncPlayerToDB();
    await loadUserDataFromDB();
    alert('Вы успешно приобрели лот!');
    renderAll();
}

async function claimDailyBonus() {
    let now = Date.now();
    if (now - player.last_bonus_time < 86400000) {
        let hours = Math.ceil((86400000 - (now - player.last_bonus_time)) / 3600000);
        alert(`Бонус уже получен. Следующий доступен через ${hours} ч.`);
        return;
    }
    player.last_bonus_time = now;
    player.money += 15000;
    player.fuel_stock += 200;
    await syncPlayerToDB();
    alert('🎁 Вы забрали ежедневный бонус: +15,000 🪙 и +200л топлива!');
    renderAll();
}

async function saveProfile() {
    let name = document.getElementById('input-username').value.trim();
    let avatar = document.getElementById('input-avatar').value.trim();
    if (name) player.name = name;
    if (avatar) player.avatar = avatar;
    await syncPlayerToDB();
    alert('Профиль успешно обновлен в облаке!');
    renderAll();
}

async function joinSyndicate(name) {
    player.syndicate = name;
    await syncPlayerToDB();
    alert(`Вы вступили в синдикат ${name}! Налог снижен до 5%.`);
    renderAll();
}

// Проверка таймеров каждую секунду
setInterval(() => {
    if (activeTrip) renderAll();
}, 1000);

// Запуск приложения
initGameData();
