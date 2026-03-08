// ============================================================
// quran.js – Quran Reader, Index, Search, Ayah Modal
// ============================================================

let currentSurahNum = 0;
let currentAyahNum = 0;
let quranFontSize = 'md'; // sm, md, lg, xl
let allAyahs = [];
let quranInitialized = false;

// ─── INIT ─────────────────────────────────────────────────
function initQuranTab() {
    if (quranInitialized) return;
    quranInitialized = true;
    renderSurahsList();
}

// ─── SURAHS LIST ──────────────────────────────────────────
function renderSurahsList() {
    const list = document.getElementById('surahs-list');
    list.innerHTML = '';
    const stats = LS.get('sadaqah_stats') || {};
    const completed = stats.completedSurahs || [];
    const lastPos = stats.lastPosition;

    SURAHS.forEach(s => {
        const isRead = completed.includes(s.n);
        const isLast = lastPos && lastPos.surah === s.n;
        const item = document.createElement('div');
        item.className = 'surah-item';
        if (isLast) item.style.borderColor = 'var(--accent)';
        item.innerHTML = `
      <div class="surah-number" style="${isRead ? 'background:linear-gradient(135deg,var(--green),var(--green-light));' : ''}">${s.n}</div>
      <div class="surah-info">
        <div class="surah-arabic">${s.ar}</div>
        <div class="surah-meta">${s.type} • ${s.v} آية • ج${s.juz}</div>
      </div>
      <div class="surah-item-right">
        ${isLast ? '<div style="font-size:.7rem;color:var(--accent)"><i class="fas fa-bookmark"></i> استكمال</div>' : ''}
        <div class="surah-ayah-count">${s.v}</div>
        <div class="surah-page">ص ${s.p}</div>
      </div>`;
        item.onclick = () => openSurahReader(s.n);
        list.appendChild(item);
    });
}

// ─── SEARCH ───────────────────────────────────────────────
function handleQuranSearch() {
    const q = document.getElementById('quran-search').value.trim();
    const resultsEl = document.getElementById('quran-search-results');
    if (!q) { resultsEl.style.display = 'none'; return; }

    const results = [];
    // Search surahs
    SURAHS.forEach(s => {
        if (s.ar.includes(q) || s.en.toLowerCase().includes(q.toLowerCase())) {
            results.push({ type: 'surah', surah: s, label: `سورة ${s.ar}`, sub: `${s.v} آية` });
        }
    });
    // Parse "surah:ayah" pattern
    const match = q.match(/(\d+)[:\s](\d+)/);
    if (match) {
        const sN = parseInt(match[1]), aN = parseInt(match[2]);
        if (sN >= 1 && sN <= 114) {
            const s = SURAHS[sN - 1];
            if (aN >= 1 && aN <= s.v) {
                results.unshift({ type: 'ayah', surah: s, ayah: aN, label: `${s.ar} آية ${aN}`, sub: `الانتقال للآية` });
            }
        }
    }

    if (!results.length) { resultsEl.style.display = 'none'; return; }
    resultsEl.innerHTML = '';
    results.slice(0, 6).forEach(r => {
        const d = document.createElement('div');
        d.className = 'search-result-item';
        d.innerHTML = `<strong>${r.label}</strong> <span style="color:var(--text-dim);font-size:.8rem;">${r.sub}</span>`;
        d.onclick = () => {
            resultsEl.style.display = 'none';
            document.getElementById('quran-search').value = '';
            openSurahReader(r.surah.n, r.ayah || 1);
        };
        resultsEl.appendChild(d);
    });
    resultsEl.style.display = 'block';
}

