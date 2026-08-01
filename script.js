const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

const CONFIG = {
    SUPABASE_URL: 'https://aiqlcndsayerxjtcwqbj.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_zKJ28h0HfzaojbT9s1uwmw_eX7UQZz0',
    XP_MULTIPLIER: 0.15, DAILY_BONUS_COINS: 15000, DAILY_BONUS_FUEL: 200,
    FATIGUE_MAX: 100, MOTEL_COST: 5000, WEATHER_FORECAST_COST: 25000,
    GARAGE_UPGRADE_COSTS: [0, 250000, 1000000, 5000000]
};

const TRUCK_SHOP = [
    { id: 't1', name: 'ГАЗель "Метеор"', capacity: 1500, fuel_use: 20, rarity: 'common', price: 75000 },
    { id: 't2', name: 'ЗАЗ Карго', capacity: 2800, fuel_use: 30, rarity: 'common', price: 140000 },
    { id: 't3', name: 'Volvo FH Neo', capacity: 5000, fuel_use: 45, rarity: 'rare', price: 250000 },
    { id: 't4', name: 'Scania R730', capacity: 8500, fuel_use: 60, rarity: 'rare', price: 420000 },
    { id: 't5', name: 'Cyber Truck', capacity: 11000, fuel_use: 75, rarity: 'epic', price: 550000 }
];

const LICENSES_SHOP = [
    { id: 'basic', name: 'Базовая', type: 'legal', cost: 0, reqLvl: 1 },
    { id: 'dangerous', name: 'Опасные грузы', type: 'legal', cost: 50000, reqLvl: 5 },
    { id: 'oversized', name: 'Негабарит', type: 'legal', cost: 150000, reqLvl: 10 },
    { id: 'smuggling', name: 'Контрабанда', type: 'illegal', cost: 300000, reqLvl: 12 }
];

