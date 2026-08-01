const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

const CONFIG = {
    SUPABASE_URL: 'https://aiqlcndsayerxjtcwqbj.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_zKJ28h0HfzaojbT9s1uwmw_eX7UQZz0',
    XP_MULTIPLIER: 0.15, DAILY_BONUS_COINS: 15000, DAILY_BONUS_FUEL: 200, BONUS_COOLDOWN_MS: 86400000, 
    CASE_COST: 10000000, DUPLICATE_COINS: 1000000, DUPLICATE_XP: 10000,
    FATIGUE_MAX: 100, FATIGUE_DRAIN_RATE: 0.15, MOTEL_COST: 5000, WEATHER_FORECAST_COST: 25000,
    GARAGE_UPGRADE_COSTS: [0, 250000, 1000000, 5000000]
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
    { id: 'basic', name: 'Базовая', type: 'legal', cost: 0, reqLvl: 1 },
    { id: 'dangerous', name: 'Опасные грузы', type: 'legal', cost: 50000, reqLvl: 5 },
    { id: 'oversized', name: 'Негабарит', type: 'legal', cost: 150000, reqLvl: 10 },
    { id: 'smuggling', name: 'Контрабанда', type: 'illegal', cost: 300000, reqLvl: 12 }
];

const BACKGROUNDS_SHOP = [
    { id: 'bg_r1', name: 'Неоновый асфальт', rarity: 'rare', chance: 8.0, image: 'https://i.ibb.co.com/9mwvmfZG/IMG-4513.jpg' },
    { id: 'bg_r2', name: 'Ночной траверз', rarity: 'rare', chance: 8.0, image: 'https://i.ibb.co.com/HLhsyRKk/IMG-4514.jpg' },
    { id: 'bg_l3', name: 'Транспортный бог', rarity: 'legendary', chance: 1.0, image: 'https://i.ibb.co.com/mV8CH1jr/IMG-4518.jpg' }
];

const DRIVERS_SHOP = [
    { id: 'rookie', name: 'Стажер', cost: 75000, incomePerHr: 15000, color: '#3B82F6' },
    { id: 'pro', name: 'Профи', cost: 250000, incomePerHr: 45000, color: '#F59E0B' },
    { id: 'ace', name: 'Ас логистики', cost: 1000000, incomePerHr: 150000, color: '#8B5CF6' }
];

const supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
const tgUser = tg.initDataUnsafe?.user;
const telegramId = tgUser?.id ? Number(tgUser.id) : 123456789;

const ServerTimeSys = {
    offset: 0,
    async init() {
        try {
            const res = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC');
            const data = await res.json();
            this.offset = new Date(data.utc_datetime).getTime() - Date.now();
        } catch (e) { this.offset = 0; }
    },
    now() { return Date.now() + this.offset; }
};

const WORLD_MAP = {
    currentCity: 'mow',
    cities: {
        'ber': { name: 'Берлин', x: '15%', y: '30%', fuelPrice: 22, icon: '🏛️' },
        'mow': { name: 'Москва', x: '35%', y: '40%', fuelPrice: 12, icon: '🏙️' },
        'kst': { name: 'Костанай', x: '55%', y: '45%', fuelPrice: 8, icon: '🏭' },
        'pek': { name: 'Пекин', x: '85%', y: '65%', fuelPrice: 16, icon: '🏯' }
    },
    routes: [
        { id: 'r1', from: 'ber', to: 'mow', dist: 1800, type: 'autobahn', wearMod: 0.5, speedMod: 1.5, name: 'Европейский транзит' },
        { id: 'r2', from: 'mow', to: 'kst', dist: 2100, type: 'highway', wearMod: 1.0, speedMod: 1.0, name: 'Степной тракт' },
        { id: 'r3', from: 'kst', to: 'pek', dist: 4600, type: 'dirt', wearMod: 2.5, speedMod: 0.7, name: 'Шелковый путь' }
    ],
    cargoTypes: [
        { name: 'Электроника', lic: 'basic', baseRew: 8, icon: '💻' },
        { name: 'Стройматериалы', lic: 'basic', baseRew: 5, icon: '🧱' },
        { name: 'Химикаты', lic: 'dangerous', baseRew: 18, icon: '☣️' },
        { name: 'Турбины', lic: 'oversized', baseRew: 25, icon: '🏗️' },
        { name: 'Теневой груз', lic: 'smuggling', baseRew: 40, icon: '🥷' }
    ]
};

