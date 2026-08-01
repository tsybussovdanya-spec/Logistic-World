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
    { id: 'smuggling', name: 'Контрабанда', type: 'illegal', cost: 300000, reqLvl: 12 },
    { id: 'falsified_docs', name: 'Липовые допуски', type: 'illegal', cost: 600000, reqLvl: 15 },
    { id: 'black_market', name: 'Черный коридор', type: 'illegal', cost: 1200000, reqLvl: 20 }
];

const BACKGROUNDS_SHOP = [
    { id: 'bg_r1', name: 'Неоновый асфальт', rarity: 'rare', chance: 8.0, image: 'https://i.ibb.co.com/9mwvmfZG/IMG-4513.jpg' },
    { id: 'bg_r2', name: 'Ночной траверз', rarity: 'rare', chance: 8.0, image: 'https://i.ibb.co.com/HLhsyRKk/IMG-4514.jpg' },
    { id: 'bg_r3', name: 'Кибер-трасса 01', rarity: 'rare', chance: 8.0, image: 'https://i.ibb.co.com/mVjJzRdV/IMG-4519.jpg' },
    { id: 'bg_l3', name: 'Транспортный бог', rarity: 'legendary', chance: 1.0, image: 'https://i.ibb.co.com/mV8CH1jr/IMG-4518.jpg' }
];

const supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
const tgUser = tg.initDataUnsafe?.user;
const telegramId = tgUser?.id ? Number(tgUser.id) : 123456789;

/* НОВАЯ СИСТЕМА: СЕРВЕРНОЕ ВРЕМЯ (Античит) */
const ServerTimeSys = {
    offset: 0,
    async init() {
        try {
            const res = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC');
            const data = await res.json();
            const serverTime = new Date(data.utc_datetime).getTime();
            this.offset = serverTime - Date.now();
            console.log(`[ServerTime] Синхронизировано. Смещение: ${this.offset}мс`);
        } catch (e) {
            console.warn('[ServerTime] Ошибка синхронизации, используем локальное время.');
            this.offset = 0;
        }
    },
    now() {
        return Date.now() + this.offset;
    }
};

const ReputationSys = {
    getTitle(level) {
        if (level < 5) return 'Частник-одиночка'; if (level < 10) return 'Вольный водитель';
        if (level < 15) return 'Опытный дальнобойщик'; if (level < 20) return 'Владелец автопарка';
        if (level < 30) return 'Босс логистики'; if (level < 40) return 'Теневой барон';
        if (level < 50) return 'Глобальный оператор'; return 'Транспортный магнат';
    }
};

const AudioSys = {
    musicOn: false, sfxOn: true, bgm: document.getElementById('bg-music'),
    sfxElements: { click: document.getElementById('sfx-click'), success: document.getElementById('sfx-success'), error: document.getElementById('sfx-error'), engine: document.getElementById('sfx-engine') },
    toggleMusic() {
        this.musicOn = !this.musicOn; const btn = document.getElementById('btn-music');
        if (this.musicOn) { if (this.bgm) { this.bgm.volume = 0.3; this.bgm.play().then(() => { if (btn) btn.innerText = "Включено 🔊"; }).catch(() => { this.musicOn = false; if (btn) btn.innerText = "Выключено 🔇"; }); } } 
        else { if (this.bgm) this.bgm.pause(); if (btn) btn.innerText = "Выключено 🔇"; }
        this.playVibrate('click'); this.playSFX('click');
    },
    toggleSFX() { this.sfxOn = !this.sfxOn; const btn = document.getElementById('btn-sfx'); if (btn) btn.innerText = this.sfxOn ? "Включено 🔊" : "Выключено 🔇"; this.playVibrate('click'); this.playSFX('click'); },
    playSFX(type) { if (!this.sfxOn) return; const sound = this.sfxElements[type]; if (sound) { sound.currentTime = 0; sound.volume = 0.6; sound.play().catch(() => {}); } },
    playVibrate(type = 'success') { if (!this.sfxOn || !tg.HapticFeedback) return; if(type === 'success') tg.HapticFeedback.notificationOccurred('success'); if(type === 'error') tg.HapticFeedback.notificationOccurred('error'); if(type === 'click' || type === 'info') tg.HapticFeedback.impactOccurred('medium'); }
};

