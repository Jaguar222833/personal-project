/* ============================================================
   [ДОДАТКОВО] Фільтр фотогалереї (gallery.html).

   Кожне фото — <li class="photo" data-category="…">.
   Кнопка фільтра ховає фото інших категорій атрибутом hidden.
   Перегляд фото у великому вікні — у спільному js/lightbox.js
   (він сам пропускає сховані фільтром фото).

   Без JS кнопки фільтра сховані, видно всі фото.
   ============================================================ */

const photos = [...document.querySelectorAll('.photo')];
const filterBar = document.querySelector('.filters');
const statusText = document.querySelector('[data-gallery-status]');

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
    const shown = photos.filter((photo) => !photo.hidden).length;
    statusText.textContent = `Показано фото: ${shown}`;
});