const MapSys = {
    selectCity(cityId) {
        WORLD_MAP.currentCity = cityId; AudioSys.playSFX('click'); AudioSys.playVibrate('click');
        AppState.player.fuel_price = WORLD_MAP.cities[cityId].fuelPrice;
        this.renderMapUI(); UI.renderAll();
    },
    generateDynamicContracts() {
        const contracts = []; const currentId = WORLD_MAP.currentCity;
        WORLD_MAP.routes.forEach(route => {
            if (route.from === currentId || route.to === currentId) {
                const targetId = route.from === currentId ? route.to : route.from;
                const targetCity = WORLD_MAP.cities[targetId];
                for(let i=0; i<3; i++) {
                    const cargo = WORLD_MAP.cargoTypes[Math.floor(Math.random() * WORLD_MAP.cargoTypes.length)];
                    const reward = Math.floor(route.dist * cargo.baseRew * (1 + Math.random() * 0.2));
                    const baseFuelReq = Math.floor(route.dist * 0.15); 
                    const durationSec = Math.floor((route.dist / 10) / route.speedMod); 
                    contracts.push({ id: `dyn_${targetId}_${i}`, title: `В ${targetCity.name} (${route.name})`, name: cargo.name, targetCity: targetId, diff: route.type === 'dirt' ? 'Сложно' : 'Норма', badgeClass: cargo.lic === 'smuggling' ? 'badge-illegal' : 'badge-ordinary', reward: reward, baseFuel: baseFuelReq, duration: durationSec, reqLvl: cargo.lic === 'smuggling' ? 12 : 1, reqLic: cargo.lic, routeId: route.id, icon: cargo.icon });
                }
            }
        });
        return contracts;
    },
    renderMapUI() {
        const mapContainer = document.querySelector('.interactive-map'); if(!mapContainer) return;
        let svgHTML = `<svg style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;">`;
        WORLD_MAP.routes.forEach(r => { const c1 = WORLD_MAP.cities[r.from]; const c2 = WORLD_MAP.cities[r.to]; const strokeColor = r.type === 'autobahn' ? '#3B82F6' : r.type === 'dirt' ? '#F59E0B' : '#8B5CF6'; const dash = r.type === 'dirt' ? 'stroke-dasharray="5,5"' : ''; svgHTML += `<line x1="${c1.x}" y1="${c1.y}" x2="${c2.x}" y2="${c2.y}" stroke="${strokeColor}" stroke-width="3" opacity="0.6" ${dash} />`; });
        svgHTML += `</svg>`;
        let nodesHTML = '';
        for(let key in WORLD_MAP.cities) { let c = WORLD_MAP.cities[key]; let isCurrent = (WORLD_MAP.currentCity === key); nodesHTML += `<div class="map-node ${isCurrent ? 'active-node' : ''}" style="position:absolute; top:${c.y}; left:${c.x}; z-index:2; transform:translate(-50%, -50%);" onclick="MapSys.selectCity('${key}')"><div class="node-pulse ${isCurrent ? 'pulse-epic' : ''}"></div><div class="node-icon" style="font-size:24px;">${c.icon}</div><div class="node-label" style="background:rgba(0,0,0,0.8); padding:2px 6px; border-radius:4px;">${c.name}</div></div>`; }
        mapContainer.innerHTML = svgHTML + nodesHTML;
        const cityData = WORLD_MAP.cities[WORLD_MAP.currentCity]; UI.safeUpdate('selected-region-title', `📍 ${cityData.name} | Топливо: ${cityData.fuelPrice} 🪙/л`);
    }
};

const AudioSys = {
    musicOn: false, sfxOn: true, bgm: document.getElementById('bg-music'),
    sfxElements: { click: document.getElementById('sfx-click'), success: document.getElementById('sfx-success'), error: document.getElementById('sfx-error'), engine: document.getElementById('sfx-engine') },
    toggleMusic() { this.musicOn = !this.musicOn; const btn = document.getElementById('btn-music'); if (this.musicOn) { if (this.bgm) { this.bgm.volume = 0.3; this.bgm.play().then(() => { if (btn) btn.innerText = "Включено 🔊"; }).catch(() => { this.musicOn = false; if (btn) btn.innerText = "Выключено 🔇"; }); } } else { if (this.bgm) this.bgm.pause(); if (btn) btn.innerText = "Выключено 🔇"; } this.playVibrate('click'); this.playSFX('click'); },
    toggleSFX() { this.sfxOn = !this.sfxOn; const btn = document.getElementById('btn-sfx'); if (btn) btn.innerText = this.sfxOn ? "Включено 🔊" : "Выключено 🔇"; this.playVibrate('click'); this.playSFX('click'); },
    playSFX(type) { if (!this.sfxOn) return; const sound = this.sfxElements[type]; if (sound) { sound.currentTime = 0; sound.volume = 0.6; sound.play().catch(() => {}); } },
    playVibrate(type = 'success') { if (!this.sfxOn || !tg.HapticFeedback) return; if(type === 'success') tg.HapticFeedback.notificationOccurred('success'); if(type === 'error') tg.HapticFeedback.notificationOccurred('error'); if(type === 'click' || type === 'info') tg.HapticFeedback.impactOccurred('medium'); }
};

const AppState = {
    leaderboardCategory: 'profit', 
    player: { id: null, name: tgUser?.first_name || 'Логист', avatar: tgUser?.photo_url || '', money: 100000, fuel_stock: 400, fuel_price: 12, level: 1, xp: 0, total_profit: 0, total_trips: 0, syndicate: null, last_bonus_time: 0, licenses: ['basic'], pass_level: 1, pass_claimed: [], current_background: 'bg_r1', unlocked_backgrounds: ['bg_r1'], fatigue: 100, wanted_level: 0, garage_level: 1, skills: { eco: 0, luck: 0, mechanic: 0 }, total_fuel_burned: 0, playtime_minutes: 0, hired_drivers: [], last_passive_collect: 0 },
    syndicateData: { name: null, level: 1, treasuryFuel: 0, techs: { security: 0, logistics: 0, mechanic: 0 }, feed: [] },
    worldExtra: { lockedCategories: [], sectorDemand: {} },
    trucks: [], activeTrips: [], leaderboard: []
};

