// ============================================================================
// 🚀 ИНИЦИАЛИЗАЦИЯ TELEGRAM WEB APP И БАЗЫ ДАННЫХ
// ============================================================================
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

const CONFIG = {
    SUPABASE_URL: 'https://aiqlcndsayerxjtcwqbj.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_zKJ28h0HfzaojbT9s1uwmw_eX7UQZz0',
    XP_MULTIPLIER: 0.15, 
    DAILY_BONUS_COINS: 15000,
    DAILY_BONUS_FUEL: 200,
    BONUS_COOLDOWN_MS: 86400000, 
    TIPS: [
        "Дождь увеличивает износ шин и тормозов.",
        "Следите за коробкой передач: 0% износа блокирует рейсы!",
        "Ремонтируйте узлы вовремя, чтобы избежать поломки в пути."
    ]
};

const TRUCK_SHOP = [
    { id: 't1', name: 'ГАЗель "Метеор"', capacity: 1500, fuel_use: 20, rarity: 'common', price: 75000 },
    { id: 't2', name: 'Volvo FH Neo', capacity: 5000, fuel_use: 45, rarity: 'rare', price: 250000 },
    { id: 't3', name: 'Cyber Titan', capacity: 12000, fuel_use: 80, rarity: 'epic', price: 600000 },
    { id: 't4', name: 'Quantum Leviathan', capacity: 25000, fuel_use: 120, rarity: 'legendary', price: 1500000 }
];

const supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
const tgUser = tg.initDataUnsafe?.user;
const telegramId = tgUser?.id ? Number(tgUser.id) : 123456789;

// ============================================================================
// 🎵 АУДИО СИСТЕМА И ВИБРАЦИЯ
// ============================================================================
const AudioSys = {
    musicOn: false,
    sfxOn: true,
    bgm: document.getElementById('bg-music'),
    
    toggleMusic() {
        this.musicOn = !this.musicOn;
        if (this.musicOn && this.bgm) this.bgm.play().catch(()=>{});
        else if (this.bgm) this.bgm.pause();
        const btn = document.getElementById('btn-music');
        if (btn) btn.innerText = this.musicOn ? "Включено 🔊" : "Выключено 🔇";
        this.playVibrate('click');
    },
    toggleSFX() {
        this.sfxOn = !this.sfxOn;
        const btn = document.getElementById('btn-sfx');
        if (btn) btn.innerText = this.sfxOn ? "Включено 🔊" : "Выключено 🔇";
        this.playVibrate('click');
    },
    playVibrate(type = 'success') {
        if (!this.sfxOn || !tg.HapticFeedback) return;
        if(type === 'success') tg.HapticFeedback.notificationOccurred('success');
        if(type === 'error') tg.HapticFeedback.notificationOccurred('error');
        if(type === 'click' || type === 'info') tg.HapticFeedback.impactOccurred('medium');
    }
};

// ============================================================================
// 🛡️ АДМИН СИСТЕМА
// ============================================================================
const AdminSys = {
    isAdmin() {
        return AppState.player.name === 'TSYBUSS' || AppState.player.is_admin === true;
    },
    checkAdminAccess() {
        const nameInput = AppState.player.name;
        const adminCard = document.getElementById('admin-panel-card');
        if (!adminCard) return;

        if (nameInput === 'TSYBUSS' || nameInput === 'AdminPass2026') {
            adminCard.style.display = 'block';
            if (nameInput === 'AdminPass2026') {
                AppState.player.name = 'TSYBUSS';
            }
        } else {
            adminCard.style.display = 'none';
        }
    },
    addMoney(amount) {
        if (!this.isAdmin()) return;
        AppState.player.money += amount;
        DB.syncPlayer();
        UI.showToast(`[ADMIN] Зачислено ${amount.toLocaleString()} 🪙`, 'success');
        UI.renderAll();
    },
    addFuel(amount) {
        if (!this.isAdmin()) return;
        AppState.player.fuel_stock += amount;
        DB.syncPlayer();
        UI.showToast(`[ADMIN] Зачислено ${amount}л топлива`, 'success');
        UI.renderAll();
    },
    setLevel(lvl) {
        if (!this.isAdmin()) return;
        AppState.player.level = lvl;
        AppState.player.pass_level = Math.max(AppState.player.pass_level, lvl);
        DB.syncPlayer();
        UI.showToast(`[ADMIN] Установлен уровень ${lvl}`, 'success');
        UI.renderAll();
    },
    unlockAll() {
        if (!this.isAdmin()) return;
        AppState.player.licenses = ['basic', 'dangerous', 'oversized'];
        TRUCK_SHOP.forEach(shopT => {
            if (!AppState.trucks.some(t => t.name === shopT.name)) {
                AppState.trucks.push({
                    id: 'admin_' + Math.random(),
                    player_id: AppState.player.id,
                    name: shopT.name,
                    capacity: shopT.capacity,
                    fuel_use: shopT.fuel_use,
                    rarity: shopT.rarity,
                    engineLvl: 100, tiresLvl: 100, gearLvl: 100, brakesLvl: 100,
                    engineLvlUpgrade: 0, tiresLvlUpgrade: 0, gearLvlUpgrade: 0, brakesLvlUpgrade: 0
                });
            }
        });
        DB.syncPlayer();
        UI.showToast('[ADMIN] Все лицензии и фуры разблокированы!', 'success');
        UI.renderAll();
    }
};

