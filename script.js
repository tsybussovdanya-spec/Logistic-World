// ============================================================================
// 🚀 ИНИЦИАЛИЗАЦИЯ TELEGRAM WEB APP
// ============================================================================
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// ============================================================================
// ⚙️ КОНФИГУРАЦИЯ И ГЛОБАЛЬНОЕ СОСТОЯНИЕ (STATE)
// ============================================================================
const CONFIG = {
    SUPABASE_URL: 'https://aiqlcndsayerxjtcwqbj.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_zKJ28h0HfzaojbT9s1uwmw_eX7UQZz0',
    REPAIR_COST: 2000,
    GARAGE_UPGRADE_MULTIPLIER: 10000,
    DAILY_BONUS_COINS: 15000,
    DAILY_BONUS_FUEL: 200,
    BONUS_COOLDOWN_MS: 86400000,
    XP_MULTIPLIER: 0.15 // Опыт = 15% от прибыли за рейс
};

const supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
const tgUser = tg.initDataUnsafe?.user;
const telegramId = tgUser?.id ? Number(tgUser.id) : 123456789;

const AppState = {
    player: {
        id: null,
        name: tgUser?.first_name || 'Логист #777',
        avatar: tgUser?.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        money: 35000,
        fuel_stock: 400,
        fuel_price: 12, 
        syndicate: null,
        garage_level: 1,
        total_profit: 0,
        last_bonus_time: 0,
        level: 1,
        xp: 0
    },
    trucks: [],
    activeTrip: null,
    p2pMarket: [],
    leaderboard: [],
    contracts: [
        { id: 1, title: 'Обычный: Доставка микросхем', reward: 5200, fuel_cost_req: 70, duration: 15, min_level: 1 },
        { id: 2, title: 'Срочный: Квантовые батареи', reward: 11500, fuel_cost_req: 140, duration: 30, min_level: 3 },
        { id: 3, title: 'Нелегальный: Нейромодули', reward: 24000, fuel_cost_req: 260, duration: 60, min_level: 5 }
    ],
    gameLoopTimer: null,
    marketTimer: null
};

// ============================================================================
// 🗄️ ВЗАИМОДЕЙСТВИЕ С БАЗОЙ ДАННЫХ (API)
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
                AppState.player = existingPlayer;
            }

            await this.loadGameData();
            GameLogic.updateMarketPrices();
            UI.renderAll();
        } catch (err) {
            tg.showAlert("Критическая ошибка БД: " + err.message);
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
                garage_level: AppState.player.garage_level,
                level: AppState.player.level,
                xp: AppState.player.xp
            }])
            .select()
            .single();

        if (insertError) throw insertError;

        if (newP) {
            AppState.player = newP;
            await supabaseClient.from('trucks').insert([{
                player_id: AppState.player.id,
                name: 'LW-CyberTruck Alpha',
                capacity: 5000,
                fuel_use: 45,
                engine_wear: 100,
                tires_wear: 100
            }]);
        }
    },

    async loadGameData() {
        try {
            const [trucksRes, tripRes, marketRes, leadRes] = await Promise.all([
                supabaseClient.from('trucks').select('*').eq('player_id', AppState.player.id),
                supabaseClient.from('active_trips').select('*').eq('player_id', AppState.player.id).maybeSingle(),
                supabaseClient.from('p2p_market').select('*').order('id', { ascending: false }),
                supabaseClient.from('players').select('name, total_profit').order('total_profit', { ascending: false }).limit(10)
            ]);

            AppState.trucks = trucksRes.data || [];
            AppState.activeTrip = tripRes.data || null;
            AppState.p2pMarket = marketRes.data || [];
            AppState.leaderboard = leadRes.data || [];
        } catch (e) {
            console.error('Ошибка загрузки данных:', e);
        }
    },

    async syncPlayer() {
        const { id, ...updateData } = AppState.player;
        await supabaseClient.from('players').update(updateData).eq('id', id);
    }
};

