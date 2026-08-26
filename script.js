const SUPABASE_URL = "https://ncavpnittrdgylogbjfp.supabase.co";
const SUPABASE_KEY = "sb_publishable_7E-WPJlMCarIj-FA3quJAw_Z6XFLWqP";

const grid = document.getElementById("productGrid");
const search = document.getElementById("search");

let category = "All";
let products = [];


/* =========================
   TRACK AFFILIATE CLICK
========================= */

async function trackAffiliateClick(product) {

  console.log("Tracking affiliate click:", product);

  try {

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/affiliate_clicks`,
      {
        method: "POST",

        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation"
        },

        body: JSON.stringify({
          product_id: product.id,
          product_name: product.name
        })
      }
    );

    const result = await response.text();

    console.log("Tracking response:", response.status, result);

    if (!response.ok) {
      console.error("TRACKING FAILED:", result);
    } else {
      console.log("AFFILIATE CLICK SAVED SUCCESSFULLY");
    }

  } catch (error) {

    console.error("Affiliate tracking error:", error);

  }

}


/* =========================
   LOAD PRODUCTS
========================= */

async function loadProducts() {

  try {

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=id,name,category,price,image_url,description,affiliate_link&order=id.asc`,
      {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();

    products = data.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: `₹${Number(p.price).toLocaleString("en-IN")}`,
      description: p.description || "",
      image: p.image_url || "",
      affiliateLink: p.affiliate_link || "#"
    }));

    render();

  } catch (error) {

    console.error("Supabase Error:", error);

    grid.innerHTML = `
      <p style="color:red;">
        Products load nahi ho rahe. Console check karo.
      </p>
    `;

  }

}


/* =========================
   RENDER PRODUCTS
========================= */

function render() {

  const q = search.value.toLowerCase().trim();

  const filtered = products.filter(p =>
    (category === "All" || p.category === category) &&
    (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    )
  );


  grid.innerHTML = filtered.length

    ? filtered.map(p => `

      <article
        class="product"
        onclick="location.href='product.html?id=${p.id}'"
        style="cursor:pointer"
      >

        <div class="product-img">

          ${
            p.image

            ? `
              <img
                src="${p.image}"
                alt="${p.name}"
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
            ${p.category}
          </span>


          <h3>
            ${p.name}
          </h3>


          <p class="desc">
            ${p.description}
          </p>


          <div class="bottom">

            <span class="price">
              ${p.price}
            </span>


            <a
              class="buy"
              href="${p.affiliateLink}"
              target="_blank"
              rel="nofollow sponsored noopener"

              onclick="
                event.stopPropagation();
                trackAffiliateClick(${JSON.stringify(p)});
              "
            >
              BUY NOW ↗
            </a>

          </div>

        </div>

      </article>

    `).join("")

    : `
      <p style="color:#777">
        No products found.
      </p>
    `;

}


/* =========================
   CATEGORY FILTER
========================= */

document
  .querySelectorAll(".cat")
  .forEach(button => {

    button.addEventListener("click", () => {

      document
        .querySelectorAll(".cat")
        .forEach(x =>
          x.classList.remove("active")
        );

      button.classList.add("active");

      category = button.dataset.category;

      render();

    });

  });


/* =========================
   SEARCH
========================= */

search.addEventListener(
  "input",
  render
);


/* =========================
   START
========================= */

loadProducts();
