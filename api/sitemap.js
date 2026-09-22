export default async function handler(request, response) {

  const SUPABASE_URL =
    "https://ncavpnittrdgylogbjfp.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_7E-WPJlMCarIj-FA3quJAw_Z6XFLWqP";

  const SITE_URL =
    "https://wyw-here.vercel.app";


  try {

    const result = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=id`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );


    if (!result.ok) {
      throw new Error(
        await result.text()
      );
    }


    const products =
      await result.json();


    const productUrls =
      products.map(
        product => `
          <url>
            <loc>${SITE_URL}/product.html?id=${encodeURIComponent(product.id)}</loc>
          </url>
        `
      ).join("");


    const xml = `<?xml version="1.0" encoding="UTF-8"?>

<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>

  <url>
    <loc>${SITE_URL}/</loc>
  </url>

  ${productUrls}

</urlset>`;


    response.setHeader(
      "Content-Type",
      "application/xml; charset=utf-8"
    );


    response.status(200).send(xml);


  } catch (error) {

    console.error(error);

    response
      .status(500)
      .send("Sitemap generation failed");

  }

}
