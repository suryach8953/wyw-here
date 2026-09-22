const SUPABASE_URL =
  "https://ncavpnittrdgylogbjfp.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_7E-WPJlMCarIj-FA3quJAw_Z6XFLWqP";


/* =========================================================
   SETTINGS
========================================================= */

const PRODUCTS_PER_PAGE = 12;

let products = [];

let selectedCategory = "All";

let currentPage = 1;

let currentSort = "newest";


/* =========================================================
   DOM
========================================================= */

const grid =
  document.getElementById("productGrid");

const search =
  document.getElementById("search");

const sortSelect =
  document.getElementById("sortProducts");

const resultCount =
  document.getElementById("resultCount");

const categoryButtons =
  document.querySelectorAll(".cat-v2");

const featuredImageWrap =
  document.getElementById(
    "featuredImageWrap"
  );

const featuredCategory =
  document.getElementById(
    "featuredCategory"
  );

const featuredName =
  document.getElementById(
    "featuredName"
  );

const featuredPrice =
  document.getElementById(
    "featuredPrice"
  );

const featuredLink =
  document.getElementById(
    "featuredLink"
  );

const statProducts =
  document.getElementById(
    "statProducts"
  );

const currentYear =
  document.getElementById(
    "currentYear"
  );

const backTop =
  document.getElementById(
    "backTop"
  );

const mobileMenuBtn =
  document.getElementById(
    "mobileMenuBtn"
  );

const mobileNav =
  document.getElementById(
    "mobileNav"
  );


/* =========================================================
   HELPERS
========================================================= */

function escapeHtml(value) {

  return String(value ?? "")
    .replace(
      /[&<>"']/g,
      function(match) {

        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;"
        }[match];

      }
    );

}


function formatPrice(value) {

  const number =
    Number(value || 0);

  return (
    "₹" +
    number.toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2
      }
    )
  );

}


function normalizeProduct(product) {

  return {

    id:
      product.id,

    name:
      product.name || "",

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

  };

}


/* =========================================================
   LOADING
========================================================= */

function showLoading() {

  if (!grid) return;

  grid.innerHTML = `

    <div class="loading-grid-v2">

      ${Array.from(
        { length: 8 },
        () => `

          <div class="skeleton-card-v2">

            <div class="skeleton-image-v2"></div>

            <div class="skeleton-content-v2">

              <div class="skeleton-line-v2"></div>

              <div class="skeleton-line-v2 medium"></div>

              <div class="skeleton-line-v2 short"></div>

            </div>

          </div>

        `
      ).join("")}

    </div>

  `;

}


/* =========================================================
   EMPTY
========================================================= */

function showEmpty(message) {

  grid.innerHTML = `

    <div class="empty-v2">

      <div class="empty-icon-v2">
        ✦
      </div>

      <h3>
        Nothing found
      </h3>

      <p>
        ${escapeHtml(
          message ||
          "Try another search or category."
        )}
      </p>

      <button
        class="retry-v2"
        id="clearFiltersBtn"
      >
        CLEAR FILTERS
      </button>

    </div>

  `;

  const clearBtn =
    document.getElementById(
      "clearFiltersBtn"
    );

  if (clearBtn) {

    clearBtn.addEventListener(
      "click",
      clearFilters
    );

  }

}


/* =========================================================
   ERROR
========================================================= */

function showError() {

  grid.innerHTML = `

    <div class="empty-v2">

      <div class="empty-icon-v2">
        !
      </div>

      <h3>
        Products could not load
      </h3>

      <p>
        Please try again in a moment.
      </p>

      <button
        class="retry-v2"
        id="retryProductsBtn"
      >
        TRY AGAIN
      </button>

    </div>

  `;

  const retryBtn =
    document.getElementById(
      "retryProductsBtn"
    );

  if (retryBtn) {

    retryBtn.addEventListener(
      "click",
      loadProducts
    );

  }

}


/* =========================================================
   SUPABASE PRODUCT LOAD
========================================================= */

