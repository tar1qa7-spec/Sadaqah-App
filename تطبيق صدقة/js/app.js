// ============================================================
// app.js – Core App Logic: Setup, Dedication, Navigation
// ============================================================

'use strict';

// ─── STATE ───────────────────────────────────────────────
let appState = {
    persons: [],
    isSetup: false,
    currentTab: 'quran',
    hasanat: 0,
    letters: 0,
    currentPersonEdit: null,
    currentAvatarData: null,
    currentRelation: '',
    currentStatus: '',
};

// ─── LOCALSTORAGE HELPERS ─────────────────────────────────
const LS = {
    get: k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

// ─── INIT ─────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    // Simulate loading
    setTimeout(initApp, 2800);
});

function initApp() {
    initTheme();

    // Load saved data
    const saved = LS.get('sadaqah_persons');
    const stats = LS.get('sadaqah_stats') || {};
    if (saved && saved.length > 0) {
        appState.persons = saved;
        appState.isSetup = true;
    }
    appState.hasanat = stats.hasanat || 0;
    appState.letters = stats.letters || 0;

    hideSplash();

    if (!appState.isSetup) {
        showScreen('setup-screen');
    } else {
        showDedicationScreen();
    }
}

function initTheme() {
    const t = LS.get('sadaqah_theme') || 'dark';
    if (t === 'light') {
        document.documentElement.classList.add('light-mode');
        const icn = document.getElementById('btn-theme-toggle');
        if (icn) icn.innerHTML = '<i class="fas fa-moon"></i>';
    }
}

function toggleTheme() {
    const isLight = document.documentElement.classList.toggle('light-mode');
    LS.set('sadaqah_theme', isLight ? 'light' : 'dark');
    const icn = document.getElementById('btn-theme-toggle');
    if (icn) {
        icn.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    }
}

function hideSplash() {
    const splash = document.getElementById('splash-screen');
    splash.style.opacity = '0';
    splash.style.transition = 'opacity .5s ease';
    setTimeout(() => splash.style.display = 'none', 500);
}

// ─── SCREEN MANAGEMENT ───────────────────────────────────
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    const el = document.getElementById(id);
    if (el) {
        el.style.display = (id === 'main-app' || id === 'person-modal' || id === 'achievements-modal') ? 'flex' : 'block';
        el.scrollTop = 0;
    }
}

function goToScreen(id) { showScreen(id); }

// ─── SETUP SCREEN ─────────────────────────────────────────
document.getElementById('btn-add-first-person').onclick = () => openPersonModal();

function renderPersonsList() {
    const list = document.getElementById('persons-list');
    list.innerHTML = '';
    appState.persons.forEach((p, i) => {
        const card = document.createElement('div');
        card.className = 'person-card';
        card.innerHTML = `
      <div class="person-card-avatar">
        ${p.avatar ? `<img src="${p.avatar}" />` : '<i class="fas fa-user"></i>'}
      </div>
      <div class="person-card-info">
        <h4>${p.name}</h4>
        <p>${p.relation}</p>
        <span class="person-card-status">${p.status}</span>
      </div>
      <div class="person-card-actions">
        <button class="btn-card-action" onclick="editPerson(${i})"><i class="fas fa-edit"></i></button>
        <button class="btn-card-action delete" onclick="deletePerson(${i})"><i class="fas fa-trash"></i></button>
      </div>`;
        list.appendChild(card);
    });
    const startBtn = document.getElementById('btn-start-app');
    startBtn.style.display = appState.persons.length > 0 ? 'block' : 'none';
}

document.getElementById('btn-start-app').onclick = () => {
    appState.isSetup = true;
    LS.set('sadaqah_persons', appState.persons);
    showDedicationScreen();
};

