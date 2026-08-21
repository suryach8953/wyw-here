const SUPABASE_URL = "https://ncavpnittrdgylogbjfp.supabase.co";
const SUPABASE_KEY = "sb_publishable_7E-WPJlMCarIj-FA3quJAw_Z6XFLWqP";

const grid = document.getElementById("productGrid");
const search = document.getElementById("search");

let category = "All";
let products = [];

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, function (match) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[match];
  });
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

async function loadProducts() {
  grid.innerHTML = `
    <p style="color:#777">
      Loading products...
    </p>
  `;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=*&order=id.desc`,
      {
        method: "GET",
        headers: {
          apikey: SUPABASE_KEY
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    products = await response.json();

    render();

  } catch (error) {
    console.error("Supabase Error:", error);

    grid.innerHTML = `
      <p style="color:#b00020">
        Products could not be loaded.
      </p>
    `;
  }
}

function render() {

  const q = search.value.toLowerCase().trim();

  const filtered = products.filter(p => {

    const name =
      String(p.name || "").toLowerCase();

    const description =
      String(p.description || "").toLowerCase();

    const productCategory =
      String(p.category || "");

    return (
      (category === "All" ||
        productCategory === category) &&
      (
        name.includes(q) ||
        description.includes(q)
      )
    );

  });

  if (!filtered.length) {

    grid.innerHTML = `
      <p style="color:#777">
        No products found.
      </p>
    `;

    return;
  }

  grid.innerHTML = filtered.map(p => {

    const id =
      Number(p.id);

    const name =
      escapeHtml(p.name);

    const categoryName =
      escapeHtml(p.category);

    const description =
      escapeHtml(p.description || "");

    const price =
      Number(p.price || 0)
        .toLocaleString("en-IN");

    const image =
      escapeAttribute(p.image_url || "");

    const affiliateLink =
      escapeAttribute(p.affiliate_link || "");

    return `

      <article
        class="product"
        onclick="location.href='product.html?id=${id}'"
        style="cursor:pointer"
      >

        <div class="product-img">

          ${
            image
              ? `
                <img
                  src="${image}"
                  alt="${name}"
                  loading="lazy"
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
            ${categoryName}
          </span>

          <h3>
            ${name}
          </h3>

          <p class="desc">
            ${description}
          </p>


          <div class="bottom">

            <span class="price">
              ₹${price}
            </span>


            <a
              class="buy"
              href="${affiliateLink}"
              target="_blank"
              rel="nofollow sponsored noopener"
              onclick="event.stopPropagation()"
            >
              BUY NOW ↗
            </a>

          </div>

        </div>

      </article>

    `;

  }).join("");
}


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

      category =
        button.dataset.category;

      render();

    });

  });


search.addEventListener(
  "input",
  render
);


loadProducts();
