const tg = window.Telegram.WebApp;
tg.expand(); tg.ready();

const tgHaptic = (s = 'light') => { if(tg.HapticFeedback) tg.HapticFeedback.impactOccurred(s); };
const fmt = (n) => Intl.NumberFormat('ru-RU').format(Math.floor(n));

const tgUser = tg.initDataUnsafe?.user;
const defName = tgUser?.first_name || 'TSYBUSS';
const defAv = tgUser?.photo_url || 'https://via.placeholder.com/80';

// ЦЕНТРАЛЬНАЯ БАЗА ДАННЫХ
const DB = {
    p: { name: defName, av: defAv, money: 25000000, fuel: 300000, lvl: 1, xp: 0, totalProfit: 0, totalTons: 0, skillPts: 0, rep: 100 },
    skills: { logistics: 0, eco: 0, security: 0 },
    fleet: [], trips: [], generatedContracts: [], warehouses: [], leasing: [],
    quests: { target: 2000, current: 0, claimed: false },
    filters: { fleet: 'my', market: 'exchange', contract: 'all', staff: 'hired' },
    
    addXp(amount) {
        this.p.xp += amount;
        let req = this.p.lvl * 2000;
        if(this.p.xp >= req) {
            this.p.lvl++; this.p.xp -= req; this.p.skillPts++;
            tgHaptic('heavy');
            UI.toast(`🎉 Достигнут ${this.p.lvl} уровень! Получено очко перка.`, "success");
        }
    },
    getDivision() {
        if(this.p.lvl >= 40) return { id:'elite', n:'Элита' };
        if(this.p.lvl >= 20) return { id:'gold', n:'Золото' };
        if(this.p.lvl >= 10) return { id:'silver', n:'Серебро' };
        return { id:'bronze', n:'Бронза' };
    }
};

// КАТАЛОГ ТРАНСПОРТА
const VEHICLES = {
    trucks: [
        { id:'t1', name:'ГАЗель Некст', cap:2, speed:90, fuelRate:1.5, pr:80000, type:'truck' },
        { id:'t2', name:'КамАЗ 5490 Neo', cap:20, speed:85, fuelRate:0.8, pr:650000, type:'truck' },
        { id:'t3', name:'Volvo FH16', cap:25, speed:90, fuelRate:0.7, pr:1200000, type:'truck' },
        { id:'t4', name:'Tesla Semi', cap:30, speed:100, fuelRate:0.3, pr:3500000, type:'truck', eco:true }
    ],
    trains: [
        { id:'r1', name:'Локомотив 2ТЭ116', cap:500, speed:70, fuelRate:0.2, pr:15000000, type:'train' },
        { id:'r2', name:'Маглев Cargo', cap:1000, speed:350, fuelRate:0.1, pr:45000000, type:'train', eco:true }
    ],
    ships: [
        { id:'s1', name:'Сухогруз River', cap:3000, speed:40, fuelRate:0.15, pr:25000000, type:'ship' },
        { id:'s2', name:'Мега-Контейнеровоз', cap:20000, speed:45, fuelRate:0.05, pr:120000000, type:'ship' }
    ],
    planes: [
        { id:'p1', name:'Boeing 777F', cap:100, speed:850, fuelRate:2.5, pr:55000000, type:'plane' },
        { id:'p2', name:'Antonov An-225', cap:250, speed:800, fuelRate:3.0, pr:150000000, type:'plane' }
    ]
};

// БИРЖА ТРУДА (HR)
const HrdSys = {
    pool: [
        { id:'d1', name:'Алексей Смирнов', skill:'Ас логистики', salary:15000, mult:1.2 },
        { id:'d2', name:'Иван Петров', skill:'Экономист топлива', salary:10000, mult:1.1 },
        { id:'d3', name:'Дмитрий Васильев', skill:'Стажер', salary:5000, mult:1.0 },
        { id:'d4', name:'Сергей Ким', skill:'Экстремал (Контрабанда)', salary:25000, mult:1.4 }
    ],
    hired: [],
    hire(id) {
        tgHaptic('medium');
        let d = this.pool.find(x => x.id === id);
        if(!d || this.hired.includes(d)) return;
        if(DB.p.money < 100000) return UI.toast("Нужно 100k 🪙 для найма", "error");
        DB.p.money -= 100000;
        this.hired.push(d);
        UI.toast(`Водитель ${d.name} нанят в штат!`, "success"); UI.renderAll();
    }
};

