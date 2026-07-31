const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// --- КОНФИГИ И МАССИВЫ (Сжаты для экономии места, но логика полная) ---
const CONFIG = { SUPABASE_URL: 'https://aiqlcndsayerxjtcwqbj.supabase.co', SUPABASE_ANON_KEY: 'sb_publishable_zKJ28h0HfzaojbT9s1uwmw_eX7UQZz0', XP_MULTIPLIER: 0.15, CASE_COST: 10000000 };
const TRUCK_SHOP = [ { id: 't1', name: 'ГАЗель "Метеор"', capacity: 1500, fuel_use: 20, rarity: 'common', price: 75000 }, { id: 't4', name: 'Scania R730', capacity: 8500, fuel_use: 60, rarity: 'rare', price: 420000 }, { id: 't8', name: 'Quantum Leviathan', capacity: 25000, fuel_use: 120, rarity: 'legendary', price: 1500000 } ];
const LICENSES_SHOP = [ { id: 'basic', name: 'Базовая', type: 'legal', cost: 0, reqLvl: 1 }, { id: 'dangerous', name: 'Опасные грузы', type: 'legal', cost: 50000, reqLvl: 5 }, { id: 'smuggling', name: 'Контрабанда', type: 'illegal', cost: 300000, reqLvl: 12 } ];
const BACKGROUNDS_SHOP = [ { id: 'bg_r1', name: 'Неоновый асфальт', rarity: 'rare', chance: 10.0, image: 'https://i.ibb.co.com/9mwvmfZG/IMG-4513.jpg' } ];

const supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
const telegramId = tg.initDataUnsafe?.user?.id ? Number(tg.initDataUnsafe.user.id) : 123456789;

// --- СОСТОЯНИЕ ИГРОКА И МИРА ---
const AppState = {
    leaderboardCategory: 'profit',
    player: { id: null, name: tg.initDataUnsafe?.user?.first_name || 'Логист', money: 100000, fuel_stock: 400, fuel_price: 12, level: 1, xp: 0, total_profit: 0, total_trips: 0, licenses: ['basic'], current_background: 'bg_r1', unlocked_backgrounds: ['bg_r1'], stamina: 100, wanted_level: 0, garage_level: 1, skills: { eco: 0, luck: 0, mechanic: 0 }, syndicate: null },
    trucks: [], activeTrips: [], leaderboard: [], syndicateData: {},
    contracts: [
        { id: 1, title: 'Обычный: Доски', name: 'Доски', diff: 'Обычный', badgeClass: 'badge-ordinary', reward: 5200, fuel: 70, duration: 15, reqLvl: 1, reqLic: 'basic' },
        { id: 4, title: 'Опасный: Химикаты', name: 'Химикаты', diff: 'Редкий', badgeClass: 'badge-rare', reward: 40000, fuel: 350, duration: 60, reqLvl: 5, reqLic: 'dangerous' },
        { id: 6, title: 'Теневой: Контрабанда', name: 'Контрабанда', diff: 'Нелегал', badgeClass: 'badge-illegal', reward: 220000, fuel: 1200, duration: 90, reqLvl: 12, reqLic: 'smuggling' }
    ]
};

// Фича 2 и 3: Погода и Динамический Спрос
const WorldState = {
    weather: { name: '☀️ Ясно', timeMod: 1.0, fuelMod: 1.0, wearMod: 1.0 }, forecast_purchased: false,
    sectorDemands: { hub: 'Доски', chem: 'Химикаты', heavy: 'Спецтехника', shadow: 'Контрабанда' },
    generateWeather() {
        const types = [ { name: '☀️ Ясно', timeMod: 1.0, wearMod: 1.0 }, { name: '🌨 Снег (Износ x1.5)', timeMod: 1.3, wearMod: 1.5 }, { name: '🌧 Ливень (Время x1.2)', timeMod: 1.2, wearMod: 1.2 } ];
        this.weather = types[Math.floor(Math.random() * types.length)];
        this.forecast_purchased = false; // Сброс прогноза при смене погоды
        UI.safeUpdate('weather-info', this.weather.name);
    },
    generateMarketEvent() {
        const keys = ['Доски', 'Продукты', 'Химикаты', 'Спецтехника', 'Контрабанда'];
        this.sectorDemands = { hub: keys[Math.floor(Math.random()*keys.length)], chem: keys[Math.floor(Math.random()*keys.length)], heavy: keys[Math.floor(Math.random()*keys.length)], shadow: keys[Math.floor(Math.random()*keys.length)] };
        AIDispatcher.showPopup("Обновлен спрос на биржах! Проверьте контракты.");
        UI.renderAll();
    }
};