// ============================================================================
// 🌍 ПОГОДА И ГЛОБАЛЬНЫЕ ИВЕНТЫ
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
            { name: '⚖️ Стабильность', effect: 'none', multiplier: 1.0, desc: "Рынок стабилен, цены в норме." },
            { name: '📈 Строительный бум', effect: 'Стройматериалы', multiplier: 1.5, desc: "Спрос на стройматериалы вырос! Награды за них увеличены на 50%." },
            { name: '⚡ Кризис микрочипов', effect: 'Электроника', multiplier: 1.8, desc: "Дефицит электроники! Платят почти вдвое больше." },
            { name: '🛢 Топливный кризис', effect: 'fuel_price', multiplier: 2.0, desc: "Цены на топливо взлетели! Экономьте бензин." }
        ];
        
        this.marketEvent = events[Math.floor(Math.random() * events.length)];
        
        const banner = document.getElementById('global-event-banner');
        const title = document.getElementById('global-event-title');
        const desc = document.getElementById('global-event-desc');
        
        if (banner && desc && title) {
            if (this.marketEvent.effect === 'none') {
                banner.style.display = 'none';
            } else {
                banner.style.display = 'block';
                title.innerText = this.marketEvent.name;
                desc.innerText = this.marketEvent.desc;
                AIDispatcher.showPopup(`Внимание: ${this.marketEvent.name}! Проверьте Центр Логистики.`);
            }
        }
        
        if (this.marketEvent.effect === 'fuel_price') {
            AppState.player.fuel_price = Math.floor(AppState.player.fuel_price * this.marketEvent.multiplier);
            UI.renderAll();
        }
    }
};

// ============================================================================
// ⚙️ ГЛОБАЛЬНОЕ СОСТОЯНИЕ (STATE)
// ============================================================================
const AppState = {
    player: {
        id: null, name: tgUser?.first_name || 'Логист', avatar: tgUser?.photo_url || '',
        money: 100000, fuel_stock: 400, fuel_price: 12, level: 1, xp: 0,
        total_profit: 0, total_trips: 0, syndicate: null, last_bonus_time: 0,
        licenses: ['basic'], pass_level: 1, pass_claimed: [],
        quests: [
            { id: 'q1', title: 'Завершить 3 рейса', target: 3, progress: 0, rewardCoins: 15000, rewardXP: 250, claimed: false },
            { id: 'q2', title: 'Потратить 500л топлива', target: 500, progress: 0, rewardCoins: 20000, rewardXP: 400, claimed: false },
            { id: 'q3', title: 'Заработать 50,000 🪙', target: 50000, progress: 0, rewardCoins: 30000, rewardXP: 600, claimed: false }
        ]
    },
    syndicateData: {
        target: 50000,
        current: 12000,
        reward: 250000
    },
    trucks: [],
    activeTrips: [],
    leaderboard: [],
    contracts: [
        { id: 1, title: 'Обычный: Доски', reward: 5200, fuel: 70, duration: 15, reqLvl: 1, reqLic: 'basic' },
        { id: 2, title: 'Обычный: Стройматериалы', reward: 11500, fuel: 140, duration: 30, reqLvl: 3, reqLic: 'basic' },
        { id: 3, title: 'Обычный: Электроника', reward: 25000, fuel: 220, duration: 60, reqLvl: 5, reqLic: 'basic' },
        { id: 4, title: 'Опасный: Химикаты', reward: 40000, fuel: 350, duration: 120, reqLvl: 6, reqLic: 'dangerous' },
        { id: 5, title: 'Опасный: Топливо', reward: 65000, fuel: 500, duration: 240, reqLvl: 8, reqLic: 'dangerous' },
        { id: 6, title: 'Опасный: Изотопы', reward: 90000, fuel: 700, duration: 360, reqLvl: 10, reqLic: 'dangerous' },
        { id: 7, title: 'Негабарит: Спецтехника', reward: 150000, fuel: 1000, duration: 600, reqLvl: 12, reqLic: 'oversized' },
        { id: 8, title: 'Негабарит: Турбины', reward: 280000, fuel: 1500, duration: 1200, reqLvl: 15, reqLic: 'oversized' },
        { id: 9, title: 'Негабарит: Ракета', reward: 500000, fuel: 2500, duration: 1800, reqLvl: 20, reqLic: 'oversized' }
    ]
};

// ============================================================================
// 🤖 ИИ ДИСПЕТЧЕР
// ============================================================================
const AIDispatcher = {
    messages: [
        "Босс, проверьте износ тормозов перед выездом!",
        "Цены на топливо меняются динамически. Закупайте на низах!",
        "Прокачайте узлы тягача, чтобы они изнашивались медленнее.",
        "Выполняйте ежедневные квесты для быстрого получения наград."
    ],
    showPopup(msg) {
        const el = document.getElementById('ai-dispatcher');
        if (!el) return;
        document.getElementById('ai-message').innerText = msg;
        el.classList.add('show');
        AudioSys.playVibrate('info');
        setTimeout(() => el.classList.remove('show'), 5000);
    },
    randomAdvice() {
        if(Math.random() > 0.6) this.showPopup(this.messages[Math.floor(Math.random() * this.messages.length)]);
    }
};

