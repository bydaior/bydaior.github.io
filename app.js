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
        updateCart(false); 
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

// --- 3. GESTIÓN DE MODALES Y NOTIFICACIONES ---
function showProductDetails(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('modal-img').src = product.image;
    document.getElementById('modal-name').innerText = product.name;
    document.getElementById('modal-price').innerText = `$${product.price.toFixed(2)}`;
    document.getElementById('modal-description').innerText = product.description || "Sin descripción disponible.";

    const modalAddBtn = document.getElementById('modal-add-btn');
    if (modalAddBtn) {
        modalAddBtn.onclick = null; 
        modalAddBtn.onclick = () => {
            addToCart(product.id);
            closeProductModal();
        };
    }

    const modal = document.getElementById('product-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
    }
}

function showNotification() {
    const notification = document.getElementById('notification');
    if (!notification) return;
    notification.classList.add('notification-active');
    setTimeout(() => {
        notification.classList.remove('notification-active');
    }, 3000);
}

// --- 4. LÓGICA DEL CARRITO ---
function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        cart.push({...product});
        updateCart(true);
        showNotification();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart(false);
}

function updateCart(shouldAnimate = false) {
    localStorage.setItem('cart', JSON.stringify(cart));
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
    
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

// --- 6. PAGOS Y FACTURACIÓN ---
function initPayPal() {
    const container = document.getElementById('paypal-button-container');
    if (!container) return;
    
    container.innerHTML = '';
    if (cart.length === 0) return;
    
    const total = cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);

    paypal.Buttons({
        createOrder: (data, actions) => {
            return actions.order.create({
                purchase_units: [{ amount: { value: total } }]
            });
        },
        onApprove: async (data, actions) => {
            const details = await actions.order.capture();
            tempPayPalDetails = details; 
            
            document.getElementById('email-modal').classList.remove('hidden');
            document.getElementById('email-modal').classList.add('flex');
            document.getElementById('cart-modal').classList.add('hidden');
        }
    }).render('#paypal-button-container');
}

function processEmailSubmission() {
    const emailInput = document.getElementById('customer-delivery-email');
    const email = emailInput.value.trim();
    
    if (!email || !email.includes('@')) {
        alert("Por favor, ingresa un correo electrónico válido.");
        return;
    }

    document.getElementById('email-modal').classList.add('hidden');
    document.getElementById('email-modal').classList.remove('flex');

    showInvoice(tempPayPalDetails, email);
    localStorage.removeItem('cart');
}

//

function showInvoice(details, deliveryEmail) {
    const modal = document.getElementById('invoice-modal');
    const paypalTransactionId = details.purchase_units[0].payments.captures[0].id || details.id;

    document.getElementById('invoice-id').innerText = paypalTransactionId;
    document.getElementById('invoice-date').innerText = new Date().toLocaleDateString();
    
    const fullName = `${details.payer.name.given_name} ${details.payer.name.surname}`;
    document.getElementById('invoice-client-name').innerText = fullName;
    document.getElementById('invoice-client-paypal').innerText = details.payer.email_address;
    document.getElementById('invoice-delivery-email').innerText = deliveryEmail;

    const itemsList = document.getElementById('invoice-items');
    const totalFromPayPal = details.purchase_units[0].amount.value;
    
    itemsList.innerHTML = cart.map(item => `
        <tr class="text-sm border-b border-zinc-100">
            <td class="py-3">${item.name}</td>
            <td class="py-3 text-right font-bold">$${item.price.toFixed(2)}</td>
        </tr>
    `).join('');
    
    document.getElementById('invoice-total').innerText = `$${totalFromPayPal}`;
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    cart = [];
    updateCart(false);
}

// --- 7. WHATSAPP Y DESCARGAS ---
function sendInvoiceToWhatsApp() {
    const orderId = document.getElementById('invoice-id').innerText;
    const name = document.getElementById('invoice-client-name').innerText;
    const paypalEmail = document.getElementById('invoice-client-paypal').innerText;
    const deliveryEmail = document.getElementById('invoice-delivery-email').innerText;
    const total = document.getElementById('invoice-total').innerText;

    const itemsRows = Array.from(document.querySelectorAll('#invoice-items tr'));
    const itemsDetail = itemsRows.map(row => {
        const cols = row.querySelectorAll('td');
        return cols.length >= 2 ? `- ${cols[0].innerText}: *${cols[1].innerText}*` : '';
    }).filter(t => t).join('\n');

    const messageText = `*PAGO CONFIRMADO - DAIOR*\n\n*ID de Transacción PayPal:* ${orderId}\n\n*Cliente:* ${name}\n*Cuenta PayPal:* ${paypalEmail}\n\n*Detalle de Compra:*\n${itemsDetail}\n\n*Enviar recursos a:* ${deliveryEmail}\n\n*Total pagado:* *${total}*\n\n_Adjunto comprobante visual generado por la tienda._`;

    window.open(`https://wa.me/${WS_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(messageText)}`, '_blank');
}