const BACKGROUNDS_SHOP = [
    { id: 'bg_r1', name: 'Неоновый асфальт', rarity: 'rare', image: 'https://i.ibb.co.com/9mwvmfZG/IMG-4513.jpg' },
    { id: 'bg_r2', name: 'Ночной траверз', rarity: 'rare', image: 'https://i.ibb.co.com/HLhsyRKk/IMG-4514.jpg' },
    { id: 'bg_l3', name: 'Транспортный бог', rarity: 'legendary', image: 'https://i.ibb.co.com/mV8CH1jr/IMG-4518.jpg' }
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
        'ber': { name: 'Берлин', x: 180, y: 250, fuelPrice: 22, icon: '🏛️' },
        'mow': { name: 'Москва', x: 380, y: 200, fuelPrice: 12, icon: '🏙️' },
        'kst': { name: 'Костанай', x: 550, y: 230, fuelPrice: 8, icon: '🏭' },
        'pek': { name: 'Пекин', x: 950, y: 350, fuelPrice: 16, icon: '🏯' },
        'par': { name: 'Париж', x: 120, y: 320, fuelPrice: 24, icon: '🗼' },
        'lon': { name: 'Лондон', x: 90, y: 220, fuelPrice: 26, icon: '🎡' },
        'rom': { name: 'Рим', x: 200, y: 400, fuelPrice: 23, icon: '🏛️' },
        'mad': { name: 'Мадрид', x: 70, y: 480, fuelPrice: 21, icon: '🏰' },
        'war': { name: 'Варшава', x: 270, y: 240, fuelPrice: 17, icon: '🏰' },
        'kie': { name: 'Киев', x: 330, y: 310, fuelPrice: 14, icon: '⛪' },
        'stp': { name: 'Санкт-Петербург', x: 400, y: 120, fuelPrice: 13, icon: '⚓' },
        'kaz': { name: 'Казань', x: 480, y: 180, fuelPrice: 11, icon: '🕌' },
        'ekt': { name: 'Екатеринбург', x: 620, y: 190, fuelPrice: 10, icon: '⛰️' },
        'nsk': { name: 'Новосибирск', x: 760, y: 220, fuelPrice: 9, icon: '❄️' },
        'irk': { name: 'Иркутск', x: 880, y: 260, fuelPrice: 9, icon: '🌊' },
        'vvo': { name: 'Владивосток', x: 1120, y: 320, fuelPrice: 11, icon: '🚢' },
        'ura': { name: 'Уральск', x: 460, y: 270, fuelPrice: 8, icon: '🌾' },
        'ala': { name: 'Алматы', x: 720, y: 380, fuelPrice: 9, icon: '🍎' },
        'ast': { name: 'Астана', x: 650, y: 280, fuelPrice: 8, icon: '🏙️' },
        'tas': { name: 'Ташкент', x: 680, y: 460, fuelPrice: 10, icon: '🕌' },
        'bak': { name: 'Баку', x: 490, y: 420, fuelPrice: 12, icon: '🛢️' },
        'tev': { name: 'Тегеран', x: 550, y: 520, fuelPrice: 10, icon: '🕌' },
        'dub': { name: 'Дубай', x: 620, y: 620, fuelPrice: 7, icon: '💎' },
        'mum': { name: 'Мумбаи', x: 800, y: 590, fuelPrice: 13, icon: '🌴' },
        'del': { name: 'Дели', x: 820, y: 480, fuelPrice: 12, icon: '🛕' },
        'sha': { name: 'Шанхай', x: 1020, y: 450, fuelPrice: 15, icon: '🌆' },
        'hkong': { name: 'Гонконг', x: 980, y: 560, fuelPrice: 16, icon: '⚡' },
        'tok': { name: 'Токио', x: 1150, y: 360, fuelPrice: 20, icon: '🗼' },
        'sel': { name: 'Сеул', x: 1080, y: 380, fuelPrice: 17, icon: '🇰🇷' },
        'sin': { name: 'Сингапур', x: 920, y: 670, fuelPrice: 14, icon: '🦁' },
        'ban': { name: 'Бангкок', x: 900, y: 600, fuelPrice: 13, icon: '🛕' },
        'ist': { name: 'Стамбул', x: 310, y: 380, fuelPrice: 16, icon: '🌉' },
        'cai': { name: 'Каир', x: 360, y: 550, fuelPrice: 11, icon: '🏜️' },
        'ulb': { name: 'Улан-Батор', x: 860, y: 200, fuelPrice: 10, icon: '⛺' }
    },
    cargoTypes: [
        { name: 'Электроника', lic: 'basic', baseRew: 8, icon: '💻' },
        { name: 'Стройматериалы', lic: 'basic', baseRew: 5, icon: '🧱' },
        { name: 'Химикаты', lic: 'dangerous', baseRew: 18, icon: '☣️' },
        { name: 'Турбины', lic: 'oversized', baseRew: 25, icon: '🏗️' },
        { name: 'Теневой груз', lic: 'smuggling', baseRew: 40, icon: '🥷' },
        { name: 'Продовольствие', lic: 'basic', baseRew: 6, icon: '🍎' }
    ],
    getRoutesForCity(cityKey) {
        const routes = [];
        const c1 = this.cities[cityKey];
        if(!c1) return routes;
        
        for(let key in this.cities) {
            if(key === cityKey) continue;
            let c2 = this.cities[key];
            let dist = Math.hypot(c2.x - c1.x, c2.y - c1.y) * 8; // условное расстояние
            if(dist < 3500) { // если города относительно близко, прокладываем дорогу
                routes.push({
                    id: `r_${cityKey}_${key}`,
                    from: cityKey,
                    to: key,
                    dist: Math.floor(dist),
                    type: dist > 2000 ? 'dirt' : 'highway',
                    wearMod: 1.0,
                    speedMod: 1.1,
                    name: `Тракт ${c1.name}-${c2.name}`
                });
            }
        }
        return routes;
    }
};