// ============================================================================
// 🗄️ ВЗАИМОДЕЙСТВИЕ С БАЗОЙ ДАННЫХ И РЕЙТИНГ
// ============================================================================
const DB = {
    async init() {
        try {
            let { data: existingPlayer, error: searchError } = await supabaseClient
                .from('players')
                .select('*')
                .eq('telegram_id', telegramId)
                .maybeSingle();

            if (searchError) throw searchError;

            if (!existingPlayer) {
                await this.createNewPlayer();
            } else {
                AppState.player = { ...AppState.player, ...existingPlayer };
                if (!AppState.player.pass_level) AppState.player.pass_level = 1;
                if (!AppState.player.pass_claimed) AppState.player.pass_claimed = [];
                if (!AppState.player.quests) {
                    AppState.player.quests = [
                        { id: 'q1', title: 'Завершить 3 рейса', target: 3, progress: 0, rewardCoins: 15000, rewardXP: 250, claimed: false },
                        { id: 'q2', title: 'Потратить 500л топлива', target: 500, progress: 0, rewardCoins: 20000, rewardXP: 400, claimed: false },
                        { id: 'q3', title: 'Заработать 50,000 🪙', target: 50000, progress: 0, rewardCoins: 30000, rewardXP: 600, claimed: false }
                    ];
                }
            }

            await this.loadGameData();
            await this.loadLeaderboard();
            AdminSys.checkAdminAccess();
            UI.renderAll();
        } catch (err) {
            UI.showToast("Ошибка соединения с БД: " + err.message, "error");
        }
    },

    async createNewPlayer() {
        let { data: newP, error: insertError } = await supabaseClient
            .from('players')
            .insert([{
                telegram_id: telegramId,
                name: AppState.player.name,
                avatar: AppState.player.avatar,
                money: AppState.player.money,
                fuel_stock: AppState.player.fuel_stock,
                level: AppState.player.level,
                xp: AppState.player.xp,
                total_trips: 0,
                licenses: ['basic'],
                pass_level: 1,
                pass_claimed: [],
                quests: AppState.player.quests
            }])
            .select()
            .single();

        if (insertError) throw insertError;

        if (newP) {
            AppState.player = { ...AppState.player, ...newP };
        }
    },

    async loadGameData() {
        try {
            const [trucksRes, tripRes] = await Promise.all([
                supabaseClient.from('trucks').select('*').eq('player_id', AppState.player.id),
                supabaseClient.from('active_trips').select('*').eq('player_id', AppState.player.id)
            ]);

            AppState.trucks = trucksRes.data || [];
            
            AppState.trucks.forEach(t => {
                if (t.engineLvl === undefined) t.engineLvl = 100;
                if (t.tiresLvl === undefined) t.tiresLvl = 100;
                if (t.gearLvl === undefined) t.gearLvl = 100;
                if (t.brakesLvl === undefined) t.brakesLvl = 100;
                if (t.engineLvlUpgrade === undefined) t.engineLvlUpgrade = 0;
                if (t.tiresLvlUpgrade === undefined) t.tiresLvlUpgrade = 0;
                if (t.gearLvlUpgrade === undefined) t.gearLvlUpgrade = 0;
                if (t.brakesLvlUpgrade === undefined) t.brakesLvlUpgrade = 0;
            });

            AppState.activeTrips = tripRes.data || [];
        } catch (e) {
            console.error('Ошибка загрузки данных:', e);
        }
    },

    async loadLeaderboard() {
        try {
            const { data, error } = await supabaseClient
                .from('players')
                .select('id, name, avatar, total_profit, level')
                .order('total_profit', { ascending: false })
                .limit(20);

            if (!error && data) AppState.leaderboard = data;
        } catch (e) {
            console.error('Ошибка загрузки таблицы лидеров:', e);
        }
    },

    async syncPlayer() {
        const p = AppState.player;
        if (!p.id) return;

        const updateData = {
            name: p.name, avatar: p.avatar, money: Number(p.money),
            fuel_stock: Number(p.fuel_stock), fuel_price: Number(p.fuel_price),
            level: Number(p.level), xp: Number(p.xp), total_profit: Number(p.total_profit),
            total_trips: Number(p.total_trips), syndicate: p.syndicate,
            last_bonus_time: Number(p.last_bonus_time), licenses: p.licenses,
            pass_level: p.pass_level, pass_claimed: p.pass_claimed, quests: p.quests
        };

        const { error } = await supabaseClient.from('players').update(updateData).eq('id', p.id);
        if (!error) this.loadLeaderboard();
    }
};