// ============================================================================
// 🎮 ИГРОВАЯ ЛОГИКА (GAME ENGINE)
// ============================================================================
const GameLogic = {
    getRequiredXP(level) {
        return Math.floor(1000 * Math.pow(1.5, level - 1));
    },

    getRankName(level) {
        if (level < 3) return "Курьер-Новичок";
        if (level < 5) return "Кибер-Драйвер";
        if (level < 10) return "Опытный Логист";
        if (level < 20) return "Глава Синдиката";
        return "Владелец Корпорации";
    },

    async addXP(earnedXP) {
        AppState.player.xp += earnedXP;
        let requiredXP = this.getRequiredXP(AppState.player.level);
        let leveledUp = false;

        while (AppState.player.xp >= requiredXP) {
            AppState.player.xp -= requiredXP;
            AppState.player.level++;
            requiredXP = this.getRequiredXP(AppState.player.level);
            leveledUp = true;
            AppState.player.money += 5000 * AppState.player.level;
        }

        if (leveledUp) {
            if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
            tg.showAlert(`🎉 НОВЫЙ УРОВЕНЬ: ${AppState.player.level}!\n\nВы достигли звания: ${this.getRankName(AppState.player.level)}\nНаграда начислена.`);
            
            const avatarWrap = document.querySelector('.avatar-wrapper');
            if (avatarWrap) {
                avatarWrap.classList.add('level-up-anim');
                setTimeout(() => avatarWrap.classList.remove('level-up-anim'), 1000);
            }
        }
    },

    updateMarketPrices() {
        const minPrice = 8;
        const maxPrice = 22;
        AppState.player.fuel_price = Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice;
        UI.renderAll();
    },

    async startTrip(reward, fuelReq, duration, title, minLevel) {
        if (AppState.player.level < minLevel) {
            tg.showAlert(`🔒 Этот контракт доступен только с ${minLevel} уровня!`);
            if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
            return;
        }

        if (AppState.player.fuel_stock < fuelReq) {
            tg.showAlert('⛽ Недостаточно топлива на складе!');
            if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
            return;
        }

        let endTime = Date.now() + (duration * 1000);
        AppState.player.fuel_stock -= fuelReq;
        
        let { data, error } = await supabaseClient.from('active_trips').insert([{
            player_id: AppState.player.id,
            title: title,
            reward: reward,
            fuel_req: fuelReq,
            end_time: endTime
        }]).select().single();

        if (error) {
            tg.showAlert("Ошибка запуска рейса!");
            return;
        }

        AppState.activeTrip = data;
        await DB.syncPlayer();
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
        UI.renderAll();
    },

    async finishTrip() {
        if (!AppState.activeTrip) return;
        
        let syndicateTax = AppState.player.syndicate ? AppState.activeTrip.reward * 0.05 : 0;
        let netProfit = Math.round(AppState.activeTrip.reward - syndicateTax);
        let earnedXP = Math.floor(netProfit * CONFIG.XP_MULTIPLIER);

        AppState.player.money += netProfit;
        AppState.player.total_profit += netProfit;

        await this.addXP(earnedXP);

        await supabaseClient.from('active_trips').delete().eq('player_id', AppState.player.id);
        AppState.activeTrip = null;

        await DB.syncPlayer();
        tg.showAlert(`✅ Рейс завершен!\n\nПрибыль: +${netProfit.toLocaleString()} 🪙\nОпыт: +${earnedXP} XP`);
        if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
        await DB.loadGameData();
        UI.renderAll();
    },

    async buyFuel(amount) {
        let cost = amount * AppState.player.fuel_price;
        if (AppState.player.money < cost) { 
            tg.showAlert('🪙 Недостаточно монет!'); 
            if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('error');
            return; 
        }
        AppState.player.money -= cost;
        AppState.player.fuel_stock += amount;
        await DB.syncPlayer();
        if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
        UI.renderAll();
    },

    async repairTruck(id) {
        if (AppState.player.money < CONFIG.REPAIR_COST) { 
            tg.showAlert('🪙 Недостаточно средств для ремонта!'); 
            return; 
        }
        AppState.player.money -= CONFIG.REPAIR_COST;
        await supabaseClient.from('trucks').update({ engine_wear: 100, tires_wear: 100 }).eq('id', id);
        await DB.syncPlayer();
        await DB.loadGameData();
        tg.showAlert('🔧 Узлы транспорта восстановлены!');
        UI.renderAll();
    },

    async upgradeGarage() {
        let cost = AppState.player.garage_level * CONFIG.GARAGE_UPGRADE_MULTIPLIER;
        if (AppState.player.money < cost) { 
            tg.showAlert('🪙 Недостаточно средств!'); 
            return; 
        }
        AppState.player.money -= cost;
        AppState.player.garage_level++;
        await DB.syncPlayer();
        tg.showAlert('🏗 Гараж успешно модернизирован!');
        UI.renderAll();
    },

    async createP2PLot() {
        let name = document.getElementById('p2p-item-name').value.trim();
        let price = parseInt(document.getElementById('p2p-item-price').value);
        if (!name || isNaN(price) || price <= 0) { 
            tg.showAlert('⚠️ Заполните корректные данные лота!'); 
            return; 
        }
        await supabaseClient.from('p2p_market').insert([{
            seller_name: AppState.player.name,
            item_name: name,
            price: price
        }]);
        document.getElementById('p2p-item-name').value = '';
        document.getElementById('p2p-item-price').value = '';
        tg.showAlert('📦 Лот успешно выставлен на рынок!');
        await DB.loadGameData();
        UI.renderAll();
    },

    async buyP2PLot(lotId, price) {
        if (AppState.player.money < price) { 
            tg.showAlert('🪙 Недостаточно средств!'); 
            return; 
        }
        AppState.player.money -= price;
        await supabaseClient.from('p2p_market').delete().eq('id', lotId);
        await DB.syncPlayer();
        await DB.loadGameData();
        tg.showAlert('🤝 Вы успешно приобрели лот!');
        UI.renderAll();
    },

    async claimDailyBonus() {
        let now = Date.now();
        let timePassed = now - AppState.player.last_bonus_time;
        if (timePassed < CONFIG.BONUS_COOLDOWN_MS) {
            let hours = Math.ceil((CONFIG.BONUS_COOLDOWN_MS - timePassed) / 3600000);
            tg.showAlert(`⏳ Бонус уже получен. Следующий доступен через ${hours} ч.`);
            return;
        }
        AppState.player.last_bonus_time = now;
        AppState.player.money += CONFIG.DAILY_BONUS_COINS;
        AppState.player.fuel_stock += CONFIG.DAILY_BONUS_FUEL;
        await DB.syncPlayer();
        tg.showAlert(`🎁 Вы забрали бонус:\n+${CONFIG.DAILY_BONUS_COINS.toLocaleString()} 🪙\n+${CONFIG.DAILY_BONUS_FUEL}л ⛽`);
        UI.renderAll();
    },

    async saveProfile() {
        let name = document.getElementById('input-username').value.trim();
        let avatar = document.getElementById('input-avatar').value.trim();
        if (name) AppState.player.name = name;
        if (avatar) AppState.player.avatar = avatar;
        await DB.syncPlayer();
        tg.showAlert('👤 Профиль успешно обновлен!');
        UI.renderAll();
    },

    async joinSyndicate(name) {
        AppState.player.syndicate = name;
        await DB.syncPlayer();
        tg.showAlert(`🦅 Вы вступили в синдикат "${name}"!\nНалог на прибыль снижен до 5%.`);
        UI.renderAll();
    }
};