const MapSys = {
    selectCity(cityId) {
        WORLD_MAP.currentCity = cityId; 
        AudioSys.playSFX('click'); 
        AudioSys.playVibrate('click');
        AppState.player.fuel_price = WORLD_MAP.cities[cityId].fuelPrice;
        this.renderMapUI(); 
        UI.renderAll();
    },
    generateDynamicContracts() {
        const contracts = []; 
        const currentId = WORLD_MAP.currentCity;
        const availableRoutes = WORLD_MAP.getRoutesForCity(currentId);

        availableRoutes.forEach(route => {
            const targetCity = WORLD_MAP.cities[route.to];
            if(!targetCity) return;
            for(let i = 0; i < 3; i++) {
                const cargo = WORLD_MAP.cargoTypes[Math.floor(Math.random() * WORLD_MAP.cargoTypes.length)];
                const reward = Math.floor(route.dist * cargo.baseRew * (1 + Math.random() * 0.2));
                const baseFuelReq = Math.floor(route.dist * 0.12); 
                const durationSec = Math.max(5, Math.floor((route.dist / 15))); 
                contracts.push({ 
                    id: `dyn_${route.to}_${i}`, 
                    title: `В ${targetCity.name}`, 
                    name: cargo.name, 
                    targetCity: route.to, 
                    diff: 'Норма', 
                    badgeClass: cargo.lic === 'smuggling' ? 'badge-illegal' : 'badge-ordinary', 
                    reward: reward, 
                    baseFuel: baseFuelReq, 
                    duration: durationSec, 
                    reqLvl: cargo.lic === 'smuggling' ? 12 : 1, 
                    reqLic: cargo.lic, 
                    routeId: route.id, 
                    icon: cargo.icon 
                });
            }
        });
        return contracts;
    },
    renderMapUI() {
        const mapCanvas = document.querySelector('.map-canvas'); if(!mapCanvas) return;
        const currentId = WORLD_MAP.currentCity;
        const activeRoutes = WORLD_MAP.getRoutesForCity(currentId);

        let svgHTML = `<svg style="position:absolute;top:0;left:0;width:1200px;height:700px;z-index:1;pointer-events:none;">`;
        activeRoutes.forEach(r => { 
            const c1 = WORLD_MAP.cities[r.from]; const c2 = WORLD_MAP.cities[r.to]; 
            if(!c1 || !c2) return; 
            svgHTML += `<line x1="${c1.x}" y1="${c1.y}" x2="${c2.x}" y2="${c2.y}" stroke="#3B82F6" stroke-width="2" opacity="0.6" />`; 
        });
        svgHTML += `</svg>`;
        
        let nodesHTML = '';
        for(let key in WORLD_MAP.cities) { 
            let c = WORLD_MAP.cities[key]; 
            let isCurrent = (currentId === key); 
            nodesHTML += `<div class="map-node ${isCurrent ? 'active-node' : ''}" style="top:${c.y}px; left:${c.x}px;" onclick="MapSys.selectCity('${key}')"><div class="node-pulse ${isCurrent ? 'pulse-epic' : ''}"></div><div class="node-icon">${c.icon}</div><div class="node-label">${c.name}</div></div>`; 
        }
        
        mapCanvas.innerHTML = `<div class="map-bg"></div>` + svgHTML + nodesHTML;
        const cityData = WORLD_MAP.cities[currentId]; 
        UI.safeUpdate('selected-region-title', `📍 ${cityData.name} | Топливо: ${cityData.fuelPrice} 🪙/л`);
    },
    initDragScroll() {
        const slider = document.getElementById('map-scroll-container');
        if(!slider) return;
        let isDown = false;
        let startX, startY, scrollLeft, scrollTop;

        // Поддержка Мыши (ПК)
        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.classList.add('active');
            startX = e.pageX - slider.offsetLeft;
            startY = e.pageY - slider.offsetTop;
            scrollLeft = slider.scrollLeft;
            scrollTop = slider.scrollTop;
        });
        slider.addEventListener('mouseleave', () => { isDown = false; });
        slider.addEventListener('mouseup', () => { isDown = false; });
        slider.addEventListener('mousemove', (e) => {
            if(!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const y = e.pageY - slider.offsetTop;
            slider.scrollLeft = scrollLeft - (x - startX);
            slider.scrollTop = scrollTop - (y - startY);
        });

        // Поддержка Сенсорных экранов (Смартфоны)
        slider.addEventListener('touchstart', (e) => {
            if(e.touches.length === 1) {
                isDown = true;
                startX = e.touches[0].pageX - slider.offsetLeft;
                startY = e.touches[0].pageY - slider.offsetTop;
                scrollLeft = slider.scrollLeft;
                scrollTop = slider.scrollTop;
            }
        });
        slider.addEventListener('touchend', () => { isDown = false; });
        slider.addEventListener('touchmove', (e) => {
            if(!isDown || e.touches.length !== 1) return;
            const x = e.touches[0].pageX - slider.offsetLeft;
            const y = e.touches[0].pageY - slider.offsetTop;
            slider.scrollLeft = scrollLeft - (x - startX);
            slider.scrollTop = scrollTop - (y - startY);
        }, { passive: true });
    }
};

