const SUPABASE_URL =
  "https://ncavpnittrdgylogbjfp.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_7E-WPJlMCarIj-FA3quJAw_Z6XFLWqP";


const grid =
  document.getElementById("productGrid");

const search =
  document.getElementById("search");


let category = "All";

let products = [];

let currentPage = 1;

const productsPerPage = 12;


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

  const number =
    Number(value || 0);

  return "₹" + number.toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2
    }
  );

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

function showEmpty(
  message = "No products found."
) {

  grid.innerHTML = `

    <div class="products-empty">

      <div class="empty-icon">
        ✦
      </div>

      <h3>
        Nothing here yet
      </h3>

      <p>
        ${escapeHtml(message)}
      </p>

    </div>

  `;


  removePagination();

}


/* =========================================
   ERROR STATE
========================================= */

function showError() {

  grid.innerHTML = `

    <div class="products-empty">

      <div class="empty-icon">
        !
      </div>

      <h3>
        Something went wrong
      </h3>

      <p>
        We couldn't load the products right now.
      </p>

      <button
        class="retry-btn"
        onclick="loadProducts()"
      >
        TRY AGAIN
      </button>

    </div>

  `;


  removePagination();

}


/* =========================================
   AFFILIATE CLICK TRACKING
========================================= */

async function trackAffiliateClick(product) {

  try {

    if (!product) {

      console.error(
        "Affiliate tracking: product missing"
      );

      return false;

    }


    const response =
      await fetch(
        `${SUPABASE_URL}/rest/v1/affiliate_clicks`,
        {

          method: "POST",

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

          keepalive: true

        }
      );


    if (!response.ok) {

      const errorText =
        await response.text();

      console.error(
        "Affiliate tracking failed:",
        errorText
      );

      return false;

    }


    console.log(
      "Affiliate click tracked:",
      product.name
    );


    return true;


  }

  catch (error) {

    console.error(
      "Affiliate click tracking error:",
      error
    );

    return false;

  }

}


/* =========================================
   BUY CLICK
========================================= */

function handleBuyClick(
  event,
  productId
) {

  /*
   * Card ke onclick ko trigger hone se roko.
   */

  event.stopPropagation();


  /*
   * Product ID se actual product find karo.
   */

  const product =
    products.find(
      item =>
        String(item.id) ===
        String(productId)
    );


  if (!product) {

    console.error(
      "Product not found for affiliate tracking:",
      productId
    );

    return;

  }


  /*
   * Affiliate tracking background mein.
   * User ko Amazon par jaane se block nahi karega.
   */

  trackAffiliateClick(product);

}


/* =========================================
   LOAD PRODUCTS
========================================= */

async function loadProducts() {

  showLoading();


  try {

    const response =
      await fetch(

        `${SUPABASE_URL}/rest/v1/products?select=id,name,category,price,image_url,image_2,image_3,image_4,image_5,description,affiliate_link&order=id.asc`,

        {

          method: "GET",

          headers: {

            "apikey":
              SUPABASE_KEY,

            "Authorization":
              `Bearer ${SUPABASE_KEY}`

          },

          cache: "no-store"

        }

      );


    if (!response.ok) {

      const errorText =
        await response.text();

      throw new Error(
        errorText
      );

    }


    const data =
      await response.json();


    products =
      (data || []).map(
        product => ({

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

        })
      );


    /*
     * Starting page.
     */

    currentPage = 1;


    render();


  }

  catch (error) {

    console.error(
      "Supabase product error:",
      error
    );

    showError();

  }

}


/* =========================================
   FILTER PRODUCTS
========================================= */

function getFilteredProducts() {

  const query =
    search
      ? search.value
          .toLowerCase()
          .trim()
      : "";


  return products.filter(
    product => {

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

        )
        .toLowerCase();


      const matchesSearch =
        !query ||
        searchableText.includes(query);


      return (
        matchesCategory &&
        matchesSearch
      );

    }
  );

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

  const totalPages =
    Math.ceil(filtered.length / productsPerPage);

  /* -----------------------------------------
     PAGE SAFETY
  ----------------------------------------- */

  if (totalPages === 0) {
    currentPage = 1;
  } else if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  /* -----------------------------------------
     EMPTY STATE
  ----------------------------------------- */

  if (!filtered.length) {

    showEmpty(
      query
        ? `No products match "${query}".`
        : "Products will appear here soon."
    );

    return;

  }

  /* -----------------------------------------
     PAGINATION
  ----------------------------------------- */

  const start =
    (currentPage - 1) * productsPerPage;

  const paginatedProducts =
    filtered.slice(
      start,
      start + productsPerPage
    );

  /* -----------------------------------------
     RENDER CURRENT PAGE ONLY
  ----------------------------------------- */

  grid.innerHTML =
    paginatedProducts
      .map(renderProduct)
      .join("");

  /* -----------------------------------------
     PAGINATION UI
  ----------------------------------------- */

  renderPagination(
    filtered.length,
    totalPages
  );

}


  /*
   * Total pages.
   */

  const totalPages =
    Math.ceil(
      filtered.length /
      productsPerPage
    );


  /*
   * Safety.
   */

  if (
    currentPage < 1
  ) {

    currentPage = 1;

  }


  if (
    currentPage > totalPages
  ) {

    currentPage =
      totalPages;

  }


  /*
   * Starting index.
   */

  const start =
    (
      currentPage - 1
    ) *
    productsPerPage;


  /*
   * ONLY CURRENT PAGE PRODUCTS.
   */

  const paginatedProducts =
    filtered.slice(
      start,
      start + productsPerPage
    );


  /*
   * Render current page.
   */

  grid.innerHTML =
    paginatedProducts
      .map(renderProduct)
      .join("");


  /*
   * Pagination.
   */

  renderPagination(
    filtered.length,
    totalPages
  );

}