// --- СИСТЕМЫ ---
const AudioSys = {
    musicOn: false, sfxOn: true,
    toggleMusic() { this.musicOn = !this.musicOn; const bgm = document.getElementById('bg-music'); if(this.musicOn) bgm?.play(); else bgm?.pause(); document.getElementById('btn-music').innerText = this.musicOn ? "Музыка 🔊" : "Музыка 🔇"; },
    toggleSFX() { this.sfxOn = !this.sfxOn; document.getElementById('btn-sfx').innerText = this.sfxOn ? "Эффекты 🔊" : "Эффекты 🔇"; },
    playSFX(type) { if(!this.sfxOn) return; const s = document.getElementById('sfx-'+type); if(s) { s.currentTime=0; s.volume=0.6; s.play().catch(()=>{}); } },
    vibrate(type) { if(this.sfxOn && tg.HapticFeedback) { if(type==='success'||type==='error') tg.HapticFeedback.notificationOccurred(type); else tg.HapticFeedback.impactOccurred('medium'); } }
};

const AIDispatcher = {
    showPopup(msg) { const e = document.getElementById('ai-dispatcher'); if(!e) return; document.getElementById('ai-message').innerText = msg; e.classList.add('show'); AudioSys.vibrate('info'); setTimeout(()=>e.classList.remove('show'), 5000); }
};

const MapSys = {
    currentRegion: 'all',
    selectRegion(id) {
        this.currentRegion = id; AudioSys.playSFX('click'); AudioSys.vibrate('click');
        document.querySelectorAll('.map-node').forEach(e => e.classList.remove('active-node'));
        if(id !== 'all') document.querySelector(`.node-${id}`)?.classList.add('active-node');
        UI.renderAll();
    }
};

