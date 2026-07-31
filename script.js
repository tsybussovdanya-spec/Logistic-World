// ============================================================================
// 🚀 ИНИЦИАЛИЗАЦИЯ TELEGRAM WEB APP И БАЗЫ ДАННЫХ
// ============================================================================
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
    { id: 'bg_e1', name: 'Глубокий синий неоновый', rarity: 'epic', chance: 7.0, image: 'https://i.ibb.co.com/5CxBvqG/IMG-4527.jpg' },
    { id: 'bg_e2', name: 'Фиолетовый шторм', rarity: 'epic', chance: 7.0, image: 'https://i.ibb.co.com/hSXZxCJ/IMG-4528.jpg' },
    { id: 'bg_m1', name: 'Астральный тоннель', rarity: 'mythic', chance: 4.0, image: 'https://i.ibb.co.com/kg81Wjdv/IMG-4525.jpg' },
    { id: 'bg_l1', name: 'Абсолютный кибернетиз', rarity: 'legendary', chance: 2.0, image: 'https://i.ibb.co.com/KjbxLkzJ/IMG-4529.jpg' }
];

const supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
const tgUser = tg.initDataUnsafe?.user;
const telegramId = tgUser?.id ? Number(tgUser.id) : 123456789;

// ============================================================================
// 🏆 СИСТЕМА ЗВАНИЙ (REPUTATION)
// ============================================================================
const ReputationSys = {
    getTitle(level) {
        if (level < 5) return 'Частник-одиночка'; if (level < 10) return 'Вольный водитель';
        if (level < 15) return 'Опытный дальнобойщик'; if (level < 20) return 'Владелец автопарка';
        if (level < 30) return 'Босс логистики'; if (level < 40) return 'Теневой барон';
        if (level < 50) return 'Глобальный оператор'; return 'Транспортный магнат';
    }
};

// ============================================================================
// 🎵 АУДИО И ВИБРАЦИЯ (SFX)
// ============================================================================
const AudioSys = {
    musicOn: false,
    sfxOn: true,
    bgm: document.getElementById('bg-music'),
    sfxElements: {
        click: document.getElementById('sfx-click'),
        success: document.getElementById('sfx-success'),
        error: document.getElementById('sfx-error'),
        engine: document.getElementById('sfx-engine')
    },
    toggleMusic() {
        this.musicOn = !this.musicOn;
        const btn = document.getElementById('btn-music');
        if (this.musicOn && this.bgm) {
            this.bgm.volume = 0.3;
            this.bgm.play().then(() => { if (btn) btn.innerText = "Включено 🔊"; }).catch(() => { this.musicOn = false; if (btn) btn.innerText = "Выключено 🔇"; });
        } else if (this.bgm) {
            this.bgm.pause();
            if (btn) btn.innerText = "Выключено 🔇";
        }
        this.playVibrate('click'); this.playSFX('click');
    },
    toggleSFX() {
        this.sfxOn = !this.sfxOn;
        const btn = document.getElementById('btn-sfx');
        if (btn) btn.innerText = this.sfxOn ? "Включено 🔊" : "Выключено 🔇";
        this.playVibrate('click'); this.playSFX('click');
    },
    playSFX(type) {
        if (!this.sfxOn) return;
        const s = this.sfxElements[type];
        if (s) { s.currentTime = 0; s.volume = 0.6; s.play().catch(() => {}); }
    },
    playVibrate(type = 'success') {
        if (!this.sfxOn || !tg.HapticFeedback) return;
        if(type === 'success') tg.HapticFeedback.notificationOccurred('success');
        if(type === 'error') tg.HapticFeedback.notificationOccurred('error');
        if(type === 'click' || type === 'info') tg.HapticFeedback.impactOccurred('medium');
    }
};

