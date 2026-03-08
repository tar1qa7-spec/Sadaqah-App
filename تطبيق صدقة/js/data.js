// ============================================================
// data.js – Static Quran & Islamic Data
// ============================================================

const SURAHS = [
  { n: 1, ar: "الفاتحة", en: "Al-Fatihah", v: 7, p: 1, juz: 1, type: "مكية", meaning: "الفاتحة" },
  { n: 2, ar: "البقرة", en: "Al-Baqarah", v: 286, p: 2, juz: 1, type: "مدنية", meaning: "البقرة" },
  { n: 3, ar: "آل عمران", en: "Aal-Imran", v: 200, p: 50, juz: 3, type: "مدنية", meaning: "اليهود" },
  { n: 4, ar: "النساء", en: "An-Nisa", v: 176, p: 77, juz: 4, type: "مدنية", meaning: "النساء" },
  { n: 5, ar: "المائدة", en: "Al-Maidah", v: 120, p: 106, juz: 6, type: "مدنية", meaning: "المائدة" },
  { n: 6, ar: "الأنعام", en: "Al-Anam", v: 165, p: 128, juz: 7, type: "مكية", meaning: "الأنعام" },
  { n: 7, ar: "الأعراف", en: "Al-Araf", v: 206, p: 151, juz: 8, type: "مكية", meaning: "الأعراف" },
  { n: 8, ar: "الأنفال", en: "Al-Anfal", v: 75, p: 177, juz: 9, type: "مدنية", meaning: "الغنائم" },
  { n: 9, ar: "التوبة", en: "At-Tawbah", v: 129, p: 187, juz: 10, type: "مدنية", meaning: "التوبة" },
  { n: 10, ar: "يونس", en: "Yunus", v: 109, p: 208, juz: 11, type: "مكية", meaning: "يونس" },
  { n: 11, ar: "هود", en: "Hud", v: 123, p: 221, juz: 11, type: "مكية", meaning: "هود" },
  { n: 12, ar: "يوسف", en: "Yusuf", v: 111, p: 235, juz: 12, type: "مكية", meaning: "يوسف" },
  { n: 13, ar: "الرعد", en: "Ar-Rad", v: 43, p: 249, juz: 13, type: "مدنية", meaning: "الرعد" },
  { n: 14, ar: "إبراهيم", en: "Ibrahim", v: 52, p: 255, juz: 13, type: "مكية", meaning: "إبراهيم" },
  { n: 15, ar: "الحجر", en: "Al-Hijr", v: 99, p: 262, juz: 14, type: "مكية", meaning: "الحجر" },
  { n: 16, ar: "النحل", en: "An-Nahl", v: 128, p: 267, juz: 14, type: "مكية", meaning: "النحل" },
  { n: 17, ar: "الإسراء", en: "Al-Isra", v: 111, p: 282, juz: 15, type: "مكية", meaning: "الإسراء" },
  { n: 18, ar: "الكهف", en: "Al-Kahf", v: 110, p: 293, juz: 15, type: "مكية", meaning: "الكهف" },
  { n: 19, ar: "مريم", en: "Maryam", v: 98, p: 305, juz: 16, type: "مكية", meaning: "مريم" },
  { n: 20, ar: "طه", en: "Taha", v: 135, p: 312, juz: 16, type: "مكية", meaning: "طه" },
  { n: 21, ar: "الأنبياء", en: "Al-Anbiya", v: 112, p: 322, juz: 17, type: "مكية", meaning: "الأنبياء" },
  { n: 22, ar: "الحج", en: "Al-Hajj", v: 78, p: 332, juz: 17, type: "مدنية", meaning: "الحج" },
  { n: 23, ar: "المؤمنون", en: "Al-Muminun", v: 118, p: 342, juz: 18, type: "مكية", meaning: "المؤمنون" },
  { n: 24, ar: "النور", en: "An-Nur", v: 64, p: 350, juz: 18, type: "مدنية", meaning: "النور" },
  { n: 25, ar: "الفرقان", en: "Al-Furqan", v: 77, p: 359, juz: 18, type: "مكية", meaning: "الفرقان" },
  { n: 26, ar: "الشعراء", en: "Ash-Shuara", v: 227, p: 367, juz: 19, type: "مكية", meaning: "الشعراء" },
  { n: 27, ar: "النمل", en: "An-Naml", v: 93, p: 377, juz: 19, type: "مكية", meaning: "النمل" },
  { n: 28, ar: "القصص", en: "Al-Qasas", v: 88, p: 385, juz: 20, type: "مكية", meaning: "القصص" },
  { n: 29, ar: "العنكبوت", en: "Al-Ankabut", v: 69, p: 396, juz: 20, type: "مكية", meaning: "العنكبوت" },
  { n: 30, ar: "الروم", en: "Ar-Rum", v: 60, p: 404, juz: 21, type: "مكية", meaning: "الروم" },
  { n: 31, ar: "لقمان", en: "Luqman", v: 34, p: 411, juz: 21, type: "مكية", meaning: "لقمان" },
  { n: 32, ar: "السجدة", en: "As-Sajdah", v: 30, p: 415, juz: 21, type: "مكية", meaning: "السجدة" },
  { n: 33, ar: "الأحزاب", en: "Al-Ahzab", v: 73, p: 418, juz: 21, type: "مدنية", meaning: "الأحزاب" },
  { n: 34, ar: "سبأ", en: "Saba", v: 54, p: 428, juz: 22, type: "مكية", meaning: "سبأ" },
  { n: 35, ar: "فاطر", en: "Fatir", v: 45, p: 434, juz: 22, type: "مكية", meaning: "الملائكة" },
  { n: 36, ar: "يس", en: "Ya-Sin", v: 83, p: 440, juz: 22, type: "مكية", meaning: "يس" },
  { n: 37, ar: "الصافات", en: "As-Saffat", v: 182, p: 446, juz: 23, type: "مكية", meaning: "الصافات" },
  { n: 38, ar: "ص", en: "Sad", v: 88, p: 453, juz: 23, type: "مكية", meaning: "الحرف" },
  { n: 39, ar: "الزمر", en: "Az-Zumar", v: 75, p: 458, juz: 23, type: "مكية", meaning: "الزمر" },
  { n: 40, ar: "غافر", en: "Ghafir", v: 85, p: 467, juz: 24, type: "مكية", meaning: "غافر" },
  { n: 41, ar: "فصلت", en: "Fussilat", v: 54, p: 477, juz: 24, type: "مكية", meaning: "فصلت" },
  { n: 42, ar: "الشورى", en: "Ash-Shura", v: 53, p: 483, juz: 25, type: "مكية", meaning: "الشورى" },
  { n: 43, ar: "الزخرف", en: "Az-Zukhruf", v: 89, p: 489, juz: 25, type: "مكية", meaning: "الزخرف" },
  { n: 44, ar: "الدخان", en: "Ad-Dukhan", v: 59, p: 496, juz: 25, type: "مكية", meaning: "الدخان" },
  { n: 45, ar: "الجاثية", en: "Al-Jathiyah", v: 37, p: 499, juz: 25, type: "مكية", meaning: "الجاثية" },
  { n: 46, ar: "الأحقاف", en: "Al-Ahqaf", v: 35, p: 502, juz: 26, type: "مكية", meaning: "الأحقاف" },
  { n: 47, ar: "محمد", en: "Muhammad", v: 38, p: 507, juz: 26, type: "مدنية", meaning: "النبي محمد" },
  { n: 48, ar: "الفتح", en: "Al-Fath", v: 29, p: 511, juz: 26, type: "مدنية", meaning: "الفتح" },
  { n: 49, ar: "الحجرات", en: "Al-Hujurat", v: 18, p: 515, juz: 26, type: "مدنية", meaning: "الحجرات" },
  { n: 50, ar: "ق", en: "Qaf", v: 45, p: 518, juz: 26, type: "مكية", meaning: "الحرف" },
  { n: 51, ar: "الذاريات", en: "Adh-Dhariyat", v: 60, p: 520, juz: 26, type: "مكية", meaning: "الذاريات" },
  { n: 52, ar: "الطور", en: "At-Tur", v: 49, p: 523, juz: 27, type: "مكية", meaning: "الطور" },
  { n: 53, ar: "النجم", en: "An-Najm", v: 62, p: 526, juz: 27, type: "مكية", meaning: "النجم" },
  { n: 54, ar: "القمر", en: "Al-Qamar", v: 55, p: 528, juz: 27, type: "مكية", meaning: "القمر" },
  { n: 55, ar: "الرحمن", en: "Ar-Rahman", v: 78, p: 531, juz: 27, type: "مدنية", meaning: "الرحمن" },
  { n: 56, ar: "الواقعة", en: "Al-Waqiah", v: 96, p: 534, juz: 27, type: "مكية", meaning: "الواقعة" },
  { n: 57, ar: "الحديد", en: "Al-Hadid", v: 29, p: 537, juz: 27, type: "مدنية", meaning: "الحديد" },
  { n: 58, ar: "المجادلة", en: "Al-Mujadila", v: 22, p: 542, juz: 28, type: "مدنية", meaning: "المجادلة" },
  { n: 59, ar: "الحشر", en: "Al-Hashr", v: 24, p: 545, juz: 28, type: "مدنية", meaning: "الحشر" },
  { n: 60, ar: "الممتحنة", en: "Al-Mumtahanah", v: 13, p: 549, juz: 28, type: "مدنية", meaning: "الممتحنة" },
  { n: 61, ar: "الصف", en: "As-Saf", v: 14, p: 551, juz: 28, type: "مدنية", meaning: "الصف" },
  { n: 62, ar: "الجمعة", en: "Al-Jumuah", v: 11, p: 553, juz: 28, type: "مدنية", meaning: "الجمعة" },
  { n: 63, ar: "المنافقون", en: "Al-Munafiqun", v: 11, p: 554, juz: 28, type: "مدنية", meaning: "المنافقون" },
  { n: 64, ar: "التغابن", en: "At-Taghabun", v: 18, p: 556, juz: 28, type: "مدنية", meaning: "التغابن" },
  { n: 65, ar: "الطلاق", en: "At-Talaq", v: 12, p: 558, juz: 28, type: "مدنية", meaning: "الطلاق" },
  { n: 66, ar: "التحريم", en: "At-Tahrim", v: 12, p: 560, juz: 28, type: "مدنية", meaning: "التحريم" },
  { n: 67, ar: "الملك", en: "Al-Mulk", v: 30, p: 562, juz: 29, type: "مكية", meaning: "الملك" },
  { n: 68, ar: "القلم", en: "Al-Qalam", v: 52, p: 564, juz: 29, type: "مكية", meaning: "القلم" },
  { n: 69, ar: "الحاقة", en: "Al-Haqqah", v: 52, p: 566, juz: 29, type: "مكية", meaning: "الحاقة" },
  { n: 70, ar: "المعارج", en: "Al-Maarij", v: 44, p: 568, juz: 29, type: "مكية", meaning: "المعارج" },
  { n: 71, ar: "نوح", en: "Nuh", v: 28, p: 570, juz: 29, type: "مكية", meaning: "نوح" },
  { n: 72, ar: "الجن", en: "Al-Jinn", v: 28, p: 572, juz: 29, type: "مكية", meaning: "الجن" },
  { n: 73, ar: "المزمل", en: "Al-Muzzammil", v: 20, p: 574, juz: 29, type: "مكية", meaning: "المزمل" },
  { n: 74, ar: "المدثر", en: "Al-Muddaththir", v: 56, p: 575, juz: 29, type: "مكية", meaning: "المدثر" },
  { n: 75, ar: "القيامة", en: "Al-Qiyamah", v: 40, p: 577, juz: 29, type: "مكية", meaning: "القيامة" },
  { n: 76, ar: "الإنسان", en: "Al-Insan", v: 31, p: 578, juz: 29, type: "مدنية", meaning: "الإنسان" },
  { n: 77, ar: "المرسلات", en: "Al-Mursalat", v: 50, p: 580, juz: 29, type: "مكية", meaning: "المرسلات" },
  { n: 78, ar: "النبأ", en: "An-Naba", v: 40, p: 582, juz: 30, type: "مكية", meaning: "النبأ" },
  { n: 79, ar: "النازعات", en: "An-Naziat", v: 46, p: 583, juz: 30, type: "مكية", meaning: "النازعات" },
  { n: 80, ar: "عبس", en: "Abasa", v: 42, p: 585, juz: 30, type: "مكية", meaning: "عبس" },
  { n: 81, ar: "التكوير", en: "At-Takwir", v: 29, p: 586, juz: 30, type: "مكية", meaning: "التكوير" },
  { n: 82, ar: "الانفطار", en: "Al-Infitar", v: 19, p: 587, juz: 30, type: "مكية", meaning: "الانفطار" },
  { n: 83, ar: "المطففين", en: "Al-Mutaffifin", v: 36, p: 587, juz: 30, type: "مكية", meaning: "المطففين" },
  { n: 84, ar: "الانشقاق", en: "Al-Inshiqaq", v: 25, p: 589, juz: 30, type: "مكية", meaning: "الانشقاق" },
  { n: 85, ar: "البروج", en: "Al-Buruj", v: 22, p: 590, juz: 30, type: "مكية", meaning: "البروج" },
  { n: 86, ar: "الطارق", en: "At-Tariq", v: 17, p: 591, juz: 30, type: "مكية", meaning: "الطارق" },
  { n: 87, ar: "الأعلى", en: "Al-Ala", v: 19, p: 591, juz: 30, type: "مكية", meaning: "الأعلى" },
  { n: 88, ar: "الغاشية", en: "Al-Ghashiyah", v: 26, p: 592, juz: 30, type: "مكية", meaning: "الغاشية" },
  { n: 89, ar: "الفجر", en: "Al-Fajr", v: 30, p: 593, juz: 30, type: "مكية", meaning: "الفجر" },
  { n: 90, ar: "البلد", en: "Al-Balad", v: 20, p: 594, juz: 30, type: "مكية", meaning: "البلد" },
  { n: 91, ar: "الشمس", en: "Ash-Shams", v: 15, p: 595, juz: 30, type: "مكية", meaning: "الشمس" },
  { n: 92, ar: "الليل", en: "Al-Layl", v: 21, p: 595, juz: 30, type: "مكية", meaning: "الليل" },
  { n: 93, ar: "الضحى", en: "Ad-Duhaa", v: 11, p: 596, juz: 30, type: "مكية", meaning: "الضحى" },
  { n: 94, ar: "الشرح", en: "Ash-Sharh", v: 8, p: 596, juz: 30, type: "مكية", meaning: "الانشراح" },
  { n: 95, ar: "التين", en: "At-Tin", v: 8, p: 597, juz: 30, type: "مكية", meaning: "التين" },
  { n: 96, ar: "العلق", en: "Al-Alaq", v: 19, p: 597, juz: 30, type: "مكية", meaning: "العلقة" },
  { n: 97, ar: "القدر", en: "Al-Qadr", v: 5, p: 598, juz: 30, type: "مكية", meaning: "القدر" },
  { n: 98, ar: "البينة", en: "Al-Bayyinah", v: 8, p: 598, juz: 30, type: "مدنية", meaning: "البينة" },
  { n: 99, ar: "الزلزلة", en: "Az-Zalzalah", v: 8, p: 599, juz: 30, type: "مدنية", meaning: "الزلزلة" },
  { n: 100, ar: "العاديات", en: "Al-Adiyat", v: 11, p: 599, juz: 30, type: "مكية", meaning: "العاديات" },
  { n: 101, ar: "القارعة", en: "Al-Qariah", v: 11, p: 600, juz: 30, type: "مكية", meaning: "القارعة" },
  { n: 102, ar: "التكاثر", en: "At-Takathur", v: 8, p: 600, juz: 30, type: "مكية", meaning: "التكاثر" },
  { n: 103, ar: "العصر", en: "Al-Asr", v: 3, p: 601, juz: 30, type: "مكية", meaning: "العصر" },
  { n: 104, ar: "الهمزة", en: "Al-Humazah", v: 9, p: 601, juz: 30, type: "مكية", meaning: "الهمزة" },
  { n: 105, ar: "الفيل", en: "Al-Fil", v: 5, p: 601, juz: 30, type: "مكية", meaning: "الفيل" },
  { n: 106, ar: "قريش", en: "Quraysh", v: 4, p: 602, juz: 30, type: "مكية", meaning: "قريش" },
  { n: 107, ar: "الماعون", en: "Al-Maun", v: 7, p: 602, juz: 30, type: "مكية", meaning: "الماعون" },
  { n: 108, ar: "الكوثر", en: "Al-Kawthar", v: 3, p: 602, juz: 30, type: "مكية", meaning: "الكوثر" },
  { n: 109, ar: "الكافرون", en: "Al-Kafirun", v: 6, p: 603, juz: 30, type: "مكية", meaning: "الكافرون" },
  { n: 110, ar: "النصر", en: "An-Nasr", v: 3, p: 603, juz: 30, type: "مدنية", meaning: "النصر" },
  { n: 111, ar: "المسد", en: "Al-Masad", v: 5, p: 603, juz: 30, type: "مكية", meaning: "المسد" },
  { n: 112, ar: "الإخلاص", en: "Al-Ikhlas", v: 4, p: 604, juz: 30, type: "مكية", meaning: "الإخلاص" },
  { n: 113, ar: "الفلق", en: "Al-Falaq", v: 5, p: 604, juz: 30, type: "مكية", meaning: "الفلق" },
  { n: 114, ar: "الناس", en: "An-Nas", v: 6, p: 604, juz: 30, type: "مكية", meaning: "الناس" }
];

