
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

const CONFIG = {
    SUPABASE_URL: 'https://aiqlcndsayerxjtcwqbj.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_zKJ28h0HfzaojbT9s1uwmw_eX7UQZz0',
    XP_MULTIPLIER: 0.2
};

const supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
const tgUser = tg.initDataUnsafe?.user;
const telegramId = tgUser?.id ? Number(tgUser.id) : 99999999;

const WorldMapSys = {
    currentCity: 'mow',
    cities: {
        'ber': { name: 'Берлин', x: 250, y: 300, fuelPrice: 20, icon: '🏛️' },
        'mow': { name: 'Москва', x: 450, y: 220, fuelPrice: 12, icon: '🏙️' },
        'kst': { name: 'Костанай', x: 600, y: 250, fuelPrice: 8, icon: '🏭' },
        'pek': { name: 'Пекин', x: 1050, y: 400, fuelPrice: 15, icon: '🏯' },
        'par': { name: 'Париж', x: 180, y: 360, fuelPrice: 22, icon: '🗼' },
        'lon': { name: 'Лондон', x: 140, y: 250, fuelPrice: 25, icon: '🎡' },
        'ast': { name: 'Астана', x: 720, y: 300, fuelPrice: 9, icon: '🏙️' },
        'dxb': { name: 'Дубай', x: 650, y: 650, fuelPrice: 7, icon: '💎' },
        'nyc': { name: 'Нью-Йорк', x: 150, y: 300, fuelPrice: 18, icon: '🗽' },
        'tyo': { name: 'Токио', x: 1250, y: 380, fuelPrice: 19, icon: '🗼' }
    },
    getRoutes() {
        return [
            { from: 'ber', to: 'mow', dist: 1800 },
            { from: 'mow', to: 'kst', dist: 2100 },
            { from: 'kst', to: 'ast', dist: 800 },
            { from: 'ast', to: 'pek', dist: 3500 },
            { from: 'lon', to: 'par', dist: 400 },
            { from: 'par', to: 'ber', dist: 1100 },
            { from: 'kst', to: 'dxb', dist: 4200 },
            { from: 'pek', to: 'tyo', dist: 2100 }
        ];
    },
    renderMap() {
        const canvas = document.getElementById('map-canvas');
        if(!canvas) return;
        let svg = `<svg style="position:absolute;top:0;left:0;width:1400px;height:800px;z-index:1;pointer-events:none;">`;
        this.getRoutes().forEach(r => {
            let c1 = this.cities[r.from], c2 = this.cities[r.to];
            if(c1 && c2) svg += `<line x1="${c1.x}" y1="${c1.y}" x2="${c2.x}" y2="${c2.y}" stroke="#0070F3" stroke-width="2.5" opacity="0.5"/>`;
        });
        svg += `</svg>`;

        let nodes = '';
        for(let k in this.cities) {
            let c = this.cities[k], active = this.currentCity === k;
            nodes += `<div class="map-node ${active?'active-node':''}" style="top:${c.y}px;left:${c.x}px;" onclick="WorldMapSys.selectCity('${k}')">
                <div class="node-icon">${c.icon}</div><div class="node-label">${c.name}</div>
            </div>`;
        }
        canvas.innerHTML = `<div class="map-bg"></div>` + svg + nodes;
        UI.safeUpdate('selected-region-title', `📍 Узел: ${this.cities[this.currentCity].name} | Топливо: ${this.cities[this.currentCity].fuelPrice} 🪙/л`);
    },
    selectCity(id) {
        this.currentCity = id;
        AppState.player.fuel_price = this.cities[id].fuelPrice;
        this.renderMap();
        UI.renderAll();
    },
    initDrag() {
        const c = document.getElementById('map-scroll-container');
        if(!c) return;
        let isDown = false, startX, startY, sl, st;
        c.addEventListener('mousedown', e => { isDown = true; startX = e.pageX - c.offsetLeft; startY = e.pageY - c.offsetTop; sl = c.scrollLeft; st = c.scrollTop; });
        window.addEventListener('mouseup', () => isDown = false);
        c.addEventListener('mousemove', e => { if(!isDown) return; c.scrollLeft = sl - (e.pageX - c.offsetLeft - startX); c.scrollTop = st - (e.pageY - c.offsetTop - startY); });
        
        c.addEventListener('touchstart', e => { isDown = true; startX = e.touches[0].pageX - c.offsetLeft; startY = e.touches[0].pageY - c.offsetTop; sl = c.scrollLeft; st = c.scrollTop; });
        window.addEventListener('touchend', () => isDown = false);
        c.addEventListener('touchmove', e => { if(!isDown) return; c.scrollLeft = sl - (e.touches[0].pageX - c.offsetLeft - startX); c.scrollTop = st - (e.touches[0].pageY - c.offsetTop - startY); }, {passive:true});
    }
};