// ─── OPEN SURAH READER ────────────────────────────────────
async function openSurahReader(surahNum, scrollToAyah = 1) {
    currentSurahNum = surahNum;
    currentAyahNum = scrollToAyah;
    const surah = SURAHS[surahNum - 1];

    // Show reader view
    document.getElementById('quran-index-view').style.display = 'none';
    const rv = document.getElementById('quran-reader-view');
    rv.style.display = 'block';

    // Header
    document.getElementById('reader-surah-name').textContent = surah.ar;
    document.getElementById('reader-surah-details').textContent = `${surah.type} • ${surah.v} آية • الجزء ${surah.juz}`;
    document.getElementById('surah-name-header').textContent = `سُورَةُ ${surah.ar}`;
    document.getElementById('mushaf-container').className = `mushaf-container font-${quranFontSize}`;

    // Show/hide bismillah
    const bismEl = document.getElementById('bismillah-text');
    const bismHeader = document.getElementById('bismillah-header');
    if (surahNum === 1) {
        bismEl.style.display = 'none'; // Al-Fatiha heading IS the bismillah
    } else if (surahNum === 9) {
        bismHeader.style.display = 'none'; // At-Tawbah has no bismillah
    } else {
        bismHeader.style.display = 'block';
        bismEl.style.display = 'block';
    }

    // Load & display ayahs
    const container = document.getElementById('ayah-text-container');
    container.innerHTML = `<div class="loading-spinner"><div class="spinner"></div><p>جارٍ التحميل...</p></div>`;

    try {
        const ayahs = await fetchSurahAyahs(surahNum);
        allAyahs = ayahs;
        renderAyahs(ayahs, surahNum, container);

        // Save reading position
        saveLastPosition(surahNum, scrollToAyah);

        // Scroll to specific ayah if needed
        if (scrollToAyah > 1) {
            setTimeout(() => {
                const badge = document.querySelector(`[data-ayah="${scrollToAyah}"]`);
                if (badge) badge.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    } catch (e) {
        container.innerHTML = `<div class="loading-spinner"><i class="fas fa-exclamation-triangle" style="color:var(--accent)"></i><p>تعذّر التحميل. تحقق من الاتصال.</p></div>`;
    }
}

async function fetchSurahAyahs(surahNum) {
    // Check cache
    const cacheKey = `quran_surah_${surahNum}`;
    const cached = LS.get(cacheKey);
    if (cached) return cached;

    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/quran-uthmani`);
    const data = await res.json();
    const ayahs = data.data.ayahs.map(a => ({ number: a.numberInSurah, text: a.text }));

    // Cache for offline use
    try { LS.set(cacheKey, ayahs); } catch (e) { /* storage full */ }
    return ayahs;
}

function renderAyahs(ayahs, surahNum, container) {
    container.innerHTML = '';
    // Count Arabic letters for stats
    let fullText = '';
    ayahs.forEach(a => {
        const span = document.createElement('span');
        span.className = 'ayah-span';
        span.innerHTML = ' ' + a.text + ' ';
        fullText += a.text;

        const badge = document.createElement('span');
        badge.className = 'ayah-number-badge';
        badge.dataset.ayah = a.number;
        badge.dataset.surah = surahNum;
        badge.title = `آية ${a.number}`;
        badge.textContent = arabicNumber(a.number);
        badge.onclick = () => openAyahModal(surahNum, a.number, a.text);

        container.appendChild(span);
        container.appendChild(badge);
        container.appendChild(document.createTextNode(' '));
    });

    // Add to stats (letters count)
    const letters = countArabicLetters(fullText);
    addStats(ayahs.length, letters);

    // Mark surah as read
    markSurahRead(surahNum);
}

function countArabicLetters(text) {
    // Count Arabic letters only (excluding diacritics and spaces)
    return (text.match(/[\u0621-\u064A]/g) || []).length;
}

function markSurahRead(surahNum) {
    const stats = LS.get('sadaqah_stats') || {};
    stats.completedSurahs = stats.completedSurahs || [];
    if (!stats.completedSurahs.includes(surahNum)) {
        stats.completedSurahs.push(surahNum);
    }
    LS.set('sadaqah_stats', stats);
}

function saveLastPosition(surahNum, ayahNum) {
    const stats = LS.get('sadaqah_stats') || {};
    stats.lastPosition = { surah: surahNum, ayah: ayahNum, time: Date.now() };
    LS.set('sadaqah_stats', stats);
}

function closeQuranReader() {
    document.getElementById('quran-reader-view').style.display = 'none';
    document.getElementById('quran-index-view').style.display = 'block';
    renderSurahsList(); // Refresh to show updated read status
}

// ─── FONT SIZE ────────────────────────────────────────────
const fontSizes = ['sm', 'md', 'lg', 'xl'];
function changeFontSize() {
    const idx = fontSizes.indexOf(quranFontSize);
    quranFontSize = fontSizes[(idx + 1) % fontSizes.length];
    document.getElementById('mushaf-container').className = `mushaf-container font-${quranFontSize}`;
}

// ─── SURAH NAVIGATOR ─────────────────────────────────────
function openSurahNavigator() {
    // Simple select
    const sel = document.createElement('select');
    sel.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;background:var(--bg2);color:var(--text);padding:12px;border-radius:12px;font-size:1rem;font-family:Cairo,sans-serif;direction:rtl;max-height:60vh;';
    SURAHS.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.n;
        opt.textContent = `${s.n}. ${s.ar}`;
        if (s.n === currentSurahNum) opt.selected = true;
        sel.appendChild(opt);
    });
    sel.onchange = () => {
        document.body.removeChild(sel);
        openSurahReader(parseInt(sel.value));
    };
    sel.onblur = () => { if (document.body.contains(sel)) document.body.removeChild(sel); };
    document.body.appendChild(sel);
    sel.focus();
}

function continueReading() {
    const stats = LS.get('sadaqah_stats') || {};
    const pos = stats.lastPosition;
    if (!pos) return;
    switchTab('quran');
    setTimeout(() => openSurahReader(pos.surah, pos.ayah), 100);
}

// ─── AYAH MODAL ──────────────────────────────────────────
let modalSurah = 0, modalAyah = 0, modalAyahText = '';

function openAyahModal(surahNum, ayahNum, text) {
    modalSurah = surahNum;
    modalAyah = ayahNum;
    modalAyahText = text;

    const surah = SURAHS[surahNum - 1];
    document.getElementById('ayah-modal-title').textContent = `${surah.ar} - آية ${ayahNum}`;
    document.getElementById('ayah-tafsir-container').style.display = 'none';
    document.getElementById('ayah-audio-player').style.display = 'none';
    document.getElementById('ayah-modal').style.display = 'flex';
}

function closeAyahModal() {
    document.getElementById('ayah-modal').style.display = 'none';
    const aud = document.getElementById('ayah-audio');
    aud.pause(); aud.src = '';
}

async function listenToAyah() {
    document.getElementById('ayah-audio-player').style.display = 'block';
    const audio = document.getElementById('ayah-audio');
    audio.src = '';
    document.getElementById('ayah-tafsir-container').style.display = 'block';
    document.getElementById('ayah-tafsir-container').innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

    try {
        // AlQuran API fetches one specific ayah with edition (e.g. ar.abdurrahmaansudais)
        const res = await fetch(`https://api.alquran.cloud/v1/ayah/${modalSurah}:${modalAyah}/ar.abdurrahmaansudais`);
        const data = await res.json();
        const ayahAudioUrl = data.data.audio;

        if (ayahAudioUrl) {
            audio.src = ayahAudioUrl;
            audio.play();
            document.getElementById('ayah-tafsir-container').style.display = 'none';
            document.getElementById('ayah-tafsir-container').innerHTML = '';
        } else {
            throw new Error('No audio found');
        }
    } catch (e) {
        showToast('تعذّر جلب الصوت أو تشغيله');
        document.getElementById('ayah-tafsir-container').style.display = 'none';
    }
}

async function showAyahTafsir() {
    const container = document.getElementById('ayah-tafsir-container');
    container.style.display = 'block';
    container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

    try {
        const res = await fetch(`https://api.alquran.cloud/v1/ayah/${modalSurah}:${modalAyah}/ar.muyassar`);
        const data = await res.json();
        const tafsir = data.data.text;
        container.innerHTML = `
      <div style="padding:4px 0 10px;">
        <div style="font-family:var(--font-quran);font-size:1.1rem;color:var(--accent);margin-bottom:10px;line-height:2;">
          ﴿ ${modalAyahText} ﴾
        </div>
        <div class="ayah-tafsir-text">${tafsir}</div>
      </div>`;
    } catch {
        container.innerHTML = '<p style="color:var(--text-dim);text-align:center;">تعذّر تحميل التفسير</p>';
    }
}

function shareAyah() {
    const surah = SURAHS[modalSurah - 1];
    const text = `﴿ ${modalAyahText} ﴾\nسورة ${surah.ar} - الآية ${modalAyah}`;
    if (navigator.share) {
        navigator.share({ text });
    } else {
        navigator.clipboard?.writeText(text);
        showToast('تم نسخ الآية');
    }
}

function copyAyah() {
    const surah = SURAHS[modalSurah - 1];
    const text = `﴿ ${modalAyahText} ﴾\nسورة ${surah.ar} - الآية ${modalAyah}`;
    navigator.clipboard?.writeText(text).then(() => showToast('تم نسخ الآية ✓'));
}
