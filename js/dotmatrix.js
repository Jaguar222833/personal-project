/* ============================================================
   [ДОДАТКОВО] Hero як LED-матриця (index.html).

   Фото з hero перемальовується на <canvas> світними точками:
   колір точки — колір фото в цьому місці, розмір — його яскравість.
   Навколо курсора «лінза»: у ній видно справжнє фото, а точки
   на її краю збільшуються й світяться яскравіше.
   Без миші (телефон) лінза повільно дрейфує сама.

   Без JS або з «менше руху» в системі — звичайне фото.
   ============================================================ */

const hero = document.querySelector('.hero');
const photo = hero?.querySelector('.hero-media img');
const prefersLessMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (hero && photo && !prefersLessMotion) {
    const canvas = document.createElement('canvas');
    canvas.className = 'hero-dots';
    canvas.setAttribute('aria-hidden', 'true');
    hero.querySelector('.hero-media').after(canvas);   // над фото, але під темним градієнтом
    const ctx = canvas.getContext('2d');

    // Усі точки малюємо ОДИН раз на окреме полотно, а кожен кадр лише копіюємо його.
    // Окремо перемальовуємо тільки точки біля лінзи — так анімація легка.
    const layer = document.createElement('canvas');
    const layerCtx = layer.getContext('2d');

    const coarse = matchMedia('(pointer: coarse)').matches;
    const CELL = coarse ? 12 : 9;        // крок сітки точок, CSS px
    let dots = [];                        // { x, y, r, color }
    let width = 0;
    let height = 0;
    let ratio = 1;                        // devicePixelRatio, щоб точки були чіткими
    let intro = 0;                        // 0 → 1: точки «розгортаються» згори вниз
    let running = false;

    let source = null;                    // копія фото з реальними розмірами в пікселях

    const pointer = { x: 0, y: 0, active: false };
    const lens = { x: 0, y: 0, r: 0 };

    // У <img> із srcset naturalWidth «підправлений» на щільність екрана (не реальні пікселі),
    // тому для малювання на canvas беремо окрему копію саме того файлу, який показано
    function loadSource() {
        const copy = new Image();
        copy.src = photo.currentSrc || photo.src;
        return copy.decode().then(() => {
            source = copy;
        });
    }

    // Беремо фото так само, як object-fit: cover — центр, обрізані краї
    function sampleColors(cols, rows) {
        const sample = document.createElement('canvas');
        sample.width = cols;
        sample.height = rows;
        const sampleCtx = sample.getContext('2d', { willReadFrequently: true });
        const scale = Math.max(cols / source.naturalWidth, rows / source.naturalHeight);
        const sw = cols / scale;
        const sh = rows / scale;
        sampleCtx.drawImage(source, (source.naturalWidth - sw) / 2, (source.naturalHeight - sh) / 2, sw, sh, 0, 0, cols, rows);
        return sampleCtx.getImageData(0, 0, cols, rows).data;
    }

    function build() {
        const box = hero.getBoundingClientRect();
        width = box.width;
        height = box.height;
        ratio = Math.min(window.devicePixelRatio || 1, 2);
        for (const c of [canvas, layer]) {
            c.width = Math.round(width * ratio);
            c.height = Math.round(height * ratio);
        }

        const cols = Math.ceil(width / CELL);
        const rows = Math.ceil(height / CELL);
        const data = sampleColors(cols, rows);

        // яскравість кожної клітинки 0…1
        const lights = [];
        for (let i = 0; i < data.length; i += 4) {
            lights.push((0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255);
        }
        // «розтягуємо» контраст: найтемніші 3 % → 0, найсвітліші 2 % → 1.
        // Фото темне, і без цього матриця вийшла б майже чорною
        const sorted = [...lights].sort((a, b) => a - b);
        const low = sorted[Math.floor(sorted.length * 0.03)];
        const high = sorted[Math.floor(sorted.length * 0.98)];

        dots = [];
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const index = row * cols + col;
                const [r, g, b] = [data[index * 4], data[index * 4 + 1], data[index * 4 + 2]];
                const light = Math.min(1, Math.max(0, (lights[index] - low) / (high - low || 1)));
                // відтінок — з фото, яскравість — нова: як у світлодіода
                const peak = Math.max(r, g, b, 1);
                const level = 40 + 215 * light;
                dots.push({
                    x: col * CELL + CELL / 2,
                    y: row * CELL + CELL / 2,
                    r: CELL * 0.46 * (0.15 + 0.85 * Math.pow(light, 0.9)),
                    color: `rgb(${(r / peak) * level | 0} ${(g / peak) * level | 0} ${(b / peak) * level | 0})`,
                });
            }
        }

        layerCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
        layerCtx.fillStyle = '#050508';
        layerCtx.fillRect(0, 0, width, height);
        for (const dot of dots) {
            layerCtx.fillStyle = dot.color;
            layerCtx.beginPath();
            layerCtx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
            layerCtx.fill();
        }

        if (!lens.r) {                    // перший запуск: лінза з центру
            lens.x = width / 2;
            lens.y = height / 2;
        }
    }

    function frame(now) {
        if (!running) {
            return;
        }
        intro = Math.min(1, intro + 0.025);

        // ціль лінзи: курсор або повільний дрейф по кривій Ліссажу
        const t = now / 1000;
        const targetX = pointer.active ? pointer.x : width * (0.55 + 0.25 * Math.cos(t * 0.31));
        const targetY = pointer.active ? pointer.y : height * (0.42 + 0.18 * Math.sin(t * 0.47));
        lens.x += (targetX - lens.x) * 0.12;            // плавне «доїжджання» до цілі
        lens.y += (targetY - lens.y) * 0.12;
        lens.r += (Math.min(width, height) * (coarse ? 0.28 : 0.2) - lens.r) * 0.08;

        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, width, height);

        // 1. усі точки (на старті — смугою, що опускається згори)
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, width, height * intro);
        ctx.clip();
        ctx.drawImage(layer, 0, 0, width, height);
        ctx.restore();

        // 2. точки біля лінзи — більші й яскравіші («світло, що заломлюється»)
        const ring = lens.r * 1.7;
        for (const dot of dots) {
            const dx = dot.x - lens.x;
            const dy = dot.y - lens.y;
            const distance = Math.hypot(dx, dy);
            if (distance > ring || dot.y > height * intro) {
                continue;
            }
            const k = 1 - distance / ring;              // 1 у центрі лінзи, 0 на краю кільця
            ctx.globalAlpha = 0.45 + 0.55 * k;
            ctx.fillStyle = dot.color;
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.r * (1 + 1.3 * k), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // 3. «дірка» з м'яким краєм: крізь неї видно справжнє фото під полотном
        ctx.globalCompositeOperation = 'destination-out';
        const hole = ctx.createRadialGradient(lens.x, lens.y, lens.r * 0.5, lens.x, lens.y, lens.r);
        hole.addColorStop(0, 'rgb(0 0 0 / 1)');
        hole.addColorStop(1, 'rgb(0 0 0 / 0)');
        ctx.fillStyle = hole;
        ctx.beginPath();
        ctx.arc(lens.x, lens.y, lens.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';

        requestAnimationFrame(frame);
    }

    async function start() {
        await loadSource();
        build();
        // анімуємо лише поки hero на екрані — решту часу процесор відпочиває
        new IntersectionObserver(([entry]) => {
            const wasRunning = running;
            running = entry.isIntersecting;
            if (running && !wasRunning) {
                requestAnimationFrame(frame);
            }
        }).observe(hero);

        // змінився розмір вікна (або <picture> підставив інший кадр) — перебудувати точки
        let pending = 0;
        new ResizeObserver(() => {
            cancelAnimationFrame(pending);
            pending = requestAnimationFrame(build);
        }).observe(hero);
        photo.addEventListener('load', () => loadSource().then(build));
    }

    hero.addEventListener('pointermove', (event) => {
        const box = canvas.getBoundingClientRect();
        pointer.x = event.clientX - box.left;
        pointer.y = event.clientY - box.top;
        pointer.active = true;
    });
    hero.addEventListener('pointerleave', () => {
        pointer.active = false;
    });

    if (photo.complete && photo.naturalWidth) {
        start();
    } else {
        photo.addEventListener('load', start, { once: true });
    }
}