// ─── PERSON MODAL ─────────────────────────────────────────
function openPersonModal(editIdx = null) {
    appState.currentPersonEdit = editIdx;
    appState.currentAvatarData = null;
    appState.currentRelation = '';
    appState.currentStatus = '';

    const modal = document.getElementById('person-modal');
    document.getElementById('person-modal-title').textContent = editIdx !== null ? 'تعديل شخص' : 'إضافة شخص';
    document.getElementById('person-name').value = '';
    document.getElementById('person-relation-custom').value = '';
    document.getElementById('avatar-preview').innerHTML = '<i class="fas fa-user"></i>';

    // Reset selections
    document.querySelectorAll('.relation-btn, .status-btn').forEach(b => b.classList.remove('selected'));

    if (editIdx !== null) {
        const p = appState.persons[editIdx];
        document.getElementById('person-name').value = p.name;
        document.getElementById('person-relation-custom').value = p.relation;
        appState.currentRelation = p.relation;
        appState.currentStatus = p.status;
        appState.currentAvatarData = p.avatar;
        if (p.avatar) document.getElementById('avatar-preview').innerHTML = `<img src="${p.avatar}" />`;
        // Pre-select relation/status buttons
        document.querySelectorAll('.relation-btn').forEach(b => {
            if (b.dataset.value === p.relation) b.classList.add('selected');
        });
        document.querySelectorAll('.status-btn').forEach(b => {
            if (b.dataset.value === p.status) b.classList.add('selected');
        });
    }

    modal.style.display = 'flex';
}

function closePersonModal() {
    document.getElementById('person-modal').style.display = 'none';
}

function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        appState.currentAvatarData = ev.target.result;
        document.getElementById('avatar-preview').innerHTML = `<img src="${ev.target.result}" />`;
    };
    reader.readAsDataURL(file);
}