// Juz (أجزاء) data
const AJZA = [
  { n: 1, name: "الم", start: "البقرة:1" }, { n: 2, name: "سيقول", start: "البقرة:142" },
  { n: 3, name: "تلك الرسل", start: "البقرة:253" }, { n: 4, name: "لن تنالوا", start: "آل عمران:92" },
  { n: 5, name: "والمحصنات", start: "النساء:24" }, { n: 6, name: "لا يحب الله", start: "النساء:148" },
  { n: 7, name: "وإذا سمعوا", start: "المائدة:81" }, { n: 8, name: "ولو أننا", start: "الأنعام:111" },
  { n: 9, name: "قال الملأ", start: "الأعراف:88" }, { n: 10, name: "واعلموا", start: "الأنفال:41" },
  { n: 11, name: "يعتذرون", start: "التوبة:94" }, { n: 12, name: "وما من دابة", start: "هود:6" },
  { n: 13, name: "وما أبرئ", start: "يوسف:53" }, { n: 14, name: "ربما", start: "الحجر:1" },
  { n: 15, name: "سبحان الذي", start: "الإسراء:1" }, { n: 16, name: "قال ألم", start: "الكهف:75" },
  { n: 17, name: "اقترب", start: "الأنبياء:1" }, { n: 18, name: "قد أفلح", start: "المؤمنون:1" },
  { n: 19, name: "وقال الذين", start: "الفرقان:21" }, { n: 20, name: "أمن خلق", start: "النمل:60" },
  { n: 21, name: "اتل ما أوحي", start: "العنكبوت:45" }, { n: 22, name: "ومن يقنت", start: "الأحزاب:31" },
  { n: 23, name: "وما لي", start: "يس:22" }, { n: 24, name: "فمن أظلم", start: "الزمر:32" },
  { n: 25, name: "إليه يرد", start: "فصلت:47" }, { n: 26, name: "حم", start: "الأحقاف:1" },
  { n: 27, name: "قال فما خطبكم", start: "الذاريات:31" }, { n: 28, name: "قد سمع الله", start: "المجادلة:1" },
  { n: 29, name: "تبارك", start: "الملك:1" }, { n: 30, name: "عم", start: "النبأ:1" }
];

