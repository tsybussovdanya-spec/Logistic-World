const tg = window.Telegram.WebApp;
tg.expand(); tg.ready();

// Имитация Supabase для бесперебойной работы на мобильном
const CONFIG = { SUPABASE_URL: 'mock', SUPABASE_ANON_KEY: 'mock' };
const tgUser = tg.initDataUnsafe?.user;
const telegramId = tgUser?.id || 99999999;
const defaultAvatar = tgUser?.photo_url || 'https://via.placeholder.com/80';

// МУЛЬТИМОДАЛЬНЫЙ КАТАЛОГ (Сухопутный, Морской, Авиа, Будущее)
const VEHICLES = {
    trucks: [
        { id:'tr1', name:'ГАЗель Метеор', cap:1500, fuel:15, pr:50000, type:'land' },
        { id:'tr2', name:'Volvo FH16', cap:15000, fuel:80, pr:650000, type:'land' },
        { id:'tr3', name:'Tesla Semi', cap:20000, fuel:40, pr:1900000, type:'land', eco:true }
    ],
    ships: [
        { id:'sh1', name:'Баржа Ривер', cap:50000, fuel:200, pr:3500000, type:'sea' },
        { id:'sh2', name:'Контейнеровоз Titan', cap:500000, fuel:1500, pr:25000000, type:'sea' }
    ],
    planes: [
        { id:'pl1', name:'Boeing 777F Cargo', cap:100000, fuel:3000, pr:45000000, type:'air' }
    ],
    future: [
        { id:'fu1', name:'Hyperloop Pod', cap:25000, fuel:10, pr:80000000, type:'maglev' },
        { id:'fu2', name:'Orbital Hauler', cap:150000, fuel:5000, pr:150000000, type:'space' }
    ]
};

// ГЛОБАЛЬНАЯ ЭКОНОМИКА И СОБЫТИЯ (Хардкор, кризисы, погода)
const GlobalSys = {
    weather: { id:'clear', name:'☀️ Ясно', multTime:1, multCost:1 },
    market: { oil: 10, steel: 100, chips: 500 },
    events: [
        { name:'❄️ Буран в Костанае', w:'snow', mt:1.5, mc:1.2, msg:'Трассы завалены, задержки рейсов!' },
        { name:'🛢️ Нефтяной кризис', w:'clear', mt:1, mc:2.5, msg:'Цены на топливо пробили потолок!' },
        { name:'🏴‍☠️ Пираты в океане', w:'storm', mt:1.2, mc:1.5, msg:'Риски морских перевозок выросли.' },
        { name:'☀️ Идеальный штиль', w:'clear', mt:0.9, mc:0.9, msg:'Экономика на подъеме.' }
    ],
    tick() {
        let ev = this.events[Math.floor(Math.random() * this.events.length)];
        this.weather = { id:ev.w, name:ev.name, multTime:ev.mt, multCost:ev.mc };
        this.market.oil = Math.max(5, Math.floor(this.market.oil * (Math.random() * 0.6 + 0.7) * ev.mc));
        this.market.chips = Math.max(200, Math.floor(this.market.chips * (Math.random() * 0.8 + 0.6)));
        document.getElementById('global-news-text').innerText = `LIVE: ${ev.msg} | Нефть: ${this.market.oil}🪙/баррель | Чипы: ${this.market.chips}🪙`;
        document.getElementById('weather-indicator').innerText = this.weather.name;
        UI.renderAll();
    }
};

// СОСТОЯНИЕ ИГРОКА И БАЗЫ ДАННЫХ
const AppState = {
    p: { name: tgUser?.first_name||'Магнат', av: defaultAvatar, money: 15000000, fuel: 100000, rep: 100, lvl: 1, xp: 0, loan: 0 },
    fleet: [], 
    trips: [],
    syndicate: null,
    quests: { dailyDone: 0, claimed: false },
    filters: { fleet: 'my', market: 'exchange' }
};

// КАРТА МИРА
const MapSys = {
    cur: 'mow',
    nodes: {
        'mow': { n:'Москва', x:400, y:150, i:'🏙️' }, 'kst': { n:'Костанай', x:550, y:180, i:'🏭' },
        'pek': { n:'Пекин', x:900, y:280, i:'🏯' }, 'dxb': { n:'Дубай', x:580, y:450, i:'💎' },
        'nyc': { n:'Нью-Йорк', x:100, y:200, i:'🗽' }
    },
    render() {
        let h = `<div class="map-bg"></div>`;
        for(let k in this.nodes) {
            let c = this.nodes[k], act = this.cur === k ? 'active-node' : '';
            h += `<div class="map-node ${act}" style="top:${c.y}px;left:${c.x}px" onclick="MapSys.sel('${k}')">
                <div class="node-icon">${c.i}</div><div class="node-label">${c.n}</div></div>`;
        }
        document.getElementById('map-canvas').innerHTML = h;
        document.getElementById('selected-region-title').innerText = `📍 Узел: ${this.nodes[this.cur].n}`;
    },
    sel(id) { this.cur = id; this.render(); UI.renderAll(); }
};