const DB = {
    async init() {
        try {
            await ServerTimeSys.init();
            let { data: existingPlayer, error: searchError } = await supabaseClient.from('players').select('*').eq('telegram_id', telegramId).maybeSingle();
            if (searchError) throw searchError;
            if (!existingPlayer) await this.createNewPlayer();
            else { 
                AppState.player = { ...AppState.player, ...existingPlayer }; 
                if(!AppState.player.hired_drivers) AppState.player.hired_drivers = [];
                if(!AppState.player.last_passive_collect) AppState.player.last_passive_collect = ServerTimeSys.now();
            }
            await this.loadGameData(); await this.loadLeaderboard(); 
            MapSys.renderMapUI();
            OfflineProgressSys.process();
            UI.renderAll();
        } catch (err) { UI.showToast("Ошибка соединения: " + err.message, "error"); }
    },
    async createNewPlayer() {
        let pay = { telegram_id: telegramId, name: AppState.player.name, avatar: AppState.player.avatar, money: 100000, fuel_stock: 400, level: 1, xp: 0, total_trips: 0, licenses: ['basic'], pass_level: 1, pass_claimed: [], current_background: 'bg_r1', unlocked_backgrounds: ['bg_r1'], fatigue: 100, wanted_level: 0, garage_level: 1, skills: { eco: 0, luck: 0, mechanic: 0 }, total_profit: 0, total_fuel_burned: 0, playtime_minutes: 0, hired_drivers: [], last_passive_collect: ServerTimeSys.now() };
        let { data: newP, error } = await supabaseClient.from('players').insert([pay]).select().single();
        if (!error && newP) AppState.player = { ...AppState.player, ...newP };
    },
    async loadGameData() {
        try {
            const [tRes, trRes] = await Promise.all([supabaseClient.from('trucks').select('*').eq('player_id', AppState.player.id), supabaseClient.from('active_trips').select('*').eq('player_id', AppState.player.id)]);
            AppState.trucks = tRes.data || []; AppState.activeTrips = trRes.data || [];
        } catch (e) {}
    },
    async loadLeaderboard() {
        try { const sf = AppState.leaderboardCategory === 'trips' ? 'total_trips' : 'total_profit'; const { data, error } = await supabaseClient.from('players').select('id, name, avatar, total_profit, total_trips, level, syndicate, current_background').order(sf, { ascending: false }).limit(50); if (!error && data) AppState.leaderboard = data; } catch (e) {}
    },
    async syncPlayer() {
        const p = AppState.player; if (!p.id) return;
        let uD = { name: p.name, avatar: p.avatar, money: Number(p.money), fuel_stock: Number(p.fuel_stock), fuel_price: Number(p.fuel_price), level: Number(p.level), xp: Number(p.xp), total_profit: Number(p.total_profit), total_trips: Number(p.total_trips), fatigue: Number(p.fatigue), wanted_level: Number(p.wanted_level), garage_level: Number(p.garage_level), licenses: p.licenses, current_background: p.current_background, unlocked_backgrounds: p.unlocked_backgrounds, pass_level: p.pass_level, pass_claimed: p.pass_claimed, skills: p.skills, total_fuel_burned: Number(p.total_fuel_burned), playtime_minutes: Number(p.playtime_minutes), hired_drivers: p.hired_drivers, last_passive_collect: p.last_passive_collect, syndicate: p.syndicate === 'null' ? null : p.syndicate };
        await supabaseClient.from('players').update(uD).eq('id', p.id);
        this.loadLeaderboard();
    }
};

const DriverSys = {
    async hireDriver(truckId, driverId) {
        const d = DRIVERS_SHOP.find(x => x.id === driverId); if (!d) return;
        if (AppState.player.money < d.cost) return UI.showToast(`Нужно ${d.cost.toLocaleString()} 🪙`, 'error');
        if (AppState.player.hired_drivers.some(x => x.truck_id === truckId)) return UI.showToast('Для этой фуры уже нанят водитель!', 'error');

        await this.collectPassive(ServerTimeSys.now());
        AppState.player.money -= d.cost;
        AppState.player.hired_drivers.push({ truck_id: truckId, driver_id: driverId });
        await DB.syncPlayer();
        UI.showToast(`Водитель "${d.name}" успешно нанят!`, 'success'); AudioSys.playSFX('success');
        UI.renderAll();
    },
    async fireDriver(truckId) {
        if(!AppState.player.hired_drivers) return;
        await this.collectPassive(ServerTimeSys.now());
        AppState.player.hired_drivers = AppState.player.hired_drivers.filter(x => x.truck_id !== truckId);
        await DB.syncPlayer();
        UI.showToast('Водитель уволен.', 'info');
        UI.renderAll();
    },
    calculatePassiveIncome(now) {
        if(!AppState.player.hired_drivers || AppState.player.hired_drivers.length === 0) return 0;
        let last = AppState.player.last_passive_collect || now;
        let hrs = (now - last) / 3600000;
        if (hrs < 0) hrs = 0;
        let income = 0;
        AppState.player.hired_drivers.forEach(hd => {
            const d = DRIVERS_SHOP.find(x => x.id === hd.driver_id);
            if(d) income += d.incomePerHr * hrs;
        });
        return Math.floor(income);
    },
    async collectPassive(now) {
        let inc = this.calculatePassiveIncome(now);
        if (inc > 0) {
            AppState.player.money += inc;
            AppState.player.total_profit += inc;
            AppState.player.last_passive_collect = now;
        }
        return inc;
    }
};

