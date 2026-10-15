/* ============================================================
   [ДОДАТКОВО] Скрипт фотогалереї (gallery.html).

     1. Фільтр фото за категоріями (data-category у кожного <li class="photo">).
     2. Вікно перегляду (lightbox) на <dialog>: стрілки, клавіші ← →, Esc.

   Без JS галерея теж працює: кожне фото — посилання на великий файл,
   а кнопки фільтра сховані атрибутом hidden.
   ============================================================ */

const photos = [...document.querySelectorAll('.photo')];
const filterBar = document.querySelector('.filters');
const statusText = document.querySelector('[data-gallery-status]');

// фото, які зараз не сховані фільтром
const visiblePhotos = () => photos.filter((photo) => !photo.hidden);


/* ---------- 1. Фільтр ---------- */

filterBar.hidden = false;

// один обробник на всю панель: клік по будь-якій кнопці «спливає» до .filters
filterBar.addEventListener('click', (event) => {
    const button = event.target.closest('.filter-btn');
    if (!button) {
        return;
    }

    const filter = button.dataset.filter;

    // aria-pressed — і для стилю активної кнопки, і для читалок екрана
    for (const other of filterBar.querySelectorAll('.filter-btn')) {
        other.setAttribute('aria-pressed', String(other === button));
    }

    for (const photo of photos) {
        photo.hidden = filter !== 'all' && photo.dataset.category !== filter;
    }

    // читалка екрана оголосить результат (role="status")
    statusText.textContent = `Показано фото: ${visiblePhotos().length}`;
});


/* ---------- 2. Вікно перегляду ---------- */

const dialog = document.querySelector('.lightbox');
const bigImage = dialog.querySelector('.lightbox-img');
const caption = dialog.querySelector('.lightbox-caption');
let currentIndex = 0;
let openedFrom = null;  // посилання, з якого відкрили — щоб повернути на нього фокус

function showPhoto(index) {
    const list = visiblePhotos();
    // по колу: після останнього — перше, перед першим — останнє
    currentIndex = (index + list.length) % list.length;

    const photo = list[currentIndex];
    bigImage.src = photo.querySelector('a').href;          // велика версія, -1600.jpg
    bigImage.alt = photo.querySelector('img').alt;
    // підпис: «Назва — автор». Назва в <strong>, автор — решта тексту <figcaption>
    const figcaption = photo.querySelector('figcaption');
    const title = figcaption.querySelector('strong').textContent;
    const author = figcaption.textContent.replace(title, '').trim();
    caption.textContent = `${title} — ${author}`;
}

for (const photo of photos) {
    photo.querySelector('a').addEventListener('click', (event) => {
        event.preventDefault();     // не переходити на файл — відкрити у вікні
        openedFrom = event.currentTarget;
        showPhoto(visiblePhotos().indexOf(photo));
        dialog.showModal();         // модальне вікно: фокус усередині, Esc закриває
    });
}

dialog.querySelector('.lightbox-prev').addEventListener('click', () => showPhoto(currentIndex - 1));
dialog.querySelector('.lightbox-next').addEventListener('click', () => showPhoto(currentIndex + 1));

// клавіші ← і → гортають фото
dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        showPhoto(currentIndex - 1);
    } else if (event.key === 'ArrowRight') {
        showPhoto(currentIndex + 1);
    }
});

// клік по темному фону (поза фото й кнопками) закриває вікно
dialog.addEventListener('click', (event) => {
    if (event.target === dialog || event.target.classList.contains('lightbox-figure')) {
        dialog.close();
    }
});

// після закриття фокус повертається на фото, з якого відкрили
dialog.addEventListener('close', () => {
    if (openedFrom) {
        openedFrom.focus();
    }
});
