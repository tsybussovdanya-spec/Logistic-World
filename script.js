const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

const CONFIG = {
    SUPABASE_URL: 'https://aiqlcndsayerxjtcwqbj.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_zKJ28h0HfzaojbT9s1uwmw_eX7UQZz0',
    XP_MULTIPLIER: 0.15, DAILY_BONUS_COINS: 15000, DAILY_BONUS_FUEL: 200, BONUS_COOLDOWN_MS: 86400000, 
    CASE_COST: 10000000, DUPLICATE_COINS: 1000000, DUPLICATE_XP: 10000
};

const TRUCK_SHOP = [
    { id: 't1', name: 'ГАЗель "Метеор"', capacity: 1500, fuel_use: 20, rarity: 'common', price: 75000, image: 'https://i.ibb.co.com/p6XDM2Rx/44-F0-E8-CE-1-CFA-47-E8-AAB4-8-A3-A6-B1-D0-FFD.png' },
    { id: 't2', name: 'ЗАЗ Карго', capacity: 2800, fuel_use: 30, rarity: 'common', price: 140000, image: 'https://i.ibb.co.com/v63jh8Sw/61-FB1-D82-33-D6-4928-B3-A6-2-B5-D57-A338-FB.png' },
    { id: 't3', name: 'Volvo FH Neo', capacity: 5000, fuel_use: 45, rarity: 'rare', price: 250000, image: 'https://i.ibb.co.com/hRVfRq6G/271-F0-AAF-8480-41-D8-BEE3-8-EC01-B5-BE97-E.png' },
    { id: 't4', name: 'Scania R730', capacity: 8500, fuel_use: 60, rarity: 'rare', price: 420000, image: 'https://i.ibb.co.com/C5TVRDX2/60-A0-E34-A-CE54-4243-ADBE-96-F5-A9-F96-EAF.png' },
    { id: 't5', name: 'Cyber Truck', capacity: 11000, fuel_use: 75, rarity: 'epic', price: 550000, image: 'https://i.ibb.co.com/WNd23f1s/0-E6-FEEE9-5867-4504-B095-FC5-A92-C85-F00.png' },
    { id: 't6', name: 'Cyber Titan', capacity: 12000, fuel_use: 80, rarity: 'epic', price: 600000, image: 'https://i.ibb.co.com/ccjV64tt/613-B8045-D8-D0-46-B4-B362-E11-F940-E6-CE5.png' },
    { id: 't7', name: 'Peterbilt 389 Custom', capacity: 17000, fuel_use: 100, rarity: 'epic', price: 950000, image: 'https://i.ibb.co.com/5x580wTg/8-AE858-A3-23-BD-477-B-A735-43-A2-C75-B7-B8-E.png' },
    { id: 't8', name: 'Quantum Leviathan', capacity: 25000, fuel_use: 120, rarity: 'legendary', price: 1500000, image: 'https://i.ibb.co.com/6cFXLhYF/B419-FC20-BE70-4-BD0-A6-FD-2-B72-D347-C0-EB.png' },
    { id: 't9', name: 'Titanium Goliath X', capacity: 40000, fuel_use: 180, rarity: 'legendary', price: 2800000, image: 'https://i.ibb.co.com/RksPdPSb/DF802-CE4-829-F-4-A68-9068-717-B406-D42-AE.png' }
];

const LICENSES_SHOP = [
    { id: 'basic', name: 'Базовая', type: 'legal', cost: 0, reqLvl: 1, col1: 'Риск: 0%', col2: 'Штраф: 0', col3: 'Бонус: 0%', col4: 'Скрытн: 100%', col5: 'Доступ: База' },
    { id: 'dangerous', name: 'Опасные грузы', type: 'legal', cost: 50000, reqLvl: 5, col1: 'Риск: 5%', col2: 'Штраф: 10k', col3: 'Бонус: +10%', col4: 'Скрытн: 80%', col5: 'Доступ: Химия' },
    { id: 'oversized', name: 'Негабарит', type: 'legal', cost: 150000, reqLvl: 10, col1: 'Риск: 2%', col2: 'Штраф: 25k', col3: 'Бонус: +25%', col4: 'Скрытн: 90%', col5: 'Доступ: Техника' },
    { id: 'smuggling', name: 'Контрабанда', type: 'illegal', cost: 300000, reqLvl: 12, col1: 'Риск: 35%', col2: 'Штраф: 120k', col3: 'Бонус: +60%', col4: 'Скрытн: 40%', col5: 'Доступ: Теневой' },
    { id: 'falsified_docs', name: 'Липовые допуски', type: 'illegal', cost: 600000, reqLvl: 15, col1: 'Риск: 55%', col2: 'Штраф: 250k', col3: 'Бонус: +120%', col4: 'Скрытн: 20%', col5: 'Доступ: Синдикат' },
    { id: 'black_market', name: 'Черный коридор', type: 'illegal', cost: 1200000, reqLvl: 20, col1: 'Риск: 80%', col2: 'Штраф: 600k', col3: 'Бонус: +250%', col4: 'Скрытн: 10%', col5: 'Доступ: Элитный' }
];

