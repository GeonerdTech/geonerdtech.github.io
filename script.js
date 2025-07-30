// Splash screen
setTimeout(() => {
  document.getElementById("splash-screen").style.display = "none";
  document.getElementById("app").style.display = "block";
}, 2000);

const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSqeus79UjHIdABYDSnbY6yUuow6rl_4BAf1GDqsOUuoZWUBZlDITJnkQ7NnXhLgeeTJNtsuxcwc8Pj/pub?output=csv&t=" + new Date().getTime();

const gallery = document.getElementById("gallery");
const loader = document.getElementById("loader");
const categorySelect = document.getElementById("categorySelect");
let imageData = [], filteredData = [], currentIndex = 0;

// Load CSV
fetch(sheetURL)
  .then(res => res.text())
  .then(csv => {
    const rows = csv.trim().split("\n").slice(1);
    imageData = rows.reverse().map(row => {
      const [image, category] = row.split(",");
      return { image: image.replace(/"/g, "").trim(), category: category?.trim() || "Uncategorized" };
    });
    populateCategories();
    renderImages("all");
  });

function populateCategories() {
  const uniqueCategories = [...new Set(imageData.map(item => item.category))];
  uniqueCategories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categorySelect.appendChild(opt);
  });
  categorySelect.addEventListener("change", () => renderImages(categorySelect.value));
}

function renderImages(filter) {
  gallery.innerHTML = "";
  filteredData = filter === "all" ? imageData : imageData.filter(item => item.category === filter);
  filteredData.forEach((item, i) => {
    const div = document.createElement("div");
    div.className = "image-tile";
    const img = document.createElement("img");
    img.src = item.image;
    img.alt = `Image ${i + 1}`;
    img.setAttribute("data-index", i);
    img.addEventListener("click", () => openModal(i));
    const shareBtn = document.createElement("button");
    shareBtn.textContent = "Share";
    shareBtn.className = "share-btn";
    shareBtn.onclick = () => navigator.share?.({
      title: "NewsGrid Image",
      text: "Check out this image on NewsGrid!",
      url: `${location.href}?image=${i}`
    }).catch(console.log);
    div.append(img, shareBtn);
    gallery.appendChild(div);
  });
  loader.style.display = "none";
}

// Modal
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modal-img");
const closeBtn = document.getElementById("close");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

function openModal(i) {
  currentIndex = i;
  modalImg.src = filteredData[i].image;
  modal.style.display = "block";
}
function closeModal() { modal.style.display = "none"; }
function showNext() {
  currentIndex = (currentIndex + 1) % filteredData.length;
  modalImg.src = filteredData[currentIndex].image;
}
function showPrev() {
  currentIndex = (currentIndex - 1 + filteredData.length) % filteredData.length;
  modalImg.src = filteredData[currentIndex].image;
}
closeBtn.onclick = closeModal;
nextBtn.onclick = showNext;
prevBtn.onclick = showPrev;
modal.onclick = e => { if (e.target === modal) closeModal(); };
document.addEventListener("keydown", e => {
  if (modal.style.display === "block") {
    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
    if (e.key === "Escape") closeModal();
  }
});

// Swipe support
let startX = 0;
modal.addEventListener("touchstart", e => startX = e.touches[0].clientX);
modal.addEventListener("touchend", e => {
  const diff = e.changedTouches[0].clientX - startX;
  if (diff > 50) showPrev();
  if (diff < -50) showNext();
});