async function loadProducts() {

  showLoading();

  try {

    const url =
      `${SUPABASE_URL}/rest/v1/products` +
      `?select=id,name,category,price,image_url,image_2,image_3,image_4,image_5,description,affiliate_link` +
      `&order=id.desc`;

    const response =
      await fetch(
        url,
        {
          method: "GET",

          headers: {

            "apikey":
              SUPABASE_KEY,

            "Authorization":
              `Bearer ${SUPABASE_KEY}`

          },

          cache:
            "no-store"

        }
      );


    if (!response.ok) {

      throw new Error(
        await response.text()
      );

    }


    const data =
      await response.json();


    products =
      Array.isArray(data)
        ? data.map(normalizeProduct)
        : [];


    currentPage = 1;


    updateStats();

    updateCategoryCounts();

    updateFeaturedProduct();

    render();


  } catch (error) {

    console.error(
      "Supabase product error:",
      error
    );

    showError();

  }

}


/* =========================================================
   STATS
========================================================= */

function updateStats() {

  if (statProducts) {

    statProducts.textContent =
      products.length;

  }

}


/* =========================================================
   CATEGORY COUNTS
========================================================= */

function updateCategoryCounts() {

  categoryButtons.forEach(
    button => {

      const category =
        button.dataset.category;

      const count =
        category === "All"

          ? products.length

          : products.filter(
              product =>
                product.category === category
            ).length;


      const countElement =
        button.querySelector(
          ".cat-count-v2"
        );


      if (countElement) {

        countElement.textContent =
          count;

      }

    }
  );

}


/* =========================================================
   FEATURED PRODUCT
========================================================= */

function updateFeaturedProduct() {

  if (!featuredImageWrap) return;


  if (!products.length) {

    featuredImageWrap.innerHTML = `

      <div class="featured-empty">
        Products coming soon...
      </div>

    `;

    featuredCategory.textContent =
      "WYW HERE";

    featuredName.textContent =
      "Discover something you'll love.";

    featuredPrice.textContent =
      "—";

    featuredLink.href =
      "#products";

    return;

  }


  const featured =
    products[0];


  featuredImageWrap.innerHTML = `

    <img
      src="${escapeHtml(featured.image)}"
      alt="${escapeHtml(featured.name)}"
      loading="eager"
      onerror="this.style.display='none';"
    >

  `;


  featuredCategory.textContent =
    featured.category;


  featuredName.textContent =
    featured.name;


  featuredPrice.textContent =
    formatPrice(
      featured.price
    );


  featuredLink.href =
    `product.html?id=${encodeURIComponent(
      featured.id
    )}`;

}


/* =========================================================
   FILTER
========================================================= */

function getFilteredProducts() {

  const query =
    search
      ? search.value
          .toLowerCase()
          .trim()
      : "";


  let filtered =
    products.filter(
      product => {

        const categoryMatch =
          selectedCategory === "All" ||
          product.category ===
            selectedCategory;


        const searchMatch =
          !query ||

          product.name
            .toLowerCase()
            .includes(query) ||

          product.description
            .toLowerCase()
            .includes(query) ||

          product.category
            .toLowerCase()
            .includes(query);


        return (
          categoryMatch &&
          searchMatch
        );

      }
    );


  filtered =
    [...filtered];


  switch (currentSort) {

    case "price-low":

      filtered.sort(
        (a,b) =>
          a.price - b.price
      );

      break;


    case "price-high":

      filtered.sort(
        (a,b) =>
          b.price - a.price
      );

      break;


    case "name":

      filtered.sort(
        (a,b) =>
          a.name.localeCompare(
            b.name
          )
      );

      break;


    default:

      filtered.sort(
        (a,b) =>
          Number(b.id) -
          Number(a.id)
      );

      break;

  }


  return filtered;

}


/* =========================================================
   RENDER
========================================================= */