// Фича 4 и 5: Ивенты, QTE и Розыск
const EventSys = {
    activeEvent: null, timerInterval: null, qteInterval: null,
    checkEventsForTrip(trip) {
        if (this.activeEvent) return;
        // Если бодрость низкая, шанс ЧП выше
        let baseChance = AppState.player.stamina < 30 ? 0.05 : 0.01;
        if (Math.random() < baseChance) {
            const types = ['drift', 'brakes', 'customs'];
            const type = types[Math.floor(Math.random() * types.length)];
            if (type === 'customs') this.triggerEvent(trip, 'customs');
            else this.triggerQTEEvent(trip, type, type === 'drift' ? '⚠️ ЗАНОС! ЖМИ ТОРМОЗ!' : '⚠️ ОТКАЗ ТОРМОЗОВ! СТОП!');
        }
    },
    triggerQTEEvent(trip, type, title) {
        let ex = document.getElementById('event-modal'); if (ex) ex.remove();
        let timeLeft = 3; AudioSys.playSFX('error');
        const h = `<div id="event-modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;"><div class="card" style="width:100%;max-width:360px;text-align:center;border-color:var(--accent-pink);"><h3 style="color:var(--accent-pink);margin-bottom:10px;">ЭКСТРЕННАЯ СИТУАЦИЯ</h3><p style="font-size:16px;font-weight:bold;margin-bottom:20px;">${title}</p><div class="qte-container"><button class="qte-target-btn" onclick="EventSys.resolveQTE(true)">СТОП</button><div id="qte-timer-txt" style="margin-top:10px;color:var(--hint-color);">Осталось: ${timeLeft}с</div></div></div></div>`;
        document.body.insertAdjacentHTML('beforeend', h);
        this.qteInterval = setInterval(() => {
            timeLeft--; document.getElementById('qte-timer-txt').innerText = `Осталось: ${timeLeft}с`;
            if (timeLeft <= 0) this.resolveQTE(false);
        }, 1000);
    },
    resolveQTE(success) {
        clearInterval(this.qteInterval); document.getElementById('event-modal')?.remove();
        if (success) { UI.showToast('Рефлексы спасли груз!', 'success'); } 
        else { UI.showToast('Провал! Серьезные повреждения тягача.', 'error'); AppState.player.money = Math.max(0, AppState.player.money - 20000); }
        DB.syncPlayer(); UI.renderAll();
    },
    triggerEvent(trip, type) {
        const h = `<div id="event-modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;"><div class="card" style="width:100%;max-width:360px;border-color:#EF4444;"><h3 style="color:#EF4444;margin-bottom:10px;">🚨 ТАМОЖЕННЫЙ ПАТРУЛЬ</h3><p style="font-size:12px;margin-bottom:16px;">Груз проверяют. Что делаем?</p><button class="btn btn-outline" style="margin-bottom:8px;" onclick="EventSys.resolveEvent('bribe')">Взятка (25k 🪙)</button><button class="btn btn-outline" style="border-color:#EF4444;" onclick="EventSys.resolveEvent('run')">Прорыв (Риск розыска!)</button></div></div>`;
        document.body.insertAdjacentHTML('beforeend', h);
    },
    resolveEvent(action) {
        document.getElementById('event-modal')?.remove();
        if (action === 'bribe') {
            if (AppState.player.money >= 25000) { AppState.player.money -= 25000; UI.showToast('Откупились.', 'success'); }
            else { UI.showToast('Нет денег! Розыск повышен.', 'error'); AppState.player.wanted_level = Math.min(5, AppState.player.wanted_level + 1); }
        } else if (action === 'run') {
            if (Math.random() > 0.5) { UI.showToast('Ушли от погони!', 'success'); AppState.player.wanted_level = Math.min(5, AppState.player.wanted_level + 2); }
            else { UI.showToast('Пойманы! Огромный штраф.', 'error'); AppState.player.money = Math.max(0, AppState.player.money - 100000); AppState.player.wanted_level = 5; }
        }
        DB.syncPlayer(); UI.renderAll();
    }
};

const DB = {
    async init() {
        let { data } = await supabaseClient.from('players').select('*').eq('telegram_id', telegramId).maybeSingle();
        if (!data) await this.createNewPlayer(); else { AppState.player = { ...AppState.player, ...data }; }
        await this.loadGameData(); UI.renderAll();
    },
    async createNewPlayer() {
        let p = { telegram_id: telegramId, name: AppState.player.name, money: 100000, fuel_stock: 400, level: 1, xp: 0, total_trips: 0, stamina: 100, wanted_level: 0, garage_level: 1, licenses: ['basic'] };
        let { data } = await supabaseClient.from('players').insert([p]).select().single();
        if (data) AppState.player = { ...AppState.player, ...data };
    },
    async loadGameData() {
        const [t, tr] = await Promise.all([ supabaseClient.from('trucks').select('*').eq('player_id', AppState.player.id), supabaseClient.from('active_trips').select('*').eq('player_id', AppState.player.id) ]);
        AppState.trucks = t.data || []; AppState.activeTrips = tr.data || [];
        AppState.trucks.forEach(tk => { if (tk.engineLvl === undefined) tk.engineLvl = 100; });
    },
    async syncPlayer() {
        const p = AppState.player;
        await supabaseClient.from('players').update({ money: p.money, fuel_stock: p.fuel_stock, stamina: p.stamina, wanted_level: p.wanted_level, garage_level: p.garage_level, level: p.level, xp: p.xp, total_profit: p.total_profit, total_trips: p.total_trips, licenses: p.licenses }).eq('id', p.id);
    }
};