// ============================================================================
// 🗺️ GIS КАРТА СЕКТОРОВ И ФИЛЬТРАЦИЯ
// ============================================================================
const MapSys = {
    currentRegion: 'all',
    selectRegion(regionId) {
        this.currentRegion = regionId;
        AudioSys.playSFX('click'); AudioSys.playVibrate('click');
        document.querySelectorAll('.map-node').forEach(el => el.classList.remove('active-node'));
        const n = document.querySelector(`.node-${regionId}`);
        if(n) n.classList.add('active-node');

        const names = {
            'all': '📍 Все контракты', 'hub': '📦 Базовый Хаб (Обычные)',
            'chem': '☣️ Хим-Завод (Опасные)', 'heavy': '🏗️ Промзона (Негабарит)',
            'shadow': '🥷 Теневой Порт (Нелегал)'
        };
        UI.safeUpdate('selected-region-title', names[regionId] || names['all']);
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

// ============================================================================
// 📩 TELEGRAM PUSH УВЕДОМЛЕНИЯ
// ============================================================================
const NotificationSys = {
    async sendTelegramPush(message) {
        const BOT_TOKEN = '1234567890:AAH...замени_на_токен_бота';
        if (!telegramId) return;
        try {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: telegramId, text: message, parse_mode: 'HTML' })
            });
        } catch (e) { console.error('Push error:', e); }
    }
};

// ============================================================================
// 🛡️ АДМИН ПАНЕЛЬ
// ============================================================================
const AdminSys = {
    isAdmin() { return AppState.player.name === 'TSYBUSS' || AppState.player.is_admin === true; },
    checkAdminAccess() {
        const ac = document.getElementById('admin-panel-card');
        if (!ac) return;
        if (AppState.player.name === 'TSYBUSS' || AppState.player.name === 'AdminPass2026') {
            ac.style.display = 'block';
            if (AppState.player.name === 'AdminPass2026') AppState.player.name = 'TSYBUSS';
        } else ac.style.display = 'none';
    },
    addMoney(amt) { if (!this.isAdmin()) return; AppState.player.money += amt; DB.syncPlayer(); UI.showToast(`[ADMIN] +${amt.toLocaleString()} 🪙`, 'success'); UI.renderAll(); },
    addFuel(amt) { if (!this.isAdmin()) return; AppState.player.fuel_stock += amt; DB.syncPlayer(); UI.showToast(`[ADMIN] +${amt}л`, 'success'); UI.renderAll(); },
    setLevel(lvl) { if (!this.isAdmin()) return; AppState.player.level = lvl; DB.syncPlayer(); UI.showToast(`[ADMIN] Ур. ${lvl}`, 'success'); UI.renderAll(); },
    unlockAll() {
        if (!this.isAdmin()) return;
        AppState.player.licenses = LICENSES_SHOP.map(l => l.id);
        AppState.player.unlocked_backgrounds = BACKGROUNDS_SHOP.map(b => b.id);
        DB.syncPlayer(); UI.showToast('[ADMIN] Разблокировано!', 'success'); UI.renderAll();
    }
};

// ============================================================================
// 🌍 ПОГОДА И ИВЕНТЫ
// ============================================================================
const WorldState = {
    weather: { name: '☀️ Ясно', timeMod: 1.0, fuelMod: 1.0, wearMod: 1.0 },
    marketEvent: { name: 'Стабильность', effect: 'none', multiplier: 1.0 },
    generateWeather() {
        const types = [
            { name: '☀️ Ясно', timeMod: 1.0, fuelMod: 1.0, wearMod: 1.0 },
            { name: '🔥 Жара', timeMod: 1.0, fuelMod: 1.2, wearMod: 1.2 },
            { name: '🌨 Снег', timeMod: 1.3, fuelMod: 1.1, wearMod: 1.4 },
            { name: '🌧 Ливень', timeMod: 1.1, fuelMod: 1.0, wearMod: 1.5 }
        ];
        this.weather = types[Math.floor(Math.random() * types.length)];
        UI.safeUpdate('weather-info', this.weather.name);
    },
    generateMarketEvent() {
        const events = [
            { name: '⚖️ Стабильность', effect: 'none', multiplier: 1.0, desc: "Рынок стабилен." },
            { name: '📈 Строительный бум', effect: 'Строймат', multiplier: 1.5, desc: "Спрос на стройматериалы вырос!" },
            { name: '⚡ Кризис чипов', effect: 'Электроника', multiplier: 1.8, desc: "Дефицит электроники!" }
        ];
        this.marketEvent = events[Math.floor(Math.random() * events.length)];
        const b = document.getElementById('global-event-banner'), t = document.getElementById('global-event-title'), d = document.getElementById('global-event-desc');
        if (b && t && d) {
            if (this.marketEvent.effect === 'none') b.style.display = 'none';
            else { b.style.display = 'block'; t.innerText = this.marketEvent.name; d.innerText = this.marketEvent.desc; }
        }
    }
};

