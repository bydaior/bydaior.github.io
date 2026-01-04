// VARIABLE PARA NOMBRE DINÁMICO DEL COMERCIO
const nombreTienda = "Daior";
const myInstagram = "@daior_";

// Productos con ofertas especiales
const productos = [
    { 
        id: 1, 
        nombre: "Vocal Mixing", 
        precio: 44.99, 
        precioOriginal: 99.99,
        categoria: "Servicios", 
        img: "https://i.pinimg.com/736x/72/07/df/7207dfcfb37e7d3483f5df35712d903d.jpg",
        descripcion: "Mezcla solo de voces + instrumental, llevaré tu canción al siguiente nivel.",
        oferta: true
    },
    { 
        id: 2, 
        nombre: "Mixing Silver", 
        precio: 80.00, 
        precioOriginal: 125.00,
        categoria: "Servicios", 
        img: "https://i.pinimg.com/1200x/a3/a3/a4/a3a3a48c1fc37118081f5f0e50a83fc9.jpg",
        descripcion: "Mezcla de hasta 25 tracks, llevaré tu canción al siguiente nivel.",
        oferta: true
    },
    { 
        id: 3, 
        nombre: "Mixing Platinum", 
        precio: 134.00,
        precioOriginal: 224.99,
        categoria: "Servicios", 
        img: "https://i.pinimg.com/736x/f7/c6/f1/f7c6f103d8b793839417a6c23bcba1c3.jpg",
        descripcion: "Mezcla de hasta 45 tracks, llevaré tu canción al siguiente nivel.",
        oferta: true
    },
    { 
        id: 4, 
        nombre: "Exclusive Beat", 
        precio: 150.00, 
        categoria: "Servicios", 
        img: "https://i.pinimg.com/1200x/ce/a5/7b/cea57bd488a637633c57bf61aad4e2ff.jpg",
        descripcion: "Beat exclusivo para tu proyecto musical, sin regalías adicionales.",
        oferta: false
    },
    { 
        id: 5, 
        nombre: "Masterización", 
        precio: 35.00, 
        precioOriginal: 45.00,
        categoria: "Servicios", 
        img: "https://i.pinimg.com/1200x/ec/38/c3/ec38c3b5e3fdbd592f0ee45ea581e265.jpg",
        descripcion: "El último paso que necesita tu canción para que tenga una fiel representación final",
        oferta: true
    },
    { 
        id: 6, 
        nombre: "Catarsis Drumkit (Reggaeton)", 
        precio: 19.99, 
        precioOriginal: 35.00,
        categoria: "Drumkits", 
        img: "https://i.pinimg.com/1200x/4a/61/76/4a6176b37eb70835473089f4cb21e243.jpg",
        descripcion: "La librería de sonidos que necesitas para que tus beats destaquen con unos drums potentes irresistibles para los artistas.",
        oferta: true
    },
];

// Variables globales
let carrito = JSON.parse(localStorage.getItem('mi_carrito_web')) || [];
let wishlist = JSON.parse(localStorage.getItem('mi_wishlist_web')) || [];
let numeroOrden = localStorage.getItem('numero_orden') || generarNumeroOrden();
let productoSeleccionadoId = null;
let bannerMostrado = localStorage.getItem('banner_oferta_mostrado') !== 'true';

