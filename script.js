const STORAGE_KEY="wyw_here_products";
function stored(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||[]}catch(e){return[]}}
function allProducts(){return [...stored(),...products]}
const grid=document.getElementById("productGrid"),search=document.getElementById("search");
let category="All";
function render(){
 const list=allProducts();
 const q=search.value.toLowerCase().trim();
 const filtered=list.map((p,i)=>({p,i})).filter(x=>(category==="All"||x.p.category===category)&&(x.p.name.toLowerCase().includes(q)||x.p.description.toLowerCase().includes(q)));
 grid.innerHTML=filtered.length?filtered.map(x=>{const p=x.p;return `<article class="product" onclick="location.href='product.html?id=${x.i}'" style="cursor:pointer"><div class="product-img">${p.image?`<img src="${p.image}" alt="${p.name}">`:`<div class="placeholder">✦</div>`}</div><div class="product-info"><span class="tag">${p.category}</span><h3>${p.name}</h3><p class="desc">${p.description}</p><div class="bottom"><span class="price">${p.price}</span><a class="buy" href="${p.affiliateLink}" target="_blank" rel="nofollow sponsored noopener" onclick="event.stopPropagation()">BUY NOW ↗</a></div></div></article>`}).join(""):'<p style="color:#777">No products found.</p>';
}
document.querySelectorAll(".cat").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".cat").forEach(x=>x.classList.remove("active"));b.classList.add("active");category=b.dataset.category;render()}));
search.addEventListener("input",render);render();