// ============================================================================
// 📦 МЕХАНИКА КЕЙСОВ ФОНОВ
// ============================================================================
const BackgroundCaseSys = {
    isOpening: false,
    openCase() {
        if (this.isOpening) return;
        if (AppState.player.money < CONFIG.CASE_COST) return UI.showToast('Нужно 10,000,000 🪙', 'error');
        this.isOpening = true; AppState.player.money -= CONFIG.CASE_COST; DB.syncPlayer(); UI.renderAll();
        
        let m = document.createElement('div');
        m.id = 'case-opening-modal';
        m.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.95);z-index:10000;display:flex;flex-direction:column;align-items:center;justify-content:center;";
        m.innerHTML = `<h2 style="color:#fff;margin-bottom:20px;">РАСПАКОВКА...</h2><div class="case-opening-anim" style="width:100px;height:100px;background:var(--gradient-primary);border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:40px;">🎁</div>`;
        document.body.appendChild(m);

        setTimeout(() => {
            m.remove();
            let bg = BACKGROUNDS_SHOP[Math.floor(Math.random() * BACKGROUNDS_SHOP.length)];
            if (!AppState.player.unlocked_backgrounds.includes(bg.id)) AppState.player.unlocked_backgrounds.push(bg.id);
            AppState.player.current_background = bg.id;
            DB.syncPlayer();
            UI.showToast(`Выпал фон: ${bg.name}!`, 'success');
            AudioSys.playSFX('success');
            UI.renderAll();
            this.isOpening = false;
        }, 2500);
    },
    setBackground(bgId) {
        AppState.player.current_background = bgId;
        DB.syncPlayer();
        UI.showToast('Фон установлен!', 'success');
        UI.renderAll();
    }
};

// ============================================================================
// ⚙️ ГЛОБАЛЬНОЕ СОСТОЯНИЕ (STATE)
// ============================================================================
const AppState = {
    leaderboardCategory: 'profit',
    player: {
        id: null, name: tgUser?.first_name || 'Логист', avatar: tgUser?.photo_url || '',
        money: 100000, fuel_stock: 400, fuel_price: 12, level: 1, xp: 0,
        total_profit: 0, total_trips: 0, syndicate: null, last_bonus_time: 0,
        licenses: ['basic'], pass_level: 1, pass_claimed: [],
        current_background: 'bg_r1', unlocked_backgrounds: ['bg_r1'],
        quests: [{ id: 'q1', title: 'Завершить 3 рейса', target: 3, progress: 0, rewardCoins: 15000, rewardXP: 250, claimed: false }],
        skills: { eco: 0, luck: 0, mechanic: 0 }, total_fuel_burned: 0, playtime_minutes: 0, reg_date: new Date().toISOString()
    },
    syndicateData: { name: null, level: 1, treasuryFuel: 0, techs: { security: 0, logistics: 0, mechanic: 0 }, feed: ["Лог инициализирован..."] },
    trucks: [], activeTrips: [], leaderboard: [],
    contracts: [
        { id: 1, title: 'Обычный: Доски', name: 'Доски', diff: 'Обычный', badgeClass: 'badge-ordinary', image: 'https://i.ibb.co.com/nxzLBSw/0-B0-F3-ED8-68-F9-4-D11-9455-63-CEE59-DEC70.png', reward: 5200, fuel: 70, duration: 15, reqLvl: 1, reqLic: 'basic' },
        { id: 2, title: 'Опасный: Химикаты', name: 'Химикаты', diff: 'Редкий', badgeClass: 'badge-rare', image: 'https://i.ibb.co.com/DPLBSsd9/80-EEB782-572-C-402-C-B9-A2-AD4-DBFC19357.png', reward: 40000, fuel: 350, duration: 30, reqLvl: 6, reqLic: 'dangerous' },
        { id: 3, title: 'Негабарит: Спецтехника', name: 'Спецтехника', diff: 'Эпический', badgeClass: 'badge-epic', image: 'https://i.ibb.co.com/WvL7611N/9-BFBF2-DE-90-B2-4970-84-CC-C3-A98248-B0-CE.png', reward: 150000, fuel: 1000, duration: 45, reqLvl: 12, reqLic: 'oversized' },
        { id: 4, title: 'Теневой: Контрабанда', name: 'Алкоголь', diff: 'Нелегал', badgeClass: 'badge-illegal', image: 'https://i.ibb.co.com/1GcDdFJ9/D19-A33-BF-999-E-4-B0-F-8-D66-C3714-FCA6163.png', reward: 220000, fuel: 1200, duration: 60, reqLvl: 12, reqLic: 'smuggling' }
    ]
};