// Función para crear slug (ID amigable para URL)
function crearSlug(texto) {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Función para actualizar el nombre de la tienda en toda la página
function actualizarNombreTienda() {
    document.getElementById('titulo-pagina').textContent = nombreTienda;
    document.getElementById('header-titulo').textContent = `🍃 ${nombreTienda}`;
    document.getElementById('footer-titulo').textContent = `🍃 ${nombreTienda}`;
    
    // Actualizar en el resumen de pedido (se actualiza en tiempo real cuando se genera)
    const summaryElements = document.querySelectorAll('.summary-box strong');
    summaryElements.forEach(el => {
        if (el.textContent.includes('Daior')) {
            el.textContent = nombreTienda;
        }
    });
}

// Generar número de orden único
function generarNumeroOrden() {
    const nuevoNumero = `PED-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    localStorage.setItem('numero_orden', nuevoNumero);
    return nuevoNumero;
}

// NUEVO: Mostrar banner de oferta
function mostrarBannerOferta() {
    if (bannerMostrado) {
        const banner = document.getElementById('offer-banner');
        setTimeout(() => {
            banner.classList.add('show');
            // Mostrar solo por 30 segundos
            setTimeout(() => {
                cerrarBannerOferta();
            }, 30000);
        }, 2000); // Aparece después de 2 segundos
    }
}

// NUEVO: Cerrar banner de oferta
function cerrarBannerOferta() {
    const banner = document.getElementById('offer-banner');
    banner.classList.remove('show');
    localStorage.setItem('banner_oferta_mostrado', 'true');
    bannerMostrado = false;
}

// Sistema de notificaciones personalizadas
function mostrarNotificacion(titulo, mensaje, tipo = 'exito', duracion = 3000) {
    // No mostrar notificaciones en dispositivos móviles
    if (window.innerWidth <= 768) {
        return;
    }
    
    const container = document.getElementById('notificacion-container');
    const id = 'notificacion-' + Date.now();
    
    // Icono según el tipo
    let icono = '';
    switch(tipo) {
        case 'exito':
            icono = '<i class="bi bi-check-circle-fill"></i>';
            break;
        case 'error':
            icono = '<i class="bi bi-x-circle-fill"></i>';
            break;
        case 'info':
            icono = '<i class="bi bi-info-circle-fill"></i>';
            break;
        case 'advertencia':
            icono = '<i class="bi bi-exclamation-triangle-fill"></i>';
            break;
    }
    
    const notificacionHTML = `
        <div class="notificacion ${tipo}" id="${id}">
            <div class="notificacion-icono">${icono}</div>
            <div class="notificacion-contenido">
                <div class="notificacion-titulo">${titulo}</div>
                <div class="notificacion-mensaje">${mensaje}</div>
            </div>
            <button class="notificacion-close" onclick="cerrarNotificacion('${id}')">
                <i class="bi bi-x"></i>
            </button>
        </div>
    `;
    
    container.insertAdjacentHTML('afterbegin', notificacionHTML);
    
    // Eliminar automáticamente después de la duración
    if (duracion > 0) {
        setTimeout(() => {
            cerrarNotificacion(id);
        }, duracion);
    }
    
    return id;
}

function cerrarNotificacion(id) {
    const notificacion = document.getElementById(id);
    if (notificacion) {
        notificacion.classList.add('hide');
        setTimeout(() => {
            notificacion.remove();
        }, 300);
    }
}

// Cargar categorías automáticamente
function cargarCategorias() {
    const selectCategoria = document.getElementById('filtro-categoria');
    
    // Obtener categorías únicas de los productos
    const categorias = [...new Set(productos.map(p => p.categoria))];
    
    // Limpiar opciones existentes (excepto "Todos")
    selectCategoria.innerHTML = '<option value="todos">Todos los productos</option>';
    
    // Agregar cada categoría como opción
    categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        selectCategoria.appendChild(option);
    });
}

// Función para verificar si un producto está en la wishlist
function estaEnWishlist(id) {
    return wishlist.some(p => p.id === id);
}

// CORRECCIÓN: Actualizar icono de wishlist en tarjeta específica
function actualizarIconoWishlistTarjeta(id) {
    const slug = crearSlug(productos.find(p => p.id === id).nombre);
    const productCard = document.getElementById(slug);
    if (productCard) {
        const wishlistBtn = productCard.querySelector('.wishlist-btn-card');
        if (wishlistBtn) {
            const enWishlist = estaEnWishlist(id);
            wishlistBtn.innerHTML = `<i class="bi ${enWishlist ? 'bi-heart-fill' : 'bi-heart'}"></i>`;
            wishlistBtn.title = enWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos';
            
            // Agregar animación
            wishlistBtn.classList.add('wishlist-animation');
            setTimeout(() => {
                wishlistBtn.classList.remove('wishlist-animation');
            }, 600);
        }
    }
}

// NUEVO: Agregar o quitar de la wishlist
function toggleWishlist(id) {
    const prod = productos.find(p => p.id === id);
    const existe = wishlist.find(p => p.id === id);
    
    if (existe) {
        // Quitar de la wishlist
        wishlist = wishlist.filter(p => p.id !== id);
        mostrarNotificacion(
            'Quitado de favoritos',
            `${prod.nombre} se eliminó de tu lista de deseos`,
            'advertencia',
            2000
        );
    } else {
        // Agregar a la wishlist
        wishlist.push({ ...prod });
        mostrarNotificacion(
            'Agregado a favoritos',
            `${prod.nombre} se agregó a tu lista de deseos`,
            'exito',
            2000
        );
    }
    
    guardarWishlist();
    
    // Actualizar el icono en la tarjeta del producto
    actualizarIconoWishlistTarjeta(id);
    
    // Actualizar el icono del botón de wishlist en el modal si está abierto
    if (document.getElementById('modal-producto').classList.contains('active') && productoSeleccionadoId === id) {
        actualizarIconoWishlistModal(id);
    }
    
    // Actualizar el contador de wishlist en el header
    actualizarContadorWishlist();
    
    // Actualizar la wishlist lateral si está abierta
    if (document.getElementById('wishlist-sidebar').classList.contains('active')) {
        renderizarWishlist();
    }
}

// CORRECCIÓN: Actualizar icono de wishlist en el modal
function actualizarIconoWishlistModal(id) {
    const estaEnLista = estaEnWishlist(id);
    const btnWishlist = document.getElementById('modal-btn-wishlist');
    
    if (btnWishlist) {
        btnWishlist.innerHTML = estaEnLista 
            ? '<i class="bi bi-heart-fill"></i> Quitar de Favoritos'
            : '<i class="bi bi-heart"></i> Agregar a Favoritos';
    }
}

// NUEVO: Guardar wishlist en localStorage
function guardarWishlist() {
    localStorage.setItem('mi_wishlist_web', JSON.stringify(wishlist));
}

// NUEVO: Actualizar contador de wishlist en el header
function actualizarContadorWishlist() {
    const wishlistCount = document.getElementById('wishlist-count');
    if (wishlistCount) {
        wishlistCount.textContent = wishlist.length;
    }
}

// NUEVO: Renderizar productos en la wishlist lateral
function renderizarWishlist() {
    const wishlistItems = document.getElementById('wishlist-items');
    wishlistItems.innerHTML = '';
    
    if (wishlist.length === 0) {
        wishlistItems.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #666;">
                <div style="font-size: 3rem; color: #ddd; margin-bottom: 15px;">
                    <i class="bi bi-heart"></i>
                </div>
                <h3 style="margin-bottom: 10px;">Tu lista de deseos está vacía</h3>
                <p>Agrega productos que te interesen para verlos aquí.</p>
            </div>
        `;
        return;
    }
    
    wishlist.forEach(item => {
        wishlistItems.innerHTML += `
            <div class="wishlist-item">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${item.img}" alt="${item.nombre}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                    <div>
                        <strong>${item.nombre}</strong><br>
                        <small>$${item.precio.toFixed(2)}</small>
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn-add-to-cart-from-wishlist" onclick="moverWishlistAlCarrito(${item.id})" title="Agregar al carrito">
                        <i class="bi bi-cart-plus"></i>
                    </button>
                    <button class="btn-remove-wishlist" onclick="toggleWishlist(${item.id})" title="Quitar de favoritos">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
}

// NUEVO: Mover producto de wishlist al carrito
function moverWishlistAlCarrito(id) {
    const prod = productos.find(p => p.id === id);
    const existe = carrito.find(p => p.id === id);
    
    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({ ...prod, cantidad: 1 });
    }
    
    guardar();
    
    // Animación del icono del carrito
    const icon = document.getElementById('cart-icon');
    icon.classList.remove('anim-bounce');
    void icon.offsetWidth;
    icon.classList.add('anim-bounce');
    
    // Remover animación después de completarse
    setTimeout(() => {
        icon.classList.remove('anim-bounce');
    }, 400);
    
    // Notificación personalizada
    mostrarNotificacion(
        'Producto movido al carrito',
        `${prod.nombre} se agregó al carrito desde tu lista de deseos`,
        'exito',
        1000
    );
    
    // Si está en wishlist, quitarlo
    if (estaEnWishlist(id)) {
        toggleWishlist(id);
    }
}

// NUEVO: Abrir wishlist lateral
function abrirWishlist() {
    // Si el carrito está abierto, cerrarlo primero
    if (document.getElementById('cart-sidebar').classList.contains('active')) {
        toggleCart();
    }
    
    renderizarWishlist();
    document.getElementById('wishlist-sidebar').classList.add('active');
    document.getElementById('overlay').classList.add('active');
}

// NUEVO: Cerrar wishlist lateral
function cerrarWishlist() {
    document.getElementById('wishlist-sidebar').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
}

// NUEVO: Vaciar wishlist
function vaciarWishlist() {
    if (wishlist.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Lista de deseos vacía',
            text: 'La lista de deseos ya está vacía',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
        });
        return;
    }
    
    Swal.fire({
        title: '¿Vaciar lista de deseos?',
        text: "¿Está seguro de vaciar toda tu lista de deseos?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff4757',
        cancelButtonColor: '#95a5a6',
        confirmButtonText: 'Sí, vaciar',
        cancelButtonText: 'Cancelar',
        customClass: {
            container: 'swal2-container',
            popup: 'swal2-popup'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            wishlist = [];
            guardarWishlist();
            actualizarContadorWishlist();
            renderizarWishlist();
            
            mostrarNotificacion(
                'Lista de deseos vaciada',
                'Todos los productos fueron eliminados de tu lista de deseos',
                'advertencia',
                1500
            );
            
            // Actualizar todos los iconos de wishlist en las tarjetas
            productos.forEach(p => {
                actualizarIconoWishlistTarjeta(p.id);
            });
        }
    });
}

// Renderizar productos con ofertas
function renderizar(lista) {
    const cat = document.getElementById('catalogo');
    cat.innerHTML = '';
    
    if (lista.length === 0) {
        cat.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px;">
                <div style="font-size: 4rem; color: #ddd; margin-bottom: 20px;">
                    <i class="bi bi-search"></i>
                </div>
                <h3 style="color: #666; margin-bottom: 10px;">No se encontraron productos</h3>
                <p style="color: #999;">Intenta con otros términos de búsqueda o ajusta los filtros.</p>
            </div>
        `;
        return;
    }
    
    lista.forEach(p => {
        const tieneOferta = p.oferta && p.precioOriginal;
        const descuento = tieneOferta ? Math.round(((p.precioOriginal - p.precio) / p.precioOriginal) * 100) : 0;
        const slug = crearSlug(p.nombre);
        const enWishlist = estaEnWishlist(p.id);
        
        // Agregar ID único al contenedor del producto (sin la palabra "producto")
        cat.innerHTML += `
            <div class="product-card" id="${slug}">
                ${tieneOferta ? `<div class="offer-badge">-${descuento}%</div>` : ''}
                <!-- Botón de wishlist en la tarjeta -->
                <button class="wishlist-btn-card" onclick="toggleWishlist(${p.id})" title="${enWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}">
                    <i class="bi ${enWishlist ? 'bi-heart-fill' : 'bi-heart'}"></i>
                </button>
                <img src="${p.img}" class="product-image" onclick="abrirModalProducto(${p.id})" alt="${p.nombre}">
                <div class="product-info">
                    <span style="font-size:0.7rem; color:#888; text-transform: uppercase; font-weight: bold;">${p.categoria}</span>
                    <h3 style="margin: 5px 0;">
                        <a href="#${slug}" style="color: inherit; text-decoration: none;" onclick="abrirModalProducto(${p.id}); return false;">
                            ${p.nombre}
                        </a>
                    </h3>
                    <div class="product-price">
                        $${p.precio.toFixed(2)}
                        ${tieneOferta ? `
                            <span class="old-price">$${p.precioOriginal.toFixed(2)}</span>
                            <span class="discount-percent">-${descuento}%</span>
                        ` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="btn-buy-now" onclick="comprarAhora(${p.id})">
                            <i class="bi bi-bag-check"></i> Comprar
                        </button>
                        <button class="btn-add" onclick="agregarAlCarrito(${p.id})">
                            <i class="bi bi-cart-plus"></i> Agregar
                        </button>
                    </div>
                </div>
            </div>`;
    });
}

// Función Comprar Ahora
function comprarAhora(id) {
    const prod = productos.find(p => p.id === id);
    const existe = carrito.find(p => p.id === id);
    
    // Limpiar carrito y añadir solo este producto
    carrito = [];
    carrito.push({ ...prod, cantidad: 1 });
    
    guardar();
    
    // Animación del icono del carrito
    const icon = document.getElementById('cart-icon');
    icon.classList.remove('anim-bounce');
    void icon.offsetWidth;
    icon.classList.add('anim-bounce');
    
    // Remover animación después de completarse
    setTimeout(() => {
        icon.classList.remove('anim-bounce');
    }, 400);
    
    // Notificación personalizada
    mostrarNotificacion(
        '¡Compra rápida!',
        `${prod.nombre} añadido. Redirigiendo al resumen...`,
        'exito',
        1500
    );
    
    // Cerrar modal de producto si está abierto
    if (document.getElementById('modal-producto').classList.contains('active')) {
        cerrarModalProducto();
    }
    
    // Abrir resumen automáticamente después de un breve delay
    setTimeout(() => {
        abrirResumen();
    }, 800);
}

// Abrir modal de detalle del producto
function abrirModalProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;
    
    productoSeleccionadoId = id;
    
    document.getElementById('modal-img').src = producto.img;
    document.getElementById('modal-categoria').textContent = producto.categoria;
    document.getElementById('modal-nombre').textContent = producto.nombre;
    document.getElementById('modal-descripcion').textContent = producto.descripcion;
    
    // Mostrar precio con oferta si aplica
    const tieneOferta = producto.oferta && producto.precioOriginal;
    const descuento = tieneOferta ? Math.round(((producto.precioOriginal - producto.precio) / producto.precioOriginal) * 100) : 0;
    
    if (tieneOferta) {
        document.getElementById('modal-precio').innerHTML = `
            <span style="font-size: 1.8rem; color: #95a5a6; text-decoration: line-through; margin-right: 10px;">
                $${producto.precioOriginal.toFixed(2)}
            </span>
            <span style="font-size: 2rem; color: var(--color-primary);">
                $${producto.precio.toFixed(2)}
            </span>
            <span style="background: var(--color-success); color: white; padding: 5px 10px; border-radius: 10px; font-size: 1rem; margin-left: 10px;">
                -${descuento}% OFF
            </span>
        `;
    } else {
        document.getElementById('modal-precio').textContent = `$${producto.precio.toFixed(2)}`;
    }
    
    // Configurar botón de agregar al carrito
    const btnAgregar = document.getElementById('modal-btn-agregar');
    btnAgregar.onclick = function() {
        agregarAlCarrito(id);
        cerrarModalProducto();
    };
    
    // Configurar botón Comprar Ahora en modal
    const btnComprar = document.getElementById('modal-btn-comprar');
    btnComprar.onclick = function() {
        comprarAhora(id);
    };
    
    // CORRECCIÓN: Configurar botón de wishlist en modal con el mismo ancho
    const btnWishlist = document.getElementById('modal-btn-wishlist');
    if (btnWishlist) {
        const enWishlist = estaEnWishlist(id);
        btnWishlist.innerHTML = enWishlist 
            ? '<i class="bi bi-heart-fill"></i> Quitar de Favoritos'
            : '<i class="bi bi-heart"></i> Agregar a Favoritos';
        btnWishlist.onclick = function() {
            toggleWishlist(id);
            // No es necesario llamar a actualizarIconoWishlistModal aquí porque ya se llama en toggleWishlist
        };
    }
    
    document.getElementById('modal-producto').classList.add('active');
    
    // Actualizar la URL con el hash del producto (sin "producto-")
    const slug = crearSlug(producto.nombre);
    history.pushState(null, null, `#${slug}`);
}