function render() {

  const filtered =
    getFilteredProducts();


  if (resultCount) {

    resultCount.textContent =
      filtered.length;

  }


  if (!filtered.length) {

    showEmpty(
      search.value.trim()
        ? `No results for "${search.value.trim()}".`
        : "No products available in this category."
    );

    removePagination();

    return;

  }


  const totalPages =
    Math.ceil(
      filtered.length /
      PRODUCTS_PER_PAGE
    );


  if (
    currentPage >
    totalPages
  ) {

    currentPage =
      totalPages;

  }


  const start =
    (currentPage - 1) *
    PRODUCTS_PER_PAGE;


  const pageProducts =
    filtered.slice(
      start,
      start + PRODUCTS_PER_PAGE
    );


  renderProducts(
    pageProducts
  );


  renderPagination(
    totalPages
  );

}


/* =========================================================
   PRODUCT CARDS
========================================================= */

function renderProducts(pageProducts) {

  if (!grid) return;


  const globalStart =
    (currentPage - 1) *
    PRODUCTS_PER_PAGE;


  grid.innerHTML =
    pageProducts
      .map(
        (product,index) => {

          const isNew =
            globalStart + index < 4;


          return `

            <article
              class="product-card-v2"
              data-product-id="${product.id}"
            >

              <div
                class="product-image-v2"
                data-detail-id="${product.id}"
              >

                <div
                  class="product-badges-v2"
                >

                  ${
                    isNew
                      ? `
                        <span class="badge-new-v2">
                          New
                        </span>
                      `
                      : `<span></span>`
                  }

                  <span class="badge-cat-v2">
                    ${escapeHtml(
                      product.category
                    )}
                  </span>

                </div>


                ${
                  product.image
                    ? `
                      <img
                        src="${escapeHtml(
                          product.image
                        )}"
                        alt="${escapeHtml(
                          product.name
                        )}"
                        loading="lazy"
                        onerror="this.style.display='none';"
                      >
                    `
                    : `
                      <div
                        style="
                          width:100%;
                          height:100%;
                          display:flex;
                          align-items:center;
                          justify-content:center;
                          color:#aaa;
                          font-size:32px;
                        "
                      >
                        ✦
                      </div>
                    `
                }


                <div class="product-shine-v2"></div>

              </div>



              <div class="product-info-v2">

                <div
                  class="product-name-v2"
                >
                  ${escapeHtml(
                    product.name
                  )}
                </div>


                <div
                  class="product-description-v2"
                >
                  ${escapeHtml(
                    product.description ||
                    "A useful find worth checking out."
                  )}
                </div>


                <div class="product-bottom-v2">

                  <div
                    class="product-price-v2"
                  >
                    ${formatPrice(
                      product.price
                    )}
                  </div>


                  <div
                    class="product-actions-v2"
                  >

                    <button
                      class="details-btn-v2"
                      data-detail-id="${product.id}"
                      aria-label="View product"
                      title="View product"
                    >
                      →
                    </button>


                    <button
                      class="buy-btn-v2"
                      data-buy-id="${product.id}"
                    >
                      Buy Now
                    </button>

                  </div>

                </div>

              </div>

            </article>

          `;

        }
      )
      .join("");


  requestAnimationFrame(
    () => {

      const cards =
        grid.querySelectorAll(
          ".product-card-v2"
        );


      cards.forEach(
        (card,index) => {

          setTimeout(
            () => {

              card.classList.add(
                "revealed"
              );

            },
            index * 45
          );

        }
      );

    }
  );


  grid.querySelectorAll(
    "[data-detail-id]"
  ).forEach(
    element => {

      element.addEventListener(
        "click",
        () => {

          const id =
            element.dataset.detailId;

          window.location.href =
            `product.html?id=${encodeURIComponent(
              id
            )}`;

        }
      );

    }
  );


  grid.querySelectorAll(
    "[data-buy-id]"
  ).forEach(
    button => {

      button.addEventListener(
        "click",
        event => {

          event.stopPropagation();

          const id =
            button.dataset.buyId;

          handleBuyClick(id);

        }
      );

    }
  );

}


