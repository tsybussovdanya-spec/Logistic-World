// ============================================================================
// 🚀 ИНИЦИАЛИЗАЦИЯ TELEGRAM WEB APP И БАЗЫ ДАННЫХ
// ============================================================================
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

const CONFIG = {
    SUPABASE_URL: 'https://aiqlcndsayerxjtcwqbj.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_zKJ28h0HfzaojbT9s1uwmw_eX7UQZz0',
    XP_MULTIPLIER: 0.15, // Опыт = 15% от прибыли
    DAILY_BONUS_COINS: 15000,
    DAILY_BONUS_FUEL: 200,
    BONUS_COOLDOWN_MS: 86400000, // 24 часа
    TIPS: [
        "Дождь увеличивает износ шин и тормозов.",
        "Следите за коробкой передач: 0% износа блокирует рейсы!",
        "Ремонтируйте узлы вовремя, чтобы избежать поломки в пути."
    ]
};

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
// 🌍 ПОГОДА И ГЛОБАЛЬНЫЕ ИВЕНТЫ
// ============================================================================
const WorldState = {
    weather: { name: '☀️ Ясно', timeMod: 1.0, fuelMod: 1.0, wearMod: 1.0 },
    
    generateWeather() {
        const types = [
            { name: '☀️ Ясно', timeMod: 1.0, fuelMod: 1.0, wearMod: 1.0 },
            { name: '🔥 Жара', timeMod: 1.0, fuelMod: 1.2, wearMod: 1.2 },
            { name: '🌨 Снег', timeMod: 1.3, fuelMod: 1.1, wearMod: 1.4 },
            { name: '🌧 Ливень', timeMod: 1.1, fuelMod: 1.0, wearMod: 1.5 }
        ];
        this.weather = types[Math.floor(Math.random() * types.length)];
        UI.safeUpdate('weather-info', this.weather.name);
    }
};