/* =========================================
   PRODUCT CARD
========================================= */

function renderProduct(product) {

  const image =
    product.image;


  const safeName =
    escapeHtml(
      product.name
    );


  const safeCategory =
    escapeHtml(
      product.category
    );


  const safeDescription =
    escapeHtml(
      product.description
    );


  const safeImage =
    escapeHtml(
      image
    );


  const safeAffiliateLink =
    escapeHtml(
      product.affiliateLink
    );


  return `

    <article

      class="product"

      onclick="
        openProduct(${Number(product.id)})
      "

      tabindex="0"

      role="article"

      onkeydown="
        if(event.key === 'Enter')
        openProduct(${Number(product.id)})
      "

    >

      <!-- PRODUCT IMAGE -->

      <div class="product-img">

        ${
          image

            ? `

              <img

                src="${safeImage}"

                alt="${safeName}"

                loading="lazy"

                onerror="
                  this.style.display='none';
                  this.parentElement
                    .querySelector('.image-fallback')
                    .style.display='flex';
                "

              >

              <div
                class="placeholder image-fallback"
                style="display:none"
              >
                ✦
              </div>

            `

            : `

              <div class="placeholder">
                ✦
              </div>

            `
        }

      </div>


      <!-- PRODUCT INFO -->

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

            ${formatPrice(
              product.price
            )}

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

                  onclick="
                    handleBuyClick(
                      event,
                      ${Number(product.id)}
                    )
                  "

                >

                  BUY NOW ↗

                </a>

              `

              : `

                <span
                  class="buy disabled"
                >

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
   PAGINATION
========================================= */

function renderPagination(
  totalProducts,
  totalPages
) {

  let pagination =
    document.getElementById(
      "pagination"
    );


  /*
   * Create pagination container
   * if it doesn't already exist.
   */

  if (!pagination) {

    pagination =
      document.createElement(
        "div"
      );

    pagination.id =
      "pagination";

    pagination.className =
      "pagination";


    /*
     * Grid ke baad insert.
     */

    grid.parentNode.insertBefore(
      pagination,
      grid.nextSibling
    );

  }


  /*
   * Current products range.
   */

  const start =
    (
      (currentPage - 1) *
      productsPerPage
    ) + 1;


  const end =
    Math.min(
      currentPage *
      productsPerPage,
      totalProducts
    );


  /*
   * Page numbers.
   */

  let pages = [];


  /*
   * Small number of pages.
   */

  if (totalPages <= 7) {

    for (
      let i = 1;
      i <= totalPages;
      i++
    ) {

      pages.push(i);

    }

  }

  else {

    pages.push(1);


    if (currentPage > 4) {

      pages.push("...");

    }


    const pageStart =
      Math.max(
        2,
        currentPage - 1
      );


    const pageEnd =
      Math.min(
        totalPages - 1,
        currentPage + 1
      );


    for (
      let i = pageStart;
      i <= pageEnd;
      i++
    ) {

      pages.push(i);

    }


    if (
      currentPage <
      totalPages - 3
    ) {

      pages.push("...");

    }


    pages.push(
      totalPages
    );

  }


  pagination.innerHTML = `

    <div class="pagination-info">

      Showing
      <strong>${start}</strong>
      –
      <strong>${end}</strong>
      of
      <strong>${totalProducts}</strong>
      products

    </div>


    <div class="pagination-controls">


      <button

        class="page-btn prev-btn"

        ${
          currentPage === 1
            ? "disabled"
            : ""
        }

        onclick="
          changePage(
            ${currentPage - 1}
          )
        "

        aria-label="Previous page"

      >

        ←

      </button>


      <div class="page-numbers">

        ${
          pages
            .map(page => {

              if (
                page === "..."
              ) {

                return `

                  <span
                    class="page-dots"
                  >
                    …
                  </span>

                `;

              }


              return `

                <button

                  class="
                    page-btn
                    ${
                      page === currentPage
                        ? "active"
                        : ""
                    }
                  "

                  onclick="
                    changePage(${page})
                  "

                >

                  ${page}

                </button>

              `;

            })
            .join("")
        }

      </div>


      <button

        class="page-btn next-btn"

        ${
          currentPage === totalPages
            ? "disabled"
            : ""
        }

        onclick="
          changePage(
            ${currentPage + 1}
          )
        "

        aria-label="Next page"

      >

        →

      </button>


    </div>

  `;

}


/* =========================================
   CHANGE PAGE
========================================= */

function changePage(page) {

  const filtered =
    getFilteredProducts();


  const totalPages =
    Math.ceil(
      filtered.length /
      productsPerPage
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


  /*
   * Product section ke top par
   * smoothly scroll.
   */

  const productsSection =
    document.getElementById(
      "products"
    );


  if (productsSection) {

    productsSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }

}


/* =========================================
   REMOVE PAGINATION
========================================= */

function removePagination() {

  const pagination =
    document.getElementById(
      "pagination"
    );


  if (pagination) {

    pagination.remove();

  }

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


        /*
         * Active button.
         */

        document
          .querySelectorAll(".cat")
          .forEach(item => {

            item.classList.remove(
              "active"
            );

          });


        this.classList.add(
          "active"
        );


        /*
         * Category change.
         */

        category =
          this.dataset.category;


        /*
         * Page 1.
         */

        currentPage = 1;


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
    function () {

      /*
       * Search change par
       * page 1 se start.
       */

      currentPage = 1;


      render();

    }
  );

}


/* =========================================
   START
========================================= */

loadProducts();
