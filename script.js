// Splash screen delay
setTimeout(() => {
  document.getElementById('splash-screen').style.display = 'none';
}, 2000);

// Spinner
const spinner = document.getElementById('spinner');
spinner.style.display = 'block';

const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSqeus79UjHIdABYDSnbY6yUuow6rl_4BAf1GDqsOUuoZWUBZlDITJnkQ7NnXhLgeeTJNtsuxcwc8Pj/pub?gid=0&single=true&output=csv&t=" + new Date().getTime();

const gallery = document.getElementById('gallery');
const categorySelect = document.getElementById('categorySelect');

let imageData = [];
let currentIndex = 0;

fetch(sheetURL)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.trim().split('\n').slice(1);
    const seenCategories = new Set();

    imageData = rows.map((row, index) => {
      const [url, categoryRaw] = row.split(',');
      return {
        url: url.replace(/"/g, '').trim(),
        category: categoryRaw?.replace(/"/g, '').trim() || 'Uncategorized'
      };
    }).reverse(); // newest first

    imageData.forEach(img => {
      if (!seenCategories.has(img.category)) {
        const opt = document.createElement('option');
        opt.value = img.category;
        opt.textContent = img.category;
        categorySelect.appendChild(opt);
        seenCategories.add(img.category);
      }
    });

    renderGallery();
    spinner.style.display = 'none';
  });

function renderGallery() {
  gallery.innerHTML = '';
  const selected = categorySelect.value;

  imageData.forEach((img, index) => {
    if (!selected || img.category === selected) {
      const div = document.createElement('div');
      div.className = 'image-tile';

      const image = document.createElement('img');
      image.src = img.url;
      image.alt = `Image ${index + 1}`;
      image.setAttribute('data-index', index);
      image.addEventListener('click', () => openModal(index));

      const shareBtn = document.createElement('button');
      shareBtn.textContent = 'Share';
      shareBtn.className = 'share-tile-button';
      shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const shareUrl = `${window.location.origin + window.location.pathname}?image=${index}`;
        if (navigator.share) {
          navigator.share({
            title: 'NewsGrid by GeoNerd',
            text: 'Check out this headline!',
            url: shareUrl
          }).catch(err => console.error('Share failed', err));
        } else {
          alert('Sharing not supported on this browser.');
        }
      });

      div.appendChild(image);
      div.appendChild(shareBtn);
      gallery.appendChild(div);
    }
  });
}

categorySelect.addEventListener('change', renderGallery);

const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const closeBtn = document.getElementById('close');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

function openModal(i) {
  currentIndex = i;
  modalImg.src = imageData[i].url;
  modal.style.display = 'block';
}
function closeModal() {
  modal.style.display = 'none';
}
function showNext() {
  currentIndex = (currentIndex + 1) % imageData.length;
  modalImg.src = imageData[currentIndex].url;
}
function showPrev() {
  currentIndex = (currentIndex - 1 + imageData.length) % imageData.length;
  modalImg.src = imageData[currentIndex].url;
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

// Open modal if ?image=3 in URL
window.addEventListener('load', () => {
  const params = new URLSearchParams(window.location.search);
  const index = parseInt(params.get('image'), 10);
  if (!isNaN(index) && imageData[index]) {
    setTimeout(() => openModal(index), 2500); // after splash
  }
});
