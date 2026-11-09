const TELEGRAM_URL = "https://t.me/XYZTactical";
const categories = {
  clothing: { label: "Vêtements & tenues", products: [
    "Veste outdoor polyvalente","Pantalon cargo renforcé","Chemise tactique respirante","T-shirt technique","Gilet utilitaire textile","Casquette outdoor"
  ]},
  protection: { label: "Protection & accessoires", products: [
    "Lunettes de protection","Gants renforcés","Genouillères de protection","Sac à dos modulaire","Lampe torche rechargeable","Pochette utilitaire","Ceinture outdoor","Trousse de premiers secours","Bouteille isotherme","Protection auditive de chantier"
  ]},
  outdoor: { label: "Randonnée & survie", products: [
    "Kit de randonnée","Gourde de trekking","Abri compact de bivouac"
  ]}
};
const products = [];
let id = 1;
Object.entries(categories).forEach(([key, group]) => group.products.forEach(name => {
  products.push({id:id++, name, category:key, categoryLabel:group.label, price:0, description:"Ajoutez ici une description détaillée de cet article.", images:[1,2,3]});
}));
let cart = JSON.parse(localStorage.getItem("xyz_demo_cart") || "{}");
let activeCategory = "all";
const money = n => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
const grid = document.getElementById("product-grid");

function renderProducts(){
  const term = document.getElementById("search-input").value.trim().toLowerCase();
  const shown = products.filter(p => (activeCategory==="all" || p.category===activeCategory) && p.name.toLowerCase().includes(term));
  document.getElementById("product-count").textContent = `${shown.length} article${shown.length>1?"s":""}`;
  grid.innerHTML = shown.map(p => `
    <article class="product-card">
      <div class="product-image">
        <div class="image-placeholder">XYZ / ${String(p.id).padStart(2,"0")}</div>
      </div>
      <div class="product-info">
        <span class="product-category">${p.categoryLabel.toUpperCase()}</span>
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div class="product-bottom"><span class="price">Prix à renseigner</span><button class="add-button" data-add="${p.id}">AJOUTER +</button></div>
      </div>
    </article>`).join("");
  grid.querySelectorAll("[data-add]").forEach(btn => btn.addEventListener("click",()=>addToCart(Number(btn.dataset.add))));
}
function saveCart(){localStorage.setItem("xyz_demo_cart",JSON.stringify(cart));renderCart();}
function addToCart(id){cart[id]=(cart[id]||0)+1;saveCart();openCart();}
function changeQty(id,delta){cart[id]=(cart[id]||0)+delta;if(cart[id]<=0)delete cart[id];saveCart();}
function cartEntries(){return Object.entries(cart).map(([id,qty])=>({product:products.find(p=>p.id===Number(id)),qty})).filter(x=>x.product);}
function renderCart(){
  const entries=cartEntries();const count=entries.reduce((s,x)=>s+x.qty,0);
  document.getElementById("cart-count").textContent=count;
  document.getElementById("cart-items").innerHTML=entries.length?entries.map(({product:p,qty})=>`
    <div class="cart-row"><div class="cart-thumb">XYZ</div><div><strong>${p.name}</strong><small>${p.categoryLabel}</small></div>
    <div class="quantity"><button data-change="${p.id}" data-delta="-1">−</button><span>${qty}</span><button data-change="${p.id}" data-delta="1">+</button></div></div>`).join(""):'<div class="empty-cart"><strong>Votre panier est vide.</strong>Ajoutez des articles pour voir votre sélection ici.</div>';
  document.getElementById("cart-items").querySelectorAll("[data-change]").forEach(b=>b.addEventListener("click",()=>changeQty(Number(b.dataset.change),Number(b.dataset.delta))));
  document.getElementById("cart-total").textContent="À déterminer";
  const summaryCount=document.getElementById("cart-count-summary");if(summaryCount)summaryCount.textContent=count;
}
function openCart(){document.getElementById("cart-drawer").classList.add("open");document.getElementById("overlay").classList.add("show");}
function closeCart(){document.getElementById("cart-drawer").classList.remove("open");document.getElementById("overlay").classList.remove("show");}
document.getElementById("category-tabs").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;activeCategory=b.dataset.category;document.querySelectorAll(".category-tab").forEach(x=>x.classList.toggle("active",x===b));renderProducts();});
document.getElementById("search-input").addEventListener("input",renderProducts);
document.getElementById("open-cart").addEventListener("click",openCart);
document.getElementById("close-cart").addEventListener("click",closeCart);
document.getElementById("overlay").addEventListener("click",closeCart);
document.getElementById("checkout-button").addEventListener("click",()=>{
  const entries=cartEntries();if(!entries.length){alert("Votre panier est vide.");return;}
  document.getElementById("checkout-summary").textContent=entries.map(x=>`• ${x.product.name} — quantité : ${x.qty}`).join("\n")+`\n\nNombre total d'articles : ${entries.reduce((s,x)=>s+x.qty,0)}`;
  closeCart();document.getElementById("checkout-modal").classList.add("show");
});
document.getElementById("close-modal").addEventListener("click",()=>document.getElementById("checkout-modal").classList.remove("show"));
document.getElementById("telegram-button").addEventListener("click",async()=>{
  const entries=cartEntries();const summary="Bonjour XYZ TACTICAL, voici ma sélection (demande de démonstration) :\n"+entries.map(x=>`- ${x.product.name} x ${x.qty}`).join("\n");
  try{await navigator.clipboard.writeText(summary);document.getElementById("copy-feedback").textContent="Récapitulatif copié. Collez-le dans la conversation Telegram qui va s'ouvrir.";}
  catch(e){document.getElementById("copy-feedback").textContent="Copiez le récapitulatif affiché ci-dessus avant de continuer.";}
  window.open(TELEGRAM_URL,"_blank","noopener");
});
document.getElementById("email-form").addEventListener("submit",e=>{e.preventDefault();const email=document.getElementById("email-input").value;localStorage.setItem("xyz_demo_email",email);document.getElementById("email-feedback").textContent="Adresse enregistrée localement pour cette démonstration.";});
document.getElementById("year").textContent=new Date().getFullYear();
renderProducts();renderCart();