// СКЛАДСКИЕ КОМПЛЕКСЫ И АКЦИИ
const MarketSys = {
    oilPrice: 15,
    stocks: [ { name:'Global Trans', pr:1200, owned:0 }, { name:'Euro Freight', pr:3400, owned:0 } ],
    buyOil(amt) {
        tgHaptic('medium');
        let cost = amt * this.oilPrice;
        if(DB.p.money < cost) return UI.toast("Недостаточно средств", "error");
        DB.p.money -= cost; DB.p.fuel += amt;
        UI.toast(`Закуплено ${fmt(amt)}л топлива`, "success"); UI.renderAll();
    },
    buyStock(idx) {
        tgHaptic('medium');
        let s = this.stocks[idx];
        if(DB.p.money < s.pr) return UI.toast("Нет денег на акции", "error");
        DB.p.money -= s.pr; s.owned++;
        UI.toast(`Куплена акция ${s.name}`, "success"); UI.renderAll();
    },
    buyWarehouse(cityKey) {
        tgHaptic('medium');
        if(DB.warehouses.includes(cityKey)) return UI.toast("Склад здесь уже есть", "error");
        if(DB.p.money < 5000000) return UI.toast("Склад стоит 5,000,000 🪙", "error");
        DB.p.money -= 5000000;
        DB.warehouses.push(cityKey);
        UI.toast("Логистический склад открыт (+пассивный доход)", "success"); UI.renderAll();
    }
};

// ЛИЗИНГОВЫЙ ДЕПАРТАМЕНТ
const LeasingSys = {
    takeLeasing(id, cat) {
        tgHaptic('heavy');
        let v = VEHICLES[cat].find(x => x.id === id);
        if(DB.leasing.length >= 3) return UI.toast("Лимит лизинга: 3 договора", "error");
        let initial = Math.floor(v.pr * 0.2); // 20% взнос
        if(DB.p.money < initial) return UI.toast(`Первый взнос: ${fmt(initial)} 🪙`, "error");
        DB.p.money -= initial;
        let debt = Math.floor(v.pr * 0.9); // Остаток долга с процентами
        DB.leasing.push({ ...v, uid: Date.now(), wear: 100, debt: debt, payment: Math.floor(debt / 10) });
        UI.toast("Техника оформлена в лизинг!", "success"); UI.renderAll();
    },
    payDebt(uid) {
        tgHaptic('medium');
        let l = DB.leasing.find(x => x.uid === uid);
        let payAmt = l.payment;
        if(DB.p.money < payAmt) return UI.toast("Недостаточно средств", "error");
        DB.p.money -= payAmt; l.debt -= payAmt;
        if(l.debt <= 0) {
            DB.fleet.push({ ...l, debt: undefined, payment: undefined });
            DB.leasing = DB.leasing.filter(x => x.uid !== uid);
            UI.toast("Лизинг закрыт! Техника полностью ваша.", "success");
        } else {
            UI.toast("Взнос по лизингу внесен.", "success");
        }
        UI.renderAll();
    }
};