const AudioSys = {
    musicOn: false, sfxOn: true, bgm: document.getElementById('bg-music'),
    sfxElements: { click: document.getElementById('sfx-click'), success: document.getElementById('sfx-success'), error: document.getElementById('sfx-error'), engine: document.getElementById('sfx-engine') },
    toggleMusic() { this.musicOn = !this.musicOn; const btn = document.getElementById('btn-music'); if (this.musicOn) { if (this.bgm) { this.bgm.volume = 0.3; this.bgm.play().then(() => { if (btn) btn.innerText = "Музыка 🔊"; }).catch(() => { this.musicOn = false; if (btn) btn.innerText = "Музыка 🔇"; }); } } else { if (this.bgm) this.bgm.pause(); if (btn) btn.innerText = "Музыка 🔇"; } this.playVibrate('click'); this.playSFX('click'); },
    toggleSFX() { this.sfxOn = !this.sfxOn; const btn = document.getElementById('btn-sfx'); if (btn) btn.innerText = this.sfxOn ? "Эффекты 🔊" : "Эффекты 🔇"; this.playVibrate('click'); this.playSFX('click'); },
    playSFX(type) { if (!this.sfxOn) return; const sound = this.sfxElements[type]; if (sound) { sound.currentTime = 0; sound.volume = 0.6; sound.play().catch(() => {}); } },
    playVibrate(type = 'success') { if (!this.sfxOn || !tg.HapticFeedback) return; if(type === 'success') tg.HapticFeedback.notificationOccurred('success'); if(type === 'error') tg.HapticFeedback.notificationOccurred('error'); if(type === 'click' || type === 'info') tg.HapticFeedback.impactOccurred('medium'); }
};

const AppState = {
    leaderboardCategory: 'profit', 
    player: { 
        id: null, name: tgUser?.first_name || 'Логист', avatar: tgUser?.photo_url || '', money: 100000, 
        fuel_stock: 400, fuel_price: 12, level: 25, xp: 0, total_profit: 0, total_trips: 0, syndicate: null, 
        last_bonus_time: 0, licenses: ['basic', 'dangerous', 'oversized', 'smuggling'], pass_level: 1, pass_claimed: [], current_background: 'bg_r1', 
        unlocked_backgrounds: ['bg_r1'], fatigue: 100, wanted_level: 0, garage_level: 1, skills: { eco: 0, luck: 0, mechanic: 0 }, 
        total_fuel_burned: 0, playtime_minutes: 0, hired_drivers: [], last_passive_collect: 0,
        daily_streak: 0, last_daily_claim: 0, syndicate_role: 'member', syndicate_contribution: 0
    },
    syndicateData: { name: null, level: 1, treasuryFuel: 0, treasuryCoins: 0, techs: { security: 0, logistics: 0, mechanic: 0 }, feed: [], membersCount: 1 },
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
            MapSys.initDragScroll();
            UI.renderAll();
        } catch (err) { UI.showToast("Ошибка соединения: " + err.message, "error"); }
    },
    async createNewPlayer() {
        let pay = { 
            telegram_id: telegramId, name: AppState.player.name, avatar: AppState.player.avatar, money: 100000, 
            fuel_stock: 400, level: 25, xp: 0, total_trips: 0, licenses: ['basic', 'dangerous', 'oversized', 'smuggling'], pass_level: 1, pass_claimed: [], 
            current_background: 'bg_r1', unlocked_backgrounds: ['bg_r1'], fatigue: 100, wanted_level: 0, garage_level: 1, 
            skills: { eco: 0, luck: 0, mechanic: 0 }, total_profit: 0, total_fuel_burned: 0, playtime_minutes: 0, 
            hired_drivers: [], last_passive_collect: ServerTimeSys.now(), daily_streak: 0, last_daily_claim: 0 
        };
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
        let uD = { 
            name: p.name, avatar: p.avatar, money: Number(p.money), fuel_stock: Number(p.fuel_stock), fuel_price: Number(p.fuel_price), 
            level: Number(p.level), xp: Number(p.xp), total_profit: Number(p.total_profit), total_trips: Number(p.total_trips), 
            fatigue: Number(p.fatigue), wanted_level: Number(p.wanted_level), garage_level: Number(p.garage_level), licenses: p.licenses, 
            current_background: p.current_background, unlocked_backgrounds: p.unlocked_backgrounds, pass_level: p.pass_level, 
            pass_claimed: p.pass_claimed, skills: p.skills, total_fuel_burned: Number(p.total_fuel_burned), playtime_minutes: Number(p.playtime_minutes), 
            hired_drivers: p.hired_drivers, last_passive_collect: p.last_passive_collect, daily_streak: p.daily_streak, 
            last_daily_claim: p.last_daily_claim, syndicate: p.syndicate === 'null' ? null : p.syndicate, syndicate_role: p.syndicate_role, syndicate_contribution: p.syndicate_contribution 
        };
        await supabaseClient.from('players').update(uD).eq('id', p.id);
        this.loadLeaderboard();
    }
};