// Cerrar modal de detalle del producto
function cerrarModalProducto() {
    document.getElementById('modal-producto').classList.remove('active');
    productoSeleccionadoId = null;
    
    // Limpiar el hash de la URL cuando se cierra el modal
    if (window.location.hash) {
        history.pushState(null, null, ' ');
    }
}

function agregarAlCarrito(id) {
    const prod = productos.find(p => p.id === id);
    const existe = carrito.find(p => p.id === id);
    
    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({ ...prod, cantidad: 1 });
    }
    
    // Animación del icono del carrito
    const icon = document.getElementById('cart-icon');
    icon.classList.remove('anim-bounce');
    void icon.offsetWidth;
    icon.classList.add('anim-bounce');
    
    // Remover animación después de completarse
    setTimeout(() => {
        icon.classList.remove('anim-bounce');
    }, 400);
    
    // Notificación personalizada
    mostrarNotificacion(
        'Producto agregado',
        `${prod.nombre} se agregó al carrito`,
        'exito',
        2000
    );
    
    guardar();
}

function cambiarCantidad(id, cambio) {
    const item = carrito.find(p => p.id === id);
    if (item) {
        item.cantidad += cambio;
        if (item.cantidad <= 0) {
            // Eliminar sin preguntar
            carrito = carrito.filter(p => p.id !== id);
            mostrarNotificacion(
                'Producto eliminado',
                'El producto fue eliminado del carrito',
                'error',
                1500
            );
        }
        guardar();
    }
}