// КАРТА И ГЕНЕРАТОР КОНТРАКТОВ (Включая Контрабанду)
const MapSys = {
    cur: 'kst',
    nodes: {
        'kst': { n:'Костанай', x:750, y:280, i:'🌾' }, 'ast': { n:'Астана', x:850, y:290, i:'🏢' },
        'mow': { n:'Москва', x:500, y:220, i:'🏙️' }, 'ber': { n:'Берлин', x:350, y:240, i:'🏛️' },
        'dxb': { n:'Дубай', x:700, y:550, i:'💎' }, 'pek': { n:'Пекин', x:1150, y:380, i:'🏯' }
    },
    getDist(from, to) {
        let n1 = this.nodes[from], n2 = this.nodes[to];
        return Math.floor(Math.hypot(n2.x - n1.x, n2.y - n1.y) * 15);
    },
    render() {
        let nHTML = '';
        for(let k in this.nodes) {
            let c = this.nodes[k];
            nHTML += `<div class="map-node ${this.cur===k?'active-node':''}" style="top:${c.y}px;left:${c.x}px" onclick="MapSys.sel('${k}')">
                <div class="node-icon">${c.i}</div><div class="node-label">${c.n}</div></div>`;
        }
        document.getElementById('map-nodes-container').innerHTML = nHTML;
        
        let svg = '', curN = this.nodes[this.cur];
        for(let k in this.nodes) {
            if(k !== this.cur) svg += `<line x1="${curN.x}" y1="${curN.y}" x2="${this.nodes[k].x}" y2="${this.nodes[k].y}" stroke="var(--accent-blue)" stroke-width="1.5" opacity="0.3" />`;
        }
        document.getElementById('map-svg-routes').innerHTML = svg;
        document.getElementById('selected-region-title').innerText = `📍 Хаб: ${curN.n}`;
    },
    sel(id) { tgHaptic('medium'); this.cur = id; this.render(); this.generateContracts(); UI.renderAll(); },
    
    generateContracts() {
        let goods = ['Электроника', 'Сталь', 'Медикаменты', 'Редкие минералы', 'Костанайский Карп', 'Запчасти ТНВД'];
        DB.generatedContracts = [];
        let targets = Object.keys(this.nodes).filter(k => k !== this.cur);
        
        targets.forEach((t, i) => {
            let dist = this.getDist(this.cur, t);
            let weight = Math.floor(Math.random() * 20) + 2;
            let rew = Math.floor(dist * weight * 18 * (1 + DB.skills.logistics * 0.05));
            let isSmuggle = Math.random() < 0.25; // 25% шанс контрабанды с Х2 наградой
            if(isSmuggle) rew *= 2.2;
            
            DB.generatedContracts.push({ id: Date.now()+i, to: t, toName: this.nodes[t].n, dist: dist, weight: weight, rew: rew, cargo: goods[Math.floor(Math.random()*goods.length)], smuggle: isSmuggle });
        });
    },
    filterContracts(type, btn) {
        tgHaptic('light'); DB.filters.contract = type;
        document.querySelectorAll('#tab-map .btn-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active'); UI.renderAll();
    },
    initDrag() {
        const c = document.getElementById('map-scroll-container');
        let isD = false, sX, sY, sl, st;
        c.addEventListener('touchstart', e => { isD=true; sX=e.touches[0].pageX-c.offsetLeft; sY=e.touches[0].pageY-c.offsetTop; sl=c.scrollLeft; st=c.scrollTop; });
        c.addEventListener('touchend', () => isD=false);
        c.addEventListener('touchmove', e => { if(!isD) return; c.scrollLeft=sl-(e.touches[0].pageX-c.offsetLeft-sX); c.scrollTop=st-(e.touches[0].pageY-c.offsetTop-sY); }, {passive:true});
        setTimeout(()=> { c.scrollLeft = 250; c.scrollTop = 50; }, 100);
    }
};