const BACKGROUNDS_SHOP = [
    { id: 'bg_r1', name: 'Неоновый асфальт', rarity: 'rare', chance: 8.0, image: 'https://i.ibb.co.com/9mwvmfZG/IMG-4513.jpg' },
    { id: 'bg_r2', name: 'Ночной траверз', rarity: 'rare', chance: 8.0, image: 'https://i.ibb.co.com/HLhsyRKk/IMG-4514.jpg' },
    { id: 'bg_r3', name: 'Кибер-трасса 01', rarity: 'rare', chance: 8.0, image: 'https://i.ibb.co.com/mVjJzRdV/IMG-4519.jpg' },
    { id: 'bg_r4', name: 'Цифровой горизонт', rarity: 'rare', chance: 8.0, image: 'https://i.ibb.co.com/rKGsR0VC/IMG-4520.jpg' },
    { id: 'bg_r5', name: 'Скоростной пульс', rarity: 'rare', chance: 8.0, image: 'https://i.ibb.co.com/mCRj1msw/IMG-4523.jpg' },
    { id: 'bg_r6', name: 'Лазерный поток', rarity: 'rare', chance: 8.0, image: 'https://i.ibb.co.com/v4Sr1x8s/IMG-4524.jpg' },
    { id: 'bg_e1', name: 'Глубокий синий неоновый', rarity: 'epic', chance: 7.0, image: 'https://i.ibb.co.com/5CxBvqG/IMG-4527.jpg' },
    { id: 'bg_e2', name: 'Фиолетовый шторм', rarity: 'epic', chance: 7.0, image: 'https://i.ibb.co.com/hSXZxCJ/IMG-4528.jpg' },
    { id: 'bg_e3', name: 'Квантовый варп', rarity: 'epic', chance: 7.0, image: 'https://i.ibb.co.com/PGCmhw0V/IMG-4522.jpg' },
    { id: 'bg_e4', name: 'Глитч-драйв', rarity: 'epic', chance: 7.0, image: 'https://i.ibb.co.com/wkxt4Kd/IMG-4517.jpg' },
    { id: 'bg_m1', name: 'Астральный тоннель', rarity: 'mythic', chance: 4.0, image: 'https://i.ibb.co.com/kg81Wjdv/IMG-4525.jpg' },
    { id: 'bg_m2', name: 'Сверхсветовой прыжок', rarity: 'mythic', chance: 4.0, image: 'https://i.ibb.co.com/39rfWGkn/IMG-4516.jpg' },
    { id: 'bg_m3', name: 'Матричный пульс', rarity: 'mythic', chance: 4.0, image: 'https://i.ibb.co.com/s9ZnK8ss/IMG-4521.jpg' },
    { id: 'bg_l1', name: 'Абсолютный кибернетиз', rarity: 'legendary', chance: 2.0, image: 'https://i.ibb.co.com/KjbxLkzJ/IMG-4529.jpg' },
    { id: 'bg_l2', name: 'Ядро синдиката', rarity: 'legendary', chance: 2.0, image: 'https://i.ibb.co.com/23WZ4t1D/IMG-4526.jpg' },
    { id: 'bg_l3', name: 'Транспортный бог', rarity: 'legendary', chance: 1.0, image: 'https://i.ibb.co.com/mV8CH1jr/IMG-4518.jpg' }
];

const supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
const tgUser = tg.initDataUnsafe?.user;
const telegramId = tgUser?.id ? Number(tgUser.id) : 123456789;

const AudioSys = {
    playVibrate(type = 'success') {
        if (!tg.HapticFeedback) return;
        if(type === 'success') tg.HapticFeedback.notificationOccurred('success');
        if(type === 'error') tg.HapticFeedback.notificationOccurred('error');
        if(type === 'click' || type === 'info') tg.HapticFeedback.impactOccurred('medium');
    }
};

const MapSys = {
    currentRegion: 'all',
    selectRegion(regionId) {
        this.currentRegion = regionId; AudioSys.playVibrate('click');
        document.querySelectorAll('.map-node').forEach(el => el.classList.remove('active-node'));
        const activeNode = document.querySelector(`.node-${regionId}`);
        if(activeNode) activeNode.classList.add('active-node');
        const regionNames = { 'all': '📍 Все контракты', 'hub': '📦 Базовый Хаб', 'chem': '☣️ Хим-Завод', 'heavy': '🏗️ Промзона', 'shadow': '🥷 Теневой Порт' };
        UI.safeUpdate('selected-region-title', regionNames[regionId] || regionNames['all']);
        UI.renderAll();
    },
    getFilteredContracts() {
        if (this.currentRegion === 'all') return AppState.contracts;
        return AppState.contracts.filter(c => {
            if (this.currentRegion === 'hub') return c.reqLic === 'basic';
            if (this.currentRegion === 'chem') return c.reqLic === 'dangerous';
            if (this.currentRegion === 'heavy') return c.reqLic === 'oversized';
            if (this.currentRegion === 'shadow') return ['smuggling', 'falsified_docs', 'black_market'].includes(c.reqLic);
            return true;
        });
    }
};

