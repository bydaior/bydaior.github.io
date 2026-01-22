let products = [];

// 1. CARGA INICIAL
async function loadStore() {
    console.log("Intentando cargar products.json...");
    try {
        const response = await fetch('https://bydaior.github.io/products.json');
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        products = await response.json();
        console.log("Datos recibidos correctamente:", products);

        // Renderizar componentes
        renderCategoryFilters();
        displayProducts(products);

    } catch (error) {
        console.error("Detalle del error:", error);
        const container = document.getElementById('product-list');
        if (container) container.innerHTML = "<p class='text-center col-span-full'>Error al cargar productos.</p>";
    }
}

// 2. RENDERIZAR CATEGORÍAS DINÁMICAS
function renderCategoryFilters() {
    const select = document.getElementById('category-select');
    if (!select) return;

    const categories = [...new Set(products.map(p => p.category))];
    
    // Mantener la opción inicial
    select.innerHTML = '<option value="all">Todas las categorías</option>';

    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        select.appendChild(option);
    });
}

// 3. MOSTRAR PRODUCTOS EN EL GRID
function displayProducts(list) {
    const container = document.getElementById('product-list'); // ID corregido según tu HTML
    if (!container) return;

    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = "<p class='text-center col-span-full text-zinc-500'>No se encontraron resultados.</p>";
        return;
    }

    list.forEach(p => {
        container.innerHTML += `
            <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-emerald-500/30 transition-all flex flex-col group">
                <div class="relative overflow-hidden rounded-2xl mb-4">
                    <img src="${p.image}" alt="${p.name}" class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500">
                    <span class="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-[10px] font-bold px-3 py-1 rounded-full text-zinc-300 uppercase tracking-widest">${p.category}</span>
                </div>
                <h3 class="text-lg font-bold text-white mb-2">${p.name}</h3>
                <div class="mt-auto flex justify-between items-center">
                    <p class="text-2xl font-black text-emerald-500">$${p.price}</p>
                    <button onclick="addToCart(${p.id})" class="p-3 bg-white text-black rounded-xl hover:bg-emerald-400 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
            </div>`;
    });
}

// 4. LÓGICA DE FILTRADO
function filter() {
    const searchInput = document.getElementById('search-input');
    const categorySelect = document.getElementById('category-select');
    const priceSelect = document.getElementById('price-select');

    const query = searchInput ? searchInput.value.toLowerCase() : "";
    const cat = categorySelect ? categorySelect.value : "all";
    const priceLimit = priceSelect ? (priceSelect.value === "Infinity" ? Infinity : parseFloat(priceSelect.value)) : Infinity;

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(query);
        const matchesCategory = (cat === 'all' || p.category === cat);
        const matchesPrice = p.price <= priceLimit;
        return matchesSearch && matchesCategory && matchesPrice;
    });

    displayProducts(filtered);
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', loadStore);
////

let cart = JSON.parse(localStorage.getItem('cart')) || [];
const WS_NUMBER = "+584142186884";

// 1. Lógica para inicializar categorías dinámicamente
function initCategories() {
    const categorySelect = document.getElementById('category-select');
    // Extraemos categorías únicas de los productos
    const categories = ['all', ...new Set(products.map(p => p.category))];
    
    categorySelect.innerHTML = categories.map(cat => 
        `<option value="${cat}">${cat === 'all' ? 'Todas las categorías' : cat}</option>`
    ).join('');
}

// 2. Notificación al agregar
function showNotification() {
    const note = document.getElementById('notification');
    note.classList.add('notification-active');
    setTimeout(() => {
        note.classList.remove('notification-active');
    }, 2500);
}

// 3. Sistema de PayPal
function initPayPal() {
    const container = document.getElementById('paypal-button-container');
    container.innerHTML = '';
    if (cart.length === 0) return;

    paypal.Buttons({
        createOrder: (data, actions) => {
            const total = cart.reduce((acc, item) => acc + item.price, 0).toFixed(2);
            return actions.order.create({ purchase_units: [{ amount: { value: total } }] });
        },
        onApprove: (data, actions) => {
            return actions.order.capture().then(details => {
                tempPayPalDetails = details; // Guardamos datos del cliente
                document.getElementById('cart-modal').classList.add('hidden'); // Cerramos carrito
                document.getElementById('email-modal').classList.remove('hidden'); // Abrimos captura email
            });
        }
    }).render('#paypal-button-container');
}