const OfflineProgressSys = {
    async process() {
        const now = ServerTimeSys.now();
        let offlineEarnings = 0; let offlineTripsCompleted = 0; const tripsToDelete = [];

        let passiveIncome = await DriverSys.collectPassive(now);
        offlineEarnings += passiveIncome;

        for (let i = AppState.activeTrips.length - 1; i >= 0; i--) {
            const trip = AppState.activeTrips[i];
            if (trip.end_time <= now) {
                let p = Number(trip.reward); let exp = Math.floor(p * CONFIG.XP_MULTIPLIER);
                offlineEarnings += p; offlineTripsCompleted += 1;
                AppState.player.money += p; AppState.player.total_profit += p; AppState.player.total_trips += 1; AppState.player.total_fuel_burned += trip.fuel_req;
                GameLogic.addXP_silent(exp); 
                
                const t = AppState.trucks.find(x => x.id === trip.truck_id);
                if (t) {
                    const rData = WORLD_MAP.routes.find(r => r.id === trip.route_id) || { wearMod: 1.0 };
                    const w = Math.floor(8 * rData.wearMod); 
                    t.engineLvl = Math.max(0, t.engineLvl - w); t.tiresLvl = Math.max(0, t.tiresLvl - Math.floor(w * 1.2));
                    t.gearLvl = Math.max(0, t.gearLvl - w); t.brakesLvl = Math.max(0, t.brakesLvl - Math.floor(w * 1.3));
                    await supabaseClient.from('trucks').update({ engineLvl: t.engineLvl, tiresLvl: t.tiresLvl, gearLvl: t.gearLvl, brakesLvl: t.brakesLvl }).eq('id', t.id);
                }
                tripsToDelete.push(trip.id); AppState.activeTrips.splice(i, 1);
            }
        }
        if (tripsToDelete.length > 0 || passiveIncome > 0) {
            for (let id of tripsToDelete) await supabaseClient.from('active_trips').delete().eq('id', id);
            await DB.syncPlayer(); this.showOfflineModal(offlineTripsCompleted, offlineEarnings, passiveIncome);
        }
    },
    showOfflineModal(tripsCount, earnings, passive) {
        let ex = document.getElementById('offline-modal'); if (ex) ex.remove();
        const m = `<div id="offline-modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:10000;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(10px);"><div class="card" style="width:100%;max-width:360px;border-color:var(--success-color);text-align:center;box-shadow:0 0 40px rgba(16, 185, 129, 0.4);"><div style="font-size:40px;margin-bottom:10px;">📈</div><h3 style="color:#fff;font-size:20px;margin-bottom:8px;font-weight:900;">ОТЧЕТ КОРПОРАЦИИ</h3><p style="font-size:13px;color:var(--hint-color);margin-bottom:20px;">Пока вы отсутствовали, корпорация продолжала работать.</p><div style="background:rgba(0,0,0,0.3);padding:15px;border-radius:12px;margin-bottom:20px;"><div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:var(--hint-color);">Ручных рейсов:</span><span style="color:#fff;font-weight:bold;">${tripsCount}</span></div><div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:var(--hint-color);">Доход автопилота:</span><span style="color:var(--accent-blue);font-weight:bold;">+${passive.toLocaleString()} 🪙</span></div><hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:10px 0;"><div style="display:flex;justify-content:space-between;"><span style="color:var(--hint-color);">Итого прибыль:</span><span style="color:var(--success-color);font-weight:bold;font-size:16px;">+${earnings.toLocaleString()} 🪙</span></div></div><button class="btn btn-primary" style="width:100%;" onclick="document.getElementById('offline-modal').remove(); AudioSys.playSFX('success');">Забрать выручку</button></div></div>`;
        document.body.insertAdjacentHTML('beforeend', m); AudioSys.playVibrate('success');
    }
};