// ============================================================================
// 🤖 ИИ ДИСПЕТЧЕР
// ============================================================================
const AIDispatcher = {
    showPopup(msg) {
        const el = document.getElementById('ai-dispatcher'); if (!el) return;
        document.getElementById('ai-message').innerText = msg; el.classList.add('show');
        AudioSys.playVibrate('info'); setTimeout(() => el.classList.remove('show'), 5000);
    }
};

// ============================================================================
// 🗄️ БАЗА ДАННЫХ SUPABASE
// ============================================================================
const DB = {
    async init() {
        try {
            let { data: ex } = await supabaseClient.from('players').select('*').eq('telegram_id', telegramId).maybeSingle();
            if (!ex) await this.createNewPlayer();
            else AppState.player = { ...AppState.player, ...ex };
            await this.loadGameData(); await this.loadLeaderboard();
            AdminSys.checkAdminAccess(); UI.renderAll();
        } catch (e) { UI.showToast("Ошибка БД: " + e.message, "error"); }
    },
    async createNewPlayer() {
        let pay = { telegram_id: telegramId, name: AppState.player.name, avatar: AppState.player.avatar, money: 100000, fuel_stock: 400, level: 1, xp: 0, licenses: ['basic'], current_background: 'bg_r1', unlocked_backgrounds: ['bg_r1'] };
        let { data } = await supabaseClient.from('players').insert([pay]).select().single();
        if (data) AppState.player = { ...AppState.player, ...data };
    },
    async loadGameData() {
        const [t, tr] = await Promise.all([
            supabaseClient.from('trucks').select('*').eq('player_id', AppState.player.id),
            supabaseClient.from('active_trips').select('*').eq('player_id', AppState.player.id)
        ]);
        AppState.trucks = t.data || []; AppState.activeTrips = tr.data || [];
    },
    async loadLeaderboard() {
        const { data } = await supabaseClient.from('players').select('id, name, avatar, total_profit, total_trips, level, syndicate, current_background').order('total_profit', { ascending: false }).limit(50);
        if (data) AppState.leaderboard = data;
    },
    async syncPlayer() {
        if (!AppState.player.id) return;
        await supabaseClient.from('players').update(AppState.player).eq('id', AppState.player.id);
        this.loadLeaderboard();
    }
};

