// ============================================================
// player.js – Audio Player: Reciters, Radio, Live, Ayah Sync
// ============================================================

let playerState = {
    reciter: null,
    surahNum: 0,
    surahList: [],
    isPlaying: false,
    isRepeat: false,
    audioUrl: '',
    hlsInstance: null,
    playlist: null,       // alquran.cloud verse-by-verse
    playlistIndex: 0,
    useTimings: false,    // only for Al-Zain
    currentSurahAyahs: [],// cached uthmani text
    designMode: 'A'       // 'A' for Apple Music (sync/radio), 'B' for Islamic Green (manual scroll)
};

let allReciters = [];
let allRadios = [];
let listenInitialized = false;
let ayahTimings = [];
let timingInterval = null;

// ─── INIT LISTEN TAB ──────────────────────────────────────
async function initListenTab() {
    if (listenInitialized) return;
    listenInitialized = true;
    await Promise.all([loadReciters(), loadRadios()]);
}

// ─── LOAD RECITERS FROM ALQURAN.CLOUD ────────────────────
async function loadReciters() {
    try {
        const cached = LS.get('alquran_reciters_v2');
        if (cached) {
            allReciters = cached;
        } else {
            const res = await fetch('https://api.alquran.cloud/v1/edition?format=audio&language=ar');
            const data = await res.json();
            allReciters = (data.data || []).filter(r => r.type === 'versebyverse');
            try { LS.set('alquran_reciters_v2', allReciters); } catch { }
        }
    } catch (e) { allReciters = []; }
    renderFeaturedReciters();
    renderRecitersGrid(allReciters);
}

async function loadRadios() {
    try {
        const cached = LS.get('mp3quran_radios');
        if (cached) {
            allRadios = cached;
        } else {
            const res = await fetch('https://mp3quran.net/api/v3/radios');
            const data = await res.json();
            allRadios = data.radios || [];
            try { LS.set('mp3quran_radios', allRadios); } catch { }
        }
        renderRadiosGrid(allRadios);
    } catch (e) {
        const g = document.getElementById('radios-grid');
        if (g) g.innerHTML = '<p style="color:var(--text-dim);text-align:center;padding:20px;">تعذّر تحميل الإذاعات</p>';
    }
}

