/* Urban Style interactions */

const money = value => new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
}).format(value);

let cart = JSON.parse(localStorage.getItem("urbanStyleCart") || "[]");

function saveCart(){
    localStorage.setItem("urbanStyleCart", JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI(){
    const countEls = document.querySelectorAll("#cartCount");
    const itemsEl = document.querySelector("#cartItems");
    const totalEl = document.querySelector("#cartTotal");

    const count = cart.reduce((sum,item) => sum + item.qty, 0);
    countEls.forEach(el => el.textContent = count);

    if(itemsEl){
        if(!cart.length){
            itemsEl.innerHTML = '<div class="empty-cart">Your bag is waiting for something good.</div>';
        }else{
            itemsEl.innerHTML = cart.map((item,index) => `
                <div class="cart-row">
                    <div>
                        <h4>${item.name}</h4>
                        <p>${money(item.price)} × ${item.qty}</p>
                    </div>
                    <button class="cart-remove" data-remove="${index}">Remove</button>
                </div>
            `).join("");
        }
    }

    if(totalEl){
        totalEl.textContent = money(cart.reduce((sum,item) => sum + item.price * item.qty, 0));
    }

    renderCheckout();
}

function addToCart(name, price){
    const existing = cart.find(item => item.name === name);
    if(existing) existing.qty += 1;
    else cart.push({name, price:Number(price), qty:1});
    saveCart();
    openCart();
}

function renderCheckout(){
    const target = document.querySelector("#checkoutItems");
    const subtotalEl = document.querySelector("#checkoutSubtotal");
    const deliveryEl = document.querySelector("#checkoutDelivery");
    const totalEl = document.querySelector("#checkoutTotal");
    if(!target) return;

    const subtotal = cart.reduce((sum,item) => sum + item.price * item.qty, 0);
    const delivery = document.querySelector('input[name="delivery"]:checked')?.value === "express" ? 7000 : 3500;

    target.innerHTML = cart.length
        ? cart.map(item => `<div class="summary-item"><span>${item.name} × ${item.qty}</span><strong>${money(item.price * item.qty)}</strong></div>`).join("")
        : '<p class="empty-cart">Your bag is empty. <a href="products.html">Shop the collection →</a></p>';

    if(subtotalEl) subtotalEl.textContent = money(subtotal);
    if(deliveryEl) deliveryEl.textContent = money(cart.length ? delivery : 0);
    if(totalEl) totalEl.textContent = money(cart.length ? subtotal + delivery : 0);
}

document.addEventListener("click", event => {
    const add = event.target.closest(".add-button");
    if(add){
        event.preventDefault();
        addToCart(add.dataset.name, add.dataset.price);
    }

    const remove = event.target.closest("[data-remove]");
    if(remove){
        cart.splice(Number(remove.dataset.remove),1);
        saveCart();
    }
});

const cartDrawer = document.querySelector("#cartDrawer");
const overlay = document.querySelector("#drawerOverlay");

function openCart(){
    if(!cartDrawer) return;
    cartDrawer.classList.add("open");
    overlay?.classList.add("open");
    document.body.classList.add("drawer-open");
}
function closeCart(){
    cartDrawer?.classList.remove("open");
    overlay?.classList.remove("open");
    document.body.classList.remove("drawer-open");
}

document.querySelector("#cartButton")?.addEventListener("click", openCart);
document.querySelector("#closeCart")?.addEventListener("click", closeCart);
overlay?.addEventListener("click", closeCart);

const siteHeader = document.querySelector("#siteHeader");
window.addEventListener("scroll", () => {
    if(siteHeader) siteHeader.classList.toggle("scrolled", window.scrollY > 30);
});

const menuButton = document.querySelector("#menuButton");
const mobileMenu = document.querySelector("#mobileMenu");
menuButton?.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", open);
});
mobileMenu?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    menuButton?.setAttribute("aria-expanded","false");
}));

function setupFilters(container, grid){
    if(!container || !grid) return;
    const buttons = container.querySelectorAll(".filter");
    const cards = grid.querySelectorAll(".product-card");
    let current = "all";

    buttons.forEach(button => button.addEventListener("click", () => {
        current = button.dataset.filter;
        buttons.forEach(b => b.classList.toggle("active", b === button));
        cards.forEach(card => {
            const show = current === "all" || card.dataset.category === current;
            card.style.display = show ? "" : "none";
        });
    }));
}
setupFilters(document, document.querySelector("#productGrid"));
setupFilters(document.querySelector("#catalogFilters"), document.querySelector("#catalogGrid"));

const search = document.querySelector("#productSearch");
const catalogCards = document.querySelectorAll("#catalogGrid .product-card");
const noResults = document.querySelector("#noResults");
search?.addEventListener("input", () => {
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    catalogCards.forEach(card => {
        const matches = card.dataset.name.includes(query);
        card.style.display = matches ? "" : "none";
        if(matches) visible++;
    });
    if(noResults) noResults.style.display = visible ? "none" : "block";
});

document.querySelectorAll('input[name="delivery"]').forEach(input => {
    input.addEventListener("change", renderCheckout);
});

document.querySelector("#checkoutForm")?.addEventListener("submit", event => {
    event.preventDefault();
    const message = document.querySelector("#orderMessage");
    if(!cart.length){
        message.textContent = "Your bag is empty. Add a product before placing an order.";
        return;
    }
    message.textContent = "Order received! Connect this form to your payment/order backend to complete checkout.";
});

document.querySelector("#newsletterForm")?.addEventListener("submit", event => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector("button");
    button.textContent = "You're on the list ✓";
    form.querySelector("input").value = "";
});

updateCartUI();


// Highlight the active page in the multi-page navigation.
(() => {
    const page = location.pathname.split('/').pop() || 'index.html';
    const map = {
        'index.html':'home', '':'home', 'products.html':'collection',
        'about.html':'about', 'reviews.html':'reviews', 'contact.html':'contact'
    };
    const current = map[page];
    document.querySelectorAll('.desktop-nav a[data-page]').forEach(link => {
        link.classList.toggle('current', link.dataset.page === current);
    });
})();

document.querySelector('#contactForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const message = document.querySelector('#contactMessage');
    if(message) message.textContent = 'Thanks! Your message has been prepared. Connect this form to your email/backend to receive submissions.';
    event.currentTarget.reset();
});