// ============================================================================
// 🎮 ИГРОВАЯ ЛОГИКА
// ============================================================================
const GameLogic = {
    async buyTruck(shopId) {
        let t = TRUCK_SHOP.find(x => x.id === shopId);
        if (!t || AppState.player.money < t.price) return UI.showToast('Недостаточно средств!', 'error');
        AppState.player.money -= t.price;
        let { data } = await supabaseClient.from('trucks').insert([{ player_id: AppState.player.id, name: t.name, capacity: t.capacity, fuel_use: t.fuel_use, rarity: t.rarity, custom_plate: '456LWO|10', engineLvl: 100, tiresLvl: 100, gearLvl: 100, brakesLvl: 100 }]).select().single();
        if (data) AppState.trucks.push(data);
        await DB.syncPlayer(); UI.showToast(`Куплен ${t.name}!`, 'success'); UI.renderAll();
    },
    getRepairCost(val) { return val >= 100 ? 0 : (100 - val) * 200; },
    async repairPart(truckId, pName) {
        let t = AppState.trucks.find(x => x.id === truckId);
        let cost = this.getRepairCost(t[pName]);
        if (AppState.player.money < cost) return UI.showToast('Не хватает монет на ремонт!', 'error');
        AppState.player.money -= cost; t[pName] = 100;
        await supabaseClient.from('trucks').update({ [pName]: 100 }).eq('id', t.id);
        await DB.syncPlayer(); UI.showToast('Узел отремонтирован!', 'success'); UI.renderAll();
    },
    async startTrip(reward, fuel, duration, title, reqLvl, reqLic) {
        if (AppState.player.level < reqLvl || !AppState.player.licenses.includes(reqLic)) return UI.showToast('Требования не выполнены!', 'error');
        let truck = AppState.trucks.find(t => t.engineLvl === 100 && !AppState.activeTrips.some(tr => tr.truck_id === t.id));
        if (!truck) return UI.showToast('Нет свободных и исправных тягачей!', 'error');
        if (AppState.player.fuel_stock < fuel) return UI.showToast('Недостаточно топлива!', 'error');

        AppState.player.fuel_stock -= fuel;
        let endTime = Date.now() + (duration * 1000);
        let { data } = await supabaseClient.from('active_trips').insert([{ player_id: AppState.player.id, truck_id: truck.id, title: title, reward: reward, fuel_req: fuel, end_time: endTime }]).select().single();
        
        if (data) AppState.activeTrips.push(data);
        await DB.syncPlayer();
        AudioSys.playSFX('engine');
        UI.showToast('Рейс начат!', 'success'); UI.renderAll();
    },
    async finishTrip(tripId) {
        let idx = AppState.activeTrips.findIndex(t => t.id === tripId);
        if (idx === -1) return;
        let tr = AppState.activeTrips[idx];
        
        AppState.player.money += tr.reward;
        AppState.player.total_profit += tr.reward;
        AppState.player.total_trips += 1;

        await supabaseClient.from('active_trips').delete().eq('id', tr.id);
        AppState.activeTrips.splice(idx, 1);
        await DB.syncPlayer();

        NotificationSys.sendTelegramPush(`✅ Рейс выполнен! Заработано +${tr.reward} 🪙`);
        UI.showToast(`Рейс завершен! +${tr.reward} 🪙`, 'success'); UI.renderAll();
    },
    buyFuel(amt) {
        let cost = amt * AppState.player.fuel_price;
        if (AppState.player.money < cost) return UI.showToast('Не хватает денег!', 'error');
        AppState.player.money -= cost; AppState.player.fuel_stock += amt;
        DB.syncPlayer(); UI.showToast(`Куплено ${amt}л`, 'success'); UI.renderAll();
    },
    saveProfile() {
        let n = document.getElementById('input-username').value.trim();
        if (n) AppState.player.name = n;
        DB.syncPlayer(); UI.showToast('Профиль сохранен!', 'success'); UI.renderAll();
    }
};

