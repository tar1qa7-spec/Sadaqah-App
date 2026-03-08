// ============================================================
// prayer.js – Prayer Times, Qibla, & Countdown
// ============================================================

let prayerInitialized = false;
let currentPrayers = null;
let countdownInterval = null;

// Replace with actual API endpoint if needed
const PRAYER_API = 'https://api.aladhan.com/v1/timingsByCity';

function initPrayerTab() {
    if (prayerInitialized) return;
    prayerInitialized = true;

    // Try to get geolocation
    requestLocation();
}

function requestLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            pos => fetchPrayerTimes(pos.coords.latitude, pos.coords.longitude),
            err => {
                showToast('تعذر تحديد الموقع، جاري استخدام إعدادات افتراضية (مكة المكرمة)');
                fetchPrayerTimes(21.4225, 39.8262, 'Makkah', 'SA'); // Default Makkah
            }
        );
    } else {
        fetchPrayerTimes(21.4225, 39.8262, 'Makkah', 'SA');
    }
}

async function fetchPrayerTimes(lat, lng, city = '', country = '') {
    try {
        let url;
        if (city && country) {
            url = `${PRAYER_API}?city=${city}&country=${country}&method=4`;
        } else {
            url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=4`;
        }

        // Also try to reverse geocode city name if we have lat/lng
        if (!city) {
            try {
                const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ar`);
                const geoData = await geoRes.json();
                document.getElementById('prayer-city-name').textContent = geoData.city || geoData.locality || 'موقعك الحالي';
            } catch (e) {
                document.getElementById('prayer-city-name').textContent = 'موقعك الحالي';
            }
        } else {
            document.getElementById('prayer-city-name').textContent = 'مكة المكرمة (الافتراضي)';
        }

        const res = await fetch(url);
        const data = await res.json();

        if (data.code === 200) {
            const timings = data.data.timings;
            const date = data.data.date;

            // Update dates
            document.getElementById('hijri-date').textContent = `${date.hijri.day} ${date.hijri.month.ar} ${date.hijri.year} هـ`;
            document.getElementById('gregorian-date').textContent = `${date.gregorian.day} ${date.gregorian.month.en} ${date.gregorian.year} م`;

            currentPrayers = {
                'Fajr': { name: 'الفجر', time: timings.Fajr },
                'Sunrise': { name: 'الشروق', time: timings.Sunrise },
                'Dhuhr': { name: 'الظهر', time: timings.Dhuhr },
                'Asr': { name: 'العصر', time: timings.Asr },
                'Maghrib': { name: 'المغرب', time: timings.Maghrib },
                'Isha': { name: 'العشاء', time: timings.Isha }
            };

            renderPrayersGrid();
            startCountdown();

            // Calculate Qibla based on coordinates
            const qiblaAngle = calculateQibla(lat, lng);
            setupQiblaCompass(qiblaAngle);

        } else {
            showToast('خطأ في جلب أوقات الصلاة');
        }
    } catch (error) {
        showToast('تعذر الاتصال بخادم أوقات الصلاة');
    }
}

function renderPrayersGrid() {
    const grid = document.getElementById('prayers-grid');
    grid.innerHTML = '';

    if (!currentPrayers) return;

    const now = new Date();
    const currentTimeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    Object.keys(currentPrayers).forEach(key => {
        const p = currentPrayers[key];
        const card = document.createElement('div');
        card.className = 'prayer-card';
        card.id = `prayer-card-${key}`;

        // Convert 24h to 12h format for display
        const timeParts = p.time.split(':');
        let h = parseInt(timeParts[0]);
        const ampm = h >= 12 ? 'م' : 'ص';
        h = h % 12;
        h = h ? h : 12;
        const displayTime = `${h}:${timeParts[1]} ${ampm}`;

        card.innerHTML = `
      <div class="prayer-name">${p.name}</div>
      <div class="prayer-time">${displayTime}</div>
    `;
        grid.appendChild(card);
    });
}

