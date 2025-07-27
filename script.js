// Splash
setTimeout(() => {
  document.getElementById('splash-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
}, 2000);

// Internet check
function checkConnection() {
  const msg = document.getElementById('offline-message');
  msg.style.display = navigator.onLine ? 'none' : 'block';
}
window.addEventListener('online', checkConnection);
window.addEventListener('offline', checkConnection);
checkConnection();

// Sheet URL (newest images first using reverse)
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSqeus79UjHIdABYDSnbY6yUuow6rl_4BAf1GDqsOUuoZWUBZlDITJnkQ7NnXhLgeeTJNtsuxcwc8Pj/pub?gid=0&single=true&output=csv&t=" + new Date().getTime();

const gallery = document.getElementById('gallery');
const spinner = document.getElementById('spinner');
const categoryFilter = document.getElementById('categoryFilter');

let imageUrls = [];
let categories = [];
let currentIndex = 0;

fetch(sheetURL)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.trim().split('\n').slice(1).reverse();
    spinner.style.display = 'none';
    rows.forEach((row, i) => {
      const [urlRaw, catRaw] = row.split(',');
      const url = urlRaw.replace(/"/g, '').trim();
      const category = (catRaw || 'Uncategorized').replace(/"/g, '').trim();

      if (url) {
        imageUrls.push({ url, category });
        if (!categories.includes(category)) {
          categories.push(category);
          const option = document.createElement('option');
          option.value = category;
          option.textContent = category;
          categoryFilter.appendChild(option);
        }
      }
    });
    displayImages();
  });

function displayImages(filter = 'all') {
  gallery.innerHTML = '';
  imageUrls.forEach((item, i) => {
    if (filter === 'all' || item.category === filter) {
      const div = document.createElement('div');
      div.className = 'image-tile';
      const img = document.createElement('img');
      img.src = item.url;
      img.alt = `Image ${i+1}`;
      img.dataset.index = i;
      div.appendChild(img);
      div.addEventListener('click', () => openModal(i));
      gallery.appendChild(div);
    }
  });
}

categoryFilter.addEventListener('change', () => {
  const selected = categoryFilter.value;
  displayImages(selected);
});

// Modal logic
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const closeBtn = document.getElementById('close');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

function openModal(i) {
  currentIndex = i;
  modalImg.src = imageUrls[i].url;
  modal.style.display = 'block';
}
function closeModal() {
  modal.style.display = 'none';
}
function showNext() {
  currentIndex = (currentIndex + 1) % imageUrls.length;
  modalImg.src = imageUrls[currentIndex].url;
}
function showPrev() {
  currentIndex = (currentIndex - 1 + imageUrls.length) % imageUrls.length;
  modalImg.src = imageUrls[currentIndex].url;
}
closeBtn.onclick = closeModal;
nextBtn.onclick = showNext;
prevBtn.onclick = showPrev;
modal.onclick = e => { if (e.target === modal) closeModal(); };

document.addEventListener('keydown', e => {
  if (modal.style.display === 'block') {
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'Escape') closeModal();
  }
});

// Swipe Support
let startX = 0;
modal.addEventListener('touchstart', e => startX = e.touches[0].clientX);
modal.addEventListener('touchend', e => {
  let endX = e.changedTouches[0].clientX;
  if (Math.abs(endX - startX) > 50) {
    if (endX < startX) showNext();
    else showPrev();
  }
});