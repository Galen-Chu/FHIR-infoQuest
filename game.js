// FHIR Quest — game engine.
// State machine that renders into #game-root. Encapsulated under `Game` so it
// does not collide with the viewer's app.js globals. Handlers are attached via
// inline onclick="Game.x()" for parity with the rest of the project.

const Game = (function () {
    'use strict';

    const SAVE_KEY = 'fhir-quest-save-v1';
    const MAX_STREAK_MULT = 8; // streak multiplier caps at +0.1 * this

    // ----- Durable state (persisted) -----
    let save = {
        xp: 0,
        codex: [],            // code ids the player has mastered
        badges: [],           // badge ids earned
        completed: {},        // caseId -> best stars (1..3)
        arcadeHigh: {},       // categoryId -> best correct count
        bestStreak: 0,
        muted: false
    };

    // ----- Transient session state -----
    let screen = 'menu';
    let s = null; // active play session object

    // ----- Persistence -----
    function load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (raw) Object.assign(save, JSON.parse(raw));
        } catch (e) { /* ignore corrupt save */ }
    }
    function persist() {
        try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {}
    }

    // ----- Progression helpers -----
    function level() {
        let L = 1;
        while (GAME.xpForLevel(L + 1) <= save.xp) L++;
        return L;
    }
    function levelTitle() {
        return GAME.levelTitles[Math.min(level() - 1, GAME.levelTitles.length - 1)];
    }
    function xpInLevel() { return save.xp - GAME.xpForLevel(level()); }
    function xpForNext() { return GAME.xpForLevel(level() + 1) - GAME.xpForLevel(level()); }
    function pctToNext() {
        const need = xpForNext();
        return need <= 0 ? 100 : Math.min(100, Math.round((xpInLevel() / need) * 100));
    }
    function streakMult() { return 1 + Math.min(currentStreak(), MAX_STREAK_MULT) * 0.1; }

    // session streak (resets on a wrong answer, grows on correct)
    // We keep it on `s` when in play; otherwise 0.
    function currentStreak() { return (s && typeof s.streak === 'number') ? s.streak : 0; }

    function addXp(amount) {
        const before = level();
        save.xp += amount;
        const after = level();
        const leveled = after > before;
        if (leveled) { sound('levelup'); grant('level5', after >= 5); }
        persist();
        return leveled;
    }

    // ----- Codex / badges -----
    function masterCode(codeId) {
        if (codeId && save.codex.indexOf(codeId) === -1) {
            save.codex.push(codeId);
            grant('codebreaker', save.codex.length >= 10);
            persist();
        }
    }
    function grant(badgeId, condition) {
        if (condition && save.badges.indexOf(badgeId) === -1) {
            save.badges.push(badgeId);
            persist();
            return true;
        }
        return false;
    }

    // ----- Sound (generated, no asset files) -----
    let actx = null;
    function sound(kind) {
        if (save.muted) return;
        try {
            actx = actx || new (window.AudioContext || window.webkitAudioContext)();
            const now = actx.currentTime;
            const notes = {
                correct: [[660, 0.08], [880, 0.10]],
                wrong:   [[180, 0.18]],
                click:   [[520, 0.04]],
                levelup: [[523, 0.09], [659, 0.09], [784, 0.09], [1047, 0.14]],
                badge:   [[784, 0.08], [1047, 0.12]]
            }[kind] || [[440, 0.05]];
            notes.forEach(([f, d]) => {
                const o = actx.createOscillator(), g = actx.createGain();
                o.type = 'triangle'; o.frequency.value = f;
                o.connect(g); g.connect(actx.destination);
                g.gain.setValueAtTime(0.0001, now);
                g.gain.exponentialRampToValueAtTime(0.18, now + 0.01);
                g.gain.exponentialRampToValueAtTime(0.0001, now + d);
                o.start(now); o.stop(now + d + 0.02);
            });
        } catch (e) {}
    }

    // ----- Confetti (DOM, no assets) -----
    function confetti() {
        const root = document.getElementById('game-root');
        if (!root) return;
        const colors = ['#667eea', '#764ba2', '#ffc107', '#28a745', '#e83e8c', '#17a2b8'];
        for (let i = 0; i < 60; i++) {
            const p = document.createElement('div');
            p.className = 'gq-confetti';
            p.style.background = colors[i % colors.length];
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDelay = (Math.random() * 0.3) + 's';
            p.style.animationDuration = (0.9 + Math.random() * 0.9) + 's';
            p.style.transform = `rotate(${Math.random() * 360}deg)`;
            root.appendChild(p);
            setTimeout(() => p.remove(), 2000);
        }
    }

    // ----- Resource lookup against the viewer's FHIR data -----
    function getResource(id) {
        const d = FHIR_DATA;
        if (!d) return null;
        const all = [].concat(d.patients || [], d.observations || [], d.conditions || []);
        return all.find(r => r.id === id) || null;
    }
    function escapeHtml(s) {
        return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    }
    // Minimal JSON syntax highlighter (self-contained; not coupled to app.js).
    function highlightJson(obj) {
        let json = JSON.stringify(obj, null, 2);
        json = escapeHtml(json);
        return json.replace(/(&quot;[^&]*?&quot;)(\s*:)/g, '<span class="gq-jk">$1</span>$2')
                   .replace(/:\s*(&quot;[^&]*?&quot;)/g, ': <span class="gq-js">$1</span>')
                   .replace(/:\s*(-?\d+(?:\.\d+)?)/g, ': <span class="gq-jn">$1</span>')
                   .replace(/:\s*(true|false|null)/g, ': <span class="gq-jb">$1</span>');
    }

    // ----- Public API -----
    function init() { load(); }
    function show() { render(); }

    // ============ RENDER ============
    function render() {
        const root = document.getElementById('game-root');
        if (!root) return;
        root.className = 'gq-root';
        root.innerHTML = topBar() + body();
        // confetti pieces are appended as children; don't clear them mid-animation
    }

    function topBar() {
        const streak = currentStreak();
        const flame = streak >= 5 ? '🔥' : streak >= 3 ? '✨' : '';
        return `
        <div class="gq-topbar">
            <div class="gq-level">
                <div class="gq-lvl-badge">L${level()}</div>
                <div class="gq-lvl-meta">
                    <div class="gq-lvl-title">${levelTitle()}</div>
                    <div class="gq-xpbar"><div class="gq-xpfill" style="width:${pctToNext()}%"></div></div>
                    <div class="gq-xptext">${xpInLevel()} / ${xpForNext()} XP</div>
                </div>
            </div>
            <div class="gq-topright">
                <div class="gq-streak" title="Current answer streak">${flame}<span>${streak}</span></div>
                <button class="gq-iconbtn" onclick="Game.toggleMute()" title="Toggle sound">${save.muted ? '🔇' : '🔊'}</button>
                ${screen !== 'menu' ? `<button class="gq-iconbtn" onclick="Game.goMenu()" title="Home">🏠</button>` : ''}
            </div>
        </div>`;
    }

    function body() {
        switch (screen) {
            case 'menu': return screenMenu();
            case 'cases': return screenCases();
            case 'brief': return screenBrief();
            case 'play': return screenPlay();
            case 'caseResult': return screenCaseResult();
            case 'arcadeMenu': return screenArcadeMenu();
            case 'arcadePlay': return screenArcadePlay();
            case 'arcadeResult': return screenArcadeResult();
            case 'codex': return screenCodex();
            default: return screenMenu();
        }
    }

    // ----- Menu -----
    function screenMenu() {
        const done = Object.keys(save.completed).length;
        const total = GAME.cases.length;
        return `
        <div class="gq-menu">
            <div class="gq-hero">
                <h2>FHIR Quest</h2>
                <p>Solve real clinical cases by reading, decoding, and building FHIR resources. Learn the standard by using it.</p>
            </div>
            <div class="gq-cards">
                <button class="gq-bigcard gq-quest" onclick="Game.go('cases')">
                    <span class="gq-bc-icon">🗂️</span>
                    <span class="gq-bc-title">Quest</span>
                    <span class="gq-bc-sub">${done}/${total} cases solved</span>
                </button>
                <button class="gq-bigcard gq-arcade" onclick="Game.go('arcadeMenu')">
                    <span class="gq-bc-icon">🕹️</span>
                    <span class="gq-bc-title">Arcade</span>
                    <span class="gq-bc-sub">Timed code drill</span>
                </button>
                <button class="gq-bigcard gq-codex" onclick="Game.go('codex')">
                    <span class="gq-bc-icon">📖</span>
                    <span class="gq-bc-title">Codex</span>
                    <span class="gq-bc-sub">${save.codex.length}/${GAME.codes.length} codes &middot; ${save.badges.length} badges</span>
                </button>
            </div>
        </div>`;
    }

    // ----- Case list -----
    function screenCases() {
        const items = GAME.cases.map((c, i) => {
            const stars = save.completed[c.id] || 0;
            const locked = i > 0 && !save.completed[GAME.cases[i - 1].id] && stars === 0;
            const stateLbl = stars > 0 ? 'Solved' : locked ? 'Locked' : 'Available';
            return `
            <button class="gq-case ${locked ? 'gq-locked' : ''}" ${locked ? 'disabled' : `onclick="Game.startCase('${c.id}')"`}>
                <span class="gq-case-icon">${locked ? '🔒' : c.icon}</span>
                <span class="gq-case-body">
                    <span class="gq-case-title">${c.title}</span>
                    <span class="gq-case-meta">${c.challenges.length} challenges &middot; ${stateLbl}</span>
                </span>
                <span class="gq-case-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</span>
            </button>`;
        }).join('');
        return `<div class="gq-screen"><h3>Quest — Patient Cases</h3><div class="gq-caselist">${items}</div></div>`;
    }

    // ----- Case brief -----
    function screenBrief() {
        const c = currentCase();
        return `
        <div class="gq-screen gq-brief">
            <div class="gq-brief-icon">${c.icon}</div>
            <h3>${c.title}</h3>
            <p class="gq-brief-text">${c.brief}</p>
            <div class="gq-brief-meta">${c.challenges.length} challenges &middot; earn XP &amp; codex entries</div>
            <button class="gq-btn gq-btn-primary" onclick="Game.beginChallenges()">Accept case</button>
        </div>`;
    }

    // ----- Play (one challenge) -----
    function screenPlay() {
        const c = currentCase();
        const ch = c.challenges[s.index];
        const progress = `${s.index + 1} / ${c.challenges.length}`;
        let context = '';
        if (ch.type === 'build') {
            context = renderBuild(ch);
        } else {
            context = renderContext(ch);
        }
        return `
        <div class="gq-screen gq-play">
            <div class="gq-play-head">
                <span class="gq-ch-type">${typeLabel(ch.type)}</span>
                <span class="gq-progress">${progress}</span>
            </div>
            <div class="gq-prompt">${ch.prompt}</div>
            ${context}
            <div id="gq-feedback"></div>
        </div>`;
    }

    function typeLabel(t) {
        return ({
            decode: 'Decode', jsonhunt: 'JSON Hunt', connect: 'Connect',
            triage: 'Triage', bug: 'Spot the Bug', build: 'Build a Resource'
        })[t] || t;
    }

    function renderContext(ch) {
        let snippet = '';
        if (ch.resourceId) {
            const r = getResource(ch.resourceId);
            if (r) snippet = `<div class="gq-codeview">${highlightJson(r)}</div>`;
        } else if (ch.context) {
            if (ch.context.kind === 'json') {
                snippet = `<div class="gq-codeview">${highlightJson(ch.context.content)}</div>`;
            } else if (ch.context.kind === 'code') {
                snippet = `<div class="gq-codeview"><div class="gq-jk">&quot;system&quot;: <span class="gq-js">&quot;${escapeHtml(ch.context.system)}&quot;</span></div><div class="gq-jk">&quot;code&quot;: <span class="gq-js">&quot;${escapeHtml(ch.context.code)}&quot;</span></div></div>`;
            }
        }
        const choices = ch.choices.map((opt, i) =>
            `<button class="gq-choice" onclick="Game.answer(${i})">${escapeHtml(opt)}</button>`
        ).join('');
        return `${snippet}<div class="gq-choices">${choices}</div>`;
    }

    function renderBuild(ch) {
        // Replace each {{fieldId}} placeholder with a populated <select>.
        const fields = {};
        ch.fields.forEach(f => fields[f.id] = f);
        let html = escapeHtml(ch.skeleton).replace(/&quot;\{\{(\w+)\}\}&quot;/g, (m, id) => {
            // placeholders appear quoted in the JSON; unwrap for the control
            return buildSelect(id, fields[id]);
        });
        // also handle any unquoted placeholders (defensive)
        html = html.replace(/\{\{(\w+)\}\}/g, (m, id) => buildSelect(id, fields[id]));
        return `<div class="gq-codeview gq-build"><pre>${html}</pre></div>
                <button class="gq-btn gq-btn-primary" onclick="Game.submitBuild()">Validate resource</button>`;
    }

    function buildSelect(id, field) {
        if (!field) return `{{${id}}}`;
        const opts = field.options.map((o, i) =>
            `<option value="${i}">${escapeHtml(o)}</option>`).join('');
        return `<select class="gq-buildsel" data-field="${id}">${opts}</select>`;
    }

    // ----- Answer handling (choice challenges) -----
    function answer(i) {
        const c = currentCase();
        const ch = c.challenges[s.index];
        if (s.locked) return;
        s.locked = true;
        const correct = i === ch.answer;
        const fb = document.getElementById('gq-feedback');
        if (correct) {
            const mult = streakMult();
            const gained = Math.round(GAME.rewards[ch.difficulty] * mult);
            const leveled = addXp(gained);   // bank XP + detect level-up
            s.xp += gained;                   // case subtotal
            s.streak += 1;
            save.bestStreak = Math.max(save.bestStreak, s.streak);
            if (!s.wrongFlags[s.index]) s.firstTry += 1;
            masterCode(ch.codex);
            checkAutoBadges(ch);
            sound('correct');
            fb.innerHTML = feedbackHtml(true, ch.explain, `+${gained} XP`);
            if (leveled) confetti();
            persist();
        } else {
            s.streak = 0;
            s.wrongFlags[s.index] = true;
            sound('wrong');
            fb.innerHTML = feedbackHtml(false,
                `Not quite. The correct answer is: <strong>${escapeHtml(ch.choices[ch.answer])}</strong>. ${ch.explain}`);
            persist();
        }
        // disable + highlight the choice buttons
        Array.from(document.querySelectorAll('.gq-choice')).forEach((btn, idx) => {
            btn.disabled = true;
            btn.classList.add(idx === ch.answer ? 'gq-correct' : (idx === i ? 'gq-wrong' : 'gq-dim'));
        });
        fb.innerHTML += `<div class="gq-next"><button class="gq-btn gq-btn-primary" onclick="Game.nextChallenge()">Next →</button></div>`;
    }

    function submitBuild() {
        const c = currentCase();
        const ch = c.challenges[s.index];
        if (s.locked) return;
        s.locked = true;
        const sels = document.querySelectorAll('.gq-buildsel');
        let allRight = true;
        sels.forEach(sel => {
            const field = ch.fields.find(f => f.id === sel.dataset.field);
            const ok = Number(sel.value) === field.answer;
            if (!ok) allRight = false;
            sel.classList.add(ok ? 'gq-fld-ok' : 'gq-fld-bad');
            sel.disabled = true;
        });
        const fb = document.getElementById('gq-feedback');
        if (allRight) {
            const mult = streakMult();
            const gained = Math.round(GAME.rewards[ch.difficulty] * mult);
            const leveled = addXp(gained); s.xp += gained;
            s.streak += 1; save.bestStreak = Math.max(save.bestStreak, s.streak);
            if (!s.wrongFlags[s.index]) s.firstTry += 1;
            (ch.fields || []).forEach(f => masterCode(f.codex));
            grant('architect', true);
            checkAutoBadges(ch);
            sound('correct');
            fb.innerHTML = feedbackHtml(true, ch.explain, `+${gained} XP`);
            if (leveled) confetti();
            persist();
        } else {
            s.streak = 0; s.wrongFlags[s.index] = true;
            sound('wrong');
            fb.innerHTML = feedbackHtml(false,
                `Some fields are off (red). Reveal: the correct values are ${buildReveal(ch)}. ${ch.explain}`);
            persist();
        }
        fb.innerHTML += `<div class="gq-next"><button class="gq-btn gq-btn-primary" onclick="Game.nextChallenge()">Next →</button></div>`;
    }

    function buildReveal(ch) {
        return ch.fields.map(f => `<code>${f.label}=${escapeHtml(f.options[f.answer])}</code>`).join(' ');
    }

    function feedbackHtml(ok, explain, badge) {
        return `<div class="gq-feedback ${ok ? 'gq-fb-ok' : 'gq-fb-no'}">
            <div class="gq-fb-head">${ok ? '✅ Correct' : '❌ Not quite'} ${badge ? `<span class="gq-fb-gain">${badge}</span>` : ''}</div>
            <div class="gq-fb-body">${explain}</div>
        </div>`;
    }

    function checkAutoBadges(ch) {
        grant('first-steps', true);
        grant('on-fire', s.streak >= 5);
        grant('unstoppable', s.streak >= 10);
        if (ch.type === 'jsonhunt') grant('detective', true);
        if (level() >= 5) grant('level5', true);
    }

    function nextChallenge() {
        s.index += 1;
        const c = currentCase();
        if (s.index >= c.challenges.length) {
            // finalize case
            const ratio = s.firstTry / c.challenges.length;
            const stars = ratio === 1 ? 3 : ratio >= 0.5 ? 2 : 1;
            const prev = save.completed[c.id] || 0;
            save.completed[c.id] = Math.max(prev, stars);
            const wasFirst = prev === 0;
            grant('case-cracker', wasFirst);
            persist();
            sound('badge');
            screen = 'caseResult';
            render();
            confetti();
        } else {
            s.locked = false;
            render();
        }
    }

    // ----- Case result -----
    function screenCaseResult() {
        const c = currentCase();
        const stars = save.completed[c.id];
        const idx = GAME.cases.findIndex(x => x.id === c.id);
        const next = GAME.cases[idx + 1];
        return `
        <div class="gq-screen gq-result">
            <div class="gq-result-icon">${c.icon}</div>
            <h3>Case Closed</h3>
            <div class="gq-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
            <div class="gq-result-title">${c.title}</div>
            <div class="gq-result-stat">+${s.xp} XP earned &middot; ${s.firstTry}/${c.challenges.length} correct on first try</div>
            <div class="gq-result-actions">
                <button class="gq-btn" onclick="Game.go('cases')">Case list</button>
                ${next ? `<button class="gq-btn gq-btn-primary" onclick="Game.startCase('${next.id}')">Next case →</button>` : `<button class="gq-btn gq-btn-primary" onclick="Game.go('arcadeMenu')">Try the Arcade</button>`}
            </div>
        </div>`;
    }

    // ----- Arcade -----
    function screenArcadeMenu() {
        const cats = GAME.arcade.categories.map(cat => {
            const high = save.arcadeHigh[cat.id] || 0;
            const count = GAME.codes.filter(cat.filter).length;
            return `<button class="gq-bigcard gq-arcadepick" onclick="Game.startArcade('${cat.id}')">
                <span class="gq-bc-icon">${cat.icon}</span>
                <span class="gq-bc-title">${cat.name}</span>
                <span class="gq-bc-sub">Best: ${high} &middot; ${count} codes</span>
            </button>`;
        }).join('');
        return `<div class="gq-screen"><h3>Arcade — Timed Drill</h3>
            <p class="gq-sub">Answer as many as you can in ${GAME.arcade.roundSeconds}s. Combo multiplier grows your streak. Wrong answers reset it.</p>
            <div class="gq-cards gq-cards-row">${cats}</div></div>`;
    }

    function startArcade(catId) {
        const cat = GAME.arcade.categories.find(c => c.id === catId);
        const pool = GAME.codes.filter(cat.filter);
        const qs = buildArcadeQueue(pool);
        s = { mode: 'arcade', cat: catId, queue: qs, index: 0, correct: 0, combo: 0, bestCombo: 0, xp: 0, timeLeft: GAME.arcade.roundSeconds, locked: false };
        screen = 'arcadePlay';
        sound('click');
        render();
        startArcadeTimer();
    }

    function buildArcadeQueue(pool) {
        // For each code produce a random question variant; shuffle order.
        const qs = [];
        pool.forEach(code => {
            qs.push(makeArcadeQ(code, pool, 'code2name'));
            if (Math.random() < 0.5) qs.push(makeArcadeQ(code, pool, 'name2code'));
        });
        for (let i = qs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [qs[i], qs[j]] = [qs[j], qs[i]];
        }
        return qs;
    }

    function makeArcadeQ(code, pool, variant) {
        const distractors = pool.filter(c => c.id !== code.id)
            .sort(() => Math.random() - 0.5).slice(0, 3);
        if (variant === 'code2name') {
            const choices = shuffleOpts([code, ...distractors].map(c => c.display));
            return {
                prompt: `What does <strong>${code.system} ${code.code}</strong> measure?`,
                choices, answer: choices.indexOf(code.display),
                explain: `${code.system} ${code.code} = ${code.display}. ${code.explain}`,
                codex: code.id
            };
        }
        const choices = shuffleOpts([code, ...distractors].map(c => `${c.code}`));
        return {
            prompt: `Which <strong>${code.system}</strong> code is “${code.display}”?`,
            choices, answer: choices.indexOf(code.code),
            explain: `${code.display} = ${code.system} ${code.code}.`,
            codex: code.id
        };
    }
    function shuffleOpts(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    let arcadeTimer = null;
    function startArcadeTimer() {
        clearInterval(arcadeTimer);
        arcadeTimer = setInterval(() => {
            s.timeLeft -= 1;
            const el = document.getElementById('gq-arcade-time');
            if (el) {
                el.textContent = s.timeLeft + 's';
                el.classList.toggle('gq-time-low', s.timeLeft <= 10);
            }
            if (s.timeLeft <= 0) endArcade();
        }, 1000);
    }
    function endArcade() {
        clearInterval(arcadeTimer);
        const leveled = addXp(s.xp); // bank arcade XP + detect level-up
        save.arcadeHigh[s.cat] = Math.max(save.arcadeHigh[s.cat] || 0, s.correct);
        grant('arcade-pro', s.correct >= 10);
        persist();
        screen = 'arcadeResult';
        sound('badge');
        render();
        if (s.correct >= 8 || leveled) confetti();
    }

    function screenArcadePlay() {
        const q = s.queue[s.index % s.queue.length];
        const choices = q.choices.map((opt, i) =>
            `<button class="gq-choice gq-arcade-choice" onclick="Game.arcadeAnswer(${i})">${escapeHtml(opt)}</button>`).join('');
        return `
        <div class="gq-screen gq-arcade">
            <div class="gq-arcade-head">
                <span class="gq-arcade-score">✓ ${s.correct}</span>
                <span id="gq-arcade-time" class="gq-arcade-time">${s.timeLeft}s</span>
                <span class="gq-arcade-combo">🔥 ${s.combo}</span>
            </div>
            <div class="gq-prompt">${q.prompt}</div>
            <div class="gq-choices gq-choices-grid">${choices}</div>
            <div id="gq-feedback"></div>
        </div>`;
    }

    function arcadeAnswer(i) {
        if (s.locked) return;
        const q = s.queue[s.index % s.queue.length];
        const correct = i === q.answer;
        if (correct) {
            s.combo += 1; s.bestCombo = Math.max(s.bestCombo, s.combo);
            s.correct += 1;
            const gained = Math.round(GAME.arcade.baseXp * (1 + Math.min(s.combo - 1, MAX_STREAK_MULT) * 0.1));
            s.xp += gained;
            save.bestStreak = Math.max(save.bestStreak, s.combo);
            masterCode(q.codex);
            grant('first-steps', true);
            grant('on-fire', s.combo >= 5);
            grant('unstoppable', s.combo >= 10);
            if (level() >= 5) grant('level5', true);
            sound('correct');
        } else {
            s.combo = 0;
            sound('wrong');
        }
        s.locked = true;
        // brief flash of correctness, then advance
        Array.from(document.querySelectorAll('.gq-arcade-choice')).forEach((btn, idx) => {
            btn.disabled = true;
            btn.classList.add(idx === q.answer ? 'gq-correct' : (idx === i ? 'gq-wrong' : 'gq-dim'));
        });
        const fb = document.getElementById('gq-feedback');
        fb.innerHTML = `<div class="gq-feedback ${correct ? 'gq-fb-ok' : 'gq-fb-no'} gq-fb-mini">${correct ? '✅' : '❌ ' + q.explain}</div>`;
        setTimeout(() => {
            s.index += 1; s.locked = false;
            if (screen === 'arcadePlay') render();
        }, 550);
    }

    function screenArcadeResult() {
        const high = save.arcadeHigh[s.cat] || 0;
        return `
        <div class="gq-screen gq-result">
            <div class="gq-result-icon">🕹️</div>
            <h3>Round Over</h3>
            <div class="gq-result-stat">${s.correct} correct &middot; best combo ${s.bestCombo} &middot; +${s.xp} XP</div>
            <div class="gq-result-stat">Personal best: ${high}</div>
            <div class="gq-result-actions">
                <button class="gq-btn gq-btn-primary" onclick="Game.startArcade('${s.cat}')">Play again</button>
                <button class="gq-btn" onclick="Game.go('arcadeMenu')">Change category</button>
                <button class="gq-btn" onclick="Game.goMenu()">Home</button>
            </div>
        </div>`;
    }

    // ----- Codex -----
    function screenCodex() {
        const terms = GAME.codes.map(c => {
            const known = save.codex.indexOf(c.id) !== -1;
            return `<div class="gq-codex-card ${known ? '' : 'gq-locked'}">
                <div class="gq-codex-sys">${c.system}</div>
                <div class="gq-codex-code">${c.code}</div>
                <div class="gq-codex-name">${known ? c.display : '???'}</div>
                ${known ? `<div class="gq-codex-hint">${c.hint}</div>` : ''}
            </div>`;
        }).join('');
        const badges = GAME.badges.map(b => {
            const got = save.badges.indexOf(b.id) !== -1;
            return `<div class="gq-badge ${got ? '' : 'gq-locked'}" title="${b.desc}">
                <div class="gq-badge-icon">${got ? b.icon : '🔒'}</div>
                <div class="gq-badge-name">${b.name}</div>
                <div class="gq-badge-desc">${b.desc}</div>
            </div>`;
        }).join('');
        return `
        <div class="gq-screen gq-codex">
            <h3>📖 Codex</h3>
            <p class="gq-sub">Master codes in Quest &amp; Arcade to reveal them here.</p>
            <div class="gq-codex-grid">${terms}</div>
            <h3 style="margin-top:24px">🏆 Badges (${save.badges.length}/${GAME.badges.length})</h3>
            <div class="gq-badge-grid">${badges}</div>
            <div class="gq-codex-foot">
                <button class="gq-btn gq-btn-danger" onclick="Game.resetProgress()">Reset progress</button>
            </div>
        </div>`;
    }

    // ----- Navigation -----
    function currentCase() { return GAME.cases.find(c => c.id === s.caseId); }

    function startCase(caseId) {
        const c = GAME.cases.find(x => x.id === caseId);
        if (!c) return;
        s = { caseId, index: 0, xp: 0, streak: 0, firstTry: 0, wrongFlags: [], locked: false };
        screen = 'brief';
        sound('click');
        render();
    }
    function beginChallenges() { screen = 'play'; s.locked = false; sound('click'); render(); }

    function go(target) {
        clearInterval(arcadeTimer);
        screen = target;
        sound('click');
        render();
    }
    function goMenu() { go('menu'); }
    function toggleMute() { save.muted = !save.muted; persist(); render(); }

    function resetProgress() {
        if (!confirm('Reset all XP, badges, codex entries, and case progress? This cannot be undone.')) return;
        save = { xp: 0, codex: [], badges: [], completed: {}, arcadeHigh: {}, bestStreak: 0, muted: save.muted };
        persist();
        screen = 'menu';
        render();
    }

    return {
        init, show,
        startCase, beginChallenges, nextChallenge,
        answer, submitBuild,
        startArcade, arcadeAnswer,
        go, goMenu, toggleMute, resetProgress
    };
})();

// Expose on window: a top-level `const` is not an automatic property of the
// global object, but the viewer's switchTab() and inline onclick handlers look
// it up as a global. This makes both `window.Game` and bare `Game` resolve.
window.Game = Game;

// Boot + tab wiring
document.addEventListener('DOMContentLoaded', function () { Game.init(); });
