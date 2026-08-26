const SUPABASE_URL = "https://ncavpnittrdgylogbjfp.supabase.co";
const SUPABASE_KEY = "sb_publishable_7E-WPJlMCarIj-FA3quJAw_Z6XFLWqP";

const grid = document.getElementById("productGrid");
const search = document.getElementById("search");

let category = "All";
let products = [];


/* =========================================
   HELPERS
========================================= */

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/[&<>"']/g, function (match) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[match];
    });
}


function formatPrice(value) {
  const number = Number(value || 0);

  return "₹" + number.toLocaleString("en-IN", {
    maximumFractionDigits: 2
  });
}


/* =========================================
   LOADING STATE
========================================= */

function showLoading() {

  grid.innerHTML = `
    <div class="products-loading">
      <div class="loader"></div>
      <p>Finding the best picks...</p>
    </div>
  `;

}


/* =========================================
   EMPTY STATE
========================================= */

function showEmpty(message = "No products found.") {

  grid.innerHTML = `
    <div class="products-empty">
      <div class="empty-icon">✦</div>
      <h3>Nothing here yet</h3>
      <p>${escapeHtml(message)}</p>
    </div>
  `;

}


/* =========================================
   ERROR STATE
========================================= */

function showError() {

  grid.innerHTML = `
    <div class="products-empty">
      <div class="empty-icon">!</div>
      <h3>Something went wrong</h3>
      <p>We couldn't load the products right now.</p>
      <button class="retry-btn" onclick="loadProducts()">
        TRY AGAIN
      </button>
    </div>
  `;

}


/* =========================================
   TRACK AFFILIATE CLICK
========================================= */

async function trackAffiliateClick(product) {

  try {

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/affiliate_clicks`,
      {
        method: "POST",

        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=minimal"
        },

        body: JSON.stringify({
          product_id: product.id,
          product_name: product.name
        })
      }
    );


    if (!response.ok) {

      const errorText =
        await response.text();

      console.error(
        "Affiliate click tracking failed:",
        errorText
      );

      return false;

    }


    console.log(
      "Affiliate click tracked:",
      product.name
    );

    return true;


  } catch (error) {

    console.error(
      "Affiliate click tracking error:",
      error
    );

    return false;

  }

}


/* =========================================
   HANDLE BUY CLICK
========================================= */

function handleBuyClick(event, product) {

  event.stopPropagation();

  /*
    Track click without blocking the Amazon
    link. The visitor is sent to Amazon
    immediately.
  */

  trackAffiliateClick(product);

}


/* =========================================
   LOAD PRODUCTS FROM SUPABASE
========================================= */

async function loadProducts() {

  showLoading();


  try {

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=id,name,category,price,image_url,image_2,image_3,image_4,image_5,description,affiliate_link&order=id.asc`,
      {
        method: "GET",

        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`
        },

        cache: "no-store"
      }
    );


    if (!response.ok) {

      const errorText =
        await response.text();

      throw new Error(errorText);

    }


    const data =
      await response.json();


    products =
      (data || []).map(product => ({

        id: product.id,

        name: product.name || "",

        category:
          product.category || "Other",

        price:
          Number(product.price || 0),

        description:
          product.description || "",

        image:
          product.image_url || "",

        image2:
          product.image_2 || "",

        image3:
          product.image_3 || "",

        image4:
          product.image_4 || "",

        image5:
          product.image_5 || "",

        affiliateLink:
          product.affiliate_link || "#"

      }));


    render();


  } catch (error) {

    console.error(
      "Supabase product error:",
      error
    );

    showError();

  }

}


/* =========================================
   RENDER PRODUCTS
========================================= */

function render() {

  const query =
    search
      ? search.value.toLowerCase().trim()
      : "";


  const filtered =
    products.filter(product => {

      const matchesCategory =
        category === "All" ||
        product.category === category;


      const searchableText =
        (
          product.name +
          " " +
          product.description +
          " " +
          product.category
        ).toLowerCase();


      const matchesSearch =
        !query ||
        searchableText.includes(query);


      return (
        matchesCategory &&
        matchesSearch
      );

    });


  if (!filtered.length) {

    showEmpty(
      query
        ? `No products match "${query}".`
        : "Products will appear here soon."
    );

    return;

  }


  grid.innerHTML =
    filtered
      .map(renderProduct)
      .join("");

}


/* =========================================
   PRODUCT CARD
========================================= */

function renderProduct(product) {

  const image =
    product.image;


  const safeName =
    escapeHtml(product.name);


  const safeCategory =
    escapeHtml(product.category);


  const safeDescription =
    escapeHtml(product.description);


  const safeImage =
    escapeHtml(image);


  const safeAffiliateLink =
    escapeHtml(product.affiliateLink);


  return `

    <article
      class="product"
      onclick="openProduct(${Number(product.id)})"
      tabindex="0"
      role="article"
    >

      <div class="product-img">

        ${
          image

            ? `

              <img
                src="${safeImage}"
                alt="${safeName}"
                loading="lazy"
                onerror="this.parentElement.innerHTML='<div class=&quot;placeholder&quot;>✦</div>'"
              >

            `

            : `

              <div class="placeholder">
                ✦
              </div>

            `
        }

      </div>


      <div class="product-info">

        <span class="tag">
          ${safeCategory}
        </span>


        <h3>
          ${safeName}
        </h3>


        ${
          product.description

            ? `

              <p class="desc">
                ${safeDescription}
              </p>

            `

            : ""
        }


        <div class="bottom">

          <span class="price">
            ${formatPrice(product.price)}
          </span>


          ${
            product.affiliateLink &&
            product.affiliateLink !== "#"

              ? `

                <a
                  class="buy"
                  href="${safeAffiliateLink}"
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  onclick="handleBuyClick(event, ${JSON.stringify(product).replace(/"/g, "&quot;")})"
                >
                  BUY NOW ↗
                </a>

              `

              : `

                <span class="buy disabled">
                  VIEW ↗
                </span>

              `
          }

        </div>

      </div>

    </article>

  `;

}


/* =========================================
   OPEN PRODUCT PAGE
========================================= */

function openProduct(id) {

  window.location.href =
    `product.html?id=${encodeURIComponent(id)}`;

}


/* =========================================
   CATEGORY FILTER
========================================= */

document
  .querySelectorAll(".cat")
  .forEach(button => {

    button.addEventListener(
      "click",
      function () {

        document
          .querySelectorAll(".cat")
          .forEach(item => {
            item.classList.remove("active");
          });


        this.classList.add("active");


        category =
          this.dataset.category;


        render();

      }
    );

  });


/* =========================================
   SEARCH
========================================= */

if (search) {

  search.addEventListener(
    "input",
    render
  );

}


/* =========================================
   START
========================================= */

loadProducts();