// Eliminar producto sin confirmación
function eliminar(id) {
    carrito = carrito.filter(p => p.id !== id);
    guardar();
    
    mostrarNotificacion(
        'Producto eliminado',
        'El producto fue eliminado del carrito',
        'error',
        1500
    );
}

function vaciarCarrito() {
    if (carrito.length === 0) {
        // Usar SweetAlert2 para mensajes más elegantes
        Swal.fire({
            icon: 'info',
            title: 'Carrito vacío',
            text: 'El carrito ya está vacío',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
        });
        return;
    }
    
    // Usar SweetAlert2 para confirmación más elegante
    Swal.fire({
        title: '¿Vaciar carrito?',
        text: "¿Está seguro de vaciar todo el carrito?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#95a5a6',
        confirmButtonText: 'Sí, vaciar',
        cancelButtonText: 'Cancelar',
        customClass: {
            container: 'swal2-container',
            popup: 'swal2-popup'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            carrito = [];
            guardar();
            
            mostrarNotificacion(
                'Carrito vaciado',
                'Todos los productos fueron eliminados',
                'advertencia',
                1500
            );
        }
    });
}

function guardar() {
    localStorage.setItem('mi_carrito_web', JSON.stringify(carrito));
    actualizarUI();
}

function actualizarUI() {
    const listaUI = document.getElementById('cart-items');
    listaUI.innerHTML = '';
    
    if (carrito.length === 0) {
        listaUI.innerHTML = '<p style="text-align: center; color: #888; margin-top: 20px;">El carrito está vacío</p>';
        document.getElementById('total-price').textContent = '0.00';
        document.getElementById('cart-count').textContent = '0';
        return;
    }
    
    let total = 0, count = 0;
    carrito.forEach(item => {
        total += item.precio * item.cantidad;
        count += item.cantidad;
        listaUI.innerHTML += `
            <div class="cart-item">
                <div>
                    <strong>${item.nombre}</strong><br>
                    <small>$${item.precio.toFixed(2)} c/u</small>
                    <div class="qty-controls">
                        <button class="btn-qty" onclick="cambiarCantidad(${item.id}, -1)">-</button>
                        <span style="font-weight: bold;">${item.cantidad}</span>
                        <button class="btn-qty" onclick="cambiarCantidad(${item.id}, 1)">+</button>
                    </div>
                </div>
                <div style="text-align: right;">
                    <strong>$${(item.precio * item.cantidad).toFixed(2)}</strong><br>
                    <button onclick="eliminar(${item.id})" style="border:none; color:var(--color-accent); cursor:pointer; background:none; font-weight:bold; margin-top: 5px; display: flex; align-items: center; gap: 3px;">
                        <i class="bi bi-trash"></i> Eliminar
                    </button>
                </div>
            </div>`;
    });
    
    document.getElementById('total-price').textContent = total.toFixed(2);
    document.getElementById('cart-count').textContent = count;
}