// ДИСПЕТЧЕРСКАЯ И ФИЗИКА РЕЙСОВ
const TripSys = {
    activeContract: null,
    openDispatch(cId) {
        tgHaptic('medium');
        this.activeContract = DB.generatedContracts.find(c => c.id === cId);
        if(!this.activeContract) return;
        
        let smuggTxt = this.activeContract.smuggle ? `<br><b style="color:var(--error-color)">🏴‍☠️ Контрабанда (Риск ареста!)</b>` : '';
        document.getElementById('dispatch-info').innerHTML = `<b>📦 ${this.activeContract.cargo}</b>${smuggTxt}<br>Дистанция: ${fmt(this.activeContract.dist)} км | Масса: ${fmt(this.activeContract.weight)} т<br>Награда: <b style="color:var(--success-color)">${fmt(this.activeContract.rew)} 🪙</b>`;
        
        let avFleet = DB.fleet.filter(v => !DB.trips.map(t=>t.uid).includes(v.uid));
        document.getElementById('dispatch-fleet-list').innerHTML = avFleet.map(v => {
            let canCarry = v.cap >= this.activeContract.weight;
            let reqFuel = Math.floor(this.activeContract.dist * v.fuelRate * (1 + this.activeContract.weight / v.cap));
            let realSecs = Math.floor((this.activeContract.dist / v.speed) * 10);
            return `<div class="card" style="padding:10px; border-color:${canCarry?'var(--accent-blue)':'var(--error-color)'}">
                <div class="card-title" style="font-size:11px; margin-bottom:4px;"><span>${v.name}</span><span>${fmt(v.cap)}т</span></div>
                <div style="font-size:10px; color:var(--hint-color); margin-bottom:8px;">Топливо: ${fmt(reqFuel)}л | Время: ${realSecs}с</div>
                <button class="btn ${canCarry?'btn-primary':'btn-outline'}" style="padding:8px; font-size:10px;" ${canCarry?'':'disabled'} onclick="TripSys.dispatch(${v.uid}, ${reqFuel}, ${realSecs})">Отправить</button>
            </div>`;
        }).join('') || '<div style="font-size:11px; text-align:center; color:var(--hint-color);">Нет свободного транспорта.</div>';
        
        document.getElementById('dispatch-modal').style.display = 'flex';
    },
    closeDispatch() { tgHaptic('light'); document.getElementById('dispatch-modal').style.display = 'none'; },
    
    dispatch(vUid, reqFuel, secs) {
        tgHaptic('heavy');
        let v = DB.fleet.find(x => x.uid === vUid);
        if(DB.p.fuel < reqFuel) return UI.toast("Недостаточно топлива", "error");
        DB.p.fuel -= reqFuel;
        v.wear = Math.max(0, v.wear - 8);
        
        DB.trips.push({ id: Date.now(), c: this.activeContract, end: Date.now() + secs*1000, uid: v.uid, vName: v.name });
        DB.generatedContracts = DB.generatedContracts.filter(c => c.id !== this.activeContract.id);
        this.closeDispatch();
        UI.toast("Рейс успешно запущен!", "success"); UI.renderAll();
    },
    
    tick() {
        let now = Date.now(), active = [];
        DB.trips.forEach(t => {
            if(t.end <= now) {
                // Контрабанда проверка риска
                let confiscated = false;
                if(t.c.smuggle) {
                    let secChance = 0.5 + (DB.skills.security * 0.1);
                    if(Math.random() > secChance) confiscated = true;
                }
                
                if(confiscated) {
                    tgHaptic('heavy');
                    UI.toast(`🚨 Таможня перехватила контрабанду! Груз конфискован.`, "error");
                } else {
                    let net = Math.floor(t.c.rew * 0.9);
                    DB.p.money += net; DB.p.totalProfit += net;
                    DB.p.totalTons += t.c.weight; DB.quests.current += t.c.weight;
                    DB.addXp(Math.floor(net / 1000));
                    tgHaptic('success');
                    UI.toast(`📦 Доставка завершена! +${fmt(net)} 🪙`, "success");
                }
            } else active.push(t);
        });
        DB.trips = active;
        
        // Пассивный доход от складов
        if(Math.random() < 0.1 && DB.warehouses.length > 0) {
            let passInc = DB.warehouses.length * 25000;
            DB.p.money += passInc;
            UI.toast(`🏢 Склады принесли прибыль: +${fmt(passInc)} 🪙`, "success");
        }
    }
};

const SkillSys = {
    upgrade(type) {
        tgHaptic('heavy');
        if(DB.p.skillPts <= 0) return UI.toast("Нет очков технологий", "error");
        if(DB.skills[type] >= 5) return UI.toast("Максимальный уровень", "error");
        DB.p.skillPts--; DB.skills[type]++;
        UI.toast("Технология прокачана!", "success"); UI.renderAll();
    }
};

const QuestsSys = {
    claimDaily() {
        tgHaptic('heavy');
        if(DB.quests.claimed) return UI.toast("Уже получено");
        if(DB.quests.current < DB.quests.target) return UI.toast("Тендер не выполнен");
        DB.p.money += 10000000; DB.addXp(3000); DB.quests.claimed = true;
        UI.toast("Тендер закрыт! +10 млн 🪙", "success"); UI.renderAll();
    }
};

