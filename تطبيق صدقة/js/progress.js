// ============================================================
// progress.js – User Progress, Badges, Stats & Khatmah
// ============================================================

let progressInitialized = false;

function initProgressTab() {
    if (progressInitialized) return;
    progressInitialized = true;

    updateProgressUI();
}

function updateProgressUI() {
    const stats = LS.get('sadaqah_stats') || {};

    // Update numbers
    document.getElementById('stat-hasanat').textContent = (stats.hasanat || 0).toLocaleString('ar');
    document.getElementById('stat-letters').textContent = (stats.letters || 0).toLocaleString('ar');
    document.getElementById('stat-listened').textContent = (stats.ayahsRead || 0).toLocaleString('ar'); // Assuming this includes read/listened
    document.getElementById('stat-streak').textContent = stats.streak || 0;

    // Calculate Khatmah Progress
    const completedSurahs = stats.completedSurahs || [];
    const pct = Math.floor((completedSurahs.length / 114) * 100);

    document.getElementById('khatmah-percent').textContent = `${pct}%`;
    document.getElementById('surahs-read').textContent = completedSurahs.length;
    document.getElementById('ayahs-read').textContent = stats.ayahsRead || 0;

    // Circle progress
    const circle = document.getElementById('khatmah-circle');
    if (circle) {
        const dashoffset = 283 - (283 * pct) / 100;
        circle.style.strokeDasharray = `283`;
        circle.style.strokeDashoffset = dashoffset;
    }

    // Last Position
    if (stats.lastPosition && SURAHS[stats.lastPosition.surah - 1]) {
        const surahInfo = SURAHS[stats.lastPosition.surah - 1];
        document.getElementById('last-position-card').style.display = 'flex';
        document.getElementById('last-position-text').textContent =
            `سورة ${surahInfo.ar} - آية ${stats.lastPosition.ayah}`;
    } else {
        document.getElementById('last-position-card').style.display = 'none';
    }

    renderReadSurahsGrid(completedSurahs, stats.lastPosition?.surah);
    renderAchievementBadges('badges-grid');
}

function renderReadSurahsGrid(completedSurahs, currentSurah) {
    const grid = document.getElementById('read-surahs-grid');
    grid.innerHTML = '';

    for (let i = 1; i <= 114; i++) {
        const isRead = completedSurahs.includes(i);
        const isCurrent = (i === currentSurah);

        const badge = document.createElement('div');
        badge.className = `read-surah-badge${isRead ? ' read' : ''}${isCurrent ? ' current' : ''}`;
        badge.textContent = i;
        badge.title = SURAHS[i - 1].ar;

        badge.onclick = () => {
            switchTab('quran');
            openSurahReader(i);
        };

        grid.appendChild(badge);
    }
}