// 2. PROCESAR EMAIL Y GENERAR FACTURA
function processEmailSubmission() {
    const deliveryEmail = document.getElementById('customer-delivery-email').value;
    if (!deliveryEmail.includes('@')) return alert("Por favor ingresa un correo válido");

    // Llenar datos de la factura
    const invoiceId = `DX-${Math.floor(1000 + Math.random() * 9000)}`;
    const date = new Date().toLocaleDateString();
    const total = cart.reduce((acc, item) => acc + item.price, 0).toFixed(2);

    document.getElementById('invoice-id').textContent = `#${invoiceId}`;
    document.getElementById('invoice-date').textContent = date;
    document.getElementById('invoice-client-name').textContent = `${tempPayPalDetails.payer.name.given_name} ${tempPayPalDetails.payer.name.surname}`;
    document.getElementById('invoice-client-paypal').textContent = tempPayPalDetails.payer.email_address;
    document.getElementById('invoice-delivery-email').textContent = deliveryEmail;
    document.getElementById('invoice-total').textContent = `$${total}`;

    // Llenar tabla de productos
    const itemsBody = document.getElementById('invoice-items');
    itemsBody.innerHTML = cart.map(item => `
        <tr class="border-b border-zinc-50 text-sm">
            <td class="py-4 font-bold text-zinc-800">${item.name}</td>
            <td class="py-4 text-right font-black">$${item.price.toFixed(2)}</td>
        </tr>
    `).join('');

    // Cambiar de modal
    document.getElementById('email-modal').classList.add('hidden');
    document.getElementById('invoice-modal').classList.remove('hidden');
    
    // Vaciar carrito (pero guardamos una copia para el PDF/WhatsApp antes)
    const finalOrder = [...cart];
    cart = [];
    updateCart();
}

// 3. DESCARGAR PNG
function downloadPNG() {
    const element = document.getElementById('invoice-content');
    const invoiceId = document.getElementById('invoice-id').textContent.trim().replace('#', '');
    const fileName = `Daior_Receipt_${invoiceId}.png`;
    
    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    btn.innerText = "Generando Imagen...";

    // Configuramos la captura
    html2canvas(element, {
        scale: 3, // Alta calidad
        useCORS: true,
        backgroundColor: "#ffffff", // Fondo blanco sólido
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
    }).then(canvas => {
        // Convertimos el canvas a una URL de imagen
        const image = canvas.toDataURL("image/png");
        
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
            // En móviles, abrimos la imagen en una pestaña nueva
            // El usuario solo debe dejar presionado y "Guardar imagen"
            const newWindow = window.open();
            newWindow.document.write(`<img src="${image}" style="width:100%;" />`);
            newWindow.document.title = fileName;
        } else {
            // En PC, forzamos la descarga automática
            const link = document.createElement('a');
            link.download = fileName;
            link.href = image;
            link.click();
        }
        
        btn.innerHTML = originalText;
    }).catch(err => {
        console.error("Error al generar PNG:", err);
        btn.innerText = "Error";
    });
}