// ============================================================================
// 🎨 УПРАВЛЕНИЕ ИНТЕРФЕЙСОМ (UI)
// ============================================================================
const UI = {
    switchTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
        const targetTab = document.getElementById(`tab-${tabId}`);
        if(targetTab) targetTab.classList.add('active');
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if(btn.getAttribute('onclick')?.includes(tabId)) btn.classList.add('active');
        });
        if (tg.HapticFeedback) tg.HapticFeedback.selectionChanged();
        this.renderAll();
    },

    renderAll() {
        const { player, trucks, activeTrip, contracts, p2pMarket, leaderboard } = AppState;

        this.safeUpdate('username', player.name);
        this.safeUpdateImg('header-avatar', player.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100');
        this.safeUpdate('user-money', `🪙 ${Number(player.money).toLocaleString()}`);
        this.safeUpdate('user-fuel-stock', `⛽ ${player.fuel_stock}л`);
        
        this.safeUpdate('user-level-badge', `LVL ${player.level}`);
        const requiredXP = GameLogic.getRequiredXP(player.level);
        const xpProgress = Math.min((player.xp / requiredXP) * 100, 100);
        const xpBarFill = document.getElementById('xp-bar-fill');
        if (xpBarFill) xpBarFill.style.width = `${xpProgress}%`;

        this.safeUpdate('fuel-price', `🪙 ${player.fuel_price}`);
        this.safeUpdate('syndicate-info', player.syndicate || 'Одиночка');

        this.safeUpdate('garage-lvl', player.garage_level);
        this.safeUpdate('garage-cost', (player.garage_level * CONFIG.GARAGE_UPGRADE_MULTIPLIER).toLocaleString());

        this.safeUpdateInput('input-username', player.name);
        this.safeUpdateInput('input-avatar', player.avatar || '');
        this.safeUpdate('syndicate-desc', player.syndicate ? `Синдикат: ${player.syndicate}\nЗвание: ${GameLogic.getRankName(player.level)}` : `Статус: Одиночка\nЗвание: ${GameLogic.getRankName(player.level)}`);

        const fleetHtml = trucks.map(t => `
            <div class="card">
                <div class="card-title"><span>${t.name}</span></div>
                <div class="specs-grid">
                    <div>Груз: ${t.capacity}кг</div>
                    <div>Расход: ${t.fuel_use}л</div>
                    <div>Двигатель: <span style="color:${t.engine_wear < 50 ? 'var(--accent-pink)' : 'inherit'}">${t.engine_wear}%</span></div>
                    <div>Шины: <span style="color:${t.tires_wear < 50 ? 'var(--accent-pink)' : 'inherit'}">${t.tires_wear}%</span></div>
                </div>
                <button type="button" class="btn btn-primary" onclick="GameLogic.repairTruck(${t.id})">Ремонт (🪙 ${CONFIG.REPAIR_COST.toLocaleString()})</button>
            </div>
        `).join('');
        this.safeUpdateHTML('fleet-list', fleetHtml);

        let tripPanelHtml = '';
        if (activeTrip) {
            let timeLeft = Math.floor((activeTrip.end_time - Date.now()) / 1000);
            if (timeLeft > 0) {
                tripPanelHtml = `
                    <div class="card" style="border-color:var(--accent-pink); background: rgba(236, 72, 153, 0.05);">
                        <div class="card-title"><span>🚚 Транспорт в рейсе...</span><span style="color:var(--accent-pink);">⏳ ${timeLeft} сек</span></div>
                        <p style="font-size:12px; color:var(--hint-color); margin-top:8px;">${activeTrip.title}</p>
                    </div>
                `;
            } else {
                GameLogic.finishTrip();
            }
        }
        this.safeUpdateHTML('active-trip-panel', tripPanelHtml);

        const contractsHtml = contracts.map(c => {
            const isLocked = player.level < c.min_level;
            return `
            <div class="card" style="${isLocked ? 'opacity: 0.6;' : ''}">
                <div class="card-title">
                    <span>${c.title}</span>
                    <span style="color:var(--accent-pink);">+${c.reward.toLocaleString()} 🪙</span>
                </div>
                <div class="specs-grid">
                    <div>Время: ${c.duration} сек</div>
                    <div>Топливо: ${c.fuel_cost_req}л</div>
                </div>
                <button type="button" class="btn btn-primary" 
                        ${activeTrip || isLocked ? 'disabled style="cursor:not-allowed;"' : ''} 
                        onclick="GameLogic.startTrip(${c.reward}, ${c.fuel_cost_req}, ${c.duration}, '${c.title}', ${c.min_level})">
                    ${isLocked ? `Требуется Ур. ${c.min_level}` : (activeTrip ? 'Грузовик занят' : 'Начать рейс')}
                </button>
            </div>
            `;
        }).join('');
        this.safeUpdateHTML('contracts-list', contractsHtml);

        const p2pHtml = p2pMarket.length > 0 ? p2pMarket.map(m => `
            <div class="card">
                <div class="card-title"><span>${m.item_name}</span><span>🪙 ${Number(m.price).toLocaleString()}</span></div>
                <div style="font-size:11px; color:var(--hint-color); margin-bottom: 12px;">Продавец: ${m.seller_name}</div>
                <button type="button" class="btn btn-outline" onclick="GameLogic.buyP2PLot(${m.id}, ${m.price})">Купить лот</button>
            </div>
        `).join('') : '<div style="text-align:center; color:var(--hint-color); padding: 20px;">Лотов пока нет. Будьте первыми!</div>';
        this.safeUpdateHTML('p2p-list', p2pHtml);

        const leaderboardHtml = leaderboard.map((l, index) => `
            <div class="leaderboard-row">
                <span><b style="color:var(--accent-pink); margin-right:8px;">#${index + 1}</b> ${l.name}</span>
                <span style="color:var(--accent-pink); font-weight:600;">🪙 ${Number(l.total_profit).toLocaleString()}</span>
            </div>
        `).join('');
        this.safeUpdateHTML('leaderboard-list', leaderboardHtml);
    },

    safeUpdate(id, text) { const el = document.getElementById(id); if (el) el.innerText = text; },
    safeUpdateHTML(id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; },
    safeUpdateInput(id, val) { const el = document.getElementById(id); if (el) el.value = val; },
    safeUpdateImg(id, src) { const el = document.getElementById(id); if (el) el.src = src; }
};

// ============================================================================
// 🔄 ЗАПУСК ПРИЛОЖЕНИЯ
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    DB.init();
    
    AppState.gameLoopTimer = setInterval(() => {
        if (AppState.activeTrip) UI.renderAll(); 
    }, 1000);

    AppState.marketTimer = setInterval(() => {
        GameLogic.updateMarketPrices();
    }, 120000);
});

window.switchTab = (tabId) => UI.switchTab(tabId);
window.buyFuel = (amount) => GameLogic.buyFuel(amount);
window.repairTruck = (id) => GameLogic.repairTruck(id);
window.upgradeGarage = () => GameLogic.upgradeGarage();
window.createP2PLot = () => GameLogic.createP2PLot();
window.buyP2PLot = (lotId, price) => GameLogic.buyP2PLot(lotId, price);
window.claimDailyBonus = () => GameLogic.claimDailyBonus();
window.saveProfile = () => GameLogic.saveProfile();
window.joinSyndicate = (name) => GameLogic.joinSyndicate(name);