const FatigueSys = {
    useEnergyDrink() {
        if (AppState.player.money < 2000) return UI.showToast('Нужно 2,000 🪙', 'error');
        AppState.player.money -= 2000;
        AppState.player.fatigue = Math.min(100, AppState.player.fatigue + 40);
        DB.syncPlayer(); UI.showToast('⚡ Бодрость +40%', 'success'); UI.renderAll();
    },
    restAtMotel() {
        if (AppState.player.money < CONFIG.MOTEL_COST) return UI.showToast('Нужно 5,000 🪙', 'error');
        AppState.player.money -= CONFIG.MOTEL_COST;
        AppState.player.fatigue = 100;
        DB.syncPlayer(); UI.showToast('🛏️ Бодрость восстановлена!', 'success'); UI.renderAll();
    }
};

const WeatherSys = {
    buyForecast() {
        if (AppState.player.money < CONFIG.WEATHER_FORECAST_COST) return UI.showToast('Недостаточно средств', 'error');
        AppState.player.money -= CONFIG.WEATHER_FORECAST_COST;
        DB.syncPlayer();
        const el = document.getElementById('forecast-status-div');
        if(el) el.innerText = "✅ Прогноз: Ясно на всех трассах.";
        UI.showToast('📡 Метеопрогноз куплен!', 'success'); UI.renderAll();
    }
};

const GarageSys = {
    upgradeGarage() {
        const lvl = AppState.player.garage_level || 1;
        if(lvl >= 4) return UI.showToast('Максимальный уровень!', 'info');
        const cost = CONFIG.GARAGE_UPGRADE_COSTS[lvl] || 500000;
        if (AppState.player.money < cost) return UI.showToast('Недостаточно монет', 'error');
        AppState.player.money -= cost;
        AppState.player.garage_level = lvl + 1;
        DB.syncPlayer(); UI.showToast(`🏠 Гараж улучшен до Ур. ${AppState.player.garage_level}!`, 'success'); UI.renderAll();
    }
};

const UnderworldSys = {
    hireLawyer() {
        if(AppState.player.wanted_level <= 0) return UI.showToast('Досье чисто!', 'info');
        if (AppState.player.money < 150000) return UI.showToast('Нужно 150k 🪙', 'error');
        AppState.player.money -= 150000;
        AppState.player.wanted_level = 0;
        DB.syncPlayer(); UI.showToast('⚖️ Досье очищено!', 'success'); UI.renderAll();
    }
};

const AdminSys = {
    addMoney(amt) { AppState.player.money += amt; DB.syncPlayer(); UI.showToast(`+${amt} 🪙`, 'success'); UI.renderAll(); },
    addFuel(amt) { AppState.player.fuel_stock += amt; DB.syncPlayer(); UI.showToast(`+${amt}л`, 'success'); UI.renderAll(); },
    setLevel(lvl) { AppState.player.level = lvl; DB.syncPlayer(); UI.showToast(`Ур. ${lvl}`, 'success'); UI.renderAll(); },
    unlockAll() { AppState.player.licenses = ['basic', 'dangerous', 'oversized', 'smuggling']; DB.syncPlayer(); UI.showToast('Всё открыто', 'success'); UI.renderAll(); }
};