const FleetSys = {
    buy(id, cat) {
        tgHaptic('medium');
        let v = VEHICLES[cat].find(x => x.id === id);
        if(DB.p.money < v.pr) return UI.toast("Недостаточно капитала", "error");
        DB.p.money -= v.pr;
        DB.fleet.push({ ...v, uid: Date.now(), wear: 100 });
        UI.toast(`${v.name} добавлен в парк!`, "success"); UI.renderAll();
    },
    repair(uid) {
        tgHaptic('light');
        let v = DB.fleet.find(x => x.uid === uid);
        let cost = (100 - v.wear) * 1000;
        if(cost <= 0) return;
        if(DB.p.money < cost) return UI.toast("Не хватает средств на ремонт", "error");
        DB.p.money -= cost; v.wear = 100;
        UI.toast("Техника отремонтирована", "success"); UI.renderAll();
    }
};

const UI = {
    toast(m, t="success") {
        let c=document.getElementById('toast-container'), el=document.createElement('div');
        el.className='toast'; el.innerHTML = `${t==='success'?'✅':'⚠️'} ${m}`;
        el.style.borderColor = t==='success'?'var(--success-color)':'var(--error-color)';
        c.appendChild(el); setTimeout(()=>el.remove(), 2500);
    },
    switchTab(t) { tgHaptic('light'); document.querySelectorAll('.tab-content, .nav-item').forEach(e=>e.classList.remove('active')); document.getElementById(`tab-${t}`).classList.add('active'); event.currentTarget.classList.add('active'); this.renderAll(); },
    switchFleetTab(t, b) { tgHaptic('light'); DB.filters.fleet = t; document.querySelectorAll('#tab-fleet .btn-tab').forEach(x=>x.classList.remove('active')); b.classList.add('active'); this.renderAll(); },
    switchStaffTab(t, b) { tgHaptic('light'); DB.filters.staff = t; document.querySelectorAll('#tab-staff .btn-tab').forEach(x=>x.classList.remove('active')); b.classList.add('active'); this.renderAll(); },
    switchMarketTab(t, b) { tgHaptic('light'); DB.filters.market = t; document.querySelectorAll('#tab-market .btn-tab').forEach(x=>x.classList.remove('active')); b.classList.add('active'); this.renderAll(); },
    
    renderAll() {
        let p = DB.p;
        document.getElementById('username').innerText = p.name;
        document.getElementById('profile-name-text').innerText = p.name;
        document.getElementById('user-level-badge').innerText = `LVL ${p.lvl}`;
        document.getElementById('user-money').innerText = `🪙 ${fmt(p.money)}`;
        document.getElementById('user-fuel-stock').innerText = `⛽ ${fmt(p.fuel)}л`;
        
        let div = DB.getDivision();
        let dBadge = document.getElementById('user-division');
        dBadge.innerText = div.n; dBadge.className = `division-badge ${div.id}`;

        let xpReq = p.lvl * 2000;
        document.getElementById('xp-bar-fill').style.width = `${Math.min(100, (p.xp/xpReq)*100)}%`;

        document.getElementById('stat-tons').innerText = fmt(p.totalTons);
        document.getElementById('stat-profit').innerText = fmt(p.totalProfit);
        document.getElementById('stat-rep').innerText = `${p.rep}%`;
        
        document.getElementById('skill-pts').innerText = p.skillPts;
        document.getElementById('skl-log').innerText = DB.skills.logistics;
        document.getElementById('skl-eco').innerText = DB.skills.eco;
        document.getElementById('skl-sec').innerText = DB.skills.security;

        let qProg = Math.min(100, (DB.quests.current / DB.quests.target) * 100);
        document.getElementById('quest-prog-fill').style.width = `${qProg}%`;
        let qBtn = document.getElementById('quest-btn');
        if(DB.quests.claimed) { qBtn.innerText = "Выполнено ✅"; qBtn.disabled = true; }
        else { qBtn.innerText = `Тендер (${fmt(DB.quests.current)}/${fmt(DB.quests.target)} т)`; qBtn.disabled = DB.quests.current < DB.quests.target; }

        // Рейсы
        document.getElementById('active-trip-panel').innerHTML = DB.trips.map(t => {
            let left = Math.floor((t.end - Date.now())/1000);
            return left>0 ? `<div class="card" style="padding:10px; border-color:var(--accent-blue);"><div class="card-title" style="margin:0; font-size:11px;"><span>🚚 ${t.vName} → ${t.c.toName}</span><span style="color:var(--accent-blue)">⏳ ${left}с</span></div></div>` : '';
        }).join('');

        // Контракты с фильтрами
        let fc = DB.generatedContracts;
        if(DB.filters.contract === 'short') fc = fc.filter(c => c.dist <= 3000);
        if(DB.filters.contract === 'long') fc = fc.filter(c => c.dist > 3000);
        if(DB.filters.contract === 'heavy') fc = fc.filter(c => c.weight >= 10);
        if(DB.filters.contract === 'smuggle') fc = fc.filter(c => c.smuggle);

        document.getElementById('contracts-list').innerHTML = fc.map(c => `
            <div class="contract-card ${c.smuggle?'smuggle':''}">
                <div class="card-title"><span>📦 ${c.cargo} → ${c.toName}</span><span style="color:var(--success-color)">+${fmt(c.rew)}🪙</span></div>
                <div style="font-size:11px; color:var(--hint-color); margin-bottom:8px;">Расстояние: ${fmt(c.dist)} км | Масса: <b>${c.weight}т</b> ${c.smuggle?'<b style="color:var(--error-color)">[КОНТРАБАНДА]</b>':''}</div>
                <button class="btn btn-primary" onclick="TripSys.openDispatch(${c.id})">Назначить рейс</button>
            </div>`).join('') || '<div style="font-size:11px; text-align:center; color:var(--hint-color); padding:10px;">Нет доступных контрактов.</div>';

        // Парк и Лизинг
        let fa = document.getElementById('fleet-content-area');
        if(DB.filters.fleet === 'leasing') {
            fa.innerHTML = DB.leasing.length ? DB.leasing.map(l => `
                <div class="card" style="border-color:var(--warning-color)">
                    <div class="card-title"><span>💼 Лизинг: ${l.name}</span><span style="color:var(--warning-color)">Долг: ${fmt(l.debt)}🪙</span></div>
                    <div style="font-size:11px; color:var(--hint-color); margin-bottom:8px;">Платеж: ${fmt(l.payment)} 🪙</div>
                    <button class="btn btn-primary" onclick="LeasingSys.payDebt(${l.uid})">Внести платеж (${fmt(l.payment)} 🪙)</button>
                </div>`).join('') : '<div style="font-size:12px; color:var(--hint-color); text-align:center; padding:15px;">Нет активных договоров лизинга.</div>';
        } else if(DB.filters.fleet === 'my') {
            fa.innerHTML = DB.fleet.length ? DB.fleet.map(v => `
                <div class="card" style="border-color:var(--accent-purple)">
                    <div class="card-title"><span>🚛 ${v.name}</span><span style="color:${v.wear<30?'var(--error-color)':'var(--success-color)'}">🛠 ${v.wear}%</span></div>
                    <div style="font-size:11px; color:var(--hint-color); margin-bottom:8px;">Грузоподъемность: <b>${v.cap}т</b></div>
                    <button class="btn btn-outline" style="font-size:11px; padding:8px;" onclick="FleetSys.repair(${v.uid})">Ремонт</button>
                </div>`).join('') : '<div style="text-align:center;font-size:12px;color:var(--hint-color);padding:20px;">Парк пуст.</div>';
        } else if(VEHICLES[DB.filters.fleet]) {
            fa.innerHTML = VEHICLES[DB.filters.fleet].map(v => `
                <div class="card">
                    <div class="card-title"><span>${v.name}</span><span style="color:var(--accent-pink)">${fmt(v.pr)} 🪙</span></div>
                    <div style="font-size:11px; color:var(--hint-color); margin-bottom:8px;">Категория: ${v.type} | ${v.cap}т</div>
                    <div style="display:flex; gap:6px;">
                        <button class="btn btn-primary" style="flex:1" onclick="FleetSys.buy('${v.id}', '${DB.filters.fleet}')">Купить</button>
                        <button class="btn btn-outline" style="flex:1; border-color:var(--warning-color); color:var(--warning-color)" onclick="LeasingSys.takeLeasing('${v.id}', '${DB.filters.fleet}')">В лизинг</button>
                    </div>
                </div>`).join('');
        }

        // HR Штат
        let sa = document.getElementById('staff-content-area');
        if(DB.filters.staff === 'hired') {
            sa.innerHTML = HrdSys.hired.length ? HrdSys.hired.map(d => `
                <div class="card" style="border-color:var(--success-color)">
                    <div class="card-title"><span>👨‍✈️ ${d.name}</span><span style="color:var(--success-color)">В штате</span></div>
                    <div style="font-size:11px; color:var(--hint-color);">Навык: ${d.skill} | Зарплата: ${fmt(d.salary)} 🪙</div>
                </div>`).join('') : '<div style="font-size:12px; color:var(--hint-color); text-align:center; padding:15px;">Штат пуст. Наймите водителей на бирже труда.</div>';
        } else {
            sa.innerHTML = HrdSys.pool.map(d => `
                <div class="card">
                    <div class="card-title"><span>👨‍✈️ ${d.name}</span><span style="color:var(--accent-pink)">100k 🪙 найм</span></div>
                    <div style="font-size:11px; color:var(--hint-color); margin-bottom:8px;">Специализация: <b>${d.skill}</b></div>
                    <button class="btn btn-primary" onclick="HrdSys.hire('${d.id}')">Нанять в штат</button>
                </div>`).join('');
        }

        // Рынок, Склады, Акции
        let ma = document.getElementById('market-content-area');
        if(DB.filters.market === 'exchange') {
            ma.innerHTML = `<div class="card"><div class="card-title">🛢️ Топливный терминал</div><p style="font-size:11px; margin-bottom:10px;">Цена за 1000л: <b style="color:var(--accent-pink)">${MarketSys.oilPrice*1000} 🪙</b></p><button class="btn btn-primary" onclick="MarketSys.buyOil(10000)">Купить 10,000 литров</button></div>`;
        } else if(DB.filters.market === 'warehouses') {
            ma.innerHTML = Object.keys(MapSys.nodes).map(k => {
                let n = MapSys.nodes[k]; let has = DB.warehouses.includes(k);
                return `<div class="card"><div class="card-title"><span>🏢 Склад в г. ${n.n}</span><span style="color:${has?'var(--success-color)':'var(--hint-color)'}">${has?'Активен':'5 млн 🪙'}</span></div>
                ${has?'<div style="font-size:10px; color:var(--success-color);">Генерирует пассивный доход</div>':`<button class="btn btn-primary" onclick="MarketSys.buyWarehouse('${k}')">Построить склад</button>`}</div>`;
            }).join('');
        } else if(DB.filters.market === 'stocks') {
            ma.innerHTML = MarketSys.stocks.map((s, idx) => `
                <div class="card"><div class="card-title"><span>📈 ${s.name}</span><span style="color:var(--success-color)">${s.pr} 🪙</span></div>
                <div style="font-size:11px; color:var(--hint-color); margin-bottom:8px;">В портфеле: ${s.owned} шт</div>
                <button class="btn btn-primary" onclick="MarketSys.buyStock(${idx})">Купить акцию</button></div>`).join('');
        } else {
            ma.innerHTML = `<div class="card"><div class="card-title">🏦 Кредитный департамент</div><p style="font-size:11px; color:var(--hint-color);">Доступно расширение лимитов с 10 уровня.</p></div>`;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    let pr = 0, int = setInterval(() => {
        pr+=25; document.getElementById('loader-progress').style.width=`${pr}%`; document.getElementById('loader-percent').innerText=`${pr}%`;
        if(pr>=100) { clearInterval(int); document.getElementById('loader-tap').style.display='block'; }
    }, 60);
    
    document.getElementById('loading-screen').addEventListener('click', function() {
        if(pr<100) return; tgHaptic('heavy');
        this.style.opacity='0'; document.getElementById('app-content').style.opacity='1'; setTimeout(()=>this.remove(), 400);
        
        MapSys.initDrag(); MapSys.render(); MapSys.generateContracts(); UI.renderAll();
        
        setInterval(() => { TripSys.tick(); UI.renderAll(); }, 1000);
    });
});