// Orden de compra formal bien alineado
function abrirResumen() {
    if (carrito.length === 0) {
        // Usar SweetAlert2 para mensaje más elegante
        Swal.fire({
            icon: 'warning',
            title: 'Carrito vacío',
            text: 'Agrega productos antes de finalizar el pedido',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
        return;
    }
    
    const resumenBox = document.getElementById('resumen-lista');
    let total = 0;
    let subtotal = 0;
    
    const fecha = new Date().toLocaleDateString('es-VE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    let html = `
        <div class="receipt-header">
            <div>
                <strong>Fecha:</strong><br>
                ${fecha}
            </div>
            <div style="text-align: right;">
                <strong>Orden #:</strong><br>
                ${numeroOrden}
            </div>
        </div>
        <div class="receipt-items">
            <div class="receipt-item" style="font-weight: bold; border-bottom: 2px solid #333;">
                <div class="item-name">PRODUCTO</div>
                <div class="item-qty">CANT</div>
                <div class="item-price">P.U.</div>
                <div class="item-total">SUBTOTAL</div>
            </div>
    `;
    
    carrito.forEach(item => {
        const itemTotal = item.precio * item.cantidad;
        subtotal += itemTotal;
        
        html += `
            <div class="receipt-item">
                <div class="item-name">${item.nombre}</div>
                <div class="item-qty">${item.cantidad}</div>
                <div class="item-price">$${item.precio.toFixed(2)}</div>
                <div class="item-total">$${itemTotal.toFixed(2)}</div>
            </div>
        `;
    });
    
    total = subtotal;
    
    html += `
        </div>
        <div class="receipt-totals">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row final">
                <span>TOTAL:</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 0.8rem; color: #666; border-top: 1px dashed #ccc; padding-top: 10px;">
            <strong>${nombreTienda}</strong><br>
            Caracas, Venezuela<br>
            Teléfono: +58 412-XXXXXXX<br>
            Gracias por su compra!
        </div>
    `;
    
    resumenBox.innerHTML = html;
    document.getElementById('modal-resumen').classList.add('active');
}

function cerrarResumen() { 
    document.getElementById('modal-resumen').classList.remove('active');
    // También cerrar el overlay si no hay otros modales abiertos
    if (!document.getElementById('modal-producto').classList.contains('active') &&
        !document.getElementById('cart-sidebar').classList.contains('active') &&
        !document.getElementById('wishlist-sidebar').classList.contains('active')) {
        document.getElementById('overlay').classList.remove('active');
    }
}

function toggleCart() { 
    const cartSidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('overlay');
    
    // Si la wishlist está abierta, cerrarla primero
    if (document.getElementById('wishlist-sidebar').classList.contains('active')) {
        cerrarWishlist();
    }
    
    cartSidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}
// FUNCIÓN RESTAURADA: Descargar orden como PNG
function descargarResumenPNG() {
    const node = document.getElementById('resumen-lista');
    
    if (!node) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo generar la orden. Inténtalo de nuevo.',
            confirmButtonColor: '#e74c3c'
        });
        return;
    }

    // Mostrar mensaje de carga
    Swal.fire({
        title: 'Generando orden...',
        text: 'Por favor espera un momento.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Opciones optimizadas para imagen PNG fiel al diseño
    const options = {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        width: node.offsetWidth,
        height: node.offsetHeight + 20,
        style: {
            margin: '0',
            padding: '0',
            borderRadius: '8px'
        }
    };

    // Usar la librería html-to-image para convertir a PNG
    htmlToImage.toPng(node, options)
        .then(function (dataUrl) {
            // Cerrar mensaje de carga
            Swal.close();
            
            // Crear un enlace y activar la descarga
            const link = document.createElement('a');
            link.download = `${nombreTienda.toLowerCase()}_Orden_${numeroOrden}.png`;
            link.href = dataUrl;
            link.click();
            
            // CORRECCIÓN: Notificación de éxito debe aparecer delante del modal
            // Cerrar temporalmente el modal para que SweetAlert2 aparezca encima
            document.getElementById('modal-resumen').classList.remove('active');
            
            // Mostrar notificación
            Swal.fire({
                icon: 'success',
                title: 'Orden descargada',
                text: `La imagen "${nombreTienda.toLowerCase()}_Orden_${numeroOrden}.png" se ha guardado en tu dispositivo.`,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                customClass: {
                    container: 'swal2-container',
                    popup: 'swal2-popup'
                }
            }).then(() => {
                // Volver a abrir el modal después de que se cierre la notificación
                document.getElementById('modal-resumen').classList.add('active');
            });
        })
        .catch(function (error) {
            console.error('Error al generar la imagen:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo generar la orden. Inténtalo de nuevo.',
                confirmButtonColor: '#e74c3c'
            });
        });
}


// FUNCIÓN MEJORADA PARA APLICAR TODOS LOS FILTROS
function aplicarFiltros() {
    const cat = document.getElementById('filtro-categoria').value;
    const precio = parseFloat(document.getElementById('filtro-precio').value);
    const busqueda = document.getElementById('filtro-busqueda').value.toLowerCase().trim();
    
    const filtrados = productos.filter(p => {
        // Filtro por categoría
        if (cat !== 'todos' && p.categoria !== cat) return false;
        
        // Filtro por precio
        if (p.precio > precio) return false;
        
        // Filtro por búsqueda (si hay texto)
        if (busqueda !== '' && !p.nombre.toLowerCase().includes(busqueda)) return false;
        
        return true;
    });
    
    renderizar(filtrados);
}

function actualizarLabelPrecio() { 
    document.getElementById('precio-valor').textContent = document.getElementById('filtro-precio').value; 
}

// NUEVA FUNCIÓN: Procesar hash de URL
function procesarHashURL() {
    const hash = window.location.hash;
    
    if (hash && hash.startsWith('#')) {
        const slug = hash.substring(1); // Quitar el "#" del inicio
        
        if (slug) {
            // Buscar el producto por slug
            const producto = productos.find(p => {
                const productoSlug = crearSlug(p.nombre);
                return productoSlug === slug;
            });
            
            if (producto) {
                // Abrir el modal del producto después de un breve delay
                setTimeout(() => {
                    abrirModalProducto(producto.id);
                }, 300);
            }
        }
    }
}

// Inicializar la página
function inicializarPagina() {
    // Actualizar nombre de la tienda
    actualizarNombreTienda();
    
    cargarCategorias();
    renderizar(productos);
    actualizarUI();
    
    // Inicializar contador de wishlist
    actualizarContadorWishlist();
    
    // Mostrar banner de oferta después de cargar
    mostrarBannerOferta();
    
    // Procesar el hash de la URL si existe
    procesarHashURL();
}

// Event Listeners
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        cerrarTodo();
    }
});

// Cerrar modal de producto al hacer clic fuera
document.getElementById('modal-producto').addEventListener('click', function(event) {
    if (event.target === this) {
        cerrarModalProducto();
    }
});


// NUEVA FUNCIÓN: Cerrar todos los sidebars y modales
function cerrarTodo() {
    // Cerrar wishlist si está abierta
    if (document.getElementById('wishlist-sidebar').classList.contains('active')) {
        cerrarWishlist();
        return;
    }
    
    // Cerrar carrito si está abierto
    if (document.getElementById('cart-sidebar').classList.contains('active')) {
        toggleCart();
        return;
    }
    
    // Cerrar modal de resumen si está abierto
    if (document.getElementById('modal-resumen').classList.contains('active')) {
        cerrarResumen();
        return;
    }
    
    // Cerrar modal de producto si está abierto
    if (document.getElementById('modal-producto').classList.contains('active')) {
        cerrarModalProducto();
        return;
    }
    
    // Si nada está abierto, solo cerrar el overlay
    document.getElementById('overlay').classList.remove('active');
}

// Variables para PayPal
let paypalButtonsInstance = null;
let montoTotalPayPal = 0;

// Inicializar botones de PayPal
function inicializarPayPal() {
    // Destruir instancia anterior si existe
    if (paypalButtonsInstance) {
        paypalButtonsInstance.close();
    }
    
    const paypalButtonContainer = document.getElementById('paypal-button-container');
    if (!paypalButtonContainer) return;
    
    paypalButtonContainer.innerHTML = '';
    
    // Calcular el monto total
    montoTotalPayPal = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    
    if (montoTotalPayPal <= 0) {
        paypalButtonContainer.innerHTML = `
            <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                <i class="bi bi-cart-x" style="font-size: 2rem; color: #95a5a6;"></i>
                <p style="margin-top: 10px; color: #666;">Agrega productos al carrito para pagar con PayPal</p>
            </div>
        `;
        return;
    }
    
    try {
        paypalButtonsInstance = paypal.Buttons({
            style: {
                layout: 'vertical',
                color: 'gold',
                shape: 'pill',
                label: 'paypal',
                tagline: false,
                height: 55
            },
            
            createOrder: function(data, actions) {
                // Crear la orden en PayPal
                return actions.order.create({
                    purchase_units: [{
                        description: `Orden ${numeroOrden} - ${nombreTienda}`,
                        amount: {
                            currency_code: "USD",
                            value: montoTotalPayPal.toFixed(2),
                            breakdown: {
                                item_total: {
                                    currency_code: "USD",
                                    value: montoTotalPayPal.toFixed(2)
                                }
                            }
                        },
                        items: carrito.map(item => ({
                            name: item.nombre.substring(0, 127), // PayPal limita a 127 caracteres
                            description: item.categoria,
                            unit_amount: {
                                currency_code: "USD",
                                value: item.precio.toFixed(2)
                            },
                            quantity: item.cantidad,
                            category: 'DIGITAL_GOODS'
                        }))
                    }],
                    application_context: {
                        shipping_preference: 'NO_SHIPPING'
                    }
                });
            },
            
            onApprove: function(data, actions) {
                // Capturar la orden cuando el usuario aprueba el pago
                return actions.order.capture().then(function(details) {
                    // Pago exitoso
                    mostrarConfirmacionPagoExitoso(details);
                });
            },
            
            onError: function(err) {
                // Manejar errores
                console.error('Error en PayPal:', err);
                mostrarErrorPayPal(err);
            },
            
            onCancel: function(data) {
                // Usuario canceló el pago
                Swal.fire({
                    icon: 'info',
                    title: 'Pago cancelado',
                    text: 'El pago con PayPal fue cancelado.',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        });
        
        // Renderizar los botones
        if (paypalButtonsInstance.isEligible()) {
            paypalButtonsInstance.render('#paypal-button-container');
        } else {
            // Mostrar botón manual si PayPal no está disponible
            mostrarBotonPayPalManual();
        }
        
    } catch (error) {
        console.error('Error al inicializar PayPal:', error);
        mostrarBotonPayPalManual();
    }
}

// Mostrar botón manual de PayPal
function mostrarBotonPayPalManual() {
    const paypalButtonContainer = document.getElementById('paypal-button-container');
    if (!paypalButtonContainer) return;
    
    paypalButtonContainer.innerHTML = `
        <button class="btn-paypal-manual" onclick="procesarPagoPayPalManual()">
            <i class="bi bi-paypal"></i> Pagar $${montoTotalPayPal.toFixed(2)} con PayPal
        </button>
        <p style="text-align: center; font-size: 0.8rem; color: #666; margin-top: 5px;">
            Serás redirigido a PayPal para completar el pago
        </p>
    `;
}

// Procesar pago manual de PayPal
function procesarPagoPayPalManual() {
    if (montoTotalPayPal <= 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Carrito vacío',
            text: 'No hay productos para pagar.',
            confirmButtonColor: '#e74c3c'
        });
        return;
    }
    
    // Aquí podrías redirigir a un enlace de PayPal generado manualmente
    // Por ahora, mostraremos un mensaje
    Swal.fire({
        title: 'Redireccionando a PayPal...',
        html: `
            <div style="text-align: center; padding: 20px;">
                <i class="bi bi-paypal" style="font-size: 3rem; color: #0070ba; margin-bottom: 15px;"></i>
                <p>Serás redirigido a PayPal para completar el pago de <strong>$${montoTotalPayPal.toFixed(2)}</strong></p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 15px;">
                    <p style="margin: 0; font-size: 0.9rem;">
                        <strong>Número de orden:</strong><br>
                        ${numeroOrden}
                    </p>
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Continuar a PayPal',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#0070ba',
        showLoaderOnConfirm: true,
        preConfirm: () => {
            // En una implementación real, aquí redirigirías a PayPal
            // window.location.href = `https://www.paypal.com/paypalme/tuusuario/${montoTotalPayPal}`;
            
            return new Promise((resolve) => {
                setTimeout(() => {
                    // Simular redirección a PayPal
                    // En producción, descomenta la línea de window.location
                    resolve();
                }, 2000);
            });
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Simular pago exitoso
            mostrarConfirmacionPagoExitoso({
                id: 'SIMULATED-' + Date.now(),
                payer: {
                    name: { given_name: 'Cliente', surname: 'PayPal' },
                    email_address: 'cliente@paypal.com'
                }
            });
        }
    });
}

// Mostrar confirmación de pago exitoso
function mostrarConfirmacionPagoExitoso(details) {
    // Cerrar modal de resumen temporalmente
    document.getElementById('modal-resumen').classList.remove('active');
    
    // Limpiar carrito
    carrito = [];
    // Generar nuevo número de orden
    numeroOrden = generarNumeroOrden();
    guardar();
    
    // Mostrar confirmación de pago exitoso
    Swal.fire({
        title: '¡Pago Completado!',
        html: `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 4rem; color: #27ae60; margin-bottom: 15px;">
                    <i class="bi bi-check-circle-fill"></i>
                </div>
                <h3 style="color: #2c3e50; margin-bottom: 10px;">¡Pago Exitoso!</h3>
                <p style="color: #666; margin-bottom: 20px;">
                    Tu pago de <strong>$${montoTotalPayPal.toFixed(2)}</strong> fue procesado exitosamente.
                </p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 20px 0; text-align: left;">
                    <p style="margin: 5px 0;"><strong>ID de transacción:</strong><br>
                    <code style="font-size: 0.9rem;">${details.id}</code></p>
                    <p style="margin: 5px 0;"><strong>Cliente:</strong><br>
                    ${details.payer.name.given_name} ${details.payer.name.surname}</p>
                    <p style="margin: 5px 0;"><strong>Email:</strong><br>
                    ${details.payer.email_address}</p>
                    <p style="margin: 5px 0;"><strong>Número de orden:</strong><br>
                    ${numeroOrden}</p>
                </div>
                <p style="color: #999; font-size: 0.9rem; margin-top: 15px;">
                    Recibirás un email de confirmación de PayPal.<br>
                    Ahora debes enviar los detalles de tu pedido a nuestro Telegram.
                </p>
            </div>
        `,
        icon: 'success',
        confirmButtonText: 'Enviar detalles a Telegram',
        confirmButtonColor: '#0088cc',
        showCancelButton: true,
        cancelButtonText: 'Volver a la tienda',
        allowOutsideClick: false,
        customClass: {
            container: 'swal2-container',
            popup: 'swal2-popup'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Redirigir a Telegram
            window.open('https://t.me/joshgtz', '_blank');
            
            // Mostrar mensaje final
            Swal.fire({
                title: '¡Gracias por tu compra!',
                text: 'Tu pedido está siendo procesado. Nos contactaremos contigo pronto.',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#2c3e50'
            });
        } else {
            // Volver a la tienda
            window.location.reload();
        }
    });
}

// Mostrar error de PayPal
function mostrarErrorPayPal(err) {
    Swal.fire({
        icon: 'error',
        title: 'Error en el pago',
        html: `
            <div style="text-align: left; padding: 10px;">
                <p>Hubo un problema procesando tu pago con PayPal.</p>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-top: 10px; font-family: monospace; font-size: 0.8rem;">
                    Error: ${err.message || 'Desconocido'}
                </div>
                <p style="margin-top: 15px; font-size: 0.9rem;">
                    Puedes intentar de nuevo o usar otro método de pago.
                </p>
            </div>
        `,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#e74c3c'
    });
}

// Modificar la función abrirResumen para inicializar PayPal
function abrirResumen() {
    if (carrito.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Carrito vacío',
            text: 'Agrega productos antes de finalizar el pedido',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
        return;
    }
    
    const resumenBox = document.getElementById('resumen-lista');
    let total = 0;
    let subtotal = 0;
    
    const fecha = new Date().toLocaleDateString('es-VE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    let html = `
        <div class="receipt-header">
            <div>
                <strong>Fecha:</strong><br>
                ${fecha}
            </div>
            <div style="text-align: right;">
                <strong>Orden #:</strong><br>
                ${numeroOrden}
            </div>
        </div>
        <div class="receipt-items">
            <div class="receipt-item" style="font-weight: bold; border-bottom: 2px solid #333;">
                <div class="item-name">PRODUCTO</div>
                <div class="item-qty">CANT</div>
                <div class="item-price">P.U.</div>
                <div class="item-total">SUBTOTAL</div>
            </div>
    `;
    
    carrito.forEach(item => {
        const itemTotal = item.precio * item.cantidad;
        subtotal += itemTotal;
        
        html += `
            <div class="receipt-item">
                <div class="item-name">${item.nombre}</div>
                <div class="item-qty">${item.cantidad}</div>
                <div class="item-price">$${item.precio.toFixed(2)}</div>
                <div class="item-total">$${itemTotal.toFixed(2)}</div>
            </div>
        `;
    });
    
    total = subtotal;
    
    html += `
        </div>
        <div class="receipt-totals">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row final">
                <span>TOTAL A PAGAR:</span>
                <span style="color: var(--color-accent); font-size: 1.2rem;">$${total.toFixed(2)}</span>
            </div>
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 0.8rem; color: #666; border-top: 1px dashed #ccc; padding-top: 10px;">
            <strong>${nombreTienda}</strong><br>
            <i class="bi bi-instagram"></i> ${myInstagram}<br>
            Gracias por su compra!
        </div>
    `;
    
    resumenBox.innerHTML = html;
    document.getElementById('modal-resumen').classList.add('active');
    
    // Inicializar PayPal cuando se abre el resumen
    setTimeout(() => {
        inicializarPayPal();
    }, 300);
}

// Modificar la función cerrarResumen para limpiar PayPal
function cerrarResumen() { 
    document.getElementById('modal-resumen').classList.remove('active');
    
    // Limpiar instancia de PayPal
    if (paypalButtonsInstance) {
        paypalButtonsInstance.close();
        paypalButtonsInstance = null;
    }
    
    const paypalButtonContainer = document.getElementById('paypal-button-container');
    if (paypalButtonContainer) {
        paypalButtonContainer.innerHTML = '';
    }
    
    // También cerrar el overlay si no hay otros modales abiertos
    if (!document.getElementById('modal-producto').classList.contains('active') &&
        !document.getElementById('cart-sidebar').classList.contains('active') &&
        !document.getElementById('wishlist-sidebar').classList.contains('active')) {
        document.getElementById('overlay').classList.remove('active');
    }
}

// Modificar procesarEnvioTelegram para incluir opción de PayPal
function procesarEnviarOrden() {
    // Cerrar primero el modal de resumen temporalmente
    document.getElementById('modal-resumen').classList.remove('active');
    
    Swal.fire({
        title: 'Método de pago',
        html: `
            <div style="text-align: center; padding: 20px;">
                <p>¿Cómo deseas realizar el pago?</p>
                <div style="display: flex; gap: 10px; margin-top: 20px; flex-direction: column;">
                    <button id="btn-paypal-modal" class="btn-paypal-manual" style="margin: 0;">
                        <i class="bi bi-paypal"></i> Pagar con PayPal
                    </button>
                    <button id="btn-telegram-direct" class="btn-telegram" style="margin: 0;">
                        <i class="bi bi-telegram"></i> Enviar a Telegram (pago manual)
                    </button>
                </div>
                <p style="margin-top: 15px; font-size: 0.9rem; color: #666;">
                    <strong>Total a pagar:</strong> $${montoTotalPayPal.toFixed(2)}
                </p>
            </div>
        `,
        showConfirmButton: false,
        showCloseButton: true,
        allowOutsideClick: true,
        customClass: {
            container: 'swal2-container',
            popup: 'swal2-popup'
        }
    });
    
    // Agregar event listeners a los botones
    setTimeout(() => {
        const btnPaypal = document.getElementById('btn-paypal-modal');
        const btnTelegram = document.getElementById('btn-telegram-direct');
        
        if (btnPaypal) {
            btnPaypal.onclick = function() {
                Swal.close();
                // Volver a abrir el resumen con PayPal
                document.getElementById('modal-resumen').classList.add('active');
                setTimeout(() => {
                    inicializarPayPal();
                }, 300);
            };
        }
        
        if (btnTelegram) {
            btnTelegram.onclick = function() {
                Swal.close();
                procesarEnvioTelegramManual();
            };
        }
    }, 100);
}

// Función para procesar envío a Telegram (pago manual)
function procesarEnvioTelegramManual() {
    Swal.fire({
        title: '¿Ya descargaste el recibo?',
        html: `
            <div style="text-align: left; padding: 10px;">
                <p><strong>⚠️ IMPORTANTE:</strong></p>
                <p>Si ya tienes el recibo, sigue adelante.</p>
                <p>Si no, vuelve al resumen de pedido.</p>
                <p>Sin recibo no se procesará el pedido.</p>
            </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#0088cc',
        cancelButtonColor: '#95a5a6',
        confirmButtonText: 'Sí, lo tengo',
        cancelButtonText: 'Volver al resumen',
        reverseButtons: true,
        allowOutsideClick: false,
        customClass: {
            container: 'swal2-container',
            popup: 'swal2-popup'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Limpiar carrito
            carrito = [];
            // Generar nuevo número de orden para el próximo pedido
            numeroOrden = generarNumeroOrden();
            
            guardar();
            
            // Cerrar también el carrito si está abierto
            if(document.getElementById('cart-sidebar').classList.contains('active')) {
                toggleCart();
            }
            
            // Mostrar SweetAlert2 de pedido completado EN EL CENTRO
            Swal.fire({
                title: '¡Pedido Completado!',
                html: `
                    <div style="text-align: center; padding: 15px;">
                        <div style="font-size: 4rem; color: #27ae60; margin-bottom: 15px;">
                            <i class="bi bi-check-circle-fill"></i>
                        </div>
                        <h3 style="color: #2c3e50; margin-bottom: 10px;">¡Gracias por tu compra!</h3>
                        <p style="color: #666; margin-bottom: 20px;">
                            Tu pedido ha sido procesado exitosamente.<br>
                            Recuerda enviar la captura o la orden descargada a nuestro Telegram.
                        </p>
                        <p><b>✈️ Al volver a la tienda te llevaré a Telegram.</b></p>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 20px 0;">
                            <p style="margin: 0; color: #2c3e50;">
                                <strong>Número de orden:</strong><br>
                                <span style="font-family: monospace; font-size: 1.2rem;">${numeroOrden}</span>
                            </p>
                        </div>
                    </div>
                `,
                icon: 'success',
                confirmButtonText: 'Volver a la tienda',
                confirmButtonColor: '#2c3e50',
                allowOutsideClick: false,
                allowEscapeKey: false,
                allowEnterKey: false,
                showCancelButton: false,
                focusConfirm: true,
                customClass: {
                    container: 'swal2-container',
                    popup: 'swal2-popup'
                }
            }).then((result) => {
                // Cuando el usuario haga clic en "Volver a la tienda"
                // Redirigir a Telegram en nueva pestaña
                window.open('https://t.me/joshgtz', '_blank');
                // La alerta se cierra automáticamente al hacer clic
            });
        } else {
            // Si el usuario cancela (presiona "Volver al resumen"), simplemente regresar al modal
            // NO mostrar ningún recordatorio, solo volver al modal
            document.getElementById('modal-resumen').classList.add('active');
            
            // Opcionalmente, puedes mostrar una notificación breve si lo deseas
            mostrarNotificacion(
                'Volviendo al resumen',
                'Puedes descargar la orden o continuar con PayPal',
                'info',
                2000
            );
        }
    });
}

// Inicializar la página
function inicializarPagina() {
    // Actualizar nombre de la tienda
    actualizarNombreTienda();
    
    cargarCategorias();
    renderizar(productos);
    actualizarUI();
    
    // Inicializar contador de wishlist
    actualizarContadorWishlist();
    
    // Mostrar banner de oferta después de cargar
    mostrarBannerOferta();
    
    // Procesar el hash de la URL si existe
    procesarHashURL();
    
    // Verificar si PayPal SDK está cargado
    setTimeout(() => {
        if (typeof paypal === 'undefined') {
            console.warn('PayPal SDK no se cargó correctamente');
            mostrarNotificacion(
                'PayPal no disponible',
                'El sistema de pagos puede no funcionar correctamente',
                'advertencia',
                5000
            );
        }
    }, 2000);
}

// Escuchar cambios en el hash de la URL
window.addEventListener('hashchange', procesarHashURL);

// Inicializar la página cuando se carga el DOM
document.addEventListener('DOMContentLoaded', inicializarPagina);