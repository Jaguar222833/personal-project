/* ============================================================
   [ДОДАТКОВО] ASCII-арт.

     1. Аватар у профілі (index.html): фото перемальовується символами
        на <canvas>; при наведенні проявляється справжнє фото.
        Символи зрідка «мерехтять» — як на старому терміналі.
     2. Напис у підвалі (усі сторінки): слово ARSENTIEV, складене
        з символів ░ ▒ ▓ █ — генерується з тексту, а не намальоване вручну.

   Без JS: аватар — звичайне фото, напису в підвалі немає.
   ============================================================ */

const lessMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// «Шкала щільності»: від найтемнішого символу до найсвітлішого (на темному фоні)
const RAMP = ' .:-=+*#%@';

// Середня яскравість кожної клітинки сітки cols × rows (0…1).
// Картинку стискаємо до розміру сітки — браузер сам усереднить пікселі.
function brightnessGrid(source, cols, rows, sx = 0, sy = 0, sw = source.width, sh = source.height) {
    const grid = document.createElement('canvas');
    grid.width = cols;
    grid.height = rows;
    const gridCtx = grid.getContext('2d', { willReadFrequently: true });
    gridCtx.imageSmoothingQuality = 'high';     // якісне усереднення при сильному зменшенні
    gridCtx.drawImage(source, sx, sy, sw, sh, 0, 0, cols, rows);
    const data = gridCtx.getImageData(0, 0, cols, rows).data;
    const result = [];
    for (let i = 0; i < data.length; i += 4) {
        result.push((0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255);
    }
    return result;
}


/* ---------- 1. ASCII-аватар ---------- */

const avatarBox = document.querySelector('.avatar-ascii');
const avatarImg = avatarBox?.querySelector('img');

if (avatarBox && avatarImg) {
    let source = null;                // копія фото з реальними розмірами (див. коментар у start)
    const canvas = document.createElement('canvas');
    canvas.className = 'avatar-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    avatarBox.append(canvas);
    const ctx = canvas.getContext('2d');

    const COLS = 20;                  // символів у рядку
    let chars = [];                   // індекси в RAMP для кожної клітинки
    let size = 0;
    let cell = 0;

    function draw() {
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        size = avatarBox.clientWidth;
        canvas.width = canvas.height = Math.round(size * ratio);
        cell = size / COLS;

        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.fillStyle = '#0B0C10';
        ctx.fillRect(0, 0, size, size);
        ctx.font = `700 ${cell * 1.15}px Consolas, 'Courier New', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#C4B5FD';
        chars.forEach((index, i) => {
            const x = (i % COLS) * cell + cell / 2;
            const y = Math.floor(i / COLS) * cell + cell / 2;
            ctx.fillText(RAMP[index], x, y);
        });
    }

    function build() {
        // квадрат із центру фото (як object-fit: cover у круглому аватарі)
        const side = Math.min(source.naturalWidth, source.naturalHeight);
        const sx = (source.naturalWidth - side) / 2;
        const sy = (source.naturalHeight - side) / 2;
        const light = brightnessGrid(source, COLS, COLS, sx, sy, side, side);
        // розтягуємо контраст: найтемніше місце → пробіл, найсвітліше → «@»
        const low = Math.min(...light);
        const high = Math.max(...light);
        chars = light.map((value) => Math.round(((value - low) / (high - low || 1)) * (RAMP.length - 1)));
        draw();
    }

    // «мерехтіння»: кілька випадкових символів на мить стають сусідніми за щільністю
    function flicker() {
        if (!lessMotion && document.visibilityState === 'visible') {
            for (let n = 0; n < 6; n++) {
                const i = Math.floor(Math.random() * chars.length);
                const shift = Math.random() < 0.5 ? -1 : 1;
                chars[i] = Math.min(RAMP.length - 1, Math.max(0, chars[i] + shift));
            }
            draw();
        }
    }

    async function start() {
        // у <img> із srcset naturalWidth «підправлений» на щільність екрана,
        // тому малюємо з окремої копії файлу — у неї розміри справжні
        source = new Image();
        source.src = avatarImg.currentSrc || avatarImg.src;
        await source.decode();
        build();
        setInterval(flicker, 140);
        setInterval(build, 4000);         // раз на кілька секунд — повернути «чистий» малюнок
        new ResizeObserver(draw).observe(avatarBox);
    }

    if (avatarImg.complete && avatarImg.naturalWidth) {
        start();
    } else {
        avatarImg.addEventListener('load', start, { once: true });
    }
}


/* ---------- 2. ASCII-напис у підвалі ---------- */

const banner = document.querySelector('.ascii-banner');

if (banner) {
    // чекаємо шрифт Unbounded, інакше літери намалюються запасним шрифтом
    document.fonts.ready.then(() => {
        const WORD = 'ARSENTIEV';
        const ROWS = 8;                       // висота напису в рядках
        const BLOCKS = ' ░▒▓█';
        const UNIT = 12;                      // скільки пікселів чернетки припадає на один рядок
        // символ моноширинного шрифту вужчий за свою висоту (≈ 0.6em × 1.05em),
        // тому одна колонка — це ~0.57 висоти рядка, інакше літери вийдуть розтягнутими
        const CHAR_ASPECT = 0.57;

        // 1. Малюємо слово великим шрифтом на чернетці
        const draft = document.createElement('canvas');
        const draftCtx = draft.getContext('2d');
        const font = `600 ${ROWS * UNIT * 0.95}px Unbounded, sans-serif`;
        draftCtx.font = font;
        draftCtx.letterSpacing = `${UNIT * 0.6}px`;
        draft.width = Math.ceil(draftCtx.measureText(WORD).width) + UNIT * 2;
        draft.height = ROWS * UNIT;
        draftCtx.font = font;                 // після зміни розміру canvas налаштування скидаються
        draftCtx.letterSpacing = `${UNIT * 0.6}px`;
        draftCtx.textBaseline = 'middle';
        draftCtx.fillStyle = '#FFFFFF';
        draftCtx.fillText(WORD, UNIT, draft.height / 2 + UNIT * 0.4);

        // 2. Стискаємо до сітки символів і замінюємо яскравість на ░ ▒ ▓ █
        const cols = Math.round(draft.width / (UNIT * CHAR_ASPECT));
        const light = brightnessGrid(draft, cols, ROWS);
        let art = '';
        light.forEach((value, i) => {
            art += BLOCKS[Math.round(value * (BLOCKS.length - 1))];
            if ((i + 1) % cols === 0) {
                art += '\n';
            }
        });

        banner.textContent = art;
        banner.style.setProperty('--cols', cols);   // CSS підбирає розмір шрифту під ширину
    });
}