// ============================================================================
// 🎮 ИГРОВАЯ ЛОГИКА
// ============================================================================
const GameLogic = {
    isFinishing: false,

    getReqXP(lvl) { return Math.floor(1000 * Math.pow(1.5, lvl - 1)); },
    
    async addXP(amount) {
        AppState.player.xp = Number(AppState.player.xp) + Number(amount);
        let req = this.getReqXP(AppState.player.level);
        let leveledUp = false;

        while (AppState.player.xp >= req) {
            AppState.player.xp -= req;
            AppState.player.level = Number(AppState.player.level) + 1;
            AppState.player.pass_level = Number(AppState.player.pass_level) + 1;
            req = this.getReqXP(AppState.player.level);
            leveledUp = true;
        }

        if (leveledUp) {
            UI.showToast(`🎉 НОВЫЙ УРОВЕНЬ: ${AppState.player.level}!`, 'success');
        }
    },

    updateQuestProgress(type, amount) {
        if (!AppState.player.quests) return;
        AppState.player.quests.forEach(q => {
            if (q.claimed) return;
            if (type === 'trips' && q.id === 'q1') {
                q.progress = Math.min(q.target, q.progress + amount);
            }
            if (type === 'fuel' && q.id === 'q2') {
                q.progress = Math.min(q.target, q.progress + amount);
            }
            if (type === 'profit' && q.id === 'q3') {
                q.progress = Math.min(q.target, q.progress + amount);
            }
        });
    },

    claimQuest(qId) {
        const q = AppState.player.quests.find(item => item.id === qId);
        if (!q || q.claimed || q.progress < q.target) return;

        q.claimed = true;
        AppState.player.money += q.rewardCoins;
        this.addXP(q.rewardXP);
        DB.syncPlayer();

        UI.showToast(`Квест выполнен! +${q.rewardCoins.toLocaleString()} 🪙`, 'success');
        UI.renderAll();
    },

    async buyTruck(shopId) {
        const template = TRUCK_SHOP.find(t => t.id === shopId);
        if (!template) return;
        
        const alreadyOwned = AppState.trucks.some(t => t.name === template.name);
        if (alreadyOwned) {
            return UI.showToast('Этот транспорт уже есть в вашем автопарке!', 'error');
        }

        const currentMoney = Number(AppState.player.money) || 0;
        const truckPrice = Number(template.price) || 0;

        if (currentMoney < truckPrice) {
            return UI.showToast(`Нужно ${truckPrice.toLocaleString()} 🪙`, 'error');
        }

        AppState.player.money = currentMoney - truckPrice;
        
        let { data, error } = await supabaseClient.from('trucks').insert([{
            player_id: AppState.player.id,
            name: template.name,
            capacity: template.capacity,
            fuel_use: template.fuel_use,
            rarity: template.rarity,
            engineLvl: 100, tiresLvl: 100, gearLvl: 100, brakesLvl: 100,
            engineLvlUpgrade: 0, tiresLvlUpgrade: 0, gearLvlUpgrade: 0, brakesLvlUpgrade: 0
        }]).select().single();

        if (error) return UI.showToast("Ошибка при покупке фуры", "error");

        AppState.trucks.push(data);
        await DB.syncPlayer();
        UI.showToast(`Куплен новый транспорт: ${template.name}!`, 'success');
        UI.renderAll();
    },

    async startTrip(reward, fuel, duration, title, reqLvl, reqLic) {
        if (AppState.player.level < reqLvl) return UI.showToast(`Требуется уровень ${reqLvl}!`, 'error');
        if (!AppState.player.licenses.includes(reqLic)) return UI.showToast('Отсутствует нужная лицензия!', 'error');
        
        const activeTruckIds = AppState.activeTrips.map(t => t.truck_id);
        const idleTrucks = AppState.trucks.filter(t => !activeTruckIds.includes(t.id));

        if (idleTrucks.length === 0) return UI.showToast('Нет свободных тягажей в гараже!', 'error');

        const idleTruck = idleTrucks.find(t => t.engineLvl > 0 && t.tiresLvl > 0 && t.gearLvl > 0 && t.brakesLvl > 0);

        if (!idleTruck) {
            return UI.showToast('⚠️ Все свободные тягачи сломаны! Отремонтируйте их в гараже.', 'error');
        }

        if (WorldState.marketEvent.effect !== 'none' && title.includes(WorldState.marketEvent.effect)) {
            reward = Math.floor(reward * WorldState.marketEvent.multiplier);
        }

        let finalFuel = Math.floor(fuel * WorldState.weather.fuelMod);
        let finalDur = Math.floor(duration * WorldState.weather.timeMod);

        if (AppState.player.fuel_stock < finalFuel) return UI.showToast(`Нужно ${finalFuel}л топлива!`, 'error');

        let endTime = Date.now() + (finalDur * 1000);

        let { data, error } = await supabaseClient.from('active_trips').insert([{
            player_id: AppState.player.id,
            truck_id: idleTruck.id, 
            title: title,
            reward: reward,
            fuel_req: finalFuel,
            end_time: endTime
        }]).select().single();

        if (error) return UI.showToast("Ошибка запуска рейса: " + error.message, "error");

        AppState.player.fuel_stock = Number(AppState.player.fuel_stock) - finalFuel;
        this.updateQuestProgress('fuel', finalFuel);

        AppState.activeTrips.push(data);
        await DB.syncPlayer();
        UI.showToast(`Рейс начат на ${idleTruck.name}!`, 'success');
        UI.renderAll();
    },

    async finishTrip(tripId) {
        if (this.isFinishing) return;
        
        const tripIndex = AppState.activeTrips.findIndex(t => t.id === tripId);
        if (tripIndex === -1) return;
        const trip = AppState.activeTrips[tripIndex];

        this.isFinishing = true;
        
        let p = Number(trip.reward);
        let earnedXP = Math.floor(p * CONFIG.XP_MULTIPLIER);
        
        AppState.player.money = Number(AppState.player.money) + p;
        AppState.player.total_profit = Number(AppState.player.total_profit) + p;
        AppState.player.total_trips = Number(AppState.player.total_trips) + 1;

        this.updateQuestProgress('trips', 1);
        this.updateQuestProgress('profit', p);

        const truck = AppState.trucks.find(t => t.id === trip.truck_id);
        if (truck) {
            const baseWear = Math.floor(Math.random() * 6) + 5; 
            const wMod = WorldState.weather.wearMod;

            truck.engineLvl = Math.max(0, truck.engineLvl - Math.max(1, Math.floor(baseWear * wMod) - (truck.engineLvlUpgrade || 0)));
            truck.tiresLvl = Math.max(0, truck.tiresLvl - Math.max(1, Math.floor((baseWear + 3) * wMod) - (truck.tiresLvlUpgrade || 0)));
            truck.gearLvl = Math.max(0, truck.gearLvl - Math.max(1, Math.floor(baseWear * wMod) - (truck.gearLvlUpgrade || 0)));
            truck.brakesLvl = Math.max(0, truck.brakesLvl - Math.max(1, Math.floor((baseWear + 2) * wMod) - (truck.brakesLvlUpgrade || 0)));

            await supabaseClient.from('trucks').update({
                engineLvl: truck.engineLvl, tiresLvl: truck.tiresLvl,
                gearLvl: truck.gearLvl, brakesLvl: truck.brakesLvl
            }).eq('id', truck.id);
        }

        await this.addXP(earnedXP);
        await supabaseClient.from('active_trips').delete().eq('id', trip.id); 
        AppState.activeTrips.splice(tripIndex, 1);
        this.isFinishing = false;

        await DB.syncPlayer();
        UI.showToast(`Рейс завершен! +${p} 🪙 | +${earnedXP} XP`, 'success');
        AIDispatcher.randomAdvice();
        UI.renderAll();
    },

    async repairPart(truckId, partName) {
        const truck = AppState.trucks.find(t => String(t.id) === String(truckId));
        if (!truck) return UI.showToast('Тягач не найден в памяти!', 'error');

        const currentVal = Number(truck[partName]) || 0;
        if (currentVal >= 100) return UI.showToast('Узел в идеальном состоянии!', 'info');

        const missingPercent = 100 - currentVal;
        const repairCost = missingPercent * 150; 

        if (Number(AppState.player.money) < repairCost) {
            return UI.showToast(`Нужно ${repairCost.toLocaleString()} 🪙 для починки`, 'error');
        }

        AppState.player.money = Number(AppState.player.money) - repairCost;
        truck[partName] = 100;

        let { error } = await supabaseClient.from('trucks').update({ [partName]: 100 }).eq('id', truck.id);
        if (error) {
            return UI.showToast("Ошибка сохранения ремонта в базе", "error");
        }

        await DB.syncPlayer();
        UI.showToast(`Узел отремонтирован за ${repairCost.toLocaleString()} 🪙!`, 'success');
        UI.renderAll();
    },

    async upgradeTruckPart(truckId, partName) {
        const truck = AppState.trucks.find(t => String(t.id) === String(truckId));
        if (!truck) return;

        const upgradeKey = partName + 'Upgrade'; 
        if (truck[upgradeKey] === undefined) truck[upgradeKey] = 0;
        if (truck[upgradeKey] >= 5) return UI.showToast('Узел прокачан на максимум!', 'info');

        const cost = 25000 * (truck[upgradeKey] + 1); 
        if (AppState.player.money < cost) return UI.showToast(`Нужно ${cost.toLocaleString()} 🪙`, 'error');

        AppState.player.money -= cost;
        truck[upgradeKey] += 1;

        await supabaseClient.from('trucks').update({ [upgradeKey]: truck[upgradeKey] }).eq('id', truck.id);
        await DB.syncPlayer();

        UI.showToast(`Тюнинг установлен! Уровень: ${truck[upgradeKey]}/5`, 'success');
        UI.renderAll();
    },

    async buyFuel(amount) {
        const currentMoney = Number(AppState.player.money) || 0;
        const fuelPrice = Number(AppState.player.fuel_price) || 0;
        const cost = Number(amount) * fuelPrice;

        if (currentMoney < cost) {
            return UI.showToast('Недостаточно монет!', 'error');
        }
        
        AppState.player.money = currentMoney - cost;
        AppState.player.fuel_stock = Number(AppState.player.fuel_stock) + Number(amount);
        
        await DB.syncPlayer();
        UI.showToast(`Куплено ${amount}л топлива`, 'success');
        UI.renderAll();
    },

    async contributeToCoop(fuelAmount) {
        if (!AppState.player.syndicate) {
            return UI.showToast('Сначала вступите в корпорацию!', 'error');
        }
        
        if (AppState.player.fuel_stock < fuelAmount) {
            return UI.showToast(`Нужно ${fuelAmount}л топлива! У вас: ${AppState.player.fuel_stock}л`, 'error');
        }

        AppState.player.fuel_stock -= fuelAmount;
        AppState.syndicateData.current += fuelAmount;

        await DB.syncPlayer();
        UI.showToast(`Вы пожертвовали ${fuelAmount}л топлива!`, 'success');

        if (AppState.syndicateData.current >= AppState.syndicateData.target) {
            UI.showToast('🎉 Контракт ВЫПОЛНЕН! Вы получили премию!', 'success');
            AIDispatcher.showPopup("Орбитальная станция снабжена! Бонус зачислен.");
            AppState.player.money += AppState.syndicateData.reward;
            AppState.syndicateData.current = 0; 
            await DB.syncPlayer();
        }

        UI.renderAll();
    },

    async claimDailyBonus() {
        let now = Date.now();
        if (now - AppState.player.last_bonus_time < CONFIG.BONUS_COOLDOWN_MS) {
            let hours = Math.ceil((CONFIG.BONUS_COOLDOWN_MS - (now - AppState.player.last_bonus_time)) / 3600000);
            return UI.showToast(`Бонус будет доступен через ${hours} ч.`, 'error');
        }
        AppState.player.last_bonus_time = now;
        AppState.player.money = Number(AppState.player.money) + CONFIG.DAILY_BONUS_COINS;
        AppState.player.fuel_stock = Number(AppState.player.fuel_stock) + CONFIG.DAILY_BONUS_FUEL;
        await DB.syncPlayer();
        UI.showToast(`Бонус получен: +${CONFIG.DAILY_BONUS_COINS} 🪙, +${CONFIG.DAILY_BONUS_FUEL}л`, 'success');
        UI.renderAll();
    },

    async buyLicense(licId) {
        if (AppState.player.licenses.includes(licId)) return UI.showToast('Лицензия уже куплена!', 'info');
        const prices = { 'dangerous': 50000, 'oversized': 150000 };
        const cost = prices[licId];
        if (!cost) return;

        if (AppState.player.money < cost) return UI.showToast(`Нужно ${cost.toLocaleString()} 🪙`, 'error');

        AppState.player.money = Number(AppState.player.money) - cost;
        AppState.player.licenses.push(licId);
        
        await DB.syncPlayer();
        UI.showToast('Лицензия приобретена!', 'success');
        UI.renderAll();
    },

    async saveProfile() {
        let nameField = document.getElementById('input-username');
        let name = nameField ? nameField.value.trim() : '';
        if (name) {
            AppState.player.name = name;
            AdminSys.checkAdminAccess();
        }
        await DB.syncPlayer();
        UI.showToast('Профиль сохранен', 'success');
        UI.renderAll();
    },

    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) return UI.showToast('Файл слишком большой (макс. 2МБ)', 'error');
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            AppState.player.avatar = e.target.result;
            await DB.syncPlayer();
            UI.showToast('Аватар изменен!', 'success');
            UI.renderAll();
        };
        reader.readAsDataURL(file);
    },

    claimPassReward(tierLevel, coinReward) {
        if (!AppState.player.pass_level) AppState.player.pass_level = 1;
        if (!AppState.player.pass_claimed) AppState.player.pass_claimed = [];

        if (AppState.player.pass_level < tierLevel) return UI.showToast('Уровень пропуска не достигнут!', 'error');
        if (AppState.player.pass_claimed.includes(tierLevel)) return UI.showToast('Награда уже получена!', 'info');

        AppState.player.pass_claimed.push(tierLevel);
        AppState.player.money = Number(AppState.player.money) + Number(coinReward);
        DB.syncPlayer();

        UI.showToast(`Награда за пропуск получена: +${coinReward.toLocaleString()} 🪙!`, 'success');
        UI.renderAll();
    },

    async joinSyndicate(name) {
        if (AppState.player.syndicate === name) return UI.showToast('Вы уже в этом синдикате', 'info');
        AppState.player.syndicate = name;
        await DB.syncPlayer();
        UI.showToast(`Вы вступили в ${name}!`, 'success');
        UI.renderAll();
    },

    updateMarket() {
        const minPrice = 8;
        const maxPrice = 22;
        AppState.player.fuel_price = Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice;
        UI.renderAll();
    }
};