/* =========================================================
   AFFILIATE TRACKING
========================================================= */

async function trackAffiliateClick(
  product
) {

  try {

    if (!product) {
      return false;
    }


    const response =
      await fetch(
        `${SUPABASE_URL}/rest/v1/affiliate_clicks`,
        {

          method:
            "POST",

          headers: {

            "apikey":
              SUPABASE_KEY,

            "Authorization":
              `Bearer ${SUPABASE_KEY}`,

            "Content-Type":
              "application/json",

            "Prefer":
              "return=minimal"

          },

          body:
            JSON.stringify({

              product_id:
                product.id,

              product_name:
                product.name

            }),

          keepalive:
            true

        }
      );


    if (!response.ok) {

      console.error(
        "Affiliate tracking failed:",
        await response.text()
      );

      return false;

    }


    return true;

  } catch (error) {

    console.error(
      "Affiliate tracking error:",
      error
    );

    return false;

  }

}


/* =========================================================
   BUY CLICK
========================================================= */

function handleBuyClick(
  productId
) {

  const product =
    products.find(
      item =>
        String(item.id) ===
        String(productId)
    );


  if (!product) {

    console.error(
      "Product not found:",
      productId
    );

    return;

  }


  if (
    !product.affiliateLink ||
    product.affiliateLink === "#"
  ) {

    window.location.href =
      `product.html?id=${encodeURIComponent(
        product.id
      )}`;

    return;

  }


  trackAffiliateClick(
    product
  );


  /*
    Small delay lets the tracking request start
    before opening the affiliate destination.
  */

  setTimeout(
    () => {

      window.location.href =
        product.affiliateLink;

    },
    90
  );

}


/* =========================================================
   PAGINATION
========================================================= */

function renderPagination(
  totalPages
) {

  removePagination();


  if (totalPages <= 1) {
    return;
  }


  const pagination =
    document.createElement(
      "div"
    );


  pagination.id =
    "pagination";


  pagination.className =
    "pagination-v2";


  const previous =
    document.createElement(
      "button"
    );


  previous.textContent =
    "←";


  previous.disabled =
    currentPage === 1;


  previous.addEventListener(
    "click",
    () => {

      if (
        currentPage > 1
      ) {

        changePage(
          currentPage - 1
        );

      }

    }
  );


  pagination.appendChild(
    previous
  );


  const maxButtons =
    5;


  let startPage =
    Math.max(
      1,
      currentPage -
      Math.floor(
        maxButtons / 2
      )
    );


  let endPage =
    Math.min(
      totalPages,
      startPage + maxButtons - 1
    );


  if (
    endPage - startPage <
    maxButtons - 1
  ) {

    startPage =
      Math.max(
        1,
        endPage - maxButtons + 1
      );

  }


  for (
    let page = startPage;
    page <= endPage;
    page++
  ) {

    const button =
      document.createElement(
        "button"
      );


    button.textContent =
      page;


    if (
      page === currentPage
    ) {

      button.classList.add(
        "active"
      );

    }


    button.addEventListener(
      "click",
      () => {

        changePage(
          page
        );

      }
    );


    pagination.appendChild(
      button
    );

  }


  const next =
    document.createElement(
      "button"
    );


  next.textContent =
    "→";


  next.disabled =
    currentPage === totalPages;


  next.addEventListener(
    "click",
    () => {

      if (
        currentPage <
        totalPages
      ) {

        changePage(
          currentPage + 1
        );

      }

    }
  );


  pagination.appendChild(
    next
  );


  const productsSection =
    document.getElementById(
      "products"
    );


  if (productsSection) {

    productsSection.appendChild(
      pagination
    );

  }

}


/* =========================================================
   CHANGE PAGE
========================================================= */

function changePage(
  page
) {

  const filtered =
    getFilteredProducts();


  const totalPages =
    Math.ceil(
      filtered.length /
      PRODUCTS_PER_PAGE
    );


  if (
    page < 1 ||
    page > totalPages
  ) {

    return;

  }


  currentPage =
    page;


  render();


  const productsSection =
    document.getElementById(
      "products"
    );


  if (productsSection) {

    window.scrollTo({

      top:
        productsSection.offsetTop - 75,

      behavior:
        "smooth"

    });

  }

}