function selectRelation(btn) {
    document.querySelectorAll('.relation-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    appState.currentRelation = btn.dataset.value;
    if (btn.dataset.value !== 'أخرى') {
        document.getElementById('person-relation-custom').value = btn.dataset.value;
    }
}

function selectStatus(btn) {
    document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    appState.currentStatus = btn.dataset.value;
}

function savePerson() {
    const name = document.getElementById('person-name').value.trim();
    const relationCustom = document.getElementById('person-relation-custom').value.trim();
    const relation = relationCustom || appState.currentRelation;
    const status = appState.currentStatus;

    if (!name) { showToast('يرجى إدخال الاسم'); return; }
    if (!relation) { showToast('يرجى تحديد صلة القرابة'); return; }
    if (!status) { showToast('يرجى تحديد الحالة'); return; }

    const person = { name, relation, status, avatar: appState.currentAvatarData };

    if (appState.currentPersonEdit !== null) {
        appState.persons[appState.currentPersonEdit] = person;
    } else {
        appState.persons.push(person);
    }

    LS.set('sadaqah_persons', appState.persons);
    closePersonModal();
    renderPersonsList();

    // If on dedication screen, refresh it
    if (document.getElementById('dedication-screen').style.display !== 'none') {
        renderDedicationPersons();
    }
    showToast('تم الحفظ بنجاح ✓');
}

function editPerson(i) { openPersonModal(i); }

function deletePerson(i) {
    if (!confirm('هل تريد حذف هذا الشخص؟')) return;
    appState.persons.splice(i, 1);
    LS.set('sadaqah_persons', appState.persons);
    renderPersonsList();
    if (appState.persons.length === 0) {
        document.getElementById('btn-start-app').style.display = 'none';
    }
}

// ─── DEDICATION SCREEN ────────────────────────────────────
function showDedicationScreen() {
    showScreen('dedication-screen');
    renderDedicationPersons();
    updateHasanatDisplay();
}

function renderDedicationPersons() {
    const row = document.getElementById('dedication-persons-row');
    row.innerHTML = '';
    if (!appState.persons.length) {
        row.innerHTML = '<p style="color:var(--text-dim);text-align:center;">لم تُضَف أشخاص بعد</p>';
        return;
    }
    appState.persons.forEach(p => {
        const card = document.createElement('div');
        card.className = 'dedication-person-card';
        card.innerHTML = `
      <div class="ded-person-avatar">
        ${p.avatar ? `<img src="${p.avatar}" />` : '<i class="fas fa-user"></i>'}
      </div>
      <div class="ded-person-name">${p.name}</div>
      <div class="ded-person-relation">${p.relation}</div>
      <div class="ded-person-status">${getStatusIcon(p.status)} ${p.status}</div>`;
        row.appendChild(card);
    });
}

function getStatusIcon(status) {
    const icons = { 'متوفى': '🌙', 'مريض': '💚', 'على قيد الحياة': '☀️' };
    return icons[status] || '💛';
}

function updateHasanatDisplay() {
    const h = appState.hasanat;
    const l = appState.letters;
    document.getElementById('total-hasanat').textContent = h.toLocaleString('ar');
    document.getElementById('total-letters').textContent = l.toLocaleString('ar');
    const topEl = document.getElementById('top-hasanat');
    if (topEl) topEl.textContent = h > 999 ? (h / 1000).toFixed(1) + 'k' : h;
}

function openDedicationEditor() {
    renderPersonsList();
    showScreen('setup-screen');
    // Show back option
    const container = document.querySelector('.setup-container');
    let backBtn = document.getElementById('back-to-ded');
    if (!backBtn) {
        backBtn = document.createElement('button');
        backBtn.id = 'back-to-ded';
        backBtn.className = 'btn-add-person';
        backBtn.style.marginBottom = '0';
        backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> العودة';
        backBtn.onclick = () => showDedicationScreen();
        container.appendChild(backBtn);
    }
}

function goToMainApp() {
    showScreen('main-app');
    initMainApp();
}

// ─── MAIN APP ─────────────────────────────────────────────
let mainAppInitialized = false;

function initMainApp() {
    if (!mainAppInitialized) {
        mainAppInitialized = true;
        renderMiniDedication();
        updateHasanatDisplay();
        // Init all modules
        if (typeof initQuranTab === 'function') initQuranTab();
        if (typeof initListenTab === 'function') initListenTab();
        if (typeof initPrayerTab === 'function') initPrayerTab();
        if (typeof initAzkarTab === 'function') initAzkarTab();
        if (typeof initProgressTab === 'function') initProgressTab();
        if (typeof initHadithTab === 'function') initHadithTab();
    }
    updateHasanatDisplay();
}

function renderMiniDedication() {
    const mini = document.querySelector('.mini-avatars');
    if (!mini) return;
    mini.innerHTML = '';
    appState.persons.slice(0, 3).forEach(p => {
        const av = document.createElement('div');
        av.className = 'mini-avatar';
        av.innerHTML = p.avatar ? `<img src="${p.avatar}" />` : `<i class="fas fa-user" style="font-size:.65rem;"></i>`;
        mini.appendChild(av);
    });
}

// ─── TAB SWITCHING ────────────────────────────────────────
function switchTab(tab, btn) {
    appState.currentTab = tab;
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const tabEl = document.getElementById(`tab-${tab}`);
    if (tabEl) tabEl.classList.add('active');
    if (btn) btn.classList.add('active');
    else {
        const navBtn = document.getElementById(`nav-${tab}`);
        if (navBtn) navBtn.classList.add('active');
    }

    // Lazy init
    if (tab === 'prayer' && typeof initPrayerTab === 'function') initPrayerTab();
    if (tab === 'azkar' && typeof initAzkarTab === 'function') initAzkarTab();
    if (tab === 'listen' && typeof initListenTab === 'function') initListenTab();
    if (tab === 'progress' && typeof initProgressTab === 'function') initProgressTab();
    if (tab === 'hadith' && typeof initHadithTab === 'function') initHadithTab();
}

// ─── ACHIEVEMENTS ─────────────────────────────────────────
function showAchievements() {
    const modal = document.getElementById('achievements-modal');
    modal.style.display = 'flex';
    document.getElementById('ach-hasanat').textContent = appState.hasanat.toLocaleString('ar');
    document.getElementById('ach-letters').textContent = appState.letters.toLocaleString('ar');
    renderAchievementBadges('achievements-badges-list');
}

function closeAchievements() {
    document.getElementById('achievements-modal').style.display = 'none';
}

function renderAchievementBadges(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const stats = LS.get('sadaqah_stats') || {};
    const earnedBadges = stats.badges || [];
    container.innerHTML = '';
    BADGES.forEach(b => {
        const earned = earnedBadges.includes(b.id);
        const div = document.createElement('div');
        div.className = `badge-item${earned ? ' earned' : ''}`;
        div.innerHTML = `
      <div class="badge-icon">${b.icon}</div>
      <div class="badge-name">${b.name}</div>`;
        div.title = b.desc;
        container.appendChild(div);
    });
}

// ─── STATS UPDATE ─────────────────────────────────────────
function addStats(ayahsCount, lettersCount) {
    appState.hasanat += lettersCount * 10; // كل حرف بعشر حسنات
    appState.letters += lettersCount;

    const stats = LS.get('sadaqah_stats') || {};
    stats.hasanat = appState.hasanat;
    stats.letters = appState.letters;
    stats.ayahsRead = (stats.ayahsRead || 0) + ayahsCount;
    stats.lastActivity = Date.now();

    // Streak
    const today = new Date().toDateString();
    if (stats.lastDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        stats.streak = (stats.lastDate === yesterday) ? (stats.streak || 0) + 1 : 1;
        stats.lastDate = today;
    }

    // Check badges
    stats.badges = stats.badges || [];
    checkBadges(stats);
    LS.set('sadaqah_stats', stats);
    updateHasanatDisplay();
}

function checkBadges(stats) {
    const ayahs = stats.ayahsRead || 0;
    const surahs = (stats.completedSurahs || []).length;
    const streak = stats.streak || 0;

    BADGES.forEach(b => {
        if (stats.badges.includes(b.id)) return;
        let earned = false;
        if (b.type === 'ayahs' && ayahs >= b.threshold) earned = true;
        if (b.type === 'surahs' && surahs >= b.threshold) earned = true;
        if (b.type === 'streak' && streak >= b.threshold) earned = true;
        if (earned) {
            stats.badges.push(b.id);
            showToast(`🏆 وسام جديد: ${b.name}`);
        }
    });
}

// ─── TOAST ────────────────────────────────────────────────
function showToast(msg, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.display = 'block';
    toast.style.opacity = '1';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.style.display = 'none', 300);
    }, duration);
}