const WorldState = {
    weather: { name: '☀️ Ясно', timeMod: 1.0, fuelMod: 1.0, wearMod: 1.0 },
    marketEvent: { name: 'Стабильность', effect: 'none', multiplier: 1.0 },
    generateWeather() {
        // Погода динамически влияет на экономику
        const types = [
            { name: '☀️ Ясно', timeMod: 1.0, fuelMod: 1.0, wearMod: 1.0 }, 
            { name: '🔥 Жара', timeMod: 1.0, fuelMod: 1.2, wearMod: 1.2 }, 
            { name: '🌨 Снег', timeMod: 1.3, fuelMod: 1.1, wearMod: 1.6 }, 
            { name: '🌧 Ливень', timeMod: 1.1, fuelMod: 1.0, wearMod: 1.4 },
            { name: '🌪️ Шторм', timeMod: 1.5, fuelMod: 1.3, wearMod: 2.0 }
        ];
        this.weather = types[Math.floor(Math.random() * types.length)]; 
        UI.safeUpdate('weather-info', this.weather.name);
    },
    generateMarketEvent() {
        // Рыночные ивенты увеличивают спрос и награды
        const events = [
            { name: '⚖️ Стабильность', effect: 'none', multiplier: 1.0, desc: "Рынок стабилен." }, 
            { name: '📈 Строительный бум', effect: 'Строймат', multiplier: 1.6, desc: "Спрос на стройматериалы вырос!" }, 
            { name: '⚡ Кризис микрочипов', effect: 'Электроника', multiplier: 1.8, desc: "Дефицит электроники!" }, 
            { name: '🛢 Топливный кризис', effect: 'Горючее', multiplier: 2.0, desc: "Спрос на горючее взлетел!" },
            { name: '🪖 Военный заказ', effect: 'Военка', multiplier: 2.5, desc: "Секретные поставки выросли в цене!" }
        ];
        this.marketEvent = events[Math.floor(Math.random() * events.length)];
        const banner = document.getElementById('global-event-banner'), title = document.getElementById('global-event-title'), desc = document.getElementById('global-event-desc');
        if (banner) {
            if (this.marketEvent.effect === 'none') banner.style.display = 'none';
            else { banner.style.display = 'block'; title.innerText = this.marketEvent.name; desc.innerText = this.marketEvent.desc; }
        }
    }
};