// ЛОГИКА АВТОПАРКА И ТЮНИНГА
const FleetSys = {
    buy(id, cat) {
        let v = VEHICLES[cat].find(x => x.id === id);
        if(AppState.p.money < v.pr) return UI.toast("Нет денег!", "error");
        AppState.p.money -= v.pr;
        AppState.fleet.push({ ...v, uid: Date.now(), wear: 100, aero: 0, chip: 0, eco: 0 });
        UI.toast(`Куплен: ${v.name}`, "success"); UI.renderAll();
    },
    repair(uid) {
        let v = AppState.fleet.find(x => x.uid === uid);
        if(AppState.p.money < 25000) return UI.toast("Нужно 25,000🪙", "error");
        AppState.p.money -= 25000; v.wear = 100;
        UI.toast("Техника восстановлена", "success"); UI.renderAll();
    },
    openTuning(uid) {
        this.activeTuning = AppState.fleet.find(x => x.uid === uid);
        document.getElementById('tuning-truck-name').innerText = this.activeTuning.name;
        document.getElementById('tuning-modal').style.display = 'flex';
    },
    applyTuning(type) {
        let costs = { aero: 50000, engine: 75000, eco: 100000 };
        if(AppState.p.money < costs[type]) return UI.toast("Нет денег на тюнинг", "error");
        if(this.activeTuning[type]) return UI.toast("Уже установлено", "error");
        AppState.p.money -= costs[type];
        this.activeTuning[type] = 1;
        UI.toast("Тюнинг установлен!", "success"); UI.renderAll();
    }
};

// КОНТРАКТЫ И РЕЙСЫ
const TripSys = {
    start(rew, fuel, dur, title) {
        if(AppState.fleet.length === 0) return UI.toast("Купите транспорт в Гараже!", "error");
        if(AppState.p.fuel < fuel) return UI.toast("Нет топлива!", "error");
        
        let v = AppState.fleet[0]; // Берем первый свободный
        if(v.wear < 20) return UI.toast("Транспорт сломан, нужен ремонт!", "error");
        
        // Применяем тюнинг и глобальные кризисы
        let finalDur = dur * GlobalSys.weather.multTime * (v.chip ? 0.85 : 1);
        let finalFuel = fuel * (v.aero ? 0.9 : 1);
        
        AppState.p.fuel -= finalFuel;
        v.wear -= Math.floor(Math.random()*15+5); // Износ
        AppState.trips.push({ id: Date.now(), r: rew, end: Date.now() + finalDur*1000, t: title, uid: v.uid });
        UI.toast("Контракт подписан!", "success"); UI.renderAll();
    },
    check() {
        let now = Date.now();
        AppState.trips = AppState.trips.filter(t => {
            if(t.end <= now) {
                // Налоговая оптимизация и выплата
                let tax = AppState.p.lvl > 10 ? 0.1 : 0.05; // 5-10% налог
                let net = Math.floor(t.r * (1 - tax));
                AppState.p.money += net;
                AppState.quests.dailyDone++;
                UI.toast(`Рейс завершен: +${net}🪙 (Налог: ${tax*100}%)`, "success");
                return false;
            }
            return true;
        });
    }
};

// БАНК И СИНДИКАТЫ
const MarketSys = {
    takeLoan() {
        if(AppState.p.loan > 0) return UI.toast("Сначала погасите старый кредит!", "error");
        AppState.p.loan = 10000000; AppState.p.money += 10000000;
        UI.toast("Кредит 10 млн выдан!", "success"); UI.renderAll();
    },
    payLoan() {
        if(AppState.p.money < 11000000) return UI.toast("Нужно 11 млн с процентами!", "error");
        AppState.p.money -= 11000000; AppState.p.loan = 0;
        UI.toast("Кредит погашен!", "success"); UI.renderAll();
    },
    createSyndicate() {
        if(AppState.p.money < 5000000) return UI.toast("Нужно 5 млн для создания!", "error");
        AppState.p.money -= 5000000;
        AppState.syndicate = { name: AppState.p.name + ' Corp', treasury: 0, members: 1 };
        UI.toast("Синдикат основан!", "success"); UI.renderAll();
    }
};

