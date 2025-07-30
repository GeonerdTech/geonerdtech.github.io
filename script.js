// Splash screen
setTimeout(() => {
  document.getElementById('splash-screen').style.display = 'none';
}, 2000);

// Google Sheet CSV (with timestamp to prevent caching)
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSqeus79UjHIdABYDSnbY6yUuow6rl_4BAf1GDqsOUuoZWUBZlDITJnkQ7NnXhLgeeTJNtsuxcwc8Pj/pub?gid=0&single=true&output=csv&t=" + new Date().getTime();

const gallery = document.getElementById("gallery");
const categoryFilter = document.getElementById("categoryFilter");
const spinner = document.getElementById("spinner");

let imageData = [];
let currentIndex = 0;

// Fetch and parse CSV
fetch(sheetURL)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.trim().split("\n").slice(1).reverse(); // newest first
    const categories = new Set();

    rows.forEach((row, i) => {
      const [urlRaw, categoryRaw] = row.split(",");
      const url = urlRaw.replace(/"/g, "").trim();
      const category = (categoryRaw || "Uncategorized").replace(/"/g, "").trim();

      if (url) {
        imageData.push({ url, category });
        categories.add(category);
      }
    });

    // Populate filter
    [...categories].sort().forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      categoryFilter.appendChild(option);
    });

    renderImages(imageData);
  });

categoryFilter.addEventListener("change", () => {
  const selected = categoryFilter.value;
  const filtered = selected === "all" ? imageData : imageData.filter(item => item.category === selected);
  renderImages(filtered);
});

function renderImages(images) {
  gallery.innerHTML = "";
  images.forEach((item, index) => {
    const tile = document.createElement("div");
    tile.className = "image-tile";

    const img = document.createElement("img");
    img.src = item.url;
    img.alt = "Image";
    img.dataset.index = index;
    img.onclick = () => openModal(index);

    tile.appendChild(img);

    if (navigator.share) {
      const shareBtn = document.createElement("button");
      shareBtn.className = "share-btn";
      shareBtn.textContent = "Share";
      shareBtn.onclick = (e) => {
        e.stopPropagation();
        navigator.share({
          title: "NewsGrid by GeoNerd",
          text: "Check this out",
          url: `${window.location.href}?image=${index}`
        });
      };
      tile.appendChild(shareBtn);
    }

    gallery.appendChild(tile);
  });
}

// Modal functionality
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modal-img");
const closeBtn = document.getElementById("close");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");

function openModal(index) {
  currentIndex = index;
  modalImg.src = imageData[index].url;
  modal.style.display = "block";
}

function showNext() {
  currentIndex = (currentIndex + 1) % imageData.length;
  modalImg.src = imageData[currentIndex].url;
}

function showPrev() {
  currentIndex = (currentIndex - 1 + imageData.length) % imageData.length;
  modalImg.src = imageData[currentIndex].url;
}

function closeModal() {
  modal.style.display = "none";
}

nextBtn.onclick = showNext;
prevBtn.onclick = showPrev;
closeBtn.onclick = closeModal;
modal.onclick = e => { if (e.target === modal) closeModal(); };
document.addEventListener("keydown", e => {
  if (modal.style.display === "block") {
    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
    if (e.key === "Escape") closeModal();
  }
});