const GameLogic = {
    isFinishing: false,
    getReqXP(lvl) { return Math.floor(1000 * Math.pow(1.5, lvl - 1)); },
    
    async addXP(amount) {
        AppState.player.xp += Number(amount); let req = this.getReqXP(AppState.player.level), lu = false;
        while (AppState.player.xp >= req) { AppState.player.xp -= req; AppState.player.level++; AppState.player.pass_level++; req = this.getReqXP(AppState.player.level); lu = true; }
        if (lu) UI.showToast(`🎉 НОВЫЙ УРОВЕНЬ: ${AppState.player.level}!`, 'success');
    },

    addXP_silent(amount) {
        AppState.player.xp += Number(amount); let req = this.getReqXP(AppState.player.level);
        while (AppState.player.xp >= req) { AppState.player.xp -= req; AppState.player.level++; AppState.player.pass_level++; req = this.getReqXP(AppState.player.level); }
    },
    
    async buyTruck(shopId) {
        const t = TRUCK_SHOP.find(x => x.id === shopId); if (!t) return;
        if (AppState.player.money < t.price) return UI.showToast(`Нужно ${t.price.toLocaleString()} 🪙`, 'error');
        AppState.player.money -= t.price;
        let { data, error } = await supabaseClient.from('trucks').insert([{ player_id: AppState.player.id, name: t.name, capacity: t.capacity, fuel_use: t.fuel_use, rarity: t.rarity, custom_plate: '456LWO|10', engineLvl: 100, tiresLvl: 100, gearLvl: 100, brakesLvl: 100 }]).select().single();
        if (error) return;
        AppState.trucks.push(data); await DB.syncPlayer(); UI.showToast(`Куплен новый транспорт: ${t.name}!`, 'success'); UI.renderAll();
    },

    getRepairCost(val) { 
        if (val >= 100) return 0; 
        let base = (100 - val) * 200;
        let gLvl = AppState.player.garage_level || 1;
        return Math.floor(base * (1 - ((gLvl - 1) * 0.15)));
    },

    async repairAll(truckId) {
        const t = AppState.trucks.find(x => String(x.id) === String(truckId)); if (!t) return;
        const pts = ['engineLvl', 'tiresLvl', 'gearLvl', 'brakesLvl']; let tc = 0, nr = false;
        pts.forEach(p => { const v = Number(t[p]) || 0; if (v < 100) { nr = true; tc += this.getRepairCost(v); } });
        if (!nr) return UI.showToast('Полностью исправен!', 'info');
        
        let gLvl = AppState.player.garage_level || 1;
        const fc = Math.floor(tc * (0.9 - (gLvl - 1) * 0.05));
        if (AppState.player.money < fc) return UI.showToast(`Нужно ${fc.toLocaleString()} 🪙`, 'error');
        
        AppState.player.money -= fc; pts.forEach(p => t[p] = 100);
        await supabaseClient.from('trucks').update({ engineLvl: 100, tiresLvl: 100, gearLvl: 100, brakesLvl: 100 }).eq('id', t.id);
        await DB.syncPlayer(); UI.showToast(`Комплексное ТО выполнено!`, 'success'); UI.renderAll();
    },
    
    async startTrip(reward, baseFuel, duration, title, reqLvl, reqLic, targetCity, routeId) {
        if (AppState.player.level < reqLvl) return UI.showToast(`Требуется уровень ${reqLvl}!`, 'error');
        if (!AppState.player.licenses.includes(reqLic)) return UI.showToast('Отсутствует лицензия!', 'error');

        const actIds = AppState.activeTrips.map(t => t.truck_id);
        const autopilotIds = AppState.player.hired_drivers.map(d => d.truck_id);
        const idleTrucks = AppState.trucks.filter(t => !actIds.includes(t.id) && !autopilotIds.includes(t.id));
        if (idleTrucks.length === 0) return UI.showToast('Нет свободных тягачей (без водителей)!', 'error');
        
        const idleTruck = idleTrucks[0];
        const shopTruckData = TRUCK_SHOP.find(x => x.name === idleTruck.name);

        let timeMod = 1.0; if (AppState.player.fatigue < 20) timeMod *= 1.3;
        let fuelMod = (shopTruckData ? shopTruckData.fuel_use : 50) / 30; 
        let fFuel = Math.floor(baseFuel * fuelMod);
        let fDur = Math.floor(duration * timeMod);

        if (AppState.player.fuel_stock < fFuel) return UI.showToast(`Нужно ${fFuel}л топлива!`, 'error');
        let endTime = ServerTimeSys.now() + (fDur * 1000);

        let { data, error } = await supabaseClient.from('active_trips').insert([{ player_id: AppState.player.id, truck_id: idleTruck.id, title: title, reward: reward, fuel_req: fFuel, end_time: endTime, route_id: routeId }]).select().single();
        if (error) return UI.showToast("Ошибка запуска рейса", "error");

        AppState.player.fuel_stock -= fFuel; AppState.activeTrips.push(data); await DB.syncPlayer();
        UI.showToast(`Рейс начат на ${idleTruck.name}!`, 'success'); AudioSys.playSFX('engine'); UI.renderAll();
    },
    
    async finishTrip(tripId) {
        if (this.isFinishing) return;
        const tIdx = AppState.activeTrips.findIndex(t => t.id === tripId); if (tIdx === -1) return;
        
        const trip = AppState.activeTrips[tIdx];
        if (trip.end_time > ServerTimeSys.now()) return; 

        this.isFinishing = true;
        let p = Number(trip.reward); let exp = Math.floor(p * CONFIG.XP_MULTIPLIER);
        
        AppState.player.total_fuel_burned = (AppState.player.total_fuel_burned || 0) + trip.fuel_req;
        AppState.player.money += p; AppState.player.total_profit += p; AppState.player.total_trips += 1;

        const t = AppState.trucks.find(x => x.id === trip.truck_id);
        if (t) {
            const rData = WORLD_MAP.routes.find(r => r.id === trip.route_id) || { wearMod: 1.0 };
            const w = Math.floor(8 * rData.wearMod); 
            t.engineLvl = Math.max(0, t.engineLvl - w); t.tiresLvl = Math.max(0, t.tiresLvl - Math.floor(w * 1.2));
            t.gearLvl = Math.max(0, t.gearLvl - w); t.brakesLvl = Math.max(0, t.brakesLvl - Math.floor(w * 1.3));
            await supabaseClient.from('trucks').update({ engineLvl: t.engineLvl, tiresLvl: t.tiresLvl, gearLvl: t.gearLvl, brakesLvl: t.brakesLvl }).eq('id', t.id);
        }

        await this.addXP(exp); 
        await supabaseClient.from('active_trips').delete().eq('id', trip.id);
        AppState.activeTrips.splice(tIdx, 1); 
        this.isFinishing = false; await DB.syncPlayer();

        UI.showToast(`Рейс завершен! +${p.toLocaleString()} 🪙`, 'success'); UI.renderAll();
    },

    async buyFuel(amt) {
        const c = Number(amt) * AppState.player.fuel_price;
        if (AppState.player.money < c) return UI.showToast('Недостаточно монет!', 'error');
        AppState.player.money -= c; AppState.player.fuel_stock += Number(amt);
        await DB.syncPlayer(); UI.showToast(`Куплено ${amt}л топлива`, 'success'); UI.renderAll();
    },

    async createSyndicate(nameInput) {
        let name = nameInput.trim();
        if(name.length < 3) return UI.showToast('Название от 3 символов', 'error');
        if(AppState.player.money < 500000) return UI.showToast('Нужно 500,000 🪙 для создания', 'error');
        AppState.player.money -= 500000;
        AppState.player.syndicate = name;
        AppState.syndicateData.name = name;
        await DB.syncPlayer();
        UI.showToast(`Синдикат "${name}" успешно создан!`, 'success');
        UI.renderAll();
    },

    async joinSyndicate(nameInput) {
        let name = nameInput.trim();
        if(!name) return UI.showToast('Введите название синдиката', 'error');
        AppState.player.syndicate = name;
        AppState.syndicateData.name = name;
        await DB.syncPlayer();
        UI.showToast(`Вы присоединились к "${name}"!`, 'success');
        UI.renderAll();
    },

    async leaveSyndicate() {
        if(!confirm('Покинуть синдикат?')) return;
        AppState.player.syndicate = null;
        AppState.syndicateData.name = null;
        await DB.syncPlayer();
        UI.showToast('Вы покинули синдикат.', 'info');
        UI.renderAll();
    },

    async upgradeSyndicateTech(techKey) {
        const cost = 1500; // литры топлива в казну синдиката
        if(AppState.player.fuel_stock < cost) return UI.showToast(`Нужно ${cost}л топлива на улучшение`, 'error');
        AppState.player.fuel_stock -= cost;
        if(!AppState.syndicateData.techs[techKey]) AppState.syndicateData.techs[techKey] = 0;
        AppState.syndicateData.techs[techKey]++;
        await DB.syncPlayer();
        UI.showToast('Технология синдикатов улучшена!', 'success');
        UI.renderAll();
    }
};