const AppState = {
    leaderboardCategory: 'profit', 
    player: { id: null, name: tgUser?.first_name || 'Логист', avatar: tgUser?.photo_url || '', money: 100000, fuel_stock: 400, fuel_price: 12, level: 1, xp: 0, total_profit: 0, total_trips: 0, syndicate: null, last_bonus_time: 0, licenses: ['basic'], pass_level: 1, pass_claimed: [], current_background: 'bg_r1', unlocked_backgrounds: ['bg_r1'], fatigue: 100, wanted_level: 0, garage_level: 1, skills: { eco: 0, luck: 0, mechanic: 0 }, total_fuel_burned: 0, playtime_minutes: 0 },
    syndicateData: { name: null, level: 1, treasuryFuel: 0, techs: { security: 0, logistics: 0, mechanic: 0 }, feed: [] },
    worldExtra: { lockedCategories: [], sectorDemand: { hub: null, chem: null, heavy: null, shadow: null } },
    trucks: [], activeTrips: [], leaderboard: [],
    contracts: [
        { id: 1, title: 'Обычный: Доски', name: 'Доски', diff: 'Обычный', badgeClass: 'badge-ordinary', image: 'https://i.ibb.co.com/nxzLBSw/0-B0-F3-ED8-68-F9-4-D11-9455-63-CEE59-DEC70.png', reward: 5200, fuel: 70, duration: 15, reqLvl: 1, reqLic: 'basic', sector: 'hub' },
        { id: 2, title: 'Обычный: Продукты', name: 'Продукты', diff: 'Обычный', badgeClass: 'badge-ordinary', image: 'https://i.ibb.co.com/YBMmXNHj/74065-E6-B-D63-E-446-D-A8-E1-95492-C930-D70.png', reward: 8900, fuel: 100, duration: 22, reqLvl: 2, reqLic: 'basic', sector: 'hub' },
        { id: 3, title: 'Опасный: Химикаты', name: 'Химикаты', diff: 'Редкий', badgeClass: 'badge-rare', image: 'https://i.ibb.co.com/DPLBSsd9/80-EEB782-572-C-402-C-B9-A2-AD4-DBFC19357.png', reward: 40000, fuel: 350, duration: 120, reqLvl: 6, reqLic: 'dangerous', sector: 'chem' },
        { id: 4, title: 'Негабарит: Спецтехника', name: 'Спецтехника', diff: 'Эпический', badgeClass: 'badge-epic', image: 'https://i.ibb.co.com/WvL7611N/9-BFBF2-DE-90-B2-4970-84-CC-C3-A98248-B0-CE.png', reward: 150000, fuel: 1000, duration: 600, reqLvl: 12, reqLic: 'oversized', sector: 'heavy' },
        { id: 5, title: 'Теневой: Контрабанда', name: 'Контрабанда', diff: 'Нелегал', badgeClass: 'badge-illegal', image: 'https://i.ibb.co.com/1GcDdFJ9/D19-A33-BF-999-E-4-B0-F-8-D66-C3714-FCA6163.png', reward: 220000, fuel: 1200, duration: 900, reqLvl: 12, reqLic: 'smuggling', sector: 'shadow' }
    ]
};

const DB = {
    async init() {
        try {
            await ServerTimeSys.init(); // Сначала синхронизируем время
            let { data: existingPlayer, error: searchError } = await supabaseClient.from('players').select('*').eq('telegram_id', telegramId).maybeSingle();
            if (searchError) throw searchError;
            if (!existingPlayer) await this.createNewPlayer();
            else {
                AppState.player = { ...AppState.player, ...existingPlayer };
                if (AppState.player.fatigue === undefined) AppState.player.fatigue = 100;
                if (AppState.player.wanted_level === undefined) AppState.player.wanted_level = 0;
            }
            await this.loadGameData(); await this.loadLeaderboard(); 
            
            // Запуск Оффлайн-Прогресса
            OfflineProgressSys.process();
            
            UI.renderAll();
        } catch (err) { UI.showToast("Ошибка соединения: " + err.message, "error"); }
    },
    async createNewPlayer() {
        let pay = { telegram_id: telegramId, name: AppState.player.name, avatar: AppState.player.avatar, money: 100000, fuel_stock: 400, level: 1, xp: 0, total_trips: 0, licenses: ['basic'], pass_level: 1, pass_claimed: [], current_background: 'bg_r1', unlocked_backgrounds: ['bg_r1'], fatigue: 100, wanted_level: 0, garage_level: 1, skills: { eco: 0, luck: 0, mechanic: 0 }, total_profit: 0, total_fuel_burned: 0, playtime_minutes: 0 };
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
        let uD = { name: p.name, avatar: p.avatar, money: Number(p.money), fuel_stock: Number(p.fuel_stock), fuel_price: Number(p.fuel_price), level: Number(p.level), xp: Number(p.xp), total_profit: Number(p.total_profit), total_trips: Number(p.total_trips), fatigue: Number(p.fatigue), wanted_level: Number(p.wanted_level), garage_level: Number(p.garage_level), licenses: p.licenses, current_background: p.current_background, unlocked_backgrounds: p.unlocked_backgrounds, pass_level: p.pass_level, pass_claimed: p.pass_claimed, skills: p.skills, total_fuel_burned: Number(p.total_fuel_burned), playtime_minutes: Number(p.playtime_minutes), syndicate: p.syndicate === 'null' ? null : p.syndicate };
        await supabaseClient.from('players').update(uD).eq('id', p.id);
        this.loadLeaderboard();
    }
};

