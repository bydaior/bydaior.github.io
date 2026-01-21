// VARIABLE PARA NOMBRE DINÁMICO DEL COMERCIO
const nombreTienda = "Daior";
const myInstagram = "@daior_";
const myLocation = "X Planet";

// Base de Datos de Productos
const products = [
    { id: 1, name: "Vocal Mixing", price: 49.99, category: "Servicios", image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500", desc: "Producción exclusiva adaptada a tu estilo." },
    { id: 2, name: "Mixing Silver", price: 80.00, category: "Servicios", image: "https://images.unsplash.com/photo-1559732277-7453b141e3a1?w=500", desc: "Pulido profesional de alta fidelidad." },
    { id: 3, name: "Mixing Platinum", price: 134.00, category: "Servicios", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500", desc: "Snares y kicks premium." },
    { id: 4, name: "Exclusive Beat", price: 150.00, category: "Servicios", image: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=500", desc: "Cadena de voces para FL Studio." },
    { id: 5, name: "Masterización", price: 45.00, category: "Servicios", image: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=500", desc: "Cadena de voces para FL Studio." },
    { id: 6, name: "Catarsis Drumkit (Reggaeton)", price: 45.00, category: "Drumkits", image: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=500", desc: "Cadena de voces para FL Studio." },
];

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
    let message = "¡Hola Daior! 🍃 Me interesa comprar:\n\n";
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
    document.getElementById('cart-count').textContent = cart.length;
    
    const cartItems = document.getElementById('cart-items');
    let total = 0;
    cartItems.innerHTML = cart.map((item, index) => {
        total += item.price;
        return `
            <div class="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                <img src="${item.image}" class="w-12 h-12 rounded-lg object-cover">
                <div class="flex-grow text-sm">
                    <h4 class="font-bold">${item.name}</h4>
                    <p class="text-emerald-500 font-bold">$${item.price}</p>
                </div>
                <button onclick="removeFromCart(${index})" class="text-zinc-600 hover:text-red-400">✕</button>
            </div>
        `;
    }).join('');
    
    document.getElementById('cart-total').textContent = `$${total.toFixed(2)}`;
    initPayPal();
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
    const priceRangeInput = document.getElementById('price-range');
    const priceValueDisplay = document.getElementById('price-value');
    
    const priceLimit = parseInt(priceRangeInput.value);

    // Actualización visual del label de precio
    if (priceLimit >= 200) {
        priceValueDisplay.textContent = "Cualquier precio";
    } else {
        priceValueDisplay.textContent = `$${priceLimit}`;
    }

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(query);
        const matchesCategory = (cat === 'all' || p.category === cat);
        
        // CORRECCIÓN: Si el slider está al máximo (200), muestra todos
        const matchesPrice = (priceLimit >= 200 || p.price <= priceLimit);
        
        return matchesSearch && matchesCategory && matchesPrice;
    });

    displayProducts(filtered);
}

// ... (resto de las funciones addToCart, updateCart, etc.)

function addToCart(id) {
    cart.push(products.find(p => p.id === id));
    updateCart();
    showNotification();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// Eventos de Modal
document.getElementById('cart-button').onclick = () => document.getElementById('cart-modal').classList.remove('hidden');
document.getElementById('close-cart').onclick = () => document.getElementById('cart-modal').classList.add('hidden');
document.getElementById('close-cart-overlay').onclick = () => document.getElementById('cart-modal').classList.add('hidden');

// Inicialización
document.getElementById('search-input').oninput = filter;
document.getElementById('category-select').onchange = filter;
document.getElementById('price-range').oninput = filter;

initCategories();
displayProducts(products);
updateCart();



// FIN de CODIGO 2026.01.21