// ─── LISTEN SUBTAB ────────────────────────────────────────
function switchListenTab(tab, btn) {
    document.querySelectorAll('.listen-subtab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.listen-panel').forEach(p => p.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const panel = document.getElementById(`panel-${tab}`);
    if (panel) panel.classList.add('active');
}

// ─── HADITH SUBTAB ────────────────────────────────────────
function switchHadithTab(tab, btn) {
    document.querySelectorAll('.hadith-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.hadith-panel').forEach(p => p.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const panel = document.getElementById(`hadith-${tab}-panel`);
    if (panel) panel.classList.add('active');
}

// ─── INDEX SUBTAB ─────────────────────────────────────────
function switchIndexTab(tab, btn) {
    document.querySelectorAll('.index-tab').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    document.getElementById('surahs-list').style.display = tab === 'surahs' ? 'flex' : 'none';
    document.getElementById('ajza-list').style.display = tab === 'ajza' ? 'grid' : 'none';
    document.getElementById('ahzab-list').style.display = tab === 'ahzab' ? 'grid' : 'none';
    if (tab === 'ajza') renderAjzaList();
    if (tab === 'ahzab') renderAhzabList();
}

function renderAjzaList() {
    const list = document.getElementById('ajza-list');
    if (list.children.length > 0) return;
    AJZA.forEach(j => {
        const card = document.createElement('div');
        card.className = 'juz-card';
        card.innerHTML = `<div class="juz-number">${j.n}</div><div class="juz-name">جزء ${j.name}</div><div class="juz-start">يبدأ من: ${j.start}</div>`;
        card.onclick = () => {
            // Find first surah of juz
            const s = SURAHS.find(s => s.juz === j.n);
            if (s) openSurahReader(s.n);
        };
        list.appendChild(card);
    });
}

function renderAhzabList() {
    const list = document.getElementById('ahzab-list');
    if (list.children.length > 0) return;
    for (let i = 1; i <= 60; i++) {
        const card = document.createElement('div');
        card.className = 'hizb-card';
        card.innerHTML = `<div class="juz-number">${i}</div><div class="juz-name">الحزب ${i}</div>`;
        list.appendChild(card);
    }
}

// ─── UTILITIES ────────────────────────────────────────────
function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
}

function arabicNumber(n) {
    const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(n).replace(/[0-9]/g, d => digits[d]);
}