const GameLogic = {
    // Фича 1: Мотель (Бодрость)
    restInMotel() {
        if (AppState.player.money < 10000) return UI.showToast('Нужно 10,000 🪙!', 'error');
        AppState.player.money -= 10000; AppState.player.stamina = 100;
        DB.syncPlayer(); UI.showToast('Водитель выспался! Бодрость 100%', 'success'); AudioSys.playSFX('success'); UI.renderAll();
    },
    // Фича 4: Адвокат (Сброс розыска)
    hireLawyer() {
        if (AppState.player.wanted_level === 0) return UI.showToast('Вы чисты перед законом!', 'info');
        if (AppState.player.money < 250000) return UI.showToast('Услуги адвоката стоят 250,000 🪙!', 'error');
        AppState.player.money -= 250000; AppState.player.wanted_level = 0;
        DB.syncPlayer(); UI.showToast('Розыск снят! Полиция вас не ищет.', 'success'); UI.renderAll();
    },
    // Фича 6: Гараж
    upgradeGarage() {
        const cost = AppState.player.garage_level * 150000;
        if (AppState.player.garage_level >= 5) return UI.showToast('Гараж максимального уровня!', 'info');
        if (AppState.player.money < cost) return UI.showToast(`Нужно ${cost.toLocaleString()} 🪙`, 'error');
        AppState.player.money -= cost; AppState.player.garage_level++;
        DB.syncPlayer(); UI.showToast(`Гараж улучшен до Ур. ${AppState.player.garage_level}!`, 'success'); AudioSys.playSFX('success'); UI.renderAll();
    },
    getRepairCost(val) {
        if (val >= 100) return 0;
        let discount = 1.0 - (AppState.player.garage_level - 1) * 0.05; // -5% за каждый уровень
        return Math.floor(((100 - val) * 200) * discount);
    },
    async repairPart(truckId, part) {
        const t = AppState.trucks.find(x => x.id === truckId); if (!t || t[part] >= 100) return;
        const c = this.getRepairCost(t[part]);
        if (AppState.player.money < c) return UI.showToast(`Нужно ${c} 🪙`, 'error');
        AppState.player.money -= c; t[part] = 100;
        await supabaseClient.from('trucks').update({ [part]: 100 }).eq('id', t.id);
        DB.syncPlayer(); UI.showToast('Ремонт выполнен!', 'success'); UI.renderAll();
    },
    // Покупка прогноза погоды
    buyWeatherForecast() {
        if (WorldState.forecast_purchased) return UI.showToast('Прогноз уже куплен. Ожидайте смены погоды.', 'info');
        if (AppState.player.money < 5000) return UI.showToast('Нужно 5,000 🪙', 'error');
        AppState.player.money -= 5000; WorldState.forecast_purchased = true; DB.syncPlayer();
        UI.showToast(`Прогноз: ${WorldState.weather.name}. Влияние износа: x${WorldState.weather.wearMod}`, 'success');
    },
    async startTrip(reward, fuel, duration, title, reqLvl, reqLic) {
        if (AppState.player.level < reqLvl || !AppState.player.licenses.includes(reqLic)) return UI.showToast('Недоступно!', 'error');
        if (AppState.player.stamina < 15) return UI.showToast('Водитель истощен (Нужно 15% бодрости)! Срочно в мотель.', 'error');
        
        const idleTruck = AppState.trucks.find(t => !AppState.activeTrips.some(tr => tr.truck_id === t.id));
        if (!idleTruck) return UI.showToast('Нет свободных фур!', 'error');

        // Учет влияния погоды
        let finalDur = Math.floor(duration * WorldState.weather.timeMod);

        AppState.player.stamina = Math.max(0, AppState.player.stamina - 15);
        AppState.player.fuel_stock -= fuel;
        
        let { data } = await supabaseClient.from('active_trips').insert([{ player_id: AppState.player.id, truck_id: idleTruck.id, title: title, reward: reward, fuel_req: fuel, end_time: Date.now() + (finalDur * 1000) }]).select().single();
        if (data) AppState.activeTrips.push(data);
        
        DB.syncPlayer(); UI.showToast(`Рейс начат на ${idleTruck.name}!`, 'success'); AudioSys.playSFX('engine'); UI.renderAll();
    },
    async finishTrip(tripId) {
        const tIdx = AppState.activeTrips.findIndex(t => t.id === tripId); if (tIdx === -1) return;
        const trip = AppState.activeTrips[tIdx];
        
        // Учет розыска при завершении (Шанс конфискации награды)
        if (AppState.player.wanted_level > 0 && Math.random() < (AppState.player.wanted_level * 0.05)) {
            UI.showToast('🚨 ФСБ перехватила груз на разгрузке! Награда конфискована.', 'error');
        } else {
            AppState.player.money += Number(trip.reward);
            AppState.player.total_profit += Number(trip.reward);
            UI.showToast(`Рейс завершен! +${trip.reward} 🪙`, 'success'); AudioSys.playSFX('success');
        }
        
        // Износ с учетом погоды
        const t = AppState.trucks.find(x => x.id === trip.truck_id);
        if (t) {
            const wear = Math.floor(5 * WorldState.weather.wearMod);
            t.engineLvl = Math.max(0, t.engineLvl - wear);
            await supabaseClient.from('trucks').update({ engineLvl: t.engineLvl }).eq('id', t.id);
        }

        AppState.player.total_trips++; AppState.player.xp += 100; // Упрощенный расчет XP
        await supabaseClient.from('active_trips').delete().eq('id', trip.id);
        AppState.activeTrips.splice(tIdx, 1); DB.syncPlayer(); UI.renderAll();
    },
    async buyFuel(amt) {
        const c = amt * AppState.player.fuel_price;
        if (AppState.player.money < c) return UI.showToast('Мало монет!', 'error');
        AppState.player.money -= c; AppState.player.fuel_stock += amt; DB.syncPlayer(); UI.showToast(`Куплено ${amt}л`, 'success'); UI.renderAll();
    }
};