// ============================================================================
// 🎨 УПРАВЛЕНИЕ ИНТЕРФЕЙСОМ
// ============================================================================
const UI = {
    switchTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
        document.getElementById(`tab-${tabId}`).classList.add('active');
        document.querySelectorAll('.tab-btn').forEach(b => { if(b.getAttribute('onclick')?.includes(tabId)) b.classList.add('active'); });
        AudioSys.playVibrate('click');
        this.renderAll();
    },

    showToast(msg, type = 'success') {
        const c = document.getElementById('toast-container');
        if (!c) return;
        const t = document.createElement('div');
        t.className = `toast ${type}`; t.innerText = msg;
        c.appendChild(t);
        AudioSys.playVibrate(type);
        setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
    },

    safeUpdate(id, text) { const el = document.getElementById(id); if (el) el.innerText = text; },
    safeUpdateHTML(id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; },

    getHealthColor(val) {
        if (val > 60) return '#10B981'; 
        if (val > 25) return '#F59E0B'; 
        return '#EF4444'; 
    },

    renderAll() {
        const p = AppState.player;
        if (!p.pass_level) p.pass_level = 1;
        if (!p.pass_claimed) p.pass_claimed = [];
        
        this.safeUpdate('username', p.name);
        this.safeUpdate('user-money', `🪙 ${Number(p.money).toLocaleString()}`);
        this.safeUpdate('user-fuel-stock', `⛽ ${Number(p.fuel_stock)}л`);
        this.safeUpdate('user-level-badge', `LVL ${p.level}`);
        this.safeUpdate('current-fuel-price', `${p.fuel_price} 🪙 / л`);
        this.safeUpdate('pass-subtitle', `Ваш текущий уровень пропуска: ${p.pass_level}`);
        
        document.querySelectorAll('#user-avatar').forEach(img => {
            if (p.avatar) img.src = p.avatar;
        });
        
        this.safeUpdate('stat-total-profit', `${Number(p.total_profit).toLocaleString()} 🪙`);
        this.safeUpdate('stat-total-trips', p.total_trips);

        if (p.quests && p.quests.length > 0) {
            this.safeUpdateHTML('quests-list', p.quests.map(q => {
                const isCompleted = q.progress >= q.target;
                const btnText = q.claimed ? 'Получено' : (isCompleted ? 'Забрать награду' : `${q.progress} / ${q.target}`);
                return `
                <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 13px; font-weight: 700;">${q.title}</div>
                        <div style="font-size: 11px; color: var(--hint-color); margin-top: 2px;">Награда: +${q.rewardCoins.toLocaleString()} 🪙 | +${q.rewardXP} XP</div>
                    </div>
                    <button class="btn ${q.claimed ? 'btn-outline' : 'btn-primary'}" style="font-size: 11px; padding: 6px 10px; width: auto;" 
                        ${q.claimed || !isCompleted ? 'disabled' : ''} onclick="GameLogic.claimQuest('${q.id}')">
                        ${btnText}
                    </button>
                </div>`;
            }).join(''));
        }
        
        if(p.syndicate) {
            this.safeUpdate('corp-name', p.syndicate);
            this.safeUpdate('corp-role', 'Ваша должность: Логист');
            
            const syn = AppState.syndicateData;
            const pct = Math.min((syn.current / syn.target) * 100, 100).toFixed(1);
            
            this.safeUpdateHTML('coop-panel', `
                <h4>Поставка для орбитальной станции</h4>
                <p style="font-size:12px; color:var(--hint-color); margin: 4px 0;">Собрано топлива: ${syn.current.toLocaleString()} / ${syn.target.toLocaleString()} л</p>
                <div class="progress-bar-container" style="margin: 8px 0;">
                    <div class="progress-bar-fill" style="width: ${pct}%; background: var(--accent-blue); box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>
                </div>
                <button type="button" class="btn btn-primary" style="background: var(--accent-blue);" onclick="GameLogic.contributeToCoop(500)">
                    Пожертвовать 500л
                </button>
            `);
        } else {
            this.safeUpdate('corp-name', 'Синдикат не выбран');
            this.safeUpdate('corp-role', 'Вам нужно вступить в корпорацию.');
            this.safeUpdateHTML('coop-panel', `
                <p style="font-size:12px; color:var(--hint-color); text-align:center;">Контракты корпорации станут доступны после вступления в Синдикат.</p>
            `);
        }

        const xpProg = Math.min((p.xp / GameLogic.getReqXP(p.level)) * 100, 100);
        const xpFill = document.getElementById('xp-bar-fill');
        if (xpFill) xpFill.style.width = `${xpProg}%`;

        const activeTruckIds = AppState.activeTrips.map(trip => trip.truck_id);
        
        let fleetHtml = AppState.trucks.length > 0 ? AppState.trucks.map((t) => {
            const isBusy = activeTruckIds.includes(t.id);
            const statusHtml = isBusy ? `<span style="font-size:12px; color:#EF4444;">🔴 В рейсе</span>` : `<span style="font-size:12px; color:#10B981;">🟢 Свободна</span>`;
            
            const parts = [
                { key: 'engineLvl', name: '🛠 Двс' },
                { key: 'tiresLvl', name: '🛞 Шины' },
                { key: 'gearLvl', name: '⚙️ КПП' },
                { key: 'brakesLvl', name: '🧯 Торм' }
            ];

            return `
            <div class="card rarity-${t.rarity || 'common'}" style="margin-bottom: 12px;">
                <div class="card-title">
                    <span>🚚 ${t.name}</span>
                    ${statusHtml}
                </div>
                <div class="parts-grid">
                    ${parts.map(pt => {
                        const val = t[pt.key] !== undefined ? Number(t[pt.key]) : 100;
                        const upgradeLvl = t[pt.key + 'Upgrade'] || 0;
                        const color = this.getHealthColor(val);
                        const repairCost = (100 - val) * 150;
                        
                        let dotsHtml = '';
                        for(let i = 0; i < 5; i++) {
                            dotsHtml += `<div class="upgrade-dot ${i < upgradeLvl ? 'active' : ''}"></div>`;
                        }

                        return `
                        <div class="part-card">
                            <div class="part-header">
                                <span>${pt.name}</span>
                                <span style="color:${color};">${val}%</span>
                            </div>
                            <div class="part-bar">
                                <div class="part-bar-fill" style="width:${val}%; background-color:${color};"></div>
                            </div>
                            <div class="upgrade-track">${dotsHtml}</div>
                            <div style="display:flex; gap:4px; margin-top:6px;">
                                <button class="btn btn-outline btn-repair" style="flex:1; padding: 4px; pointer-events: auto;" ${isBusy || val === 100 ? 'disabled' : ''} onclick="GameLogic.repairPart('${t.id}', '${pt.key}')">
                                    ${val === 100 ? 'OK' : `${(repairCost/1000).toFixed(1)}k`}
                                </button>
                                <button class="btn btn-upgrade" style="flex:1; padding: 4px; pointer-events: auto;" ${isBusy || upgradeLvl >= 5 ? 'disabled' : ''} onclick="GameLogic.upgradeTruckPart('${t.id}', '${pt.key}')">
                                    ${upgradeLvl >= 5 ? 'MAX' : `UP`}
                                </button>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>`;
        }).join('') : `<p style="text-align:center; color:var(--hint-color); margin-bottom: 16px;">Ваш гараж пока пуст. Купите тягач в автосалоне ниже!</p>`;

        let shopHtml = `
        <h3 class="subsection-title" style="margin-top: 20px;">Автосалон</h3>
        <div class="card-grid">
            ${TRUCK_SHOP.map(shopT => {
                const alreadyOwned = AppState.trucks.some(t => t.name === shopT.name);
                return `
                <div class="card">
                    <div class="card-title">
                        <span>🚚 ${shopT.name}</span>
                        <span style="color:var(--accent-blue);">${shopT.price.toLocaleString()} 🪙</span>
                    </div>
                    <div class="specs-grid" style="margin-bottom:8px;">
                        <div>Вместимость: ${shopT.capacity}</div>
                        <div>Расход: ${shopT.fuel_use}л</div>
                    </div>
                    <button class="btn ${alreadyOwned ? 'btn-outline' : 'btn-primary'}" ${alreadyOwned ? 'disabled' : ''} onclick="GameLogic.buyTruck('${shopT.id}')">
                        ${alreadyOwned ? 'Куплено' : 'Купить машину'}
                    </button>
                </div>`;
            }).join('')}
        </div>`;

        this.safeUpdateHTML('fleet-list', fleetHtml + shopHtml);

        const allLic = [
            {id:'basic', n:'Базовая', cost: 0}, 
            {id:'dangerous', n:'Опасные грузы', cost: 50000}, 
            {id:'oversized', n:'Негабарит', cost: 150000}
        ];
        
        this.safeUpdateHTML('licenses-list', allLic.map(l => {
            const hasLicense = p.licenses.includes(l.id);
            if (hasLicense) return `<span class="license-badge active">${l.n}</span>`;
            else return `<span class="license-badge" onclick="GameLogic.buyLicense('${l.id}')" style="cursor:pointer; border-color: var(--accent-pink);">${l.n} 🔒 (${(l.cost / 1000)}k 🪙)</span>`;
        }).join(''));

        let tripsHtml = AppState.activeTrips.map(trip => {
            let left = Math.floor((trip.end_time - Date.now()) / 1000);
            if (left <= 0) {
                GameLogic.finishTrip(trip.id);
                return '';
            }
            const tripTruck = AppState.trucks.find(t => String(t.id) === String(trip.truck_id));
            const truckName = tripTruck ? tripTruck.name : 'Фура';
            
            return `<div class="card rarity-epic" style="margin-bottom: 12px; border-color: var(--accent-blue);">
                <div class="card-title"><span>🚚 ${truckName} в пути</span><span style="color:var(--accent-blue);">⏳ ${left} сек</span></div>
                <p style="font-size:12px; color:var(--hint-color);">${trip.title}</p>
            </div>`;
        }).join('');
        
        this.safeUpdateHTML('active-trip-panel', tripsHtml);

        const activeTruckIdsArr = AppState.activeTrips.map(trip => trip.truck_id);
        const hasIdleTrucks = AppState.trucks.some(t => !activeTruckIdsArr.includes(t.id) && Number(t.engineLvl) > 0 && Number(t.tiresLvl) > 0 && Number(t.gearLvl) > 0 && Number(t.brakesLvl) > 0);
        
        this.safeUpdateHTML('contracts-list', AppState.contracts.map(c => {
            const lockedLvl = p.level < c.reqLvl;
            const lockedLic = !p.licenses.includes(c.reqLic);
            const isLocked = lockedLvl || lockedLic;
            
            let currentReward = c.reward;
            if (WorldState.marketEvent.effect !== 'none' && c.title.includes(WorldState.marketEvent.effect)) {
                currentReward = Math.floor(currentReward * WorldState.marketEvent.multiplier);
            }

            let btnText = 'Начать рейс';
            if (lockedLvl) btnText = `Нужен Ур. ${c.reqLvl}`;
            else if (lockedLic) btnText = 'Нет лицензии';
            else if (!hasIdleTrucks) btnText = 'Нет готовых тягачей';

            return `<div class="card" style="${isLocked ? 'opacity:0.6' : ''}">
                <div class="card-title"><span>${c.title}</span><span style="color:var(--accent-pink);">+${currentReward.toLocaleString()} 🪙</span></div>
                <div class="specs-grid"><div>Время: ${c.duration}с</div><div>Топливо: ${c.fuel}л</div></div>
                <button class="btn btn-primary" ${!hasIdleTrucks || isLocked ? 'disabled' : ''} 
                    onclick="GameLogic.startTrip(${currentReward}, ${c.fuel}, ${c.duration}, '${c.title}', ${c.reqLvl}, '${c.reqLic}')">
                    ${btnText}
                </button>
            </div>`;
        }).join(''));

        this.safeUpdateHTML('leaderboard-list', AppState.leaderboard.map((user, index) => `
            <div class="card" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 15px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-weight: bold; font-size: 16px; color: ${index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : 'var(--hint-color)'};">#${index + 1}</span>
                    <img src="${user.avatar || 'https://via.placeholder.com/40'}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;" />
                    <div>
                        <div style="font-weight: 600; font-size: 14px;">${user.name}</div>
                        <div style="font-size: 11px; color: var(--hint-color);">Уровень: ${user.level}</div>
                    </div>
                </div>
                <div style="font-weight: bold; color: var(--accent-pink); font-size: 14px;">🪙 ${Number(user.total_profit).toLocaleString()}</div>
            </div>
        `).join(''));

        // Сезонный пропуск (Battle Pass) расширен до 30 уровней
        const passTiers = Array.from({ length: 30 }, (_, i) => {
            const lvl = i + 1;
            const rewardCoins = 10000 + (lvl - 1) * 20000;
            return {
                level: lvl,
                reward: rewardCoins,
                title: `Уровень ${lvl}: Этап Cyber Tokyo #${lvl}`
            };
        });

        this.safeUpdateHTML('pass-tiers-list', passTiers.map(tier => {
            const isReached = p.pass_level >= tier.level;
            const isClaimed = p.pass_claimed.includes(tier.level);
            
            return `<div class="card bp-card" style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <div class="card-title" style="margin-bottom:4px;"><span>${tier.title}</span></div>
                    <p style="font-size:12px; color:var(--hint-color);">Награда: +${tier.reward.toLocaleString()} 🪙</p>
                </div>
                <button class="btn ${isClaimed ? 'btn-outline' : 'btn-primary'}" 
                    style="font-size:12px; padding:8px 12px; width:auto;"
                    ${!isReached || isClaimed ? 'disabled' : ''}
                    onclick="GameLogic.claimPassReward(${tier.level}, ${tier.reward})">
                    ${isClaimed ? 'Получено' : (isReached ? 'Забрать' : `Нужен ур. ${tier.level}`)}
                </button>
            </div>`;
        }).join(''));
    }
};