function checkoutWhatsApp() {
    if (cart.length === 0) return alert("El carrito está vacío.");
    const itemsDetail = cart.map(item => `- ${item.name}: *$${item.price.toFixed(2)}*`).join('\n');
    const total = cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);
    const messageText = `*SOLICITUD DE PEDIDO - DAIOR*\n\n*Productos:*\n${itemsDetail}\n\n*Total Estimado:* *$${total}*\n\n¿Cómo puedo proceder con el pago?`;
    window.open(`https://wa.me/${WS_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(messageText)}`, '_blank');
}

async function downloadPNG() {
    const invoice = document.getElementById('invoice-content');
    const btn = event.currentTarget;
    btn.disabled = true;
    btn.innerText = "Generando imagen...";

    try {
        const canvas = await html2canvas(invoice, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
        const link = document.createElement('a');
        link.download = `Recibo-Daior-${document.getElementById('invoice-id').innerText || "#RECIBO"}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    } catch (error) {
        console.error(error);
        alert("Error al generar imagen.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> Descargar Recibo (PNG)`;
    }
}

// --- 8. EVENTOS DE CIERRE Y TECLADO ---
document.getElementById('product-modal').addEventListener('click', function(e) {
    if (e.target === this) closeProductModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        closeProductModal();
        document.getElementById('cart-modal').classList.add('hidden');
    }
});
// --- 7. CARGA DE POSTS (MÉTODO LOCAL JSON DESDE GITHUB) ---
async function loadJournalPosts() {
    const container = document.getElementById('journal-feed'); 
    if (!container) return;

    try {
        const response = await fetch(`https://bydaior.github.io/posts.json?t=${Date.now()}`);
        if (!response.ok) throw new Error("No se pudo obtener el archivo de posts");
        
        let posts = await response.json();

        // --- LÓGICA DE ORDENAMIENTO POR FECHA ---
        // Ordenamos de mayor a menor (el más reciente arriba)
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Renderizamos solo los primeros 4 después de ordenar
        container.innerHTML = posts.slice(0, 4).map((post, index) => {
            const dateOptions = { month: 'long', year: 'numeric' };
            const dateObj = new Date(post.date + 'T00:00:00');
            const formattedDate = dateObj.toLocaleDateString('es-ES', dateOptions);

            return `
                <a href="${post.link}" target="_blank" class="group block py-10 border-b border-zinc-900 hover:bg-zinc-900/20 transition-all px-4 -mx-4">
                    <div class="flex items-start gap-6">
                        <span class="text-zinc-800 font-mono text-lg mt-1 group-hover:text-emerald-500 transition-colors">0${index + 1}</span>
                        <div class="flex-grow">
                            <div class="flex justify-between items-center mb-3">
                                <h3 class="text-2xl font-bold text-white group-hover:translate-x-2 transition-transform duration-300">${post.title}</h3>
                                <svg class="w-6 h-6 text-emerald-500 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                            </div>
                            <p class="text-zinc-500 text-sm leading-relaxed max-w-2xl">${post.description}</p>
                            <div class="mt-4 flex items-center gap-4">
                                <span class="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">${formattedDate}</span>
                                <div class="h-[1px] w-8 bg-zinc-800"></div>
                                <span class="text-[9px] font-black text-emerald-500/50 uppercase tracking-[0.2em]">${post.category || 'Journal'}</span>
                            </div>
                        </div>
                    </div>
                </a>`;
        }).join('');

    } catch (error) {
        console.error("Error cargando posts:", error);
        container.innerHTML = "<p class='text-zinc-600 text-center py-20 font-mono text-xs uppercase'>Contenido en actualización...</p>";
    }
}
// --- 8. INICIO UNIFICADO (UN SOLO EVENTO PARA TODO) ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar datos
    loadStore();
    loadJournalPosts();

    // 2. Elementos del DOM
    const elements = {
        cartBtn: document.getElementById('cart-button'),
        closeCart: document.getElementById('close-cart'),
        cartModal: document.getElementById('cart-modal'),
        closeOverlay: document.getElementById('close-cart-overlay'),
        prodModal: document.getElementById('product-modal')
    };

    // 3. Eventos de Carrito
    if (elements.cartBtn) elements.cartBtn.onclick = () => elements.cartModal?.classList.remove('hidden');
    if (elements.closeCart) elements.closeCart.onclick = () => elements.cartModal?.classList.add('hidden');
    if (elements.closeOverlay) elements.closeOverlay.onclick = () => elements.cartModal?.classList.add('hidden');

    // 4. Cierre de Modal de Producto al hacer clic fuera
    if (elements.prodModal) {
        elements.prodModal.addEventListener('click', (e) => {
            if (e.target === elements.prodModal) closeProductModal();
        });
    }

    // 5. Tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") {
            closeProductModal();
            elements.cartModal?.classList.add('hidden');
        }
    });
});