const AppState = {
    player: { id: null, name: tgUser?.first_name || 'Магнат', avatar: tgUser?.photo_url || '', money: 500000, fuel_stock: 2000, fuel_price: 12, level: 1, xp: 0, total_profit: 0, total_trips: 0 },
    stocks: [
        { id: 'st1', name: 'Global Trans Inc.', price: 1200, owned: 0, div: 45 },
        { id: 'st2', name: 'EuroFreight Group', price: 3400, owned: 0, div: 130 },
        { id: 'st3', name: 'Pacific Logistics', price: 8900, owned: 0, div: 350 }
    ],
    activeTrips: [],
    fleet: [{ id: 't1', name: 'Heavy Titan X', cap: 12000 }]
};

const DB = {
    async init() {
        try {
            let { data, error } = await supabaseClient.from('players').select('*').eq('telegram_id', telegramId).maybeSingle();
            if(!data) {
                let { data: newP } = await supabaseClient.from('players').insert([{ telegram_id: telegramId, name: AppState.player.name, money: 500000, fuel_stock: 2000, level: 1 }]).select().single();
                if(newP) AppState.player = { ...AppState.player, ...newP };
            } else {
                AppState.player = { ...AppState.player, ...data };
            }
            WorldMapSys.renderMap();
            WorldMapSys.initDrag();
            UI.renderAll();
        } catch(e) { UI.showToast("Ошибка сети: " + e.message, "error"); }
    },
    async sync() {
        if(!AppState.player.id) return;
        await supabaseClient.from('players').update({ money: AppState.player.money, fuel_stock: AppState.player.fuel_stock, level: AppState.player.level, xp: AppState.player.xp, total_profit: AppState.player.total_profit }).eq('id', AppState.player.id);
    }
};

const GameLogic = {
    buyFuel(amt) {
        let cost = amt * AppState.player.fuel_price;
        if(AppState.player.money < cost) return UI.showToast("Недостаточно средств", "error");
        AppState.player.money -= cost;
        AppState.player.fuel_stock += amt;
        DB.sync();
        UI.showToast(`Приобретено ${amt}л топлива!`, "success");
        UI.renderAll();
    },
    buyStock(id) {
        let s = AppState.stocks.find(x => x.id === id);
        if(!s || AppState.player.money < s.price) return UI.showToast("Недостаточно средств", "error");
        AppState.player.money -= s.price;
        s.owned++;
        DB.sync();
        UI.showToast(`Куплена акция ${s.name}`, "success");
        UI.renderAll();
    },
    startContract(reward, fuel, duration, title) {
        if(AppState.player.fuel_stock < fuel) return UI.showToast("Недостаточно топлива в парке!", "error");
        AppState.player.fuel_stock -= fuel;
        let endTime = Date.now() + duration * 1000;
        AppState.activeTrips.push({ id: Date.now(), reward, title, endTime });
        DB.sync();
        UI.showToast("Рейс успешно запущен в сеть!", "success");
        UI.renderAll();
    },
    finishTrip(tripId) {
        let idx = AppState.activeTrips.findIndex(t => t.id === tripId);
        if(idx === -1) return;
        let t = AppState.activeTrips[idx];
        AppState.player.money += t.reward;
        AppState.player.total_profit += t.reward;
        AppState.player.total_trips++;
        AppState.activeTrips.splice(idx, 1);
        DB.sync();
        UI.showToast(`Рейс завершен! Получено +${t.reward.toLocaleString()} 🪙`, "success");
        UI.renderAll();
    }
};

const AdminSys = {
    addMoney(amt) { AppState.player.money += amt; DB.sync(); UI.renderAll(); UI.showToast("Выдан капитал", "success"); },
    addFuel(amt) { AppState.player.fuel_stock += amt; DB.sync(); UI.renderAll(); UI.showToast("Выдано топливо", "success"); }
};

