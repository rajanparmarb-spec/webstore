/* ============================================
   CART MANAGEMENT
   ============================================ */

function addToCart(button) {
  const product = button.closest(".product");
  const name = product.querySelector("h3").innerText;
  const price = parseInt(
    product.querySelector(".price").innerText.replace(/[₹,]/g, "")
  );
  const image = product.querySelector("img").src;
  
  // Get selected size
  const sizeButton = product.querySelector(".size.active");
  const size = sizeButton ? sizeButton.innerText : "M";

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push({ name, price, image, size });
  localStorage.setItem("cart", JSON.stringify(cart));

  updateCartCount();
  updateFloatingCartCount();

  // Feedback animation
  const originalText = button.innerText;
  button.innerText = "✓ ADDED";
  button.style.background = "var(--accent)";
  button.style.color = "var(--primary)";
  
  setTimeout(() => {
    button.innerText = originalText;
    button.style.background = "";
    button.style.color = "";
  }, 1500);
}

function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const elements = document.querySelectorAll("#cart-count");
  elements.forEach(el => {
    el.innerText = cart.length;
  });
}

function updateFloatingCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const badge = document.querySelector(".floating-cart-count");

  if (!badge) return;

  badge.textContent = cart.length;

  if (cart.length === 0) {
    badge.style.display = "none";
  } else {
    badge.style.display = "flex";
  }
}

/* ============================================
   NAVIGATION
   ============================================ */

function scrollToShop() {
  const shopSection = document.getElementById("shop");
  if (shopSection) {
    shopSection.scrollIntoView({ behavior: "smooth" });
  }
}

function toggleMenu() {
  const menu = document.getElementById("nav-menu");
  const menuIcon = document.querySelector(".menu-icon");

  if (!menu) return;

  // Toggle active class
  menu.classList.toggle("active");

  // Change icon
  menuIcon.textContent = menu.classList.contains("active") ? "✕" : "☰";

  // Close when link clicked (attach once)
  if (!menu.dataset.listenerAdded) {
    menu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        menu.classList.remove("active");
        menuIcon.textContent = "☰";
      });
    });
    menu.dataset.listenerAdded = "true";
  }
}

/* ============================================
   CONTACT FORM
   ============================================ */

const contactForm = document.getElementById("contactForm");
const successMessage = document.getElementById("successMessage");

if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    
    if (successMessage) {
      successMessage.textContent = "✓ Thank you! Your message has been sent.";
      successMessage.style.color = "var(--accent)";
      successMessage.style.marginTop = "16px";
    }
    
    contactForm.reset();
    
    // Reset message after 3 seconds
    setTimeout(() => {
      if (successMessage) {
        successMessage.textContent = "";
      }
    }, 3000);
  });
}

/* ============================================
   SIZE SELECTION
   ============================================ */

window.selectSize = function(button) {
  const sizesContainer = button.parentElement;
  if (sizesContainer) {
    sizesContainer.querySelectorAll(".size, .size-btn").forEach(s => {
      s.classList.remove("active");
    });
    button.classList.add("active");
  }
};

/* ============================================
   COLOR SELECTION
   ============================================ */

window.selectColor = function(colorCircle, event) {
  if (event) {
    event.stopPropagation();
  }
  const colorsContainer = colorCircle.parentElement;
  if (colorsContainer) {
    colorsContainer.querySelectorAll(".color-circle").forEach(c => {
      c.classList.remove("active");
    });
    colorCircle.classList.add("active");
  }
};

window.selectProductColor = function(colorElement) {
  const colorsContainer = colorElement.parentElement;
  if (colorsContainer) {
    colorsContainer.querySelectorAll(".color").forEach(c => {
      c.classList.remove("active");
    });
    colorElement.classList.add("active");
  }
};

/* ============================================
   PRODUCT SIZE SELECTION
   ============================================ */

window.selectProductSize = function(button) {
  const sizesContainer = button.parentElement;
  if (sizesContainer) {
    sizesContainer.querySelectorAll(".size-btn").forEach(s => {
      s.classList.remove("active");
    });
    button.classList.add("active");
  }
};

/* ============================================
   PRODUCT IMAGE HANDLING
   ============================================ */

function getProductImages(product) {
  const images = [product.image];
  let count = 1;
  
  while (product[`image${count}`]) {
    images.push(product[`image${count}`]);
    count++;
  }
  
  return images;
}

