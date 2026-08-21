const SUPABASE_URL = "https://ncavpnittrdgylogbjfp.supabase.co";
const SUPABASE_KEY = "sb_publishable_7E-WPJlMCarIj-FA3quJAw_Z6XFLWqP";

const grid = document.getElementById("productGrid");
const search = document.getElementById("search");

let category = "All";
let products = [];

async function loadProducts() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=*`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    products = await response.json();

    render();

  } catch (error) {
    console.error("Supabase Error:", error);

    grid.innerHTML = `
      <p style="color:red">
        Products could not be loaded.
      </p>
    `;
  }
}

function render() {

  const q = search.value.toLowerCase().trim();

  const filtered = products.filter(p =>
    (category === "All" || p.category === category) &&
    (
      p.name.toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q)
    )
  );

  if (!filtered.length) {
    grid.innerHTML = `
      <p style="color:#777">
        No products found.
      </p>
    `;
    return;
  }

  grid.innerHTML = filtered.map(p => `

    <article
      class="product"
      onclick="location.href='product.html?id=${p.id}'"
      style="cursor:pointer"
    >

      <div class="product-img">

        ${
          p.image_url
            ? `<img src="${p.image_url}" alt="${p.name}">`
            : `<div class="placeholder">✦</div>`
        }

      </div>

      <div class="product-info">

        <span class="tag">${p.category}</span>

        <h3>${p.name}</h3>

        <p class="desc">${p.description || ""}</p>

        <div class="bottom">

          <span class="price">
            ₹${Number(p.price).toLocaleString("en-IN")}
          </span>

          <a
            class="buy"
            href="${p.affiliate_link}"
            target="_blank"
            rel="nofollow sponsored noopener"
            onclick="event.stopPropagation()"
          >
            BUY NOW ↗
          </a>

        </div>

      </div>

    </article>

  `).join("");
}

document.querySelectorAll(".cat").forEach(button => {

  button.addEventListener("click", () => {

    document
      .querySelectorAll(".cat")
      .forEach(x => x.classList.remove("active"));

    button.classList.add("active");

    category = button.dataset.category;

    render();
  });

});

search.addEventListener("input", render);

loadProducts();