const UI = {
    switchTab(tId) {
        document.querySelectorAll('.tab-content').forEach(e => e.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
        const t = document.getElementById(`tab-${tId}`); if (t) t.classList.add('active');
        document.querySelectorAll('.nav-item').forEach(b => { if(b.getAttribute('onclick')?.includes(tId)) b.classList.add('active'); });
        AudioSys.playVibrate('click'); AudioSys.playSFX('click'); this.renderAll();
    },
    switchLeaderboardCategory(cat) {
        AppState.leaderboardCategory = cat;
        document.getElementById('lb-tab-profit').classList.toggle('active', cat === 'profit');
        document.getElementById('lb-tab-trips').classList.toggle('active', cat === 'trips');
        DB.loadLeaderboard().then(() => this.renderAll());
    },
    inspectPlayer(uId) {
        const u = AppState.leaderboard.find(x => String(x.id) === String(uId)); if (!u) return;
        let ex = document.getElementById('inspect-modal'); if (ex) ex.remove();
        const bO = BACKGROUNDS_SHOP.find(b => b.id === u.current_background) || BACKGROUNDS_SHOP[0];
        const m = `<div id="inspect-modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(8px);" onclick="this.remove()"><div class="card" style="width:100%;max-width:360px;border-color:var(--accent-purple);text-align:center;position:relative;overflow:hidden;background-image:url('${bO.image}');background-size:cover;background-position:center;" onclick="event.stopPropagation()"><div style="position:absolute;inset:0;background:rgba(12,12,20,0.85);z-index:1;"></div><div style="position:relative;z-index:2;"><div style="width:70px;height:70px;margin:0 auto 10px auto;border-radius:50%;padding:2px;background:var(--gradient-primary);"><img src="${u.avatar || 'https://via.placeholder.com/80'}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;"></div><h3 style="color:#fff;font-size:18px;">${u.name}</h3><div style="font-size:12px;color:var(--accent-pink);font-weight:bold;margin-top:2px;">Уровень ${u.level || 1}</div><div style="font-size:11px;color:var(--hint-color);margin-top:4px;">Синдикат: ${u.syndicate || 'Частник'}</div><button type="button" class="btn btn-outline" style="margin-top:12px;font-size:12px;" onclick="document.getElementById('inspect-modal').remove()">Закрыть</button></div></div></div>`;
        document.body.insertAdjacentHTML('beforeend', m);
    },
    showToast(msg, type = 'success') {
        const c = document.getElementById('toast-container'); if (!c) return;
        const t = document.createElement('div'); t.className = `toast ${type}`; t.innerText = msg; c.appendChild(t);
        AudioSys.playVibrate(type); if(type === 'success') AudioSys.playSFX('success'); if(type === 'error') AudioSys.playSFX('error');
        setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
    },
    safeUpdate(id, t) { const e = document.getElementById(id); if (e) e.innerText = t; },
    safeUpdateHTML(id, h) { const e = document.getElementById(id); if (e) e.innerHTML = h; },
    
    renderAll() {
        const p = AppState.player;
        
        const headerAvatar = document.getElementById('user-avatar'); if (headerAvatar && p.avatar) headerAvatar.src = p.avatar;
        const profileAvatar = document.getElementById('profile-id-avatar'); if (profileAvatar && p.avatar) profileAvatar.src = p.avatar;

        this.safeUpdate('profile-id-name', p.name); this.safeUpdate('profile-id-lvl', `LVL ${p.level}`);
        this.safeUpdate('user-money', `🪙 ${Number(p.money).toLocaleString()}`); this.safeUpdate('user-fuel-stock', `⛽ ${Number(p.fuel_stock)}л`); 
        this.safeUpdate('current-fuel-price', `${p.fuel_price || 12} 🪙 / л`);
        this.safeUpdate('stat-total-profit', `${Number(p.total_profit || 0).toLocaleString()} 🪙`);
        this.safeUpdate('stat-total-trips', `${p.total_trips || 0}`);
        
        // Синдикаты вкладка
        const noSyn = document.getElementById('no-syndicate-panel');
        const actSyn = document.getElementById('active-syndicate-panel');
        if (p.syndicate && p.syndicate !== 'null') {
            if (noSyn) noSyn.style.display = 'none';
            if (actSyn) actSyn.style.display = 'block';
            this.safeUpdate('corp-name-title', p.syndicate);
        } else {
            if (noSyn) noSyn.style.display = 'block';
            if (actSyn) actSyn.style.display = 'none';
        }

        // Рендер лидерборда
        const l = AppState.leaderboard || [], isT = AppState.leaderboardCategory === 'trips', c = ['👑', '🥈', '🥉']; let pH = '';
        l.slice(0, 3).forEach((u, i) => {
            const v = isT ? `${u.total_trips || 0} рейсов` : `${Number(u.total_profit || 0).toLocaleString()} 🪙`;
            const bG = BACKGROUNDS_SHOP.find(b => b.id === u.current_background) || BACKGROUNDS_SHOP[0];
            pH += `<div class="podium-card rank-${i+1}" onclick="UI.inspectPlayer('${u.id}')" style="cursor:pointer;background-image:url('${bG.image}');background-size:cover;background-position:center;"><div style="position:absolute;inset:0;background:rgba(22,22,32,0.82);z-index:1;border-radius:14px;"></div><div style="position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;width:100%;"><span class="podium-crown">${c[i]}</span><img src="${u.avatar || 'https://via.placeholder.com/80'}" class="podium-avatar" /><span class="podium-name">${u.name}</span><span style="font-size:10px;color:var(--hint-color);">Ур. ${u.level || 1}</span><span class="podium-val">${v}</span></div></div>`;
        });
        this.safeUpdateHTML('leaderboard-podium', pH);
        this.safeUpdateHTML('leaderboard-list', l.slice(3).map((u, i) => `<div class="card" style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;cursor:pointer;margin-bottom:6px;" onclick="UI.inspectPlayer('${u.id}')"><div style="display:flex;align-items:center;gap:10px;"><div style="display:flex;flex-direction:column;align-items:center;width:22px;"><span style="font-weight:800;font-size:13px;color:var(--hint-color);">#${i+4}</span></div><img src="${u.avatar || 'https://via.placeholder.com/40'}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" /><div><div style="font-weight:600;font-size:14px;color:#fff;">${u.name}</div><div style="font-size:11px;color:var(--hint-color);">Ур: ${u.level || 1}</div></div></div><div style="font-weight:bold;color:var(--accent-pink);font-size:13px;">${isT ? `${u.total_trips || 0} рейсов` : `${Number(u.total_profit || 0).toLocaleString()} 🪙`}</div></div>`).join(''));
        let mI = l.findIndex(u => String(u.id) === String(p.id)); this.safeUpdate('my-rank-num', mI !== -1 ? `#${mI + 1}` : '#--'); this.safeUpdate('my-rank-val', isT ? `${p.total_trips || 0} рейсов` : `${Number(p.total_profit || 0).toLocaleString()} 🪙`);

        // Рендер фонов в профиле
        this.safeUpdateHTML('backgrounds-inventory-list', BACKGROUNDS_SHOP.map(bg => {
            const u = (p.unlocked_backgrounds || ['bg_r1']).includes(bg.id), s = p.current_background === bg.id;
            return `<div class="card" style="display:flex;align-items:center;justify-content:space-between;padding:10px;opacity:${u?'1':'0.5'};margin-bottom:8px;"><div style="display:flex;align-items:center;gap:10px;"><img src="${bg.image}" style="width:50px;height:35px;border-radius:6px;object-fit:cover;"><div><div style="font-size:12px;font-weight:bold;">${bg.name}</div><div style="font-size:10px;color:var(--accent-pink);text-transform:uppercase;">${bg.rarity}</div></div></div><button class="btn ${s?'btn-outline':'btn-primary'}" style="font-size:11px;padding:6px 10px;width:auto;" ${!u||s?'disabled':''} onclick="BackgroundCaseSys.setBackground('${bg.id}')">${s?'Активен':(u?'Установить':'Закрыто')}</button></div>`;
        }).join(''));

        const aTI = AppState.activeTrips.map(t => t.truck_id);
        const autopilotIds = p.hired_drivers.map(d => d.truck_id);
        
        this.safeUpdateHTML('active-trip-panel', AppState.activeTrips.map(tr => { 
            let l = Math.floor((tr.end_time - ServerTimeSys.now()) / 1000); 
            if (l <= 0) { GameLogic.finishTrip(tr.id); return ''; } 
            return `<div class="card" style="margin-bottom:12px;border-color:var(--accent-blue);"><div class="card-title"><span>🚚 Рейс в пути</span><span style="color:var(--accent-blue);">⏳ ${l} сек</span></div><p style="font-size:12px;color:var(--hint-color);">${tr.title}</p></div>`; 
        }).join(''));
        
        const hI = AppState.trucks.some(t => !aTI.includes(t.id) && !autopilotIds.includes(t.id));
        const dynamicContracts = MapSys.generateDynamicContracts();
        
        this.safeUpdateHTML('contracts-list', dynamicContracts.map(c => {
            const lL = p.level < c.reqLvl, lLic = !p.licenses.includes(c.reqLic), iL = lL || lLic;
            let bt = lL ? `Ур. ${c.reqLvl}` : lLic ? 'Лицензия' : !hI ? 'Нет фур' : 'Начать рейс';
            return `<div class="contract-card" style="${iL ? 'opacity:0.6' : ''}"><div class="contract-header"><div class="contract-title-group"><span class="contract-badge ${c.badgeClass}">${c.diff}</span><span class="contract-name">${c.icon} ${c.name}</span></div><div class="contract-reward">+${c.reward.toLocaleString()} 🪙</div></div><div class="contract-body" style="padding-top:10px;"><div style="font-size:12px; color:var(--hint-color); margin-bottom:8px;">Маршрут: <span style="color:#fff;font-weight:bold;">${c.title}</span></div><div class="contract-specs"><div class="spec-item"><span>⏱ Время:</span><span style="color:#fff;font-weight:bold;">${c.duration}с</span></div><div class="spec-item"><span>⛽ Б. Топл:</span><span style="color:#fff;font-weight:bold;">${c.baseFuel}л</span></div></div></div><button class="contract-action-btn ${!hI || iL ? 'disabled' : 'active'}" ${!hI || iL ? 'disabled' : ''} onclick="GameLogic.startTrip(${c.reward}, ${c.baseFuel}, ${c.duration}, '${c.title}', ${c.reqLvl}, '${c.reqLic}', '${c.targetCity}', '${c.routeId}')">${bt}</button></div>`;
        }).join(''));

        // Автопарк с физикой и водителями
        let fH = AppState.trucks.length > 0 ? AppState.trucks.map(t => {
            const isB = aTI.includes(t.id);
            const driverInfo = p.hired_drivers.find(d => d.truck_id === t.id);
            
            let sH = driverInfo ? `<span style="font-size:12px;color:#10B981;font-weight:bold;">🟢 Автопилот</span>` : (isB ? `<span style="font-size:12px;color:#EF4444;">🔴 В рейсе</span>` : `<span style="font-size:12px;color:var(--hint-color);">⚪ Свободна</span>`);
            const sT = TRUCK_SHOP.find(x => x.name === t.name);
            let a100 = true, tRC = 0, pts = [{ k: 'engineLvl', n: '🛠 Двс' }, { k: 'tiresLvl', n: '🛞 Шины' }, { k: 'gearLvl', n: '⚙️ КПП' }, { k: 'brakesLvl', n: '🧯 Торм' }];
            let ptH = pts.map(pt => {
                const v = Number(t[pt.k]) || 100; let cl = v < 40 ? '#EF4444' : v < 75 ? '#F59E0B' : '#10B981';
                if (v < 100) a100 = false; tRC += GameLogic.getRepairCost(v);
                return `<div class="part-card"><div class="part-header"><span>${pt.n}</span><span style="color:${cl};font-weight:800;">${v}%</span></div><div class="part-bar"><div class="part-bar-fill" style="width:${v}%;background-color:${cl};"></div></div></div>`;
            }).join('');
            
            let driverUI = driverInfo ? `
                <div style="margin-top:10px; padding:10px; background:rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius:8px; text-align:center;">
                    <div style="font-size:13px; color:#10B981; font-weight:bold; margin-bottom:4px;">👤 Водитель: ${DRIVERS_SHOP.find(x=>x.id===driverInfo.driver_id)?.name}</div>
                    <button class="btn btn-outline" style="width:100%; font-size:11px; padding:6px; border-color:#EF4444; color:#EF4444;" onclick="DriverSys.fireDriver('${t.id}')">Уволить</button>
                </div>` : (!isB ? `
                <div style="margin-top:10px; padding:10px; background:rgba(255,255,255,0.05); border-radius:8px;">
                    <div style="font-size:11px; margin-bottom:8px; color:var(--hint-color);">👤 Нанять водителя:</div>
                    <div style="display:flex; gap:6px;">
                        ${DRIVERS_SHOP.map(d => `<button class="btn btn-outline" style="flex:1; font-size:10px; padding:6px; color:${d.color}; border-color:${d.color};" onclick="DriverSys.hireDriver('${t.id}', '${d.id}')">${d.name}<br>${(d.cost/1000).toFixed(0)}k</button>`).join('')}
                    </div>
                </div>` : '');

            return `<div class="card" style="margin-bottom:16px;"><div class="card-title" style="margin-bottom:8px;"><span>🚚 ${t.name}</span>${sH}</div><div class="truck-specs-badge"><div>📦 <span>${sT?.capacity||0} кг</span></div><div>⛽ <span>${sT?.fuel_use||0} л</span></div></div><div class="parts-grid" style="margin-top:16px;">${ptH}</div><button class="btn ${a100 || isB ? 'btn-outline' : 'btn-full-service'}" style="width:100%;margin-top:10px;font-size:11px;padding:10px;" ${a100 || isB ? 'disabled' : ''} onclick="GameLogic.repairAll('${t.id}')">${a100 ? 'Исправна' : `ТО: ${Math.floor(tRC * 0.9).toLocaleString()} 🪙`}</button>${driverUI}</div>`;
        }).join('') : `<p style="text-align:center;color:var(--hint-color);margin-bottom:16px;">Гараж пуст!</p>`;
        
        const fleetList = document.getElementById('fleet-list');
        if(fleetList) fleetList.innerHTML = fH;
    }
};

const BackgroundCaseSys = {
    setBackground(bgId) {
        if (!AppState.player.unlocked_backgrounds.includes(bgId)) return;
        AppState.player.current_background = bgId;
        DB.syncPlayer();
        UI.showToast('Фон профиля успешно изменен!', 'success');
        UI.renderAll();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    let p = 0; const ld = document.getElementById('loading-screen');
    if (ld) {
        const int = setInterval(() => { p += 20; document.getElementById('loader-progress').style.width = `${p}%`; document.getElementById('loader-percent').innerText = `${p}%`; if(p >= 100) { clearInterval(int); document.getElementById('loader-tap').style.display = 'block'; ld.addEventListener('click', () => { ld.style.opacity = '0'; document.getElementById('app-content').style.opacity = '1'; setTimeout(() => ld.remove(), 500); DB.init(); }); } }, 300);
    } else DB.init();

    setInterval(() => { if (AppState.activeTrips.length > 0) UI.renderAll(); }, 1000);
    setInterval(async () => { 
        AppState.player.playtime_minutes = (AppState.player.playtime_minutes || 0) + 1; 
        let passiveIncome = await DriverSys.collectPassive(ServerTimeSys.now());
        if(passiveIncome > 0) UI.showToast(`Автопилот заработал +${passiveIncome.toLocaleString()} 🪙`, 'success');
        DB.syncPlayer(); UI.renderAll();
    }, 60000);
});

window.switchTab = (id) => UI.switchTab(id); 
window.AudioSys = AudioSys; 
window.GameLogic = GameLogic; 
window.MapSys = MapSys; 
window.DriverSys = DriverSys; 
window.UI = UI;
window.BackgroundCaseSys = BackgroundCaseSys;
