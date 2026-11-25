/* ============================================================
   [ДОДАТКОВО] Перегляд фото у великому вікні — спільний для всіх сторінок.

   Будь-яке посилання з атрибутом data-lightbox="група" відкриває
   картинку у вікні <dialog> замість переходу на сам файл.
   Посилання з однаковою групою гортаються стрілками ← → (по колу).
   Закрити: кнопка ✕, клавіша Esc або клік по темному фону.

   Без JS посилання просто відкриває файл картинки.
   ============================================================ */

// Вікно створюємо скриптом: без JS воно не потрібне, тому в HTML його немає
const lightbox = document.createElement('dialog');
lightbox.className = 'lightbox';
lightbox.setAttribute('aria-label', 'Перегляд фото');
lightbox.innerHTML = `
    <figure class="lightbox-figure">
        <img class="lightbox-img" alt="">
        <figcaption class="lightbox-caption"></figcaption>
    </figure>
    <button class="lightbox-btn lightbox-prev" type="button" aria-label="Попереднє фото">‹</button>
    <button class="lightbox-btn lightbox-next" type="button" aria-label="Наступне фото">›</button>
    <button class="lightbox-btn lightbox-close" type="button" aria-label="Закрити" autofocus>✕</button>`;
document.body.append(lightbox);

const bigImage = lightbox.querySelector('.lightbox-img');
const caption = lightbox.querySelector('.lightbox-caption');
const prevButton = lightbox.querySelector('.lightbox-prev');
const nextButton = lightbox.querySelector('.lightbox-next');

let group = [];         // посилання поточної групи
let current = 0;        // номер відкритого фото в групі
let openedFrom = null;  // посилання, з якого відкрили — щоб повернути на нього фокус

// Підпис: data-caption → «Назва — решта» з <figcaption> → alt картинки
function captionOf(link) {
    if (link.dataset.caption) {
        return link.dataset.caption;
    }
    const figcaption = link.closest('figure')?.querySelector('figcaption');
    if (figcaption) {
        const title = figcaption.querySelector('strong');
        if (!title) {
            return figcaption.textContent.trim();
        }
        const rest = figcaption.textContent.replace(title.textContent, '').trim();
        return rest ? `${title.textContent} — ${rest}` : title.textContent;
    }
    return link.querySelector('img')?.alt ?? '';
}

function showPhoto(index) {
    current = (index + group.length) % group.length;   // по колу
    const link = group[current];
    bigImage.src = link.href;
    bigImage.alt = link.querySelector('img')?.alt ?? '';
    caption.textContent = captionOf(link);

    // одне фото в групі — стрілки не потрібні
    prevButton.hidden = group.length < 2;
    nextButton.hidden = group.length < 2;
}

// Один обробник на весь документ: працює і для посилань, доданих пізніше
// (наприклад, у вікні проєкту з js/main.js)
document.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-lightbox]');
    if (!link) {
        return;
    }
    event.preventDefault();

    // група — посилання з тим самим data-lightbox у тому ж вікні (або на сторінці),
    // крім схованих фільтром галереї
    const scope = link.closest('dialog') ?? document;
    group = [...scope.querySelectorAll(`a[data-lightbox="${link.dataset.lightbox}"]`)]
        .filter((item) => !item.closest('[hidden]'));

    openedFrom = link;
    showPhoto(group.indexOf(link));
    lightbox.showModal();       // модальне вікно: фокус усередині, Esc закриває
});

prevButton.addEventListener('click', () => showPhoto(current - 1));
nextButton.addEventListener('click', () => showPhoto(current + 1));
lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());

// клавіші ← і → гортають фото
lightbox.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        showPhoto(current - 1);
    } else if (event.key === 'ArrowRight') {
        showPhoto(current + 1);
    }
});

// клік по темному фону (поза фото й кнопками) закриває вікно
lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox || event.target.classList.contains('lightbox-figure')) {
        lightbox.close();
    }
});

// після закриття фокус повертається туди, звідки відкрили
lightbox.addEventListener('close', () => {
    openedFrom?.focus();
});
