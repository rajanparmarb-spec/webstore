let allProducts = [];
let activeCategory = "All";

function addToCart(button) {
  const product = button.closest(".product");
  const name = product.querySelector("h3").innerText;
  const price = parseInt(product.querySelector(".price").innerText.replace(/[₹,]/g, ""));
  const image = product.querySelector("img").src;
  const sizeEl = product.querySelector(".size.active");
  const size = sizeEl ? sizeEl.innerText : "Free Size";

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push({ name, price, image, size });
  localStorage.setItem("cart", JSON.stringify(cart));

  updateCartCount();
  updateFloatingCartCount();

  button.innerText = "✓ ADDED";
  setTimeout(() => (button.innerText = "ADD TO CART"), 1200);
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const badge = document.getElementById("cart-count");
  if (badge) badge.innerText = cart.length;
}

function updateFloatingCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const badge = document.querySelector(".floating-cart-count");
  if (!badge) return;
  badge.textContent = cart.length;
  badge.style.display = cart.length ? "flex" : "none";
}

function scrollToShop() {
  const shop = document.getElementById("shop");
  if (shop) shop.scrollIntoView({ behavior: "smooth" });
}

function toggleMenu() {
  const menu = document.getElementById("nav-menu");
  if (menu) menu.classList.toggle("open");
}

window.selectSize = function (button) {
  const sizesContainer = button.parentElement;
  sizesContainer.querySelectorAll(".size").forEach((s) => s.classList.remove("active"));
  button.classList.add("active");
};

window.selectColor = function (colorCircle, event) {
  event.stopPropagation();
  const colorsContainer = colorCircle.parentElement;
  colorsContainer.querySelectorAll(".color-circle").forEach((c) => c.classList.remove("active"));
  colorCircle.classList.add("active");
};

function getProductImages(product) {
  const images = [product.image];
  let count = 1;
  while (product[`image${count}`]) {
    images.push(product[`image${count}`]);
    count++;
  }
  return images;
}

function normalizeProduct(item) {
  const category = item.category || item.Category || "All";
  const size = item.size || "S,M,L";
  const price = Number(item.price) || 0;
  return {
    ...item,
    category,
    size,
    price,
    image: item.image || "images/hero.jpg"
  };
}

function createCategoryFilters(products) {
  const wrap = document.getElementById("categoryFilters");
  if (!wrap) return;

  const unique = [...new Set(products.map((p) => p.category).filter(Boolean))];
  const categories = ["All", ...unique];

  wrap.innerHTML = categories
    .map(
      (cat) => `<button class="filter-btn ${cat === activeCategory ? "active" : ""}" data-category="${cat}">${cat}</button>`
    )
    .join("");

  wrap.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.category;
      createCategoryFilters(allProducts);
      renderProducts();
    });
  });
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const searchTerm = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();
  const sortBy = document.getElementById("sortSelect")?.value || "default";

  let filtered = allProducts.filter((product) => {
    const matchCategory = activeCategory === "All" || product.category === activeCategory;
    const matchSearch = !searchTerm || product.name?.toLowerCase().includes(searchTerm);
    return matchCategory && matchSearch;
  });

  if (sortBy === "priceLow") filtered.sort((a, b) => a.price - b.price);
  if (sortBy === "priceHigh") filtered.sort((a, b) => b.price - a.price);
  if (sortBy === "nameAZ") filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  if (!filtered.length) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#6b7280;">No products found. Try another search or category.</p>';
    return;
  }

  grid.innerHTML = "";

  filtered.forEach((item) => {
    const product = document.createElement("div");
    product.className = "product";

    const availableSizes = item.size ? item.size.split(",").map((s) => s.trim()) : ["Free Size"];
    const sizeButtons = availableSizes
      .map((size, index) => `<button class="size ${index === 0 ? "active" : ""}" onclick="selectSize(this)">${size}</button>`)
      .join("");

    const availableColors = item.color ? item.color.split(",").map((c) => c.trim()) : [];
    const colorCircles = availableColors
      .map((color, index) => {
        const style = color.startsWith("#") ? color : color.toLowerCase();
        return `<span class="color-circle ${index === 0 ? "active" : ""}" style="background:${style}" onclick="selectColor(this, event)" title="${color}"></span>`;
      })
      .join("");

    const productDataString = JSON.stringify({
      images: getProductImages(item),
      name: item.name,
      price: item.price,
      description: item.description || "Premium quality product",
      sizes: item.size || "",
      colors: item.color || ""
    })
      .replace(/'/g, "\\'")
      .replace(/"/g, "&quot;");

    product.innerHTML = `
      <div class="fashion-product" onclick='openProductWithImages(${productDataString})'>
        <img src="${item.image}" alt="${item.name}">
        <div class="fashion-info">
          <h3>${item.name}</h3>
          <p class="price">₹${Number(item.price).toLocaleString()}</p>
          ${colorCircles ? `<div class="color-circles" onclick="event.stopPropagation()">${colorCircles}</div>` : ""}
          <div class="sizes" onclick="event.stopPropagation()">${sizeButtons}</div>
          <button class="add-cart-btn" onclick="event.stopPropagation(); addToCart(this)">ADD TO CART</button>
        </div>
      </div>`;

    grid.appendChild(product);
  });
}

function setupProductControls() {
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");

  if (searchInput) searchInput.addEventListener("input", renderProducts);
  if (sortSelect) sortSelect.addEventListener("change", renderProducts);

  document.querySelectorAll(".category-grid .category").forEach((categoryLink) => {
    categoryLink.addEventListener("click", () => {
      const nextCategory = categoryLink.dataset.category;
      if (nextCategory) {
        activeCategory = nextCategory;
        createCategoryFilters(allProducts);
        setTimeout(renderProducts, 0);
      }
    });
  });

  document.querySelectorAll("#nav-menu a").forEach((link) => {
    link.addEventListener("click", () => document.getElementById("nav-menu")?.classList.remove("open"));
  });
}

function loadProducts() {
  const sheetURL = "https://opensheet.elk.sh/1XXXU5lQDFYOvpWEAXZQEL3jlIGmCgQ8erj7cdAzvgIc/Sheet1";

  fetch(sheetURL)
    .then((res) => res.json())
    .then((data) => {
      allProducts = data.map(normalizeProduct);
      createCategoryFilters(allProducts);
      setupProductControls();
      renderProducts();
    })
    .catch(() => {
      allProducts = [
        { name: "Classic Kurti", price: 1399, image: "images/hero.jpg", size: "S,M,L", color: "#7f1d1d,#111827", category: "Kurtis" },
        { name: "Festive Saree", price: 2699, image: "images/hero.png", size: "Free", color: "#1d4ed8,#f4b400", category: "Sarees" },
        { name: "Floral Dress", price: 1799, image: "images/hero.jpg", size: "XS,S,M", color: "#f43f5e,#fb7185", category: "Dresses" }
      ];
      createCategoryFilters(allProducts);
      setupProductControls();
      renderProducts();
    });
}

function openProductWithImages(productData) {
  localStorage.setItem("selectedProduct", JSON.stringify(productData));
  window.location.href = "product.html";
}

updateCartCount();
updateFloatingCartCount();
