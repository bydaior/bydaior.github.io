// --- VARIABLES GLOBALES ---
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const WS_NUMBER = "+584142186884";
let tempPayPalDetails = null;

// --- 1. CARGA DE DATOS ---
async function loadStore() {
    try {
        const response = await fetch('https://bydaior.github.io/products.json');
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        products = await response.json();
        
        renderCategoryFilters();
        displayProducts(products);
        updateCart();
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

// --- 2. RENDERIZADO DE INTERFAZ ---
function displayProducts(items) {
    const list = document.getElementById('product-list');
    if (!list) return;
    
    list.innerHTML = items.map(p => `
        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 hover:border-emerald-500/30 transition-all group">
            <div class="aspect-square rounded-2xl overflow-hidden mb-4 relative cursor-pointer" onclick="showProductDetails(${p.id})">
                <img src="${p.image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                <div class="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span class="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">Ver detalles</span>
                </div>
            </div>
            <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">${p.category}</span>
            <h3 class="text-lg font-bold mb-4 cursor-pointer hover:text-emerald-400 transition-colors" onclick="showProductDetails(${p.id})">${p.name}</h3>
            <div class="flex items-center justify-between">
                <span class="text-xl font-black text-white">$${p.price}</span>
                <button onclick="addToCart(${p.id})" class="bg-white text-black h-10 w-10 rounded-full flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"/></svg>
                </button>
            </div>
        </div>
    `).join('');
}

function renderCategoryFilters() {
    const select = document.getElementById('category-select');
    if (!select) return;
    const categories = [...new Set(products.map(p => p.category))];
    select.innerHTML = '<option value="all">Todas las categorías</option>' + 
        categories.map(cat => `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`).join('');
}

// --- 3. GESTIÓN DEL MODAL DE DETALLES ---
function showProductDetails(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('modal-img').src = product.image;
    document.getElementById('modal-name').innerText = product.name;
    document.getElementById('modal-price').innerText = `$${product.price}`;
    document.getElementById('modal-description').innerText = product.description || "Sin descripción disponible.";

    const modalAddBtn = document.getElementById('modal-add-btn');
    if (modalAddBtn) {
        modalAddBtn.onclick = () => {
            addToCart(product.id);
            closeProductModal();
        };
    }

    const modal = document.getElementById('product-modal');
    modal.classList.add('active');
    modal.style.display = 'flex'; 
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// --- 4. LÓGICA DEL CARRITO ---
function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        cart.push({...product});
        updateCart();
        showNotification();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (cartCount) cartCount.textContent = cart.length;
    
    let total = 0;
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = `<p class="text-center text-zinc-500 py-10">El carrito está vacío</p>`;
        } else {
            cartItems.innerHTML = cart.map((item, index) => {
                total += item.price;
                return `
                    <div class="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                        <img src="${item.image}" class="w-12 h-12 rounded-lg object-cover">
                        <div class="flex-grow text-sm">
                            <h4 class="font-bold text-white">${item.name}</h4>
                            <p class="text-emerald-500 font-bold">$${item.price.toFixed(2)}</p>
                        </div>
                        <button onclick="removeFromCart(${index})" class="text-zinc-600 hover:text-red-400 p-2">✕</button>
                    </div>`;
            }).join('');
        }
    }
    if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
    initPayPal();
}

// --- 5. FILTROS Y BÚSQUEDA ---
function filter() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const cat = document.getElementById('category-select').value;
    const priceValue = document.getElementById('price-select').value;
    const priceLimit = priceValue === "Infinity" ? Infinity : parseFloat(priceValue);

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(query);
        const matchesCategory = (cat === 'all' || p.category === cat);
        const matchesPrice = p.price <= priceLimit;
        return matchesSearch && matchesCategory && matchesPrice;
    });
    displayProducts(filtered);
}

// --- 6. UTILIDADES Y PAGOS ---
function showNotification() {
    const note = document.getElementById('notification');
    if (note) {
        note.classList.add('notification-active');
        setTimeout(() => note.classList.remove('notification-active'), 2500);
    }
}

function initPayPal() {
    const container = document.getElementById('paypal-button-container');
    if (!container || cart.length === 0) return;
    
    container.innerHTML = '';
    const total = cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);

    paypal.Buttons({
        createOrder: (data, actions) => {
            return actions.order.create({
                purchase_units: [{ amount: { value: total } }]
            });
        },
        onApprove: async (data, actions) => {
            const details = await actions.order.capture();
            showInvoice(details);
            cart = [];
            updateCart();
        }
    }).render('#paypal-button-container');
}

function showInvoice(details) {
    tempPayPalDetails = details;
    const modal = document.getElementById('invoice-modal');
    const itemsList = document.getElementById('invoice-items');
    const totalEl = document.getElementById('invoice-total');
    
    itemsList.innerHTML = cart.map(item => `
        <div class="flex justify-between text-sm py-1 border-b border-zinc-100">
            <span>${item.name}</span>
            <span>$${item.price.toFixed(2)}</span>
        </div>
    `).join('');
    
    totalEl.innerText = `$${cart.reduce((s, i) => s + i.price, 0).toFixed(2)}`;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

// --- 7. INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    loadStore();

    // Eventos de apertura/cierre de carrito
    const cartBtn = document.getElementById('cart-button');
    const closeCart = document.getElementById('close-cart');
    const cartModal = document.getElementById('cart-modal');

    if (cartBtn) cartBtn.onclick = () => cartModal.classList.remove('hidden');
    if (closeCart) closeCart.onclick = () => cartModal.classList.add('hidden');
});