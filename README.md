# Особистий сайт · Artem Arsentiev

Лабораторна робота з веб-технологій: адаптивний сайт на вільну персональну тему, три сторінки різного наповнення.
Тема — особистий сайт студента: тех-портфоліо, фотопортфоліо і блог.

- **Репозиторій:** https://github.com/Jaguar222833/personal-project
- **Сайт (GitHub Pages):** https://jaguar222833.github.io/personal-project/

Сервер не потрібен: достатньо відкрити `index.html` у браузері.
Перевірка адаптивності: DevTools → Toggle device toolbar (`Ctrl+Shift+M`) → Responsive, звужувати від 1440 до 320 px.

## Сторінки

Кожна сторінка показує інший прийом макета:

| Сторінка | Вміст | Каркас |
|---|---|---|
| `index.html` — Головна | hero на весь екран, про мене, профіль, проєкти, таблиця навичок, контакти | **CSS Grid** + `grid-template-areas` + **медіазапити**: 1 → 2 → 3 колонки |
| `gallery.html` — Фото | фільтр, сітка з 15 фото, «Чим знімаю», джерела фото | **CSS Grid**: 1 → 2 → 3 колонки медіазапитами, широкі фото на `span 2` |
| `blog.html` — Блог | зміст, стаття, інші записи, бічна панель | **Flexbox без медіазапитів**: «вимикач» `calc((60rem - 100%) * 999)` |

## Структура

```
index.html, gallery.html, blog.html
css/styles.css   — один файл стилів, 9 розділів (зміст — у шапці файлу)
js/main.js       — тема, меню, форма (додатково)
js/gallery.js    — фільтр і перегляд фото (додатково)
img/             — фото у розмірах 480 / 960 / 1600 px
```

## Як позначено код

У коментарях HTML, CSS і JS:

- **`[ЗАВДАННЯ]`** — вимога лабораторної, лекцій 2–3 або практик 5–6;
- **`[ДОДАТКОВО]`** — власна ініціатива поза завданням;
- **`[1]`, `[2]`, …** — рядки, що перемикають макет, з поясненням на числах (як у прикладах практики 6).

## Що зроблено в рамках завдання і де це знайти

| Вимога | Де | Як |
|---|---|---|
| `meta viewport` | `<head>` усіх трьох сторінок | `width=device-width, initial-scale=1`, без заборони зуму |
| Зовнішній CSS | `css/styles.css` | `<link rel="stylesheet">` на кожній сторінці |
| Семантичні теги | усі сторінки | `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`, `figure`, `time`, `details` |
| Mobile-first | `styles.css`, розділи 1–8 | база — телефон; розділ 9 лише **додає** правила через `(width >= …)` |
| Медіазапити, точки зламу в rem | `styles.css`, розділ 9 | `40rem`, `48rem`, `56.25rem`, `64rem`, `68.75rem` — підібрані під вміст, а не під пристрої |
| CSS Grid з областями | `.home-grid` (розділ 4 + розділ 9, мітки `[1]`–`[4]`) | `grid-template-areas` змінюється на 900 і 1100 px |
| `minmax(0, 1fr)` | `.home-grid`, `.gallery` | таблиця не розпирає колонку на телефоні |
| Grid без медіазапитів | `.project-grid`, `.gear-list` | `repeat(auto-fit, minmax(min(16rem, 100%), 1fr))` |
| Flexbox | `.header-inner`, `.footer-inner`, `.hero-actions`, `.tags`, `.filters` | ряди з `flex-wrap` |
| Каркас без медіазапитів (×999) | `.blog-layout` (розділ 6, мітки `[1]`–`[3]`) | 3 колонки ↔ 1 колонка, без проміжного стану |
| Меню без медіазапиту | `.toc-list` (розділ 6, мітки `[4]`–`[7]`) | пункти в рядок чи стовпчиком від ширини **самого списку** |
| Container queries | розділ 7, мітки `[1]`–`[4]` | `.project-wrap`, `.post-wrap` — контейнери; та сама картка в широкій колонці горизонтальна, у вузькій — вертикальна |
| Одиниця `cqi` | `.post-card h3` | розмір заголовка від ширини контейнера |
| `clamp()` | `h1`, `h2`, `.hero-content h1`, `.page-head`, `.post-full` | плавні розміри без медіазапитів |
| `rem`, `ch`, `dvh` | шрифти і відступи — `rem`; `max-width: 65ch`; hero — `100dvh` | |
| CSS-змінні | `:root` (розділ 1) | усі кольори, радіуси, ширини |
| Нативна вкладеність `&` | компоненти в розділах 2–8 | `.menu`, `.photo`, `.tags`, `.btn`… |
| `box-sizing: border-box` | розділ 2 | |
| Адаптивні зображення | усі `<img>` | `alt`, `width`/`height`, `srcset` + `sizes`, `loading="lazy"` нижче першого екрана |
| `<picture>` з іншим кадром | hero на `index.html` | телефон — вертикальний кадр 2:3, від 48rem — широкий 16:9 |
| `aspect-ratio` + `object-fit: cover` | `.photo img`, `.project-img`, `.post-img` | фото різних пропорцій в однакових рамках |
| Таблиця на телефоні | `.table-wrap` на головній | прокручується всередині обгортки, сторінка не ширшає |
| Меню-«бургер» без JS | `<details class="menu">` + розділи 8 і 9 | від 48rem — пункти в рядок; `@supports selector(details::details-content)` |
| Доступність | розділ 8 | skip-link, `:focus-visible`, зони натискання ≥ 44 px, контраст ≥ 4.5 : 1, `aria-current`, `aria-label` |
| `prefers-color-scheme` | розділ 1 | темна тема за налаштуванням системи |
| `prefers-reduced-motion` | кінець розділу 9 | вимикає анімації й плавну прокрутку |