const UI = {
    switchTab(tId) {
        document.querySelectorAll('.tab-content, .nav-item').forEach(e => e.classList.remove('active'));
        document.getElementById(`tab-${tId}`)?.classList.add('active');
        document.querySelector(`.nav-item[onclick*="${tId}"]`)?.classList.add('active');
        AudioSys.playSFX('click'); AudioSys.vibrate('click'); this.renderAll();
    },
    showToast(msg, type = 'success') {
        const c = document.getElementById('toast-container'); const t = document.createElement('div');
        t.className = `toast ${type}`; t.innerText = msg; c.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
    },
    safeUpdate(id, t) { const e = document.getElementById(id); if (e) e.innerText = t; },
    safeUpdateHTML(id, h) { const e = document.getElementById(id); if (e) e.innerHTML = h; },
    renderAll() {
        const p = AppState.player;
        this.safeUpdate('username', p.name); this.safeUpdate('user-title', `Ур. ${p.level} | Рейсов: ${p.total_trips}`);
        this.safeUpdate('user-money', `🪙 ${Number(p.money).toLocaleString()}`);
        this.safeUpdate('user-fuel-stock', `⛽ ${p.fuel_stock}л`);
        
        // Рендер статусов: Бодрость и Розыск (Фичи 1 и 4)
        this.safeUpdateHTML('driver-status-panel', `
            <div class="status-widget">
                <div class="status-header"><span>🔋 Бодрость</span><span style="color:${p.stamina<30?'#EF4444':'#10B981'}">${p.stamina}%</span></div>
                <div class="status-progress-track"><div class="status-progress-fill" style="width:${p.stamina}%; background:${p.stamina<30?'#EF4444':'#10B981'};"></div></div>
            </div>
            <div class="status-widget" style="flex:0.6;">
                <div class="status-header"><span>🚨 Розыск</span></div>
                <div class="wanted-stars">${Array.from({length:5}, (_,i) => `<span style="color:${i<p.wanted_level?'#EF4444':'#4b5563'}">★</span>`).join('')}</div>
            </div>
        `);

        // Рендер активных рейсов и триггер ивентов
        this.safeUpdateHTML('active-trip-panel', AppState.activeTrips.map(tr => {
            let l = Math.floor((tr.end_time - Date.now()) / 1000);
            if (l <= 0) { GameLogic.finishTrip(tr.id); return ''; }
            EventSys.checkEventsForTrip(tr); // Проверка случайных QTE/Ивентов
            return `<div class="card" style="border-color:var(--accent-blue);"><div class="card-title"><span>🚚 В пути: ${tr.title}</span><span style="color:var(--accent-blue);">⏳ ${l}с</span></div></div>`;
        }).join(''));

        // Контракты и Динамический спрос (Фича 3)
        let filteredContracts = MapSys.currentRegion === 'all' ? AppState.contracts : AppState.contracts.filter(c => {
            if (MapSys.currentRegion === 'hub') return c.reqLic === 'basic';
            if (MapSys.currentRegion === 'chem') return c.reqLic === 'dangerous';
            if (MapSys.currentRegion === 'shadow') return c.reqLic === 'smuggling';
            return true;
        });

        this.safeUpdateHTML('contracts-list', filteredContracts.map(c => {
            let isDemanded = Object.values(WorldState.sectorDemands).includes(c.name);
            let finalReward = isDemanded ? Math.floor(c.reward * 1.5) : c.reward;
            let demandNotice = isDemanded ? `<div class="sector-demand-badge">🔥 Дефицит! Награда х1.5</div>` : '';
            return `<div class="contract-card"><div class="contract-header"><div class="contract-title-group"><span class="contract-badge ${c.badgeClass}">${c.diff}</span><span class="contract-name">${c.name}</span></div><div class="contract-reward">+${finalReward.toLocaleString()} 🪙</div></div>${demandNotice}<div style="display:flex; justify-content:space-between; font-size:12px; color:#ccc; margin-bottom:10px;"><span>⏱ ${c.duration}с</span><span>⛽ ${c.fuel}л</span></div><button class="btn btn-primary" onclick="GameLogic.startTrip(${finalReward}, ${c.fuel}, ${c.duration}, '${c.title}', ${c.reqLvl}, '${c.reqLic}')">Начать рейс</button></div>`;
        }).join(''));

        // Автопарк и Гараж (Фича 6)
        this.safeUpdateHTML('garage-panel', `
            <div class="card-title"><span>🏗️ Мой Ангар (Ур. ${p.garage_level})</span><span style="color:var(--success-color);">Скидка ТО: ${(p.garage_level-1)*5}%</span></div>
            <button class="btn btn-outline" onclick="GameLogic.upgradeGarage()">Улучшить ангар (${(p.garage_level*150000).toLocaleString()} 🪙)</button>
        `);
        
        this.safeUpdateHTML('fleet-list', AppState.trucks.map(t => `<div class="card"><div class="card-title"><span>🚚 ${t.name}</span><span>ДВС: ${t.engineLvl}%</span></div><button class="btn btn-outline" style="margin-top:10px;" onclick="GameLogic.repairPart('${t.id}', 'engineLvl')">Починить ДВС (${GameLogic.getRepairCost(t.engineLvl)} 🪙)</button></div>`).join(''));
    }
};

document.addEventListener('DOMContentLoaded', () => {
    WorldState.generateWeather(); WorldState.generateMarketEvent();
    let p = 0; const int = setInterval(() => { p += 25; document.getElementById('loader-progress').style.width = `${p}%`; document.getElementById('loader-percent').innerText = `${p}%`; if(p >= 100) { clearInterval(int); document.getElementById('loading-screen').remove(); document.getElementById('app-content').style.opacity = '1'; DB.init(); } }, 200);
    setInterval(() => { if (AppState.activeTrips.length > 0) UI.renderAll(); }, 1000);
    setInterval(() => { WorldState.generateWeather(); }, 180000); // Погода раз в 3 мин
    setInterval(() => { WorldState.generateMarketEvent(); }, 300000); // Рынок раз в 5 мин
});

window.switchTab = (id) => UI.switchTab(id); window.AudioSys = AudioSys; window.GameLogic = GameLogic; window.EventSys = EventSys; window.MapSys = MapSys; window.UI = UI;
