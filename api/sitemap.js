const SUPABASE_URL =
  "https://ncavpnittrdgylogbjfp.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_7E-WPJlMCarIj-FA3quJAw_Z6XFLWqP";

const SITE_URL =
  "https://wyw-here.vercel.app";


module.exports = async function handler(req, res) {

  try {

    const response = await fetch(

      `${SUPABASE_URL}/rest/v1/products?select=id`,

      {
        method: "GET",

        headers: {
          apikey: SUPABASE_KEY,
          Authorization:
            `Bearer ${SUPABASE_KEY}`
        },

        cache: "no-store"
      }

    );


    if (!response.ok) {

      throw new Error(
        await response.text()
      );

    }


    const products =
      await response.json();


    const urls = [];


    // Homepage
    urls.push(`
      <url>
        <loc>${SITE_URL}/</loc>
      </url>
    `);


    // Product pages
    products.forEach(product => {

      if (!product.id) {
        return;
      }


      urls.push(`
        <url>
          <loc>${SITE_URL}/product.html?id=${encodeURIComponent(product.id)}</loc>
        </url>
      `);

    });


    const xml = `<?xml version="1.0" encoding="UTF-8"?>

      <urlset
        xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      >

        ${urls.join("")}

      </urlset>
    `;


    res.setHeader(
      "Content-Type",
      "application/xml; charset=utf-8"
    );


    res.setHeader(
      "Cache-Control",
      "s-maxage=3600, stale-while-revalidate"
    );


    return res.status(200).send(xml);


  } catch (error) {

    console.error(
      "Sitemap error:",
      error
    );


    return res
      .status(500)
      .send(
        "Sitemap generation failed"
      );

  }

};