const UI = {
    switchTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(e => e.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
        document.getElementById(`tab-${tabId}`).classList.add('active');
        event.currentTarget.classList.add('active');
        this.renderAll();
    },
    switchFleetSub(sub) {
        document.querySelectorAll('#tab-fleet .btn-outline').forEach(b => b.classList.remove('active'));
        event.currentTarget.classList.add('active');
    },
    showToast(msg, type = 'success') {
        const c = document.getElementById('toast-container');
        if(!c) return;
        let t = document.createElement('div');
        t.className = `toast`;
        t.style.borderColor = type === 'success' ? 'var(--success-color)' : '#EF4444';
        t.innerText = msg;
        c.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
    },
    safeUpdate(id, val) { const e = document.getElementById(id); if(e) e.innerText = val; },
    renderAll() {
        let p = AppState.player;
        this.safeUpdate('username', p.name);
        this.safeUpdate('profile-name-text', p.name);
        this.safeUpdate('user-money', `🪙 ${Number(p.money).toLocaleString()}`);
        this.safeUpdate('user-fuel-stock', `⛽ ${p.fuel_stock}л`);
        this.safeUpdate('profile-level-text', `Уровень ${p.level}`);

        // Активные рейсы
        let activeHtml = AppState.activeTrips.map(tr => {
            let left = Math.floor((tr.endTime - Date.now()) / 1000);
            if(left <= 0) { GameLogic.finishTrip(tr.id); return ''; }
            return `<div class="card" style="border-color:var(--accent-blue);"><div class="card-title"><span>🚚 Доставка в пути</span><span style="color:var(--accent-blue);">⏳ ${left}с</span></div><p style="font-size:11px;color:var(--hint-color);">${tr.title}</p></div>`;
        }).join('');
        const tripPanel = document.getElementById('active-trip-panel');
        if(tripPanel) tripPanel.innerHTML = activeHtml;

        // Генерация контрактов для текущего города
        let contractsHtml = '';
        for(let i=1; i<=4; i++) {
            let rew = i * 45000, fuel = i * 120, dur = i * 5;
            contractsHtml += `<div class="contract-card">
                <div class="card-title"><span>📦 Контракт #TX-${100+i}</span><span style="color:var(--success-color);">+${rew.toLocaleString()} 🪙</span></div>
                <div style="font-size:11px;color:var(--hint-color);margin-bottom:6px;">Требуется топлива: ${fuel}л | Время: ${dur}с</div>
                <button class="btn btn-primary" onclick="GameLogic.startContract(${rew}, ${fuel}, ${dur}, 'Контракт TX-${100+i}')">Подписать контракт</button>
            </div>`;
        }
        const cList = document.getElementById('contracts-list');
        if(cList) cList.innerHTML = contractsHtml;

        // Биржа акций
        let stockHtml = AppState.stocks.map(s => `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; padding-top:8px; border-top:1px solid var(--border-color);">
                <div><div style="font-size:12px; font-weight:bold;">${s.name}</div><div style="font-size:10px; color:var(--hint-color);">Цена: ${s.price} 🪙 | В портфеле: ${s.owned}</div></div>
                <button class="btn btn-primary" style="width:auto; padding:6px 12px; font-size:10px;" onclick="GameLogic.buyStock('${s.id}')">Купить</button>
            </div>
        `).join('');
        const sList = document.getElementById('stock-market-list');
        if(sList) sList.innerHTML = stockHtml;

        // Статистика профиля
        const statsEl = document.getElementById('profile-detailed-stats');
        if(statsEl) {
            statsEl.innerHTML = `
                <div style="display:flex;justify-content:space-between;"><span>Всего заработано:</span><strong style="color:var(--success-color);">${Number(p.total_profit || 0).toLocaleString()} 🪙</strong></div>
                <div style="display:flex;justify-content:space-between;"><span>Успешных рейсов:</span><strong>${p.total_trips || 0}</strong></div>
            `;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    let p = 0;
    const ld = document.getElementById('loading-screen');
    const int = setInterval(() => {
        p += 25;
        document.getElementById('loader-progress').style.width = `${p}%`;
        document.getElementById('loader-percent').innerText = `${p}%`;
        if(p >= 100) {
            clearInterval(int);
            document.getElementById('loader-tap').style.display = 'block';
            ld.addEventListener('click', () => {
                ld.style.opacity = '0';
                document.getElementById('app-content').style.opacity = '1';
                setTimeout(() => ld.remove(), 500);
                DB.init();
            });
        }
    }, 200);

    setInterval(() => { if(AppState.activeTrips.length > 0) UI.renderAll(); }, 1000);
});

window.UI = UI;
window.GameLogic = GameLogic;
window.WorldMapSys = WorldMapSys;
window.AdminSys = AdminSys;