// WEB3, КВЕСТЫ, ТЕЛЕГРАМ
const TON_Sys = {
    buyPremium() {
        if(tg.openInvoice) {
            UI.toast("Вызов API Telegram Stars...", "success");
            // tg.openInvoice("mock_invoice_url"); // Настоящий вызов API
        } else {
            UI.toast("Эмуляция покупки за 50 Stars. Получен Легендарный корабль!", "success");
            FleetSys.buy('sh2', 'ships');
        }
    },
    shareToStory() {
        if(tg.shareToStory) {
            tg.shareToStory("Я построил логистическую империю в Logistic World! Присоединяйся!");
        } else UI.toast("Функция Stories доступна только в клиенте TG", "error");
    },
    inviteFriend() { UI.toast("Реферальная ссылка скопирована!", "success"); }
};

const QuestsSys = {
    claimDaily() {
        if(AppState.quests.claimed) return UI.toast("Уже получено!", "error");
        if(AppState.quests.dailyDone < 5) return UI.toast("Квест не выполнен!", "error");
        AppState.p.money += 500000; AppState.quests.claimed = true;
        UI.toast("Награда получена!", "success"); UI.renderAll();
    }
};

// ИНТЕРФЕЙС И РЕНДЕР
const UI = {
    toast(m, t="success") {
        let c=document.getElementById('toast-container'), el=document.createElement('div');
        el.className='toast'; el.style.borderColor = t==='success'?'var(--success-color)':'#EF4444'; el.innerText=m;
        c.appendChild(el); setTimeout(()=>el.remove(), 2500);
    },
    switchTab(t) { document.querySelectorAll('.tab-content, .nav-item').forEach(e=>e.classList.remove('active')); document.getElementById(`tab-${t}`).classList.add('active'); event.currentTarget.classList.add('active'); this.renderAll(); },
    switchFleetTab(t, b) { AppState.filters.fleet = t; document.querySelectorAll('#tab-fleet .btn-outline').forEach(x=>x.classList.remove('active')); b.classList.add('active'); this.renderAll(); },
    switchMarketTab(t, b) { AppState.filters.market = t; document.querySelectorAll('#tab-market .btn-outline').forEach(x=>x.classList.remove('active')); b.classList.add('active'); this.renderAll(); },
    
    renderAll() {
        let p = AppState.p;
        document.getElementById('username').innerText = p.name;
        document.getElementById('profile-name-text').innerText = p.name;
        document.getElementById('user-money').innerText = `🪙 ${Math.floor(p.money).toLocaleString()}`;
        document.getElementById('user-fuel-stock').innerText = `⛽ ${Math.floor(p.fuel).toLocaleString()}л`;

        // Квест
        let q = AppState.quests;
        document.getElementById('daily-quest').innerHTML = `🎯 <b>Ежедневный квест:</b> Сделать 5 рейсов. (${q.dailyDone}/5) <br> <button class="btn btn-primary" style="margin-top:5px; padding:5px; font-size:10px;" ${q.claimed?'disabled':''} onclick="QuestsSys.claimDaily()">${q.claimed?'Выполнено':'Забрать 500k 🪙'}</button>`;

        // Рендер активных рейсов
        document.getElementById('active-trip-panel').innerHTML = AppState.trips.map(t => {
            let left = Math.floor((t.end - Date.now())/1000);
            return left>0 ? `<div class="card" style="border-color:var(--accent-blue); padding:8px;"><div class="card-title"><span>🚚 В пути: ${t.t}</span><span style="color:var(--accent-blue)">⏳ ${left}с</span></div></div>` : '';
        }).join('');

        // Рендер контрактов (с учетом кризиса)
        let ct = ['Электроника', 'Медикаменты', 'Оружие', 'Зерно'];
        document.getElementById('contracts-list').innerHTML = ct.map((c, i) => {
            let r = (i+1)*120000 * GlobalSys.weather.multCost;
            let f = (i+1)*250; let d = (i+1)*8;
            return `<div class="contract-card ${GlobalSys.weather.multCost>1.2?'event-active-card':''}">
                <div class="card-title"><span>📦 ${c} из ${MapSys.nodes[MapSys.cur].n}</span><span style="color:var(--success-color)">+${r.toLocaleString()}🪙</span></div>
                <div style="font-size:10px; color:var(--hint-color); margin-bottom:4px;">Топливо: ${f}л | Время: ${d}с | Риск: ${GlobalSys.weather.name}</div>
                <button class="btn btn-primary" onclick="TripSys.start(${r}, ${f}, ${d}, '${c}')">Контракт</button>
            </div>`;
        }).join('');

        // Рендер Гаража / Магазина
        let fa = document.getElementById('fleet-content-area');
        if(AppState.filters.fleet === 'my') {
            fa.innerHTML = AppState.fleet.length ? AppState.fleet.map(v => `
                <div class="card" style="border-color:var(--accent-purple)">
                    <div class="card-title"><span>${v.type==='sea'?'🚢':v.type==='air'?'✈️':'🚛'} ${v.name}</span></div>
                    <div style="display:flex; justify-content:space-between; font-size:10px; margin-bottom:5px;">
                        <span>Износ: <b style="color:${v.wear<30?'#EF4444':'var(--success-color)'}">${v.wear}%</b></span>
                        <span>Аэро: ${v.aero?'✅':'❌'} | Чип: ${v.chip?'✅':'❌'}</span>
                    </div>
                    <div style="display:flex; gap:5px;">
                        <button class="btn btn-outline" style="font-size:10px; padding:6px;" onclick="FleetSys.repair(${v.uid})">Ремонт (25k)</button>
                        <button class="btn btn-outline" style="font-size:10px; padding:6px; border-color:var(--accent-pink); color:var(--accent-pink);" onclick="FleetSys.openTuning(${v.uid})">Тюнинг</button>
                    </div>
                </div>`).join('') : '<div style="text-align:center;font-size:12px;color:var(--hint-color);">Гараж пуст. Купите транспорт.</div>';
        } else if(VEHICLES[AppState.filters.fleet]) {
            fa.innerHTML = VEHICLES[AppState.filters.fleet].map(v => `
                <div class="card">
                    <div class="card-title"><span>${v.name}</span><span style="color:var(--accent-pink)">${v.pr.toLocaleString()} 🪙</span></div>
                    <div style="font-size:10px; color:var(--hint-color); margin-bottom:5px;">Вместимость: ${v.cap} кг | Расход: ${v.fuel}л | ${v.eco?'🌿 Эко-класс':''}</div>
                    <button class="btn btn-primary" onclick="FleetSys.buy('${v.id}', '${AppState.filters.fleet}')">Купить</button>
                </div>`).join('');
        }

        // Рендер Рынка
        let ma = document.getElementById('market-content-area');
        if(AppState.filters.market === 'exchange') {
            ma.innerHTML = `<div class="card"><div class="card-title">🛢️ Топливная биржа</div><p style="font-size:10px;margin-bottom:5px;">Текущая цена: ${GlobalSys.market.oil} 🪙/л</p><button class="btn btn-primary" onclick="buyFuel(10000)">Купить 10,000л</button></div>`;
        } else if(AppState.filters.market === 'bank') {
            ma.innerHTML = `<div class="card"><div class="card-title">🏦 Мировой Банк</div><p style="font-size:10px;margin-bottom:5px;">Статус кредита: ${p.loan>0?'-11,000,000 🪙':'Нет долгов'}</p>
            ${p.loan===0 ? `<button class="btn btn-primary" onclick="MarketSys.takeLoan()">Взять 10 млн 🪙</button>` : `<button class="btn btn-outline" style="border-color:#EF4444;color:#EF4444;" onclick="MarketSys.payLoan()">Погасить 11 млн 🪙</button>`}</div>`;
        } else if(AppState.filters.market === 'syndicate') {
            ma.innerHTML = AppState.syndicate ? `<div class="card" style="border-color:var(--success-color)"><div class="card-title">🛡️ ${AppState.syndicate.name}</div><p style="font-size:10px;">Казна: ${AppState.syndicate.treasury} | Участники: ${AppState.syndicate.members}</p></div>` : `<div class="card"><div class="card-title">Синдикаты</div><p style="font-size:10px;margin-bottom:5px;">Создай альянс, чтобы контролировать порты (5 млн 🪙)</p><button class="btn btn-primary" onclick="MarketSys.createSyndicate()">Создать Синдикат</button></div>`;
        }
    }
};

