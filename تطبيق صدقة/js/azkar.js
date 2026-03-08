// ============================================================
// azkar.js – Azkar reader & Hadith/Tafsir library reader
// ============================================================

let azkarInitialized = false;
let currentCategory = 'morning';

function initAzkarTab() {
    if (azkarInitialized) return;
    azkarInitialized = true;
    loadAzkar('morning');
}

function loadAzkar(category, btn = null) {
    currentCategory = category;
    if (btn) {
        document.querySelectorAll('.azkar-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    const container = document.getElementById('azkar-container');
    container.innerHTML = '';

    const azkarList = AZKAR_DATA[category];
    if (!azkarList || !azkarList.length) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-dim);padding:20px;">لا توجد أذكار متاحة</p>';
        return;
    }

    azkarList.forEach((zikr, i) => {
        const card = document.createElement('div');
        card.className = 'zikr-card';
        card.id = `zikr-card-${i}`;

        const textFormatted = zikr.text.replace(/﴿(.*?)﴾/g, '<span style="color:var(--accent)">﴿$1﴾</span>');

        card.innerHTML = `
      <div class="zikr-text">${textFormatted}</div>
      ${zikr.description ? `<div class="zikr-description">${zikr.description}</div>` : ''}
      <div class="zikr-footer">
        <div class="zikr-count-badge">التكرار: ${zikr.count}</div>
        <button class="zikr-counter-btn" id="btn-count-${i}" onclick="recordZikrClick('${category}', ${i}, ${zikr.count})">
          <i class="fas fa-fingerprint"></i>
          <span class="zikr-count-remaining" id="count-rem-${category}-${i}">${zikr.count}</span>
        </button>
      </div>`;
        container.appendChild(card);
    });
}

function recordZikrClick(category, idx, maxCount) {
    const badge = document.getElementById(`count-rem-${category}-${idx}`);
    let currentRem = parseInt(badge.textContent);
    if (currentRem > 0) {
        currentRem--;
        badge.textContent = currentRem;

        // Add hasanat per click (rough estimation of letters)
        addStats(1, 5);

        if (currentRem === 0) {
            const btn = document.getElementById(`btn-count-${idx}`);
            btn.style.background = 'var(--green)';
            btn.style.color = '#fff';
            btn.innerHTML = '<i class="fas fa-check"></i> تم';
            btn.disabled = true;
            document.getElementById(`zikr-card-${idx}`).style.opacity = '0.7';
        }
    }
}

// ─── HADITH AND TAFSIR LIBRARY ────────────────────────────
let hadithInitialized = false;
let tafsirBooks = [];

function initHadithTab() {
    if (hadithInitialized) return;
    hadithInitialized = true;
    loadDailyHadith();
    fetchTafsirBooks();
}

async function loadDailyHadith() {
    const container = document.getElementById('hadith-daily');
    container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

    try {
        // Sunnah.com API placeholder logic or random Riyad as-Salihin
        // For now we simulate with a predefined list to avoid complex API keys
        const hadiths = [
            { text: "قَالَ رَسُولُ اللَّهِ ﷺ: من دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ", book: "صحيح مسلم" },
            { text: "قَالَ رَسُولُ اللَّهِ ﷺ: كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ", book: "متفق عليه" },
            { text: "قَالَ رَسُولُ اللَّهِ ﷺ: اقْرَءُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لأَصْحَابِهِ", book: "صحيح مسلم" }
        ];

        // Choose one based on day of year
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        const h = hadiths[dayOfYear % hadiths.length];

        container.innerHTML = `
      <div class="hadith-card">
        <div class="hadith-book">${h.book}</div>
        <div class="hadith-text">${h.text}</div>
      </div>
    `;
    } catch (e) {
        container.innerHTML = '<p style="color:var(--text-dim);">عفواً، بيانات الحديث غير متاحة حالياً</p>';
    }
}

async function fetchTafsirBooks() {
    try {
        const res = await fetch('https://api.alquran.cloud/v1/edition?format=text&type=tafsir&language=ar');
        const data = await res.json();
        if (data.code === 200) {
            tafsirBooks = data.data;
            const select = document.getElementById('tafsir-book-select');

            tafsirBooks.forEach(b => {
                const opt = document.createElement('option');
                opt.value = b.identifier;
                opt.textContent = b.name;
                select.appendChild(opt);
            });
        }
    } catch (e) {
        console.error('Failed to load Tafsir books');
    }
}

function loadTafsirBook() {
    const bookId = document.getElementById('tafsir-book-select').value;
    const surahSelect = document.getElementById('tafsir-surah-select');

    if (!bookId) {
        surahSelect.disabled = true;
        return;
    }

    surahSelect.disabled = false;
    if (surahSelect.options.length === 1) { // Only placeholder exists
        SURAHS.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.n;
            opt.textContent = s.ar;
            surahSelect.appendChild(opt);
        });
    }

    if (surahSelect.value) {
        loadTafsirSurah(); // Refresh text if surah already selected
    }
}

async function loadTafsirSurah() {
    const bookId = document.getElementById('tafsir-book-select').value;
    const surahNum = document.getElementById('tafsir-surah-select').value;
    const content = document.getElementById('tafsir-content');

    if (!bookId || !surahNum) return;

    content.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>جارٍ تحميل التفسير...</p></div>';

    try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/${bookId}`);
        const data = await res.json();

        if (data.code === 200) {
            const ayahs = data.data.ayahs;
            content.innerHTML = '';

            // Attempt to load Arabic verses for reference
            let quranAyahsText = [];
            const cacheKey = `quran_surah_${surahNum}`;
            if (LS.get(cacheKey)) {
                quranAyahsText = LS.get(cacheKey);
            }

            ayahs.slice(0, 20).forEach((t, idx) => { // Limited to 20 for perf on load, lazyload rest?
                const block = document.createElement('div');
                block.className = 'tafsir-ayah-block';

                const qText = quranAyahsText[idx] ? quranAyahsText[idx].text : `الآية ${t.numberInSurah}`;

                block.innerHTML = `
          <div class="tafsir-ayah-text">﴿ ${qText} ﴾</div>
          <div class="tafsir-text">${t.text}</div>
        `;
                content.appendChild(block);
            });

            if (ayahs.length > 20) {
                const btn = document.createElement('button');
                btn.textContent = 'عرض المزيد';
                btn.className = 'btn-add-person'; // Reuse style
                btn.onclick = () => renderRemainingTafsir(ayahs, quranAyahsText, content, btn, 20);
                content.appendChild(btn);
            }
        }
    } catch (error) {
        content.innerHTML = '<p style="color:#e74c3c;text-align:center;">حدث خطأ أثناء جلب التفسير</p>';
    }
}

function renderRemainingTafsir(ayahs, quranAyahsText, container, btn, startIdx) {
    btn.style.display = 'none';
    ayahs.slice(startIdx).forEach((t, idx) => {
        const realIdx = startIdx + idx;
        const block = document.createElement('div');
        block.className = 'tafsir-ayah-block';
        const qText = quranAyahsText[realIdx] ? quranAyahsText[realIdx].text : `الآية ${t.numberInSurah}`;
        block.innerHTML = `
      <div class="tafsir-ayah-text">﴿ ${qText} ﴾</div>
      <div class="tafsir-text">${t.text}</div>
    `;
        container.appendChild(block);
    });
}
