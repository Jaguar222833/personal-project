/* ============================================================
   [ДОДАТКОВО] Спільний скрипт для всіх сторінок.

   Сайт повністю працює і без нього — скрипт лише покращує:
     1. перемикач світлої / темної теми із запам'ятовуванням вибору;
     2. меню на <details>: закривається клавішею Esc і кліком поза ним;
     3. демо-форма підписки в блозі.
   ============================================================ */

/* ---------- 1. Перемикач теми ---------- */

const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
const THEME_KEY = 'theme';

// localStorage може бути недоступним (приватний режим, заборонені cookie),
// тому і читання, і запис — у try/catch: без збереження тема просто не запам'ятається
function saveTheme(theme) {
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
        // нічого: тема діє до перезавантаження сторінки
    }
}

// поточна тема: обрана кнопкою (data-theme на <html>) або системна
function currentTheme() {
    if (root.dataset.theme) {
        return root.dataset.theme;
    }
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// кнопка показує стан: aria-pressed="true" — темна тема увімкнена
function updateThemeButton() {
    const isDark = currentTheme() === 'dark';
    themeButton.setAttribute('aria-pressed', String(isDark));
    themeButton.textContent = isDark ? '☀' : '☾';
}

if (themeButton) {
    themeButton.hidden = false;     // без JS кнопка не працювала б, тому в HTML вона схована
    updateThemeButton();

    themeButton.addEventListener('click', () => {
        const next = currentTheme() === 'dark' ? 'light' : 'dark';
        root.dataset.theme = next;  // CSS: :root[data-theme="dark"] { … }
        saveTheme(next);
        updateThemeButton();
    });
}


/* ---------- 2. Меню ---------- */

const menu = document.querySelector('.menu');

if (menu) {
    // Esc закриває відкрите меню і повертає фокус на кнопку «Меню»
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menu.open) {
            menu.open = false;
            menu.querySelector('summary').focus();
        }
    });

    // клік будь-де поза меню — закрити
    document.addEventListener('click', (event) => {
        if (menu.open && !menu.contains(event.target)) {
            menu.open = false;
        }
    });
}


/* ---------- 3. Демо-форма підписки (blog.html) ---------- */

const subscribeForm = document.querySelector('.subscribe-form');

if (subscribeForm) {
    subscribeForm.hidden = false;
    const note = subscribeForm.querySelector('.form-note');

    subscribeForm.addEventListener('submit', (event) => {
        event.preventDefault();     // сервера поки немає — нікуди не надсилаємо
        note.textContent = 'Дякую! Розсилка запрацює, щойно сайт переїде на сервер.';
        subscribeForm.reset();
    });
}