window.buyFuel = (amt) => { let cost = amt*GlobalSys.market.oil; if(AppState.p.money<cost) return UI.toast("Нет денег"); AppState.p.money-=cost; AppState.p.fuel+=amt; UI.toast("Топливо куплено!"); UI.renderAll(); };

document.addEventListener('DOMContentLoaded', () => {
    let pr = 0, int = setInterval(() => {
        pr+=20; document.getElementById('loader-progress').style.width=`${pr}%`; document.getElementById('loader-percent').innerText=`${pr}%`;
        if(pr>=100) { clearInterval(int); document.getElementById('loader-tap').style.display='block'; }
    }, 150);
    document.getElementById('loading-screen').addEventListener('click', function() {
        if(pr<100) return;
        this.style.opacity='0'; document.getElementById('app-content').style.opacity='1'; setTimeout(()=>this.remove(), 500);
        MapSys.render(); GlobalSys.tick(); UI.renderAll();
    });
    setInterval(() => { TripSys.check(); UI.renderAll(); }, 1000); // Цикл рейсов
    setInterval(() => { GlobalSys.tick(); }, 30000); // Смена кризисов каждые 30 сек
});

window.UI = UI; window.MapSys = MapSys; window.FleetSys = FleetSys; window.TripSys = TripSys; window.MarketSys = MarketSys; window.TON_Sys = TON_Sys; window.QuestsSys = QuestsSys;