function startCountdown() {
    if (countdownInterval) clearInterval(countdownInterval);

    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    if (!currentPrayers) return;

    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    let nextPrayer = null;
    let nextPrayerTimeMins = null;
    let isTomorrow = false;

    // Find next prayer
    const keys = Object.keys(currentPrayers);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (key === 'Sunrise') continue; // Skip sunrise for next prayer calc

        const pTime = currentPrayers[key].time.split(':');
        const pMins = parseInt(pTime[0]) * 60 + parseInt(pTime[1]);

        if (pMins > currentTotalMinutes) {
            nextPrayer = { key, ...currentPrayers[key] };
            nextPrayerTimeMins = pMins;
            break;
        }
    }

    // If no prayer found, next is Fajr tomorrow
    if (!nextPrayer) {
        nextPrayer = { key: 'Fajr', ...currentPrayers['Fajr'] };
        const pTime = nextPrayer.time.split(':');
        nextPrayerTimeMins = parseInt(pTime[0]) * 60 + parseInt(pTime[1]) + (24 * 60);
        isTomorrow = true;
    }

    // Highlight current prayer
    document.querySelectorAll('.prayer-card').forEach(c => c.classList.remove('current'));
    const nextIdx = keys.indexOf(nextPrayer.key);
    let currentIdx = nextIdx - 1;
    if (currentIdx < 0) currentIdx = keys.length - 1;
    // Account for skipping sunrise
    if (keys[currentIdx] === 'Sunrise') currentIdx--;

    const currentKey = keys[currentIdx];
    const currentCard = document.getElementById(`prayer-card-${currentKey}`);
    if (currentCard) currentCard.classList.add('current');

    // Calculate remaining time
    const targetDate = new Date();
    if (isTomorrow) targetDate.setDate(targetDate.getDate() + 1);
    const pTime = nextPrayer.time.split(':');
    targetDate.setHours(parseInt(pTime[0]), parseInt(pTime[1]), 0, 0);

    const diff = targetDate.getTime() - now.getTime();

    if (diff <= 0) {
        // Prayer time! Refresh API or just update countdown logic
        setTimeout(() => updateCountdown(), 60000);
        document.getElementById('prayer-countdown').textContent = "00:00:00";
        return;
    }

    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / 1000 / 60) % 60);
    const s = Math.floor((diff / 1000) % 60);

    document.getElementById('next-prayer-name').textContent = nextPrayer.name;
    document.getElementById('prayer-countdown').textContent =
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ─── QIBLA COMPASS ────────────────────────────────────────
function calculateQibla(latitude, longitude) {
    // Mecca coordinates
    const meccaLat = 21.422487;
    const meccaLng = 39.826206;

    const phiK = meccaLat * Math.PI / 180.0;
    const lambdaK = meccaLng * Math.PI / 180.0;
    const phi = latitude * Math.PI / 180.0;
    const lambda = longitude * Math.PI / 180.0;

    const y = Math.sin(lambdaK - lambda);
    const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);

    let qibla = Math.atan2(y, x) * 180.0 / Math.PI;
    return (qibla + 360.0) % 360.0;
}

function setupQiblaCompass(qiblaAngle) {
    // Device orientation API to rotate compass
    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
        // For iOS 13+
        const compassEl = document.getElementById('qibla-compass');
        compassEl.onclick = async () => {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                    window.addEventListener('deviceorientation', e => handleOrientation(e, qiblaAngle));
                    showToast('تم تمكين البوصلة');
                }
            } catch (e) {
                showToast('تعذر الوصول لحساسات الاتجاه');
            }
        };
        showToast('اضغط على البوصلة لتمكينها');
    } else if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', e => handleOrientation(e, qiblaAngle));
    } else {
        // Fallback if no compass
        document.getElementById('compass-needle').style.transform = `rotate(${qiblaAngle}deg)`;
        showToast('جهازك لا يدعم البوصلة الديناميكية. يظهر الاتجاه الثابت względem الشمال.', 4000);
    }
}

function handleOrientation(e, qiblaAngle) {
    let alpha = e.webkitCompassHeading || Math.abs(e.alpha - 360);
    if (alpha === null || isNaN(alpha)) return;

    // Needle points to Qibla
    const degree = qiblaAngle - alpha;
    document.getElementById('compass-needle').style.transform = `rotate(${degree}deg)`;
}