// ─── RENDER FEATURED RECITERS ─────────────────────────────
function renderFeaturedReciters() {
    const grid = document.getElementById('featured-reciters-grid');
    if (!grid) return;
    grid.innerHTML = '';
    FEATURED_RECITERS.forEach(r => {
        const card = document.createElement('div');
        card.className = 'featured-reciter-card';
        const avatarHtml = r.avatar
            ? `<img src="${r.avatar}" alt="${r.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
            : `<span style="font-size:1.8rem;">${r.icon}</span>`;
        card.innerHTML = `
      <div class="reciter-avatar-icon" style="overflow:hidden;">${avatarHtml}</div>
      <div class="featured-reciter-name">${r.name}</div>`;
        card.onclick = () => selectReciter({ ...r });
        grid.appendChild(card);
    });
}

function renderRecitersGrid(reciters) {
    const grid = document.getElementById('reciters-grid');
    if (!grid) return;
    grid.innerHTML = '';
    reciters.slice(0, 60).forEach(r => {
        const item = document.createElement('div');
        item.className = 'reciter-list-item';
        item.innerHTML = `
      <div class="reciter-list-avatar"><i class="fas fa-microphone"></i></div>
      <div class="reciter-list-name">${r.name}</div>
      <i class="fas fa-chevron-left reciter-list-arrow"></i>`;
        item.onclick = () => selectReciter({ id: r.identifier, name: r.name, type: 'alquran' });
        grid.appendChild(item);
    });
}

function filterReciters() {
    const q = (document.getElementById('reciters-search')?.value || '').trim().toLowerCase();
    renderRecitersGrid(q ? allReciters.filter(r => r.name.toLowerCase().includes(q)) : allReciters);
}

function renderRadiosGrid(radios) {
    const grid = document.getElementById('radios-grid');
    if (!grid) return;
    grid.innerHTML = '';
    radios.slice(0, 50).forEach(r => {
        const card = document.createElement('div');
        card.className = 'radio-card';
        const safeName = r.name.trim().replace(/'/g, "\\'");
        card.innerHTML = `
      <div class="radio-icon"><i class="fas fa-radio"></i></div>
      <div class="radio-name">${r.name.trim()}</div>
      <button class="radio-btn-play" onclick="event.stopPropagation();playRadio('${r.url}','${safeName}')">
        <i class="fas fa-play"></i></button>`;
        card.onclick = () => playRadio(r.url, r.name.trim());
        grid.appendChild(card);
    });
}

function filterRadios() {
    const q = (document.getElementById('radio-search')?.value || '').trim();
    renderRadiosGrid(q ? allRadios.filter(r => r.name.includes(q)) : allRadios);
}

// ─── SELECT RECITER → SHOW SURAH SELECTOR ─────────────────
function selectReciter(reciter) {
    playerState.reciter = reciter;
    showSurahSelector(reciter);
}

function showSurahSelector(reciter) {
    let overlay = document.getElementById('surah-selector-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'surah-selector-overlay';
        overlay.style.cssText = `position:fixed;inset:0;z-index:600;background:rgba(0,0,0,.9);backdrop-filter:blur(10px);display:flex;flex-direction:column;`;
        document.body.appendChild(overlay);
    }

    const avatarHtml = reciter.avatar
        ? `<img src="${reciter.avatar}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid var(--accent);" />`
        : `<div style="width:44px;height:44px;border-radius:50%;background:var(--primary-light);display:flex;align-items:center;justify-content:center;font-size:1.3rem;">${reciter.icon || '🎙️'}</div>`;

    overlay.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;padding:16px;border-bottom:1px solid rgba(255,255,255,0.1);background:rgba(0,0,0,0.5);flex-shrink:0;">
      <button onclick="document.getElementById('surah-selector-overlay').style.display='none'"
              style="background:rgba(255,255,255,.1);border:none;color:#fff;width:36px;height:36px;border-radius:10px;cursor:pointer;font-size:1rem;">&rarr;</button>
      ${avatarHtml}
      <div style="color:#fff;">
        <div style="font-weight:700;font-size:.95rem;">${reciter.name}</div>
        <div style="font-size:.75rem;color:rgba(255,255,255,0.6);">اختر السورة للبدء</div>
      </div>
    </div>
    <div style="overflow-y:auto;flex:1;-webkit-overflow-scrolling:touch;padding:12px;display:flex;flex-direction:column;gap:6px;" id="surah-selector-list"></div>`;

    const list = overlay.querySelector('#surah-selector-list');
    SURAHS.forEach(s => {
        const item = document.createElement('div');
        item.className = 'surah-item';
        item.style.cssText = 'background:rgba(255,255,255,0.05); color:#fff; border-color:transparent;';
        item.innerHTML = `
      <div class="surah-number" style="background:rgba(255,255,255,0.1);color:#fff;">${s.n}</div>
      <div class="surah-info">
        <div class="surah-arabic" style="color:#fff;">${s.ar}</div>
        <div class="surah-meta" style="color:rgba(255,255,255,0.5);">${s.v} آية • ${s.type}</div>
      </div>
      <i class="fas fa-play" style="color:var(--accent);margin-left:6px;"></i>`;
        item.onclick = () => {
            overlay.style.display = 'none';
            playSurah(reciter, s.n);
        };
        list.appendChild(item);
    });
    overlay.style.display = 'flex';
}

// ─── PLAY SURAH ───────────────────────────────────────────
async function playSurah(reciter, surahNum) {
    playerState.reciter = reciter;
    playerState.surahNum = surahNum;
    playerState.surahList = SURAHS.map(s => s.n);
    playerState.isPlaying = true;
    playerState.playlist = null;
    playerState.playlistIndex = 0;
    playerState.currentSurahAyahs = [];
    playerState.designMode = (reciter.type === 'archive' && !reciter.hasTimings) ? 'B' : 'A';
    ayahTimings = [];

    if (timingInterval) clearInterval(timingInterval);

    const surah = SURAHS[surahNum - 1];
    const audio = document.getElementById('main-audio');
    if (playerState.hlsInstance) { playerState.hlsInstance.destroy(); playerState.hlsInstance = null; }

    // Update UI immediately
    const reciterAvatar = reciter.avatar ? `<img src="${reciter.avatar}" style="width:100%;height:100%;object-fit:cover;" />` : `<i class="fas fa-headphones"></i>`;
    document.getElementById('player-thumbnail').innerHTML = reciterAvatar;

    // reset texts
    if (document.getElementById('fp-a-ayah-text')) {
        document.getElementById('fp-a-ayah-text').textContent = 'جارٍ التحميل...';
        document.getElementById('fp-a-ayah-sub').textContent = '';
    }

    updatePlayerUI(surah.ar, reciter.name);
    showAudioPlayer();
    openFullPlayer();

    // Always preload Uthmani Quran text
    await loadSurahText(surahNum);

    if (reciter.type === 'archive') {
        // ── Archive.org mp3 (full surah file) ──
        playerState.useTimings = reciter.hasTimings === true;
        const paddedNum = String(surahNum).padStart(3, '0');

        let fileName = `${paddedNum}.mp3`;
        const url = `${reciter.server}${fileName}`;
        playerState.audioUrl = url;
        audio.src = url;
        audio.load();
        audio.play().catch(() => showToast('تعذّر التشغيل من Archive.org'));

        audio.onended = () => { if (playerState.isRepeat) { audio.play(); return; } playerNext(); };

        if (reciter.hasTimings) {
            // Al-Zain: use timing API
            await loadAndStartTimings(surahNum, reciter.timingReciterId || 1);
        } else {
            // Noreen / Fatih: show all ayahs for manual scrolling
            renderAllAyahsManual(playerState.currentSurahAyahs);
            startProgressOnly();
        }
    } else {
        // ── AlQuran.Cloud verse-by-verse ──
        playerState.useTimings = false;
        try {
            const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/${reciter.id}`);
            const data = await res.json();
            const audioAyahs = data.data.ayahs;
            playerState.playlist = audioAyahs.map((a, i) => ({
                url: a.audio,
                number: a.numberInSurah,
                text: playerState.currentSurahAyahs[i] ? playerState.currentSurahAyahs[i].text : ''
            }));
            playerState.playlistIndex = 0;
            playCurrentAyahPlaylist();
        } catch (e) {
            showToast('خطأ في جلب بيانات القارئ');
        }
    }
}

// ─── LOAD UTHMANI TEXT ────────────────────────────────────
async function loadSurahText(surahNum) {
    const cacheKey = `quran_surah_${surahNum}`;
    const cached = LS.get(cacheKey);
    if (cached) { playerState.currentSurahAyahs = cached; return; }
    try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/quran-uthmani`);
        const data = await res.json();
        playerState.currentSurahAyahs = data.data.ayahs.map(a => ({ number: a.numberInSurah, text: a.text }));
        try { LS.set(cacheKey, playerState.currentSurahAyahs); } catch { }
    } catch { }
}

// ─── TIMING-BASED SYNC (Al-Zain) ─────────────────────────
async function loadAndStartTimings(surahNum, reciterId) {
    try {
        const res = await fetch(`https://mp3quran.net/api/v3/ayat_timing?surah=${surahNum}&reciter=${reciterId}`);
        const data = await res.json();
        ayahTimings = data.ayat_timing || [];
        if (!ayahTimings.length) throw new Error('no timings');
    } catch {
        // Fallback: silently switch to just showing the first ayah or manual list
        document.getElementById('fp-a-ayah-text').textContent = playerState.currentSurahAyahs[0]?.text || '';
        document.getElementById('fp-a-ayah-sub').textContent = SURAHS[surahNum - 1]?.ar || '';
        startProgressOnly();
        return;
    }
    startTimingSync();
}

function startTimingSync() {
    const audio = document.getElementById('main-audio');
    let lastIdx = -1;
    timingInterval = setInterval(() => {
        if (!audio) return;
        updateProgressBar();
        if (audio.paused) return;

        const ms = audio.currentTime * 1000;
        let idx = -1;
        for (let i = 0; i < ayahTimings.length; i++) {
            if (ms >= (ayahTimings[i].startTime || 0)) idx = i;
            else break;
        }
        if (idx !== -1 && idx !== lastIdx) {
            lastIdx = idx;
            const ayahNum = ayahTimings[idx].ayah || (idx + 1);
            showCurrentAyah(ayahNum);
        }
    }, 200);
}

function showCurrentAyah(ayahNum) {
    const ayah = playerState.currentSurahAyahs.find(a => a.number === ayahNum);
    const surahName = SURAHS[playerState.surahNum - 1]?.ar || '';
    if (document.getElementById('fp-a-ayah-text')) {
        document.getElementById('fp-a-ayah-text').textContent = ayah ? ayah.text : '';
        document.getElementById('fp-a-ayah-sub').textContent = `${surahName} • الآية ${ayahNum}`;
    }
}

// ─── MANUAL SCROLL (Noreen / Fatih) ──────────────────────
function renderAllAyahsManual(ayahs) {
    const list = document.getElementById('fp-b-ayahs-list');
    if (!list) return;
    list.innerHTML = ayahs.map(a =>
        `<div class="fp-b-ayah-item" onclick="openAyahTafsirInPlayer(${a.number}, '${a.text.replace(/'/g, "\\'")}')">
            <div class="ayah-text-q">${a.text}</div>
            <div style="margin-top:12px; opacity:0.8;">
                <span class="ayah-num-badge">${a.number}</span>
                <span style="font-size: 0.8rem; color: rgba(255,255,255,0.5);"><i class="fas fa-book-open"></i> تفسير</span>
            </div>
        </div>`
    ).join('');
}

// ─── TAFSIR IN PLAYER ─────────────────────────────────────
async function openAyahTafsirInPlayer(ayahNum, text) {
    const audio = document.getElementById('main-audio');
    if (audio && !audio.paused) {
        audio.pause();
        playerState.isPlaying = false;
        document.getElementById('fp-b-play-btn').innerHTML = '<i class="fas fa-play"></i>';
        document.getElementById('btn-play-pause-mini').innerHTML = '<i class="fas fa-play"></i>';
    }

    let overlay = document.getElementById('fp-b-tafsir-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'fp-b-tafsir-overlay';
        overlay.style.cssText = `position:absolute; inset:0; z-index:30; background:url('img001/Kaaba masjid Al haram.jfif') center/cover; color:#fff; display:flex; flex-direction:column;`;

        const darkFilter = document.createElement('div');
        darkFilter.style.cssText = `position:absolute; inset:0; background:rgba(0,0,0,0.85); z-index:0; backdrop-filter:blur(4px);`;
        overlay.appendChild(darkFilter);

        const contentWrapper = document.createElement('div');
        contentWrapper.style.cssText = `position:relative; z-index:1; padding:20px; display:flex; flex-direction:column; height:100%;`;

        const header = document.createElement('div');
        header.style.cssText = `display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-top:max(20px, env(safe-area-inset-top));`;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '<i class="fas fa-arrow-right"></i> رجوع';
        closeBtn.style.cssText = `background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; font-size:1rem; padding:8px 16px; border-radius:20px; cursor:pointer; font-family:var(--font-main);`;
        closeBtn.onclick = () => {
            overlay.style.display = 'none';
            if (audio) {
                audio.play().catch(() => { });
                playerState.isPlaying = true;
                document.getElementById('fp-b-play-btn').innerHTML = '<i class="fas fa-pause"></i>';
                document.getElementById('btn-play-pause-mini').innerHTML = '<i class="fas fa-pause"></i>';
            }
        };

        const title = document.createElement('h3');
        title.id = 'fp-b-tafsir-title';
        title.style.cssText = `font-size:1.1rem; font-weight:700; color:var(--accent); margin:0;`;

        header.appendChild(closeBtn);
        header.appendChild(title);
        contentWrapper.appendChild(header);

        const bodyWrap = document.createElement('div');
        bodyWrap.style.cssText = `flex:1; overflow-y:auto; -webkit-overflow-scrolling:touch; padding-bottom:40px;`;

        const quranText = document.createElement('div');
        quranText.id = 'fp-b-tafsir-quran';
        quranText.style.cssText = `font-family:var(--font-quran); font-size:1.5rem; color:#fff; text-align:center; line-height:2.2; margin-bottom:24px; padding:16px; background:rgba(255,255,255,0.05); border-radius:12px; border:1px solid rgba(201,168,76,0.3);`;

        const tafsirText = document.createElement('div');
        tafsirText.id = 'fp-b-tafsir-text';
        tafsirText.style.cssText = `font-size:1.15rem; color:rgba(255,255,255,0.9); text-align:justify; line-height:2.2;`;

        bodyWrap.appendChild(quranText);
        bodyWrap.appendChild(tafsirText);
        contentWrapper.appendChild(bodyWrap);

        overlay.appendChild(contentWrapper);
        document.getElementById('fp-design-b').appendChild(overlay);
    }

    const surahName = SURAHS[playerState.surahNum - 1]?.ar || '';
    document.getElementById('fp-b-tafsir-title').textContent = `${surahName} - آية ${ayahNum}`;
    document.getElementById('fp-b-tafsir-quran').textContent = `﴿ ${text} ﴾`;
    document.getElementById('fp-b-tafsir-text').innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

    overlay.style.display = 'flex';

    try {
        const res = await fetch(`https://api.alquran.cloud/v1/ayah/${playerState.surahNum}:${ayahNum}/ar.muyassar`);
        const data = await res.json();
        const tafsir = data.data.text;
        document.getElementById('fp-b-tafsir-text').textContent = tafsir;
    } catch {
        document.getElementById('fp-b-tafsir-text').innerHTML = '<p style="text-align:center;color:red;">تعذّر جلب التفسير</p>';
    }
}

// ─── VERSE-BY-VERSE PLAYLIST ─────────────────────────────
function playCurrentAyahPlaylist() {
    const pl = playerState.playlist;
    if (!pl || playerState.playlistIndex >= pl.length) {
        if (playerState.isRepeat) { playerState.playlistIndex = 0; playCurrentAyahPlaylist(); }
        else playerNext();
        return;
    }
    const cur = pl[playerState.playlistIndex];
    const audio = document.getElementById('main-audio');
    playerState.audioUrl = cur.url;
    audio.src = cur.url;
    audio.load();
    audio.play().catch(() => { });
    playerState.isPlaying = true;

    const surahName = SURAHS[playerState.surahNum - 1]?.ar || '';
    if (document.getElementById('fp-a-ayah-text')) {
        document.getElementById('fp-a-ayah-text').textContent = cur.text;
        document.getElementById('fp-a-ayah-sub').textContent = `${surahName} • الآية ${cur.number}`;
    }

    updatePlayerUI(surahName, playerState.reciter?.name || '');
    audio.onended = () => { playerState.playlistIndex++; playCurrentAyahPlaylist(); };
}

// ─── PROGRESS ONLY (no timing) ────────────────────────────
function startProgressOnly() {
    timingInterval = setInterval(() => updateProgressBar(), 500);
}

// ─── PROGRESS BAR ─────────────────────────────────────────
function updateProgressBar() {
    const audio = document.getElementById('main-audio');
    let pct = 0, cv = '--:--', tv = '--:--';

    if (playerState.playlist) {
        const total = playerState.playlist.length;
        const cur = Math.min(playerState.playlistIndex + 1, total);
        pct = (cur / total) * 100;
        cv = `${cur}`; tv = `${total}`;
    } else if (audio && audio.duration) {
        pct = (audio.currentTime / audio.duration) * 100;
        cv = formatTime(audio.currentTime);
        tv = formatTime(audio.duration);
    }

    document.getElementById('progress-fill-mini').style.width = pct + '%';

    if (playerState.designMode === 'A') {
        const sb = document.getElementById('fp-seekbar');
        if (sb && !sb.matches(':active')) sb.value = pct;
        if (document.getElementById('fp-current-time')) document.getElementById('fp-current-time').textContent = cv;
        if (document.getElementById('fp-total-time')) document.getElementById('fp-total-time').textContent = tv;
    } else {
        const sb = document.getElementById('fp-b-seekbar');
        if (sb && !sb.matches(':active')) sb.value = pct;
        if (document.getElementById('fp-b-current-time')) document.getElementById('fp-b-current-time').textContent = cv;
        if (document.getElementById('fp-b-total-time')) document.getElementById('fp-b-total-time').textContent = tv;
    }
}

// ─── CONTROLS ─────────────────────────────────────────────
function togglePlay() {
    const audio = document.getElementById('main-audio');
    const playIcon = '<i class="fas fa-play"></i>';
    const pauseIcon = '<i class="fas fa-pause"></i>';

    if (playerState.isPlaying) {
        audio.pause(); playerState.isPlaying = false;
        document.getElementById('btn-play-pause-mini').innerHTML = playIcon;
        if (document.getElementById('fp-play-btn')) document.getElementById('fp-play-btn').innerHTML = playIcon;
        if (document.getElementById('fp-b-play-btn')) document.getElementById('fp-b-play-btn').innerHTML = playIcon;
        if (document.getElementById('wv-bars')) document.getElementById('wv-bars').style.opacity = '0.3';
    } else {
        audio.play(); playerState.isPlaying = true;
        document.getElementById('btn-play-pause-mini').innerHTML = pauseIcon;
        if (document.getElementById('fp-play-btn')) document.getElementById('fp-play-btn').innerHTML = pauseIcon;
        if (document.getElementById('fp-b-play-btn')) document.getElementById('fp-b-play-btn').innerHTML = pauseIcon;
        if (document.getElementById('wv-bars')) document.getElementById('wv-bars').style.opacity = '1';
    }
}

function playerNext() {
    const list = playerState.surahList;
    const idx = list.indexOf(playerState.surahNum);
    if (idx < list.length - 1) playSurah(playerState.reciter, list[idx + 1]);
}

function playerPrev() {
    const list = playerState.surahList;
    const idx = list.indexOf(playerState.surahNum);
    if (idx > 0) playSurah(playerState.reciter, list[idx - 1]);
}

function seekAudio(val) {
    if (playerState.playlist) {
        const newIdx = Math.floor((val / 100) * (playerState.playlist.length - 1));
        playerState.playlistIndex = newIdx;
        playCurrentAyahPlaylist();
    } else {
        const audio = document.getElementById('main-audio');
        if (audio.duration) audio.currentTime = (val / 100) * audio.duration;
    }
}

function toggleRepeat() {
    playerState.isRepeat = !playerState.isRepeat;
    if (document.getElementById('btn-repeat')) document.getElementById('btn-repeat').classList.toggle('active', playerState.isRepeat);
    if (document.getElementById('btn-repeat-b')) document.getElementById('btn-repeat-b').classList.toggle('active', playerState.isRepeat);
    showToast(playerState.isRepeat ? 'تكرار السورة ✓' : 'إيقاف التكرار');
}

function openFullPlayer() {
    const modal = document.getElementById('full-player-modal');
    modal.style.display = 'flex';

    if (playerState.designMode === 'A') {
        document.getElementById('fp-design-a').style.display = 'flex';
        document.getElementById('fp-design-b').style.display = 'none';

        // ALWAYS USE KAABA FOR DESIGN A BACKGROUND
        const url = 'img001/Kaaba masjid Al haram.jfif';
        document.getElementById('fp-a-art-inner').style.backgroundImage = `url('${url}')`;
        document.getElementById('fp-a-bg').style.backgroundImage = `url('${url}')`;
    } else {
        document.getElementById('fp-design-a').style.display = 'none';
        document.getElementById('fp-design-b').style.display = 'flex';
    }
}

function closeFullPlayer() {
    document.getElementById('full-player-modal').style.display = 'none';
}

function toggleFullscreen() {
    const el = document.getElementById('full-player-modal');
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
}

function downloadCurrentSurah() {
    if (!playerState.audioUrl) { showToast('لا يوجد صوت للتنزيل'); return; }
    if (playerState.playlist) { showToast('التنزيل غير متاح لهذا القارئ حالياً', 4000); return; }
    const a = document.createElement('a');
    a.href = playerState.audioUrl;
    a.download = `${SURAHS[playerState.surahNum - 1]?.ar || 'surah'}.mp3`;
    a.target = '_blank';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    showToast('جارٍ التنزيل...');
}

// ─── RADIO & LIVE ─────────────────────────────────────────
function playRadio(url, name) {
    const audio = document.getElementById('main-audio');
    if (playerState.hlsInstance) { playerState.hlsInstance.destroy(); playerState.hlsInstance = null; }
    if (timingInterval) clearInterval(timingInterval);
    playerState.playlist = null;
    playerState.useTimings = false;
    playerState.designMode = 'A'; // Radio uses design A

    if (url.includes('.m3u8') && typeof Hls !== 'undefined' && Hls.isSupported()) {
        playerState.hlsInstance = new Hls();
        playerState.hlsInstance.loadSource(url);
        playerState.hlsInstance.attachMedia(audio);
        playerState.hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => audio.play());
    } else {
        audio.src = url;
        audio.play().catch(() => showToast('تعذّر تشغيل الإذاعة'));
    }

    playerState.isPlaying = true;
    playerState.audioUrl = url;
    document.getElementById('player-thumbnail').innerHTML = '<i class="fas fa-radio"></i>';

    if (document.getElementById('fp-a-ayah-text')) {
        document.getElementById('fp-a-ayah-text').textContent = '📻 البث المباشر';
        document.getElementById('fp-a-ayah-sub').textContent = name;
    }

    updatePlayerUI('بث مباشر', name);
    document.getElementById('fp-current-time').textContent = '--:--';
    document.getElementById('fp-total-time').textContent = '--:--';
    showAudioPlayer();
    showToast(`▶ ${name}`);
}

function playLiveChannel(channel) {
    const urls = {
        quran: 'https://win.holol.com/live/quran/playlist.m3u8',
        sunnah: 'https://win.holol.com/live/sunnah/playlist.m3u8'
    };
    const names = { quran: 'قناة القرآن الكريم', sunnah: 'قناة الحديث الشريف' };
    playRadio(urls[channel], names[channel]);
}

// ─── HELPERS ──────────────────────────────────────────────
function updatePlayerUI(surahName, reciterName) {
    document.getElementById('player-surah-name').textContent = surahName;
    document.getElementById('player-reciter-name').textContent = reciterName;

    const pauseIcon = '<i class="fas fa-pause"></i>';
    document.getElementById('btn-play-pause-mini').innerHTML = pauseIcon;
    if (document.getElementById('fp-play-btn')) document.getElementById('fp-play-btn').innerHTML = pauseIcon;
    if (document.getElementById('fp-b-play-btn')) document.getElementById('fp-b-play-btn').innerHTML = pauseIcon;
    if (document.getElementById('wv-bars')) document.getElementById('wv-bars').style.opacity = '1';

    // Update labels for Design A
    if (document.getElementById('fp-surah-name')) document.getElementById('fp-surah-name').textContent = surahName;
    if (document.getElementById('fp-reciter-name')) document.getElementById('fp-reciter-name').textContent = reciterName;

    // Update labels for Design B
    if (document.getElementById('fp-b-surah-name')) document.getElementById('fp-b-surah-name').textContent = surahName;
    if (document.getElementById('fp-b-reciter-name')) document.getElementById('fp-b-reciter-name').textContent = reciterName;
}

function showAudioPlayer() {
    document.getElementById('audio-player').style.display = 'block';
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.style.paddingBottom = '140px';
}

function closeAudioPlayerEntirely() {
    const audio = document.getElementById('main-audio');
    if (audio) {
        audio.pause();
        audio.src = '';
    }
    if (playerState.hlsInstance) {
        playerState.hlsInstance.destroy();
        playerState.hlsInstance = null;
    }
    if (timingInterval) clearInterval(timingInterval);
    playerState.isPlaying = false;

    document.getElementById('audio-player').style.display = 'none';
    closeFullPlayer();

    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.style.paddingBottom = '90px'; // return to normal
}

function formatTime(s) {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
}