/* НОВАЯ СИСТЕМА: ОФФЛАЙН ПРОГРЕСС */
const OfflineProgressSys = {
    async process() {
        const now = ServerTimeSys.now();
        let offlineEarnings = 0;
        let offlineTripsCompleted = 0;
        const tripsToDelete = [];

        for (let i = AppState.activeTrips.length - 1; i >= 0; i--) {
            const trip = AppState.activeTrips[i];
            if (trip.end_time <= now) {
                // Рейс завершился, пока игрока не было
                let p = Number(trip.reward);
                let exp = Math.floor(p * CONFIG.XP_MULTIPLIER);
                
                offlineEarnings += p;
                offlineTripsCompleted += 1;
                
                AppState.player.money += p;
                AppState.player.total_profit += p;
                AppState.player.total_trips += 1;
                AppState.player.total_fuel_burned += trip.fuel_req;
                
                GameLogic.addXP_silent(exp); // Начисляем опыт без спама тостами
                
                // Рассчитываем износ фуры
                const t = AppState.trucks.find(x => x.id === trip.truck_id);
                if (t) {
                    const w = 8; // Базовый износ
                    t.engineLvl = Math.max(0, t.engineLvl - w);
                    t.tiresLvl = Math.max(0, t.tiresLvl - Math.floor(w * 1.2));
                    t.gearLvl = Math.max(0, t.gearLvl - w);
                    t.brakesLvl = Math.max(0, t.brakesLvl - Math.floor(w * 1.3));
                    await supabaseClient.from('trucks').update({ engineLvl: t.engineLvl, tiresLvl: t.tiresLvl, gearLvl: t.gearLvl, brakesLvl: t.brakesLvl }).eq('id', t.id);
                }

                tripsToDelete.push(trip.id);
                AppState.activeTrips.splice(i, 1);
            }
        }

        if (tripsToDelete.length > 0) {
            // Удаляем завершенные рейсы из БД пакетом
            for (let id of tripsToDelete) {
                await supabaseClient.from('active_trips').delete().eq('id', id);
            }
            await DB.syncPlayer();
            this.showOfflineModal(offlineTripsCompleted, offlineEarnings);
        }
    },
    showOfflineModal(tripsCount, earnings) {
        let ex = document.getElementById('offline-modal'); if (ex) ex.remove();
        const m = `
            <div id="offline-modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:10000;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(10px);">
                <div class="card" style="width:100%;max-width:360px;border-color:var(--success-color);text-align:center;box-shadow:0 0 40px rgba(16, 185, 129, 0.4);">
                    <div style="font-size:40px;margin-bottom:10px;">📈</div>
                    <h3 style="color:#fff;font-size:20px;margin-bottom:8px;font-weight:900;">ОТЧЕТ КОРПОРАЦИИ</h3>
                    <p style="font-size:13px;color:var(--hint-color);margin-bottom:20px;">Пока вы отсутствовали, ваши водители продолжали работать и завершили рейсы.</p>
                    <div style="background:rgba(0,0,0,0.3);padding:15px;border-radius:12px;margin-bottom:20px;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="color:var(--hint-color);">Успешных рейсов:</span>
                            <span style="color:#fff;font-weight:bold;">${tripsCount}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;">
                            <span style="color:var(--hint-color);">Чистая прибыль:</span>
                            <span style="color:var(--success-color);font-weight:bold;font-size:16px;">+${earnings.toLocaleString()} 🪙</span>
                        </div>
                    </div>
                    <button class="btn btn-primary" style="width:100%;" onclick="document.getElementById('offline-modal').remove(); AudioSys.playSFX('success');">Отлично</button>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', m);
        AudioSys.playVibrate('success');
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
    
    async startTrip(reward, fuel, duration, title, reqLvl, reqLic, sector) {
        if (AppState.player.level < reqLvl) return UI.showToast(`Требуется уровень ${reqLvl}!`, 'error');
        if (!AppState.player.licenses.includes(reqLic)) return UI.showToast('Отсутствует лицензия!', 'error');

        const actIds = AppState.activeTrips.map(t => t.truck_id);
        const idleTrucks = AppState.trucks.filter(t => !actIds.includes(t.id));
        if (idleTrucks.length === 0) return UI.showToast('Нет свободных тягачей!', 'error');
        const idleTruck = idleTrucks[0];

        let timeMod = 1.0;
        if (AppState.player.fatigue < 20) timeMod *= 1.3;

        let fFuel = fuel;
        let fDur = Math.floor(duration * timeMod);

        if (AppState.player.fuel_stock < fFuel) return UI.showToast(`Нужно ${fFuel}л топлива!`, 'error');
        
        // Используем серверное время для старта!
        let endTime = ServerTimeSys.now() + (fDur * 1000);

        let { data, error } = await supabaseClient.from('active_trips').insert([{ player_id: AppState.player.id, truck_id: idleTruck.id, title: title, reward: reward, fuel_req: fFuel, end_time: endTime }]).select().single();
        if (error) return UI.showToast("Ошибка запуска рейса", "error");

        AppState.player.fuel_stock -= fFuel;
        AppState.activeTrips.push(data); 
        await DB.syncPlayer();

        UI.showToast(`Рейс начат на ${idleTruck.name}!`, 'success');
        AudioSys.playSFX('engine');
        UI.renderAll();
    },
    
    async finishTrip(tripId) {
        if (this.isFinishing) return;
        const tIdx = AppState.activeTrips.findIndex(t => t.id === tripId); if (tIdx === -1) return;
        
        // Двойная защита: проверяем серверное время перед завершением
        const trip = AppState.activeTrips[tIdx];
        if (trip.end_time > ServerTimeSys.now()) return; 

        this.isFinishing = true;
        let p = Number(trip.reward); let exp = Math.floor(p * CONFIG.XP_MULTIPLIER);
        
        AppState.player.total_fuel_burned = (AppState.player.total_fuel_burned || 0) + trip.fuel_req;
        AppState.player.money += p; AppState.player.total_profit += p; AppState.player.total_trips += 1;
        
        const t = AppState.trucks.find(x => x.id === trip.truck_id);
        if (t) {
            const w = 8;
            t.engineLvl = Math.max(0, t.engineLvl - w);
            t.tiresLvl = Math.max(0, t.tiresLvl - Math.floor(w * 1.2));
            t.gearLvl = Math.max(0, t.gearLvl - w);
            t.brakesLvl = Math.max(0, t.brakesLvl - Math.floor(w * 1.3));
            await supabaseClient.from('trucks').update({ engineLvl: t.engineLvl, tiresLvl: t.tiresLvl, gearLvl: t.gearLvl, brakesLvl: t.brakesLvl }).eq('id', t.id);
        }

        await this.addXP(exp); 
        await supabaseClient.from('active_trips').delete().eq('id', trip.id);
        AppState.activeTrips.splice(tIdx, 1); 
        this.isFinishing = false; 
        await DB.syncPlayer();

        UI.showToast(`Рейс завершен! +${p.toLocaleString()} 🪙`, 'success');
        UI.renderAll();
    }
};

const UI = {
    switchTab(tId) {
        document.querySelectorAll('.tab-content').forEach(e => e.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
        const t = document.getElementById(`tab-${tId}`); if (t) t.classList.add('active');
        document.querySelectorAll('.nav-item').forEach(b => { if(b.getAttribute('onclick')?.includes(tId)) b.classList.add('active'); });
        AudioSys.playVibrate('click'); AudioSys.playSFX('click');
        this.renderAll();
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
        
        const headerAvatar = document.getElementById('user-avatar');
        if (headerAvatar && p.avatar) headerAvatar.src = p.avatar;
        const profileAvatar = document.getElementById('profile-id-avatar');
        if (profileAvatar && p.avatar) profileAvatar.src = p.avatar;

        this.safeUpdate('profile-id-name', p.name); 
        this.safeUpdate('profile-id-lvl', `LVL ${p.level}`);
        this.safeUpdate('user-money', `🪙 ${Number(p.money).toLocaleString()}`); 
        this.safeUpdate('user-fuel-stock', `⛽ ${Number(p.fuel_stock)}л`); 

        this.safeUpdate('stat-total-profit', `${Number(p.total_profit || 0).toLocaleString()} 🪙`);
        this.safeUpdate('stat-total-trips', `${p.total_trips || 0}`);
        
        const aTI = AppState.activeTrips.map(t => t.truck_id);
        
        // Обновленная отрисовка панели рейсов (Использует серверное время!)
        this.safeUpdateHTML('active-trip-panel', AppState.activeTrips.map(tr => { 
            let l = Math.floor((tr.end_time - ServerTimeSys.now()) / 1000); 
            if (l <= 0) { GameLogic.finishTrip(tr.id); return ''; } 
            return `<div class="card" style="margin-bottom:12px;border-color:var(--accent-blue);"><div class="card-title"><span>🚚 Рейс в пути</span><span style="color:var(--accent-blue);">⏳ ${l} сек</span></div><p style="font-size:12px;color:var(--hint-color);">${tr.title}</p></div>`; 
        }).join(''));
        
        const hI = AppState.trucks.some(t => !aTI.includes(t.id));
        this.safeUpdateHTML('contracts-list', AppState.contracts.map(c => {
            const lL = p.level < c.reqLvl, lLic = !p.licenses.includes(c.reqLic), iL = lL || lLic;
            let bt = lL ? `Ур. ${c.reqLvl}` : lLic ? 'Лицензия' : !hI ? 'Нет фур' : 'Начать рейс';
            return `<div class="contract-card" style="${iL ? 'opacity:0.6' : ''}"><div class="contract-header"><div class="contract-title-group"><span class="contract-badge ${c.badgeClass}">${c.diff}</span><span class="contract-name">${c.name}</span></div><div class="contract-reward">+${c.reward.toLocaleString()} 🪙</div></div><div class="contract-body"><div class="contract-image"><img src="${c.image}"></div><div class="contract-specs"><div class="spec-item"><span>⏱ Время:</span><span style="color:#fff;font-weight:bold;">${c.duration}с</span></div><div class="spec-item"><span>⛽ Топл:</span><span style="color:#fff;font-weight:bold;">${c.fuel}л</span></div></div></div><button class="contract-action-btn ${!hI || iL ? 'disabled' : 'active'}" ${!hI || iL ? 'disabled' : ''} onclick="GameLogic.startTrip(${c.reward}, ${c.fuel}, ${c.duration}, '${c.title}', ${c.reqLvl}, '${c.reqLic}', '${c.sector}')">${bt}</button></div>`;
        }).join(''));
    }
};

document.addEventListener('DOMContentLoaded', () => {
    let p = 0; const ld = document.getElementById('loading-screen');
    if (ld) {
        const int = setInterval(() => { p += 20; document.getElementById('loader-progress').style.width = `${p}%`; document.getElementById('loader-percent').innerText = `${p}%`; if(p >= 100) { clearInterval(int); document.getElementById('loader-tap').style.display = 'block'; ld.addEventListener('click', () => { ld.style.opacity = '0'; document.getElementById('app-content').style.opacity = '1'; setTimeout(() => ld.remove(), 500); DB.init(); }); } }, 300);
    } else DB.init();

    setInterval(() => { 
        if (AppState.activeTrips.length > 0) UI.renderAll(); 
    }, 1000);
    
    setInterval(() => { 
        AppState.player.playtime_minutes = (AppState.player.playtime_minutes || 0) + 3;
        DB.syncPlayer();
    }, 180000);
});

window.switchTab = (id) => UI.switchTab(id); 
window.AudioSys = AudioSys; 
window.GameLogic = GameLogic; 
window.UI = UI;