const GameLogic = {
    async startTrip(reward, baseFuel, duration, title, reqLvl, reqLic, targetCity, routeId) {
        if (AppState.player.level < reqLvl) return UI.showToast(`Требуется уровень ${reqLvl}!`, 'error');
        if (!AppState.player.licenses.includes(reqLic)) return UI.showToast('Нет лицензии!', 'error');

        const actIds = AppState.activeTrips.map(t => t.truck_id);
        const idleTrucks = AppState.trucks.filter(t => !actIds.includes(t.id));
        
        if (idleTrucks.length === 0) {
            // Если нет машин, создаем временную ГАЗель автоматически для теста
            AppState.trucks.push({ id: 'temp_' + Date.now(), name: 'ГАЗель "Метеор"', capacity: 1500, fuel_use: 20, engineLvl: 100, tiresLvl: 100, gearLvl: 100, brakesLvl: 100 });
        }
        
        const idleTruck = AppState.trucks.filter(t => !actIds.includes(t.id))[0];
        if (AppState.player.fuel_stock < baseFuel) return UI.showToast(`Нужно ${baseFuel}л топлива!`, 'error');
        
        let endTime = ServerTimeSys.now() + (duration * 1000);

        let { data, error } = await supabaseClient.from('active_trips').insert([{ 
            player_id: AppState.player.id, truck_id: idleTruck.id, title: title, 
            reward: reward, fuel_req: baseFuel, end_time: endTime, route_id: routeId 
        }]).select().single();
        
        if (error) {
            // Фолбэк если бд ругается
            data = { id: 'local_' + Date.now(), truck_id: idleTruck.id, title, reward, fuel_req: baseFuel, end_time: endTime, route_id };
        }

        AppState.player.fuel_stock -= baseFuel; 
        AppState.activeTrips.push(data); 
        await DB.syncPlayer();

        UI.showToast(`Рейс запущен!`, 'success'); 
        AudioSys.playSFX('engine'); 
        UI.renderAll();
    },
    
    async finishTrip(tripId) {
        const tIdx = AppState.activeTrips.findIndex(t => t.id === tripId); if (tIdx === -1) return;
        const trip = AppState.activeTrips[tIdx];
        
        let p = Number(trip.reward); 
        AppState.player.money += p; 
        AppState.player.total_profit += p; 
        AppState.player.total_trips += 1;

        await supabaseClient.from('active_trips').delete().eq('id', trip.id);
        AppState.activeTrips.splice(tIdx, 1); 
        await DB.syncPlayer();

        UI.showToast(`Рейс завершен! +${p.toLocaleString()} 🪙`, 'success'); 
        UI.renderAll();
    },

    async buyFuel(amt) {
        const c = Number(amt) * AppState.player.fuel_price;
        if (AppState.player.money < c) return UI.showToast('Недостаточно монет!', 'error');
        AppState.player.money -= c; AppState.player.fuel_stock += Number(amt);
        await DB.syncPlayer(); UI.showToast(`Куплено ${amt}л`, 'success'); UI.renderAll();
    },
    claimPassReward(tier, rew) {
        AppState.player.money += rew;
        DB.syncPlayer(); UI.showToast(`Награда получена: +${rew} 🪙`, 'success'); UI.renderAll();
    },
    saveProfile() {
        const i = document.getElementById('input-username');
        if(i && i.value.trim()) { AppState.player.name = i.value.trim(); DB.syncPlayer(); UI.showToast('Сохранено!', 'success'); UI.renderAll(); }
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
    showToast(msg, type = 'success') {
        const c = document.getElementById('toast-container'); if (!c) return;
        const t = document.createElement('div'); t.className = `toast ${type}`; t.innerText = msg; c.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
    },
    safeUpdate(id, t) { const e = document.getElementById(id); if (e) e.innerText = t; },
    safeUpdateHTML(id, h) { const e = document.getElementById(id); if (e) e.innerHTML = h; },
    
    renderAll() {
        const p = AppState.player;
        this.safeUpdate('username', p.name);
        this.safeUpdate('profile-id-name', p.name);
        this.safeUpdate('user-money', `🪙 ${Number(p.money).toLocaleString()}`); 
        this.safeUpdate('user-fuel-stock', `⛽ ${Number(p.fuel_stock)}л`); 
        this.safeUpdate('user-fatigue-bar', `🔋 ${p.fatigue}%`);
        this.safeUpdate('current-fuel-price', `${p.fuel_price || 12} 🪙 / л`);

        // Активные рейсы
        const aTI = AppState.activeTrips.map(t => t.truck_id);
        this.safeUpdateHTML('active-trip-panel', AppState.activeTrips.map(tr => { 
            let l = Math.floor((tr.end_time - ServerTimeSys.now()) / 1000); 
            if (l <= 0) { GameLogic.finishTrip(tr.id); return ''; } 
            return `<div class="card" style="margin-bottom:12px;border-color:var(--accent-blue);"><div class="card-title"><span>🚚 В пути</span><span style="color:var(--accent-blue);">⏳ ${l}с</span></div><p style="font-size:12px;color:var(--hint-color);">${tr.title}</p></div>`; 
        }).join(''));

        // Контракты
        const dynamicContracts = MapSys.generateDynamicContracts();
        this.safeUpdateHTML('contracts-list', dynamicContracts.map(c => {
            return `<div class="contract-card"><div class="contract-header"><div class="contract-title-group"><span class="contract-badge ${c.badgeClass}">${c.diff}</span><span class="contract-name">${c.icon} ${c.name}</span></div><div class="contract-reward">+${c.reward.toLocaleString()} 🪙</div></div><div class="contract-body" style="padding-top:10px;"><div style="font-size:12px; color:var(--hint-color); margin-bottom:8px;">Маршрут: <span style="color:#fff;font-weight:bold;">${c.title}</span></div><div class="contract-specs"><div class="spec-item"><span>⏱ Время:</span><span style="color:#fff;font-weight:bold;">${c.duration}с</span></div><div class="spec-item"><span>⛽ Топливо:</span><span style="color:#fff;font-weight:bold;">${c.baseFuel}л</span></div></div></div><button class="contract-action-btn active" onclick="GameLogic.startTrip(${c.reward}, ${c.baseFuel}, ${c.duration}, '${c.title}', ${c.reqLvl}, '${c.reqLic}', '${c.targetCity}', '${c.routeId}')">Начать рейс</button></div>`;
        }).join(''));

        // Автопарк
        if(AppState.trucks.length === 0) {
            AppState.trucks.push({ id: 'default_t', name: 'ГАЗель "Метеор"', capacity: 1500, fuel_use: 20, engineLvl: 100, tiresLvl: 100, gearLvl: 100, brakesLvl: 100 });
        }
        const fleetList = document.getElementById('fleet-list');
        if(fleetList) {
            fleetList.innerHTML = AppState.trucks.map(t => `<div class="card"><div class="card-title"><span>🚚 ${t.name}</span></div><div class="truck-specs-badge"><div>📦 <span>1500 кг</span></div><div>⛽ <span>20 л</span></div></div></div>`).join('');
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    let p = 0; const ld = document.getElementById('loading-screen');
    if (ld) {
        const int = setInterval(() => { p += 25; document.getElementById('loader-progress').style.width = `${p}%`; document.getElementById('loader-percent').innerText = `${p}%`; if(p >= 100) { clearInterval(int); document.getElementById('loader-tap').style.display = 'block'; ld.addEventListener('click', () => { ld.style.opacity = '0'; document.getElementById('app-content').style.opacity = '1'; setTimeout(() => ld.remove(), 500); DB.init(); MapSys.initDragScroll(); }); } }, 200);
    } else { DB.init(); MapSys.initDragScroll(); }

    setInterval(() => { if (AppState.activeTrips.length > 0) UI.renderAll(); }, 1000);
});

window.switchTab = (id) => UI.switchTab(id);
window.GameLogic = GameLogic;
window.MapSys = MapSys;
window.FatigueSys = FatigueSys;
window.WeatherSys = WeatherSys;
window.GarageSys = GarageSys;
window.UnderworldSys = UnderworldSys;
window.AdminSys = AdminSys;
window.UI = UI;