/* =========================================================
   REMOVE PAGINATION
========================================================= */

function removePagination() {

  const pagination =
    document.getElementById(
      "pagination"
    );


  if (pagination) {

    pagination.remove();

  }

}


/* =========================================================
   CATEGORY
========================================================= */

categoryButtons.forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        categoryButtons.forEach(
          item =>
            item.classList.remove(
              "active"
            )
        );


        button.classList.add(
          "active"
        );


        selectedCategory =
          button.dataset.category ||
          "All";


        currentPage =
          1;


        render();

      }
    );

  }
);


/* =========================================================
   SEARCH
========================================================= */

if (search) {

  search.addEventListener(
    "input",
    () => {

      currentPage =
        1;

      render();

    }
  );

}


/* =========================================================
   SORT
========================================================= */

if (sortSelect) {

  sortSelect.addEventListener(
    "change",
    () => {

      currentSort =
        sortSelect.value;

      currentPage =
        1;

      render();

    }
  );

}


/* =========================================================
   CLEAR FILTERS
========================================================= */

function clearFilters() {

  selectedCategory =
    "All";


  currentPage =
    1;


  if (search) {

    search.value =
      "";

  }


  if (sortSelect) {

    sortSelect.value =
      "newest";

    currentSort =
      "newest";

  }


  categoryButtons.forEach(
    item => {

      item.classList.remove(
        "active"
      );

    }
  );


  const allButton =
    document.querySelector(
      '.cat-v2[data-category="All"]'
    );


  if (allButton) {

    allButton.classList.add(
      "active"
    );

  }


  render();

}


/* =========================================================
   MOBILE MENU
========================================================= */

if (
  mobileMenuBtn &&
  mobileNav
) {

  mobileMenuBtn.addEventListener(
    "click",
    () => {

      const isOpen =
        mobileNav.classList.toggle(
          "open"
        );


      mobileMenuBtn.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

    }
  );


  mobileNav
    .querySelectorAll("a")
    .forEach(
      link => {

        link.addEventListener(
          "click",
          () => {

            mobileNav.classList.remove(
              "open"
            );

            mobileMenuBtn.setAttribute(
              "aria-expanded",
              "false"
            );

          }
        );

      }
    );

}


/* =========================================================
   REVEAL ON SCROLL
========================================================= */

function initReveal() {

  const elements =
    document.querySelectorAll(
      ".reveal-v2"
    );


  if (
    !("IntersectionObserver" in window)
  ) {

    elements.forEach(
      element =>
        element.classList.add(
          "visible"
        )
    );

    return;

  }


  const observer =
    new IntersectionObserver(
      entries => {

        entries.forEach(
          entry => {

            if (
              entry.isIntersecting
            ) {

              entry.target.classList.add(
                "visible"
              );

              observer.unobserve(
                entry.target
              );

            }

          }
        );

      },
      {
        threshold:
          0.12
      }
    );


  elements.forEach(
    element =>
      observer.observe(
        element
      )
  );

}


/* =========================================================
   BACK TO TOP
========================================================= */

window.addEventListener(
  "scroll",
  () => {

    if (!backTop) return;


    if (
      window.scrollY > 500
    ) {

      backTop.classList.add(
        "show"
      );

    } else {

      backTop.classList.remove(
        "show"
      );

    }

  },
  {
    passive:true
  }
);


if (backTop) {

  backTop.addEventListener(
    "click",
    () => {

      window.scrollTo({

        top:0,

        behavior:
          "smooth"

      });

    }
  );

}


/* =========================================================
   YEAR
========================================================= */

if (currentYear) {

  currentYear.textContent =
    new Date()
      .getFullYear();

}


/* =========================================================
   START
========================================================= */

initReveal();

loadProducts();