const EventSys = {
    activeEvent: null, timerInterval: null, qteInterval: null, activeQTE: null,
    checkEventsForTrip(trip) {
        if (this.activeEvent) return;
        // Базовый шанс ЧП
        let chance = 0.008; 
        // 1. Усталость водителя: шанс ЧП x3
        if (AppState.player.stamina < 20) chance *= 3;
        // 2. Уровень розыска: шанс облавы (таможни) выше
        chance += (AppState.player.wanted_level || 0) * 0.005;

        if (Math.random() < chance) {
            let roll = Math.random();
            if (roll < 0.25) this.triggerEvent(trip, 'customs'); 
            else if (roll < 0.50) this.triggerEvent(trip, 'breakdown'); 
            else if (roll < 0.75) this.triggerEvent(trip, 'weather_traffic'); 
            else this.triggerEvent(trip, 'accident');
        }
    },
    triggerEvent(trip, type) {
        let eventData = { tripId: trip.id, type: type, timeLeft: 30, title: '', desc: '', choices: [] };
        switch(type) {
            case 'breakdown': eventData.title = `🛠 Поломка`; eventData.desc = `Узел машины не выдержал.`; eventData.choices = [{ id: 'breakdown_tow', text: 'Эвакуатор (-15k 🪙)' }, { id: 'breakdown_abandon', text: 'Бросить' }]; break;
            case 'weather_traffic': eventData.title = `🌧 Дорожный затор`; eventData.desc = `Пробка. Опасный маневр?`; eventData.choices = [{ id: 'traffic_wait', text: 'Переждать' }, { id: 'traffic_rush', text: 'Рискнуть (QTE)' }]; break;
            case 'accident': eventData.title = `💥 ДТП!`; eventData.desc = `Груз поврежден.`; eventData.choices = [{ id: 'accident_insured', text: 'Страховка (Долго)' }, { id: 'accident_raw', text: 'Своими силами (-50k)' }]; break;
            case 'customs': eventData.title = `🚨 Таможня`; eventData.desc = `Патруль ФСБ требует досмотр.`; eventData.choices = [{ id: 'customs_bribe', text: 'Взятка (-25k 🪙)' }, { id: 'customs_break', text: 'Прорваться (QTE)' }]; break;
        }
        this.activeEvent = eventData; this.renderEventModal(); this.startEventTimer();
    },
    startEventTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (!this.activeEvent) return clearInterval(this.timerInterval);
            this.activeEvent.timeLeft--; UI.safeUpdate('event-timer-badge', `⏳ ${this.activeEvent.timeLeft}с`);
            if (this.activeEvent.timeLeft <= 0) { clearInterval(this.timerInterval); this.handleTimeout(); }
        }, 1000);
    },
    handleTimeout() { UI.showToast('Время истекло! Штраф', 'error'); this.closeEventModal(); AppState.player.money = Math.max(0, AppState.player.money - 10000); DB.syncPlayer(); UI.renderAll(); },
    resolveEvent(actionId) {
        if (this.timerInterval) clearInterval(this.timerInterval);
        // Интерактивные QTE (Мини-игры)
        if (actionId === 'traffic_rush' || actionId === 'customs_break') {
            this.startQTE(actionId);
            return;
        }

        switch(actionId) {
            case 'breakdown_tow': if (AppState.player.money >= 15000) { AppState.player.money -= 15000; UI.showToast('Эвакуировано', 'success'); } else UI.showToast('Нет денег!', 'error'); break;
            case 'breakdown_abandon': UI.showToast('Машина брошена.', 'error'); break;
            case 'traffic_wait': UI.showToast('Переждали', 'info'); break;
            case 'accident_insured': UI.showToast('Страховка покрыла ущерб', 'success'); break;
            case 'accident_raw': AppState.player.money = Math.max(0, AppState.player.money - 50000); break;
            case 'customs_bribe': if (AppState.player.money >= 25000) { AppState.player.money -= 25000; UI.showToast('Откупились.', 'success'); } else { UI.showToast('Штраф + Розыск', 'error'); AppState.player.wanted_level = Math.min(5, (AppState.player.wanted_level||0) + 1); } break;
        }
        this.closeEventModal(); DB.syncPlayer(); UI.renderAll();
    },
    startQTE(actionId) {
        this.activeQTE = { actionId: actionId, pos: 0, dir: 1, speed: 4 + Math.random() * 4 };
        const modal = document.getElementById('event-modal');
        modal.innerHTML = `
            <div class="card" style="width:100%;max-width:400px;text-align:center;">
                <h3 style="color:#fff;margin-bottom:10px;">⚡ БЫСТРАЯ РЕАКЦИЯ!</h3>
                <p style="font-size:12px;color:var(--hint-color);">Нажми кнопку, когда маркер будет в зеленой зоне!</p>
                <div class="qte-container">
                    <div class="qte-target-zone"></div>
                    <div id="qte-cursor" class="qte-cursor" style="left: 0%;"></div>
                </div>
                <button class="btn btn-primary" onclick="EventSys.clickQTE()">РЕАГИРОВАТЬ</button>
            </div>
        `;
        this.qteInterval = setInterval(() => {
            let q = EventSys.activeQTE; q.pos += q.speed * q.dir;
            if (q.pos >= 95 || q.pos <= 0) q.dir *= -1;
            document.getElementById('qte-cursor').style.left = `${q.pos}%`;
        }, 50);
    },
    clickQTE() {
        clearInterval(this.qteInterval);
        const pos = this.activeQTE.pos;
        const isSuccess = pos >= 60 && pos <= 80; // Target zone 60-80%
        
        if (isSuccess) {
            UI.showToast('Успех! Ситуация под контролем!', 'success');
            if (this.activeQTE.actionId === 'customs_break') GameLogic.addXP(500);
        } else {
            UI.showToast('Провал! Штраф и поломка', 'error');
            AppState.player.money = Math.max(0, AppState.player.money - 30000);
            if (this.activeQTE.actionId === 'customs_break') {
                AppState.player.wanted_level = Math.min(5, (AppState.player.wanted_level || 0) + 1);
                UI.showToast('Внимание! +1 Звезда розыска👮', 'error');
            }
        }
        this.closeEventModal(); DB.syncPlayer(); UI.renderAll();
    },
    renderEventModal() {
        let ex = document.getElementById('event-modal'); if (ex) ex.remove();
        const ev = this.activeEvent; if (!ev) return;
        const modalHtml = `<div id="event-modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(8px);"><div class="card" style="width:100%;max-width:400px;border-color:var(--accent-pink);box-shadow:0 0 30px rgba(236,72,153,0.3);"><div class="card-title" style="display:flex;justify-content:space-between;align-items:center;"><span style="color:var(--accent-pink);">${ev.title}</span><span id="event-timer-badge" style="background:rgba(236,72,153,0.2);padding:2px 8px;border-radius:6px;font-size:12px;font-weight:bold;">⏳ ${ev.timeLeft}с</span></div><p style="font-size:13px;color:var(--hint-color);margin:12px 0 16px 0;">${ev.desc}</p><div style="display:flex;flex-direction:column;gap:8px;">${ev.choices.map(c => `<button class="btn btn-outline" style="text-align:left;font-size:12px;padding:10px;border-color:var(--accent-blue);" onclick="EventSys.resolveEvent('${c.id}')">👉 ${c.text}</button>`).join('')}</div></div></div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },
    closeEventModal() { const modal = document.getElementById('event-modal'); if (modal) modal.remove(); this.activeEvent = null; if (this.timerInterval) clearInterval(this.timerInterval); if (this.qteInterval) clearInterval(this.qteInterval); }
};

const AppState = {
    leaderboardCategory: 'profit', 
    player: { 
        id: null, name: tgUser?.first_name || 'Логист', avatar: tgUser?.photo_url || '', money: 100000, fuel_stock: 400, fuel_price: 12, level: 1, xp: 0, 
        total_profit: 0, total_trips: 0, licenses: ['basic'], current_background: 'bg_r1', unlocked_backgrounds: ['bg_r1'],
        stamina: 100, wanted_level: 0, garage_level: 0 // НОВЫЕ ПАРАМЕТРЫ
    },
    trucks: [], activeTrips: [], leaderboard: [],
    contracts: [
        { id: 1, title: 'Обычный: Доски', name: 'Доски', diff: 'Обычный', badgeClass: 'badge-ordinary', image: 'https://i.ibb.co.com/nxzLBSw/0-B0-F3-ED8-68-F9-4-D11-9455-63-CEE59-DEC70.png', reward: 5200, fuel: 70, duration: 15, reqLvl: 1, reqLic: 'basic' },
        { id: 2, title: 'Обычный: Продукты', name: 'Продукты', diff: 'Обычный', badgeClass: 'badge-ordinary', image: 'https://i.ibb.co.com/YBMmXNHj/74065-E6-B-D63-E-446-D-A8-E1-95492-C930-D70.png', reward: 8900, fuel: 100, duration: 22, reqLvl: 2, reqLic: 'basic' },
        { id: 3, title: 'Обычный: Строймат', name: 'Строймат', diff: 'Обычный', badgeClass: 'badge-ordinary', image: 'https://i.ibb.co.com/Q7ggLnTC/82669679-96-F8-46-A1-9-AE1-BBFEAD007153.png', reward: 11500, fuel: 140, duration: 30, reqLvl: 3, reqLic: 'basic' },
        { id: 4, title: 'Обычный: Текстиль', name: 'Текстиль', diff: 'Обычный', badgeClass: 'badge-ordinary', image: 'https://i.ibb.co.com/67TNNkvy/67872-D1-B-C0-D3-45-AB-8-A9-D-11-C0-EC734-FC8.png', reward: 18000, fuel: 180, duration: 45, reqLvl: 4, reqLic: 'basic' },
        { id: 5, title: 'Обычный: Электроника', name: 'Электроника', diff: 'Редкий', badgeClass: 'badge-rare', image: 'https://i.ibb.co.com/bThvzjv/12-AF1-E99-6-BDE-42-F0-8279-393-B53-DD51-EC.png', reward: 25000, fuel: 220, duration: 60, reqLvl: 5, reqLic: 'basic' },
        { id: 6, title: 'Опасный: Химикаты', name: 'Химикаты', diff: 'Редкий', badgeClass: 'badge-rare', image: 'https://i.ibb.co.com/DPLBSsd9/80-EEB782-572-C-402-C-B9-A2-AD4-DBFC19357.png', reward: 40000, fuel: 350, duration: 120, reqLvl: 6, reqLic: 'dangerous' },
        { id: 7, title: 'Опасный: Горючее', name: 'Горючее', diff: 'Редкий', badgeClass: 'badge-rare', image: 'https://i.ibb.co.com/ZpJQfZ7K/70-EDCB4-B-C9-F6-4633-9-C7-C-C0-BB8580-A3-BA.png', reward: 65000, fuel: 500, duration: 240, reqLvl: 8, reqLic: 'dangerous' },
        { id: 9, title: 'Негабарит: Спецтехника', name: 'Спецтехника', diff: 'Эпический', badgeClass: 'badge-epic', image: 'https://i.ibb.co.com/WvL7611N/9-BFBF2-DE-90-B2-4970-84-CC-C3-A98248-B0-CE.png', reward: 150000, fuel: 1000, duration: 600, reqLvl: 12, reqLic: 'oversized' },
        { id: 12, title: 'Теневой: Алкоголь', name: 'Контрабанда', diff: 'Нелегал', badgeClass: 'badge-illegal', image: 'https://i.ibb.co.com/1GcDdFJ9/D19-A33-BF-999-E-4-B0-F-8-D66-C3714-FCA6163.png', reward: 220000, fuel: 1200, duration: 900, reqLvl: 12, reqLic: 'smuggling' },
        { id: 13, title: 'Теневой: Военка', name: 'Военка', diff: 'Легенда', badgeClass: 'badge-legendary', image: 'https://i.ibb.co.com/mrSV75fk/AB71-CD39-0-F80-4-ED6-9-BE3-DF083613-E834.png', reward: 380000, fuel: 1600, duration: 1300, reqLvl: 14, reqLic: 'smuggling' },
        { id: 16, title: 'Секретно: Оружие', name: 'Прототипы', diff: 'Нелегал', badgeClass: 'badge-illegal', image: 'https://i.ibb.co.com/Hf6fFHCL/D70-EB30-C-6520-441-B-8-D1-E-1-C9763-AB202-C.png', reward: 1300000, fuel: 3500, duration: 3000, reqLvl: 22, reqLic: 'black_market' }
    ]
};

const DB = {
    async init() {
        try {
            let { data: exPlayer } = await supabaseClient.from('players').select('*').eq('telegram_id', telegramId).maybeSingle();
            if (!exPlayer) await this.createNewPlayer();
            else {
                AppState.player = { ...AppState.player, ...exPlayer };
                // Совместимость со старыми записями
                if (AppState.player.stamina === undefined) AppState.player.stamina = 100;
                if (AppState.player.wanted_level === undefined) AppState.player.wanted_level = 0;
                if (AppState.player.garage_level === undefined) AppState.player.garage_level = 0;
            }
            await this.loadGameData(); await this.loadLeaderboard(); UI.renderAll();
        } catch (e) { UI.showToast("Ошибка: " + e.message, "error"); }
    },
    async createNewPlayer() {
        let pay = { telegram_id: telegramId, name: AppState.player.name, avatar: AppState.player.avatar, money: 100000, fuel_stock: 400, level: 1, xp: 0, stamina: 100, wanted_level: 0, garage_level: 0, licenses: ['basic'], unlocked_backgrounds: ['bg_r1'] };
        let { data, error } = await supabaseClient.from('players').insert([pay]).select().single();
        if (data) AppState.player = { ...AppState.player, ...data };
    },
    async loadGameData() {
        const [tRes, trRes] = await Promise.all([supabaseClient.from('trucks').select('*').eq('player_id', AppState.player.id), supabaseClient.from('active_trips').select('*').eq('player_id', AppState.player.id)]);
        AppState.trucks = tRes.data || []; AppState.activeTrips = trRes.data || [];
    },
    async loadLeaderboard() {
        const sf = AppState.leaderboardCategory === 'trips' ? 'total_trips' : 'total_profit';
        const { data } = await supabaseClient.from('players').select('id, name, avatar, total_profit, total_trips, level, current_background').order(sf, { ascending: false }).limit(20);
        if (data) AppState.leaderboard = data;
    },
    async syncPlayer() {
        const p = AppState.player; if (!p.id) return;
        let uD = { money: Number(p.money), fuel_stock: Number(p.fuel_stock), level: Number(p.level), xp: Number(p.xp), total_profit: Number(p.total_profit), total_trips: Number(p.total_trips), stamina: Number(p.stamina || 0), wanted_level: Number(p.wanted_level || 0), garage_level: Number(p.garage_level || 0), licenses: p.licenses, current_background: p.current_background, unlocked_backgrounds: p.unlocked_backgrounds };
        await supabaseClient.from('players').update(uD).eq('id', p.id);
        this.loadLeaderboard();
    }
};

const GameLogic = {
    getReqXP(lvl) { return Math.floor(1000 * Math.pow(1.5, lvl - 1)); },
    async addXP(amount) {
        AppState.player.xp = Number(AppState.player.xp) + Number(amount); let req = this.getReqXP(AppState.player.level);
        while (AppState.player.xp >= req) { AppState.player.xp -= req; AppState.player.level++; req = this.getReqXP(AppState.player.level); UI.showToast(`НОВЫЙ УРОВЕНЬ: ${AppState.player.level}!`, 'success'); }
    },
    getRepairCost(val) { 
        if (val >= 100) return 0; 
        const m = 100 - val; 
        let baseCost = (val >= 50) ? m * 150 : (val >= 20) ? m * 250 : (m * 400);
        // Личный гараж снижает цену на 5% за каждый уровень
        let discount = 1 - ((AppState.player.garage_level || 0) * 0.05);
        return Math.floor(baseCost * discount); 
    },
    async repairPart(truckId, pName) {
        const t = AppState.trucks.find(x => String(x.id) === String(truckId)); if (!t) return;
        const cVal = Number(t[pName]) || 0; if (cVal >= 100) return;
        const rc = this.getRepairCost(cVal); if (AppState.player.money < rc) return UI.showToast(`Нужно ${rc} 🪙`, 'error');
        AppState.player.money -= rc; t[pName] = 100;
        await supabaseClient.from('trucks').update({ [pName]: 100 }).eq('id', t.id);
        await DB.syncPlayer(); UI.showToast(`Узел отремонтирован!`, 'success'); UI.renderAll();
    },
    // НОВЫЕ ФУНКЦИИ ИНФРАСТРУКТУРЫ
    buyCoffee() {
        if (AppState.player.money < 5000) return UI.showToast("Нужно 5,000 🪙", "error");
        AppState.player.money -= 5000;
        AppState.player.stamina = Math.min(100, (AppState.player.stamina || 0) + 40);
        DB.syncPlayer(); UI.renderAll(); UI.showToast("Бодрость восстановлена!", "success");
    },
    buyLawyer() {
        if ((AppState.player.wanted_level || 0) <= 0) return UI.showToast("Вы чисты перед законом", "info");
        const cost = AppState.player.wanted_level * 150000;
        if (AppState.player.money < cost) return UI.showToast(`Нужно ${cost.toLocaleString()} 🪙`, "error");
        AppState.player.money -= cost; AppState.player.wanted_level = 0;
        DB.syncPlayer(); UI.renderAll(); UI.showToast("Звезды розыска сняты!", "success");
    },
    upgradeGarage() {
        const lvl = AppState.player.garage_level || 0;
        if (lvl >= 5) return UI.showToast("Максимальный уровень!", "info");
        const cost = 250000 * (lvl + 1);
        if (AppState.player.money < cost) return UI.showToast(`Нужно ${cost.toLocaleString()} 🪙`, "error");
        AppState.player.money -= cost; AppState.player.garage_level = lvl + 1;
        DB.syncPlayer(); UI.renderAll(); UI.showToast("Гараж улучшен!", "success");
    },
    rerollWeather() {
        if (AppState.player.money < 15000) return UI.showToast("Нужно 15,000 🪙", "error");
        AppState.player.money -= 15000; WorldState.generateWeather(); 
        DB.syncPlayer(); UI.renderAll(); UI.showToast("Погода изменилась", "success");
    },

    async startTrip(reward, fuel, duration, title, reqLvl, reqLic) {
        if (AppState.player.level < reqLvl) return UI.showToast(`Требуется уровень ${reqLvl}!`, 'error');
        if (!AppState.player.licenses.includes(reqLic)) return UI.showToast('Нет лицензии!', 'error');
        
        // ВЛИЯНИЕ УСТАЛОСТИ
        if (AppState.player.stamina < 5) return UI.showToast("Водитель валится с ног! Срочно нужен отель.", "error");

        // ВЛИЯНИЕ ПОГОДЫ (Блокировки)
        const wName = WorldState.weather.name;
        if ((wName === '🌨 Снег' || wName === '🌪️ Шторм' || wName === '🌧 Ливень') && (reqLic === 'oversized' || reqLic === 'dangerous')) {
            return UI.showToast(`В ${wName} запрещен выезд опасных/негабаритных грузов!`, "error");
        }

        const actIds = AppState.activeTrips.map(t => t.truck_id);
        const idleTruck = AppState.trucks.find(t => !actIds.includes(t.id) && t.engineLvl > 0 && t.tiresLvl > 0 && t.gearLvl > 0 && t.brakesLvl > 0);
        if (!idleTruck) return UI.showToast('Нет исправных свободных тягачей!', 'error');

        // РЫНОЧНАЯ СПЕКУЛЯЦИЯ
        if (WorldState.marketEvent.effect !== 'none' && title.includes(WorldState.marketEvent.effect)) {
            reward = Math.floor(reward * WorldState.marketEvent.multiplier);
        }

        let fFuel = Math.floor(fuel * WorldState.weather.fuelMod);
        let fDur = Math.floor(duration * WorldState.weather.timeMod);

        // ШТРАФ УСТАЛОСТИ (<20% бодрости)
        if (AppState.player.stamina < 20) {
            fDur = Math.floor(fDur * 1.3); // +30% к времени
            UI.showToast("Водитель истощен, рейс займет больше времени!", "info");
        }

        if (AppState.player.fuel_stock < fFuel) return UI.showToast(`Нужно ${fFuel}л!`, 'error');
        
        // Списываем бодрость
        let stamCost = Math.max(2, Math.floor(duration / 30)); 
        AppState.player.stamina = Math.max(0, AppState.player.stamina - stamCost);

        let endTime = Date.now() + (fDur * 1000);
        let { data } = await supabaseClient.from('active_trips').insert([{ player_id: AppState.player.id, truck_id: idleTruck.id, title: title, reward: reward, fuel_req: fFuel, end_time: endTime }]).select().single();
        if (data) {
            AppState.player.fuel_stock -= fFuel; AppState.activeTrips.push(data); await DB.syncPlayer();
            UI.showToast(`Рейс начат!`, 'success'); UI.renderAll();
        }
    },
    async finishTrip(tripId) {
        const tIdx = AppState.activeTrips.findIndex(t => t.id === tripId); if (tIdx === -1) return;
        const trip = AppState.activeTrips[tIdx];
        let p = Number(trip.reward); let exp = Math.floor(p * CONFIG.XP_MULTIPLIER);
        AppState.player.money += p; AppState.player.total_profit += p; AppState.player.total_trips += 1;
        
        // ИЗНОС ДЕТАЛЕЙ С УЧЕТОМ ПОГОДЫ
        const t = AppState.trucks.find(x => x.id === trip.truck_id);
        if (t) {
            const w = Math.max(1, Math.floor((Math.floor(Math.random() * 6) + 5) * WorldState.weather.wearMod));
            t.engineLvl = Math.max(0, t.engineLvl - w); t.tiresLvl = Math.max(0, t.tiresLvl - Math.floor(w + 3)); t.gearLvl = Math.max(0, t.gearLvl - w); t.brakesLvl = Math.max(0, t.brakesLvl - Math.floor(w + 2));
            await supabaseClient.from('trucks').update({ engineLvl: t.engineLvl, tiresLvl: t.tiresLvl, gearLvl: t.gearLvl, brakesLvl: t.brakesLvl }).eq('id', t.id);
        }

        // РОЗЫСК (Если рейс нелегальный)
        if (trip.title.includes('Теневой') || trip.title.includes('Черный рынок') || trip.title.includes('Секретно')) {
            if (Math.random() < 0.2) { // 20% шанс получить звезду после удачного нелегального рейса
                AppState.player.wanted_level = Math.min(5, (AppState.player.wanted_level || 0) + 1);
                UI.showToast('Внимание! +1 Звезда розыска👮', 'error');
            }
        }

        await this.addXP(exp); await supabaseClient.from('active_trips').delete().eq('id', trip.id);
        AppState.activeTrips.splice(tIdx, 1); await DB.syncPlayer();
        UI.showToast(`Рейс завершен! +${p.toLocaleString()} 🪙`, 'success'); UI.renderAll();
    }
};

const UI = {
    switchTab(tId) {
        document.querySelectorAll('.tab-content, .nav-item').forEach(e => e.classList.remove('active'));
        const t = document.getElementById(`tab-${tId}`); if (t) t.classList.add('active');
        document.querySelectorAll('.nav-item').forEach(b => { if(b.getAttribute('onclick')?.includes(tId)) b.classList.add('active'); });
        AudioSys.playVibrate('click'); this.renderAll();
    },
    showToast(msg, type = 'success') {
        const c = document.getElementById('toast-container'); if (!c) return;
        const t = document.createElement('div'); t.className = `toast ${type}`; t.innerText = msg; c.appendChild(t);
        AudioSys.playVibrate(type); setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
    },
    safeUpdate(id, t) { const e = document.getElementById(id); if (e) e.innerText = t; },
    safeUpdateHTML(id, h) { const e = document.getElementById(id); if (e) e.innerHTML = h; },
    
    renderAll() {
        const p = AppState.player;
        this.safeUpdate('user-money', `🪙 ${Number(p.money).toLocaleString()}`); 
        this.safeUpdate('user-fuel-stock', `⛽ ${Number(p.fuel_stock)}л`);

        // РЕНДЕР БОДРОСТИ
        const stamBadge = document.getElementById('user-stamina');
        if (stamBadge) {
            stamBadge.innerText = `🔋 ${Math.floor(p.stamina || 100)}%`;
            stamBadge.style.color = p.stamina > 50 ? '#10B981' : (p.stamina > 20 ? '#F59E0B' : '#EF4444');
            p.stamina < 20 ? stamBadge.classList.add('stamina-low') : stamBadge.classList.remove('stamina-low');
        }
        // РЕНДЕР РОЗЫСКА
        const wantedBadge = document.getElementById('user-wanted');
        if (wantedBadge) {
            if ((p.wanted_level || 0) > 0) {
                wantedBadge.style.display = 'block'; wantedBadge.innerHTML = `👮 ${'★'.repeat(p.wanted_level)}`;
            } else wantedBadge.style.display = 'none';
        }

        // РЕНДЕР ГАРАЖА (В автопарке и центре)
        this.safeUpdateHTML('garage-status-panel', `
            <div class="card" style="border-color:var(--accent-purple); display:flex; justify-content:space-between; align-items:center;">
                <div><div style="font-size:13px; font-weight:bold;">🏗️ Личный гараж</div><div style="font-size:11px; color:var(--hint-color);">Текущий уровень: ${p.garage_level || 0}</div></div>
                <div style="color:var(--success-color); font-weight:bold; font-size:12px;">Скидка ${ (p.garage_level||0)*5 }% на ремонт</div>
            </div>
        `);
        this.safeUpdate('garage-title-center', `🏗️ Личный гараж (Ур. ${p.garage_level||0})`);
        const btnGar = document.getElementById('btn-upgrade-garage');
        if (btnGar) { btnGar.innerText = (p.garage_level||0) >= 5 ? 'МАКСИМУМ' : 'Улучшить'; btnGar.disabled = (p.garage_level||0) >= 5; }

        // АВТОПАРК
        const aTI = AppState.activeTrips.map(t => t.truck_id);
        let fH = AppState.trucks.map(t => {
            const isB = aTI.includes(t.id);
            let a100 = true, tRC = 0, pts = [{ k: 'engineLvl', n: '🛠 Двс' }, { k: 'tiresLvl', n: '🛞 Шины' }, { k: 'gearLvl', n: '⚙️ КПП' }, { k: 'brakesLvl', n: '🧯 Торм' }];
            let ptH = pts.map(pt => {
                const v = Number(t[pt.k]) || 100; let cl = v < 40 ? '#EF4444' : v < 75 ? '#F59E0B' : '#10B981';
                if (v < 100) a100 = false; const rc = GameLogic.getRepairCost(v); tRC += rc;
                return `<div class="part-card"><div class="part-header"><span>${pt.n}</span><span style="color:${cl};">${v}%</span></div><div class="part-bar"><div class="part-bar-fill" style="width:${v}%;background-color:${cl};"></div></div><button class="btn btn-outline btn-repair" style="width:100%; padding:4px; margin-top:6px;" ${isB || v === 100 ? 'disabled' : ''} onclick="GameLogic.repairPart('${t.id}', '${pt.k}')">${v === 100 ? 'OK' : `${(rc/1000).toFixed(1)}k`}</button></div>`;
            }).join('');
            return `<div class="card" style="margin-bottom:16px;"><div class="card-title"><span>🚚 ${t.name}</span></div><div class="parts-grid">${ptH}</div></div>`;
        }).join('');
        this.safeUpdateHTML('fleet-list', fH);

        // РЕЙСЫ (АКТИВНЫЕ)
        this.safeUpdateHTML('active-trip-panel', AppState.activeTrips.map(tr => { 
            let l = Math.floor((tr.end_time - Date.now()) / 1000); 
            if (l <= 0) { GameLogic.finishTrip(tr.id); return ''; } 
            if (Math.random() < 0.05) EventSys.checkEventsForTrip(tr); 
            return `<div class="card rarity-epic"><div class="card-title"><span>В пути</span><span style="color:var(--accent-blue);">⏳ ${l} с</span></div><p style="font-size:12px;color:var(--hint-color);">${tr.title}</p></div>`; 
        }).join(''));

        // СПИСОК РЕЙСОВ (СПЕКУЛЯЦИЯ)
        const hI = AppState.trucks.some(t => !aTI.includes(t.id) && t.engineLvl > 0 && t.tiresLvl > 0 && t.gearLvl > 0 && t.brakesLvl > 0);
        this.safeUpdateHTML('contracts-list', MapSys.getFilteredContracts().map(c => {
            const lL = p.level < c.reqLvl, lLic = !p.licenses.includes(c.reqLic), iL = lL || lLic;
            let cR = c.reward; 
            let isHot = (WorldState.marketEvent.effect !== 'none' && c.title.includes(WorldState.marketEvent.effect));
            if (isHot) cR = Math.floor(cR * WorldState.marketEvent.multiplier);
            
            let bt = lL ? `Ур. ${c.reqLvl}` : lLic ? 'Лицензия' : !hI ? 'Нет фур' : 'Начать рейс', bc = lL || lLic || !hI ? 'contract-action-btn disabled' : 'contract-action-btn active';
            
            return `<div class="contract-card ${isHot ? 'hot-contract' : ''}" style="${iL ? 'opacity:0.6' : ''}"><div class="contract-header"><div class="contract-title-group"><span class="contract-badge ${c.badgeClass}">${c.diff}</span><span class="contract-name">${isHot ? '📈' : ''} ${c.name}</span></div><div class="contract-reward">+${cR.toLocaleString()} 🪙</div></div><button class="${bc}" ${!hI || iL ? 'disabled' : ''} onclick="GameLogic.startTrip(${c.reward}, ${c.fuel}, ${c.duration}, '${c.title}', ${c.reqLvl}, '${c.reqLic}')">${bt}</button></div>`;
        }).join(''));
    }
};

document.addEventListener('DOMContentLoaded', () => {
    WorldState.generateWeather(); WorldState.generateMarketEvent();
    const ld = document.getElementById('loading-screen');
    if (ld) {
        let p = 0, int = setInterval(() => { p += 20; document.getElementById('loader-progress').style.width = `${p}%`; document.getElementById('loader-percent').innerText = `${p}%`; if(p >= 100) { clearInterval(int); document.getElementById('loader-tap').style.display = 'block'; ld.addEventListener('click', () => { ld.style.opacity = '0'; document.getElementById('app-content').style.opacity = '1'; setTimeout(() => ld.remove(), 500); DB.init(); }); } }, 200);
    } else DB.init();
    setInterval(() => { if (AppState.activeTrips.length > 0) UI.renderAll(); }, 1000);
    setInterval(() => { WorldState.generateWeather(); }, 180000); 
    setInterval(() => { WorldState.generateMarketEvent(); UI.renderAll(); }, 300000);
});

window.switchTab = (id) => UI.switchTab(id); window.AdminSys = { addMoney: (a) => { AppState.player.money += a; DB.syncPlayer(); UI.renderAll(); } }; window.GameLogic = GameLogic; window.EventSys = EventSys; window.MapSys = MapSys; window.UI = UI;