// ============================================================================
// ⚙️ ГЛОБАЛЬНОЕ СОСТОЯНИЕ (STATE)
// ============================================================================
const AppState = {
    player: {
        id: null, name: tgUser?.first_name || 'Логист', avatar: tgUser?.photo_url || '',
        money: 35000, fuel_stock: 400, fuel_price: 12, level: 1, xp: 0,
        total_profit: 0, total_trips: 0, syndicate: null, last_bonus_time: 0,
        licenses: ['basic'], pass_level: 1, pass_claimed: []
    },
    trucks: [],
    activeTrip: null,
    leaderboard: [],
    contracts: [
        // 🟢 Обычные (Базовая лицензия)
        { id: 1, title: 'Обычный: Доски', reward: 5200, fuel: 70, duration: 15, reqLvl: 1, reqLic: 'basic' },
        { id: 2, title: 'Обычный: Стройматериалы', reward: 11500, fuel: 140, duration: 30, reqLvl: 3, reqLic: 'basic' },
        { id: 3, title: 'Обычный: Электроника', reward: 25000, fuel: 220, duration: 60, reqLvl: 5, reqLic: 'basic' },
        
        // 🟠 Опасные (Требуется лицензия)
        { id: 4, title: 'Опасный: Химикаты', reward: 40000, fuel: 350, duration: 120, reqLvl: 6, reqLic: 'dangerous' },
        { id: 5, title: 'Опасный: Топливо', reward: 65000, fuel: 500, duration: 240, reqLvl: 8, reqLic: 'dangerous' },
        { id: 6, title: 'Опасный: Изотопы', reward: 90000, fuel: 700, duration: 360, reqLvl: 10, reqLic: 'dangerous' },

        // 🟣 Негабаритные (Требуется лицензия)
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
        "Босс, проверить износ тормозов перед выездом!",
        "Цены на бирже изменились, проверьте вкладку!",
        "Ваш водитель готов к новому контракту.",
        "Не забывайте собирать ежедневный бонус."
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
            }

            await this.loadGameData();
            await this.loadLeaderboard();
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
                pass_claimed: []
            }])
            .select()
            .single();

        if (insertError) throw insertError;

        if (newP) {
            AppState.player = { ...AppState.player, ...newP };
            // Базовый тягач со 100% здоровьем узлов
            await supabaseClient.from('trucks').insert([{
                player_id: AppState.player.id,
                name: 'LW-CyberTruck Alpha',
                capacity: 5000,
                fuel_use: 45,
                engineLvl: 100,
                tiresLvl: 100,
                gearLvl: 100,
                brakesLvl: 100,
                rarity: 'common'
            }]);
        }
    },

    async loadGameData() {
        try {
            const [trucksRes, tripRes] = await Promise.all([
                supabaseClient.from('trucks').select('*').eq('player_id', AppState.player.id),
                supabaseClient.from('active_trips').select('*').eq('player_id', AppState.player.id).maybeSingle()
            ]);

            AppState.trucks = trucksRes.data || [];
            
            // Защита от старых записей без новых полей
            AppState.trucks.forEach(t => {
                if (t.engineLvl === undefined) t.engineLvl = 100;
                if (t.tiresLvl === undefined) t.tiresLvl = 100;
                if (t.gearLvl === undefined) t.gearLvl = 100;
                if (t.brakesLvl === undefined) t.brakesLvl = 100;
            });

            AppState.activeTrip = tripRes.data || null;
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
        if (!p.id) return UI.showToast("Ошибка: ID профиля не найден", "error");

        const updateData = {
            name: p.name,
            avatar: p.avatar,
            money: Number(p.money),
            fuel_stock: Number(p.fuel_stock),
            fuel_price: Number(p.fuel_price),
            level: Number(p.level),
            xp: Number(p.xp),
            total_profit: Number(p.total_profit),
            total_trips: Number(p.total_trips),
            syndicate: p.syndicate,
            last_bonus_time: Number(p.last_bonus_time),
            licenses: p.licenses,
            pass_level: p.pass_level,
            pass_claimed: p.pass_claimed
        };

        const { error } = await supabaseClient.from('players').update(updateData).eq('id', p.id);

        if (error) {
            UI.showToast("Ошибка БД: " + error.message, "error");
        } else {
            this.loadLeaderboard();
        }
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

    async startTrip(reward, fuel, duration, title, reqLvl, reqLic) {
        if (AppState.player.level < reqLvl) return UI.showToast(`Требуется уровень ${reqLvl}!`, 'error');
        if (!AppState.player.licenses.includes(reqLic)) return UI.showToast('Отсутствует нужная лицензия!', 'error');
        
        // Проверка состояния техники
        const mainTruck = AppState.trucks[0];
        if (mainTruck) {
            if (mainTruck.engineLvl <= 0 || mainTruck.tiresLvl <= 0 || mainTruck.gearLvl <= 0 || mainTruck.brakesLvl <= 0) {
                return UI.showToast('⚠️ Тягач сломан! Отремонтируйте узлы в Гараже!', 'error');
            }
        }

        let finalFuel = Math.floor(fuel * WorldState.weather.fuelMod);
        let finalDur = Math.floor(duration * WorldState.weather.timeMod);

        if (AppState.player.fuel_stock < finalFuel) return UI.showToast(`Нужно ${finalFuel}л топлива!`, 'error');

        let endTime = Date.now() + (finalDur * 1000);
        AppState.player.fuel_stock = Number(AppState.player.fuel_stock) - finalFuel;
        
        let { data, error } = await supabaseClient.from('active_trips').insert([{
            player_id: AppState.player.id,
            title: title,
            reward: reward,
            fuel_req: finalFuel,
            end_time: endTime
        }]).select().single();

        if (error) return UI.showToast("Ошибка запуска рейса", "error");

        AppState.activeTrip = data;
        await DB.syncPlayer();
        UI.showToast('Рейс начат! Удачной дороги!', 'success');
        UI.renderAll();
    },

    async finishTrip() {
        if (!AppState.activeTrip || this.isFinishing) return;
        this.isFinishing = true;
        
        let p = Number(AppState.activeTrip.reward);
        let earnedXP = Math.floor(p * CONFIG.XP_MULTIPLIER);
        
        AppState.player.money = Number(AppState.player.money) + p;
        AppState.player.total_profit = Number(AppState.player.total_profit) + p;
        AppState.player.total_trips = Number(AppState.player.total_trips) + 1;

        // Рассчитываем износ за рейс (зависит от погоды)
        const mainTruck = AppState.trucks[0];
        if (mainTruck) {
            const baseWear = Math.floor(Math.random() * 6) + 5; // 5-10% износа
            const wMod = WorldState.weather.wearMod;

            mainTruck.engineLvl = Math.max(0, mainTruck.engineLvl - Math.floor(baseWear * wMod));
            mainTruck.tiresLvl = Math.max(0, mainTruck.tiresLvl - Math.floor((baseWear + 3) * wMod));
            mainTruck.gearLvl = Math.max(0, mainTruck.gearLvl - Math.floor(baseWear * wMod));
            mainTruck.brakesLvl = Math.max(0, mainTruck.brakesLvl - Math.floor((baseWear + 2) * wMod));

            // Сохраняем состояние узлов грузовика в БД
            await supabaseClient.from('trucks').update({
                engineLvl: mainTruck.engineLvl,
                tiresLvl: mainTruck.tiresLvl,
                gearLvl: mainTruck.gearLvl,
                brakesLvl: mainTruck.brakesLvl
            }).eq('id', mainTruck.id);
        }

        await this.addXP(earnedXP);

        await supabaseClient.from('active_trips').delete().eq('player_id', AppState.player.id);
        AppState.activeTrip = null;
        this.isFinishing = false;

        await DB.syncPlayer();
        UI.showToast(`Рейс завершен! +${p} 🪙 | +${earnedXP} XP`, 'success');
        AIDispatcher.randomAdvice();
        UI.renderAll();
    },

    // 🔧 СИСТЕМА РЕМОНТА УЗЛОВ
    async repairPart(partName) {
        const truck = AppState.trucks[0];
        if (!truck) return;

        const currentVal = truck[partName] || 0;
        if (currentVal >= 100) return UI.showToast('Узел в идеальном состоянии!', 'info');

        // Стоимость ремонта зависит от того, насколько сильно изношена деталь
        const missing = 100 - currentVal;
        const repairCost = missing * 100; // 100 монет за 1% ремонта

        if (AppState.player.money < repairCost) {
            return UI.showToast(`Для ремонта нужно ${repairCost.toLocaleString()} 🪙`, 'error');
        }

        AppState.player.money -= repairCost;
        truck[partName] = 100;

        await supabaseClient.from('trucks').update({ [partName]: 100 }).eq('id', truck.id);
        await DB.syncPlayer();

        UI.showToast('Узел полностью отремонтирован!', 'success');
        UI.renderAll();
    },

    async buyFuel(amount) {
        let cost = amount * Number(AppState.player.fuel_price);
        if (AppState.player.money < cost) return UI.showToast('Недостаточно монет!', 'error');
        
        AppState.player.money -= cost;
        AppState.player.fuel_stock = Number(AppState.player.fuel_stock) + amount;
        await DB.syncPlayer();
        UI.showToast(`Куплено ${amount}л топлива`, 'success');
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
        let name = document.getElementById('input-username').value.trim();
        if (name) AppState.player.name = name;
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
        if (AppState.player.pass_level < tierLevel) return UI.showToast('Уровень пропуска не достигнут!', 'error');
        if (AppState.player.pass_claimed.includes(tierLevel)) return UI.showToast('Награда уже получена!', 'info');

        AppState.player.pass_claimed.push(tierLevel);
        AppState.player.money = Number(AppState.player.money) + Number(coinReward);
        DB.syncPlayer();

        UI.showToast(`Награда за пропуск полученa: +${coinReward} 🪙!`, 'success');
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

    // Вспомогательная функция цветного индикатора износа
    getHealthColor(val) {
        if (val > 60) return '#10B981'; // Зеленый
        if (val > 25) return '#F59E0B'; // Оранжевый
        return '#EF4444'; // Красный
    },

    renderAll() {
        const p = AppState.player;
        
        // Шапка и профиль
        this.safeUpdate('username', p.name);
        this.safeUpdate('user-money', `🪙 ${Number(p.money).toLocaleString()}`);
        this.safeUpdate('user-fuel-stock', `⛽ ${Number(p.fuel_stock)}л`);
        this.safeUpdate('user-level-badge', `LVL ${p.level}`);
        
        document.querySelectorAll('#user-avatar').forEach(img => {
            if (p.avatar) img.src = p.avatar;
        });
        
        this.safeUpdate('stat-total-profit', `${Number(p.total_profit).toLocaleString()} 🪙`);
        this.safeUpdate('stat-total-trips', p.total_trips);
        this.safeUpdate('fuel-price', `🪙 ${p.fuel_price}`);
        
        if(p.syndicate) {
            this.safeUpdate('corp-name', p.syndicate);
            this.safeUpdate('corp-role', 'Ваша должность: Логист');
        }

        const xpProg = Math.min((p.xp / GameLogic.getReqXP(p.level)) * 100, 100);
        const xpFill = document.getElementById('xp-bar-fill');
        if (xpFill) xpFill.style.width = `${xpProg}%`;

        // 🚛 ГЛАВНЫЙ ЭКРАН: АВТОПАРК И СИСТЕМА ДЕТАЛЕЙ (СТО)
        const t = AppState.trucks[0] || { name: 'LW-CyberTruck Alpha', engineLvl: 100, tiresLvl: 100, gearLvl: 100, brakesLvl: 100 };
        
        const parts = [
            { key: 'engineLvl', name: '🛠 Двигатель' },
            { key: 'tiresLvl', name: '🛞 Шины' },
            { key: 'gearLvl', name: '⚙️ Коробка передач' },
            { key: 'brakesLvl', name: '🧯 Тормоза' }
        ];

        this.safeUpdateHTML('fleet-list', `
            <div class="card rarity-epic">
                <div class="card-title">
                    <span>🚚 ${t.name}</span>
                    <span style="font-size:11px; color:var(--accent-pink);">ГЛАВНЫЙ ТЯГАЧ</span>
                </div>
                
                <p style="font-size:12px; color:var(--hint-color); margin-bottom: 8px;">Техническое состояние узлов:</p>

                <div class="parts-grid">
                    ${parts.map(pt => {
                        const val = t[pt.key] !== undefined ? t[pt.key] : 100;
                        const color = this.getHealthColor(val);
                        const cost = (100 - val) * 100;
                        
                        return `
                        <div class="part-card">
                            <div class="part-header">
                                <span>${pt.name}</span>
                                <span style="color:${color};">${val}%</span>
                            </div>
                            <div class="part-bar">
                                <div class="part-bar-fill" style="width:${val}%; background-color:${color};"></div>
                            </div>
                            ${val < 100 ? `
                                <button class="btn btn-outline btn-repair" onclick="GameLogic.repairPart('${pt.key}')">
                                    Ремонт (${cost.toLocaleString()} 🪙)
                                </button>
                            ` : `<span style="font-size:10px; color:var(--hint-color); text-align:center;">Исправен</span>`}
                        </div>`;
                    }).join('')}
                </div>
            </div>
        `);

        // Лицензии
        const allLic = [
            {id:'basic', n:'Базовая', cost: 0}, 
            {id:'dangerous', n:'Опасные грузы', cost: 50000}, 
            {id:'oversized', n:'Негабарит', cost: 150000}
        ];
        
        this.safeUpdateHTML('licenses-list', allLic.map(l => {
            const hasLicense = p.licenses.includes(l.id);
            if (hasLicense) {
                return `<span class="license-badge active">${l.n}</span>`;
            } else {
                return `<span class="license-badge" onclick="GameLogic.buyLicense('${l.id}')" style="cursor:pointer; border-color: var(--accent-pink);">
                    ${l.n} 🔒 (${(l.cost / 1000)}k 🪙)
                </span>`;
            }
        }).join(''));

        // Активный рейс
        let tripHtml = '';
        if (AppState.activeTrip) {
            let left = Math.floor((AppState.activeTrip.end_time - Date.now()) / 1000);
            if (left > 0) {
                tripHtml = `<div class="card rarity-epic">
                    <div class="card-title"><span>🚚 В рейсе...</span><span style="color:var(--accent-pink);">⏳ ${left} сек</span></div>
                    <p style="font-size:12px; color:var(--hint-color);">${AppState.activeTrip.title}</p>
                </div>`;
            } else GameLogic.finishTrip();
        }
        this.safeUpdateHTML('active-trip-panel', tripHtml);

        // Контракты
        this.safeUpdateHTML('contracts-list', AppState.contracts.map(c => {
            const lockedLvl = p.level < c.reqLvl;
            const lockedLic = !p.licenses.includes(c.reqLic);
            const isLocked = lockedLvl || lockedLic;
            
            return `<div class="card" style="${isLocked ? 'opacity:0.6' : ''}">
                <div class="card-title"><span>${c.title}</span><span style="color:var(--accent-pink);">+${c.reward.toLocaleString()} 🪙</span></div>
                <div class="specs-grid"><div>Время: ${c.duration}с</div><div>Топливо: ${c.fuel}л</div></div>
                <button class="btn btn-primary" ${AppState.activeTrip || isLocked ? 'disabled' : ''} 
                    onclick="GameLogic.startTrip(${c.reward}, ${c.fuel}, ${c.duration}, '${c.title}', ${c.reqLvl}, '${c.reqLic}')">
                    ${lockedLvl ? `Нужен Ур. ${c.reqLvl}` : (lockedLic ? 'Нет лицензии' : (AppState.activeTrip ? 'Транспорт занят' : 'Начать рейс'))}
                </button>
            </div>`;
        }).join(''));

        // 🏆 Таблица лидеров
        this.safeUpdateHTML('leaderboard-list', AppState.leaderboard.map((user, index) => `
            <div class="card" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 15px; margin-bottom: 6px;">
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

        // 🎫 Сезонный пропуск
        const passTiers = [
            { level: 1, reward: 10000, title: 'Уровень 1: Старт Cyber Tokyo' },
            { level: 3, reward: 25000, title: 'Уровень 3: Неоновый обвес' },
            { level: 5, reward: 60000, title: 'Уровень 5: Элитный скин фуры' }
        ];

        this.safeUpdateHTML('pass-tiers-list', passTiers.map(tier => {
            const isReached = p.pass_level >= tier.level;
            const isClaimed = p.pass_claimed.includes(tier.level);
            
            return `<div class="card" style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <div class="card-title"><span>${tier.title}</span></div>
                    <p style="font-size:12px; color:var(--hint-color);">Награда: +${tier.reward.toLocaleString()} 🪙</p>
                </div>
                <button class="btn ${isClaimed ? 'btn-outline' : 'btn-primary'}" 
                    style="font-size:12px; padding:8px 12px;"
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
                    
                    DB.init();
                    setTimeout(() => AIDispatcher.showPopup("Добро пожаловать в Logistic World, Босс!"), 1500);
                });
            }
        }, 300);
    } else {
        DB.init();
    }

    setInterval(() => { if (AppState.activeTrip) UI.renderAll(); }, 1000);
    setInterval(() => { WorldState.generateWeather(); AIDispatcher.randomAdvice(); }, 60000);
    setInterval(() => { GameLogic.updateMarket(); }, 120000);
});

// Глобальные прокси
window.switchTab = (id) => UI.switchTab(id);
window.AudioSys = AudioSys;
window.GameLogic = GameLogic;
window.UI = UI;