// Featured reciters (predefined)
const FEATURED_RECITERS = [
  {
    id: 'alzain', name: 'الزين محمد أحمد',
    server: 'https://archive.org/download/kquran.com__Alzain-Mohamed-Ahmad/kquran.com_',
    avatar: '000img/elzain.jfif', icon: '🎙️', type: 'archive',
    hasTimings: true, timingReciterId: 164
  },
  {
    id: 'nooren', name: 'نورين محمد صديق',
    server: 'https://archive.org/download/NoreenMohammadSiddiq/',
    avatar: '000img/norin.jfif', icon: '🎤', type: 'archive',
    hasTimings: false
  },
  {
    id: 'fatih', name: 'الفاتح محمد عثمان الزبير',
    server: 'https://archive.org/download/golmami2005_yahoo_002/',
    avatar: '000img/mohmed.jfif', icon: '📖', type: 'archive',
    hasTimings: false
  }
];

// Azkar data (Sample – full set embedded)
const AZKAR_DATA = {
  morning: [
    {
      text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
      description: "رب أسألك خير ما في هذا اليوم وخير ما بعده", count: 1
    },
    {
      text: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
      description: "يقال في الصباح", count: 1
    },
    {
      text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
      description: "سيد الاستغفار - من قالها موقناً فمات دخل الجنة", count: 1
    },
    {
      text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
      description: "من قالها مائة مرة غُفرت ذنوبه وإن كانت مثل زبد البحر", count: 100
    },
    {
      text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
      description: "من قالها عشر مرات كان كمن أعتق أربعة أنفس من ولد إسماعيل", count: 10
    },
    {
      text: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ ﴿اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ...﴾",
      description: "آية الكرسي - من قرأها في الصباح لم يزل في حفظ الله", count: 1
    }
  ],
  evening: [
    {
      text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
      description: "يقال عند المساء", count: 1
    },
    {
      text: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ",
      description: "يقال في المساء", count: 1
    },
    {
      text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
      description: "من قالها ثلاث مرات لم تضره حمة في تلك الليلة", count: 3
    },
    {
      text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
      description: "من قالها ثلاثاً لم تصبه فجأة بلاء حتى يصبح", count: 3
    }
  ],
  sleep: [
    {
      text: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
      description: "يقال عند النوم", count: 1
    },
    {
      text: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
      description: "يقال ثلاث مرات عند النوم", count: 3
    },
    {
      text: "سُبْحَانَ اللَّهِ، الْحَمْدُ لِلَّهِ، اللَّهُ أَكْبَرُ",
      description: "33 مرة من كل واحدة عند النوم", count: 33
    }
  ],
  prayer: [
    {
      text: "سُبْحَانَ اللَّهِ",
      description: "ثلاث وثلاثون مرة بعد الصلاة", count: 33
    },
    {
      text: "الْحَمْدُ لِلَّهِ",
      description: "ثلاث وثلاثون مرة بعد الصلاة", count: 33
    },
    {
      text: "اللَّهُ أَكْبَرُ",
      description: "ثلاث وثلاثون مرة بعد الصلاة", count: 33
    },
    {
      text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
      description: "تتمة التسبيح بعد الصلاة", count: 1
    }
  ],
  quran: [
    {
      text: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
      description: "البقرة: 201", count: 1
    },
    {
      text: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً إِنَّكَ أَنْتَ الْوَهَّابُ",
      description: "آل عمران: 8", count: 1
    },
    {
      text: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي يَفْقَهُوا قَوْلِي",
      description: "طه: 25-28", count: 1
    },
    {
      text: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَى وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ وَأَصْلِحْ لِي فِي ذُرِّيَّتِي",
      description: "الأحقاف: 15", count: 1
    }
  ]
};

