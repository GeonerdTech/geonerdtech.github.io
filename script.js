// Splash screen delay
setTimeout(() => {
  document.getElementById('splash-screen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
}, 2000);

// Sheet CSV link
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSqeus79UjHIdABYDSnbY6yUuow6rl_4BAf1GDqsOUuoZWUBZlDITJnkQ7NnXhLgeeTJNtsuxcwc8Pj/pub?gid=0&single=true&output=csv&t=" + new Date().getTime();

const gallery = document.getElementById('gallery');
const categorySelect = document.getElementById('categorySelect');
const spinner = document.getElementById('spinner');
let imageData = [];
let currentIndex = 0;

// Fetch and render
fetch(sheetURL)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.trim().split('\n').slice(1).reverse(); // newest first
    const categories = new Set();

    rows.forEach((row, i) => {
      const [urlRaw, categoryRaw] = row.split(',');
      const url = urlRaw.replace(/"/g, '').trim();
      const category = categoryRaw ? categoryRaw.replace(/"/g, '').trim() : '';

      if (url) {
        imageData.push({ url, category });

        if (category) categories.add(category);
      }
    });

    // Populate category filter
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      categorySelect.appendChild(opt);
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

      // Individual share button
      const shareBtn = document.createElement('button');
      shareBtn.textContent = 'Share';
      shareBtn.className = 'share-tile-button';
      shareBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent opening modal
        if (navigator.share) {
          navigator
            .share({
              title: 'NewsGrid by GeoNerd',
              text: 'Check out this headline!',
              url: img.url,
            })
            .catch((err) => console.error('Sharing failed', err));
        } else {
          alert('Sharing not supported on this device/browser.');
        }
      });

      div.appendChild(image);
      div.appendChild(shareBtn);
      gallery.appendChild(div);
    }
  });
}


categorySelect.addEventListener('change', renderGallery);

// Modal logic
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const closeBtn = document.getElementById('close');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

function openModal(index) {
  currentIndex = index;
  modalImg.src = imageData[index].url;
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

// Share button logic
document.getElementById('shareBtn').addEventListener('click', async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'NewsGrid by GeoNerd',
        text: 'Check out this visual news app!',
        url: window.location.href
      });
    } catch (err) {
      alert('Sharing cancelled or failed.');
    }
  } else {
    alert('Sharing not supported on this browser/device.');
  }
});