/* ============================================
   PRODUCT LOADING
   ============================================ */

function loadProducts() {
  const sheetURL = "https://opensheet.elk.sh/1XXXU5lQDFYOvpWEAXZQEL3jlIGmCgQ8erj7cdAzvgIc/Sheet1";
  
  fetch(sheetURL)
    .then(res => res.json())
    .then(data => {
      const grid = document.getElementById("productGrid");
      if (!grid) return;

      grid.innerHTML = "";

      data.forEach((item, index) => {
        // Parse sizes
        const availableSizes = item.size ? item.size.split(",").map(s => s.trim()) : ["M"];
        
        // Generate size buttons
        const sizeButtons = availableSizes.map((size, idx) => {
          const isActive = idx === 0 ? "active" : "";
          return `<button class="size ${isActive}" onclick="selectSize(this)">${size}</button>`;
        }).join("");

        // Parse colors
        const availableColors = item.color ? item.color.split(",").map(c => c.trim()) : [];
        
        // Generate color circles
        const colorCircles = availableColors.map((color, idx) => {
          const isActive = idx === 0 ? "active" : "";
          const colorStyle = color.startsWith("#") ? `background: ${color}` : `background: ${color.toLowerCase()}`;
          return `<span class="color-circle ${isActive}" style="${colorStyle}" onclick="selectColor(this, event)" title="${color}"></span>`;
        }).join("");

        // Get all images
        const allImages = getProductImages(item);
        const productDataString = JSON.stringify({
          images: allImages,
          name: item.name,
          price: item.price,
          description: item.description || "Premium quality product",
          sizes: item.size || "",
          colors: item.color || ""
        })
          .replace(/'/g, "\\'")
          .replace(/"/g, "&quot;");

        const productHTML = `
          <div class="product" style="animation-delay: ${index * 0.05}s">
            <div class="fashion-product" onclick='openProductWithImages(${productDataString})' style="cursor: pointer;">
              <img src="${item.image}" alt="${item.name}" loading="lazy">
              <div class="fashion-info">
                <h3>${item.name}</h3>
                <p class="price">₹${Number(item.price).toLocaleString()}</p>
                
                ${colorCircles ? `
                <div class="color-option" onclick="event.stopPropagation()">
                  <div class="color-circles">
                    ${colorCircles}
                  </div>
                </div>
                ` : ""}
                
                <div class="option">
                  <div class="sizes" onclick="event.stopPropagation()">
                    ${sizeButtons}
                  </div>
                </div>

                <button class="add-cart-btn" onclick="event.stopPropagation(); addToCart(this)">
                  ADD TO CART
                </button>
              </div>
            </div>
          </div>
        `;

        grid.innerHTML += productHTML;
      });
    })
    .catch(err => console.error("Error loading products:", err));
}

function openProductWithImages(productData) {
  localStorage.setItem("selectedProduct", JSON.stringify(productData));
  window.location.href = "product.html";
}

/* ============================================
   PRODUCT DETAIL PAGE
   ============================================ */

function addProductToCart() {
  const product = JSON.parse(localStorage.getItem("selectedProduct"));
  
  if (!product) {
    alert("Product data not found!");
    return;
  }

  const selectedSize = document.querySelector(".sizes .size-btn.active");
  if (!selectedSize) {
    alert("Please select a size!");
    return;
  }

  const size = selectedSize.innerText;
  const images = product.images || [product.image];
  const selectedColor = document.querySelector("#productColors .color.active");
  const color = selectedColor ? selectedColor.title : "";

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push({
    name: product.name,
    price: Number(product.price),
    image: images[0],
    size: size,
    color: color
  });

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  updateFloatingCartCount();

  // Visual feedback
  const button = document.querySelector(".add-cart-btn");
  const originalText = button.innerText;
  button.innerText = "✓ ADDED";
  
  setTimeout(() => {
    button.innerText = originalText;
  }, 1500);
}

/* ============================================
   PAGE INITIALIZATION
   ============================================ */

document.addEventListener("DOMContentLoaded", function() {
  updateCartCount();
  updateFloatingCartCount();
  
  // Load products if grid exists
  if (document.getElementById("productGrid")) {
    loadProducts();
  }
});

// Initialize on page load
window.addEventListener("load", function() {
  updateCartCount();
  updateFloatingCartCount();
});