// Badges data
const BADGES = [
  { id: 'first_read', icon: '📖', name: 'أول كلمة', desc: 'قرأت أول آية', threshold: 1, type: 'ayahs' },
  { id: 'hundred', icon: '💯', name: 'المئة', desc: 'قرأت 100 آية', threshold: 100, type: 'ayahs' },
  { id: 'fatiha', icon: '🌟', name: 'فاتح الكتاب', desc: 'أنهيت الفاتحة', threshold: 1, type: 'surahs' },
  { id: 'ten_surahs', icon: '🏆', name: 'عشر سور', desc: 'أنهيت 10 سور', threshold: 10, type: 'surahs' },
  { id: 'half', icon: '🌙', name: 'نصف الختمة', desc: 'أنهيت نصف القرآن', threshold: 57, type: 'surahs' },
  { id: 'khatmah', icon: '👑', name: 'الختمة الأولى', desc: 'أتممت القرآن كاملاً', threshold: 114, type: 'surahs' },
  { id: 'thousand', icon: '✨', name: 'الألف', desc: '1000 آية مقروءة', threshold: 1000, type: 'ayahs' },
  { id: 'streak3', icon: '🔥', name: 'ثلاثة أيام', desc: 'قرأت 3 أيام متتالية', threshold: 3, type: 'streak' },
  { id: 'streak7', icon: '⚡', name: 'أسبوع كامل', desc: 'قرأت 7 أيام متتالية', threshold: 7, type: 'streak' }
];