// ============================================================================
// 🎮 ПАРАЛЛАКС И ЗАПУСК ИГРЫ
// ============================================================================
document.addEventListener('mousemove', (e) => {
    const bg = document.getElementById('parallax-bg');
    if (!bg) return;
    const x = (window.innerWidth - e.pageX * 2) / 90;
    const y = (window.innerHeight - e.pageY * 2) / 90;
    bg.style.transform = `translate(${x}px, ${y}px)`;
});

document.addEventListener('DOMContentLoaded', () => {
    WorldState.generateWeather();
    WorldState.generateMarketEvent();
    
    let p = 0;
    const loader = document.getElementById('loading-screen');
    if (loader) {
        const int = setInterval(() => {
            p += 20;
            document.getElementById('loader-progress').style.width = `${p}%`;
            document.getElementById('loader-percent').innerText = `${p}%`;
            if(p >= 100) {
                clearInterval(int);
                document.getElementById('loader-tap').style.display = 'block';
                loader.addEventListener('click', () => {
                    loader.style.opacity = '0';
                    document.getElementById('app-content').style.opacity = '1';
                    setTimeout(() => loader.remove(), 500);
                    
                    DB.init().then(() => {
                        setTimeout(() => {
                            if (AppState.trucks.length === 0) {
                                AIDispatcher.showPopup("Босс, гараж пуст! Зайдите в Автосалон и купите свой первый транспорт.");
                            } else {
                                AIDispatcher.showPopup("Добро пожаловать в Logistic World, Босс!");
                            }
                        }, 1500);
                    });
                });
            }
        }, 300);
    } else {
        DB.init();
    }

    setInterval(() => { if (AppState.activeTrips.length > 0) UI.renderAll(); }, 1000);
    setInterval(() => { WorldState.generateWeather(); AIDispatcher.randomAdvice(); }, 60000);
    setInterval(() => { GameLogic.updateMarket(); }, 120000);
    setInterval(() => { WorldState.generateMarketEvent(); }, 300000);
});

window.switchTab = (id) => UI.switchTab(id);
window.AudioSys = AudioSys;
window.AdminSys = AdminSys;
window.GameLogic = GameLogic;
window.UI = UI;