## Кількість запитів (порахована через CSSOM у браузері)

| Тип | Кількість | Де |
|---|---|---|
| `@media` за шириною | 5 | розділ 9: 40, 48, 56.25, 64, 68.75 rem |
| `@media` за налаштуваннями | 2 | `prefers-color-scheme` (розділ 1), `prefers-reduced-motion` (розділ 9) |
| `@container` | 3 | розділ 7 |
| `@supports` | 1 | меню, розділ 9 |

Сторінка блогу має **0** медіазапитів для каркаса: колонки й зміст перемикаються «вимикачем» ×999.

## Перевірено

- Горизонтального скролу немає на 320, 375, 768, 1280 і 1440 px — на всіх трьох сторінках.
- Сайт проходиться клавішею Tab: перший Tab показує «Перейти до змісту», фокус видно скрізь.
- Без JavaScript усе працює: меню на `<details>`, фото відкриваються як файли, сховані лише фільтр, кнопка теми й форма.
- Chrome (Chromium). Firefox і Safari наживо не перевірялись.

## Власна ініціатива (поза завданням)

| Що | Де |
|---|---|
| Перемикач світлої / темної теми з запам'ятовуванням (`localStorage`) | `js/main.js`, `:root[data-theme="dark"]` |
| Меню закривається клавішею Esc і кліком поза ним | `js/main.js` |
| Фільтр фото за категоріями | `js/gallery.js`, `.filters` |
| Перегляд фото на `<dialog>`: стрілки, клавіші ← →, Esc, повернення фокусу | `js/gallery.js`, `.lightbox` |
| Демо-форма підписки (без бекенду) | `blog.html`, `js/main.js` |
| Липка шапка, липкий профіль, підвал завжди внизу | `.site-header`, `.profile`, `body` |
| Смужки рівня навичок на «живій» CSS-змінній `--level` | `.level` |
| Шрифти Manrope і Unbounded (Google Fonts) | `<head>` |

## Фото

Поки що це фото-заглушки з [Unsplash](https://unsplash.com): безкоштовна ліцензія, без водяних знаків. Їх буде замінено власними кадрами.

| Файл | Автор |
|---|---|
| `hero-*` | Galymzhan Abdugalimov |
| `avatar-*` | Jennifer Trovato |
| `laptop-*`, `coffee-laptop-*` | Alejandro Escamilla |
| `macbook-*` | Luke Chesser |
| `flatlay-*`, `desk-*`, `gear-*` | Vadim Sherbakov |
| `camera-*` | Nicola Perantoni |
| `mountains-*` | Go Wild |
| `lake-*` | Matteo Minelli |
| `peak-*` | Paul E. Harrer |
| `hills-*` | Aleksandra Boguslawska |
| `bridge-*` | Oleg Chursin |
| `street-*` | Nicholas Swanson |
| `canal-*` | Linh Nguyen |
| `petunia-*` | Steven Spassov |
| `leaf-*` | Shyamanta Baruah |
| `blossom-*` | Rula Sibai |
| `autumn-*` | petradr |
| `sunset-portrait-*`, `field-portrait-*` | Alexander Shustov |
| `hiker-*` | Danka & Peter |
| `bench-*` | Charlie Foster |
