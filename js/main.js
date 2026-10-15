/* ============================================================
   [ДОДАТКОВО] Спільний скрипт для всіх сторінок.

   Сайт повністю працює і без нього — скрипт лише покращує:
     1. перемикач світлої / темної теми із запам'ятовуванням вибору;
     2. меню на <details>: закривається клавішею Esc і кліком поза ним;
     3. демо-форма підписки в блозі;
     4. вікно проєкту на головній.
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


/* ---------- 4. Вікно проєкту (index.html) ---------- */

// У кожній картці є <details class="project-more"> з повним описом.
// Без JS він розкривається просто в картці. З JS клік по картці (або по «Детальніше»)
// відкриває окреме вікно <dialog>: велике фото + весь опис + скріншоти.

const projectCards = [...document.querySelectorAll('.project')].filter((card) => card.querySelector('.project-more'));

if (projectCards.length) {
    const projectDialog = document.createElement('dialog');
    projectDialog.className = 'project-modal';
    projectDialog.innerHTML = `
        <button class="project-modal-close" type="button" aria-label="Закрити" autofocus>✕</button>
        <div class="project-modal-content"></div>`;
    document.body.append(projectDialog);

    const content = projectDialog.querySelector('.project-modal-content');
    let openedFrom = null;

    function openProject(card) {
        // збираємо вміст вікна з копій елементів картки
        const image = card.querySelector('.project-img').cloneNode();
        image.className = 'project-modal-img';
        image.removeAttribute('loading');
        image.sizes = '(width >= 52rem) 50rem, 100vw';   // у вікні фото велике — браузер візьме більший файл

        const body = card.querySelector('.project-body').cloneNode(true);
        const more = body.querySelector('.project-more');
        more.replaceWith(...more.children);             // <details> не потрібен: показуємо все одразу
        body.querySelector('summary')?.remove();

        const links = card.querySelector('.project-links')?.cloneNode(true);

        content.replaceChildren(image, body, ...(links ? [links] : []));
        projectDialog.setAttribute('aria-label', card.querySelector('h3').textContent);
        projectDialog.showModal();
        content.scrollTop = 0;
    }

    for (const card of projectCards) {
        card.classList.add('project--clickable');

        card.addEventListener('click', (event) => {
            if (event.target.closest('a')) {
                return;                 // посилання (GitHub) працюють як звичайно
            }
            event.preventDefault();     // не розкривати <details> у самій картці
            openedFrom = card.querySelector('summary');
            openProject(card);
        });
    }

    projectDialog.querySelector('.project-modal-close').addEventListener('click', () => projectDialog.close());

    // клік по темному фону навколо вікна — закрити
    projectDialog.addEventListener('click', (event) => {
        if (event.target === projectDialog) {
            projectDialog.close();
        }
    });

    projectDialog.addEventListener('close', () => {
        openedFrom?.focus();
    });
}