// 4. ENVIAR RECIBO A WHATSAPP
function sendInvoiceToWhatsApp() {
    const id = document.getElementById('invoice-id').textContent;
    const client = document.getElementById('invoice-client-name').textContent;
    const email = document.getElementById('invoice-delivery-email').textContent;
    const total = document.getElementById('invoice-total').textContent;

    let message = `*RECIBO DE COMPRA - DAIOR SHOP*\n`;
    message += `--------------------------------\n`;
    message += `*ID:* ${id}\n`;
    message += `*Cliente:* ${client}\n`;
    message += `*Enviar a:* ${email}\n`;
    message += `*Monto:* ${total}\n`;
    message += `--------------------------------\n`;
    message += `_He realizado mi pago por PayPal y adjunto mi recibo._`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WS_NUMBER.replace('+', '')}?text=${encoded}`, '_blank');
}

// 4. WhatsApp Checkout
function checkoutWhatsApp() {
    if (cart.length === 0) return alert("Carrito vacío");
    let total = 0;
    let message = "¡Hola Daior! Me interesa comprar:\n\n";
    cart.forEach((item, i) => {
        message += `${i+1}. *${item.name}* ($${item.price})\n`;
        total += item.price;
    });
    message += `\n*Total: $${total.toFixed(2)}*`;
    window.open(`https://wa.me/${WS_NUMBER.replace('+', '')}?text=${encodeURIComponent(message)}`, '_blank');
}

// 5. Render y Filtros
function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (cartCount) cartCount.textContent = cart.length;
    
    let total = 0;
    if (cart.length === 0) {
        cartItems.innerHTML = `<p class="text-center text-zinc-500 py-10">El carrito está vacío</p>`;
        if (cartTotal) cartTotal.textContent = "$0.00";
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
        if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
    }
    
    initPayPal(); // Se asegura de actualizar PayPal con el nuevo total
}

function displayProducts(items) {
    const list = document.getElementById('product-list');
    list.innerHTML = items.map(p => `
        <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 hover:border-emerald-500/30 transition-all group">
            <div class="aspect-square rounded-2xl overflow-hidden mb-4 relative">
                <img src="${p.image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent"></div>
            </div>
            <span class="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">${p.category}</span>
            <h3 class="text-lg font-bold mb-4">${p.name}</h3>
            <div class="flex items-center justify-between">
                <span class="text-xl font-black text-white">$${p.price}</span>
                <button onclick="addToCart(${p.id})" class="bg-white text-black h-10 w-10 rounded-full flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"/></svg>
                </button>
            </div>
        </div>
    `).join('');
}

// ... (resto del código anterior igual)

function filter() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const cat = document.getElementById('category-select').value;
    
    // Capturamos el valor del select
    const priceValue = document.getElementById('price-select').value;
    
    // Convertimos a número real o a Infinito absoluto
    const priceLimit = priceValue === "Infinity" ? Infinity : parseFloat(priceValue);

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(query);
        const matchesCategory = (cat === 'all' || p.category === cat);
        
        // Ahora la lógica es matemática pura: 
        // Cualquier número siempre es menor que Infinity.
        const matchesPrice = p.price <= priceLimit;
        
        return matchesSearch && matchesCategory && matchesPrice;
    });

    displayProducts(filtered);
}

function executeFiltering(priceLimit) {
    const query = document.getElementById('search-input').value.toLowerCase();
    const cat = document.getElementById('category-select').value;

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(query);
        const matchesCategory = (cat === 'all' || p.category === cat);
        const matchesPrice = (priceLimit >= 200 || p.price <= priceLimit);
        
        return matchesSearch && matchesCategory && matchesPrice;
    });

    displayProducts(filtered);
}

// 6. CORRECCIÓN DEL ADDTOCART (Para evitar errores si products aún no carga)
function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        cart.push({...product}); // Usamos copia para evitar problemas de referencia
        updateCart();
        showNotification();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// 7. EVENTOS DE INICIALIZACIÓN (Sustituye los repetidos al final de tu archivo)
document.addEventListener('DOMContentLoaded', async () => {
    await loadStore(); // Espera a que los productos carguen
    updateCart();      // Carga el carrito del localStorage
    
    // Eventos de apertura/cierre de modal
    const cartBtn = document.getElementById('cart-button');
    const closeBtn = document.getElementById('close-cart');
    const overlay = document.getElementById('close-cart-overlay');
    const modal = document.getElementById('cart-modal');

    if(cartBtn) cartBtn.onclick = () => modal.classList.remove('hidden');
    if(closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');
    if(overlay) overlay.onclick = () => modal.classList.add('hidden');
});