// ============================================================================
// 🎨 УПРАВЛЕНИЕ ИНТЕРФЕЙСОМ (UI)
// ============================================================================
const UI = {
    switchTab(tId) {
        document.querySelectorAll('.tab-content').forEach(e => e.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
        document.getElementById(`tab-${tId}`).classList.add('active');
        document.querySelectorAll('.nav-item').forEach(b => { if(b.getAttribute('onclick')?.includes(tId)) b.classList.add('active'); });
        AudioSys.playSFX('click'); this.renderAll();
    },
    switchLeaderboardCategory(cat) {
        AppState.leaderboardCategory = cat;
        DB.loadLeaderboard().then(() => this.renderAll());
    },
    showToast(msg, type = 'success') {
        let c = document.getElementById('toast-container'); if (!c) return;
        let t = document.createElement('div'); t.className = `toast ${type}`; t.innerText = msg; c.appendChild(t);
        AudioSys.playVibrate(type); if(type==='success') AudioSys.playSFX('success'); if(type==='error') AudioSys.playSFX('error');
        setTimeout(() => t.remove(), 3000);
    },
    safeUpdate(id, val) { let e = document.getElementById(id); if (e) e.innerText = val; },
    safeUpdateHTML(id, html) { let e = document.getElementById(id); if (e) e.innerHTML = html; },
    renderAll() {
        let p = AppState.player;
        this.safeUpdate('username', p.name); this.safeUpdate('profile-id-name', p.name);
        this.safeUpdate('user-money', `🪙 ${p.money.toLocaleString()}`);
        this.safeUpdate('user-fuel-stock', `⛽ ${p.fuel_stock}л`);
        this.safeUpdate('user-level-badge', `LVL ${p.level}`);

        // Рендер автопарка
        let fH = AppState.trucks.map(t => {
            let isB = AppState.activeTrips.some(tr => tr.truck_id === t.id);
            return `<div class="card"><h3>🚚 ${t.name}</h3><p>${isB ? '🔴 В рейсе' : '🟢 Свободен'}</p><button class="btn btn-outline" onclick="GameLogic.repairPart('${t.id}', 'engineLvl')">Починить ДВС</button></div>`;
        }).join('') || '<p style="color:var(--hint-color);text-align:center;">Гараж пуст</p>';
        this.safeUpdateHTML('fleet-list', fH + `<h3 style="margin:15px 0 10px 0;">Автосалон</h3>` + TRUCK_SHOP.map(s => `<div class="card"><h3>${s.name}</h3><p>${s.price.toLocaleString()} 🪙</p><button class="btn btn-primary" onclick="GameLogic.buyTruck('${s.id}')">Купить</button></div>`).join(''));

        // Рендер активных рейсов
        let tH = AppState.activeTrips.map(tr => {
            let left = Math.floor((tr.end_time - Date.now()) / 1000);
            if (left <= 0) { GameLogic.finishTrip(tr.id); return ''; }
            return `<div class="card"><h3>🚚 В пути</h3><p>${tr.title} — ⏳ ${left}с</p></div>`;
        }).join('');
        this.safeUpdateHTML('active-trip-panel', tH);

        // Рендер контрактов через GIS карту
        this.safeUpdateHTML('contracts-list', MapSys.getFilteredContracts().map(c => `
            <div class="contract-card">
                <div class="contract-header"><span class="contract-name">${c.name}</span><span class="contract-reward">+${c.reward} 🪙</span></div>
                <button class="btn btn-primary" onclick="GameLogic.startTrip(${c.reward}, ${c.fuel}, ${c.duration}, '${c.title}', ${c.reqLvl}, '${c.reqLic}')">Начать рейс</button>
            </div>
        `).join(''));

        // Кейсы
        this.safeUpdateHTML('background-case-section', `<div class="card" style="border-color:var(--accent-pink);text-align:center;"><div class="card-title"><span>🎁 Кейс фонов</span></div><button class="btn btn-primary" onclick="BackgroundCaseSys.openCase()">Открыть (10M 🪙)</button></div>`);
    }
};

// ============================================================================
// 🏁 СТАРТ ПРИЛОЖЕНИЯ
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    WorldState.generateWeather();
    WorldState.generateMarketEvent();
    
    let ld = document.getElementById('loading-screen');
    if (ld) {
        setTimeout(() => {
            ld.style.opacity = '0';
            document.getElementById('app-content').style.opacity = '1';
            setTimeout(() => ld.remove(), 500);
            DB.init();
        }, 1000);
    } else {
        DB.init();
    }
    setInterval(() => { if (AppState.activeTrips.length > 0) UI.renderAll(); }, 1000);
});

window.switchTab = (id) => UI.switchTab(id);
window.AudioSys = AudioSys; window.AdminSys = AdminSys; window.GameLogic = GameLogic;
window.BackgroundCaseSys = BackgroundCaseSys; window.MapSys = MapSys; window.UI = UI;

